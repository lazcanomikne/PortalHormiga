using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PortalGovi.Models;
using PortalGovi.Services;

namespace PortalGovi.Controllers
{
    /// <summary>
    /// Herramientas de diagnóstico (estructura JSON en historial de cotizaciones).
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class DiagnosticsController : ControllerBase
    {
        private readonly HistoryJsonStructureDiagnosticsService _historyJson;

        public DiagnosticsController(HistoryJsonStructureDiagnosticsService historyJson)
        {
            _historyJson = historyJson;
        }

        /// <summary>
        /// Analiza JSON_CONTENT de MIKNE.COTIZACION_HISTORY: unión de rutas estructurales y diferencias por fila.
        /// </summary>
        /// <param name="maxRows">Opcional. Limita filas (1–100000). Sin parámetro = todas las filas.</param>
        [HttpGet("cotizacion-history-json-structure")]
        public async Task<ActionResult<HistoryJsonStructureReport>> GetCotizacionHistoryJsonStructure(
            [FromQuery] int? maxRows)
        {
            if (maxRows.HasValue && (maxRows.Value < 1 || maxRows.Value > 100000))
                return BadRequest(new { message = "maxRows debe estar entre 1 y 100000, u omitirse." });

            try
            {
                var report = await _historyJson.AnalyzeAsync(maxRows);
                return Ok(report);
            }
            catch (System.Exception ex)
            {
                return StatusCode(503, new { message = "No se pudo consultar HANA.", error = ex.Message });
            }
        }
    }
}
