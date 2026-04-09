namespace PortalGovi.Models
{
    /// <summary>
    /// Resultado de crear cotización en MIKNE y opcionalmente en SAP Service Layer.
    /// </summary>
    public class CrearCotizacionSapResult
    {
        public int Id { get; set; }
        public string FolioPortal { get; set; }
        public string DocNum { get; set; }
        /// <summary>DocEntry en SAP B1 (para PATCH en siguientes guardados).</summary>
        public int? SapDocEntry { get; set; }
        public string SapError { get; set; }
        /// <summary>Error al persistir en MIKNE (HANA) antes de intentar SAP.</summary>
        public string DbError { get; set; }
    }
}
