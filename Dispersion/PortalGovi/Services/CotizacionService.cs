using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using PortalGovi.Models;
using Sap.Data.Hana;
using System.Text.Json;
using System.Net.Http;
using System.Text;

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

        public CotizacionService(IConfiguration configuration)
        {
            _configuration = configuration;
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
        public async Task<bool> ActualizarCotizacionAsync(int id, CotizacionCompleta cotizacion, string jsonContent)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Actualizar encabezado
                        var updated = await ActualizarEncabezadoAsync(connection, transaction, id, cotizacion, jsonContent);

                        transaction.Commit();
                        return updated;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error en ActualizarCotizacionAsync: {ex.Message}");
                        transaction.Rollback();
                        throw;
                    }
                }
            }
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
            // 1. Obtener la cotización desde HANA
            var json = await ObtenerCotizacionAsync(id);
            if (string.IsNullOrEmpty(json)) throw new Exception("No se encontró la cotización.");

            var cotizacionData = JsonConvert.DeserializeObject<CotizacionCompleta>(json, _jsonSettings);
            var enc = cotizacionData.Encabezado;

            // 2. Login a SAP Service Layer
            var sapUser = _configuration["UserData:u_User"] ?? "manager";
            var sapPass = _configuration["UserData:u_Pass"] ?? "It4116";
            var companyDB = _configuration["UserData:CompanyDB"] ?? "DESARROLLO_GRUAS";

            var credentials = await SapCredentialsHelper.GetSapCredentialsAsync(_configuration, sapUser, sapPass, companyDB);
            if (credentials == null) throw new Exception("Error al autenticar con SAP Service Layer.");

            int? seriesSap = null;
            string serieSapName = "";
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
                        int parsedSerie = 0;
                        if (!string.IsNullOrEmpty(numSerieSap) && int.TryParse(numSerieSap, out parsedSerie))
                        {
                            seriesSap = parsedSerie > 0 ? parsedSerie : (int?)null;
                        }
                    }
                }
            }

            try
            {
                // 3. Mapear a objeto SAP
                var sapQuo = new SapQuotation
                {
                    CardCode = enc.Cliente,
                    Series = seriesSap,
                    U_BXP_PORTAL = enc.FolioPortal,
                    DocDueDate = DateTime.Parse(enc.Vencimiento ?? DateTime.Now.AddDays(30).ToString("yyyy-MM-dd")),
                    SalesPersonCode = enc.Vendedor?.SlpCode,
                    Address = enc.DireccionFiscal,
                    Address2 = enc.DireccionEntrega
                };

                // Mapear líneas (productos)
                foreach (var prod in cotizacionData.Productos)
                {
                    sapQuo.DocumentLines.Add(new SapQuotationLine
                    {
                        ItemCode = prod.ItemCode,
                        ItemDescription = prod.ItemName,
                        Quantity = (double)(prod.Qty > 0 ? prod.Qty : 1),
                        Price = (double?)prod.Price,
                        Currency = MapCurrencyToSap(enc.Moneda)
                    });
                }

                // 4. Enviar a SAP
                var apiSapUrl = _configuration.GetConnectionString("ApiSAP");
                using (var httpClient = SapCredentialsHelper.CreateSapHttpClient(credentials))
                {
                    var sapJson = JsonConvert.SerializeObject(sapQuo, new JsonSerializerSettings 
                    { 
                        NullValueHandling = NullValueHandling.Ignore 
                    });
                    var content = new StringContent(sapJson, Encoding.UTF8, "application/json");

                    var response = await httpClient.PostAsync($"{apiSapUrl}Quotations", content);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new Exception($"Error de SAP ({response.StatusCode}): {responseBody}");
                    }

                    // 5. Obtener el DocNum (Folio SAP)
                    var sapResult = JsonConvert.DeserializeObject<dynamic>(responseBody);
                    string docNum = sapResult.DocNum.ToString();

                    // Aplicar el prefijo de la serie al Folio
                    if (!string.IsNullOrEmpty(serieSapName))
                    {
                        docNum = $"{serieSapName}-{docNum}";
                    }

                    // 6. Actualizar en el Portal
                    await ActualizarFolioSapAsync(id, docNum, json);

                    return docNum;
                }
            }
            finally
            {
                // Cerrar sesión en SAP
                await SapCredentialsHelper.LogoutFromSapAsync(_configuration, credentials);
            }
        }

        private async Task ActualizarFolioSapAsync(int id, string docNum, string jsonOriginal)
        {
            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                // Actualizar el JSON
                string nuevoJson = jsonOriginal;
                try
                {
                    var jo = Newtonsoft.Json.Linq.JObject.Parse(jsonOriginal);
                    var enc = jo["encabezado"] ?? jo["Encabezado"];
                    if (enc != null)
                    {
                        enc["folioSap"] = docNum;
                        nuevoJson = jo.ToString(Formatting.None);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error actualizando JSON con DocNum SAP: {ex.Message}");
                }

                // Actualizar en la base de datos
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
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.FolioPortal ?? DBNull.Value });
                cmd.Parameters.Add(new HanaParameter { Value = (object)encabezado.FolioSap ?? DBNull.Value });
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

                            // Calcular Total de forma robusta para versiones
                            decimal totalCotizacionVers = 0;
                            var vTotalToken = enc["total"] ?? enc["Total"];
                            if (vTotalToken != null && (vTotalToken.Type == Newtonsoft.Json.Linq.JTokenType.Float || vTotalToken.Type == Newtonsoft.Json.Linq.JTokenType.Integer))
                            {
                                totalCotizacionVers = (decimal)vTotalToken;
                            }

                            if (totalCotizacionVers == 0)
                            {
                                var conceptosVers = jo["conceptos"] ?? jo["Conceptos"];
                                if (conceptosVers != null && conceptosVers.Type == Newtonsoft.Json.Linq.JTokenType.Array)
                                {
                                    foreach (var concepto in conceptosVers)
                                    {
                                        var cTotal = concepto["total"] ?? concepto["Total"];
                                        if (cTotal != null && (cTotal.Type == Newtonsoft.Json.Linq.JTokenType.Float || cTotal.Type == Newtonsoft.Json.Linq.JTokenType.Integer))
                                        {
                                            totalCotizacionVers += (decimal)cTotal;
                                        }
                                        else
                                        {
                                            var cPU = concepto["precioUnit"] ?? concepto["PrecioUnit"];
                                            if (cPU != null && (cPU.Type == Newtonsoft.Json.Linq.JTokenType.Float || cPU.Type == Newtonsoft.Json.Linq.JTokenType.Integer))
                                            {
                                                totalCotizacionVers += (decimal)cPU;
                                            }
                                        }
                                    }
                                }
                            }

                            if (totalCotizacionVers == 0)
                            {
                                var fpGlobalVers = jo["formacionPreciosGlobal"] ?? jo["FormacionPreciosGlobal"];
                                if (fpGlobalVers != null)
                                {
                                    var pFinal = fpGlobalVers["precioFinal"] ?? fpGlobalVers["PrecioFinal"];
                                    if (pFinal != null && (pFinal.Type == Newtonsoft.Json.Linq.JTokenType.Float || pFinal.Type == Newtonsoft.Json.Linq.JTokenType.Integer))
                                    {
                                        totalCotizacionVers = (decimal)pFinal;
                                    }
                                }
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
            if (parent == null) return "";
            foreach (var n in names)
            {
                var t = parent[n];
                if (t == null || t.Type == Newtonsoft.Json.Linq.JTokenType.Null) continue;
                if (t.Type == Newtonsoft.Json.Linq.JTokenType.String) return t.ToObject<string>() ?? "";
                if (t.Type == Newtonsoft.Json.Linq.JTokenType.Date) return t.ToObject<DateTime>().ToString("yyyy-MM-dd");
                return t.ToString();
            }
            return "";
        }

        /// <summary>
        /// Texto escalar desde un JToken (para campos dentro de objetos anidados).
        /// </summary>
        private static string CotScalarString(Newtonsoft.Json.Linq.JToken t)
        {
            if (t == null || t.Type == Newtonsoft.Json.Linq.JTokenType.Null) return "";
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.String) return t.ToObject<string>() ?? "";
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.Integer || t.Type == Newtonsoft.Json.Linq.JTokenType.Float)
                return t.ToString();
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.Date)
                return t.ToObject<DateTime>().ToString("yyyy-MM-dd");
            return "";
        }

        /// <summary>
        /// Código de cliente (CardCode) aunque en JSON venga como string o como objeto SAP.
        /// </summary>
        private static string CotClienteCodigoFromEnc(Newtonsoft.Json.Linq.JToken enc)
        {
            var tok = enc["cliente"] ?? enc["Cliente"];
            if (tok != null && tok.Type == Newtonsoft.Json.Linq.JTokenType.Object)
            {
                var code = CotScalarString(tok["cardCode"] ?? tok["CardCode"]);
                if (!string.IsNullOrEmpty(code)) return code;
            }
            return CotJString(enc, "cliente", "Cliente");
        }

        /// <summary>
        /// Nombre para listados: clienteNombre explícito, o derivado de objeto cliente (nombreCompleto, cardName, etc.).
        /// Coincide con lo que el front resuelve al editar (Oferta.vue).
        /// </summary>
        private static string CotClienteNombreFromEnc(Newtonsoft.Json.Linq.JToken enc)
        {
            var nom = CotJString(enc, "clienteNombre", "ClienteNombre");
            if (!string.IsNullOrWhiteSpace(nom)) return nom;

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
            if (t.Type == Newtonsoft.Json.Linq.JTokenType.String &&
                decimal.TryParse(t.ToObject<string>(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var d))
                return d;
            return 0;
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

            decimal totalCotizacion = CotSafeDecimal(enc["total"] ?? enc["Total"]);
            if (totalCotizacion == 0)
            {
                var conceptos = jo["conceptos"] ?? jo["Conceptos"];
                if (conceptos != null && conceptos.Type == Newtonsoft.Json.Linq.JTokenType.Array)
                {
                    foreach (var concepto in conceptos)
                    {
                        var cTotal = concepto["total"] ?? concepto["Total"];
                        var add = CotSafeDecimal(cTotal);
                        if (add != 0) totalCotizacion += add;
                        else totalCotizacion += CotSafeDecimal(concepto["precioUnit"] ?? concepto["PrecioUnit"]);
                    }
                }
            }
            if (totalCotizacion == 0)
            {
                var fpGlobal = jo["formacionPreciosGlobal"] ?? jo["FormacionPreciosGlobal"];
                if (fpGlobal != null)
                    totalCotizacion = CotSafeDecimal(fpGlobal["precioFinal"] ?? fpGlobal["PrecioFinal"]);
            }
            if (totalCotizacion == 0)
            {
                var fpState = jo["formacionPrecios"];
                if (fpState != null && fpState.Type == Newtonsoft.Json.Linq.JTokenType.Object)
                    totalCotizacion = CotSafeDecimal(fpState["precioFinal"] ?? fpState["PrecioFinal"]);
            }
            data.Total = totalCotizacion;

            data.Vendedor = CotMapVendedor(enc["vendedor"] ?? enc["Vendedor"]);
            data.VendedorSec = CotMapVendedor(enc["vendedorSec"] ?? enc["VendedorSec"]);
            return data;
        }

        private string MapCurrencyToSap(string portalCurrency)
        {
            if (string.IsNullOrEmpty(portalCurrency)) return "MXN";
            if (portalCurrency == "US$" || portalCurrency.Contains("$")) return "USD";
            return portalCurrency;
        }
    }
}
