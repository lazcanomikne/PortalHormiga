using System.Collections.Generic;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar las configuraciones globales de una cotización
    /// </summary>
    public class ConfiguracionesGlobales
    {
        /// <summary>
        /// Incluye instalación
        /// </summary>
        public bool IncluyeInstalacion { get; set; }

        /// <summary>
        /// Incluye transporte
        /// </summary>
        public bool IncluyeTransporte { get; set; }

        /// <summary>
        /// Incluye capacitación
        /// </summary>
        public bool IncluyeCapacitacion { get; set; }

        /// <summary>
        /// Incluye garantía
        /// </summary>
        public bool IncluyeGarantia { get; set; }

        /// <summary>
        /// Incluye mantenimiento
        /// </summary>
        public bool IncluyeMantenimiento { get; set; }

        /// <summary>
        /// Observaciones adicionales
        /// </summary>
        public string ObservacionesAdicionales { get; set; }

        /// <summary>
        /// Lista de eventos de pago
        /// </summary>
        public List<EventoPago> EventosPago { get; set; } = new List<EventoPago>();
    }
}
