using System;
using System.Collections.Generic;
using System.Globalization;
using Newtonsoft.Json;

namespace PortalGovi.Models
{
    /// <summary>Serializa fechas como en Service Layer, p. ej. 2026-03-04T00:00:00.000Z</summary>
    public sealed class SapDocDueDateJsonConverter : JsonConverter<DateTime>
    {
        private const string Format = "yyyy-MM-dd'T'HH:mm:ss.fff'Z'";

        public override void WriteJson(JsonWriter writer, DateTime value, JsonSerializer serializer)
        {
            var utc = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
            var midnight = new DateTime(utc.Year, utc.Month, utc.Day, 0, 0, 0, DateTimeKind.Utc);
            writer.WriteValue(midnight.ToString(Format, CultureInfo.InvariantCulture));
        }

        public override DateTime ReadJson(JsonReader reader, Type objectType, DateTime existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.Null) return default;
            if (reader.TokenType == JsonToken.String && DateTime.TryParse((string)reader.Value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dt))
                return dt;
            if (reader.TokenType == JsonToken.Date)
                return (DateTime)reader.Value;
            return default;
        }
    }

    public class SapQuotation
    {
        public string CardCode { get; set; }
        public int? Series { get; set; }
        public string U_BXP_PORTAL { get; set; }

        [JsonConverter(typeof(SapDocDueDateJsonConverter))]
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
