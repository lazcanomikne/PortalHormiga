using System;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;
using Dapper;

namespace PortalGovi.DataProvider
{
    public class ConfigManager
    {
        private readonly IConfiguration _configuration;
        public string SqlConectionStringMigrarTxt;
        public ConfigManager(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlConectionStringMigrarTxt = _configuration.GetConnectionString("MigrarTxt");
        }

        public string LoadMenu(string userName)
        {
            using var con = new SqlConnection(SqlConectionStringMigrarTxt);
                
            con.Open();
            var parameters = new { sXml = string.Format("<i><d tipo='Menu' userName='{0}'/></i>", userName) };
            var strResult = con.QueryAsync<string>("ApiQuery", param: parameters, commandType: CommandType.StoredProcedure).Result;
            var result = string.Join("", strResult);


            return result;

        }

    }
}