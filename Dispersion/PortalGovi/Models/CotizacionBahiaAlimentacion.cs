namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la alimentación de una bahía de cotización
    /// </summary>
    public class CotizacionBahiaAlimentacion
    {
        /// <summary>
        /// ID único de la alimentación
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID de la bahía de cotización
        /// </summary>
        public int IdCotizacionBahia { get; set; }

        /// <summary>
        /// Alimentación eléctrica a lo largo de la nave
        /// </summary>
        public bool? AliEleLarNave { get; set; }

        /// <summary>
        /// Longitud del sistema
        /// </summary>
        public decimal? LongitudSistema { get; set; }

        /// <summary>
        /// Acometidas eléctricas
        /// </summary>
        public int? AcomElec { get; set; }

        /// <summary>
        /// Localización de acometida
        /// </summary>
        public string LocalAcometida { get; set; }

        /// <summary>
        /// Localización de acometida otro
        /// </summary>
        public string LocalAcometidaOtro { get; set; }

        /// <summary>
        /// Amperaje
        /// </summary>
        public decimal? Amperaje { get; set; }

        /// <summary>
        /// Temperatura
        /// </summary>
        public string Temperatura { get; set; }

        /// <summary>
        /// Temperatura otro
        /// </summary>
        public string TemperaturaOtro { get; set; }

        /// <summary>
        /// Adecuada para alimentar
        /// </summary>
        public string AdecuadaAlimentar { get; set; }

        /// <summary>
        /// Interruptor general
        /// </summary>
        public bool? InterruptorGeneral { get; set; }

        /// <summary>
        /// Tipo de alimentación
        /// </summary>
        public string TipoAlimentacion { get; set; }

        /// <summary>
        /// Tipo de alimentación otro
        /// </summary>
        public string TipoAlimOtro { get; set; }

        /// <summary>
        /// Especifique área de trabajo
        /// </summary>
        public string EspecifiqueAreaTrabajo { get; set; }

        /// <summary>
        /// Especifique sistema de alimentación
        /// </summary>
        public string EspecifiqueSistemaAlimentacion { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}