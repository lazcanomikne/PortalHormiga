namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar las ruedas motrices del puente
    /// </summary>
    public class RuedasMotrices
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
        /// Tipo de rueda motriz
        /// </summary>
        public string TipoRuedaMotriz { get; set; }

        /// <summary>
        /// Tipo de rueda motriz otro
        /// </summary>
        public string TipoRuedaMotrizOtro { get; set; }

        /// <summary>
        /// Tipo de rueda loca
        /// </summary>
        public string TipoRuedaLoca { get; set; }

        /// <summary>
        /// Tipo de rueda loca otro
        /// </summary>
        public string TipoRuedaLocaOtro { get; set; }

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
