using System;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar la formación de precios global de una cotización
    /// </summary>
    public class FormacionPreciosGlobal
    {
        /// <summary>
        /// ID único
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID del artículo
        /// </summary>
        public int IdArticulo { get; set; }

        /// <summary>
        /// Precio base
        /// </summary>
        public decimal PrecioBase { get; set; }

        /// <summary>
        /// Descuento
        /// </summary>
        public decimal Descuento { get; set; }

        /// <summary>
        /// Precio final
        /// </summary>
        public decimal PrecioFinal { get; set; }

        /// <summary>
        /// Moneda
        /// </summary>
        public string Moneda { get; set; }

        /// <summary>
        /// Fecha de vigencia
        /// </summary>
        public DateTime? FechaVigencia { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }

        /// <summary>
        /// Condiciones de pago
        /// </summary>
        public string CondicionesPago { get; set; }

        /// <summary>
        /// Plazo de entrega
        /// </summary>
        public string PlazoEntrega { get; set; }

        /// <summary>
        /// Garantía
        /// </summary>
        public string Garantia { get; set; }

        /// <summary>
        /// Términos comerciales
        /// </summary>
        public string TerminosComerciales { get; set; }

        /// <summary>
        /// Plazo de pago
        /// </summary>
        public string PlazoPago { get; set; }

        /// <summary>
        /// Plazo de pago otro
        /// </summary>
        public string PlazoPagoOtro { get; set; }

        /// <summary>
        /// Cantidad de eventos de pago
        /// </summary>
        public int CantEvePago { get; set; }

        /// <summary>
        /// Cliente requiere fianza
        /// </summary>
        public string CliReqFianza { get; set; }

        /// <summary>
        /// Tipo de fianza 1
        /// </summary>
        public string TipoFianza1 { get; set; }

        /// <summary>
        /// Tipo de fianza 2
        /// </summary>
        public string TipoFianza2 { get; set; }

        /// <summary>
        /// Tipo de fianza 3
        /// </summary>
        public string TipoFianza3 { get; set; }

        /// <summary>
        /// Tipo de fianza 4
        /// </summary>
        public string TipoFianza4 { get; set; }

        /// <summary>
        /// Agente
        /// </summary>
        public string Agente { get; set; }

        /// <summary>
        /// Broker cliente
        /// </summary>
        public string BrokerCliente { get; set; }

        /// <summary>
        /// Aplica penalización
        /// </summary>
        public bool AplicaPenal { get; set; }

        /// <summary>
        /// Penalización
        /// </summary>
        public string Penalizacion { get; set; }

        /// <summary>
        /// Seguro de responsabilidad civil
        /// </summary>
        public bool SeguroRespCivil { get; set; }

        /// <summary>
        /// Definido por
        /// </summary>
        public string DefinidoPor { get; set; }

        /// <summary>
        /// Aseguradora
        /// </summary>
        public string Aseguradora { get; set; }

        /// <summary>
        /// Monto del seguro
        /// </summary>
        public decimal MontoSeguro { get; set; }

        /// <summary>
        /// Tiempo de garantía
        /// </summary>
        public string TiempoGarantia { get; set; }

        /// <summary>
        /// Dosier
        /// </summary>
        public bool Dosier { get; set; }

        /// <summary>
        /// Tipo de factura
        /// </summary>
        public string TipoFactura { get; set; }

        /// <summary>
        /// Especificación del cliente
        /// </summary>
        public string EspecificacionCliente { get; set; }

        /// <summary>
        /// Tipo de cotización
        /// </summary>
        public string TipoCotizacion { get; set; }

        /// <summary>
        /// Observaciones de formación de precios
        /// </summary>
        public string ObservacionesFP { get; set; }
    }
}
