using System.Collections.Generic;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo completo de cotización que incluye encabezado, productos, bahías y conceptos
    /// </summary>
    public class CotizacionCompleta
    {
        /// <summary>
        /// Encabezado de la cotización
        /// </summary>
        public CotizacionEncabezado Encabezado { get; set; }

        /// <summary>
        /// Lista de productos de la cotización
        /// </summary>
        public List<ProductoBasico> Productos { get; set; } = new List<ProductoBasico>();

        /// <summary>
        /// Lista de bahías de la cotización
        /// </summary>
        public List<BahiaBasica> Bahias { get; set; } = new List<BahiaBasica>();

        /// <summary>
        /// Lista de conceptos de la cotización
        /// </summary>
        public List<ConceptoPrecio> Conceptos { get; set; } = new List<ConceptoPrecio>();

        /// <summary>
        /// Resumen financiero de la cotización
        /// </summary>
        public CotizacionResumen Resumen { get; set; }

        /// <summary>
        /// Metadatos de la cotización
        /// </summary>
        public CotizacionMetadata Metadata { get; set; }

        /// <summary>
        /// Formación de precios global
        /// </summary>
        public FormacionPreciosGlobal FormacionPreciosGlobal { get; set; }

        /// <summary>
        /// Configuraciones globales
        /// </summary>
        public ConfiguracionesGlobales ConfiguracionesGlobales { get; set; }
    }
}
