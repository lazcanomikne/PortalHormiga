using PortalGovi.DataProvider;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PortalGovi.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        string usuario;
        private readonly IConfiguration _configuration;
        private ConfigManager configManager;
        public ConfigController(IConfiguration configuration, ConfigManager configManager)
        {
            this.configManager = new ConfigManager(configuration);
            this._configuration = configuration;
        }
        // GET: api/<ConfigController>
        [HttpGet("menu")]
        public ActionResult Get()
        {
            usuario = Request.Query["u"];
            string result = configManager.LoadMenu(usuario);
            return Ok(result);
        }

        [HttpGet("consulta")]
        public ActionResult GetAction()
        {
            //return Ok("Hola");
            var s = string.Format(Properties.Resources.SQL_TRANSFERENCIAS, "WHERE \"BankCtlKey\" = '04' AND \"Sociedad\" = 'SBOGOVI' AND \"BPLName\" = '1' AND \"GLAccount\" = '105-004'");
            return Ok(s);
        }


    }
}
