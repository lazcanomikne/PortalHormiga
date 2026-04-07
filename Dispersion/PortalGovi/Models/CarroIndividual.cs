using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un carro individual
    /// </summary>
    public class CarroIndividual
    {
        /// <summary>
        /// Control del carro
        /// </summary>
        public string Control { get; set; }

        /// <summary>
        /// Tipo de inversor
        /// </summary>
        public string TipoInversor { get; set; }

        /// <summary>
        /// Velocidad de traslación
        /// </summary>
        public string VelocidadTraslacion { get; set; }

        /// <summary>
        /// Especifique velocidad de traslación
        /// </summary>
        public string EspecifiqueVelocidadTraslacion { get; set; }

        /// <summary>
        /// Interruptor final de carrera
        /// </summary>
        public string InterruptorFinalCarrera { get; set; }

        /// <summary>
        /// Especifique marca modelo interruptor
        /// </summary>
        public string EspecifiqueMarcaModeloInterruptor { get; set; }

        /// <summary>
        /// Cantidad de ruedas de traslación
        /// </summary>
        public int? CantidadRuedasTraslacion { get; set; }

        /// <summary>
        /// Diámetro de ruedas
        /// </summary>
        public decimal? DiametroRuedas { get; set; }

        /// <summary>
        /// Cantidad tipo rueda motriz A
        /// </summary>
        public int? CantidadTipoRuedaMotrizA { get; set; }

        /// <summary>
        /// Tipo rueda motriz A
        /// </summary>
        public string TipoRuedaMotrizA { get; set; }

        /// <summary>
        /// Cantidad tipo rueda conducida MA
        /// </summary>
        public int? CantidadTipoRuedaConducidaMA { get; set; }

        /// <summary>
        /// Tipo rueda conducida MA
        /// </summary>
        public string TipoRuedaConducidaMA { get; set; }

        /// <summary>
        /// Cantidad tipo rueda loca NA
        /// </summary>
        public int? CantidadTipoRuedaLocaNA { get; set; }

        /// <summary>
        /// Tipo rueda loca NA
        /// </summary>
        public string TipoRuedaLocaNA { get; set; }

        /// <summary>
        /// Material de ruedas
        /// </summary>
        public string MaterialRuedas { get; set; }

        /// <summary>
        /// Modelo motorreductor
        /// </summary>
        public string MotorreductorModelo { get; set; }

        /// <summary>
        /// Reductor
        /// </summary>
        public string Reductor { get; set; }

        /// <summary>
        /// Modelo motor
        /// </summary>
        [JsonProperty("motorModelo")]
        public string MotorModelo { get; set; }

        /// <summary>
        /// Potencia motor 1 (Kw)
        /// </summary>
        public decimal? MotorPotencia1 { get; set; }

        /// <summary>
        /// Potencia motor 2 (Kw)
        /// </summary>
        public decimal? MotorPotencia2 { get; set; }
        
        /// <summary>
        /// Velocidad carro 1 (m/min)
        /// </summary>
        public decimal? Velocidad1 { get; set; }

        /// <summary>
        /// Velocidad carro 2 (m/min)
        /// </summary>
        public decimal? Velocidad2 { get; set; }

        /// <summary>
        /// Tope hidráulico
        /// </summary>
        public bool? TopeHidraulico { get; set; }

        /// <summary>
        /// Tope celulosa
        /// </summary>
        public bool? TopeCelulosa { get; set; }

        /// <summary>
        /// Freno electrohidráulico
        /// </summary>
        public bool? FrenoElectrohidraulico { get; set; }

        /// <summary>
        /// Plataforma
        /// </summary>
        public bool? Plataforma { get; set; }

        /// <summary>
        /// Observaciones plataforma
        /// </summary>
        public string ObservacionesPlataforma { get; set; }

        /// <summary>
        /// Observaciones generales
        /// </summary>
        public string Observaciones { get; set; }

        /// <summary>
        /// Etiqueta dinámica de tope hidráulico para Word
        /// </summary>
        public string EtiquetaTopeHidraulicoCarro { get; set; }
    }
}
