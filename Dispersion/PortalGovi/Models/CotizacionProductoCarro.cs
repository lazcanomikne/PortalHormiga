using System.Collections.Generic;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el carro de un producto de cotización
    /// </summary>
    public class CotizacionProductoCarro
    {
        /// <summary>
        /// ID único del carro
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del producto de cotización
        /// </summary>
        public int IdCotizacionProducto { get; set; }

        /// <summary>
        /// Cantidad de carros
        /// </summary>
        public int? CantidadCarros { get; set; }

        /// <summary>
        /// Control simultáneo/independiente
        /// </summary>
        public string ControlSimultaneoIndependiente { get; set; }

        /// <summary>
        /// Switch límite 2 pasos izquierdo
        /// </summary>
        public bool? SwitchLimite2PasosIzquierdo { get; set; }

        /// <summary>
        /// Interruptor límite 2 pasos derechos
        /// </summary>
        public bool? InterruptorLimite2PasosDerechos { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }

        /// <summary>
        /// Etiqueta dinámica de velocidad de carro para Word
        /// </summary>
        public string EtiquetaVelocidadCarro { get; set; }

        /// <summary>
        /// Etiqueta dinámica de reductor carro 1 para Word
        /// </summary>
        public string EtiquetaReductorCarro1 { get; set; }

        /// <summary>
        /// Etiqueta dinámica de motor modelo carro 1 para Word
        /// </summary>
        public string EtiquetaMotorModeloCarro1 { get; set; }

        /// <summary>
        /// Etiqueta dinámica de potencia carro 1 para Word
        /// </summary>
        public string EtiquetaPotenciaCarro1 { get; set; }

        /// <summary>
        /// Array de carros individuales
        /// </summary>
        public List<CarroIndividual> Carros { get; set; } = new List<CarroIndividual>();
    }
}
