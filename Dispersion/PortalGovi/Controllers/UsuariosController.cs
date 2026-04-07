using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Sap.Data.Hana;
using Microsoft.Extensions.Configuration;
using System;
using PortalGovi.Models;

namespace PortalGovi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public UsuariosController(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("Sap");
        }

        [HttpGet("init-db")]
        public ActionResult InitDb()
        {
            try
            {
                using (var conn = new HanaConnection(_connectionString))
                {
                    conn.Open();
                    using (var cmd = new HanaCommand(@"ALTER TABLE ""MIKNE"".""USUARIOS"" ADD (""SERIESAP"" NVARCHAR(100), ""NUMSERIESAP"" NVARCHAR(100))", conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Columnas creadas exitosamente" });
            }
            catch (Exception ex)
            {
                return Ok(new { message = "Columnas probablemente ya existían", error = ex.Message });
            }
        }

        [HttpGet]
        public ActionResult<List<Usuario>> GetUsuarios()
        {
            try
            {
                var usuarios = new List<Usuario>();
                using (var conn = new HanaConnection(_connectionString))
                {
                    conn.Open();
                    string query = @"SELECT ""USERNAME"", ""USERDESC"", ""EMAIL"", ""IMGURL"", ""SERIESAP"", ""NUMSERIESAP"" FROM ""MIKNE"".""USUARIOS""";
                    using (var cmd = new HanaCommand(query, conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            usuarios.Add(new Usuario
                            {
                                UserName = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                UserDesc = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                Email = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                ImgUrl = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                SerieSap = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                NumSerieSap = reader.IsDBNull(5) ? "" : reader.GetString(5)
                            });
                        }
                    }
                }
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener usuarios", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult CreateUsuario([FromBody] Usuario usuario)
        {
            if (string.IsNullOrEmpty(usuario.UserName))
                return BadRequest(new { message = "El nombre de usuario es requerido." });

            try
            {
                using (var conn = new HanaConnection(_connectionString))
                {
                    conn.Open();
                    
                    // Verificar si existe
                    string checkQuery = @"SELECT COUNT(*) FROM ""MIKNE"".""USUARIOS"" WHERE ""USERNAME"" = ?";
                    using (var checkCmd = new HanaCommand(checkQuery, conn))
                    {
                        checkCmd.Parameters.AddWithValue("@UserName", usuario.UserName);
                        int count = Convert.ToInt32(checkCmd.ExecuteScalar());
                        if (count > 0)
                        {
                            return BadRequest(new { message = "El nombre de usuario ya existe." });
                        }
                    }

                    string query = @"INSERT INTO ""MIKNE"".""USUARIOS"" (""USERNAME"", ""PASSWORD"", ""USERDESC"", ""EMAIL"", ""IMGURL"", ""SERIESAP"", ""NUMSERIESAP"") VALUES (?, ?, ?, ?, ?, ?, ?)";
                    using (var cmd = new HanaCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserName", usuario.UserName ?? "");
                        cmd.Parameters.AddWithValue("@Password", usuario.Password ?? "");
                        cmd.Parameters.AddWithValue("@UserDesc", usuario.UserDesc ?? "");
                        cmd.Parameters.AddWithValue("@Email", usuario.Email ?? "");
                        cmd.Parameters.AddWithValue("@ImgUrl", usuario.ImgUrl ?? "");
                        cmd.Parameters.AddWithValue("@SerieSap", usuario.SerieSap ?? "");
                        cmd.Parameters.AddWithValue("@NumSerieSap", usuario.NumSerieSap ?? "");
                        
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Usuario creado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear usuario", error = ex.Message });
            }
        }

        [HttpPut("{username}")]
        public ActionResult UpdateUsuario(string username, [FromBody] Usuario usuario)
        {
            try
            {
                using (var conn = new HanaConnection(_connectionString))
                {
                    conn.Open();
                    
                    // Solo actualizamos password si enviaron uno nuevo
                    string query;
                    bool updatePassword = !string.IsNullOrEmpty(usuario.Password);
                    
                    if (updatePassword)
                    {
                        query = @"UPDATE ""MIKNE"".""USUARIOS"" SET ""USERDESC"" = ?, ""EMAIL"" = ?, ""IMGURL"" = ?, ""SERIESAP"" = ?, ""NUMSERIESAP"" = ?, ""PASSWORD"" = ? WHERE ""USERNAME"" = ?";
                    }
                    else
                    {
                        query = @"UPDATE ""MIKNE"".""USUARIOS"" SET ""USERDESC"" = ?, ""EMAIL"" = ?, ""IMGURL"" = ?, ""SERIESAP"" = ?, ""NUMSERIESAP"" = ? WHERE ""USERNAME"" = ?";
                    }

                    using (var cmd = new HanaCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserDesc", usuario.UserDesc ?? "");
                        cmd.Parameters.AddWithValue("@Email", usuario.Email ?? "");
                        cmd.Parameters.AddWithValue("@ImgUrl", usuario.ImgUrl ?? "");
                        cmd.Parameters.AddWithValue("@SerieSap", usuario.SerieSap ?? "");
                        cmd.Parameters.AddWithValue("@NumSerieSap", usuario.NumSerieSap ?? "");
                        
                        if (updatePassword)
                        {
                            cmd.Parameters.AddWithValue("@Password", usuario.Password);
                        }
                        
                        cmd.Parameters.AddWithValue("@UserName", username);
                        
                        int rows = cmd.ExecuteNonQuery();
                        if (rows == 0)
                        {
                            return NotFound(new { message = "Usuario no encontrado." });
                        }
                    }
                }
                return Ok(new { message = "Usuario actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar usuario", error = ex.Message });
            }
        }
        [HttpPost("delete/{username}")]
        public ActionResult DeleteUsuario(string username)
        {
            try
            {
                using (var conn = new HanaConnection(_connectionString))
                {
                    conn.Open();
                    string query = @"DELETE FROM ""MIKNE"".""USUARIOS"" WHERE UPPER(""USERNAME"") = UPPER(?)";
                    using (var cmd = new HanaCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserName", username);
                        int rows = cmd.ExecuteNonQuery();
                        if (rows == 0)
                        {
                            return NotFound(new { message = "Usuario no encontrado." });
                        }
                    }
                }
                return Ok(new { message = "Usuario eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar usuario", error = ex.Message });
            }
        }
    }
}
