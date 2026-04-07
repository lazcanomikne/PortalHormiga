namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el montaje de un producto de cotización
    /// </summary>
    public class CotizacionProductoMontaje
    {
        /// <summary>
        /// ID único del montaje
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Grúa para montaje
        /// </summary>
        public bool? GruaMontaje { get; set; }

        /// <summary>
        /// Pruebas de carga en montaje
        /// </summary>
        public bool? PruebasCargaMontaje { get; set; }

        /// <summary>
        /// Alimentación eléctrica en montaje
        /// </summary>
        public bool? AlimentacionElectricaMontaje { get; set; }

        /// <summary>
        /// Riel en montaje
        /// </summary>
        public bool? RielMontaje { get; set; }

        /// <summary>
        /// Estructura en montaje
        /// </summary>
        public bool? EstructuraMontaje { get; set; }

        /// <summary>
        /// Grúas móviles
        /// </summary>
        public string GruasMoviles { get; set; }

        /// <summary>
        /// Plataforma de elevación geny
        /// </summary>
        public string PlataformaElevacionGeny { get; set; }

        /// <summary>
        /// Línea de vida
        /// </summary>
        public string LineaVida { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}