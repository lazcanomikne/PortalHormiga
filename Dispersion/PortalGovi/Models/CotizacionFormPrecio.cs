using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PortalGovi.Models
{
    public class CotizacionFormPrecio
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
        /// Tipo de cuenta
        /// </summary>
        public string Concepto { get; set; }

        /// <summary>
        /// Idioma de la cotización
        /// </summary>
        public string Descripcion { get; set; }

        /// <summary>
        /// Cantidad del producto
        /// </summary>
        public decimal Cantidad { get; set; }

        /// <summary>
        /// Precio de venta
        /// </summary>
        public decimal PrecioUnit { get; set; }
        
        /// <summary>
        /// Precio de venta
        /// </summary>
        public decimal Total { get; set; }

    }
}
