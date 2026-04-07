namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar los adicionales de un producto de cotización
    /// </summary>
    public class CotizacionProductoAdicionales
    {
        /// <summary>
        /// ID único de los adicionales
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Dispositivo de toma de carga
        /// </summary>
        public bool? DispositivoTomaCarga { get; set; }

        /// <summary>
        /// Carrete retráctil
        /// </summary>
        public bool? CarreteRetractil { get; set; }

        /// <summary>
        /// Torreta
        /// </summary>
        public bool? Torreta { get; set; }

        /// <summary>
        /// Especifique torreta especial
        /// </summary>
        public string EspecifiqueTorretaEspecial { get; set; }

        /// <summary>
        /// Sirena
        /// </summary>
        public bool? Sirena { get; set; }

        /// <summary>
        /// Tipo de sirena
        /// </summary>
        public string TipoSirena { get; set; }

        /// <summary>
        /// Especifique sirena especial
        /// </summary>
        public string EspecifiqueSirenaEspecial { get; set; }

        /// <summary>
        /// Luminarias
        /// </summary>
        public bool? Luminarias { get; set; }

        /// <summary>
        /// Tipo de luminarias
        /// </summary>
        public string TipoLuminarias { get; set; }

        /// <summary>
        /// Cantidad de luminarias
        /// </summary>
        public int? CantidadLuminarias { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}