using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PortalGovi.Models;
using PortalGovi.Services;
using Sap.Data.Hana;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace PortalGovi.Controllers
{
    /// <summary>
    /// Controlador para manejar las operaciones de cotizaciones
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CotizacionController : ControllerBase
    {
        private readonly ICotizacionService _cotizacionService;
        private readonly IWebHostEnvironment _env;
        private readonly JsonSerializerSettings _jsonSettings;

        public class StatusUpdateDto
        {
            public string Estado { get; set; }
        }

        public class SapRequestParams
        {
            public string UserName { get; set; }
        }

        public CotizacionController(ICotizacionService cotizacionService, IWebHostEnvironment env)
        {
            _cotizacionService = cotizacionService;
            _env = env;
            _jsonSettings = new JsonSerializerSettings
            {
                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(),
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };
        }

        /// <summary>
        /// Misma lógica que <see cref="CrearCotizacionConSap"/>: MIKNE + envío a SAP Service Layer (Quotations).
        /// Antes solo persistía en MIKNE y SAP quedaba para el siguiente PUT; unificar evita cotizaciones sin DocNum inicial.
        /// </summary>
        [HttpPost]
        public Task<ActionResult<object>> CrearCotizacion([FromBody] JObject body) =>
            CrearCotizacionConSap(body);

        /// <summary>
        /// Crea primero en MIKNE (COTIZACION_ENCABEZADO + HISTORY, COMMIT) y después POST a SAP Service Layer Quotations.
        /// </summary>
        [HttpPost("with-sap")]
        public async Task<ActionResult<object>> CrearCotizacionConSap([FromBody] JObject body)
        {
            try
            {
                if (body == null || !body.HasValues)
                {
                    return BadRequest(new { message = "El cuerpo de la petición no puede estar vacío" });
                }

                var encToken = body["encabezado"] ?? body["Encabezado"];
                if (encToken == null || encToken.Type == JTokenType.Null)
                {
                    return BadRequest(new { message = "El encabezado de la cotización es requerido" });
                }

                CotizacionEncabezado encabezado;
                try
                {
                    var serializer = JsonSerializer.Create(_jsonSettings);
                    encabezado = encToken.ToObject<CotizacionEncabezado>(serializer);
                }
                catch (JsonException jex)
                {
                    return BadRequest(new { message = "Encabezado inválido", error = jex.Message });
                }

                if (encabezado == null)
                {
                    return BadRequest(new { message = "El encabezado de la cotización es requerido" });
                }

                string jsonContent = body.ToString(Formatting.None);
                var cotizacion = new CotizacionCompleta { Encabezado = encabezado };

                var result = await _cotizacionService.CrearCotizacionYEnviarASapAsync(
                    cotizacion,
                    jsonContent,
                    encabezado.Usuario);

                if (!string.IsNullOrEmpty(result.DbError))
                {
                    return StatusCode(503, new
                    {
                        message = "No se pudo guardar la cotización en MIKNE; no se llamó a SAP.",
                        dbError = result.DbError
                    });
                }

                var payload = new
                {
                    message = string.IsNullOrEmpty(result.SapError)
                        ? "Cotización creada en MIKNE y enviada a SAP."
                        : "Cotización creada en MIKNE; SAP reportó error (ver sapError).",
                    id = result.Id,
                    folioPortal = result.FolioPortal,
                    docNum = result.DocNum,
                    folioSap = result.DocNum,
                    sapDocEntry = result.SapDocEntry,
                    sapError = result.SapError
                };

                return StatusCode(201, payload);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en CrearCotizacionConSap: {ex}");
                var inner = ex.InnerException?.Message;
                return StatusCode(500, new
                {
                    message = "Error interno del servidor",
                    error = ex.Message,
                    innerError = inner,
                    details = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Obtener una cotización por ID
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>Cotización completa</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerCotizacion(int id)
        {
            try
            {
                var cotizacion = await _cotizacionService.ObtenerCotizacionAsync(id);
                
                if (string.IsNullOrEmpty(cotizacion))
                {
                    return NotFound(new { message = "Cotización no encontrada" });
                }

                // Devolver JSON crudo (evita Ok(string) que serializa como comillas y rompe axios/Oferta.vue).
                return Content(cotizacion, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener todas las cotizaciones
        /// </summary>
        /// <returns>Lista de cotizaciones</returns>
        [HttpGet]
        public async Task<ActionResult<List<CotizacionEncabezado>>> ObtenerCotizaciones()
        {
            try
            {
                var cotizaciones = await _cotizacionService.ObtenerCotizacionesAsync();
                return Ok(cotizaciones);
            }
            catch (Exception ex)
            {
                var flat = FlattenExceptionMessages(ex);
                var hx = FindHanaExceptionInChain(ex);
                if (hx != null || LooksLikeHanaOrNetworkFailure(flat))
                {
                    return StatusCode(503, new
                    {
                        message = "SAP HANA no respondió o rechazó la conexión. Compruebe VPN, red, firewall y ConnectionStrings:HanaConnection (host y puerto, p. ej. :30015).",
                        error = flat,
                        nativeError = hx?.NativeError
                    });
                }
                return StatusCode(500, new { message = "Error interno del servidor", error = flat });
            }
        }

        /// <summary>
        /// Localiza HanaException aunque Dapper u otra capa la envuelva.
        /// </summary>
        private static HanaException FindHanaExceptionInChain(Exception ex)
        {
            if (ex == null) return null;
            if (ex is HanaException he) return he;
            if (ex is AggregateException agg)
            {
                foreach (var inner in agg.InnerExceptions)
                {
                    var h = FindHanaExceptionInChain(inner);
                    if (h != null) return h;
                }
                return null;
            }
            return FindHanaExceptionInChain(ex.InnerException);
        }

        /// <summary>
        /// Une mensajes de excepción e internas (Dapper/HANA suelen envolver el error real).
        /// </summary>
        private static string FlattenExceptionMessages(Exception ex)
        {
            var acc = new System.Collections.Generic.List<string>();
            void Walk(Exception e)
            {
                if (e == null) return;
                if (!string.IsNullOrWhiteSpace(e.Message))
                {
                    var m = e.Message.Trim();
                    if (acc.Count == 0 || acc[acc.Count - 1] != m)
                        acc.Add(m);
                }
                if (e is AggregateException agg)
                {
                    foreach (var inner in agg.InnerExceptions)
                        Walk(inner);
                    return;
                }
                Walk(e.InnerException);
            }
            Walk(ex);
            return acc.Count > 0 ? string.Join(" | ", acc) : (ex?.Message ?? "");
        }

        private static bool LooksLikeHanaOrNetworkFailure(string flatMessage)
        {
            if (string.IsNullOrEmpty(flatMessage)) return false;
            return flatMessage.IndexOf("RTE:", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("89006", StringComparison.Ordinal) >= 0
                || flatMessage.IndexOf("connect", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("10060", StringComparison.Ordinal) >= 0
                || flatMessage.IndexOf("10061", StringComparison.Ordinal) >= 0
                || flatMessage.IndexOf("HANA", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("conexión", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("conexion", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("respondió", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("respondio", StringComparison.OrdinalIgnoreCase) >= 0
                || flatMessage.IndexOf("parte conectada", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        /// <summary>
        /// Actualizar una cotización existente
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <param name="cotizacion">Datos actualizados de la cotización</param>
        /// <returns>Resultado de la actualización</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult> ActualizarCotizacion(int id, [FromBody] JObject body)
        {
            try
            {
                if (body == null || !body.HasValues)
                {
                    return BadRequest(new { message = "El cuerpo de la petición no puede estar vacío" });
                }

                var encToken = body["encabezado"] ?? body["Encabezado"];
                if (encToken == null || encToken.Type == JTokenType.Null)
                {
                    return BadRequest(new { message = "El encabezado de la cotización es requerido" });
                }

                // Preservar sapDocEntry en MIKNE si el cliente no lo reenvía (evita POST duplicado en SAP).
                try
                {
                    var existingJson = await _cotizacionService.ObtenerCotizacionAsync(id);
                    if (!string.IsNullOrEmpty(existingJson))
                    {
                        var exJo = JObject.Parse(existingJson);
                        var exEnc = exJo["encabezado"] ?? exJo["Encabezado"];
                        var bodyEnc = (body["encabezado"] ?? body["Encabezado"]) as JObject;
                        if (exEnc is JObject exEncObj && bodyEnc != null)
                        {
                            var keep = exEncObj["sapDocEntry"] ?? exEncObj["SapDocEntry"];
                            var incoming = bodyEnc["sapDocEntry"] ?? bodyEnc["SapDocEntry"];
                            if (keep != null && keep.Type != JTokenType.Null &&
                                (incoming == null || incoming.Type == JTokenType.Null))
                                bodyEnc["sapDocEntry"] = keep;
                        }
                    }
                }
                catch (Exception mergeEx)
                {
                    Console.WriteLine($"[Cotizacion] Aviso: no se fusionó sapDocEntry: {mergeEx.Message}");
                }

                CotizacionEncabezado encabezado;
                try
                {
                    var serializer = JsonSerializer.Create(_jsonSettings);
                    encabezado = encToken.ToObject<CotizacionEncabezado>(serializer);
                }
                catch (JsonException jex)
                {
                    return BadRequest(new { message = "Encabezado inválido", error = jex.Message });
                }

                if (encabezado == null)
                {
                    return BadRequest(new { message = "El encabezado de la cotización es requerido" });
                }

                string jsonContent = body.ToString(Formatting.None);
                var cotizacion = new CotizacionCompleta { Encabezado = encabezado };

                var resultado = await _cotizacionService.ActualizarCotizacionAsync(id, cotizacion, jsonContent);
                
                if (!resultado.GuardadoEnMikne)
                {
                    return NotFound(new { message = "Cotización no encontrada" });
                }

                var msg = string.IsNullOrEmpty(resultado.SapError)
                    ? "Cotización actualizada en MIKNE y sincronizada con SAP."
                    : "Cotización actualizada en MIKNE. SAP: " + resultado.SapError;

                return Ok(new
                {
                    message = msg,
                    sapError = resultado.SapError,
                    folioSap = resultado.FolioSap,
                    sapDocEntry = resultado.SapDocEntry
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en ActualizarCotizacion: {ex}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, details = ex.StackTrace });
            }
        }

        /// <summary>
        /// Eliminar una cotización
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>Resultado de la eliminación</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarCotizacion(int id)
        {
            try
            {
                var resultado = await _cotizacionService.EliminarCotizacionAsync(id);
                
                if (!resultado)
                {
                    return NotFound(new { message = "Cotización no encontrada" });
                }

                return Ok(new { message = "Cotización eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("folio/{folio}")]
        public async Task<IActionResult> ObtenerCotizacionPorFolio(string folio)
        {
            try
            {
                var cotizacion = await _cotizacionService.ObtenerCotizacionPorFolioAsync(folio);
                if (string.IsNullOrEmpty(cotizacion)) return NotFound(new { message = "Cotización no encontrada" });
                return Content(cotizacion, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener el historial de versiones de una cotización
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>Lista de versiones</returns>
        [HttpGet("{id}/versions")]
        public async Task<ActionResult<List<CotizacionEncabezado>>> ObtenerVersiones(int id)
        {
            try
            {
                var versiones = await _cotizacionService.ObtenerVersionesAsync(id);
                return Ok(versiones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar el estado de una cotización
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<ActionResult> ActualizarEstado(int id, [FromBody] StatusUpdateDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrEmpty(dto.Estado))
                {
                    return BadRequest(new { message = "El estado es requerido" });
                }

                var resultado = await _cotizacionService.ActualizarEstadoAsync(id, dto.Estado);
                
                if (!resultado)
                {
                    return NotFound(new { message = "Cotización no encontrada" });
                }

                return Ok(new { message = "Estado actualizado exitosamente", nuevoEstado = dto.Estado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
        /// <summary>
        /// Subir archivo Excel para validación de costos
        /// </summary>
        [HttpPost("{id}/upload-excel")]
        public async Task<ActionResult> PostArchivoCostos(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No se ha seleccionado ningún archivo" });
                }

                // Validar extensión
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".xls" && extension != ".xlsx")
                {
                    return BadRequest(new { message = "Solo se permiten archivos Excel (.xls, .xlsx)" });
                }

                // Crear directorio si no existe (usamos wwwroot/uploads/costos para que sea accesible via estaticos si se necesita)
                var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "costos");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generar nombre único para evitar colisiones
                var fileName = $"costos_{id}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Actualizar en base de datos
                var resultado = await _cotizacionService.ActualizarArchivoCostosAsync(id, fileName);

                if (!resultado)
                {
                    return NotFound(new { message = "Cotización no encontrada para asignar el archivo" });
                }

                return Ok(new { message = "Archivo subido exitosamente", fileName = fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al subir el archivo", error = ex.Message });
            }
        }

        /// <summary>
        /// Enviar una cotización al Service Layer de SAP
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>DocNum de SAP</returns>
        [HttpPost("{id}/send-to-sap")]
        public async Task<ActionResult<object>> SendToSap(int id, [FromBody] SapRequestParams request = null)
        {
            try
            {
                var docNum = await _cotizacionService.EnviarASapAsync(id, request?.UserName);
                return Ok(new
                {
                    message = "Cotización enviada a SAP exitosamente",
                    docNum,
                    folioSap = docNum
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en SendToSap: {ex}");
                return StatusCode(500, new { message = "Error al enviar a SAP", error = ex.Message });
            }
        }

        /// <summary>Crea un pedido en SAP B1 Service Layer (POST /b1s/v1/Orders), mismo payload que cotización.</summary>
        [HttpPost("{id}/create-order-sap")]
        public async Task<ActionResult<object>> CreateOrderSap(int id, [FromBody] SapRequestParams request = null)
        {
            try
            {
                var docNum = await _cotizacionService.CrearPedidoEnSapAsync(id, request?.UserName);
                return Ok(new
                {
                    message = "Pedido creado en SAP exitosamente",
                    docNum,
                    folioPedidoSap = docNum
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en CreateOrderSap: {ex}");
                return StatusCode(500, new { message = "Error al crear pedido en SAP", error = ex.Message });
            }
        }
    }
}