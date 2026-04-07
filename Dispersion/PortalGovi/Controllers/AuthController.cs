using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using PortalGovi.Models;
using PortalGovi.Services;

namespace PortalGovi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAuthService _authService;

        public AuthController(IConfiguration configuration, IAuthService authService)
        {
            _configuration = configuration;
            _authService = authService;
        }

        /// <summary>
        /// Autenticación principal del sistema
        /// </summary>
        /// <param name="loginApiData">Datos de login</param>
        /// <returns>Resultado de la autenticación</returns>
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginApiData loginApiData)
        {
            return BadRequest(new { message = "Este método de login ha sido desactivado. Use send-ping." });
        }

        /// <summary>
        /// Enviar ping (código) al correo del usuario
        /// </summary>
        [HttpPost("send-ping")]
        public async Task<ActionResult> SendPing([FromBody] PingRequest request)
        {
            try
            {
                var result = await _authService.SendPingAsync(request.Email);
                if (result.IsSuccess)
                {
                    return Ok(new { message = "Código enviado exitosamente" });
                }
                return BadRequest(new { message = result.ErrorMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al enviar código", error = ex.Message });
            }
        }

        /// <summary>
        /// Verificar ping y autenticar
        /// </summary>
        [HttpPost("verify-ping")]
        public async Task<ActionResult> VerifyPing([FromBody] PingVerification request)
        {
            try
            {
                var result = await _authService.VerifyPingAsync(request.Email, request.PingCode);
                
                if (result.IsSuccess)
                {
                    Response.Headers.Add("B1SESSION", result.B1Session);
                    Response.Headers.Add("ROUTEID", result.RouteId);
                    
                    return Ok(new 
                    { 
                        message = "Autenticación exitosa",
                        userData = new
                        {
                            userName = result.UserName,
                            userDesc = result.UserDesc,
                            imgUrl = result.ImgUrl
                        },
                        sessionData = new
                        {
                            b1Session = result.B1Session,
                            routeId = result.RouteId,
                            expiresAt = result.ExpiresAt
                        }
                    });
                }
                
                return Unauthorized(new { message = result.ErrorMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al verificar código", error = ex.Message });
            }
        }

        /// <summary>
        /// Autenticación específica para pagos
        /// </summary>
        /// <param name="loginApiData">Datos de login</param>
        /// <returns>Resultado de la autenticación</returns>
        [HttpPost("loginpagos")]
        public async Task<ActionResult> LoginPagos([FromBody] LoginApiData loginApiData)
        {
            try
            {
                var result = await _authService.AuthenticateForPaymentsAsync(loginApiData);
                
                if (result.IsSuccess)
                {
                    // Agregar headers de sesión
                    Response.Headers.Add("B1SESSION", result.B1Session);
                    Response.Headers.Add("ROUTEID", result.RouteId);
                    
                    // Devolver datos del usuario junto con el mensaje de éxito
                    return Ok(new 
                    { 
                        message = "Autenticación para pagos exitosa",
                        userData = new
                        {
                            userName = result.UserName,
                            userDesc = result.UserDesc,
                            imgUrl = result.ImgUrl
                        },
                        sessionData = new
                        {
                            b1Session = result.B1Session,
                            routeId = result.RouteId,
                            expiresAt = result.ExpiresAt
                        }
                    });
                }
                
                return Unauthorized(new { message = result.ErrorMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Validar sesión actual
        /// </summary>
        /// <returns>Estado de la sesión</returns>
        [HttpGet("validate")]
        public async Task<ActionResult> ValidateSession()
        {
            try
            {
                var b1Session = Request.Headers["B1SESSION"].FirstOrDefault();
                var routeId = Request.Headers["ROUTEID"].FirstOrDefault();

                if (string.IsNullOrEmpty(b1Session) || string.IsNullOrEmpty(routeId))
                {
                    return Unauthorized(new { message = "Sesión no válida" });
                }

                var isValid = await _authService.ValidateSessionAsync(b1Session, routeId);
                
                if (isValid)
                {
                    return Ok(new { message = "Sesión válida" });
                }
                
                return Unauthorized(new { message = "Sesión expirada" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Cerrar sesión
        /// </summary>
        /// <returns>Resultado del logout</returns>
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            try
            {
                var b1Session = Request.Headers["B1SESSION"].FirstOrDefault();
                var routeId = Request.Headers["ROUTEID"].FirstOrDefault();

                if (!string.IsNullOrEmpty(b1Session) && !string.IsNullOrEmpty(routeId))
                {
                    await _authService.LogoutAsync(b1Session, routeId);
                }

                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
} 