using System;
using System.Collections.Generic;
using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using PortalGovi.Models;
using Sap.Data.Hana;
using System.Text.Json;

namespace PortalGovi.Services
{
    /// <summary>
    /// Servicio para manejar las operaciones de cotizaciones
    /// </summary>
    public class CotizacionService : ICotizacionService
    {
        private readonly string _connectionString;
        private readonly JsonSerializerSettings _jsonSettings;
        private readonly IConfiguration _configuration;
        private readonly ISapServiceLayerQuotationService _sapServiceLayerQuotation;

        public CotizacionService(IConfiguration configuration, ISapServiceLayerQuotationService sapServiceLayerQuotation)
        {
            _configuration = configuration;
            _sapServiceLayerQuotation = sapServiceLayerQuotation;
            _connectionString = configuration.GetConnectionString("HanaConnection");
            _jsonSettings = new JsonSerializerSettings
            {
                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };
        }

        /// <summary>
        /// Crear una nueva cotización completa
        /// </summary>
        public async Task<int> CrearCotizacionAsync(CotizacionCompleta cotizacion, string jsonContent)
        {
            if (string.IsNullOrWhiteSpace(_connectionString))
            {
                throw new InvalidOperationException(
                    "ConnectionStrings:HanaConnection no está definida. Configure appsettings.json o variables de entorno para SAP HANA.");
            }

            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // 1. Insertar encabezado (obtiene el ID inicial generado por la base de datos)
                        var idCotizacion = await InsertarEncabezadoAsync(connection, transaction, cotizacion.Encabezado, jsonContent);

                        // 2. Generar el folio inicial con el sufijo -A (Revisión inicial)
                        var folioA = string.Concat(idCotizacion, "-A");

                        // 3. Sincronizar el folio dentro del JSON para que coincida con el folio portal real
                        try
                        {
                            var jo = Newtonsoft.Json.Linq.JObject.Parse(jsonContent);
                            var enc = jo["encabezado"] ?? jo["Encabezado"];
                            if (enc != null)
                            {
                                enc["folioPortal"] = folioA;
                                jsonContent = jo.ToString(Formatting.None);
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error sincronizando folio en JSON durante creación: {ex.Message}");
                        }

                        // 4. Actualizar el encabezado recién creado con su folio real y el JSON actualizado
                        var updateSql = @"
                            UPDATE MIKNE.COTIZACION_ENCABEZADO 
                            SET FOLIO_PORTAL = ?, JSON_CONTENT = ? 
                            WHERE ID = ?";

                        using (var cmdUpdate = new HanaCommand(updateSql, connection, transaction))
                        {
                            cmdUpdate.Parameters.Add(new HanaParameter { Value = folioA });
                            cmdUpdate.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)jsonContent ?? DBNull.Value });
                            cmdUpdate.Parameters.Add(new HanaParameter { Value = idCotizacion });
                            await cmdUpdate.ExecuteNonQueryAsync();
                        }

                        // 5. Insertar la versión inicial en COTIZACION_HISTORY
                        // Esto asegura que la primera versión exista en el historial y que futuras actualizaciones sigan la secuencia B, C...
                        var historySql = @"
                            INSERT INTO MIKNE.COTIZACION_HISTORY (IDCOTIZACION, JSON_CONTENT, FOLIO_PORTAL, USUARIO) 
                            VALUES (?, ?, ?, ?)";

                        using (var cmdHistory = new HanaCommand(historySql, connection, transaction))
                        {
                            cmdHistory.Parameters.Add(new HanaParameter { Value = idCotizacion });
                            cmdHistory.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)jsonContent ?? DBNull.Value });
                            cmdHistory.Parameters.Add(new HanaParameter { Value = folioA });
                            cmdHistory.Parameters.Add(new HanaParameter { Value = (object)cotizacion.Encabezado.Usuario ?? DBNull.Value });
                            await cmdHistory.ExecuteNonQueryAsync();
                        }

                        transaction.Commit();
                        return idCotizacion;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error en CrearCotizacionAsync: {ex.Message}");
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        /// <summary>
        /// Obtener una cotización completa por ID
        /// </summary>
        public async Task<string> ObtenerCotizacionAsync(int id)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();

                var cotizacion = await ObtenerCotizacionCompletaAsync(connection, id);
                return cotizacion;
            }
        }

        /// <summary>
        /// Obtener todas las cotizaciones
        /// </summary>
        public async Task<List<CotizacionEncabezado>> ObtenerCotizacionesAsync()
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();

                var sql = @"
                    SELECT ID, JSON_CONTENT, FOLIO_PORTAL, ESTADO, ARCHIVO_COSTOS, FOLIO_SAP, FOLIOSAP_STR,
                           TIPO_COTIZACION, TIPO_CUENTA, IDIOMA_COTIZACION, CLIENTE, CONTACTO,
                           DIR_FISCAL, DIR_ENTREGA, REFERENCIA, TERMINOS_ENTREGA, FECHA, VENCIMIENTO, MONEDA, USUARIO, TIEMPO_ENTREGA
                    FROM MIKNE.COTIZACION_ENCABEZADO
                    ORDER BY ID DESC";

                var result = await connection.QueryAsync<dynamic>(sql);
                var list = new List<CotizacionEncabezado>();

                foreach (var x in result)
                {
                    try
                    {
                        string json = x.JSON_CONTENT;
                        if (string.IsNullOrEmpty(json))
                        {
                            list.Add(BuildCotizacionEncabezadoFromSqlRow(x));
                            continue;
                        }

                        var jo = Newtonsoft.Json.Linq.JObject.Parse(json);
                        var enc = jo["encabezado"] ?? jo["Encabezado"];
                        if (enc == null || enc.Type == Newtonsoft.Json.Linq.JTokenType.Null || !enc.HasValues)
                        {
                            list.Add(BuildCotizacionEncabezadoFromSqlRow(x));
                            continue;
                        }
                        if (enc.Type != Newtonsoft.Json.Linq.JTokenType.Object)
                        {
                            list.Add(BuildCotizacionEncabezadoFromSqlRow(x));
                            continue;
                        }

                        var data = MapCotizacionEncabezadoFromJsonTokens(x, jo, enc);
                        list.Add(data);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al procesar cotización {x.ID}: {ex.Message}");
                        try
                        {
                            list.Add(BuildCotizacionEncabezadoFromSqlRow(x));
                        }
                        catch (Exception ex2)
                        {
                            Console.WriteLine($"Error en fallback SQL para cotización {x.ID}: {ex2.Message}");
                        }
                    }
                }
                return list;
            }
        }

        /// <summary>
        /// Actualizar una cotización existente
        /// </summary>
        public async Task<ActualizarCotizacionResult> ActualizarCotizacionAsync(int id, CotizacionCompleta cotizacion, string jsonContent)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var updated = await ActualizarEncabezadoAsync(connection, transaction, id, cotizacion, jsonContent);
                        if (!updated)
                        {
                            transaction.Rollback();
                            return new ActualizarCotizacionResult { GuardadoEnMikne = false };
                        }

                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error en ActualizarCotizacionAsync: {ex.Message}");
                        transaction.Rollback();
                        throw;
                    }
                }
            }

            var sap = await SincronizarQuotationWithSapInternalAsync(id, cotizacion?.Encabezado?.Usuario);
            return new ActualizarCotizacionResult
            {
                GuardadoEnMikne = true,
                SapError = sap.Error,
                FolioSap = string.IsNullOrEmpty(sap.Error) ? sap.FolioSapDisplay : null,
                SapDocEntry = string.IsNullOrEmpty(sap.Error) ? sap.DocEntry : (int?)null
            };
        }

        /// <summary>
        /// Eliminar una cotización
        /// </summary>
        public async Task<bool> EliminarCotizacionAsync(int id)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Eliminar productos y bahías primero (por las FK)
                        await EliminarProductosAsync(connection, id);
                        await EliminarBahiasAsync(connection, id);

                        // Eliminar encabezado
                        var sql = "DELETE FROM MIKNE.COTIZACION_ENCABEZADO WHERE ID = ?";
                        var affected = await connection.ExecuteAsync(sql, new { Id = id });

                        transaction.Commit();
                        return affected > 0;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }


        /// <summary>
        /// Obtener una cotización completa por Folio Portal de la tabla HISTORY
        /// </summary>
        public async Task<string> ObtenerCotizacionPorFolioAsync(string folio)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();

                var sql = @"
                    SELECT JSON_CONTENT
                    FROM MIKNE.COTIZACION_HISTORY
                    WHERE FOLIO_PORTAL = ?";

                string json = await connection.QueryFirstOrDefaultAsync<string>(sql, new { Folio = folio });
                
                // Si no está en history, buscamos en encabezado (por si no ha sido editada)
                if (string.IsNullOrEmpty(json))
                {
                    sql = @"
                        SELECT JSON_CONTENT
                        FROM MIKNE.COTIZACION_ENCABEZADO
                        WHERE FOLIO_PORTAL = ?";
                    json = await connection.QueryFirstOrDefaultAsync<string>(sql, new { Folio = folio });
                }

                // Fallback: Si no se encuentra por folio y el folio es numérico, intentamos por ID
                if (string.IsNullOrEmpty(json) && int.TryParse(folio, out int id))
                {
                    sql = @"
                        SELECT JSON_CONTENT
                        FROM MIKNE.COTIZACION_ENCABEZADO
                        WHERE ID = ?";
                    json = await connection.QueryFirstOrDefaultAsync<string>(sql, new { Id = id });
                }

                return json;
            }
        }

        public async Task<string> EnviarASapAsync(int id, string userName = null)
        {
            var sap = await SincronizarQuotationWithSapInternalAsync(id, userName);
            if (!string.IsNullOrEmpty(sap.Error))
                throw new Exception(sap.Error);
            return sap.FolioSapDisplay;
        }

        /// <summary>POST pedido en SAP Service Layer (<c>Orders</c>); mismo payload que cotización.</summary>
        public async Task<string> CrearPedidoEnSapAsync(int id, string userName = null)
        {
            var p = await BuildSapQuotationPayloadAsync(id, userName);
            if (!string.IsNullOrEmpty(p.Error))
                throw new Exception(p.Error);

            SapServiceLayerQuotationResult sl;
            try
            {
                sl = await _sapServiceLayerQuotation.CreateOrderAsync(p.SapQuo);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear pedido en SAP: " + ex.Message, ex);
            }

            var docNum = sl.DocNum;
            if (string.IsNullOrEmpty(docNum))
            {
                if (sl.DocEntry > 0)
                    docNum = sl.DocEntry.ToString(CultureInfo.InvariantCulture);
                else
                    throw new Exception("SAP no devolvió DocNum ni DocEntry del pedido.");
            }

            if (!string.IsNullOrEmpty(p.SerieSapName))
                docNum = $"{p.SerieSapName}-{docNum}";

            return docNum;
        }

        private sealed class SapQuotationPayloadBuild
        {
            public string Error { get; set; }
            public string Json { get; set; }
            public CotizacionEncabezado Enc { get; set; }
            public SapQuotation SapQuo { get; set; }
            public string SerieSapName { get; set; }
        }

        /// <summary>Misma preparación de cuerpo que cotización y pedido en Service Layer.</summary>
        private async Task<SapQuotationPayloadBuild> BuildSapQuotationPayloadAsync(int id, string userName)
        {
            var result = new SapQuotationPayloadBuild();
            var json = await ObtenerCotizacionAsync(id);
            if (string.IsNullOrEmpty(json))
            {
                result.Error = "No se encontró la cotización.";
                return result;
            }

            JObject jo;
            try
            {
                jo = JObject.Parse(json);
            }
            catch (Exception ex)
            {
                result.Error = "JSON_CONTENT inválido al preparar envío a SAP: " + ex.Message;
                return result;
            }

            var encTok = jo["encabezado"] ?? jo["Encabezado"];
            if (encTok == null || encTok.Type == JTokenType.Null)
            {
                result.Error = "El JSON guardado no contiene encabezado.";
                return result;
            }

            CotizacionEncabezado enc;
            try
            {
                enc = encTok.ToObject<CotizacionEncabezado>(Newtonsoft.Json.JsonSerializer.Create(_jsonSettings));
            }
            catch (Exception ex)
            {
                result.Error = "No se pudo leer el encabezado para SAP: " + ex.Message;
                return result;
            }

            if (enc == null)
            {
                result.Error = "No se pudo leer el encabezado para SAP.";
                return result;
            }

            result.Json = json;
            result.Enc = enc;

            var monedaSap = MapCurrencyToSap(enc.Moneda);
            var docLines = BuildSapQuotationLinesFromJson(jo, monedaSap);
            if (docLines.Count == 0)
            {
                var cotizacionData = JsonConvert.DeserializeObject<CotizacionCompleta>(json, _jsonSettings);
                if (cotizacionData?.Productos != null)
                {
                    foreach (var prod in cotizacionData.Productos)
                    {
                        if (string.IsNullOrWhiteSpace(prod?.ItemCode)) continue;
                        docLines.Add(new SapQuotationLine
                        {
                            ItemCode = prod.ItemCode.Trim(),
                            ItemDescription = prod.ItemName ?? prod.ItemCode,
                            Quantity = (double)(prod.Qty > 0 ? prod.Qty : 1),
                            Price = (double?)prod.Price,
                            Currency = monedaSap
                        });
                    }
                }
            }

            if (docLines.Count == 0)
            {
                result.Error = "No hay líneas de artículo (grúas) para SAP. Revise productos en JSON_CONTENT.";
                return result;
            }

            int? seriesSap = null;
            var serieSapName = "";
            if (!string.IsNullOrEmpty(userName))
            {
                using (var connection = new HanaConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    var sqlSeries = @"SELECT ""NUMSERIESAP"", ""SERIESAP"" FROM ""MIKNE"".""USUARIOS"" WHERE ""USERNAME"" = ?";
                    var userRow = await connection.QueryFirstOrDefaultAsync(sqlSeries, new { UserName = userName });
                    if (userRow != null)
                    {
                        var numSerieSap = Convert.ToString(userRow.NUMSERIESAP);
                        serieSapName = Convert.ToString(userRow.SERIESAP);
                        if (!string.IsNullOrEmpty(numSerieSap))
                        {
                            if (int.TryParse(numSerieSap, out int parsedSerie))
                                seriesSap = parsedSerie > 0 ? parsedSerie : (int?)null;
                        }
                    }
                }
            }

            var docDue = ParseEncabezadoFecha(enc.Vencimiento) ?? DateTime.UtcNow.Date.AddDays(30);
            var salesPerson = enc.Vendedor != null && enc.Vendedor.SlpCode > 0
                ? (int?)enc.Vendedor.SlpCode
                : null;

            var sapQuo = new SapQuotation
            {
                CardCode = enc.Cliente?.Trim(),
                Series = seriesSap,
                U_BXP_PORTAL = string.IsNullOrWhiteSpace(enc.FolioPortal) ? null : enc.FolioPortal.Trim(),
                DocDueDate = docDue,
                SalesPersonCode = salesPerson,
                Address = string.IsNullOrWhiteSpace(enc.DireccionFiscal) ? null : enc.DireccionFiscal.Trim(),
                Address2 = string.IsNullOrWhiteSpace(enc.DireccionEntrega) ? null : enc.DireccionEntrega.Trim()
            };

            foreach (var line in docLines)
                sapQuo.DocumentLines.Add(line);

            result.SapQuo = sapQuo;
            result.SerieSapName = serieSapName;
            return result;
        }

        /// <summary>
        /// POST si no hay documento en SAP; PATCH si hay sapDocEntry o se resuelve por DocNum del folio.
        /// </summary>
        private async Task<SapSyncOutcome> SincronizarQuotationWithSapInternalAsync(int id, string userName)
        {
            var p = await BuildSapQuotationPayloadAsync(id, userName);
            if (!string.IsNullOrEmpty(p.Error))
                return new SapSyncOutcome { Error = p.Error };

            var enc = p.Enc;
            var sapQuo = p.SapQuo;
            var json = p.Json;

            int? docEntry = enc.SapDocEntry;
            if (!docEntry.HasValue && TryParseDocNumFromFolioDisplay(enc.FolioSap, out var docNumFilter))
            {
                try
                {
                    docEntry = await _sapServiceLayerQuotation.FindDocEntryByDocNumAsync(docNumFilter);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[SAP] No se pudo resolver DocEntry por DocNum {docNumFilter}: {ex.Message}");
                }
            }

            try
            {
                SapServiceLayerQuotationResult sl;
                if (docEntry.HasValue && docEntry.Value > 0)
                    sl = await _sapServiceLayerQuotation.PatchQuotationAsync(docEntry.Value, CloneSapQuotationForPatch(sapQuo));
                else
                    sl = await _sapServiceLayerQuotation.CreateQuotationAsync(sapQuo);

                var docNum = sl.DocNum;
                if (string.IsNullOrEmpty(docNum))
                {
                    if (TryParseDocNumFromFolioDisplay(enc.FolioSap, out var parsedDn))
                        docNum = parsedDn.ToString(CultureInfo.InvariantCulture);
                    else if (sl.DocEntry > 0)
                        docNum = sl.DocEntry.ToString(CultureInfo.InvariantCulture);
                    else
                        throw new Exception("SAP no devolvió DocNum tras PATCH y no hay folio previo para mostrar.");
                }

                if (!string.IsNullOrEmpty(p.SerieSapName))
                    docNum = $"{p.SerieSapName}-{docNum}";

                await ActualizarFolioSapAsync(id, docNum, json, sl.DocEntry);
                return new SapSyncOutcome { FolioSapDisplay = docNum, DocEntry = sl.DocEntry };
            }
            catch (Exception ex)
            {
                return new SapSyncOutcome { Error = ex.Message };
            }
        }

        private sealed class SapSyncOutcome
        {
            public string Error { get; set; }
            public string FolioSapDisplay { get; set; }
            public int? DocEntry { get; set; }
        }

        private static SapQuotation CloneSapQuotationForPatch(SapQuotation src)
        {
            var o = new SapQuotation
            {
                CardCode = src.CardCode,
                Series = null,
                U_BXP_PORTAL = src.U_BXP_PORTAL,
                DocDueDate = src.DocDueDate,
                SalesPersonCode = src.SalesPersonCode,
                Address = src.Address,
                Address2 = src.Address2
            };
            foreach (var line in src.DocumentLines)
                o.DocumentLines.Add(line);
            return o;
        }

        /// <summary>Extrae DocNum del folio mostrado (p. ej. "CO-12" → 12, "12" → 12).</summary>
        private static bool TryParseDocNumFromFolioDisplay(string folioSap, out int docNum)
        {
            docNum = 0;
            if (string.IsNullOrWhiteSpace(folioSap))
                return false;
            var t = folioSap.Trim();
            if (int.TryParse(t, NumberStyles.Integer, CultureInfo.InvariantCulture, out docNum))
                return true;
            var idx = t.LastIndexOf('-');
            if (idx >= 0 && idx < t.Length - 1)
            {
                var tail = t.Substring(idx + 1).Trim();
                return int.TryParse(tail, NumberStyles.Integer, CultureInfo.InvariantCulture, out docNum);
            }

            return false;
        }

        private static DateTime? ParseEncabezadoFecha(string vencimiento)
        {
            if (string.IsNullOrWhiteSpace(vencimiento))
                return null;
            if (DateTime.TryParse(vencimiento, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dt))
                return dt;
            if (DateTime.TryParse(vencimiento, CultureInfo.CurrentCulture, DateTimeStyles.None, out dt))
                return dt;
            return null;
        }

        private async Task ActualizarFolioSapAsync(int id, string docNum, string jsonOriginal, int? sapDocEntry = null)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                string nuevoJson = jsonOriginal;
                try
                {
                    var jo = Newtonsoft.Json.Linq.JObject.Parse(jsonOriginal);
                    var enc = jo["encabezado"] ?? jo["Encabezado"];
                    if (enc != null)
                    {
                        enc["folioSap"] = docNum;
                        if (sapDocEntry.HasValue)
                            enc["sapDocEntry"] = sapDocEntry.Value;
                        nuevoJson = jo.ToString(Formatting.None);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error actualizando JSON con DocNum SAP: {ex.Message}");
                }

                var sql = "UPDATE MIKNE.COTIZACION_ENCABEZADO SET FOLIOSAP_STR = ?, JSON_CONTENT = ? WHERE ID = ?";
                using (var cmd = new HanaCommand(sql, connection))
                {
                    cmd.Parameters.Add(new HanaParameter { Value = docNum });
                    cmd.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)nuevoJson ?? DBNull.Value });
                    cmd.Parameters.Add(new HanaParameter { Value = id });
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        #region Métodos privados

        /// <summary>FOLIO_PORTAL vacío → NULL (evita '' en columnas numéricas o tipos estrictos).</summary>
        private static object HanaParamFolioPortal(string folioPortal)
        {
            if (string.IsNullOrWhiteSpace(folioPortal))
                return DBNull.Value;
            return folioPortal.Trim();
        }

        /// <summary>FOLIO_SAP es INTEGER: NULL si vacío o no numérico (evita HANA -10427 con '').</summary>
        private static object HanaParamNullableInt(string s)
        {
            if (string.IsNullOrWhiteSpace(s))
                return DBNull.Value;
            return int.TryParse(s.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var n)
                ? (object)n
                : DBNull.Value;
        }

        private async Task<int> InsertarEncabezadoAsync(HanaConnection connection, HanaTransaction transaction, CotizacionEncabezado encabezado, string jsonContent)
        {
            var sql = @"
                INSERT INTO MIKNE.COTIZACION_ENCABEZADO
                (TIPO_COTIZACION, TIPO_CUENTA, IDIOMA_COTIZACION, CLIENTE, CONTACTO, 
                 DIR_FISCAL, DIR_ENTREGA, REFERENCIA, TERMINOS_ENTREGA, FOLIO_PORTAL, 
                 FOLIO_SAP, FECHA, VENCIMIENTO, MONEDA, JSON_CONTENT, USUARIO, ESTADO, ARCHIVO_COSTOS, TIEMPO_ENTREGA)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            using (var cmd = new HanaCommand(sql, connection, transaction))
            {
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.TipoCotizacion ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.TipoCuenta ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.Idioma ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.Cliente ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.PersonaContacto ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.DireccionFiscal ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.DireccionEntrega ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.Referencia ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.TerminosEntrega ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = HanaParamFolioPortal(encabezado.FolioPortal) });
                // FOLIO_SAP es INTEGER en MIKNE: cadenas vacías ('') provocan HANA -10427 (invalid number string).
                cmd.Parameters.Add(new HanaParameter { Value = HanaParamNullableInt(encabezado.FolioSap) });
                cmd.Parameters.Add(new HanaParameter { Value = DateTime.UtcNow });
                cmd.Parameters.Add(new HanaParameter { Value = DateTime.UtcNow.AddDays(30) });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.Moneda ?? DBNull.Value });
                
                var jsonParam = new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)jsonContent ?? DBNull.Value };
                cmd.Parameters.Add(jsonParam);
                
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.Usuario ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = string.IsNullOrEmpty(encabezado.Estado) ? "Abierto" : encabezado.Estado });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.ArchivoCostos ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.TiempoEntrega ?? DBNull.Value });

                await cmd.ExecuteNonQueryAsync();
            }

            // Obtener el ID generado
            var idSql = "SELECT CURRENT_IDENTITY_VALUE() FROM DUMMY";
            using (var idCmd = new HanaCommand(idSql, connection, transaction))
            {
                var result = await idCmd.ExecuteScalarAsync();
                return Convert.ToInt32(result);
            }
        }

        private async Task<string> ObtenerCotizacionCompletaAsync(HanaConnection connection, int id)
        {
            var sql = @"
                SELECT JSON_CONTENT
                FROM MIKNE.COTIZACION_ENCABEZADO
                WHERE ID = ?";

            string json = await connection.QueryFirstOrDefaultAsync<string>(sql, new { Id = id });
            return json;
        }

        private string GetExcelColumnName(int columnNumber)
        {
            string columnName = "";
            while (columnNumber > 0)
            {
                int modulo = (columnNumber - 1) % 26;
                columnName = Convert.ToChar(65 + modulo) + columnName;
                columnNumber = (columnNumber - modulo) / 26;
            }
            return columnName;
        }

        private string GetNextFolioVersion(string currentFolio, int id)
        {
            // Extraer el sufijo de letra del folio actual (ej. "51-C" → "C")
            if (!string.IsNullOrEmpty(currentFolio))
            {
                var dashIdx = currentFolio.LastIndexOf('-');
                if (dashIdx >= 0 && dashIdx < currentFolio.Length - 1)
                {
                    var suffix = currentFolio.Substring(dashIdx + 1).ToUpper();
                    // Verificar que el sufijo solo tiene letras (no es un número después de guión)
                    bool isLetterSuffix = true;
                    foreach (char c in suffix)
                    {
                        if (!char.IsLetter(c)) { isLetterSuffix = false; break; }
                    }
                    
                    if (isLetterSuffix)
                    {
                        // Convertir la letra al número de columna Excel y sumar 1
                        int colNum = 0;
                        foreach (char c in suffix)
                        {
                            colNum = colNum * 26 + (c - 'A' + 1);
                        }
                        return string.Concat(id, "-", GetExcelColumnName(colNum + 1));
                    }
                }
            }
            // Fallback: folio sin letra (ej. "51") o sin folio.
            // El historial siempre tiene el folio real, usamos el MAX para no repetir.
            return null; // Señal para que el caller consulte el historial
        }

        private async Task<bool> ActualizarEncabezadoAsync(HanaConnection connection, HanaTransaction transaction, int id, CotizacionCompleta cotizacion, string jsonContent)
        {
            // Leer el folio actual del encabezado para derivar la siguiente versión correctamente.
            // Ejemplo: si el encabezado tiene "51-C", la siguiente será "51-D".
            var folioSql = "SELECT FOLIO_PORTAL FROM MIKNE.COTIZACION_ENCABEZADO WHERE ID = ?";
            string currentFolio = null;
            using (var cmdFolio = new HanaCommand(folioSql, connection, transaction))
            {
                cmdFolio.Parameters.Add(new HanaParameter { Value = id });
                var result = await cmdFolio.ExecuteScalarAsync();
                
                if (result == null || result == DBNull.Value)
                {
                    Console.WriteLine($"[ERROR 404] ActualizarEncabezadoAsync: La cotización con ID {id} no existe en MIKNE.COTIZACION_ENCABEZADO.");
                    return false; // Esto derivará en un NotFound(404) en el controlador.
                }

                currentFolio = result.ToString();
                Console.WriteLine($"[DEBUG] Actualización iniciada para ID {id}. Folio actual: {currentFolio}");
            }

            var param = GetNextFolioVersion(currentFolio, id);
            
            // Si GetNextFolioVersion devuelve null, el folio actual no tiene sufijo de letra válido.
            // Usamos el MAX del historial para que no haya colisiones.
            if (param == null)
            {
                var maxFolioSql = "SELECT MAX(FOLIO_PORTAL) FROM MIKNE.COTIZACION_HISTORY WHERE IDCOTIZACION = ?";
                string maxHistoryFolio = null;
                using (var cmdMax = new HanaCommand(maxFolioSql, connection, transaction))
                {
                    cmdMax.Parameters.Add(new HanaParameter { Value = id });
                    var result = await cmdMax.ExecuteScalarAsync();
                    maxHistoryFolio = result?.ToString();
                }
                
                if (!string.IsNullOrEmpty(maxHistoryFolio))
                {
                    // Incrementar desde el máximo del historial
                    param = GetNextFolioVersion(maxHistoryFolio, id);
                }
                
                // Último fallback: empezar en B si no hay historial
                if (param == null)
                {
                    param = string.Concat(id, "-B");
                }
            }


            try 
            {
                var jo = Newtonsoft.Json.Linq.JObject.Parse(jsonContent);
                var enc = jo["encabezado"] ?? jo["Encabezado"];
                if (enc != null)
                {
                    enc["folioPortal"] = param;
                    jsonContent = jo.ToString(Formatting.None);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sincronizando folio en JSON: {ex.Message}");
                // Si falla el parseo por alguna razón, seguimos con el jsonContent original
            }

            var insert = @"
                INSERT INTO MIKNE.COTIZACION_HISTORY (IDCOTIZACION, JSON_CONTENT, FOLIO_PORTAL, USUARIO) 
                VALUES (?, ?, ?, ?)";
            
            using (var cmdInsert = new HanaCommand(insert, connection, transaction))
            {
                cmdInsert.Parameters.Add(new HanaParameter { Value = id });
                cmdInsert.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)jsonContent ?? DBNull.Value });
                cmdInsert.Parameters.Add(new HanaParameter { Value = (object)param ?? DBNull.Value });
                cmdInsert.Parameters.Add(new HanaParameter { Value = (object)cotizacion.Encabezado.Usuario ?? DBNull.Value });
                await cmdInsert.ExecuteNonQueryAsync();
            }

            var encHdr = cotizacion.Encabezado;
            object fechaDb = DBNull.Value, vencDb = DBNull.Value;
            if (!string.IsNullOrWhiteSpace(encHdr.Fecha) && DateTime.TryParse(encHdr.Fecha, null, System.Globalization.DateTimeStyles.RoundtripKind, out var df))
                fechaDb = df;
            if (!string.IsNullOrWhiteSpace(encHdr.Vencimiento) && DateTime.TryParse(encHdr.Vencimiento, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dv))
                vencDb = dv;

            var sql = @"
                UPDATE MIKNE.COTIZACION_ENCABEZADO 
                SET JSON_CONTENT = ?, FOLIO_PORTAL = ?, USUARIO = ?, ESTADO = ?, ARCHIVO_COSTOS = ?, TIEMPO_ENTREGA = ?,
                    TIPO_COTIZACION = ?, TIPO_CUENTA = ?, IDIOMA_COTIZACION = ?, CLIENTE = ?, CONTACTO = ?,
                    DIR_FISCAL = ?, DIR_ENTREGA = ?, REFERENCIA = ?, TERMINOS_ENTREGA = ?, FECHA = ?, VENCIMIENTO = ?, MONEDA = ?
                WHERE ID = ?";

            using (var cmdUpdate = new HanaCommand(sql, connection, transaction))
            {
                cmdUpdate.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)jsonContent ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)param ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.Usuario ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = string.IsNullOrEmpty(encHdr.Estado) ? "Abierto" : encHdr.Estado });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.ArchivoCostos ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.TiempoEntrega ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.TipoCotizacion ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.TipoCuenta ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.Idioma ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.Cliente ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.PersonaContacto ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.DireccionFiscal ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.DireccionEntrega ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.Referencia ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.TerminosEntrega ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = fechaDb });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = vencDb });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = (object)encHdr.Moneda ?? DBNull.Value });
                cmdUpdate.Parameters.Add(new HanaParameter { Value = id });
                
                try 
                {
                    var affected = await cmdUpdate.ExecuteNonQueryAsync();
                    Console.WriteLine($"[DEBUG] Actualización completada para ID {id}. Filas afectadas: {affected}. Nuevo folio: {param}");
                    return affected > 0;
                }
                catch (HanaException hEx)
                {
                    Console.WriteLine($"[CRITICAL] Error de SAP HANA al actualizar ID {id}: {hEx.Message} - Código: {hEx.NativeError}");
                    throw;
                }
            }
        }

        private async Task EliminarProductosAsync(HanaConnection connection, int idCotizacion)
        {
            // Eliminar datos relacionados primero
            var sqlDatosBasicos = "DELETE FROM MIKNE.COTIZACION_PRODUCTOS_DATOS_BASICOS WHERE ID_COTIZACION_PRODUCTO IN (SELECT ID FROM MIKNE.COTIZACION_PRODUCTOS WHERE ID_COTIZACION = ?)";
            await connection.ExecuteAsync(sqlDatosBasicos, new { IdCotizacion = idCotizacion });

            var sqlAdicionales = "DELETE FROM MIKNE.COTIZACION_PRODUCTOS_ADICIONALES WHERE ID_COTIZACION_PRODUCTO IN (SELECT ID FROM MIKNE.COTIZACION_PRODUCTOS WHERE ID_COTIZACION = ?)";
            await connection.ExecuteAsync(sqlAdicionales, new { IdCotizacion = idCotizacion });

            var sqlIzaje = "DELETE FROM MIKNE.COTIZACION_PRODUCTOS_IZAJE WHERE ID_COTIZACION_PRODUCTO IN (SELECT ID FROM MIKNE.COTIZACION_PRODUCTOS WHERE ID_COTIZACION = ?)";
            await connection.ExecuteAsync(sqlIzaje, new { IdCotizacion = idCotizacion });

            // Eliminar productos
            var sqlProductos = "DELETE FROM MIKNE.COTIZACION_PRODUCTOS WHERE ID_COTIZACION = ?";
            await connection.ExecuteAsync(sqlProductos, new { IdCotizacion = idCotizacion });
        }

        private async Task EliminarBahiasAsync(HanaConnection connection, int idCotizacion)
        {
            // Eliminar datos relacionados primero
            var sqlAlimentacion = "DELETE FROM MIKNE.COTIZACION_BAHIAS_ALIMENTACION WHERE ID_COTIZACION_BAHIA IN (SELECT ID FROM MIKNE.COTIZACION_BAHIAS WHERE ID_COTIZACION = ?)";
            await connection.ExecuteAsync(sqlAlimentacion, new { IdCotizacion = idCotizacion });

            var sqlRiel = "DELETE FROM MIKNE.COTIZACION_BAHIAS_RIEL WHERE ID_COTIZACION_BAHIA IN (SELECT ID FROM MIKNE.COTIZACION_BAHIAS WHERE ID_COTIZACION = ?)";
            await connection.ExecuteAsync(sqlRiel, new { IdCotizacion = idCotizacion });

            var sqlEstructura = "DELETE FROM MIKNE.COTIZACION_BAHIAS_ESTRUCTURA WHERE ID_COTIZACION_BAHIA IN (SELECT ID FROM MIKNE.COTIZACION_BAHIAS WHERE ID_COTIZACION = ?)";
            await connection.ExecuteAsync(sqlEstructura, new { IdCotizacion = idCotizacion });

            // Eliminar bahías
            var sqlBahias = "DELETE FROM MIKNE.COTIZACION_BAHIAS WHERE ID_COTIZACION = ?";
            await connection.ExecuteAsync(sqlBahias, new { IdCotizacion = idCotizacion });
        }

        public async Task<bool> ActualizarEstadoAsync(int id, string nuevoEstado)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                // Actualizar en encabezado
                var sql = "UPDATE MIKNE.COTIZACION_ENCABEZADO SET ESTADO = ? WHERE ID = ?";
                var affected = await connection.ExecuteAsync(sql, new { Estado = nuevoEstado, Id = id });

                // Actualizar el JSON en el encabezado para que refleje el nuevo estado
                // Primero obtenemos el JSON actual
                var jsonSql = "SELECT JSON_CONTENT FROM MIKNE.COTIZACION_ENCABEZADO WHERE ID = ?";
                var json = await connection.QueryFirstOrDefaultAsync<string>(jsonSql, new { Id = id });

                if (!string.IsNullOrEmpty(json))
                {
                    try
                    {
                        var jo = Newtonsoft.Json.Linq.JObject.Parse(json);
                        var enc = jo["encabezado"] ?? jo["Encabezado"];
                        if (enc != null)
                        {
                            enc["estado"] = nuevoEstado;
                            var nuevoJson = jo.ToString(Formatting.None);
                            var updateJsonSql = "UPDATE MIKNE.COTIZACION_ENCABEZADO SET JSON_CONTENT = ? WHERE ID = ?";
                            using (var cmd = new HanaCommand(updateJsonSql, connection))
                            {
                                cmd.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)nuevoJson ?? DBNull.Value });
                                cmd.Parameters.Add(new HanaParameter { Value = id });
                                await cmd.ExecuteNonQueryAsync();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error actualizando JSON con nuevo estado: {ex.Message}");
                    }
                }

                return affected > 0;
            }
        }

        public async Task<bool> ActualizarArchivoCostosAsync(int id, string nombreArchivo)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                // Actualizar en encabezado
                var sql = "UPDATE MIKNE.COTIZACION_ENCABEZADO SET ARCHIVO_COSTOS = ? WHERE ID = ?";
                var affected = await connection.ExecuteAsync(sql, new { Archivo = nombreArchivo, Id = id });

                // Actualizar el JSON
                var jsonSql = "SELECT JSON_CONTENT FROM MIKNE.COTIZACION_ENCABEZADO WHERE ID = ?";
                var json = await connection.QueryFirstOrDefaultAsync<string>(jsonSql, new { Id = id });

                if (!string.IsNullOrEmpty(json))
                {
                    try
                    {
                        var jo = Newtonsoft.Json.Linq.JObject.Parse(json);
                        var enc = jo["encabezado"] ?? jo["Encabezado"];
                        if (enc != null)
                        {
                            enc["archivoCostos"] = nombreArchivo;
                            var nuevoJson = jo.ToString(Formatting.None);
                            var updateJsonSql = "UPDATE MIKNE.COTIZACION_ENCABEZADO SET JSON_CONTENT = ? WHERE ID = ?";
                            using (var cmd = new HanaCommand(updateJsonSql, connection))
                            {
                                cmd.Parameters.Add(new HanaParameter { HanaDbType = HanaDbType.NClob, Value = (object)nuevoJson ?? DBNull.Value });
                                cmd.Parameters.Add(new HanaParameter { Value = id });
                                await cmd.ExecuteNonQueryAsync();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error actualizando JSON con archivo: {ex.Message}");
                    }
                }

                return affected > 0;
            }
        }

        public async Task<List<CotizacionEncabezado>> ObtenerVersionesAsync(int id)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();

                var sql = @"
                    SELECT JSON_CONTENT, FOLIO_PORTAL, USUARIO
                    FROM MIKNE.COTIZACION_HISTORY
                    WHERE IDCOTIZACION = ?
                    ORDER BY FOLIO_PORTAL DESC";

                var result = await connection.QueryAsync<dynamic>(sql, new { Id = id });
                var list = new List<CotizacionEncabezado>();

                foreach (var x in result)
                {
                    try
                    {
                        string json = x.JSON_CONTENT;
                        if (string.IsNullOrEmpty(json)) continue;

                        var jo = Newtonsoft.Json.Linq.JObject.Parse(json);
                        var enc = jo["encabezado"] ?? jo["Encabezado"];

                        if (enc != null)
                        {
                            var data = new CotizacionEncabezado
                            {
                                Id = id, // Referencia al ID original
                                TipoCotizacion = (string)(enc["tipoCotizacion"] ?? enc["TipoCotizacion"]) ?? "",
                                TipoCuenta = (string)(enc["tipoCuenta"] ?? enc["TipoCuenta"]) ?? "",
                                Idioma = (string)(enc["idioma"] ?? enc["Idioma"]) ?? "",
                                Cliente = CotClienteCodigoFromEnc(enc),
                                ClienteNombre = CotClienteNombreFromEnc(enc),
                                PersonaContacto = (string)(enc["contacto"] ?? enc["Contacto"] ?? enc["personaContacto"] ?? enc["PersonaContacto"]) ?? "",
                                DireccionFiscal = (string)(enc["dirFiscal"] ?? enc["DirFiscal"] ?? enc["direccionFiscal"] ?? enc["DireccionFiscal"]) ?? "",
                                DireccionEntrega = (string)(enc["dirEntrega"] ?? enc["DirEntrega"] ?? enc["direccionEntrega"] ?? enc["DireccionEntrega"]) ?? "",
                                Referencia = (string)(enc["referencia"] ?? enc["Referencia"]) ?? "",
                                ClienteFinal = (string)(enc["clienteFinal"] ?? enc["ClienteFinal"]) ?? "",
                                UbicacionFinal = (string)(enc["ubicacionFinal"] ?? enc["UbicacionFinal"]) ?? "",
                                TerminosEntrega = (string)(enc["terminosEntrega"] ?? enc["TerminosEntrega"]) ?? "",
                                FolioPortal = x.FOLIO_PORTAL?.ToString() ?? (enc["folioPortal"] ?? enc["FolioPortal"])?.ToString(),
                                FolioSap = (enc["folioSAP"] ?? enc["folioSap"] ?? enc["FolioSAP"] ?? enc["FolioSap"])?.ToString() ?? "",
                                Fecha = (string)(enc["fecha"] ?? enc["Fecha"]) ?? "",
                                Vencimiento = (string)(enc["vencimiento"] ?? enc["Vencimiento"]) ?? "",
                                Moneda = (string)(enc["moneda"] ?? enc["Moneda"]) ?? "",
                                Usuario = x.USUARIO?.ToString() ?? (enc["usuario"] ?? enc["Usuario"])?.ToString() ?? "",
                                Estado = (enc["estado"] ?? enc["Estado"])?.ToString() ?? "Abierto",
                                ArchivoCostos = (enc["archivoCostos"] ?? enc["ArchivoCostos"])?.ToString() ?? "",
                                TiempoEntrega = (string)(enc["tiempoEntrega"] ?? enc["TiempoEntrega"]) ?? ""
                            };

                            var conceptosVersRoot = jo["conceptos"] ?? jo["Conceptos"];
                            decimal totalCotizacionVers = CotSumConceptosArray(conceptosVersRoot);
                            if (totalCotizacionVers == 0)
                            {
                                var fpVers = jo["formacionPrecios"] ?? jo["FormacionPrecios"];
                                if (fpVers != null && fpVers.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                                {
                                    var cNested = ((Newtonsoft.Json.Linq.JObject)fpVers)["conceptos"] ?? ((Newtonsoft.Json.Linq.JObject)fpVers)["Conceptos"];
                                    totalCotizacionVers = CotSumConceptosArray(cNested);
                                }
                            }
                            if (totalCotizacionVers == 0)
                            {
                                var vTotalToken = enc["total"] ?? enc["Total"];
                                if (vTotalToken != null && (vTotalToken.Type == Newtonsoft.Json.Linq.JTokenType.Float || vTotalToken.Type == Newtonsoft.Json.Linq.JTokenType.Integer))
                                    totalCotizacionVers = (decimal)vTotalToken;
                            }
                            if (totalCotizacionVers == 0)
                            {
                                var fpGlobalVers = jo["formacionPreciosGlobal"] ?? jo["FormacionPreciosGlobal"];
                                if (fpGlobalVers != null && fpGlobalVers.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                                    totalCotizacionVers = CotSafeDecimal(((Newtonsoft.Json.Linq.JObject)fpGlobalVers)["precioFinal"] ?? ((Newtonsoft.Json.Linq.JObject)fpGlobalVers)["PrecioFinal"]);
                            }
                            if (totalCotizacionVers == 0)
                            {
                                var fpOutVers = jo["formacionPrecios"] ?? jo["FormacionPrecios"];
                                totalCotizacionVers = CotPrecioFinalFromFormacionPreciosOuter(fpOutVers);
                            }

                            data.Total = totalCotizacionVers;

                            // Manejar vendedor
                            var vVal = enc["vendedor"];
                            if (vVal != null && vVal.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                            {
                                if (vVal.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                                    data.Vendedor = new Vendedor { SlpCode = (int?)vVal["slpCode"] ?? (int?)vVal["id"] ?? 0, SlpName = (string)vVal["slpName"] };
                                else if (vVal.Type == Newtonsoft.Json.Linq.JTokenType.Integer)
                                    data.Vendedor = new Vendedor { SlpCode = (int)vVal };
                            }

                            var vsVal = enc["vendedorSec"];
                            if (vsVal != null && vsVal.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                            {
                                if (vsVal.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                                    data.VendedorSec = new Vendedor { SlpCode = (int?)vsVal["slpCode"] ?? (int?)vsVal["id"] ?? 0, SlpName = (string)vsVal["slpName"] };
                                else if (vsVal.Type == Newtonsoft.Json.Linq.JTokenType.Integer)
                                    data.VendedorSec = new Vendedor { SlpCode = (int)vsVal };
                            }

                            list.Add(data);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al procesar versión de cotización {id}: {ex.Message}");
                    }
                }
                return list;
            }
        }

        #endregion

        /// <summary>
        /// Fila de lista desde columnas desnormalizadas (nunca omitir cotizaciones en la UI).
        /// </summary>
        private static CotizacionEncabezado BuildCotizacionEncabezadoFromSqlRow(dynamic x)
        {
            int id = Convert.ToInt32(x.ID);
            string FmtDate(object o)
            {
                if (o == null || o is DBNull) return "";
                if (o is DateTime dt) return dt.ToString("yyyy-MM-dd");
                return o.ToString();
            }
            return new CotizacionEncabezado
            {
                Id = id,
                TipoCotizacion = x.TIPO_COTIZACION?.ToString() ?? "",
                TipoCuenta = x.TIPO_CUENTA?.ToString() ?? "",
                Idioma = x.IDIOMA_COTIZACION?.ToString() ?? "",
                Cliente = x.CLIENTE?.ToString() ?? "",
                // La tabla Vue usa key "clienteNombre"; en BD suele existir solo CLIENTE (código o "código - nombre")
                ClienteNombre = x.CLIENTE?.ToString() ?? "",
                PersonaContacto = x.CONTACTO?.ToString() ?? "",
                DireccionFiscal = x.DIR_FISCAL?.ToString() ?? "",
                DireccionEntrega = x.DIR_ENTREGA?.ToString() ?? "",
                Referencia = x.REFERENCIA?.ToString() ?? "",
                ClienteFinal = "",
                UbicacionFinal = "",
                TerminosEntrega = x.TERMINOS_ENTREGA?.ToString() ?? "",
                FolioPortal = x.FOLIO_PORTAL?.ToString() ?? id.ToString(),
                FolioSap = x.FOLIOSAP_STR?.ToString() ?? x.FOLIO_SAP?.ToString() ?? "",
                Fecha = FmtDate(x.FECHA),
                Vencimiento = FmtDate(x.VENCIMIENTO),
                Moneda = x.MONEDA?.ToString() ?? "",
                Usuario = x.USUARIO?.ToString() ?? "",
                Estado = x.ESTADO?.ToString() ?? "Abierto",
                ArchivoCostos = x.ARCHIVO_COSTOS?.ToString() ?? "",
                TiempoEntrega = x.TIEMPO_ENTREGA?.ToString() ?? "",
                Total = 0
            };
        }

        private static string CotJString(Newtonsoft.Json.Linq.JToken parent, params string[] names)
        {
            if (parent == null || parent.Type == Newtonsoft.Json.Linq.JTokenType.Null) return "";
            if (parent.Type != Newtonsoft.Json.Linq.JTokenType.Object) return "";
            var obj = (Newtonsoft.Json.Linq.JObject)parent;
            var t = CotFindPropertyValueIgnoreCase(obj, names);
            if (t != null && t.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                return CotScalarDisplayString(t);
            foreach (var n in names)
            {
                var t2 = obj[n];
                if (t2 == null || t2.Type == Newtonsoft.Json.Linq.JTokenType.Null) continue;
                return CotScalarDisplayString(t2);
            }
            return "";
        }

        /// <summary>
        /// Busca una propiedad en el objeto JSON sin distinguir mayúsculas (p. ej. clienteNombre vs ClienteNombre).
        /// </summary>
        private static Newtonsoft.Json.Linq.JToken CotFindPropertyValueIgnoreCase(Newtonsoft.Json.Linq.JObject obj, params string[] candidateNames)
        {
            if (obj == null || candidateNames == null || candidateNames.Length == 0) return null;
            var wanted = new System.Collections.Generic.HashSet<string>(candidateNames, StringComparer.OrdinalIgnoreCase);
            foreach (var p in obj.Properties())
            {
                if (wanted.Contains(p.Name))
                    return p.Value;
            }
            return null;
        }

        /// <summary>
        /// Convierte un JToken a texto para mostrar en listas (string, número, fecha; evita JSON crudo de objetos).
        /// </summary>
        private static string CotScalarDisplayString(Newtonsoft.Json.Linq.JToken t)
        {
            if (t == null || t.Type == Newtonsoft.Json.Linq.JTokenType.Null) return "";
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.String) return t.ToObject<string>() ?? "";
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.Date) return t.ToObject<DateTime>().ToString("yyyy-MM-dd");
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.Integer || t.Type == Newtonsoft.Json.Linq.JTokenType.Float)
                return t.ToString();
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.Boolean) return t.ToObject<bool>() ? "true" : "false";
            return "";
        }

        /// <summary>
        /// Texto escalar desde un JToken (para campos dentro de objetos anidados).
        /// </summary>
        private static string CotScalarString(Newtonsoft.Json.Linq.JToken t)
        {
            return CotScalarDisplayString(t);
        }

        /// <summary>
        /// Código de cliente (CardCode) aunque en JSON venga como string o como objeto SAP.
        /// </summary>
        private static string CotClienteCodigoFromEnc(Newtonsoft.Json.Linq.JToken enc)
        {
            if (enc == null || enc.Type != Newtonsoft.Json.Linq.JTokenType.Object)
                return "";
            var tok = enc["cliente"] ?? enc["Cliente"];
            if (tok != null && tok.Type == Newtonsoft.Json.Linq.JTokenType.Object)
            {
                var code = CotScalarString(tok["cardCode"] ?? tok["CardCode"]);
                if (!string.IsNullOrEmpty(code)) return code;
            }
            return CotJString(enc, "cliente", "Cliente");
        }

        /// <summary>
        /// Nombre para listados: primero encabezado.clienteNombre (cualquier casing), luego objeto cliente.
        /// </summary>
        private static string CotClienteNombreFromEnc(Newtonsoft.Json.Linq.JToken enc)
        {
            if (enc == null || enc.Type != Newtonsoft.Json.Linq.JTokenType.Object)
                return "";

            var nombreTok = CotFindPropertyValueIgnoreCase((Newtonsoft.Json.Linq.JObject)enc,
                "clienteNombre", "ClienteNombre", "cliente_nombre");
            var nombreDirecto = CotScalarDisplayString(nombreTok);
            if (!string.IsNullOrWhiteSpace(nombreDirecto)) return nombreDirecto.Trim();

            var nom = CotJString(enc, "clienteNombre", "ClienteNombre");
            if (!string.IsNullOrWhiteSpace(nom)) return nom.Trim();

            var tok = enc["cliente"] ?? enc["Cliente"];
            if (tok == null || tok.Type == Newtonsoft.Json.Linq.JTokenType.Null)
                return "";

            if (tok.Type == Newtonsoft.Json.Linq.JTokenType.Object)
            {
                var nc = CotScalarString(tok["nombreCompleto"] ?? tok["NombreCompleto"]);
                if (!string.IsNullOrWhiteSpace(nc)) return nc;

                var cardName = CotScalarString(tok["cardName"] ?? tok["CardName"]);
                var code = CotScalarString(tok["cardCode"] ?? tok["CardCode"]);
                if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(cardName))
                    return string.Concat(code, " - ", cardName);
                if (!string.IsNullOrEmpty(cardName)) return cardName;
                if (!string.IsNullOrEmpty(code)) return code;
                return "";
            }

            return CotScalarString(tok);
        }

        private static decimal CotSafeDecimal(Newtonsoft.Json.Linq.JToken t)
        {
            if (t == null || t.Type == Newtonsoft.Json.Linq.JTokenType.Null) return 0;
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.Integer || t.Type == Newtonsoft.Json.Linq.JTokenType.Float)
                return t.ToObject<decimal>();
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.String)
            {
                var s = t.ToObject<string>();
                if (string.IsNullOrWhiteSpace(s)) return 0;
                s = s.Trim();
                if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var dInv))
                    return dInv;
                // "340.000,50" (es-MX): quitar miles y usar coma decimal
                if (s.IndexOf(',') >= 0 && s.IndexOf('.') >= 0)
                {
                    var lastComma = s.LastIndexOf(',');
                    var lastDot = s.LastIndexOf('.');
                    if (lastComma > lastDot)
                        s = s.Replace(".", "").Replace(',', '.');
                    else
                        s = s.Replace(",", "");
                }
                else if (s.IndexOf(',') >= 0 && decimal.TryParse(s.Replace(".", "").Replace(',', '.'), NumberStyles.Any, CultureInfo.InvariantCulture, out var dEu))
                    return dEu;
                if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var d2))
                    return d2;
            }
            return 0;
        }

        /// <summary>
        /// El front guarda Pinia como formacionPrecios: { formacionPrecios: { precioFinal, ... }, conceptos: [...] }.
        /// precioFinal está en el objeto interior, no en el exterior.
        /// </summary>
        private static decimal CotPrecioFinalFromFormacionPreciosOuter(Newtonsoft.Json.Linq.JToken fpOuterToken)
        {
            if (fpOuterToken == null || fpOuterToken.Type != Newtonsoft.Json.Linq.JTokenType.Object)
                return 0;
            var fpOuter = (Newtonsoft.Json.Linq.JObject)fpOuterToken;
            var inner = fpOuter["formacionPrecios"] ?? fpOuter["FormacionPrecios"];
            if (inner != null && inner.Type == Newtonsoft.Json.Linq.JTokenType.Object)
            {
                var d = CotSafeDecimal(((Newtonsoft.Json.Linq.JObject)inner)["precioFinal"] ?? ((Newtonsoft.Json.Linq.JObject)inner)["PrecioFinal"]);
                if (d != 0) return d;
            }
            return CotSafeDecimal(fpOuter["precioFinal"] ?? fpOuter["PrecioFinal"]);
        }

        /// <summary>
        /// Importe de línea en "Productos y Opciones" (precioTotal, total, o cantidad × precio unitario).
        /// </summary>
        private static decimal CotConceptoLineAmount(Newtonsoft.Json.Linq.JObject concepto)
        {
            if (concepto == null) return 0;
            var pt = CotSafeDecimal(concepto["precioTotal"] ?? concepto["PrecioTotal"]);
            if (pt != 0) return pt;
            var t = CotSafeDecimal(concepto["total"] ?? concepto["Total"]);
            if (t != 0) return t;
            var qty = CotSafeDecimal(concepto["cantidad"] ?? concepto["Cantidad"]);
            if (qty == 0) qty = 1;
            var pu = CotSafeDecimal(concepto["precioUnitario"] ?? concepto["PrecioUnitario"] ?? concepto["precioUnit"] ?? concepto["PrecioUnit"]);
            return qty * pu;
        }

        private static decimal CotSumConceptosArray(Newtonsoft.Json.Linq.JToken arr)
        {
            if (arr == null || arr.Type != Newtonsoft.Json.Linq.JTokenType.Array) return 0;
            decimal sum = 0;
            foreach (var concepto in arr)
            {
                if (concepto == null || concepto.Type != Newtonsoft.Json.Linq.JTokenType.Object) continue;
                sum += CotConceptoLineAmount((Newtonsoft.Json.Linq.JObject)concepto);
            }
            return sum;
        }

        /// <summary>
        /// Evita InvalidCastException cuando el front envía slpCode como string u otros tipos.
        /// </summary>
        private static Vendedor CotMapVendedor(Newtonsoft.Json.Linq.JToken vVal)
        {
            if (vVal == null || vVal.Type == Newtonsoft.Json.Linq.JTokenType.Null) return null;
            if (vVal.Type == Newtonsoft.Json.Linq.JTokenType.Integer)
                return new Vendedor { SlpCode = vVal.ToObject<int>(), SlpName = null };
            if (vVal.Type == Newtonsoft.Json.Linq.JTokenType.String)
            {
                int code = 0;
                int.TryParse(vVal.ToObject<string>(), out code);
                return new Vendedor { SlpCode = code, SlpName = null };
            }
            if (vVal.Type == Newtonsoft.Json.Linq.JTokenType.Object)
            {
                var codeTok = vVal["slpCode"] ?? vVal["id"] ?? vVal["SlpCode"];
                int code = 0;
                if (codeTok != null && codeTok.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                {
                    if (codeTok.Type == Newtonsoft.Json.Linq.JTokenType.Integer) code = codeTok.ToObject<int>();
                    else int.TryParse(codeTok.ToString(), out code);
                }
                var nameTok = vVal["slpName"] ?? vVal["SlpName"];
                string name = null;
                if (nameTok != null && nameTok.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                    name = nameTok.Type == Newtonsoft.Json.Linq.JTokenType.String ? nameTok.ToObject<string>() : nameTok.ToString();
                return new Vendedor { SlpCode = code, SlpName = name };
            }
            return null;
        }

        private static CotizacionEncabezado MapCotizacionEncabezadoFromJsonTokens(dynamic x, Newtonsoft.Json.Linq.JObject jo, Newtonsoft.Json.Linq.JToken enc)
        {
            var estadoFila = x.ESTADO?.ToString() ?? CotJString(enc, "estado", "Estado");
            if (string.IsNullOrEmpty(estadoFila)) estadoFila = "Abierto";

            var data = new CotizacionEncabezado
            {
                Id = Convert.ToInt32(x.ID),
                TipoCotizacion = CotJString(enc, "tipoCotizacion", "TipoCotizacion"),
                TipoCuenta = CotJString(enc, "tipoCuenta", "TipoCuenta"),
                Idioma = CotJString(enc, "idioma", "Idioma"),
                Cliente = CotClienteCodigoFromEnc(enc),
                ClienteNombre = CotClienteNombreFromEnc(enc),
                PersonaContacto = CotJString(enc, "contacto", "Contacto", "personaContacto", "PersonaContacto"),
                DireccionFiscal = CotJString(enc, "dirFiscal", "DirFiscal", "direccionFiscal", "DireccionFiscal"),
                DireccionEntrega = CotJString(enc, "dirEntrega", "DirEntrega", "direccionEntrega", "DireccionEntrega"),
                Referencia = CotJString(enc, "referencia", "Referencia"),
                ClienteFinal = CotJString(enc, "clienteFinal", "ClienteFinal"),
                UbicacionFinal = CotJString(enc, "ubicacionFinal", "UbicacionFinal"),
                TerminosEntrega = CotJString(enc, "terminosEntrega", "TerminosEntrega"),
                FolioPortal = x.FOLIO_PORTAL?.ToString() ?? CotJString(enc, "folioPortal", "FolioPortal") ?? x.ID.ToString(),
                FolioSap = x.FOLIOSAP_STR?.ToString() ?? x.FOLIO_SAP?.ToString() ?? CotJString(enc, "folioSAP", "folioSap", "FolioSAP", "FolioSap"),
                Fecha = CotJString(enc, "fecha", "Fecha"),
                Vencimiento = CotJString(enc, "vencimiento", "Vencimiento"),
                Moneda = CotJString(enc, "moneda", "Moneda"),
                Usuario = CotJString(enc, "usuario", "Usuario"),
                Estado = estadoFila,
                ArchivoCostos = x.ARCHIVO_COSTOS?.ToString() ?? CotJString(enc, "archivoCostos", "ArchivoCostos"),
                TiempoEntrega = CotJString(enc, "tiempoEntrega", "TiempoEntrega")
            };

            // Total listado: prioridad = suma líneas "Productos y Opciones" (conceptos), como en FormacionPrecios.vue
            var conceptosRoot = jo["conceptos"] ?? jo["Conceptos"];
            decimal totalCotizacion = CotSumConceptosArray(conceptosRoot);
            if (totalCotizacion == 0)
            {
                var fpState = jo["formacionPrecios"] ?? jo["FormacionPrecios"];
                if (fpState != null && fpState.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                {
                    var cFp = ((Newtonsoft.Json.Linq.JObject)fpState)["conceptos"] ?? ((Newtonsoft.Json.Linq.JObject)fpState)["Conceptos"];
                    totalCotizacion = CotSumConceptosArray(cFp);
                }
            }
            if (totalCotizacion == 0)
                totalCotizacion = CotSafeDecimal(enc["total"] ?? enc["Total"]);
            if (totalCotizacion == 0)
            {
                var fpGlobal = jo["formacionPreciosGlobal"] ?? jo["FormacionPreciosGlobal"];
                if (fpGlobal != null && fpGlobal.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                    totalCotizacion = CotSafeDecimal(((Newtonsoft.Json.Linq.JObject)fpGlobal)["precioFinal"] ?? ((Newtonsoft.Json.Linq.JObject)fpGlobal)["PrecioFinal"]);
            }
            if (totalCotizacion == 0)
            {
                var fpOuterTot = jo["formacionPrecios"] ?? jo["FormacionPrecios"];
                totalCotizacion = CotPrecioFinalFromFormacionPreciosOuter(fpOuterTot);
            }
            data.Total = totalCotizacion;

            data.Vendedor = CotMapVendedor(enc["vendedor"] ?? enc["Vendedor"]);
            data.VendedorSec = CotMapVendedor(enc["vendedorSec"] ?? enc["VendedorSec"]);
            return data;
        }

        /// <summary>
        /// Crea en MIKNE y, tras commit, envía a SAP. Orden garantizado en el mismo servidor.
        /// </summary>
        public async Task<CrearCotizacionSapResult> CrearCotizacionYEnviarASapAsync(
            CotizacionCompleta cotizacion,
            string jsonContent,
            string userNameForSeries)
        {
            int id;
            try
            {
                id = await CrearCotizacionAsync(cotizacion, jsonContent);
            }
            catch (Exception ex)
            {
                return new CrearCotizacionSapResult
                {
                    Id = 0,
                    FolioPortal = null,
                    DocNum = null,
                    SapError = null,
                    DbError = FormatHanaFailureForClient(ex)
                };
            }

            var folioPortal = string.Concat(id, "-A");
            var user = string.IsNullOrWhiteSpace(userNameForSeries)
                ? cotizacion?.Encabezado?.Usuario
                : userNameForSeries;

            var sap = await SincronizarQuotationWithSapInternalAsync(id, user);
            if (!string.IsNullOrEmpty(sap.Error))
            {
                return new CrearCotizacionSapResult
                {
                    Id = id,
                    FolioPortal = folioPortal,
                    DocNum = null,
                    SapDocEntry = null,
                    SapError = sap.Error
                };
            }

            return new CrearCotizacionSapResult
            {
                Id = id,
                FolioPortal = folioPortal,
                DocNum = sap.FolioSapDisplay,
                SapDocEntry = sap.DocEntry,
                SapError = null
            };
        }

        /// <summary>
        /// Arma líneas SAP desde productos en JSON (Vue/Pinia plano o envoltorio producto/Producto).
        /// </summary>
        private static List<SapQuotationLine> BuildSapQuotationLinesFromJson(JObject root, string currencySap)
        {
            var lines = new List<SapQuotationLine>();
            var arr = root["productos"] ?? root["Productos"];
            if (arr == null || arr.Type != JTokenType.Array)
                return lines;

            foreach (var tok in (JArray)arr)
            {
                var o = tok as JObject;
                if (o == null) continue;

                var row = o;
                var wrapped = o["producto"] ?? o["Producto"];
                if (wrapped is JObject wj)
                    row = wj;

                var code = (string)(row["itemCode"] ?? row["ItemCode"]);
                if (string.IsNullOrWhiteSpace(code))
                    continue;

                var name = (string)(row["itemName"] ?? row["ItemName"] ?? row["itemDescription"] ?? row["ItemDescription"]);
                if (string.IsNullOrWhiteSpace(name))
                    name = code;

                double qty = 1;
                var qtyTok = row["qty"] ?? row["Qty"] ?? row["quantity"] ?? row["Quantity"];
                if (qtyTok != null && qtyTok.Type != JTokenType.Null &&
                    double.TryParse(qtyTok.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var q) && q > 0)
                    qty = q;

                double? price = null;
                var pTok = row["price"] ?? row["Price"] ?? row["precioUnitario"] ?? row["PrecioUnitario"];
                if (pTok != null && pTok.Type != JTokenType.Null &&
                    double.TryParse(pTok.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var pr))
                    price = pr;

                lines.Add(new SapQuotationLine
                {
                    ItemCode = code.Trim(),
                    ItemDescription = name,
                    Quantity = qty,
                    Price = price,
                    Currency = currencySap ?? "MXN"
                });
            }

            return lines;
        }

        private string MapCurrencyToSap(string portalCurrency)
        {
            if (string.IsNullOrEmpty(portalCurrency)) return "MXN";
            if (portalCurrency == "US$" || portalCurrency.Contains("$")) return "USD";
            return portalCurrency;
        }

        /// <summary>
        /// Texto legible para el cliente (503 / snackbar) con detalle HANA si existe en la cadena.
        /// </summary>
        private static string FormatHanaFailureForClient(Exception ex)
        {
            if (ex == null) return "Error desconocido";
            var parts = new List<string> { ex.Message };
            for (var inner = ex.InnerException; inner != null; inner = inner.InnerException)
            {
                if (!string.IsNullOrWhiteSpace(inner.Message) && !parts.Contains(inner.Message))
                    parts.Add(inner.Message);
            }

            for (var x = ex; x != null; x = x.InnerException)
            {
                if (x is HanaException hx)
                {
                    parts.Add($"SAP HANA NativeError={hx.NativeError}");
                    break;
                }
            }

            return string.Join(" | ", parts);
        }
    }
}
