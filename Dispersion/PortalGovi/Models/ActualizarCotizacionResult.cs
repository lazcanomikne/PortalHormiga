namespace PortalGovi.Models
{
    /// <summary>Resultado de PUT cotización: guardado MIKNE + intento de sincronización SAP.</summary>
    public class ActualizarCotizacionResult
    {
        public bool GuardadoEnMikne { get; set; }
        /// <summary>Error de SAP (null si OK o no aplica).</summary>
        public string SapError { get; set; }
        /// <summary>Folio mostrado (p. ej. con prefijo de serie).</summary>
        public string FolioSap { get; set; }
        /// <summary>Clave interna B1 para PATCH posteriores.</summary>
        public int? SapDocEntry { get; set; }
    }
}
