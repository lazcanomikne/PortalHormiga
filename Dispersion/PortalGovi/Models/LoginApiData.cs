using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PortalGovi.Models
{
    public class LoginApiData
    {
        public string CompanyDB { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }

        //public LoginApiData(string company, string user, string pass)
        //{
        //    CompanyDB = company;
        //    UserName = user;
        //    Password = pass;
        //}
    }
}
