namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar las ruedas locas del puente
    /// </summary>
    public class RuedasLocas
    {
        /// <summary>
        /// Cantidad de ruedas
        /// </summary>
        public int? CantidadRuedas { get; set; }

        /// <summary>
        /// Diámetro de ruedas
        /// </summary>
        public decimal? DiametroRuedas { get; set; }

        /// <summary>
        /// Material de ruedas
        /// </summary>
        public string MaterialRuedas { get; set; }

        /// <summary>
        /// Modelo de ruedas
        /// </summary>
        public string ModeloRuedas { get; set; }

        /// <summary>
        /// Modelo de ruedas otro
        /// </summary>
        public string ModeloRuedasOtro { get; set; }
    }
}
