namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo básico para representar una bahía en una cotización
    /// </summary>
    public class BahiaBasica
    {
        /// <summary>
        /// ID de la bahía
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Nombre de la bahía
        /// </summary>
        public string Nombre { get; set; }

        /// <summary>
        /// Alimentación
        /// </summary>
        public bool Alimentacion { get; set; }

        /// <summary>
        /// Riel
        /// </summary>
        public bool Riel { get; set; }

        /// <summary>
        /// Estructura
        /// </summary>
        public bool Estructura { get; set; }

        /// <summary>
        /// Definiciones de la bahía
        /// </summary>
        public CotizacionBahiaDefiniciones Definiciones { get; set; }
    }
}
