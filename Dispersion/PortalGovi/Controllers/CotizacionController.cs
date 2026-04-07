using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PortalGovi.Models;
using PortalGovi.Services;
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

        [HttpPost]
        public async Task<ActionResult<object>> CrearCotizacion([FromBody] CotizacionCompleta cotizacion)
        {
            try
            {
                if (cotizacion == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición no puede estar vacío" });
                }

                if (cotizacion.Encabezado == null)
                {
                    return BadRequest(new { message = "El encabezado de la cotización es requerido" });
                }

                // Convertir a JSON para el servicio (que guarda el JSON completo)
                string jsonContent = JsonConvert.SerializeObject(cotizacion, _jsonSettings);

                var id = await _cotizacionService.CrearCotizacionAsync(cotizacion, jsonContent);
                var folio = id + "-A";
                
                return CreatedAtAction(nameof(ObtenerCotizacion), new { id }, new 
                { 
                    message = "Cotización creada exitosamente",
                    id = id,
                    folioPortal = folio
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en CrearCotizacion: {ex}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, details = ex.StackTrace });
            }
        }

        /// <summary>
        /// Obtener una cotización por ID
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>Cotización completa</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<string>> ObtenerCotizacion(int id)
        {
            try
            {
                var cotizacion = await _cotizacionService.ObtenerCotizacionAsync(id);
                
                if (cotizacion == null)
                {
                    return NotFound(new { message = "Cotización no encontrada" });
                }

                return Ok(cotizacion);
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
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar una cotización existente
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <param name="cotizacion">Datos actualizados de la cotización</param>
        /// <returns>Resultado de la actualización</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult> ActualizarCotizacion(int id, [FromBody] CotizacionCompleta cotizacion)
        {
            try
            {
                if (cotizacion == null)
                {
                    return BadRequest(new { message = "El cuerpo de la petición no puede estar vacío" });
                }

                if (cotizacion.Encabezado == null)
                {
                    return BadRequest(new { message = "El encabezado de la cotización es requerido" });
                }

                // Convertir a JSON para el servicio (que guarda el JSON completo)
                string jsonContent = JsonConvert.SerializeObject(cotizacion, _jsonSettings);

                var resultado = await _cotizacionService.ActualizarCotizacionAsync(id, cotizacion, jsonContent);
                
                if (!resultado)
                {
                    return NotFound(new { message = "Cotización no encontrada" });
                }

                return Ok(new { message = "Cotización actualizada exitosamente" });
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
        public async Task<ActionResult<string>> ObtenerCotizacionPorFolio(string folio)
        {
            try
            {
                var cotizacion = await _cotizacionService.ObtenerCotizacionPorFolioAsync(folio);
                if (cotizacion == null) return NotFound(new { message = "Cotización no encontrada" });
                return Ok(cotizacion);
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
                return Ok(new { message = "Cotización enviada a SAP exitosamente", docNum = docNum });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en SendToSap: {ex}");
                return StatusCode(500, new { message = "Error al enviar a SAP", error = ex.Message });
            }
        }
    }
}