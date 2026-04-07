using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar las definiciones completas de un producto de cotización
    /// </summary>
    public class CotizacionProductoDefiniciones
    {
        /// <summary>
        /// Datos básicos del producto
        /// </summary>
        public CotizacionProductoDatosBasicos DatosBasicos { get; set; }

        /// <summary>
        /// Adicionales del producto
        /// </summary>
        public CotizacionProductoAdicionales Adicionales { get; set; }

        /// <summary>
        /// Información de gancho (anteriormente izaje) del producto
        /// </summary>
        [JsonProperty("gancho")]
        public CotizacionProductoIzaje Gancho { get; set; }

        /// <summary>
        /// Fallback para compatibilidad con datos antiguos que usaban "izaje"
        /// </summary>
        [JsonProperty("izaje")]
        private CotizacionProductoIzaje IzajeFallback { set => Gancho = value; }

        /// <summary>
        /// Información del carro del producto
        /// </summary>
        public CotizacionProductoCarro Carro { get; set; }

        /// <summary>
        /// Información del puente del producto
        /// </summary>
        public CotizacionProductoPuente Puente { get; set; }

        /// <summary>
        /// Información del flete del producto
        /// </summary>
        public CotizacionProductoFlete Flete { get; set; }

        /// <summary>
        /// Información del montaje del producto
        /// </summary>
        public CotizacionProductoMontaje Montaje { get; set; }

        /// <summary>
        /// Información complementaria del producto
        /// </summary>
        public CotizacionProductoInformacionComplementaria InformacionComplementaria { get; set; }

        /// <summary>
        /// Formación de precios del producto
        /// </summary>
        public CotizacionProductoFormacionPrecios FormacionPrecios { get; set; }
    }
}
