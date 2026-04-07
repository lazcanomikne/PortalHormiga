namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el riel de una bahía de cotización
    /// </summary>
    public class CotizacionBahiaRiel
    {
        /// <summary>
        /// ID único del riel
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID de la bahía de cotización
        /// </summary>
        public int IdCotizacionBahia { get; set; }

        /// <summary>
        /// Tipo de riel
        /// </summary>
        public string TipoRiel { get; set; }

        /// <summary>
        /// Especifique tipo de riel
        /// </summary>
        public string EspecifiqueTipoRiel { get; set; }

        /// <summary>
        /// Etiqueta dinámica de tipo de riel para Word
        /// </summary>
        public string EtiquetaTipoRiel { get; set; }

        /// <summary>
        /// Etiqueta dinámica de observaciones de riel para Word
        /// </summary>
        public string EtiquetaObservacionesRiel { get; set; }

        /// <summary>
        /// Metros lineales de riel
        /// </summary>
        public decimal? MetrosLinealesRiel { get; set; }

        /// <summary>
        /// Calidad del material del riel
        /// </summary>
        public string CalidadMaterialRiel { get; set; }

        /// <summary>
        /// Especifique calidad del material del riel
        /// </summary>
        public string EspecifiqueCalidadMaterialRiel { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}