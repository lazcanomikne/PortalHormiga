namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el flete de un producto de cotización
    /// </summary>
    public class CotizacionProductoFlete
    {
        /// <summary>
        /// ID único del flete
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Flete por parte de SHOSA
        /// </summary>
        public bool? FletePorParteShosa { get; set; }

        /// <summary>
        /// Grúa para flete
        /// </summary>
        public bool? GruaFlete { get; set; }

        /// <summary>
        /// Alimentación eléctrica
        /// </summary>
        public bool? AlimentacionElectrica { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}