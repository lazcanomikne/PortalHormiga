namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar las definiciones completas de una bahía de cotización
    /// </summary>
    public class CotizacionBahiaDefiniciones
    {
        /// <summary>
        /// Información de alimentación de la bahía
        /// </summary>
        public CotizacionBahiaAlimentacion Alimentacion { get; set; }

        /// <summary>
        /// Información del riel de la bahía
        /// </summary>
        public CotizacionBahiaRiel Riel { get; set; }

        /// <summary>
        /// Información de la estructura de la bahía
        /// </summary>
        public CotizacionBahiaEstructura Estructura { get; set; }
    }
}
