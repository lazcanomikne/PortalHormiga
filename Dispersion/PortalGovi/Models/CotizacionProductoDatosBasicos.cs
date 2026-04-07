using System.Collections.Generic;
using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar los datos básicos de un producto de cotización
    /// </summary>
    public class CotizacionProductoDatosBasicos
    {
        /// <summary>
        /// ID único de los datos básicos
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Capacidad de la grúa
        /// </summary>
        public decimal? CapacidadGrua { get; set; }

        /// <summary>
        /// Capacidad nivel grúa accesorios
        /// </summary>
        public decimal? CapacidadNivelGruaAccesorios { get; set; }

        /// <summary>
        /// Claro
        /// </summary>
        public decimal? Claro { get; set; }

        /// <summary>
        /// Clasificación de puentes
        /// </summary>
        public string ClasificacionPuentes { get; set; }

        /// <summary>
        /// Izaje
        /// </summary>
        public decimal? Izaje { get; set; }

        /// <summary>
        /// Clase de elevación
        /// </summary>
        public string ClaseElevacion { get; set; }

        /// <summary>
        /// Cantidad de ganchos
        /// </summary>
        public int? CantidadGanchos { get; set; }

        /// <summary>
        /// Lista de ganchos
        /// </summary>
        public List<Gancho> Ganchos { get; set; } = new List<Gancho>();

        /// <summary>
        /// Longitud de recorrido
        /// </summary>
        public decimal? LongitudRecorrido { get; set; }

        /// <summary>
        /// Peso muerto de la grúa
        /// </summary>
        public decimal? PesoMuertoGrua { get; set; }

        /// <summary>
        /// Carga máxima de rueda
        /// </summary>
        public decimal? CargaMaximaRueda { get; set; }

        /// <summary>
        /// Reacción máxima por rueda
        /// </summary>
        [JsonProperty("reaccionMaximaRueda")]
        public string ReaccionMaximaRueda { get; set; }

        /// <summary>
        /// Grúa con plataforma
        /// </summary>
        public bool? GruaConPlataforma { get; set; }

        /// <summary>
        /// Observaciones plataforma
        /// </summary>
        public string ObservacionesPlataforma { get; set; }

        /// <summary>
        /// Lista de controles
        /// </summary>
        public List<CotizacionProductoControl> Controles { get; set; } = new List<CotizacionProductoControl>();

        /// <summary>
        /// Voltaje de operación
        /// </summary>
        public string VoltajeOperacion { get; set; }

        /// <summary>
        /// Voltaje de operación otro
        /// </summary>
        public string VoltajeOperacionOtro { get; set; }

        /// <summary>
        /// Voltaje de control
        /// </summary>
        public string VoltajeControl { get; set; }

        /// <summary>
        /// Voltaje de control otro
        /// </summary>
        public string VoltajeControlOtro { get; set; }

        /// <summary>
        /// Observaciones datos básicos control
        /// </summary>
        public string ObsDatosBasicosControl { get; set; }

        /// <summary>
        /// Equivalente FEM
        /// </summary>
        public string EquivalenteFem { get; set; }

        /// <summary>
        /// Valor equivalente FEM
        /// </summary>
        public string EquivalenteFemValue { get; set; }

        /// <summary>
        /// Deflexión
        /// </summary>
        public string Deflexion { get; set; }

        /// <summary>
        /// Observaciones clasificación
        /// </summary>
        public string ObsClasificacion { get; set; }

        /// <summary>
        /// Tipo de pintura
        /// </summary>
        public string TipoPintura { get; set; }

        /// <summary>
        /// Color de pintura
        /// </summary>
        public string ColorPintura { get; set; }

        /// <summary>
        /// Ambiente
        /// </summary>
        public string Ambiente { get; set; }

        /// <summary>
        /// Ambiente otro
        /// </summary>
        public string AmbienteOtro { get; set; }

        /// <summary>
        /// Capacidad de la(s) grúa(s) en kg
        /// </summary>
        public decimal? CapacidadGruas { get; set; }

        /// <summary>
        /// Etiqueta dinámica de capacidad en toneladas para Word
        /// </summary>
        public decimal? EtiquetaCapacidadToneladas { get; set; }

        /// <summary>
        /// Etiqueta dinámica de izaje para Word
        /// </summary>
        public decimal? EtiquetaIzaje { get; set; }

        /// <summary>
        /// Etiqueta dinámica de clasificación completa para Word
        /// </summary>
        public string EtiquetaClasificacionCompleta { get; set; }

        /// <summary>
        /// Tipo de grúa
        /// </summary>
        public string TipoGrua { get; set; }

        /// <summary>
        /// Dispositivo toma carga
        /// </summary>
        public bool? DispositivoTomaCarga { get; set; }

        /// <summary>
        /// Carrete retráctil
        /// </summary>
        public bool? CarreteRetractil { get; set; }

        /// <summary>
        /// Torreta
        /// </summary>
        public bool? Torreta { get; set; }

        /// <summary>
        /// Tipo torreta
        /// </summary>
        public string TipoTorreta { get; set; }

        /// <summary>
        /// Especifique torreta especial
        /// </summary>
        public string EspecifiqueTorretaEspecial { get; set; }

        /// <summary>
        /// Sirena
        /// </summary>
        public bool? Sirena { get; set; }

        /// <summary>
        /// Tipo sirena
        /// </summary>
        public string TipoSirena { get; set; }

        /// <summary>
        /// Especifique sirena especial
        /// </summary>
        public string EspecifiqueSirenaEspecial { get; set; }

        /// <summary>
        /// Luminarias
        /// </summary>
        public bool? Luminarias { get; set; }

        /// <summary>
        /// Tipo luminarias
        /// </summary>
        public string TipoLuminarias { get; set; }

        /// <summary>
        /// Cantidad luminarias
        /// </summary>
        public int? CantidadLuminarias { get; set; }

        /// <summary>
        /// Tipo de ensayos no destructivos
        /// </summary>
        public string TipoEnsayosNoDestructivos { get; set; }

        /// <summary>
        /// Protección gabinete eléctrico
        /// </summary>
        public string ProteccionGabineteEletrico { get; set; }

        /// <summary>
        /// Curso mantenimiento
        /// </summary>
        public bool? CursoMantenimiento { get; set; }

        /// <summary>
        /// Cantidad horas curso
        /// </summary>
        public int? CantidadHorasCurso { get; set; }

        /// <summary>
        /// Lubricante central
        /// </summary>
        public bool? LubricanteCentral { get; set; }

        /// <summary>
        /// Equipo eléctrico climatizado
        /// </summary>
        public bool? EquipoEletricoClimatizado { get; set; }

        /// <summary>
        /// Obras de luminarias
        /// </summary>
        public string ObrLuminarias { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }

        /// <summary>
        /// Especifique área de trabajo
        /// </summary>
        [JsonProperty("especifiqueAreaTrabajoProducto")]
        public string EspecifiqueAreaTrabajoProducto { get; set; }

        /// <summary>
        /// Especifique área de trabajo otro
        /// </summary>
        [JsonProperty("especifiqueAreaTrabajoProductoOtro")]
        public string EspecifiqueAreaTrabajoProductoOtro { get; set; }

        // Campos para KBK y Grúa Giratoria
        [JsonProperty("tensionServicio")]
        public string TensionServicio { get; set; }

        [JsonProperty("frecuencia")]
        public string Frecuencia { get; set; }

        [JsonProperty("tipoCorriente")]
        public string TipoCorriente { get; set; }

        [JsonProperty("ejecucion")]
        public string Ejecucion { get; set; }

        [JsonProperty("numGruaVia")]
        public string NumGruaVia { get; set; }

        [JsonProperty("gruasIguales")]
        public bool? GruasIguales { get; set; }

        [JsonProperty("longitudBrazo")]
        public string LongitudBrazo { get; set; }

        [JsonProperty("longitudBrazoValor")]
        public decimal? LongitudBrazoValor { get; set; }



        [JsonProperty("ubicacionInstalacion")]
        public string UbicacionInstalacion { get; set; }

        [JsonProperty("carga")]
        public decimal? Carga { get; set; }

        [JsonProperty("dispositivoElevacion")]
        public string DispositivoElevacion { get; set; }

        [JsonProperty("codigoConstruccion")]
        public string CodigoConstruccion { get; set; }

        [JsonProperty("tipoCarro")]
        public string TipoCarro { get; set; }

        [JsonProperty("tipoBrazo")]
        public string TipoBrazo { get; set; }

        [JsonProperty("anclajeConcreto")]
        public string AnclajeConcreto { get; set; }

        [JsonProperty("rangoGiro")]
        public string RangoGiro { get; set; }

        [JsonProperty("tipoGiro")]
        public string TipoGiro { get; set; }

        [JsonProperty("altura")]
        public decimal? Altura { get; set; }

        [JsonProperty("plumaBordeInferior")]
        public decimal? PlumaBordeInferior { get; set; }

        [JsonProperty("posicionMasAltaGancho")]
        public decimal? PosicionMasAltaGancho { get; set; }

        /// <summary>
        /// Etiqueta dinámica de clasificación de grúa para Word
        /// </summary>
        [JsonProperty("etiquetaClasificacionGrua")]
        public string EtiquetaClasificacionGrua { get; set; }
    }
}
