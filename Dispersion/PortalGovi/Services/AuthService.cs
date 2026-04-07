using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using PortalGovi.Models;
using Sap.Data.Hana;

namespace PortalGovi.Services
{
    /// <summary>
    /// Datos del usuario obtenidos de la base de datos local
    /// </summary>
    public class LocalUserData
    {
        public string UserName { get; set; }
        public string UserDesc { get; set; }
        public string ImgUrl { get; set; }
        public bool IsValid { get; set; }
    }

    /// <summary>
    /// Servicio de autenticación que centraliza toda la lógica de login
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly string _apiSapUrl;
        private readonly string _companyDB;
        private readonly Dictionary<string, UserSession> _activeSessions;
        private readonly Dictionary<string, (string Code, DateTime ExpiresAt)> _pendingPings;

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("Sap");
            _apiSapUrl = _configuration.GetConnectionString("ApiSAP");
            _companyDB = _configuration.GetValue<string>("UserData:CompanyDB");
            _activeSessions = new Dictionary<string, UserSession>();
            _pendingPings = new Dictionary<string, (string Code, DateTime ExpiresAt)>();
        }

        /// <summary>
        /// Autenticar usuario en el sistema
        /// </summary>
        public async Task<AuthResult> AuthenticateAsync(LoginApiData loginApiData)
        {
            // Este método anteriormente realizaba autenticación con SAP.
            // Ahora se ha reemplazado por el flujo de Email Ping.
            // Se mantiene por compatibilidad si fuera necesario, pero se recomienda usar SendPing/VerifyPing.
            
            return new AuthResult
            {
                IsSuccess = false,
                ErrorMessage = "El método de autenticación por contraseña ha sido desactivado. Use Login por Email."
            };

            /*
            try
            {
                // Validar credenciales en la base de datos local
                var localUserData = await ValidateLocalCredentialsAsync(loginApiData);
                
                if (!localUserData.IsValid)
                {
                    return new AuthResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Credenciales inválidas"
                    };
                }

                // Autenticar con SAP
                var sapResult = await AuthenticateWithSapAsync(loginApiData);
                
                if (sapResult.IsSuccess)
                {
                    // Crear sesión de usuario
                    var session = new UserSession
                    {
                        UserName = localUserData.UserName,
                        CompanyDB = _companyDB,
                        B1Session = sapResult.B1Session,
                        RouteId = sapResult.RouteId,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddMinutes(30) // 30 minutos de timeout
                    };

                    // Almacenar sesión
                    _activeSessions[sapResult.B1Session] = session;

                    // Incluir datos del usuario local en el resultado
                    sapResult.UserName = localUserData.UserName;
                    sapResult.UserDesc = localUserData.UserDesc;
                    sapResult.ImgUrl = localUserData.ImgUrl;

                    return sapResult;
                }

                return sapResult;
            }
            catch (Exception ex)
            {
                return new AuthResult
                {
                    IsSuccess = false,
                    ErrorMessage = $"Error de autenticación: {ex.Message}"
                };
            }
            */
        }

        /// <summary>
        /// Autenticar usuario específicamente para pagos
        /// </summary>
        public async Task<AuthResult> AuthenticateForPaymentsAsync(LoginApiData loginApiData)
        {
            return new AuthResult
            {
                IsSuccess = false,
                ErrorMessage = "El método de autenticación para pagos ha sido desactivado. Use Login por Email."
            };
            /*
            try
            {
                // Para pagos, no validamos credenciales locales, solo SAP
                var sapResult = await AuthenticateWithSapAsync(loginApiData);
                
                if (sapResult.IsSuccess)
                {
                    // Crear sesión de usuario
                    var session = new UserSession
                    {
                        UserName = loginApiData.UserName,
                        CompanyDB = loginApiData.CompanyDB ?? _companyDB,
                        B1Session = sapResult.B1Session,
                        RouteId = sapResult.RouteId,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                    };

                    // Almacenar sesión
                    _activeSessions[sapResult.B1Session] = session;

                    return sapResult;
                }

                return sapResult;
            }
            catch (Exception ex)
            {
                return new AuthResult
                {
                    IsSuccess = false,
                    ErrorMessage = $"Error de autenticación para pagos: {ex.Message}"
                };
            }
            */
        }

        /// <summary>
        /// Validar si una sesión es válida
        /// </summary>
        public async Task<bool> ValidateSessionAsync(string b1Session, string routeId)
        {
            if (string.IsNullOrEmpty(b1Session) || string.IsNullOrEmpty(routeId))
                return false;

            // Verificar si la sesión existe y está activa
            if (_activeSessions.TryGetValue(b1Session, out var session))
            {
                if (session.IsActive && session.RouteId == routeId)
                {
                    // Extender la sesión si es necesario
                    if (session.ExpiresAt.AddMinutes(-5) <= DateTime.UtcNow)
                    {
                        session.ExpiresAt = DateTime.UtcNow.AddMinutes(30);
                    }
                    return true;
                }
                else
                {
                    // Remover sesión expirada
                    _activeSessions.Remove(b1Session);
                }
            }

            return false;
        }

        /// <summary>
        /// Cerrar sesión
        /// </summary>
        public async Task LogoutAsync(string b1Session, string routeId)
        {
            try
            {
                // Remover sesión local
                if (_activeSessions.ContainsKey(b1Session))
                {
                    _activeSessions.Remove(b1Session);
                }

                // Cerrar sesión en SAP si es necesario
                await LogoutFromSapAsync(b1Session, routeId);
            }
            catch (Exception)
            {
                // Ignorar errores al cerrar sesión
            }
        }

        /// <summary>
        /// Obtener credenciales de SAP para operaciones
        /// </summary>
        public async Task<SapCredentials> GetSapCredentialsAsync(LoginApiData loginApiData)
        {
            // Este método ya no es funcional con el nuevo flujo de sesiones sin SAP
            return null;
        }

        public async Task<AuthResult> SendPingAsync(string email)
        {
            try
            {
                // 1. Verificar si el usuario existe por email en MIKNE.USUARIOS
                var userData = await GetUserDataByEmailAsync(email);
                if (userData == null || !userData.IsValid)
                {
                    return new AuthResult { IsSuccess = false, ErrorMessage = "Correo electrónico no registrado." };
                }

                // 2. Generar código de 6 dígitos
                string code = new Random().Next(100000, 999999).ToString();
                
                // 3. Almacenar código temporalmente (10 min exp)
                _pendingPings[email.ToLower()] = (code, DateTime.UtcNow.AddMinutes(10));

                // 4. Enviar correo
                await SendEmailPingAsync(email, code);

                return new AuthResult { IsSuccess = true };
            }
            catch (Exception ex)
            {
                return new AuthResult { IsSuccess = false, ErrorMessage = $"Error al enviar ping: {ex.Message}" };
            }
        }

        public async Task<AuthResult> VerifyPingAsync(string email, string pingCode)
        {
            try
            {
                email = email.ToLower();
                if (_pendingPings.TryGetValue(email, out var pending) && pending.Code == pingCode && DateTime.UtcNow < pending.ExpiresAt)
                {
                    // Limpiar ping usado
                    _pendingPings.Remove(email);

                    // Obtener datos de usuario
                    var userData = await GetUserDataByEmailAsync(email);

                    // Crear nueva sesión local (ya no de SAP)
                    string sessionId = Guid.NewGuid().ToString();
                    var session = new UserSession
                    {
                        UserName = userData.UserName,
                        B1Session = sessionId, // Usamos un GUID como sesión local
                        RouteId = "LOCAL",
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddHours(8) // Sesión más larga por ser local
                    };

                    _activeSessions[sessionId] = session;

                    return new AuthResult
                    {
                        IsSuccess = true,
                        B1Session = sessionId,
                        RouteId = "LOCAL",
                        UserName = userData.UserName,
                        UserDesc = userData.UserDesc,
                        ImgUrl = userData.ImgUrl,
                        ExpiresAt = session.ExpiresAt
                    };
                }

                return new AuthResult { IsSuccess = false, ErrorMessage = "Código inválido o expirado." };
            }
            catch (Exception ex)
            {
                return new AuthResult { IsSuccess = false, ErrorMessage = $"Error al verificar ping: {ex.Message}" };
            }
        }

        private async Task<LocalUserData> GetUserDataByEmailAsync(string email)
        {
            using (var connH = new HanaConnection(_connectionString))
            {
                await connH.OpenAsync();
                string query = @"SELECT ""USERNAME"", ""USERDESC"", ""IMGURL"" 
                                FROM ""MIKNE"".""USUARIOS"" 
                                WHERE LOWER(""EMAIL"") = LOWER(?)";

                using (var cmd = new HanaCommand(query, connH))
                {
                    cmd.Parameters.AddWithValue("@Email", email);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new LocalUserData
                            {
                                UserName = reader.GetString(0),
                                UserDesc = reader.GetString(1),
                                ImgUrl = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                IsValid = true
                            };
                        }
                    }
                }
            }
            return null;
        }

        private async Task SendEmailPingAsync(string toEmail, string code)
        {
            var host = _configuration.GetValue<string>("EmailSender:Host");
            var port = _configuration.GetValue<int>("EmailSender:Port");
            var userName = _configuration.GetValue<string>("EmailSender:UserName");
            var password = _configuration.GetValue<string>("EmailSender:Password");
            var enableSSL = _configuration.GetValue<bool>("EmailSender:EnableSSL");

            using (var client = new SmtpClient(host, port))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new System.Net.NetworkCredential(userName, password);
                client.EnableSsl = enableSSL;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(userName, "Portal Hormiga"),
                    Subject = "Código de Acceso - Portal Hormiga",
                    Body = $"<h3>Tu código de acceso es: <b>{code}</b></h3><p>Este código expira en 10 minutos.</p>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }

        #region Métodos Privados

        /// <summary>
        /// Validar credenciales en la base de datos local
        /// </summary>
        private async Task<LocalUserData> ValidateLocalCredentialsAsync(LoginApiData loginApiData)
        {
            try
            {
                using (var connH = new HanaConnection(_connectionString))
                {
                    await connH.OpenAsync();
                    
                    string query = @"SELECT ""USERNAME"", ""USERDESC"", ""IMGURL"" 
                                   FROM ""MIKNE"".""USUARIOS"" 
                                   WHERE ""USERNAME"" = ? AND ""PASSWORD"" = ?";

                    using (var cmd = new HanaCommand(query, connH))
                    {
                        cmd.Parameters.AddWithValue("@UserName", loginApiData.UserName);
                        cmd.Parameters.AddWithValue("@Password", loginApiData.Password);

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            if (reader.HasRows)
                            {
                                await reader.ReadAsync();
                                return new LocalUserData
                                {
                                    UserName = reader.GetString(0),
                                    UserDesc = reader.GetString(1),
                                    ImgUrl = reader.GetString(2),
                                    IsValid = true
                                };
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                // En caso de error, permitir autenticación directa con SAP
                return new LocalUserData { IsValid = true };
            }
            return new LocalUserData { IsValid = false };
        }

        /// <summary>
        /// Autenticar con SAP Business One
        /// </summary>
        private async Task<AuthResult> AuthenticateWithSapAsync(LoginApiData loginApiData)
        {
            try
            {
                using (var handler = new HttpClientHandler())
                {
                    handler.ServerCertificateCustomValidationCallback = (httpRequestMessage, cert, cetChain, policyErrors) => true;
                    
                    using (var httpClient = new HttpClient(handler))
                    {
                        // Preparar datos de login
                        var loginData = new LoginApiData
                        {
                            CompanyDB = loginApiData.CompanyDB ?? _companyDB,
                            UserName = loginApiData.UserName,
                            Password = loginApiData.Password
                        };

                        var jsonContent = JsonConvert.SerializeObject(loginData);
                        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                        // Realizar login a SAP
                        var response = await httpClient.PostAsync($"{_apiSapUrl}Login", content);

                        if (response.IsSuccessStatusCode)
                        {
                            var cookies = response.Headers.SingleOrDefault(header => header.Key == "Set-Cookie").Value;
                            
                            if (cookies != null && cookies.Any())
                            {
                                var cookieArray = cookies.ToArray();
                                var b1Session = cookieArray[0].Split("=")[1].Split(";")[0];
                                var routeId = cookieArray[1].Split("=")[1].Split(";")[0];

                                return new AuthResult
                                {
                                    IsSuccess = true,
                                    B1Session = b1Session,
                                    RouteId = routeId,
                                    UserName = loginApiData.UserName,
                                    CompanyDB = loginData.CompanyDB,
                                    ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                                };
                            }
                        }

                        var errorContent = await response.Content.ReadAsStringAsync();
                        return new AuthResult
                        {
                            IsSuccess = false,
                            ErrorMessage = $"Error de autenticación SAP: {errorContent}"
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                return new AuthResult
                {
                    IsSuccess = false,
                    ErrorMessage = $"Error de conexión con SAP: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Cerrar sesión en SAP
        /// </summary>
        private async Task LogoutFromSapAsync(string b1Session, string routeId)
        {
            try
            {
                using (var handler = new HttpClientHandler())
                {
                    handler.ServerCertificateCustomValidationCallback = (httpRequestMessage, cert, cetChain, policyErrors) => true;
                    
                    using (var httpClient = new HttpClient(handler))
                    {
                        httpClient.DefaultRequestHeaders.Add("Cookie", $"B1SESSION={b1Session}; ROUTEID={routeId}");
                        
                        await httpClient.PostAsync($"{_apiSapUrl}Logout", null);
                    }
                }
            }
            catch (Exception)
            {
                // Ignorar errores al cerrar sesión en SAP
            }
        }

        #endregion
    }
} 