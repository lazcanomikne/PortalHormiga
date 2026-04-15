/**
 * UX para campos numéricos precargados con 0: al enfocar se vacía el valor
 * para que el usuario no tenga que borrar el cero; al salir, si quedó vacío
 * se restaura 0 para mantener el modelo y las validaciones.
 *
 * @param {Record<string, unknown>} target Objeto reactivo (p. ej. store.alimentacion)
 * @param {string} key Nombre de la propiedad
 */
export function clearZeroOnFocus(target, key) {
  const v = target[key];
  if (v === 0 || v === "0") {
    target[key] = null;
  }
}

/**
 * @param {Record<string, unknown>} target
 * @param {string} key
 */
export function restoreZeroIfEmptyOnBlur(target, key) {
  const raw = target[key];
  if (raw === "" || raw === null || raw === undefined) {
    target[key] = 0;
    return;
  }
  if (typeof raw === "string" && raw.trim() === "") {
    target[key] = 0;
    return;
  }
  const n = Number(raw);
  if (Number.isNaN(n)) {
    target[key] = 0;
  }
}

/**
 * Formato de miles con coma (p. ej. 1234567 → "1,234,567"). Conserva decimales con punto.
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatThousandsComma(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const n = Number(value);
  if (Number.isNaN(n)) {
    return "";
  }
  const isNeg = n < 0;
  const abs = Math.abs(n);
  const str = abs.toString();
  const [intPart, decPart] = str.split(".");
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = decPart !== undefined ? `${intFmt}.${decPart}` : intFmt;
  return isNeg ? `-${body}` : body;
}

/**
 * Interpreta texto con o sin comas como miles; vacío → 0.
 * @param {unknown} input
 * @returns {number}
 */
export function parseNumberLoose(input) {
  if (input === null || input === undefined) {
    return 0;
  }
  const s = String(input).replace(/,/g, "").trim();
  if (s === "") {
    return 0;
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}
