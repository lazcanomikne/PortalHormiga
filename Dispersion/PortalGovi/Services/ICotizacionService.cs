using System.Collections.Generic;
using System.Threading.Tasks;
using PortalGovi.Models;

namespace PortalGovi.Services
{
    /// <summary>
    /// Interfaz para el servicio de cotizaciones
    /// </summary>
    public interface ICotizacionService
    {
        /// <summary>
        /// Crear una nueva cotización completa
        /// </summary>
        /// <param name="cotizacion">Datos completos de la cotización</param>
        /// <returns>ID de la cotización creada</returns>
        Task<int> CrearCotizacionAsync(CotizacionCompleta cotizacion, string jsonContent);

        /// <summary>
        /// Obtener una cotización completa por ID
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>Cotización completa</returns>
        Task<string> ObtenerCotizacionAsync(int id);

        /// <summary>
        /// Obtener todas las cotizaciones
        /// </summary>
        /// <returns>Lista de cotizaciones</returns>
        Task<List<CotizacionEncabezado>> ObtenerCotizacionesAsync();

        /// <summary>
        /// Actualizar una cotización existente
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <param name="cotizacion">Datos actualizados de la cotización</param>
        /// <returns>True si se actualizó correctamente</returns>
        Task<bool> ActualizarCotizacionAsync(int id, CotizacionCompleta cotizacion, string jsonContent);

        /// <summary>
        /// Eliminar una cotización
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>True si se eliminó correctamente</returns>
        Task<bool> EliminarCotizacionAsync(int id);

        /// <summary>
        /// Obtener una cotización completa por Folio Portal de la tabla HISTORY
        /// </summary>
        Task<string> ObtenerCotizacionPorFolioAsync(string folio);

        /// <summary>
        /// Obtener todas las versiones (historial) de una cotización
        /// </summary>
        /// <param name="id">ID de la cotización original</param>
        /// <returns>Lista de encabezados de versiones</returns>
        Task<List<CotizacionEncabezado>> ObtenerVersionesAsync(int id);

        /// <summary>
        /// Actualizar el estado de una cotización
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <param name="nuevoEstado">Nuevo estado (Abierto, Validacion Costos, etc.)</param>
        /// <returns>True si se actualizó correctamente</returns>
        Task<bool> ActualizarEstadoAsync(int id, string nuevoEstado);

        /// <summary>
        /// Actualizar el nombre del archivo de costos adjunto
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <param name="nombreArchivo">Nombre del archivo guardado</param>
        /// <returns>True si se actualizó correctamente</returns>
        Task<bool> ActualizarArchivoCostosAsync(int id, string nombreArchivo);

        /// <summary>
        /// Enviar una cotización al Service Layer de SAP
        /// </summary>
        /// <param name="id">ID de la cotización</param>
        /// <returns>Folio de SAP generado (DocNum)</returns>
        Task<string> EnviarASapAsync(int id, string userName = null);
    }
}