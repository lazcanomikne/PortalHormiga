namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo básico para representar un producto en una cotización
    /// </summary>
    public class ProductoBasico
    {
        /// <summary>
        /// ID del producto
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Código del artículo (itemCode)
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Nombre del artículo
        /// </summary>
        public string ItemName { get; set; }

        /// <summary>
        /// Cantidad
        /// </summary>
        public decimal Qty { get; set; }

        /// <summary>
        /// Precio
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// Bahía asignada
        /// </summary>
        public string Bahia { get; set; }

        /// <summary>
        /// Definiciones del producto
        /// </summary>
        public CotizacionProductoDefiniciones Definiciones { get; set; }
    }
}
