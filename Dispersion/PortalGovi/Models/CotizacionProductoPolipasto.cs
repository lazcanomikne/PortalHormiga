using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un polipasto individual de un producto de cotización
    /// </summary>
    public class CotizacionProductoPolipasto
    {
        /// <summary>
        /// Gancho
        /// </summary>
        public string Gancho { get; set; }

        /// <summary>
        /// Capacidad del gancho
        /// </summary>
        public decimal? CapacidadGancho { get; set; }

        /// <summary>
        /// Izaje del gancho
        /// </summary>
        public decimal? IzajeGancho { get; set; }

        /// <summary>
        /// Código de construcción (Primary)
        /// </summary>
        [JsonProperty("codigoConstruccion")]
        public string CodigoConstruccion { get; set; }

        /// <summary>
        /// Fallback properties for backward compatibility during deserialization
        /// </summary>
        [JsonProperty("codigoConstruccion1")]
        private string CodigoConstruccion1Fallback { set { if (string.IsNullOrEmpty(CodigoConstruccion)) CodigoConstruccion = value; } }

        [JsonProperty("codigoContruccion")]
        private string CodigoContruccionFallback { set { if (string.IsNullOrEmpty(CodigoConstruccion)) CodigoConstruccion = value; } }

        [JsonProperty("codigoContruccion1")]
        private string CodigoContruccion1Fallback { set { if (string.IsNullOrEmpty(CodigoConstruccion)) CodigoConstruccion = value; } }

        /// <summary>
        /// Control
        /// </summary>
        public string Control { get; set; }

        /// <summary>
        /// Control inversor
        /// </summary>
        public string ControlInversor { get; set; }

        /// <summary>
        /// Control inversor otro
        /// </summary>
        public string ControlInversorOtro { get; set; }

        /// <summary>
        /// Velocidad de izaje 1
        /// </summary>
        [JsonProperty("velIzaje1")]
        public decimal? VelIzaje1 { get; set; }

        [JsonProperty("velocidadIzaje1")]
        private decimal? VelocidadIzaje1Fallback { set { if (VelIzaje1 == null || VelIzaje1 == 0) VelIzaje1 = value; } }

        /// <summary>
        /// Velocidad de izaje 2
        /// </summary>
        [JsonProperty("velIzaje2")]
        public decimal? VelIzaje2 { get; set; }

        [JsonProperty("velocidadIzaje2")]
        private decimal? VelocidadIzaje2Fallback { set { if (VelIzaje2 == null || VelIzaje2 == 0) VelIzaje2 = value; } }

        /// <summary>
        /// Voltaje de control
        /// </summary>
        public string VoltajeControl { get; set; }

        /// <summary>
        /// Voltaje de control otro
        /// </summary>
        public string VoltajeControlOtro { get; set; }

        /// <summary>
        /// Voltaje de operación
        /// </summary>
        public string VoltajeOperacion { get; set; }

        /// <summary>
        /// Voltaje de operación otro
        /// </summary>
        public string VoltajeOperacionOtro { get; set; }

        /// <summary>
        /// Etiqueta dinámica de voltaje de operación del gancho 1 para Word
        /// </summary>
        public string EtiquetaVoltajeOperacionGancho1 { get; set; }

        /// <summary>
        /// Etiqueta dinámica de voltaje de control del gancho 1 para Word
        /// </summary>
        public string EtiquetaVoltajeControlGancho1 { get; set; }

        /// <summary>
        /// Potencia del motor de izaje
        /// </summary>
        [JsonProperty("potenciaMotorIzaje")]
        public decimal? PotenciaMotorIzaje { get; set; }

        [JsonProperty("potenciaMotorPrincipal1")]
        private decimal? PotenciaMotorPrincipal1Fallback { set { if (PotenciaMotorIzaje == null || PotenciaMotorIzaje == 0) PotenciaMotorIzaje = value; } }

        /// <summary>
        /// Potencia del motor de izaje 2
        /// </summary>
        [JsonProperty("potenciaMotorIzaje2")]
        public decimal? PotenciaMotorIzaje2 { get; set; }

        [JsonProperty("potenciaMotorPrincipal2")]
        private decimal? PotenciaMotorPrincipal2Fallback { set { if (PotenciaMotorIzaje2 == null || PotenciaMotorIzaje2 == 0) PotenciaMotorIzaje2 = value; } }

        /// <summary>
        /// Tipo de freno
        /// </summary>
        public string TipoFreno { get; set; }

        /// <summary>
        /// Clasificación
        /// </summary>
        public string Clasificacion { get; set; }

        /// <summary>
        /// Freno de emergencia
        /// </summary>
        public bool? FrenoEmergencia { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }

        // Eliminados campos redundantesVelocidadIzaje1 y VelocidadIzaje2 ya que se manejan via fallbacks

        /// <summary>
        /// Motor / Modelo (Primary)
        /// </summary>
        [JsonProperty("motorModelo")]
        public string MotorModelo { get; set; }

        /// <summary>
        /// Fallback properties for backward compatibility during deserialization
        /// </summary>
        [JsonProperty("motorModeloGanchoPrincipal")]
        private string MotorModeloGanchoPrincipalFallback { set { if (string.IsNullOrEmpty(MotorModelo)) MotorModelo = value; } }

        [JsonProperty("velocidadIzajeMotorModelo")]
        private string VelocidadIzajeMotorModeloFallback { set { if (string.IsNullOrEmpty(MotorModelo)) MotorModelo = value; } }

        /// <summary>
        /// Freno electrohidráulico
        /// </summary>
        public bool? FrenoElectrohidraulico { get; set; }

        /// <summary>
        /// Freno electromagnético
        /// </summary>
        public bool? FrenoElectromagnetico { get; set; }

        /// <summary>
        /// Freno de seguridad
        /// </summary>
        public bool? FrenoSeguridad { get; set; }

        // Eliminados campos redundantes PotenciaMotorPrincipal1 y PotenciaMotorPrincipal2 ya que se manejan via fallbacks

        /// <summary>
        /// Segundo freno
        /// </summary>
        public bool? SegundoFreno { get; set; }

        /// <summary>
        /// Dispositivo toma carga
        /// </summary>
        public bool? DispositivoTomaCarga { get; set; }

        /// <summary>
        /// Carrete
        /// </summary>
        public bool? Carrete { get; set; }

        /// <summary>
        /// Especifique dispositivo gancho 1
        /// </summary>
        public string EspecifiqueDispositivoGancho1 { get; set; }

        /// <summary>
        /// Especifique dispositivo gancho 2
        /// </summary>
        public string EspecifiqueDispositivoGancho2 { get; set; }

        /// <summary>
        /// Carrete gancho
        /// </summary>
        public string CarreteGancho { get; set; }

        /// <summary>
        /// Intermitencia
        /// </summary>
        [JsonProperty("intermitencia")]
        public string Intermitencia { get; set; }

        /// <summary>
        /// Geometría de ramales
        /// </summary>
        [JsonProperty("geometriaRamales")]
        public string GeometriaRamales { get; set; }

        /// <summary>
        /// Izaje con/sin desplazamiento lateral (True Vertical Lift)
        /// </summary>
        [JsonProperty("izajeConSinDesplazamientoLateral")]
        public string IzajeConSinDesplazamientoLateral { get; set; }
    }
}
