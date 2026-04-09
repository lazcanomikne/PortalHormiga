using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using PortalGovi.Models;
using Sap.Data.Hana;

namespace PortalGovi.Services
{
    /// <summary>
    /// Compara la estructura (claves y anidamiento) de JSON_CONTENT en COTIZACION_HISTORY.
    /// Los valores pueden ser null; importa que existan las mismas propiedades y arrays.
    /// </summary>
    public class HistoryJsonStructureDiagnosticsService
    {
        private readonly string _connectionString;

        public HistoryJsonStructureDiagnosticsService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("HanaConnection");
        }

        public async Task<HistoryJsonStructureReport> AnalyzeAsync(int? maxRows = null)
        {
            var report = new HistoryJsonStructureReport
            {
                MaxRowsRequested = maxRows,
                Truncated = maxRows.HasValue && maxRows.Value > 0
            };

            var sql = @"
                SELECT IDCOTIZACION, FOLIO_PORTAL, JSON_CONTENT
                FROM MIKNE.COTIZACION_HISTORY
                ORDER BY IDCOTIZACION, FOLIO_PORTAL";

            if (maxRows.HasValue && maxRows.Value > 0)
                sql += " LIMIT " + Math.Min(maxRows.Value, 100000);

            using (var connection = new HanaConnection(_connectionString))
            {
                await connection.OpenAsync();
                var rows = (await connection.QueryAsync<dynamic>(sql)).ToList();
                report.TotalRowsScanned = rows.Count;

                var perRowPaths = new List<(int id, string folio, HashSet<string> paths, bool ok, string err)>();

                foreach (var row in rows)
                {
                    int id = row.IDCOTIZACION != null ? Convert.ToInt32(row.IDCOTIZACION) : 0;
                    string folio = row.FOLIO_PORTAL?.ToString() ?? "";
                    string json = row.JSON_CONTENT;

                    if (string.IsNullOrWhiteSpace(json))
                    {
                        report.InvalidJsonRows++;
                        report.ParseErrors.Add(new HistoryJsonParseError
                        {
                            IdCotizacion = id,
                            FolioPortal = folio,
                            Error = "JSON_CONTENT vacío o nulo"
                        });
                        perRowPaths.Add((id, folio, new HashSet<string>(StringComparer.Ordinal), false, "vacío"));
                        continue;
                    }

                    try
                    {
                        var token = JToken.Parse(json);
                        var paths = new HashSet<string>(StringComparer.Ordinal);
                        AddStructuralPaths(token, "", paths);
                        perRowPaths.Add((id, folio, paths, true, null));
                        report.ValidJsonRows++;
                    }
                    catch (Exception ex)
                    {
                        report.InvalidJsonRows++;
                        report.ParseErrors.Add(new HistoryJsonParseError
                        {
                            IdCotizacion = id,
                            FolioPortal = folio,
                            Error = ex.Message
                        });
                        perRowPaths.Add((id, folio, new HashSet<string>(StringComparer.Ordinal), false, ex.Message));
                    }
                }

                var union = new HashSet<string>(StringComparer.Ordinal);
                foreach (var (_, _, paths, ok, _) in perRowPaths)
                {
                    if (!ok) continue;
                    foreach (var p in paths)
                        union.Add(p);
                }

                report.UnionStructuralPaths = union.OrderBy(s => s, StringComparer.Ordinal).ToList();

                // Misma estructura = mismas rutas en todos los JSON válidos
                HashSet<string> referencePaths = null;
                report.StructureFullyHomologated = report.InvalidJsonRows == 0 && report.ValidJsonRows > 0;
                foreach (var (_, _, paths, ok, _) in perRowPaths)
                {
                    if (!ok) continue;
                    if (referencePaths == null)
                        referencePaths = new HashSet<string>(paths, StringComparer.Ordinal);
                    else if (!referencePaths.SetEquals(paths))
                        report.StructureFullyHomologated = false;
                }
                if (report.ValidJsonRows == 0)
                    report.StructureFullyHomologated = false;

                // Rutas que solo aparecen en una fila (frecuencia 1 entre válidos)
                var pathFrequency = new Dictionary<string, int>(StringComparer.Ordinal);
                foreach (var (_, _, paths, ok, _) in perRowPaths)
                {
                    if (!ok) continue;
                    foreach (var p in paths)
                        pathFrequency[p] = pathFrequency.TryGetValue(p, out var c) ? c + 1 : 1;
                }

                foreach (var (id, folio, paths, ok, _) in perRowPaths)
                {
                    var delta = new HistoryJsonStructureRowDelta
                    {
                        IdCotizacion = id,
                        FolioPortal = folio,
                        JsonValid = ok
                    };

                    if (ok)
                    {
                        delta.MissingPaths = union.Where(u => !paths.Contains(u)).OrderBy(s => s).ToList();
                        delta.UniqueExtraPaths = paths
                            .Where(p => pathFrequency.TryGetValue(p, out var f) && f == 1)
                            .OrderBy(s => s)
                            .ToList();
                        delta.MatchesUnionStructure = delta.MissingPaths.Count == 0 && delta.UniqueExtraPaths.Count == 0;
                    }

                    report.Rows.Add(delta);
                }
            }

            return report;
        }

        /// <summary>
        /// Recorre objetos y arrays; en arrays usa el primer elemento no nulo para inferir la forma de los ítems.
        /// </summary>
        private static void AddStructuralPaths(JToken token, string path, HashSet<string> set)
        {
            if (token == null || token.Type == JTokenType.Null || token.Type == JTokenType.Undefined)
                return;

            switch (token.Type)
            {
                case JTokenType.Object:
                    foreach (var prop in ((JObject)token).Properties())
                    {
                        var p = string.IsNullOrEmpty(path) ? prop.Name : path + "." + prop.Name;
                        set.Add(p);
                        AddStructuralPaths(prop.Value, p, set);
                    }
                    break;

                case JTokenType.Array:
                    var arrPath = path + "[]";
                    set.Add(arrPath);
                    foreach (var item in (JArray)token)
                    {
                        if (item != null && item.Type != JTokenType.Null)
                        {
                            AddStructuralPaths(item, arrPath, set);
                            break;
                        }
                    }
                    break;
            }
        }
    }
}
