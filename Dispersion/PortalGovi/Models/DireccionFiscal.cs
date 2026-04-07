namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la dirección fiscal
    /// </summary>
    public class DireccionFiscal
    {
        /// <summary>
        /// Código del cliente
        /// </summary>
        public string Address { get; set; }

        /// <summary>
        /// Dirección fiscal completa
        /// </summary>
        public string DirFiscal { get; set; }
        public string Tipo { get; set; }
    }
} 