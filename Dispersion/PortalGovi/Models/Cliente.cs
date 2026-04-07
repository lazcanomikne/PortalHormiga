namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un cliente en el encabezado de cotización
    /// </summary>
    public class Cliente
    {
        /// <summary>
        /// Código de la tarjeta del cliente
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Nombre completo del cliente
        /// </summary>
        public string NombreCompleto { get; set; }
    }
}