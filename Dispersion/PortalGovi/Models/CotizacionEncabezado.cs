using System;
using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar el encabezado de una cotización
    /// </summary>
    public class CotizacionEncabezado
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        /// <summary>
        /// Tipo de cotización
        /// </summary>
        [JsonProperty("tipoCotizacion")]
        public string TipoCotizacion { get; set; }

        /// <summary>
        /// Tipo de cuenta
        /// </summary>
        [JsonProperty("tipoCuenta")]
        public string TipoCuenta { get; set; }

        /// <summary>
        /// Idioma de la cotización
        /// </summary>
        [JsonProperty("idioma")]
        public string Idioma { get; set; }

        /// <summary>
        /// Cliente
        /// </summary>
        [JsonProperty("cliente")]
        public string Cliente { get; set; }
        [JsonProperty("clienteNombre")]
        public string ClienteNombre { get; set; }

        /// <summary>
        /// Cliente Final
        /// </summary>
        [JsonProperty("clienteFinal")]
        public string ClienteFinal { get; set; }

        /// <summary>
        /// Persona de contacto
        /// </summary>
        [JsonProperty("contacto")]
        public string PersonaContacto { get; set; }

        /// <summary>
        /// Dirección fiscal
        /// </summary>
        [JsonProperty("dirFiscal")]
        public string DireccionFiscal { get; set; }

        /// <summary>
        /// Dirección de entrega
        /// </summary>
        [JsonProperty("dirEntrega")]
        public string DireccionEntrega { get; set; }

        /// <summary>
        /// Referencia
        /// </summary>
        [JsonProperty("referencia")]
        public string Referencia { get; set; }

        /// <summary>
        /// Términos de entrega
        /// </summary>
        [JsonProperty("terminosEntrega")]
        public string TerminosEntrega { get; set; }

        /// <summary>
        /// Folio del portal
        /// </summary>
        [JsonProperty("folioPortal")]
        public string FolioPortal { get; set; }

        /// <summary>
        /// Folio de SAP
        /// </summary>
        [JsonProperty("folioSap")]
        public string FolioSap { get; set; }

        /// <summary>
        /// Fecha de la cotización
        /// </summary>
        [JsonProperty("fecha")]
        public string Fecha { get; set; }

        /// <summary>
        /// Fecha de vencimiento
        /// </summary>
        [JsonProperty("vencimiento")]
        public string Vencimiento { get; set; }

        /// <summary>
        /// Moneda
        /// </summary>
        [JsonProperty("moneda")]
        public string Moneda { get; set; }

        /// <summary>
        /// Usuario que realizó la cotización
        /// </summary>
        [JsonProperty("usuario")]
        public string Usuario { get; set; }

        /// <summary>
        /// Estado de la cotización (Abierto, Validacion Costos, etc.)
        /// </summary>
        [JsonProperty("estado")]
        public string Estado { get; set; }

        /// <summary>
        /// ID del vendedor principal (o el objeto completo para exportación)
        /// </summary>
        [JsonProperty("vendedor")]
        public Vendedor Vendedor { get; set; }

        /// <summary>
        /// ID del vendedor secundario (o el objeto completo para exportación)
        /// </summary>
        [JsonProperty("vendedorSec")]
        public Vendedor VendedorSec { get; set; }

        /// <summary>
        /// Nombre del archivo Excel adjunto para validación de costos
        /// </summary>
        [JsonProperty("archivoCostos")]
        public string ArchivoCostos { get; set; }

        /// <summary>
        /// Ubicación final
        /// </summary>
        [JsonProperty("ubicacionFinal")]
        public string UbicacionFinal { get; set; }
        /// <summary>
        /// Tiempo de entrega
        /// </summary>
        [JsonProperty("tiempoEntrega")]
        public string TiempoEntrega { get; set; }

        /// <summary>
        /// Total de la cotización (suma de conceptos)
        /// </summary>
        [JsonProperty("total")]
        public decimal Total { get; set; }
    }
}
