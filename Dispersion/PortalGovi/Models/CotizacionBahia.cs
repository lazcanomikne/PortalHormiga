namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar una bahía de cotización
    /// </summary>
    public class CotizacionBahia
    {
        /// <summary>
        /// ID único de la bahía
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID de la cotización a la que pertenece
        /// </summary>
        public int IdCotizacion { get; set; }

        /// <summary>
        /// Nombre de la bahía
        /// </summary>
        public string Bahia { get; set; }

        /// <summary>
        /// Descripción de la bahía
        /// </summary>
        public string Descripcion { get; set; }

        /// <summary>
        /// Alimentación de la bahía
        /// </summary>
        public string Alimentacion { get; set; }

        /// <summary>
        /// Riel de la bahía
        /// </summary>
        public string Riel { get; set; }

        /// <summary>
        /// Estructura de la bahía
        /// </summary>
        public string Estructura { get; set; }

        /// <summary>
        /// Definiciones de la bahía
        /// </summary>
        public string Definiciones { get; set; }

        /// <summary>
        /// Referencia al encabezado de la cotización
        /// </summary>
        public virtual CotizacionEncabezado CotizacionEncabezado { get; set; }
    }
}