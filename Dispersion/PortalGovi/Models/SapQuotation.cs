using System;
using System.Collections.Generic;

namespace PortalGovi.Models
{
    public class SapQuotation
    {
        public string CardCode { get; set; }
        public int? Series { get; set; }
        public string U_BXP_PORTAL { get; set; }
        public DateTime DocDueDate { get; set; }
        public int? SalesPersonCode { get; set; }
        public string Address { get; set; } // Billing address text
        public string Address2 { get; set; } // Shipping address text
        public List<SapQuotationLine> DocumentLines { get; set; } = new List<SapQuotationLine>();
    }

    public class SapQuotationLine
    {
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public double Quantity { get; set; }
        public double? Price { get; set; }
        public string Currency { get; set; }
    }
}
