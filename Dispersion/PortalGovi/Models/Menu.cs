using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PortalGovi.Models
{
    public class Menu
    {
        public string Tag { get; set; }
        public string Path { get; set; }
        public string Icon { get; set; }
        public List<Submenu> Submenu { get; set; }

    }

}
