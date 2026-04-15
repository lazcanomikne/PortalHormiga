/**
 * Identificador estable por línea de artículo en la cotización (Pinia).
 * Necesario para enlazar ArticuloDefiniciones → selectedArticles al guardar.
 */
export function newArticuloLineUid() {
  return `ln-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function ensureArticuloLineUid(row) {
  if (row && (row.uId == null || row.uId === "")) {
    row.uId = newArticuloLineUid();
  }
  return row;
}
