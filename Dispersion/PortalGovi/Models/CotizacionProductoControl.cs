namespace PortalGovi.Models
{
    /// <summary>
    /// Modelo para representar los controles de un producto de cotización
    /// </summary>
    public class CotizacionProductoControl
    {
        /// <summary>
        /// ID único del control
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Tipo de control
        /// </summary>
        public string TipoControl { get; set; }

        /// <summary>
        /// Medio de control
        /// </summary>
        public string MedioControl { get; set; }

        /// <summary>
        /// Funciones de cabina
        /// </summary>
        public string FuncionesCabina { get; set; }

        /// <summary>
        /// Tipo de cabina
        /// </summary>
        public string TipoCabina { get; set; }

        /// <summary>
        /// Características técnicas de cabina
        /// </summary>
        public string CaracteristicasTecnicasCabina { get; set; }

        /// <summary>
        /// Funciones de automatización
        /// </summary>
        public string FuncionesAutomatizacion { get; set; }

        /// <summary>
        /// Funciones de semiautomatización
        /// </summary>
        public string FuncionesSemiautomatizacion { get; set; }

        /// <summary>
        /// Marca y modelo del PLC
        /// </summary>
        public string MarcaModeloPLC { get; set; }

        /// <summary>
        /// Marca y modelo del HMI
        /// </summary>
        public string MarcaModeloHMI { get; set; }

        /// <summary>
        /// Fabricante y modelo
        /// </summary>
        public string FabricanteModelo { get; set; }

        /// <summary>
        /// Observaciones
        /// </summary>
        public string Observaciones { get; set; }
    }
}
