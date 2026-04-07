using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Newtonsoft.Json;
//using RestSharp;
using Sap.Data.Hana;
using PortalGovi.Models;
using System.IO;
using System.Text;
using System.Text.Json;
using SAPbobsCOM;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.Net.Mail;
using System.Dynamic;
using PortalGovi.Services;

namespace PortalGovi.DataProvider
{
    public class DataManager
    {
        private readonly IConfiguration _configuration;
        public Company oCompany;
        public HanaConnection connH;
        public string ConnectionString;// = _configuration.GetConnectionString("Sap");//"Server=192.168.1.30:30015;UserID=SYSTEM;Password=Pa$$w0rd!";
        public string SqlConectionString;
        public string SqlConectionStringMigrarTxt;
        public string SqlConectionStringAjustes;
        private readonly string _dbName;

        public DataManager(IConfiguration configuration)
        {
            _configuration = configuration;
            ConnectionString = _configuration.GetConnectionString("Sap");
            SqlConectionString = _configuration.GetConnectionString("SQL");
            SqlConectionStringMigrarTxt = _configuration.GetConnectionString("MigrarTxt");
            SqlConectionStringAjustes = _configuration.GetConnectionString("Ajustes");
            _dbName = _configuration["UserData:CompanyDB"] ?? "SHOSAPROD";
        }

        /// <summary>
        /// Obtener lista de clientes activos
        /// </summary>
        /// <param name="sociedad">Sociedad/Base de datos</param>
        /// <returns>Lista de clientes</returns>
        public List<Cliente> ObtenerClientes()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""CardCode"", ""CardName"",""CardCode"" || ' - ' || ""CardName"" ""NombreCompleto""
                                       FROM """ + _dbName + @""".""OCRD"" 
                                       WHERE ""CardType"" = 'C' AND ""frozenFor"" = 'N'
                                       ORDER BY ""CardName""";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select(row =>
                                 new Cliente
                                 {
                                     CardCode = (string)row["CardCode"],
                                     NombreCompleto = (string)row["NombreCompleto"]
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Obtener persona de contacto/dirección fiscal de un cliente
        /// </summary>
        /// <param name="cardCode">Código del cliente</param>
        /// <returns>Lista de personas de contacto</returns>
        public List<PersonaContacto> ObtenerPersonaContacto(string cardCode)
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""Name"" AS ""PersonaContacto"" 
                                       FROM """ + _dbName + @""".""OCPR"" 
                                       WHERE ""CardCode"" = ?";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        cmdHSAP.Parameters.AddWithValue("@CardCode", cardCode);

                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select((row) =>
                                 new PersonaContacto
                                 {
                                     Name = (string)row["PersonaContacto"],
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Obtener dirección fiscal de un cliente
        /// </summary>
        /// <param name="cardCode">Código del cliente</param>
        /// <returns>Dirección fiscal del cliente</returns>
        public List<DireccionFiscal> ObtenerDireccionFiscal(string cardCode)
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT E.""Address"", IFNULL(E.""Street"",'') || ' ,' || IFNULL(E.""Block"",'') 
                                       || ' ,' || IFNULL(E.""City"",'') || ' ,' || IFNULL(E.""State"",'') || ' ,' || 
                                       IFNULL(E.""ZipCode"",'') || ' ,' || IFNULL(E.""Country"",'') AS ""DirFiscal"",
                                       CASE WHEN E.""Address"" = L.""BillToDef"" THEN 'Principal' ELSE 'Secudaria' END AS ""Tipo""
                                       FROM """ + _dbName + @""".""OCRD"" L
                                       LEFT JOIN """ + _dbName + @""".""CRD1"" E ON E.""CardCode"" = L.""CardCode""
                                       WHERE ""AdresType"" = 'B' AND L.""CardCode"" = ?";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        cmdHSAP.Parameters.AddWithValue("@CardCode", cardCode);

                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select(row =>
                                 new DireccionFiscal
                                 {
                                     Address = (string)row["Address"],
                                     DirFiscal = (string)row["DirFiscal"],
                                     Tipo = (string)row["Tipo"],
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Obtener dirección de entrega de un cliente
        /// </summary>
        /// <param name="cardCode">Código del cliente</param>
        /// <returns>Dirección de entrega del cliente</returns>
        public List<DireccionEntrega> ObtenerDireccionEntrega(string cardCode)
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT E.""Address"", IFNULL(E.""Street"",'') || ' ,' || IFNULL(E.""Block"",'') || ' ,' 
                                       || IFNULL(E.""City"",'') || ' ,' || IFNULL(E.""State"",'') || ' ,' 
                                       || IFNULL(E.""ZipCode"",'') || ' ,' || IFNULL(E.""Country"",'') AS ""DirEntrega"" ,
                                       CASE WHEN E.""Address"" = L.""ShipToDef"" THEN 'Principal' ELSE 'Secudaria' END AS ""Tipo"" 
                                       FROM """ + _dbName + @""".""OCRD"" L
                                       LEFT JOIN """ + _dbName + @""".""CRD1"" E ON E.""CardCode"" = L.""CardCode""
                                       WHERE ""AdresType"" = 'S' AND L.""CardCode"" = ?";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        cmdHSAP.Parameters.AddWithValue("@CardCode", cardCode);

                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select(row =>
                                 new DireccionEntrega
                                 {
                                     Address = (string)row["Address"],
                                     DirEntrega = (string)row["DirEntrega"],
                                     Tipo = (string)row["Tipo"],
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Obtener términos de entrega
        /// </summary>
        /// <returns>Lista de términos de entrega</returns>
        public List<TerminoEntrega> ObtenerTerminosEntrega()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""Code"" AS ""TrnspCode"", ""U_TerminosEntrega"" AS ""TrnspName"" 
                                       FROM """ + _dbName + @""".""@ACOT_FORMPRECIOS""
                                       WHERE ""U_TerminosEntrega"" IS NOT NULL 
                                       ORDER BY ""Code""";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select(row =>
                                 new TerminoEntrega
                                 {
                                     TrnspCode = row["TrnspCode"] != DBNull.Value ? (string)row["TrnspCode"] : "",
                                     TrnspName = (string)row["TrnspName"],
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Obtener lista de artículos/productos
        /// </summary>
        /// <returns>Lista de artículos</returns>
        public List<Articulo> ObtenerArticulos()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT IFNULL(""ItemCode"",'') AS ""ItemCode"", IFNULL(""ItemName"",'') AS ""ItemName""
                                       FROM """ + _dbName + @""".""OITM"" WHERE ""U_BXP_TIPO"" = '99' AND ""ItemCode"" IN ('ZKKE','ZKKW','ELKE','EKKE','EDKE','ZVPE','EVPE','ZHPE','EHPE','KBK','Grua giratoria KBK', 'Grua giratoria')
                                       ORDER BY ""ItemName""";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select(row =>
                                 new Articulo
                                 {
                                     ItemCode = (string)row["ItemCode"],
                                     ItemName = (string)row["ItemName"],
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        /// <summary>
        /// Obtener credenciales de SAP para operaciones
        /// </summary>
        /// <param name="userName">Nombre de usuario</param>
        /// <param name="password">Contraseña</param>
        /// <param name="companyDB">Base de datos de la empresa (opcional)</param>
        /// <returns>Credenciales de SAP</returns>
        public async Task<SapCredentials> GetSapCredentialsAsync(string userName, string password, string companyDB = null)
        {
            return await SapCredentialsHelper.GetSapCredentialsAsync(_configuration, userName, password, companyDB);
        }

        public DataTable ObtenerTipoFianza()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""U_Tipodefianza""
                                        FROM """ + _dbName + @""".""@ACOT_FORMPRECIOS""
                                        WHERE ""U_Tipodefianza"" IS NOT NULL; ";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        public DataTable ObtenerAgentes()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""U_Agente""
                                        FROM """ + _dbName + @""".""@ACOT_FORMPRECIOS""
                                        WHERE ""U_Agente"" IS NOT NULL; ";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        public DataTable ObtenerTiposGarantias()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""U_Tiempodegarantia""
                                        FROM """ + _dbName + @""".""@ACOT_FORMPRECIOS""
                                        WHERE ""U_Tiempodegarantia"" IS NOT NULL; ";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }
        public DataTable ObtenerTiposPolipastos()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT E.""ItmsGrpNam"", L.""ItemName"" FROM """ + _dbName + @""".""OITM"" L
                                        LEFT JOIN """ + _dbName + @""".""OITB"" E ON L.""ItmsGrpCod"" = E.""ItmsGrpCod""
                                        WHERE E.""ItmsGrpCod"" IN(433, 436)";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        public DataTable ObtenerTiposRuedas(string type = "5")
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT L.""ItemCode"" FROM """ + _dbName + @""".""OITM"" L
                                        WHERE L.""U_BXP_TIPO"" = '" + type + "'";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        public DataTable ObtenerModelos()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT L.""ItemCode"" FROM """ + _dbName + @""".""OITM"" L
                                        LEFT JOIN """ + _dbName + @""".""OITB"" E ON L.""ItmsGrpCod"" = E.""ItmsGrpCod"" 
                                        WHERE E.""ItmsGrpCod"" IN (431)";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        public DataTable ObtenerMotorreductores()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT L.""ItemCode"" FROM """ + _dbName + @""".""OITM"" L
                                        LEFT JOIN """ + _dbName + @""".""OITB"" E ON L.""ItmsGrpCod"" = E.""ItmsGrpCod"" 
                                        WHERE E.""ItmsGrpCod"" IN (435)";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }

        public DataTable ObtenerPlazosDias()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""PymntGroup"" FROM """ + _dbName + @""".""OCTG""";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("HANA Error: " + ex.Message, ex);
            }
        }
        public List<Vendedor> ObtenerVendedores()
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT 
	                                    A.""SlpCode"",
	                                    A.""SlpName"",
	                                    A.""Telephone"",
	                                    A.""Mobil"",
	                                    A.""Email"",
	                                    (SELECT ""IntrntAdrs"" FROM """ + _dbName + @""".""ADM1"") AS ""PagWeb""
                                    FROM """ + _dbName + @""".""OSLP"" A";
                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                var list = data.AsEnumerable().Select(row =>
                                 new Vendedor
                                 {
                                     SlpCode = Convert.ToInt32(row["SlpCode"]),
                                     SlpName = row["SlpName"] != DBNull.Value ? (string)row["SlpName"] : "",
                                     Telephone = row["Telephone"] != DBNull.Value ? (string)row["Telephone"] : "",
                                     Mobil = row["Mobil"] != DBNull.Value ? (string)row["Mobil"] : "",
                                     Email = row["Email"] != DBNull.Value ? (string)row["Email"] : "",
                                     PagWeb = row["PagWeb"] != DBNull.Value ? (string)row["PagWeb"] : ""
                                 }).ToList();

                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("C:\\inetpub\\wwwroot\\PortalHormiga_Back\\logs\\db_error.txt", DateTime.Now.ToString() + " ObtenerVendedores: " + ex.ToString() + Environment.NewLine);
                return null;
            }
        }
        public DataTable ObtenerCodigosConstruccion(int codigo)
        {
            DataTable data = new DataTable();
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT ""ItemCode"" FROM """ + _dbName + @""".""OITM""
                                        WHERE ""ItmsGrpCod"" = " + codigo.ToString() + @";";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            data.Load(dataReader);
                            return data;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Devolver tabla vacía en lugar de null para evitar errores en el controlador
                return data;
            }
        }
        
        public DataTable ObtenerTiposBrazo(int codigo)
        {
            try
            {
                using (HanaConnection connH = new HanaConnection(ConnectionString))
                {
                    connH.Open();
                    string sConsulta = @"SELECT L.""ItemCode"", L.""ItemName"" FROM """ + _dbName + @""".""OITM"" L
                                        WHERE L.""ItmsGrpCod"" = 481";

                    using (HanaCommand cmdHSAP = new HanaCommand(sConsulta, connH))
                    {
                        using (HanaDataReader dataReader = cmdHSAP.ExecuteReader())
                        {
                            using (DataTable data = new DataTable())
                            {
                                data.Load(dataReader);
                                return data;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("C:\\inetpub\\wwwroot\\PortalHormiga_Back\\logs\\db_error.txt", DateTime.Now.ToString() + " ObtenerVendedores: " + ex.ToString() + Environment.NewLine);
                return null;
            }
        }
    }
}