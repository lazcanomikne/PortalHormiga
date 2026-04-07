using System.Collections.Generic;
using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el izaje de un producto de cotización
    /// </summary>
    public class CotizacionProductoIzaje
    {
        /// <summary>
        /// ID único del izaje
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Cantidad de polipastos
        /// </summary>
        public int? CantidadPolipastos { get; set; }

        /// <summary>
        /// Lista de polipastos
        /// </summary>
        public List<CotizacionProductoPolipasto> Polipastos { get; set; } = new List<CotizacionProductoPolipasto>();

        /// <summary>
        /// Sumador de carga
        /// </summary>
        public bool? SumadorCarga { get; set; }

        /// <summary>
        /// Dispositivo de medición de sobrecarga
        /// </summary>
        public string DispositivoMedicionSobrecarga { get; set; }

        /// <summary>
        /// Observación de izaje
        /// </summary>
        public string ObservacionIzaje { get; set; }

        /// <summary>
        /// Array de tipos de polipasto
        /// </summary>
        public string[] TipoPolipasto { get; set; }

        /// <summary>
        /// Simultáneo
        /// </summary>
        [JsonProperty("simultaneo")]
        public bool? Simultaneo { get; set; }

        /// <summary>
        /// Independiente
        /// </summary>
        [JsonProperty("independiente")]
        public bool? Independiente { get; set; }

        /// <summary>
        /// Síncrono
        /// </summary>
        [JsonProperty("sincrono")]
        public bool? Sincrono { get; set; }

        /// <summary>
        /// Etiqueta dinámica de alturas de izaje para Word
        /// </summary>
        [JsonProperty("etiquetaAlturasIzaje")]
        public string EtiquetaAlturasIzaje { get; set; }

        /// <summary>
        /// Etiqueta dinámica de velocidad de izaje para Word
        /// </summary>
        [JsonProperty("etiquetaVelocidadIzaje")]
        public string EtiquetaVelocidadIzaje { get; set; }

        /// <summary>
        /// Etiqueta dinámica de freno de emergencia para Word
        /// </summary>
        [JsonProperty("etiquetaFrenoEmergencia")]
        public string EtiquetaFrenoEmergencia { get; set; }

        /// <summary>
        /// Etiqueta dinámica de segundo freno de emergencia para Word
        /// </summary>
        [JsonProperty("etiquetaFrenoEmergenciaSegundo")]
        public string EtiquetaFrenoEmergenciaSegundo { get; set; }
    }
}
