namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el resumen financiero de una cotización
    /// </summary>
    public class CotizacionResumen
    {
        /// <summary>
        /// Subtotal
        /// </summary>
        public decimal Subtotal { get; set; }

        /// <summary>
        /// IVA
        /// </summary>
        public decimal Iva { get; set; }

        /// <summary>
        /// Total
        /// </summary>
        public decimal Total { get; set; }

        /// <summary>
        /// Moneda
        /// </summary>
        public string Moneda { get; set; }
    }
}
