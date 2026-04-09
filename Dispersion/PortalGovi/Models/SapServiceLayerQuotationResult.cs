namespace PortalGovi.Models
{
    /// <summary>Respuesta mínima tras crear o actualizar una cotización en SAP Service Layer.</summary>
    public class SapServiceLayerQuotationResult
    {
        public int DocEntry { get; set; }
        public string DocNum { get; set; }
    }
}
