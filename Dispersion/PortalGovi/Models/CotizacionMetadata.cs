using System;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar los metadatos de una cotización
    /// </summary>
    public class CotizacionMetadata
    {
        /// <summary>
        /// Versión
        /// </summary>
        public string Version { get; set; }

        /// <summary>
        /// Usuario que creó la cotización
        /// </summary>
        public string CreadoPor { get; set; }

        /// <summary>
        /// Fecha de creación
        /// </summary>
        public DateTime FechaCreacion { get; set; }

        /// <summary>
        /// Última modificación
        /// </summary>
        public DateTime UltimaModificacion { get; set; }
    }
}
