using System.Threading.Tasks;
using PortalGovi.Models;

namespace PortalGovi.Services
{
    /// <summary>
    /// Cliente SAP Business One Service Layer: login fijo (config), POST/PATCH Quotations, búsqueda por DocNum.
    /// </summary>
    public interface ISapServiceLayerQuotationService
    {
        /// <summary>POST Quotations. Devuelve DocEntry y DocNum.</summary>
        Task<SapServiceLayerQuotationResult> CreateQuotationAsync(SapQuotation quotation);

        /// <summary>PATCH Quotations(DocEntry) para reflejar cambios del portal en B1.</summary>
        Task<SapServiceLayerQuotationResult> PatchQuotationAsync(int docEntry, SapQuotation quotation);

        /// <summary>OData: localizar DocEntry por número de documento (DocNum).</summary>
        Task<int?> FindDocEntryByDocNumAsync(int docNum);
    }
}
