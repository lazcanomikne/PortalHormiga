namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la estructura de una bahía de cotización
    /// </summary>
    public class CotizacionBahiaEstructura
    {
        /// <summary>
        /// ID único de la estructura
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID de la bahía de cotización
        /// </summary>
        public int IdCotizacionBahia { get; set; }

        /// <summary>
        /// Lotes requeridos
        /// </summary>
        public int? LotesRequeridos { get; set; }

        /// <summary>
        /// Trabe carril
        /// </summary>
        public bool? TrabeCarril { get; set; }

        /// <summary>
        /// Columnas
        /// </summary>
        public bool? Columnas { get; set; }

        /// <summary>
        /// Ménsula
        /// </summary>
        public bool? Mensula { get; set; }

        /// <summary>
        /// Cantidad de columnas
        /// </summary>
        public int? CantidadColumnas { get; set; }

        /// <summary>
        /// Distancia entre columnas
        /// </summary>
        public decimal? DistanciaColumnas { get; set; }

        /// <summary>
        /// Montaje de trabe carril (Y/N)
        /// </summary>
        public string MontajeTrabeCarril { get; set; }

        /// <summary>
        /// Metros lineales de trabe carril
        /// </summary>
        public decimal? MetLinTraCarril { get; set; }

        /// <summary>
        /// NPT a NHR (aprox.) (mm)
        /// </summary>
        public decimal? NptNhr { get; set; }

        /// <summary>
        /// Pintura de estructura (Y/N)
        /// </summary>
        public string PinturaEstructura { get; set; }

        /// <summary>
        /// Tipo de pintura
        /// </summary>
        public string TipoPintura { get; set; }

        /// <summary>
        /// Tipo y código de pintura
        /// </summary>
        public int? TipoCodigoPintura { get; set; }

        /// <summary>
        /// Color de pintura (RAL)
        /// </summary>
        public int? ColorPintura { get; set; }

        /// <summary>
        /// Fijación de columnas (SHOSA/Cliente)
        /// </summary>
        public string FijacionColumnas { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}