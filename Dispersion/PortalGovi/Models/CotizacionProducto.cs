using System;

namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar un producto de cotización
    /// </summary>
    public class CotizacionProducto
    {
        /// <summary>
        /// ID único del producto
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID de la cotización a la que pertenece
        /// </summary>
        public int IdCotizacion { get; set; }

        /// <summary>
        /// Número de artículo
        /// </summary>
        public string NumArticulo { get; set; }

        /// <summary>
        /// Cantidad del producto
        /// </summary>
        public decimal Cantidad { get; set; }

        /// <summary>
        /// Precio de venta
        /// </summary>
        public decimal PrecioVenta { get; set; }

        /// <summary>
        /// Asignado a
        /// </summary>
        public string AsignadoA { get; set; }

        /// <summary>
        /// Definiciones del producto
        /// </summary>
        public string Definiciones { get; set; }

        /// <summary>
        /// Referencia al encabezado de la cotización
        /// </summary>
        public virtual CotizacionEncabezado CotizacionEncabezado { get; set; }
    }
} 