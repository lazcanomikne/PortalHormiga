namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un evento de pago
    /// </summary>
    public class EventoPago
    {
        /// <summary>
        /// ID del evento de pago
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Porcentaje del evento
        /// </summary>
        public decimal Porcentaje { get; set; }

        /// <summary>
        /// Condición del evento
        /// </summary>
        public string Condicion { get; set; }

        /// <summary>
        /// Descripción del evento
        /// </summary>
        public string Descripcion { get; set; }
    }
}
