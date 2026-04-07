namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un concepto de precio en una cotización
    /// </summary>
    public class ConceptoPrecio
    {
        /// <summary>
        /// ID del concepto
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// ID de la cotización
        /// </summary>
        public long IdCotizacion { get; set; }

        /// <summary>
        /// Concepto
        /// </summary>
        public string Concepto { get; set; }

        /// <summary>
        /// Descripción del concepto
        /// </summary>
        public string Descripcion { get; set; }

        /// <summary>
        /// Cantidad
        /// </summary>
        public decimal Cantidad { get; set; }

        /// <summary>
        /// Precio unitario
        /// </summary>
        public decimal PrecioUnit { get; set; }

        /// <summary>
        /// Total
        /// </summary>
        public decimal Total { get; set; }
    }
}
