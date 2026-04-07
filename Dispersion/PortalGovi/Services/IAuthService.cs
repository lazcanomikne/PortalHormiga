using System.Threading.Tasks;
using PortalGovi.Models;

namespace PortalGovi.Services
{
    /// <summary>
    /// Interfaz para el servicio de autenticación
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Autenticar usuario en el sistema
        /// </summary>
        /// <param name="loginApiData">Datos de login</param>
        /// <returns>Resultado de la autenticación</returns>
        Task<AuthResult> AuthenticateAsync(LoginApiData loginApiData);

        /// <summary>
        /// Autenticar usuario específicamente para pagos
        /// </summary>
        /// <param name="loginApiData">Datos de login</param>
        /// <returns>Resultado de la autenticación</returns>
        Task<AuthResult> AuthenticateForPaymentsAsync(LoginApiData loginApiData);

        /// <summary>
        /// Validar si una sesión es válida
        /// </summary>
        /// <param name="b1Session">ID de sesión B1</param>
        /// <param name="routeId">ID de ruta</param>
        /// <returns>True si la sesión es válida</returns>
        Task<bool> ValidateSessionAsync(string b1Session, string routeId);

        /// <summary>
        /// Cerrar sesión
        /// </summary>
        /// <param name="b1Session">ID de sesión B1</param>
        /// <param name="routeId">ID de ruta</param>
        /// <returns>Task completado</returns>
        Task LogoutAsync(string b1Session, string routeId);

        /// <summary>
        /// Obtener credenciales de SAP para operaciones
        /// </summary>
        /// <param name="loginApiData">Datos de login</param>
        /// <returns>Credenciales de SAP</returns>
        Task<SapCredentials> GetSapCredentialsAsync(LoginApiData loginApiData);

        /// <summary>
        /// Enviar un ping (OTP) al correo electrónico
        /// </summary>
        /// <param name="email">Correo electrónico del usuario</param>
        /// <returns>AuthResult con estado del envío</returns>
        Task<AuthResult> SendPingAsync(string email);

        /// <summary>
        /// Verificar el ping enviado al correo
        /// </summary>
        /// <param name="email">Correo electrónico</param>
        /// <param name="pingCode">Código de verificación</param>
        /// <returns>AuthResult con la sesión si es exitoso</returns>
        Task<AuthResult> VerifyPingAsync(string email, string pingCode);
    }
}