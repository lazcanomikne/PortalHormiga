using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using PortalGovi.Models;
using System.Linq;

namespace PortalGovi.Services
{
    /// <summary>
    /// Helper para obtener credenciales de SAP para operaciones
    /// </summary>
    public static class SapCredentialsHelper
    {
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
                var apiSapUrl = configuration.GetConnectionString("ApiSAP");
                var defaultCompanyDB = configuration.GetValue<string>("UserData:CompanyDB");

                using (var handler = new HttpClientHandler())
                {
                    handler.ServerCertificateCustomValidationCallback = (httpRequestMessage, cert, cetChain, policyErrors) => true;
                    
                    using (var httpClient = new HttpClient(handler))
                    {
                        // Preparar datos de login
                        var loginData = new LoginApiData
                        {
                            CompanyDB = companyDB ?? defaultCompanyDB,
                            UserName = userName,
                            Password = password
                        };

                        var jsonContent = JsonConvert.SerializeObject(loginData);
                        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                        // Realizar login a SAP
                        var response = await httpClient.PostAsync($"{apiSapUrl}Login", content);

                        if (response.IsSuccessStatusCode)
                        {
                            var cookies = response.Headers.SingleOrDefault(header => header.Key == "Set-Cookie").Value;
                            
                            if (cookies != null && cookies.Any())
                            {
                                var cookieArray = cookies.ToArray();
                                var b1Session = cookieArray[0].Split("=")[1].Split(";")[0];
                                var routeId = cookieArray[1].Split("=")[1].Split(";")[0];

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
                }

                return null;
            }
            catch (Exception)
            {
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
            handler.ServerCertificateCustomValidationCallback = (httpRequestMessage, cert, cetChain, policyErrors) => true;
            
            var httpClient = new HttpClient(handler);
            httpClient.DefaultRequestHeaders.Add("Cookie", $"B1SESSION={credentials.B1Session}; ROUTEID={credentials.RouteId}");
            
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
                var apiSapUrl = configuration.GetConnectionString("ApiSAP");
                
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