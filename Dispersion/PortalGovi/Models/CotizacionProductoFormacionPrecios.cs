namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la formación de precios de un producto de cotización
    /// </summary>
    public class CotizacionProductoFormacionPrecios
    {
        /// <summary>
        /// ID único de la formación de precios
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Plazo de pago
        /// </summary>
        public string PlazoPago { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}
