namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un gancho en los datos básicos del producto
    /// </summary>
    public class Gancho
    {
        /// <summary>
        /// Capacidad del gancho
        /// </summary>
        public decimal? CapacidadGancho { get; set; }

        /// <summary>
        /// Izaje del gancho
        /// </summary>
        public decimal? IzajeGancho { get; set; }

        /// <summary>
        /// Velocidad de traslación del gancho
        /// </summary>
        public string VelocidadTraslacionGancho { get; set; }

        /// <summary>
        /// Especifique velocidad de traslación
        /// </summary>
        public string EspecifiqueVelocidadTraslacion { get; set; }

        /// <summary>
        /// Izaje
        /// </summary>
        public decimal? Izaje { get; set; }
    }
}
