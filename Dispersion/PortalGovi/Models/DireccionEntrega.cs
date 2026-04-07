namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la dirección de entrega
    /// </summary>
    public class DireccionEntrega
    {
        /// <summary>
        /// Código del cliente
        /// </summary>
        public string Address { get; set; }

        /// <summary>
        /// Dirección de entrega completa
        /// </summary>
        public string DirEntrega { get; set; }
        public string Tipo { get; set; }
    }
} 