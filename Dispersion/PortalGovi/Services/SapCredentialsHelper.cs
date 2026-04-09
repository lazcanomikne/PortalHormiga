using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using PortalGovi.Models;

namespace PortalGovi.Services
{
    /// <summary>
    /// Helper para obtener credenciales de SAP para operaciones
    /// </summary>
    public static class SapCredentialsHelper
    {
        /// <summary>
        /// Garantiza barra final para concatenar Login, Quotations, Logout.
        /// </summary>
        public static string NormalizeServiceLayerBaseUrl(string apiSapUrl)
        {
            if (string.IsNullOrWhiteSpace(apiSapUrl))
                return null;
            return apiSapUrl.EndsWith("/", StringComparison.Ordinal) ? apiSapUrl : apiSapUrl + "/";
        }

        /// <summary>
        /// Extrae B1SESSION y ROUTEID de las cabeceras Set-Cookie (una o varias líneas).
        /// </summary>
        public static bool TryParseB1CookiesFromResponse(HttpResponseMessage response, out string b1Session, out string routeId)
        {
            b1Session = null;
            routeId = null;
            if (response?.Headers == null)
                return false;

            if (!response.Headers.TryGetValues("Set-Cookie", out var setCookieValues))
                return false;

            foreach (var setCookie in setCookieValues)
            {
                if (string.IsNullOrEmpty(setCookie))
                    continue;
                foreach (var part in setCookie.Split(';'))
                {
                    var t = part.Trim();
                    if (t.StartsWith("B1SESSION=", StringComparison.OrdinalIgnoreCase))
                        b1Session = t.Substring("B1SESSION=".Length).Trim();
                    else if (t.StartsWith("ROUTEID=", StringComparison.OrdinalIgnoreCase))
                        routeId = t.Substring("ROUTEID=".Length).Trim();
                }
            }

            return !string.IsNullOrEmpty(b1Session);
        }

        /// <summary>
        /// Obtener credenciales de SAP para una operación específica
        /// </summary>
        /// <param name="configuration">Configuración de la aplicación</param>
        /// <param name="userName">Nombre de usuario</param>
        /// <param name="password">Contraseña</param>
        /// <param name="companyDB">Base de datos de la empresa (opcional)</param>
        /// <returns>Credenciales de SAP</returns>
        public static async Task<SapCredentials> GetSapCredentialsAsync(
            IConfiguration configuration,
            string userName,
            string password,
            string companyDB = null)
        {
            try
            {
                var apiSapUrl = NormalizeServiceLayerBaseUrl(configuration.GetConnectionString("ApiSAP"));
                var defaultCompanyDB = configuration.GetValue<string>("UserData:CompanyDB");

                if (string.IsNullOrEmpty(apiSapUrl))
                {
                    Console.WriteLine("[SAP SL] ApiSAP (ConnectionStrings) vacía.");
                    return null;
                }

                using (var handler = new HttpClientHandler())
                {
                    handler.ServerCertificateCustomValidationCallback = (_, __, ___, ____) => true;

                    using (var httpClient = new HttpClient(handler))
                    {
                        var loginData = new LoginApiData
                        {
                            CompanyDB = companyDB ?? defaultCompanyDB,
                            UserName = userName,
                            Password = password
                        };

                        var jsonContent = JsonConvert.SerializeObject(loginData);
                        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                        var response = await httpClient.PostAsync($"{apiSapUrl}Login", content);
                        var loginBody = await response.Content.ReadAsStringAsync();

                        if (!response.IsSuccessStatusCode)
                        {
                            Console.WriteLine($"[SAP SL] Login HTTP {(int)response.StatusCode}: {loginBody}");
                            return null;
                        }

                        if (!TryParseB1CookiesFromResponse(response, out var b1Session, out var routeId))
                        {
                            Console.WriteLine($"[SAP SL] Login OK pero sin B1SESSION en Set-Cookie. Cuerpo: {loginBody}");
                            return null;
                        }

                        return new SapCredentials
                        {
                            B1Session = b1Session,
                            RouteId = routeId,
                            CompanyDB = loginData.CompanyDB,
                            UserName = userName,
                            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SAP SL] Excepción en login: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Crear un HttpClient configurado con las credenciales de SAP
        /// </summary>
        /// <param name="credentials">Credenciales de SAP</param>
        /// <returns>HttpClient configurado</returns>
        public static HttpClient CreateSapHttpClient(SapCredentials credentials)
        {
            var handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (_, __, ___, ____) => true;

            var httpClient = new HttpClient(handler);
            var cookie = $"B1SESSION={credentials.B1Session}";
            if (!string.IsNullOrEmpty(credentials.RouteId))
                cookie += $"; ROUTEID={credentials.RouteId}";
            httpClient.DefaultRequestHeaders.Add("Cookie", cookie);

            return httpClient;
        }

        /// <summary>
        /// Cerrar sesión en SAP
        /// </summary>
        /// <param name="configuration">Configuración de la aplicación</param>
        /// <param name="credentials">Credenciales de SAP</param>
        /// <returns>Task completado</returns>
        public static async Task LogoutFromSapAsync(IConfiguration configuration, SapCredentials credentials)
        {
            try
            {
                if (credentials == null || string.IsNullOrEmpty(credentials.B1Session))
                    return;

                var apiSapUrl = NormalizeServiceLayerBaseUrl(configuration.GetConnectionString("ApiSAP"));
                if (string.IsNullOrEmpty(apiSapUrl))
                    return;

                using (var httpClient = CreateSapHttpClient(credentials))
                {
                    await httpClient.PostAsync($"{apiSapUrl}Logout", null);
                }
            }
            catch (Exception)
            {
                // Ignorar errores al cerrar sesión
            }
        }
    }
}
