using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PortalGovi.Models;

namespace PortalGovi.Services
{
    /// <summary>
    /// POST/PATCH <c>/b1s/v1/Quotations</c> tras login en Service Layer.
    /// </summary>
    public class SapServiceLayerQuotationService : ISapServiceLayerQuotationService
    {
        private static readonly JsonSerializerSettings QuotationJsonSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore
        };

        private readonly IConfiguration _configuration;

        public SapServiceLayerQuotationService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <inheritdoc />
        public async Task<SapServiceLayerQuotationResult> CreateQuotationAsync(SapQuotation quotation)
        {
            if (quotation == null)
                throw new ArgumentNullException(nameof(quotation));

            return await WithSessionAsync(async (httpClient, apiSapUrl) =>
            {
                var sapJson = JsonConvert.SerializeObject(quotation, QuotationJsonSettings);
                var content = new StringContent(sapJson, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync($"{apiSapUrl}Quotations", content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new Exception($"Error de SAP ({(int)response.StatusCode}): {responseBody}");

                var created = ParseSlQuotationResult(responseBody);
                if (string.IsNullOrEmpty(created.DocNum))
                    throw new Exception($"SAP respondió sin DocNum: {responseBody}");
                return created;
            });
        }

        /// <inheritdoc />
        public async Task<SapServiceLayerQuotationResult> PatchQuotationAsync(int docEntry, SapQuotation quotation)
        {
            if (quotation == null)
                throw new ArgumentNullException(nameof(quotation));

            return await WithSessionAsync(async (httpClient, apiSapUrl) =>
            {
                var sapJson = JsonConvert.SerializeObject(quotation, QuotationJsonSettings);
                var content = new StringContent(sapJson, Encoding.UTF8, "application/json");
                var request = new HttpRequestMessage(new HttpMethod("PATCH"), $"{apiSapUrl}Quotations({docEntry})")
                {
                    Content = content
                };
                var response = await httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new Exception($"Error de SAP PATCH ({(int)response.StatusCode}): {responseBody}");

                if (string.IsNullOrWhiteSpace(responseBody))
                {
                    return new SapServiceLayerQuotationResult
                    {
                        DocEntry = docEntry,
                        DocNum = null
                    };
                }

                return ParseSlQuotationResult(responseBody);
            });
        }

        /// <inheritdoc />
        public async Task<int?> FindDocEntryByDocNumAsync(int docNum)
        {
            return await WithSessionAsync<int?>(async (httpClient, apiSapUrl) =>
            {
                var filter = Uri.EscapeDataString($"DocNum eq {docNum}");
                var url = $"{apiSapUrl}Quotations?$filter={filter}&$select=DocEntry,DocNum&$top=1";
                var response = await httpClient.GetAsync(url);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return null;

                var jo = JObject.Parse(responseBody);
                var first = jo["value"] is JArray arr && arr.Count > 0 ? arr[0] : null;
                if (first == null)
                    return null;

                var de = first["DocEntry"] ?? first["docEntry"];
                if (de == null || de.Type == JTokenType.Null)
                    return null;
                return de.Value<int>();
            });
        }

        private async Task<T> WithSessionAsync<T>(Func<HttpClient, string, Task<T>> action)
        {
            var companyDb = _configuration["SapServiceLayer:CompanyDB"]
                            ?? _configuration["UserData:CompanyDB"]
                            ?? "DESARROLLO_GRUAS";
            var userName = _configuration["SapServiceLayer:UserName"]
                           ?? _configuration["UserData:u_User"]
                           ?? "manager";
            var password = _configuration["SapServiceLayer:Password"]
                           ?? _configuration["UserData:u_Pass"]
                           ?? "";

            var credentials = await SapCredentialsHelper.GetSapCredentialsAsync(
                _configuration, userName, password, companyDb);

            if (credentials == null || string.IsNullOrEmpty(credentials.B1Session))
            {
                throw new Exception(
                    "SAP Service Layer: el login no devolvió B1SESSION. Revise ConnectionStrings:ApiSAP y SapServiceLayer.");
            }

            var apiSapUrl = SapCredentialsHelper.NormalizeServiceLayerBaseUrl(
                _configuration.GetConnectionString("ApiSAP"));
            if (string.IsNullOrEmpty(apiSapUrl))
                throw new Exception("ConnectionStrings:ApiSAP no está definida.");

            try
            {
                using (var httpClient = SapCredentialsHelper.CreateSapHttpClient(credentials))
                {
                    return await action(httpClient, apiSapUrl);
                }
            }
            finally
            {
                await SapCredentialsHelper.LogoutFromSapAsync(_configuration, credentials);
            }
        }

        private static SapServiceLayerQuotationResult ParseSlQuotationResult(string responseBody)
        {
            var jo = JObject.Parse(responseBody);
            var docNumTok = jo["DocNum"] ?? jo["docNum"];
            var docEntryTok = jo["DocEntry"] ?? jo["docEntry"];
            if (docEntryTok == null || docEntryTok.Type == JTokenType.Null)
                throw new Exception($"SAP respondió sin DocEntry: {responseBody}");

            return new SapServiceLayerQuotationResult
            {
                DocEntry = docEntryTok.Value<int>(),
                DocNum = docNumTok == null || docNumTok.Type == JTokenType.Null ? null : docNumTok.ToString()
            };
        }
    }
}
