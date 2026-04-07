using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using PortalGovi.DataProvider;
using PortalGovi.Models;
using Microsoft.Extensions.Configuration;

namespace PortalGovi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataAppController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private DataManager dataManager;

        public DataAppController(IConfiguration configuration, DataManager dataManager)
        {
            this.dataManager = new DataManager(configuration);
            this._configuration = configuration;
        }

        /// <summary>
        /// Obtener lista de clientes activos
        /// </summary>
        /// <returns>Lista de clientes</returns>
        [HttpGet("clientes")]
        public ActionResult GetClientes()
        {
            try
            {
                List<Cliente> dataResult = this.dataManager.ObtenerClientes();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los clientes" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener persona de contacto/dirección fiscal de un cliente
        /// </summary>
        /// <returns>Lista de personas de contacto</returns>
        [HttpGet("personacontacto")]
        public ActionResult GetPersonaContacto([FromQuery] string cardCode)
        {
            try
            {
                if (string.IsNullOrEmpty(cardCode))
                {
                    return BadRequest(new { message = "El parámetro 'cardCode' es requerido" });
                }

                List<PersonaContacto> dataResult = this.dataManager.ObtenerPersonaContacto(cardCode);

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener la persona de contacto" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener dirección fiscal de un cliente
        /// </summary>
        /// <returns>Dirección fiscal del cliente</returns>
        [HttpGet("direccionfiscal")]
        public ActionResult GetDireccionFiscal([FromQuery] string cardCode)
        {
            try
            {
                if (string.IsNullOrEmpty(cardCode))
                {
                    return BadRequest(new { message = "El parámetro 'cardCode' es requerido" });
                }

                List<DireccionFiscal> dataResult = this.dataManager.ObtenerDireccionFiscal(cardCode);

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener la dirección fiscal" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener dirección de entrega de un cliente
        /// </summary>
        /// <param name="cardCode"></param>
        /// <returns>Dirección de entrega del cliente</returns>
        [HttpGet("direccionentrega")]
        public ActionResult GetDireccionEntrega([FromQuery] string cardCode)
        {
            try
            {
                if (string.IsNullOrEmpty(cardCode))
                {
                    return BadRequest(new { message = "El parámetro 'cardCode' es requerido" });
                }

                List<DireccionEntrega> dataResult = this.dataManager.ObtenerDireccionEntrega(cardCode);

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener la dirección de entrega" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener términos de entrega
        /// </summary>
        /// <returns>Lista de términos de entrega</returns>
        [HttpGet("terminosentrega")]
        public ActionResult GetTerminosEntrega()
        {
            try
            {
                List<TerminoEntrega> dataResult = this.dataManager.ObtenerTerminosEntrega();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los términos de entrega" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener lista de artículos/productos
        /// </summary>
        /// <returns>Lista de artículos</returns>
        [HttpGet("articulos")]
        public ActionResult GetArticulos()
        {
            try
            {
                List<Articulo> dataResult = this.dataManager.ObtenerArticulos();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los artículos" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("tipofianza")]
        public ActionResult GetTipoFianza()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerTipoFianza();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los tipos de fianzas" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("agentes")]
        public ActionResult GetAgentes()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerAgentes();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los tipos de fianzas" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("tipogarantias")]
        public ActionResult GetTipoGatanrias()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerTiposGarantias();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los tipos de fianzas" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }


        [HttpGet("tipopalipastos")]
        public ActionResult GetTipoPolipastos()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerTiposPolipastos();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los tipos de fianzas" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("tipoderuedas")]
        public ActionResult GetTipoRuedas([FromQuery] string type)
        {
            try
            {
                var dataResult = this.dataManager.ObtenerTiposRuedas(type);

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los tipos de ruedas" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("modelos")]
        public ActionResult GetModelos()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerModelos();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los modelos" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("motorreductores")]
        public ActionResult GetMotorreductores()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerMotorreductores();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los motorreductores" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("plazosdias")]
        public ActionResult GetPlazosDias()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerPlazosDias();

                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los plazos de días" });
                }

                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("vendedores")]
        public ActionResult<List<Vendedor>> GetVendedores()
        {
            try
            {
                var dataResult = this.dataManager.ObtenerVendedores();
                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los vendedores" });
                }
                return Ok(dataResult);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Error al obtener los vendedores" });
            }
        }

        [HttpGet("codigosconstruccion")]
        public ActionResult GetCodigoConstruccion([FromQuery] string code)
        {
            try
            {
                if (string.IsNullOrEmpty(code))
                {
                    return BadRequest(new { message = "El parámetro 'code' es requerido" });
                }

                // Intentar convertir a int si es necesario, o pasar como string
                int groupCode = 0;
                if (!int.TryParse(code, out groupCode))
                {
                   return BadRequest(new { message = "El parámetro 'code' debe ser un número" });
                }

                var dataResult = this.dataManager.ObtenerCodigosConstruccion(groupCode);
                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los códigos de construcción desde SAP" });
                }
                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("tipobrazos")]
        public ActionResult GetTiposBrazo([FromQuery] int code)
        {
            try
            {
                var dataResult = this.dataManager.ObtenerTiposBrazo(code);
                if (dataResult == null)
                {
                    return StatusCode(500, new { message = "Error al obtener los vendedores" });
                }
                return Ok(dataResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
