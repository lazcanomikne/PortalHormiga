namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el puente de un producto de cotización
    /// </summary>
    public class CotizacionProductoPuente
    {
        /// <summary>
        /// ID único del puente
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Control del puente
        /// </summary>
        public string ControlPuente { get; set; }

        /// <summary>
        /// Tipo de inversor
        /// </summary>
        public string TipoInversor { get; set; }

        /// <summary>
        /// Velocidad de traslación del puente
        /// </summary>
        public string VelocidadTraslacionPuente { get; set; }

        /// <summary>
        /// Especifique velocidad de traslación del puente
        /// </summary>
        public string EspecifiqueVelocidadTraslacionPuente { get; set; }

        /// <summary>
        /// Velocidad puente 1 (m/min)
        /// </summary>
        public decimal? Velocidad1 { get; set; }

        /// <summary>
        /// Velocidad puente 2 (m/min)
        /// </summary>
        public decimal? Velocidad2 { get; set; }

        /// <summary>
        /// Etiqueta dinámica de velocidad de puente para Word
        /// </summary>
        public string EtiquetaVelocidadPuente { get; set; }

        /// <summary>
        /// Etiqueta dinámica de diámetro de ruedas del puente para Word
        /// </summary>
        public string EtiquetaDiametroRuedasPuente { get; set; }

        /// <summary>
        /// Etiqueta dinámica de total de ruedas del puente para Word
        /// </summary>
        public string EtiquetaTotalRuedasPuente { get; set; }

        /// <summary>
        /// Etiqueta dinámica de motor modelo del puente para Word
        /// </summary>
        public string EtiquetaMotorModeloPuente { get; set; }

        /// <summary>
        /// Etiqueta dinámica de potencia del motor del puente para Word
        /// </summary>
        public string EtiquetaPotenciaPuente { get; set; }

        /// <summary>
        /// Etiqueta dinámica de interruptor límite del puente para Word
        /// </summary>
        public string EtiquetaInterruptorLimitePuente { get; set; }

        /// <summary>
        /// Etiqueta dinámica de sistema interruptor + anticolisión para Word
        /// </summary>
        public string EtiquetaSistemaInterruptorAnticolision { get; set; }

        /// <summary>
        /// Etiqueta dinámica de sistema anticolisión en ambas direcciones para Word
        /// </summary>
        public string EtiquetaSistemaAnticolisionAmbos { get; set; }

        /// <summary>
        /// Ruedas motrices
        /// </summary>
        public RuedasMotrices RuedasMotrices { get; set; }

        /// <summary>
        /// Ruedas locas
        /// </summary>
        public RuedasLocas RuedasLocas { get; set; }

        /// <summary>
        /// Cantidad de motorreductores
        /// </summary>
        public int? CantidadMotorreductores { get; set; }

        /// <summary>
        /// Modelo del motorreductor
        /// </summary>
        public string MotorreductorModelo { get; set; }

        /// <summary>
        /// Modelo del motorreductor otro
        /// </summary>
        public string MotorreductorModeloOtro { get; set; }

        /// <summary>
        /// Reductor
        /// </summary>
        public string Reductor { get; set; }

        /// <summary>
        /// Modelo del motor del puente
        /// </summary>
        public string MotorModeloPuente { get; set; }

        /// <summary>
        /// Potencia del motor Kw 1
        /// </summary>
        public decimal? MotorPotenciaKw1 { get; set; }

        /// <summary>
        /// Potencia del motor Kw 2
        /// </summary>
        public decimal? MotorPotenciaKw2 { get; set; }

        /// <summary>
        /// Switch límite final carrera delantero
        /// </summary>
        public bool? SwitchLimFinCarrDel { get; set; }

        /// <summary>
        /// Interruptor límite final carrera trasero
        /// </summary>
        public bool? InterLimFinCarrTras { get; set; }

        /// <summary>
        /// Sistema anticolisión delantero
        /// </summary>
        public bool? SisAnticolisionDel { get; set; }

        /// <summary>
        /// Sistema anticolisión trasero
        /// </summary>
        public bool? SisAnticolisionTras { get; set; }

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
        /// Tipo de alimentación
        /// </summary>
        public string TipoAlimentacion { get; set; }

        /// <summary>
        /// Especifique tipo de alimentación
        /// </summary>
        public string EspecifiqueTipoAlimentacion { get; set; }

        /// <summary>
        /// Especifique sistema de alimentación
        /// </summary>
        public string EspecifiqueSistemaAlimentacion { get; set; }

        /// <summary>
        /// Especifique sistema de alimentación otro
        /// </summary>
        public string EspecifiqueSistemaAlimentacionOtro { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }

        /// <summary>
        /// Etiqueta dinámica de tope hidráulico para Word
        /// </summary>
        public string EtiquetaTopeHidraulicoPuente { get; set; }
    }
}