using System;

namespace PortalGovi.Models
{
    /// <summary>
    /// Resultado de la autenticación
    /// </summary>
    public class AuthResult
    {
        public bool IsSuccess { get; set; }
        public string B1Session { get; set; }
        public string RouteId { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string UserName { get; set; }
        public string CompanyDB { get; set; }
        public string UserDesc { get; set; }
        public string ImgUrl { get; set; }
    }

    /// <summary>
    /// Solicitud de ping para login
    /// </summary>
    public class PingRequest
    {
        public string Email { get; set; }
    }

    /// <summary>
    /// Verificación de ping para login
    /// </summary>
    public class PingVerification
    {
        public string Email { get; set; }
        public string PingCode { get; set; }
    }

    /// <summary>
    /// Credenciales de SAP para operaciones
    /// </summary>
    public class SapCredentials
    {
        public string B1Session { get; set; }
        public string RouteId { get; set; }
        public string CompanyDB { get; set; }
        public string UserName { get; set; }
        public DateTime ExpiresAt { get; set; }
        /// <summary>ROUTEID no siempre viene en Set-Cookie; basta con B1SESSION válido.</summary>
        public bool IsValid => !string.IsNullOrEmpty(B1Session) && DateTime.UtcNow < ExpiresAt;
    }

    /// <summary>
    /// Información de sesión del usuario
    /// </summary>
    public class UserSession
    {
        public string UserName { get; set; }
        public string CompanyDB { get; set; }
        public string B1Session { get; set; }
        public string RouteId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsActive => DateTime.UtcNow < ExpiresAt;
    }

    /// <summary>
    /// Configuración de autenticación
    /// </summary>
    public class AuthConfig
    {
        public string ApiSapUrl { get; set; }
        public string CompanyDB { get; set; }
        public int SessionTimeoutMinutes { get; set; } = 30;
        public bool ValidateSSL { get; set; } = false;
    }
} 