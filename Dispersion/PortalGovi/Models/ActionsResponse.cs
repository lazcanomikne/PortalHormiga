using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PortalGovi.Models
{
    /// <summary>
    /// ok: bool
    /// message
    /// </summary>
    public class ActionsResponse
    {
        public ActionsResponse(bool ok, string message)
        {
            this.ok = ok;
            this.message = message;
        }
        public bool ok { get; set; }
        public string message { get; set; }
    }
}
