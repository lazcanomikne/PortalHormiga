using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using PortalGovi.Services;

namespace PortalGovi.Middleware
{
    /// <summary>
    /// Middleware para validar autenticación en rutas protegidas
    /// </summary>
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly IAuthService _authService;

        public AuthMiddleware(RequestDelegate next, IConfiguration configuration, IAuthService authService)
        {
            _next = next;
            _configuration = configuration;
            _authService = authService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Rutas que no requieren autenticación
            var publicPaths = new[]
            {
                "/api/auth/login",
                "/api/auth/loginpagos",
                "/swagger",
                "/swagger-ui",
                "/favicon.ico"
            };

            var path = context.Request.Path.Value?.ToLower();
            
            // Verificar si es una ruta pública
            if (publicPaths.Any(p => path.StartsWith(p.ToLower())))
            {
                await _next(context);
                return;
            }

            // Verificar si es una ruta de API que requiere autenticación
            if (path.StartsWith("/api/") && !path.StartsWith("/api/auth/"))
            {
                var b1Session = context.Request.Headers["B1SESSION"].FirstOrDefault();
                var routeId = context.Request.Headers["ROUTEID"].FirstOrDefault();

                if (string.IsNullOrEmpty(b1Session) || string.IsNullOrEmpty(routeId))
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("{\"message\":\"Sesión no válida\"}");
                    return;
                }

                // Validar sesión
                var isValid = await _authService.ValidateSessionAsync(b1Session, routeId);
                
                if (!isValid)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("{\"message\":\"Sesión expirada\"}");
                    return;
                }
            }

            await _next(context);
        }
    }

    /// <summary>
    /// Extensiones para registrar el middleware de autenticación
    /// </summary>
    public static class AuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuthMiddleware>();
        }
    }
} 