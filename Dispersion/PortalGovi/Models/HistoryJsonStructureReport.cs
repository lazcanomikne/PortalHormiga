using System.Collections.Generic;

namespace PortalGovi.Models
{
    /// <summary>
    /// Resultado del análisis de homogeneidad estructural de JSON_CONTENT en COTIZACION_HISTORY.
    /// </summary>
    public class HistoryJsonStructureReport
    {
        public bool Truncated { get; set; }
        public int? MaxRowsRequested { get; set; }
        public int TotalRowsScanned { get; set; }
        public int ValidJsonRows { get; set; }
        public int InvalidJsonRows { get; set; }
        /// <summary>
        /// Todas las rutas de propiedades/objetos/arrays vistas en algún registro (unión).
        /// </summary>
        public List<string> UnionStructuralPaths { get; set; } = new List<string>();
        /// <summary>
        /// true si todos los JSON válidos tienen el mismo conjunto de rutas estructurales y no hay filas inválidas.
        /// </summary>
        public bool StructureFullyHomologated { get; set; }
        public List<HistoryJsonStructureRowDelta> Rows { get; set; } = new List<HistoryJsonStructureRowDelta>();
        public List<HistoryJsonParseError> ParseErrors { get; set; } = new List<HistoryJsonParseError>();
    }

    public class HistoryJsonStructureRowDelta
    {
        public int IdCotizacion { get; set; }
        public string FolioPortal { get; set; }
        public bool JsonValid { get; set; }
        /// <summary>
        /// Rutas presentes en la unión global pero ausentes en esta fila (estructura incompleta respecto al resto).
        /// </summary>
        public List<string> MissingPaths { get; set; } = new List<string>();
        /// <summary>
        /// Rutas en esta fila que no aparecen en ningún otro registro (estructura con ramas únicas).
        /// </summary>
        public List<string> UniqueExtraPaths { get; set; } = new List<string>();
        public bool MatchesUnionStructure { get; set; }
    }

    public class HistoryJsonParseError
    {
        public int IdCotizacion { get; set; }
        public string FolioPortal { get; set; }
        public string Error { get; set; }
    }
}
