import { useArticlesStore } from "@/stores/useArticlesStore";
import Docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions.js";
import { saveAs } from "file-saver";
import PizZip from "pizzip";

/**
 * Convierte un número a texto en español
 * @param {number} num - Número a convertir (0-100)
 * @returns {string} El número en texto
 */
function numeroATexto(num) {
  const unidades = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

  if (num < 0 || num > 100) return num.toString();
  if (num < 10) return unidades[num];
  if (num < 20) return especiales[num - 10];
  if (num === 20) return 'veinte';
  if (num < 30) return 'veinti' + unidades[num - 20];
  if (num === 100) return 'cien';

  const decena = Math.floor(num / 10);
  const unidad = num % 10;

  if (unidad === 0) return decenas[decena];
  return decenas[decena] + ' y ' + (unidad === 1 ? 'una' : unidades[unidad]);
}

/**
 * Extrae el nombre de la ciudad a partir de las siglas en el folio SAP
 * @param {string} folio - Folio SAP
 * @returns {string} Nombre de la ciudad o vacio
 */
function obtenerCiudadDeFolio(folio) {
  if (!folio) return "";
  const f = folio.toUpperCase();
  if (f.includes("MTY")) return "Monterrey, N.L.";
  if (f.includes("PUE")) return "Puebla, Pue.";
  if (f.includes("QRO")) return "Querétaro, Qro.";
  if (f.includes("GDL")) return "Guadalajara, Jal.";
  if (f.includes("MEX")) return "Estado de México";
  return "";
}

/**
 * Mapea el nombre largo del control a un nombre corto para el template
 * @param {string} control - Nombre del control
 * @returns {string} Nombre corto
 */
function mapControlLabel(control) {
  if (!control) return "";
  if (control === "Inversor / Velocidad variable") return "Inversor";
  if (control === "Contactores / Dos velocidades") return "Contactor";
  return control;
}

/**
 * Potencia motor de izaje según Control Gancho (misma lógica que velocidad: dos valores o uno).
 * @param {{ control?: string, potenciaMotorIzaje?: number|string, potenciaMotorIzaje2?: number|string }} p
 * @returns {string}
 */
function formatPotenciaMotorIzaje(p) {
  if (!p) return "0 Kw";
  const a = p.potenciaMotorIzaje ?? 0;
  const b = p.potenciaMotorIzaje2 ?? 0;
  if (p.control === "Contactores / Dos velocidades") {
    return `${a} / ${b} Kw`;
  }
  return `${a} Kw`;
}

/**
 * Etiquetas de lista que en código van con "- " al inicio: en Word se muestran como viñeta (•) + guión medio (en–).
 * @param {string|null|undefined} text
 * @returns {string}
 */
function conVinetaGuionMedio(text) {
  if (text == null || text === "") return "";
  const t = String(text);
  if (/^\s*-\s+/.test(t)) {
    return t.replace(/^\s*-\s+/, "\u2022 \u2013 ");
  }
  return t;
}

/**
 * Viñeta solo con guión medio (en–), sin bullet •. Acepta "- " o "• – " al inicio.
 * @param {string|null|undefined} text
 * @returns {string}
 */
function vinetaSoloGuionMedio(text) {
  if (text == null || text === "") return "";
  let t = String(text);
  if (/^\s*\u2022\s*\u2013\s+/.test(t)) {
    t = t.replace(/^\s*\u2022\s*\u2013\s+/, "\u2013 ");
  } else if (/^\s*-\s+/.test(t)) {
    t = t.replace(/^\s*-\s+/, "\u2013 ");
  }
  return t;
}

/**
 * Sanitiza una cadena de texto para evitar caracteres corruptos en XML (docxtemplater)
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena sin caracteres de control inválidos
 */
function sanitizeXML(str) {
  if (typeof str !== 'string') return str;
  // Elimina caracteres de control (0-31), excepto tab (9), salto de línea (10) y retorno de carro (13)
  // También elimina DEL (127)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Nombre de cliente para plantilla Word: siempre en mayúsculas y sin comillas (", ', «, tipográficas).
 * @param {unknown} str
 * @returns {string}
 */
function normalizarNombreClienteExport(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/["'`\u00AB\u00BB\u201C\u201D\u2018\u2019\u2032\u2033\u2035\u2036]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/**
 * Combo / JSON puede traer { title, value } o un string "ItemCode · nombre · Disp.: n".
 * La plantilla Word debe mostrar solo el código de artículo.
 * @param {unknown} raw
 * @returns {string}
 */
function soloCodigoConstruccionParaPlantilla(raw) {
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && raw !== null) {
    const v = raw.value ?? raw.itemCode ?? raw.ItemCode;
    if (v != null && v !== "") return String(v).trim();
    if (raw.title != null && raw.title !== "") {
      const t = String(raw.title);
      if (t.includes(" · ")) return t.split(" · ")[0].trim();
      return t.trim();
    }
  }
  const s = String(raw).trim();
  if (s.includes(" · ")) return s.split(" · ")[0].trim();
  return s;
}

/**
 * Sanitiza recursivamente un objeto o array eliminando caracteres XML inválidos de todos los strings
 * @param {any} obj - Objeto o valor a sanitizar
 * @returns {any} Objeto sanitizado
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeXML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    // Si es un objeto complejo (como Date o similar que no queremos mutar), lo retornamos tal cual
    const prototype = Object.getPrototypeOf(obj);
    if (prototype !== Object.prototype && prototype !== null) {
      return obj;
    }

    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Servicio para generar PDF/HTML de cotización
 */
export class PDFGeneratorService {
  constructor() {
    this.store = useArticlesStore();
  }
  /**
   * Carga la plantilla Word desde assets
   * @returns {Promise<ArrayBuffer>} Buffer de la plantilla
   */
  async cargarPlantillaWord() {
    try {
      // Se agrega timestamp como cache-buster para asegurar que siempre descargue la última versión
      const response = await fetch(`/assets/Cotizacion_Nueva_Con_Etiquetas.docx?v=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error(`Error cargando plantilla: ${response.status}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error cargando plantilla Word:", error);
      throw error;
    }
  }


  /**
   * Genera y descarga el documento Word de la cotización
   * @param {Object} cotizacionCompleta - Datos completos de la cotización
   */
  async generarYDescargarWord(cotizacionCompleta) {
    try {
      // Manejo defensivo de dirección de entrega
      const direccionEntrega = cotizacionCompleta.encabezado?.direccionEntrega || 
                               cotizacionCompleta.encabezado?.dirEntrega || 
                               cotizacionCompleta.direccionEntrega || 
                               cotizacionCompleta.dirEntrega || "";
      
      console.log('=== DEBUG DIRECCION ENTREGA ===');
      console.log('direccionEntrega raw:', direccionEntrega);
      console.log('cotizacionCompleta.encabezado:', cotizacionCompleta.encabezado);
      // Parsing de dirección
      // Parsing de dirección
      // Parsing de dirección
      const values = direccionEntrega.split(",");
      // Nuevo formato: Calle, Colonia, Ciudad, Estado, CP, Pais
      const ciudad = values.length >= 3 ? values[2].trim() : "";
      const estado = values.length >= 4 ? values[3].trim() : "";
      const ubicacion = (ciudad || estado) ? `${ciudad}${ciudad && estado ? ', ' : ''}${estado}` : "Ubicación no especificada";

      // Cargar la plantilla
      const plantillaBuffer = await this.cargarPlantillaWord();

      // Crear el zip con la plantilla
      const zip = new PizZip(plantillaBuffer);

      // Configurar Angular Parser
      const angularParser = expressionParser.configure({
        filters: {
          where(input, query) {
            return (input || []).filter((item) =>
              expressionParser.compile(query)(item)
            );
          },
          filtersArticles(list) {
            if (!list || !Array.isArray(list) || !cotizacionCompleta.productos) return [];

            try {
              const result = list
                .filter((item) => {
                  if (!item || !item.codigo) return false;
                  return cotizacionCompleta.productos.find((article) => article.itemCode === item.codigo);
                })
                .map((item) => {
                  const article = cotizacionCompleta.productos.find((article) => article.itemCode === item.codigo);

                  if (!article) return item;

                  // Mapeo seguro de controles
                  const controles = (article.definiciones?.datosBasicos?.controles || [])
                    .map((control) => control?.tipoControl)
                    .filter(Boolean)
                    .join(" + ");

                  // Mapeo seguro de montaje
                  let textoMontaje = "";
                  if (article.definiciones?.montaje) {
                    const tieneMontaje = Object.keys(article.definiciones.montaje)
                      .some((key) => article.definiciones.montaje[key] == true);

                    if (tieneMontaje) {
                      textoMontaje = "Incluye montaje y puesta en marcha. Las grúas móviles para las maniobras de montaje y las plataformas para trabajos en alturas no están incluidas";
                    }
                  }

                  // Estructura ArticuloDefiniciones para el template (Scope Local del Producto)
                  const def = article.definiciones || {};
                  const db = def.datosBasicos || {};
                  const ca = def.carro || {};
                  const iz = def.gancho || def.izaje || {};
                  const pu = def.puente || {};

                  const femParts = (db.equivalenteFemValue || "").split("/");
                  const ArticuloDefiniciones = {
                    'Datos Basicos': {
                      'Capacidad de la(s) grúa(s)': Object.assign(new String(db.capacidadGrua || 0), {
                        toneladas: (db.capacidadGrua || 0) / 1000,
                        kg: db.capacidadGrua || 0
                      }),
                      ' Capacidad de la(s) grúa(s)': Object.assign(new String(db.capacidadGrua || 0), {
                        toneladas: (db.capacidadGrua || 0) / 1000,
                        kg: db.capacidadGrua || 0
                      }),
                      'FEM9.511/CMAA/ISO': {
                        CMAA: femParts[1]?.trim() || "",
                        'FEM9.511': femParts[0]?.trim() || "",
                        ISO: femParts[2]?.trim() || ""
                      },
                      'Claro': Object.assign(new String(db.claro || 0), {
                        metros: (db.claro || 0) / 1000,
                        mm: db.claro || 0
                      }),
                      ' Claro': Object.assign(new String(db.claro || 0), {
                        metros: (db.claro || 0) / 1000,
                        mm: db.claro || 0
                      }),
                      'Gancho(s)': {
                        'Cantidad de ganchos': db.cantidadGanchos || 0
                      },
                      'etiquetaCapacidadToneladas': db.etiquetaCapacidadToneladas || ((db.capacidadGruas || 0) / 1000),
                      'etiquetaIzaje': db.etiquetaIzaje || (db.izaje || 0),
                      'etiquetaClasificacionCompleta': db.etiquetaClasificacionCompleta || (function () {
                        const val = db.equivalenteFemValue || "";
                        if (!val) return "";
                        const parts = val.split("/");
                        if (parts.length < 3) return "";
                        const fem = parts[0]?.trim() || "";
                        const cmaa = parts[1]?.trim() || "";
                        const iso = parts[2]?.trim() || "";
                        return `– Clasificación: FEM ${fem} / ISO ${iso} / CMAA clase "${cmaa}"`;
                      })(),
                      'Peso muerto de la grúa': db.pesoMuertoGrua || 0,
                      'Reacción máxima por rueda': db.reaccionMaximaRueda || 0,
                      'Tipo de Control': {
                        'Control 1': { 'Tipo de control': db.controles?.[0]?.tipoControl || "" },
                        'Control 2': { 'Tipo de control': db.controles?.[1]?.tipoControl || "" }
                      },
                      'etiquetaCabinaAireAcondicionado': (db.controles || []).some(c => c?.tipoControl === 'Cabina')
                        ? "La cabina tendrá aire acondicionado y será adecuada para operar dentro de una temperatura ambiente de hasta 70 °C"
                        : ""
                    },
                    Carro: {
                      'Cantidad de carros': ca.cantidadCarros || 0,
                      Observaciones: ca.observaciones || ca.Observaciones || "",
                      'Carro 1': {
                        'Control de carro': ca.carros?.[0]?.control || "",
                        'Control carro': mapControlLabel(ca.carros?.[0]?.control || ""),
                        'Control carro completo': ca.carros?.[0]?.control || "",
                        'Reductor': ca.carros?.[0]?.reductor || ca.carros?.[0]?.Reductor || "",
                        'Velocidad de carro': ca.carros?.[0]?.velocidad1 || 0,
                        'Cantidad de ruedas traslacion': ca.carros?.[0]?.cantidadRuedasTraslacion || 0,
                        'Diametro de rueda (mm)': ca.carros?.[0]?.diametroRuedas || 0,
                        'Velocidad de traslación en m/min': ca.carros?.[0]?.velocidadTraslacion || 0,
                        'etiquetaTopeHidraulicoCarro': ca.etiquetaTopeHidraulicoCarro || (ca.carros?.[0]?.topeHidraulico === true
                          ? "- 4 topes hidráulicos para el movimiento del carro."
                          : ""),
                        'etiquetaVelocidadCarro': ca.etiquetaVelocidadCarro || (function () {
                          if (!ca.carros || ca.carros.length === 0) return "";
                          const c = ca.carros[0];
                          const control = c.control || "";
                          if (control === 'Contactores / Dos velocidades') {
                            return `${c.velocidad1 || 0} / ${c.velocidad2 || 0} m/min`;
                          }
                          return `${c.velocidad1 || 0} m-min`;
                        })(),
                        'etiquetaReductorCarro1': ca.etiquetaReductorCarro1 || (ca.carros?.[0]?.reductor || ca.carros?.[0]?.Reductor || ""),
                        'etiquetaMotorModeloCarro1': ca.etiquetaMotorModeloCarro1 || (ca.carros?.[0]?.motorModelo || ca.carros?.[0]?.MotorModelo || ""),
                        'etiquetaPotenciaCarro1': ca.etiquetaPotenciaCarro1 || (function () {
                          if (!ca.carros || ca.carros.length === 0) return "";
                          const c = ca.carros[0];
                          const control = c.control || "";
                          if (control === 'Contactores / Dos velocidades') {
                            return `${c.velocidad1 || 0}/${c.velocidad2 || 0} Kw`;
                          }
                          return `${c.velocidad1 || 0} Kw`;
                        })()
                      },
                      'Carro1': {
                        'Control de carro': ca.carros?.[0]?.control || "",
                        'Control carro': mapControlLabel(ca.carros?.[0]?.control || ""),
                        'Control carro completo': ca.carros?.[0]?.control || "",
                        'Reductor': ca.carros?.[0]?.reductor || ca.carros?.[0]?.Reductor || "",
                        'Velocidad de carro': ca.carros?.[0]?.velocidad1 || 0,
                        'Cantidad de ruedas traslacion': ca.carros?.[0]?.cantidadRuedasTraslacion || 0,
                        'Diametro de rueda (mm)': ca.carros?.[0]?.diametroRuedas || 0,
                        'Velocidad de traslación en m/min': ca.carros?.[0]?.velocidadTraslacion || 0,
                        'etiquetaTopeHidraulicoCarro': ca.etiquetaTopeHidraulicoCarro || (ca.carros?.[0]?.topeHidraulico === true
                          ? "- 4 topes hidráulicos para el movimiento del carro."
                          : ""),
                        'etiquetaVelocidadCarro': ca.etiquetaVelocidadCarro || (function () {
                          if (!ca.carros || ca.carros.length === 0) return "";
                          const c = ca.carros[0];
                          const control = c.control || "";
                          if (control === 'Contactores / Dos velocidades') {
                            return `${c.velocidad1 || 0} / ${c.velocidad2 || 0} m/min`;
                          }
                          return `${c.velocidad1 || 0} m-min`;
                        })(),
                        'etiquetaReductorCarro1': ca.etiquetaReductorCarro1 || (ca.carros?.[0]?.reductor || ca.carros?.[0]?.Reductor || ""),
                        'etiquetaMotorModeloCarro1': ca.etiquetaMotorModeloCarro1 || (ca.carros?.[0]?.motorModelo || ca.carros?.[0]?.MotorModelo || ""),
                        'etiquetaPotenciaCarro1': ca.etiquetaPotenciaCarro1 || (function () {
                          if (!ca.carros || ca.carros.length === 0) return "";
                          const c = ca.carros[0];
                          const control = c.control || "";
                          if (control === 'Contactores / Dos velocidades') {
                            return `${c.velocidad1 || 0}/${c.velocidad2 || 0} Kw`;
                          }
                          return `${c.velocidad1 || 0} Kw`;
                        })()
                      }
                    },
                    Gancho: {
                      'Gancho 1': {
                        'Control Gancho': iz.polipastos?.[0]?.control || "",
                        'Control gancho': mapControlLabel(iz.polipastos?.[0]?.control || ""),
                        'Control gancho completo': iz.polipastos?.[0]?.control || "",
                        'Codigo de construcción': soloCodigoConstruccionParaPlantilla(
                          iz.polipastos?.[0]?.codigoConstruccion || iz.polipastos?.[0]?.codigoContruccion || iz.polipastos?.[0]?.codigoConstruccion1 || db.codigoConstruccion || db.codigoContruccion || ""
                        ),
                        ' Geometría de ramales': iz.polipastos?.[0]?.geometriaRamales || "",
                        'Geometría de ramales': iz.polipastos?.[0]?.geometriaRamales || "",
                        'Izaje Gancho': iz.polipastos?.[0]?.izajeGancho || 0,
                        'Velocidad de Izaje Gancho': iz.polipastos?.[0]?.velocidadIzaje1 || 0,
                        'Motor/modelo': iz.polipastos?.[0]?.motorModelo || iz.polipastos?.[0]?.motorModeloGanchoPrincipal || iz.polipastos?.[0]?.velocidadIzajeMotorModelo || "",
                        'Tipo de freno': (function () {
                          const tf = iz.polipastos?.[0]?.tipoFreno || "";
                          return tf === "Freno electrohidraulico"
                            ? "Freno de zapata doble con un par de frenado del 250 % del par motor."
                            : tf;
                        })(),
                        'Freno emergencia': iz.polipastos?.[0]?.frenoEmergencia ? "Si" : "No",
                        'Potencia motor de izaje': formatPotenciaMotorIzaje(iz.polipastos?.[0]),
                        'etiquetaVoltajeOperacionGancho1': iz.etiquetaVoltajeOperacionGancho1 || (iz.polipastos?.[0]?.voltajeOperacion || ""),
                        'etiquetaVoltajeControlGancho1': iz.etiquetaVoltajeControlGancho1 || (iz.polipastos?.[0]?.voltajeControl || "")
                      },
                      'Gancho1': {
                        'Control Gancho': iz.polipastos?.[0]?.control || "",
                        'Control gancho': mapControlLabel(iz.polipastos?.[0]?.control || ""),
                        'Control gancho completo': iz.polipastos?.[0]?.control || "",
                        'Codigo de construcción': soloCodigoConstruccionParaPlantilla(
                          iz.polipastos?.[0]?.codigoConstruccion || iz.polipastos?.[0]?.codigoContruccion || iz.polipastos?.[0]?.codigoConstruccion1 || db.codigoConstruccion || db.codigoContruccion || ""
                        ),
                        ' Geometría de ramales': iz.polipastos?.[0]?.geometriaRamales || "",
                        'Geometría de ramales': iz.polipastos?.[0]?.geometriaRamales || "",
                        'Izaje Gancho': iz.polipastos?.[0]?.izajeGancho || 0,
                        'Velocidad de Izaje Gancho': iz.polipastos?.[0]?.velocidadIzaje1 || 0,
                        'Motor/modelo': iz.polipastos?.[0]?.motorModelo || iz.polipastos?.[0]?.motorModeloGanchoPrincipal || iz.polipastos?.[0]?.velocidadIzajeMotorModelo || "",
                        'Tipo de freno': (function () {
                          const tf = iz.polipastos?.[0]?.tipoFreno || "";
                          return tf === "Freno electrohidraulico"
                            ? "Freno de zapata doble con un par de frenado del 250 % del par motor."
                            : tf;
                        })(),
                        'Freno emergencia': iz.polipastos?.[0]?.frenoEmergencia ? "Si" : "No",
                        'Potencia motor de izaje': formatPotenciaMotorIzaje(iz.polipastos?.[0]),
                        'etiquetaVoltajeOperacionGancho1': iz.etiquetaVoltajeOperacionGancho1 || (iz.polipastos?.[0]?.voltajeOperacion || ""),
                        'etiquetaVoltajeControlGancho1': iz.etiquetaVoltajeControlGancho1 || (iz.polipastos?.[0]?.voltajeControl || "")
                      },
                      'Gancho 2': {
                        'Izaje Gancho': iz.polipastos?.[1]?.izajeGancho || 0
                      },
                      'Gancho2': {
                        'Izaje Gancho': iz.polipastos?.[1]?.izajeGancho || 0
                      },
                      'Gancho 3': {
                        'Izaje Gancho': iz.polipastos?.[2]?.izajeGancho || 0
                      },
                      'Gancho3': {
                        'Izaje Gancho': iz.polipastos?.[2]?.izajeGancho || 0
                      },
                      'Voltaje de operación trifásico': db.tensionServicio || "",
                      'Voltaje de Control': db.tensionControl || "",
                      'etiquetaAlturasIzaje': iz.etiquetaAlturasIzaje || (iz.polipastos || [])
                        .map((p, index) => `- Altura de Izaje con gancho ${index + 1} : ${p.izajeGancho || 0} mm`)
                        .join("\n"),
                      'etiquetaVelocidadIzaje': iz.etiquetaVelocidadIzaje || (function () {
                        if (!iz.polipastos || iz.polipastos.length === 0) return "";
                        const p = iz.polipastos[0];
                        return (p.control === 'Contactores / Dos velocidades')
                          ? `${p.velIzaje1 || 0} / ${p.velIzaje2 || 0} m/min`
                          : `${p.velIzaje1 || 0} m-min`;
                      })(),
                      'etiquetaFrenoEmergencia': iz.etiquetaFrenoEmergencia || (function () {
                        if (!iz.polipastos || iz.polipastos.length === 0) return "";
                        const p = iz.polipastos[0];
                        return (p.frenoEmergencia === true)
                          ? "- Consideramos un freno de emergencia en el tambor que se activa cada vez que se detecta un incremento en la velocidad del tambor."
                          : "";
                      })(),
                      'etiquetaFrenoEmergenciaSegundo': iz.etiquetaFrenoEmergenciaSegundo || (function () {
                        if (!iz.polipastos || iz.polipastos.length === 0) return "";
                        const p = iz.polipastos[0];
                        return (p.frenoEmergencia === true)
                          ? "Incluye un 2.o freno de emergencia para el movimiento de elevación"
                          : "";
                      })()
                    },
                    Puente: {
                      'Control de puente': pu.controlPuente || "",
                      'Material de ruedas': pu.ruedasMotrices?.materialRuedas || "",
                      'Cantidad de motorreductores': pu.cantidadMotorreductores || 0,
                      'Reductor': pu.reductor || pu.Reductor || "",
                      'Motor/Modelo': pu.motorModelo || "",
                      'Motor/Potencia(Kw)': pu.motorPotencia1 || 0,
                      'Tope hidraulico': pu.topeHidraulico ? "Si" : "No",
                      'Velocidad de puente': pu.velocidad1 || 0,
                      'Total de ruedas (pzas)': pu.cantidadRuedas || 0,
                      'Ruedas motrices': {
                        'Diametro de ruedas(mm)': pu.diametroRuedas || 0,
                        'Material de ruedas': pu.materialRuedas || ""
                      },
                      'Observaciones': pu.observaciones || "",
                      'Tipo de alimentacion': pu.tipoAlimentacion || "",
                      'Interruptor limite de 2 pasos delantero': pu.interruptorLimite2PasosDelantero ? "Si" : "No",
                      'Interruptor limite de 2 pasos trasero': pu.interruptorLimite2PasosTrasero ? "Si" : "No",
                      'Interruptor limite de 2 pasos delanteros': pu.interruptorLimite2PasosDelantero ? "Si" : "No",
                      'Interruptor limite de 2 pasos traseros': pu.interruptorLimite2PasosTrasero ? "Si" : "No",
                      'Sistema anticolicion delantero': pu.sistemaAnticolisionDelantero ? "Si" : "No",
                      'Sistema anticolicion traseros': pu.sistemaAnticolisionTrasero ? "Si" : "No",
                      'Sistema anticolicion Trasero': pu.sistemaAnticolisionTrasero ? "Si" : "No",
                      'etiquetaTopeHidraulicoPuente': pu.etiquetaTopeHidraulicoPuente || (pu.topeHidraulico === true
                        ? "- 4 topes hidráulicos para el movimiento del puente"
                        : ""),
                      'etiquetaVelocidadPuente': pu.etiquetaVelocidadPuente || (function () {
                        const control = pu.controlPuente || "";
                        if (control === 'Contactores / Dos velocidades') {
                          return `${pu.velocidad1 || 0}/${pu.velocidad2 || 0} m/min`;
                        }
                        return `${pu.velocidad1 || 0} m-min`;
                      })(),
                      'etiquetaDiametroRuedasPuente': pu.etiquetaDiametroRuedasPuente || (pu.ruedasMotrices?.diametroRuedas || 0),
                      'etiquetaTotalRuedasPuente': pu.etiquetaTotalRuedasPuente || ((pu.ruedasMotrices?.cantidadRuedas || 0) + (pu.ruedasLocas?.cantidadRuedas || 0)),
                      'etiquetaMotorModeloPuente': pu.etiquetaMotorModeloPuente || (pu.motorModeloPuente || ""),
                      'etiquetaPotenciaPuente': pu.etiquetaPotenciaPuente || (function () {
                        const control = pu.controlPuente || "";
                        if (control === 'Contactores / Dos velocidades') {
                          return `${pu.motorPotenciaKw1 || 0}/${pu.motorPotenciaKw2 || 0} Kw`;
                        }
                        return `${pu.motorPotenciaKw1 || 0} Kw`;
                      })(),
                      'etiquetaInterruptorLimitePuente': vinetaSoloGuionMedio(
                        pu.etiquetaInterruptorLimitePuente || (pu.switchLimFinCarrDel === true && pu.interLimFinCarrTras === true
                          ? "- Sistema de Interruptor limite de 2 pasos en ambas direcciones de traslacion Puente."
                          : "")
                      ),
                      'etiquetaSistemaInterruptorAnticolision': vinetaSoloGuionMedio(
                        pu.etiquetaSistemaInterruptorAnticolision || (function () {
                          const switchDel = pu.switchLimFinCarrDel === true;
                          const interTras = pu.interLimFinCarrTras === true;
                          const anticolDel = pu.sisAnticolisionDel === true;
                          const anticolTras = pu.sisAnticolisionTras === true;
                          if (switchDel && anticolDel && !interTras && !anticolTras) {
                            return "- Sistema de Interruptor limite de 2 pasos en traslado delantero y sistema anticolicion del lado opuesto.";
                          }
                          if (interTras && anticolTras && !switchDel && !anticolDel) {
                            return "- Sistema de Interruptor limite de 2 pasos en traslado delantero y sistema anticolicion del lado opuesto.";
                          }
                          return "";
                        })()
                      ),
                      'etiquetaSistemaAnticolisionAmbos': vinetaSoloGuionMedio(
                        pu.etiquetaSistemaAnticolisionAmbos || (pu.sisAnticolisionDel === true && pu.sisAnticolisionTras === true
                          ? "- Sistema anticolicion en ambas dicecciones de traslacion puente"
                          : "")
                      ),
                      'etiquetaVelocidadTraslacionPuente': pu.velocidadTraslacionPuente === 'Otros' ? (pu.especifiqueVelocidadTraslacionPuente || "") : (pu.velocidadTraslacionPuente || "")
                    },
                    Montaje: textoMontaje
                  };

                  return {
                    ...item,
                    ...article,
                    ArticuloDefiniciones, // Incluimos el mapeo estructurado
                    etiquetaFrenoEmergencia: ArticuloDefiniciones.Gancho ? ArticuloDefiniciones.Gancho.etiquetaFrenoEmergencia : "",
                    etiquetaFrenoEmergenciaSegundo: ArticuloDefiniciones.Gancho ? ArticuloDefiniciones.Gancho.etiquetaFrenoEmergenciaSegundo : "",
                    etiquetaCabinaAireAcondicionado: ArticuloDefiniciones['Datos Basicos'] ? ArticuloDefiniciones['Datos Basicos'].etiquetaCabinaAireAcondicionado : "",
                    etiquetaControlPuente: ArticuloDefiniciones.Puente ? ArticuloDefiniciones.Puente['Control de puente'] : "",
                    controles,
                    textoMontaje,
                    ubicacion
                  }
                });
              return result;
            } catch (e) {
              console.error("Error in filtersArticles:", e);
              return [];
            }
          },
          filtersDefiniciones(list, field) {
            if (!list || !Array.isArray(list)) return [];
            return list.filter((item) => item && item.itemCode === field);
          },
          sumBy(input, field) {
            if (!input || !Array.isArray(input)) {
              return 0;
            }
            return input.reduce(
              (sum, object) => sum + (object && object[field] ? (+object[field]) : 0),
              0
            );
          },
          currency(input) {
            if (input === null || input === undefined) return "0.00";
            const val = parseFloat(input);
            if (isNaN(val)) return "0.00";
            return val.toFixed(2).replace(",", ".").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        },
      });

      // Custom Parser Híbrido
      // Angular Parser maneja filtros, pero falla con espacios/guiones en claves.
      // Este parser intercepta accesos simples (sin filtros) y los resuelve manualmente.
      const customParser = (tag) => {
        tag = tag.trim();

        // 1. Si usa filtros ('|'), delegamos al Angular Parser (asumimos que la clave es válida o ya sanitizada)
        // Intentamos sanitizar levemente la primera parte si tiene espacios
        if (tag.includes('|')) {
          const sections = tag.split('|');
          let path = sections[0].trim();

          // Sanitización básica para filtros: si tiene puntos y no corchetes
          if (path.includes('.') && !path.includes('[')) {
            // Solo si el path "parece" estándar pero tiene espacios
            // Riesgoso si es una expresión compleja, pero útil para casos comunes
            // Dejamos esto como estaba para los filtros
            const parts = path.split('.');
            let transformed = parts[0].trim();
            // Si el primer elemento tiene espacios/guiones, angular fallará. 
            // Pero es dificil arreglarlo string-manipulation sin contexto.
            // Esperamos que el usuario use claves limpias con filtros.
            if (transformed.includes(' ') || transformed.includes('-')) {
              // Fallback: no sanitizar, dejar que angular falle o funcione
            } else {
              for (let i = 1; i < parts.length; i++) {
                transformed += `['${parts[i].trim()}']`;
              }
              sections[0] = transformed;
            }
          }
          return angularParser(sections.join('|'));
        }

        // 2. Para etiquetas simples (A.B.C), usamos un "getter" manual seguro
        // Esto permite claves con espacios, guiones, slashes, frases enteras, etc.
        return {
          get: (scope, context) => {
            // 'scope' es el objeto de datos actual (puede ser el global o un elemento de un loop)
            // docxtemplater maneja el "scope climbing" automáticamente si retornamos undefined?
            // No, con custom get, nosotros somos responsables.
            // Pero usualmente docxtemplater pasa {scope: current, context: {scopeList:...}}

            // Algoritmo de resolución de ruta:
            if (tag === '.') return scope;

            const parts = tag.split('.');
            let current = scope;

            for (let i = 0; i < parts.length; i++) {
              const key = parts[i].trim();
              if (current === null || current === undefined) return "";
              current = current[key];
            }

            return (current === undefined || current === null) ? "" : current;
          }
        };
      };

      // Crear el docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: false, // Cambiamos a false para evitar que se coma toda la línea
        linebreaks: true,
        parser: customParser,
      });

      // Mapear los datos de forma robusta
      // El objeto puede venir plano (desde el formulario) o anidado (desde el listado)
      const src = cotizacionCompleta.encabezado || cotizacionCompleta;

      const rawClienteNombre = src.clienteNombre || src.ClienteNombre || src.cliente || cotizacionCompleta.cliente || "";
      const clienteNombreNorm = normalizarNombreClienteExport(rawClienteNombre);

      const encabezadoBase = {
        ...src,
        id: src.id || cotizacionCompleta.id || "",
        clienteNombre: clienteNombreNorm,
        ClienteNombre: clienteNombreNorm,
        cliente: clienteNombreNorm,
        direccionEntrega: src.direccionEntrega || src.dirEntrega || src.DireccionEntrega || src.DirEntrega || cotizacionCompleta.direccionEntrega || "",
        referencia: src.referencia || cotizacionCompleta.referencia || "",
        folioPortal: src.folioPortal || src.id || cotizacionCompleta.id || "",
        folioSap: src.folioSap || src.folioSAP || src.FolioSap || src.FolioSAP || cotizacionCompleta.folioSap || cotizacionCompleta.folioSAP || "",
        personaContacto: (src.personaContacto || src.personaNombre || src.contacto || cotizacionCompleta.personaContacto || "").replace(/_/g, " "),
        // Vendedores - Mapeo robusto para soportar objeto completo, ID o nombre string
        vendedorNombre: (
          src.vendedor?.slpName ||
          (typeof src.vendedor === 'string' ? src.vendedor : "") ||
          src.vendedorNombre ||
          cotizacionCompleta.vendedor?.slpName || ""
        ),
        vendedorTelefono: (src.vendedor?.telephone || cotizacionCompleta.vendedor?.telephone || ""),
        vendedorMobil: (src.vendedor?.mobil || cotizacionCompleta.vendedor?.mobil || ""),
        vendedorEmail: (src.vendedor?.email || cotizacionCompleta.vendedor?.email || ""),

        vendedorSecNombre: (
          src.vendedorSec?.slpName ||
          (typeof src.vendedorSec === 'string' ? src.vendedorSec : "") ||
          src.vendedorSecNombre ||
          cotizacionCompleta.vendedorSec?.slpName || ""
        ),
        vendedorSecTelefono: (src.vendedorSec?.telephone || cotizacionCompleta.vendedorSec?.telephone || ""),
        vendedorSecMobil: (src.vendedorSec?.mobil || cotizacionCompleta.vendedorSec?.mobil || ""),
        vendedorSecEmail: (src.vendedorSec?.email || cotizacionCompleta.vendedorSec?.email || ""),
        tiempoEntrega: src.tiempoEntrega || cotizacionCompleta.tiempoEntrega || "",
      };

      // Lógica para generar SuReferenciaProductos
      const gruasAgrupadas = (cotizacionCompleta.productos || []).reduce((acc, current) => {
        const capacidadKg = current.definiciones?.datosBasicos?.capacidadGrua || 0;
        const capacidadTons = capacidadKg / 1000;
        const key = `${current.itemCode}_${capacidadTons}`;
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            capacidad: capacidadTons,
            itemName: current.itemName || "Grúa sin nombre",
            itemCode: current.itemCode
          };
        }
        acc[key].count += (current.qty || 1);
        return acc;
      }, {});

      const listaGruas = Object.values(gruasAgrupadas);
      const fragmentos = listaGruas.map(g =>
        `${g.count} grúa(s) viajera(s) de ${g.capacidad} toneladas`
      );

      const primerProductoBase = (cotizacionCompleta.productos && cotizacionCompleta.productos.length > 0) ? cotizacionCompleta.productos[0] : null;
      const cmaaRaw = primerProductoBase?.definiciones?.datosBasicos?.equivalenteFemValue || "F";
      const cmaaValue = cmaaRaw.split("/")[1]?.replace(/CMAA/gi, "").trim() || "F";

      encabezadoBase.SuReferenciaProductos = `Fabricación, diseño, entrega, montaje y prueba de ${fragmentos.join(" + ")} métricas/Clase “${cmaaValue}” según la CMAA.`;

      // Calcular el total de grúas y convertirlo a texto
      const totalGruas = listaGruas.reduce((sum, g) => sum + g.count, 0);
      const palabraGrua = totalGruas === 1 ? 'grúa' : 'grúas';
      encabezadoBase.TotalGruasTexto = `${numeroATexto(totalGruas)} ${palabraGrua}`;

      // Estructura Oferta Global
      const Oferta = {
        Cliente: { 'Nombre del Cliente': encabezadoBase.clienteNombre },
        'Direccion de Entrega': {
          toString: () => encabezadoBase.direccionEntrega,
          Ciudad: {
            toString: () => ciudad,
            Estado: {
              toString: () => estado
            }
          }
        },
        'Persona de Contacto': encabezadoBase.personaContacto,
        Referencia: encabezadoBase.referencia,
        'Folio Sap': encabezadoBase.folioSap || "Pendiente",
        'Folio Portal': encabezadoBase.folioPortal,
        'Vendedor principal': {
          toString: () => encabezadoBase.vendedorNombre,
          A: {
            Telephone: encabezadoBase.vendedorTelefono,
            Mobil: encabezadoBase.vendedorMobil,
            Email: encabezadoBase.vendedorEmail
          }
        },
        'Vendedor Secundario': {
          toString: () => encabezadoBase.vendedorSecNombre,
          A: {
            Telephone: encabezadoBase.vendedorSecTelefono,
            Mobil: encabezadoBase.vendedorSecMobil,
            Email: encabezadoBase.vendedorSecEmail
          }
        },
        'Vendedor secundario': { // Alias por case sensitivity en template
          toString: () => encabezadoBase.vendedorSecNombre,
          A: {
            Telephone: encabezadoBase.vendedorSecTelefono,
            Mobil: encabezadoBase.vendedorSecMobil,
            Email: encabezadoBase.vendedorSecEmail
          }
        },
        Cantidad: {
          'Suma de Cantidad de Gruas de la misma Capacidad': listaGruas[0]?.count || 0,
          'Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras': listaGruas[1]?.count || ""
        },
        Resumen: {
          Capacidad: {
            'Diferentes a las primeras': listaGruas[1]?.capacidad || ""
          }
        },
        'Nombre de Grúa': listaGruas[0]?.itemName || "",
        'Código de Grúa': listaGruas[0]?.itemCode || "",
        'Términos de Entrega': encabezadoBase.terminosEntrega || "",
        'Tiempo de Entrega': encabezadoBase.tiempoEntrega || ""
      };

      // Mapeo de Bahia (Primer bahía)
      const primeraBahia = cotizacionCompleta.bahias && cotizacionCompleta.bahias.length > 0
        ? cotizacionCompleta.bahias[0] : {};
      const defBahia = primeraBahia.definiciones || {};

      const BahiaDefiniciones = {
        Alimentacion: {
          'Longitud del sistema (m)': defBahia.alimentacion?.longitudSistema || 0,
          'Amperaje (amp)': defBahia.alimentacion?.amperaje || 0,
          'Localizacion de acometida': defBahia.alimentacion?.localAcometida || ""
        },
        Riel: {
          'Metros lineales de riel': defBahia.riel?.metrosLinealesRiel || 0,
          'Tipo de riel(m)': {
            toString: () => defBahia.riel?.tipoRiel || "",
            Burbach: defBahia.riel?.tipoRiel || "" // Mismo valor para referencia directa
          },
          'etiquetaTipoRiel': defBahia.riel?.etiquetaTipoRiel || (defBahia.riel?.especifiqueTipoRiel || ""),
          'etiquetaObservacionesRiel': defBahia.riel?.etiquetaObservacionesRiel || (defBahia.riel?.observaciones || ""),
          'Calidad/Material riel según EN10025': defBahia.riel?.calidadMaterialRiel || "",
          'Observaciones.': defBahia.riel?.observaciones || ""
        }
      };

      // Mapeo Formacion Precios (Pinia guarda en formacionPrecios: { formacionPrecios: { precioFinal, tipoCotizacion... }, conceptos, configuraciones })
      const fp = cotizacionCompleta.formacionPrecios || {};
      const fpAnidado =
        fp.formacionPrecios && typeof fp.formacionPrecios === "object" && !Array.isArray(fp.formacionPrecios)
          ? fp.formacionPrecios
          : null;
      /** Valores de formación (precio, tipo) visibles; el store anida otro `formacionPrecios` con esos campos. */
      const fpValores = { ...fp, ...(fpAnidado || {}), ...((cotizacionCompleta.formacionPreciosGlobal && typeof cotizacionCompleta.formacionPreciosGlobal === "object") ? cotizacionCompleta.formacionPreciosGlobal : {}) };
      const config = cotizacionCompleta.configuraciones || cotizacionCompleta.configuracionesGlobales || (fp.configuraciones || {}); // Ajuste por si viene anidado
      // Ajuste: usar cotizacionPreciosGlobal encima del bloque de precio
      const fpReal = fpValores;
      // Buscar eventos en el lugar correcto (formacionPrecios.configuraciones o cotizacionCompleta.configuraciones)
      // En storePrecioVenta: configuraciones está separado de formacionPrecios in state, pero al guardar lo juntan?
      // Revisando Cotizaciones.vue: si vienen separados. Asumiremos cotizacionCompleta.configuraciones o fp.configuraciones

      const eventosPago = config.eventosPago || fpReal.encontradas?.eventosPago || fpReal.eventosPago || [];
      const primerEvento = eventosPago.length > 0 ? eventosPago[0] : {};

      // conceptos: en GET muchas veces solo existen bajo formacionPrecios (Pinia), no en la raíz de la cotización
      const fromRootC = cotizacionCompleta.conceptos || cotizacionCompleta.Conceptos;
      const rawConceptos =
        Array.isArray(fromRootC) && fromRootC.length > 0
          ? fromRootC
          : (Array.isArray(fp.conceptos) ? fp.conceptos : []);

      const conceptosArray = rawConceptos.map((c) => {
        const normalized = {};
        for (const key in c) {
          normalized[key.toLowerCase()] = c[key];
        }
        return normalized;
      });

      // DEBUG: Ver estructura de formacionPrecios
      console.log('=== DEBUG TIEMPO GARANTIA ===');
      console.log('fp:', fp);
      console.log('fpReal:', fpReal);
      console.log('cotizacionCompleta.formacionPreciosGlobal:', cotizacionCompleta.formacionPreciosGlobal);
      console.log('fp.tiempoGarantia:', fp.tiempoGarantia);
      console.log('fpReal.tiempoGarantia:', fpReal.tiempoGarantia);
      console.log('cotizacionCompleta.formacionPreciosGlobal?.tiempoGarantia:', cotizacionCompleta.formacionPreciosGlobal?.tiempoGarantia);
      console.log('typeof fpReal.tiempoGarantia:', typeof fpReal.tiempoGarantia);
      if (fpReal.tiempoGarantia && typeof fpReal.tiempoGarantia === 'object') {
        console.log('fpReal.tiempoGarantia es objeto, keys:', Object.keys(fpReal.tiempoGarantia));
      }
      console.log('============================');

      // Helper para formato de moneda (reutilizando lógica de expresión)
      const formatCurrency = (input) => {
        if (input === null || input === undefined) return "0.00";
        const val = parseFloat(input);
        if (isNaN(val)) return "0.00";
        return val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      // Helper para formato de números enteros con comas (p.ej. 1,000,000)
      const formatNumber = (input) => {
        if (input === null || input === undefined || input === "") return "";
        const val = parseFloat(input);
        if (isNaN(val)) return input;
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      /**
       * Monto de fila: el formulario usa `precioTotal` (p. ej. 15000) y el Word solo leía `total`.
       * @param {Record<string, unknown>} c - concepto; si viene del map, las claves están en minúsculas.
       */
      const montoLineaConcepto = (c) => {
        if (!c || typeof c !== "object") return 0;
        const n = (v) => {
          if (v === null || v === undefined || v === "") return null;
          const p = parseFloat(String(v).replace(/,/g, ""));
          return Number.isNaN(p) ? null : p;
        };
        const fromCols =
          n(c.total) ??
          n(c.preciototal) ??
          n(c.preciofinal) ??
          n(c.subtotal) ??
          n(c.importe);
        if (fromCols !== null && fromCols !== undefined) return fromCols;
        const q = n(c.cantidad) ?? 0;
        const pu = n(c.preciounitario) ?? n(c.preciounit) ?? 0;
        return q * pu;
      };

      const nombreConceptoParaEtiqueta = (c) =>
        String(c.concepto || c.codigo || "Concepto").trim();

      const precioFinalFormacion = (() => {
        const raw = fpValores.precioFinal ?? fpReal.precioFinal ?? fp.precioFinal;
        if (raw === null || raw === undefined || raw === "") return 0;
        const p = parseFloat(String(raw).replace(/,/g, ""));
        return Number.isNaN(p) ? 0 : p;
      })();

      const FormacionPrecios = {
        'Tiempo de garantía': fpValores.tiempoGarantia || fpReal.tiempoGarantia || "",
        Cotizacion: {
          Global: fpValores.precioFinal || 0,
          Desglosada: rawConceptos
        },
        'Eventos de Pago': {
          'Eventos de Pago 1': {
            'Porcentaje': primerEvento.porcentaje || 0,
            'Condicion de pago': primerEvento.condicion || ""
          }
        },
        'Seguro de responsabilidad civil': {
          SHOSA: {
            'Especifique monto': fpReal.seguroRespCivil && fpReal.definidoPor === 'SHOSA' ? formatNumber(fpReal.montoSeguro) : ""
          },
          Cliente: {
            'Especifique monto': fpReal.seguroRespCivil && fpReal.definidoPor === 'Cliente' ? formatNumber(fpReal.montoSeguro) : ""
          }
        }
      };

      // Lógica para etiquetaCondicionesPago
      // Formato: Porcentaje % - Condicion
      // eventosPago ya fue declarado arriba
      const etiquetaCondicionesPago = eventosPago.map(e =>
        `${e.porcentaje || 0} % - ${e.condicion || ''}`
      ).join('\n');

      const etiquetaListaCondicionesPago = etiquetaCondicionesPago;

      // Lógica para etiquetaDesglosePrecios
      const tipoCotizacion = fpValores.tipoCotizacion || fpReal.tipoCotizacion || "Global";
      const moneda = encabezadoBase.moneda || "MXN";

      // Lógica para etiquetas de costos separados (Alimentación, Riel, Montaje, Flete) — conceptosArray ya resuelto arriba
      const sumByKeyword = (keyword) => {
        const kw = keyword.toLowerCase();
        return conceptosArray
          .filter(c => (c.concepto || c.codigo || "").toLowerCase().includes(kw))
          .reduce((sum, c) => sum + montoLineaConcepto(c), 0);
      };

      const costoAlimentacion = sumByKeyword('Alimentación');
      const costoRiel = sumByKeyword('Riel');
      const costoMontaje = sumByKeyword('Montaje');
      const costoFlete = sumByKeyword('Flete');
      
      const getInfoByKeyword = (keyword) => {
        const kw = keyword.toLowerCase();
        const matching = conceptosArray.filter(c => (c.concepto || c.codigo || "").toLowerCase().includes(kw));
        const nombreRaw = matching.map(c => (c.concepto || c.codigo || "").trim()).join(' / ');
        return {
          nombre: nombreRaw ? `– ${nombreRaw}` : '',
          descripcion: matching.map(c => (c.descripcion || '').trim()).join(' / ')
        };
      };

      const infoAlimentacion = getInfoByKeyword('Alimentación');
      const infoRiel = getInfoByKeyword('Riel');
      const infoMontaje = getInfoByKeyword('Montaje');
      const infoFlete = getInfoByKeyword('Flete');

      // Costo de Grúas (todo lo que no coincide con los anteriores)
      const costoGruas = conceptosArray
        .filter(c => {
          const nombre = (c.concepto || c.codigo || "").toLowerCase();
          return !nombre.includes('alimentación') && 
                 !nombre.includes('riel') && 
                 !nombre.includes('montaje') && 
                 !nombre.includes('flete');
        })
        .reduce((sum, c) => sum + montoLineaConcepto(c), 0);

      const etiquetaCostoAlimentacion = `${moneda} ${formatCurrency(costoAlimentacion)}`;
      const etiquetaCostoRiel = `${moneda} ${formatCurrency(costoRiel)}`;
      const etiquetaCostoMontaje = `${moneda} ${formatCurrency(costoMontaje)}`;
      const etiquetaCostoFlete = `${moneda} ${formatCurrency(costoFlete)}`;
      const etiquetaCostoGruas = `${moneda} ${formatCurrency(costoGruas)}`;

      const etiquetaNombreAlimentacion = infoAlimentacion.nombre;
      const etiquetaDescripcionAlimentacion = infoAlimentacion.descripcion;
      const etiquetaNombreRiel = infoRiel.nombre;
      const etiquetaDescripcionRiel = infoRiel.descripcion;
      const etiquetaNombreMontaje = infoMontaje.nombre;
      const etiquetaDescripcionMontaje = infoMontaje.descripcion;
      const etiquetaNombreFlete = infoFlete.nombre;
      const etiquetaDescripcionFlete = infoFlete.descripcion;

      let etiquetaDesglosePrecios = "";

      if (tipoCotizacion === 'Desglosada') {
        const lines = conceptosArray.map(c =>
          `${nombreConceptoParaEtiqueta(c)} ${moneda} ${formatCurrency(montoLineaConcepto(c))}`
        );
        const totalSuma = conceptosArray.reduce((sum, c) => sum + montoLineaConcepto(c), 0);
        lines.push(`Total ${moneda} ${formatCurrency(totalSuma)} + IVA`);

        etiquetaDesglosePrecios = lines.join('\n');
      } else {
        // Global: suma de preciototal / total de líneas; si no aplica, precio final de formación
        const totalSuma = conceptosArray.reduce((sum, c) => sum + montoLineaConcepto(c), 0);
        const totalFinal =
          totalSuma > 0
            ? totalSuma
            : precioFinalFormacion;

        etiquetaDesglosePrecios = `${moneda} ${formatCurrency(totalFinal)} + IVA`;
      }

      // Mapeo Global de ArticuloDefiniciones (Primer producto) - FALLBACK Global
      const primerProd = cotizacionCompleta.productos && cotizacionCompleta.productos.length > 0 ? cotizacionCompleta.productos[0] : {};
      const defGlobal = primerProd.definiciones || {};
      const dbGlobal = defGlobal.datosBasicos || {};
      const izGlobal = defGlobal.gancho || defGlobal.izaje || {};
      const puGlobal = defGlobal.puente || {};
      const caGlobal = defGlobal.carro || {};
      const moGlobal = defGlobal.montaje || {};

      const incluyeMontaje = moGlobal.gruaMontaje === true ||
        moGlobal.pruebasCargaMontaje === true ||
        moGlobal.alimentacionElectricaMontaje === true ||
        moGlobal.rielMontaje === true ||
        moGlobal.estructuraMontaje === true;

      const etiquetaMontajeIncluido = incluyeMontaje
        ? "(Incluidos carga y montaje de las grúas.\nLas grúas móviles o plataformas hidráulicas que se requieren para los montajes no están incluidas.)"
        : "";

      const etiquetaPruebasCarga = moGlobal.pruebasCargaMontaje === true
        ? "– Pruebas de peso, capacidad nominal del 100 % y 125 % para pruebas de carga y puesta en servicio de la grúa."
        : "";

      const femGlobalParts = (dbGlobal.equivalenteFemValue || "").split("/");
      const ArticuloDefinicionesGlobal = {
        'Datos Basicos': {
          'Capacidad de la(s) grúa(s)': Object.assign(new String(dbGlobal.capacidadGrua || 0), {
            toneladas: (dbGlobal.capacidadGrua || 0) / 1000,
            kg: dbGlobal.capacidadGrua || 0
          }),
          ' Capacidad de la(s) grúa(s)': Object.assign(new String(dbGlobal.capacidadGrua || 0), {
            toneladas: (dbGlobal.capacidadGrua || 0) / 1000,
            kg: dbGlobal.capacidadGrua || 0
          }),
          'FEM9.511/CMAA/ISO': {
            CMAA: femGlobalParts[1]?.trim() || "",
            'FEM9.511': femGlobalParts[0]?.trim() || "",
            ISO: femGlobalParts[2]?.trim() || ""
          },
          'etiquetaClasificacionGrua': dbGlobal.etiquetaClasificacionGrua || (function () {
            var val = dbGlobal.equivalenteFemValue || "";
            if (!val) return "";
            var parts = val.split("/");
            var claseFem = parts[0] ? parts[0].trim() : "";
            var claseCmaa = parts[1] ? parts[1].trim() : "";
            var claseIso = parts[2] ? parts[2].trim() : "";
            return `Clase ${claseFem} de conformidad con FEM/${claseIso} de conformidad con ISO Equivalente a la clase “${claseCmaa}” según la CMAA`;
          })(),
          'etiquetaAlturasIzaje': izGlobal.etiquetaAlturasIzaje || (izGlobal.polipastos || [])
            .map((p, index) => `- Altura de Izaje con gancho ${index + 1} : ${p.izajeGancho || 0} mm`)
            .join("\n"),
          'etiquetaVelocidadIzaje': izGlobal.etiquetaVelocidadIzaje || (function () {
            if (!izGlobal.polipastos || izGlobal.polipastos.length === 0) return "";
            var p = izGlobal.polipastos[0];
            return (p.control === 'Contactores / Dos velocidades')
              ? `${p.velIzaje1 || 0} / ${p.velIzaje2 || 0} m/min`
              : `${p.velIzaje1 || 0} m-min`;
          })(),
          'etiquetaFrenoEmergencia': izGlobal.etiquetaFrenoEmergencia || (function () {
            if (!izGlobal.polipastos || izGlobal.polipastos.length === 0) return "";
            var p = izGlobal.polipastos[0];
            return (p.frenoEmergencia === true)
              ? "– Consideramos un freno de emergencia en el tambor que se activa cada vez que se detecta un incremento en la velocidad del tambor."
              : "";
          })(),
          'etiquetaFrenoEmergenciaSegundo': izGlobal.etiquetaFrenoEmergenciaSegundo || (function () {
            if (!izGlobal.polipastos || izGlobal.polipastos.length === 0) return "";
            var p = izGlobal.polipastos[0];
            return (p.frenoEmergencia === true)
              ? "– Incluye un 2.o freno de emergencia para el movimiento de elevación"
              : "";
          })(),
          'Claro': Object.assign(new String(dbGlobal.claro || 0), {
            metros: (dbGlobal.claro || 0) / 1000,
            mm: dbGlobal.claro || 0
          }),
          ' Claro': Object.assign(new String(dbGlobal.claro || 0), {
            metros: (dbGlobal.claro || 0) / 1000,
            mm: dbGlobal.claro || 0
          }),
          'Gancho(s)': {
            'Cantidad de ganchos': dbGlobal.cantidadGanchos || 0
          },
          'etiquetaCapacidadToneladas': dbGlobal.etiquetaCapacidadToneladas || ((dbGlobal.capacidadGrua || 0) / 1000),
          'etiquetaIzaje': dbGlobal.etiquetaIzaje || (dbGlobal.izaje || 0),
          'etiquetaClasificacionCompleta': dbGlobal.etiquetaClasificacionCompleta || (function () {
            var val = dbGlobal.equivalenteFemValue || "";
            if (!val) return "";
            var parts = val.split("/");
            if (parts.length < 3) return "";
            var fem = parts[0]?.trim() || "";
            var cmaa = parts[1]?.trim() || "";
            var iso = parts[2]?.trim() || "";
            return `– Clasificación: FEM ${fem} / ISO ${iso} / CMAA clase "${cmaa}"`;
          })(),
          'Tipo de Control': {
            'Control 1': { 'Tipo de control': dbGlobal.controles?.[0]?.tipoControl || "" },
            'Control 2': { 'Tipo de control': dbGlobal.controles?.[1]?.tipoControl || "" }
          },
          'etiquetaCabinaAireAcondicionado': (dbGlobal.controles || []).some(c => c?.tipoControl === 'Cabina')
            ? "La cabina tendrá aire acondicionado y será adecuada para operar dentro de una temperatura ambiente de hasta 70 °C"
            : "",
          'Peso muerto de la grúa': dbGlobal.pesoMuertoGrua || 0,
          'Reacción máxima por rueda': dbGlobal.reaccionMaximaRueda || 0
        },
        Carro: {
          'Cantidad de carros': caGlobal.cantidadCarros || 0,
          Observaciones: caGlobal.observaciones || caGlobal.Observaciones || "",
          'Carro 1': {
            'Control de carro': caGlobal.carros?.[0]?.control || "",
            'Control carro': mapControlLabel(caGlobal.carros?.[0]?.control || ""),
            'Control carro completo': caGlobal.carros?.[0]?.control || "",
            'Reductor': caGlobal.carros?.[0]?.reductor || caGlobal.carros?.[0]?.Reductor || "",
            'Velocidad de carro': caGlobal.carros?.[0]?.velocidad1 || 0,
            'Cantidad de ruedas traslacion': caGlobal.carros?.[0]?.cantidadRuedasTraslacion || 0,
            'Diametro de rueda (mm)': caGlobal.carros?.[0]?.diametroRuedas || 0,
            'Velocidad de traslación en m/min': caGlobal.carros?.[0]?.velocidadTraslacion || 0,
            'etiquetaTopeHidraulicoCarro': caGlobal.etiquetaTopeHidraulicoCarro || (caGlobal.carros?.[0]?.topeHidraulico === true
              ? "- 4 topes hidráulicos para el movimiento del carro."
              : ""),
            'etiquetaVelocidadCarro': caGlobal.etiquetaVelocidadCarro || (function () {
              if (!caGlobal.carros || caGlobal.carros.length === 0) return "";
              var c = caGlobal.carros[0];
              var control = c.control || "";
              if (control === 'Contactores / Dos velocidades') {
                return `${c.velocidad1 || 0} / ${c.velocidad2 || 0} m/min`;
              }
              return `${c.velocidad1 || 0} m-min`;
            })(),
            'etiquetaReductorCarro1': caGlobal.etiquetaReductorCarro1 || (caGlobal.carros?.[0]?.reductor || caGlobal.carros?.[0]?.Reductor || ""),
            'etiquetaMotorModeloCarro1': caGlobal.etiquetaMotorModeloCarro1 || (caGlobal.carros?.[0]?.motorModelo || caGlobal.carros?.[0]?.MotorModelo || ""),
            'etiquetaPotenciaCarro1': caGlobal.etiquetaPotenciaCarro1 || (function () {
              if (!caGlobal.carros || caGlobal.carros.length === 0) return "";
              var c = caGlobal.carros[0];
              var control = c.control || "";
              if (control === 'Contactores / Dos velocidades') {
                return `${c.velocidad1 || 0}/${c.velocidad2 || 0} Kw`;
              }
              return `${c.velocidad1 || 0} Kw`;
            })()
          },
          'Carro1': {
            'Control de carro': caGlobal.carros?.[0]?.control || "",
            'Control carro': mapControlLabel(caGlobal.carros?.[0]?.control || ""),
            'Control carro completo': caGlobal.carros?.[0]?.control || "",
            'Reductor': caGlobal.carros?.[0]?.reductor || caGlobal.carros?.[0]?.Reductor || "",
            'Velocidad de carro': caGlobal.carros?.[0]?.velocidad1 || 0,
            'Cantidad de ruedas traslacion': caGlobal.carros?.[0]?.cantidadRuedasTraslacion || 0,
            'Diametro de rueda (mm)': caGlobal.carros?.[0]?.diametroRuedas || 0,
            'Velocidad de traslación en m/min': caGlobal.carros?.[0]?.velocidadTraslacion || 0,
            'etiquetaTopeHidraulicoCarro': caGlobal.etiquetaTopeHidraulicoCarro || (caGlobal.carros?.[0]?.topeHidraulico === true
              ? "- 4 topes hidráulicos para el movimiento del carro."
              : ""),
            'etiquetaVelocidadCarro': caGlobal.etiquetaVelocidadCarro || (function () {
              if (!caGlobal.carros || caGlobal.carros.length === 0) return "";
              const c = caGlobal.carros[0];
              const control = c.control || "";
              if (control === 'Contactores / Dos velocidades') {
                return `${c.velocidad1 || 0} / ${c.velocidad2 || 0} m/min`;
              }
              return `${c.velocidad1 || 0} m-min`;
            })(),

            'etiquetaReductorCarro1': caGlobal.etiquetaReductorCarro1 || (caGlobal.carros?.[0]?.reductor || caGlobal.carros?.[0]?.Reductor || ""),
            'etiquetaMotorModeloCarro1': caGlobal.etiquetaMotorModeloCarro1 || (caGlobal.carros?.[0]?.motorModelo || caGlobal.carros?.[0]?.MotorModelo || ""),
            'etiquetaPotenciaCarro1': caGlobal.etiquetaPotenciaCarro1 || (function () {
              if (!caGlobal.carros || caGlobal.carros.length === 0) return "";
              const c = caGlobal.carros[0];
              const control = c.control || "";
              if (control === 'Contactores / Dos velocidades') {
                return `${c.velocidad1 || 0}/${c.velocidad2 || 0} Kw`;
              }
              return `${c.velocidad1 || 0} Kw`;
            })()
          }
        },
        Gancho: {
          'Gancho 1': {
            'Control Gancho': izGlobal.polipastos?.[0]?.control || "",
            'Control gancho': mapControlLabel(izGlobal.polipastos?.[0]?.control || ""),
            'Control gancho completo': izGlobal.polipastos?.[0]?.control || "",
            'Codigo de construcción': soloCodigoConstruccionParaPlantilla(
              izGlobal.polipastos?.[0]?.codigoConstruccion || izGlobal.polipastos?.[0]?.codigoContruccion || izGlobal.polipastos?.[0]?.codigoConstruccion1 || dbGlobal.codigoConstruccion || dbGlobal.codigoContruccion || ""
            ),
            ' Geometría de ramales': izGlobal.polipastos?.[0]?.geometriaRamales || "",
            'Geometría de ramales': izGlobal.polipastos?.[0]?.geometriaRamales || "",
            'Izaje Gancho': izGlobal.polipastos?.[0]?.izajeGancho || 0,
            'Velocidad de Izaje Gancho': izGlobal.polipastos?.[0]?.velocidadIzaje1 || 0,
            'Motor/modelo': izGlobal.polipastos?.[0]?.motorModelo || izGlobal.polipastos?.[0]?.motorModeloGanchoPrincipal || izGlobal.polipastos?.[0]?.velocidadIzajeMotorModelo || "",
            'Tipo de freno': (function () {
              var tf = izGlobal.polipastos?.[0]?.tipoFreno || "";
              return tf === "Freno electrohidraulico"
                ? "Freno de zapata doble con un par de frenado del 250 % del par motor."
                : tf;
            })(),
            'Freno emergencia': izGlobal.polipastos?.[0]?.frenoEmergencia ? "Si" : "No",
            'Potencia motor de izaje': formatPotenciaMotorIzaje(izGlobal.polipastos?.[0]),
            'etiquetaVoltajeOperacionGancho1': izGlobal.etiquetaVoltajeOperacionGancho1 || (izGlobal.polipastos?.[0]?.voltajeOperacion || ""),
            'etiquetaVoltajeControlGancho1': izGlobal.etiquetaVoltajeControlGancho1 || (izGlobal.polipastos?.[0]?.voltajeControl || "")
          },
          'Gancho 2': {
            'Izaje Gancho': izGlobal.polipastos?.[1]?.izajeGancho || 0
          },
          'Gancho 3': {
            'Izaje Gancho': izGlobal.polipastos?.[2]?.izajeGancho || 0
          },
          'Voltaje de operación trifásico': dbGlobal.tensionServicio || "",
          'Voltaje de Control': dbGlobal.tensionControl || "",
          'etiquetaAlturasIzaje': izGlobal.etiquetaAlturasIzaje || ""
        },
        Puente: {
          'Control de puente': puGlobal.controlPuente || "",
          'Material de ruedas': puGlobal.ruedasMotrices?.materialRuedas || "",
          'Cantidad de motorreductores': puGlobal.cantidadMotorreductores || 0,
          'Reductor': puGlobal.reductor || puGlobal.Reductor || "",
          'Motor/Modelo': puGlobal.motorModelo || "",
          'Motor/Potencia(Kw)': puGlobal.motorPotencia1 || 0,
          'Motor/Potencia(Kw)': puGlobal.motorPotencia1 || 0,
          'Tope hidraulico': puGlobal.topeHidraulico ? "Si" : "No",
          'Velocidad de puente': puGlobal.velocidad1 || 0,
          'Total de ruedas (pzas)': puGlobal.cantidadRuedas || 0,
          'Ruedas motrices': {
            'Diametro de ruedas(mm)': puGlobal.diametroRuedas || 0,
            'Material de ruedas': puGlobal.materialRuedas || ""
          },
          'Observaciones': puGlobal.observaciones || "",
          'Tipo de alimentacion': puGlobal.tipoAlimentacion || "",
          'Interruptor limite de 2 pasos delantero': puGlobal.interruptorLimite2PasosDelantero ? "Si" : "No",
          'Interruptor limite de 2 pasos trasero': puGlobal.interruptorLimite2PasosTrasero ? "Si" : "No",
          'Interruptor limite de 2 pasos delanteros': puGlobal.interruptorLimite2PasosDelantero ? "Si" : "No",
          'Interruptor limite de 2 pasos traseros': puGlobal.interruptorLimite2PasosTrasero ? "Si" : "No",
          'Sistema anticolicion delantero': puGlobal.sistemaAnticolisionDelantero ? "Si" : "No",
          'Sistema anticolicion traseros': puGlobal.sistemaAnticolisionTrasero ? "Si" : "No",
          'Sistema anticolicion Trasero': puGlobal.sistemaAnticolisionTrasero ? "Si" : "No",
          'etiquetaTopeHidraulicoPuente': puGlobal.etiquetaTopeHidraulicoPuente || (puGlobal.topeHidraulico === true
            ? "- 4 topes hidráulicos para el movimiento del puente"
            : ""),
          'etiquetaVelocidadPuente': puGlobal.etiquetaVelocidadPuente || (function () {
            var control = puGlobal.controlPuente || "";
            if (control === 'Contactores / Dos velocidades') {
              return `${puGlobal.velocidad1 || 0}/${puGlobal.velocidad2 || 0} m/min`;
            }
            return `${puGlobal.velocidad1 || 0} m-min`;
          })(),
          'etiquetaDiametroRuedasPuente': puGlobal.etiquetaDiametroRuedasPuente || (puGlobal.ruedasMotrices?.diametroRuedas || 0),
          'etiquetaTotalRuedasPuente': puGlobal.etiquetaTotalRuedasPuente || ((puGlobal.ruedasMotrices?.cantidadRuedas || 0) + (puGlobal.ruedasLocas?.cantidadRuedas || 0)),
          'etiquetaMotorModeloPuente': puGlobal.etiquetaMotorModeloPuente || (puGlobal.motorModeloPuente || ""),
          'etiquetaPotenciaPuente': puGlobal.etiquetaPotenciaPuente || (function () {
            var control = puGlobal.controlPuente || "";
            if (control === 'Contactores / Dos velocidades') {
              return `${puGlobal.motorPotenciaKw1 || 0}/${puGlobal.motorPotenciaKw2 || 0} Kw`;
            }
            return `${puGlobal.motorPotenciaKw1 || 0} Kw`;
          })(),
          'etiquetaInterruptorLimitePuente': vinetaSoloGuionMedio(
            puGlobal.etiquetaInterruptorLimitePuente || (puGlobal.switchLimFinCarrDel === true && puGlobal.interLimFinCarrTras === true
              ? "- Sistema de Interruptor limite de 2 pasos en ambas direcciones de traslacion Puente."
              : "")
          ),
          'etiquetaSistemaInterruptorAnticolision': vinetaSoloGuionMedio(
            puGlobal.etiquetaSistemaInterruptorAnticolision || (function () {
              var switchDel = puGlobal.switchLimFinCarrDel === true;
              var interTras = puGlobal.interLimFinCarrTras === true;
              var anticolDel = puGlobal.sisAnticolisionDel === true;
              var anticolTras = puGlobal.sisAnticolisionTras === true;
              if (switchDel && anticolDel && !interTras && !anticolTras) {
                return "- Sistema de Interruptor limite de 2 pasos en traslado delantero y sistema anticolicion del lado opuesto.";
              }
              if (interTras && anticolTras && !switchDel && !anticolDel) {
                return "- Sistema de Interruptor limite de 2 pasos en traslado delantero y sistema anticolicion del lado opuesto.";
              }
              return "";
            })()
          ),
          'etiquetaSistemaAnticolisionAmbos': vinetaSoloGuionMedio(
            puGlobal.etiquetaSistemaAnticolisionAmbos || (puGlobal.sisAnticolisionDel === true && puGlobal.sisAnticolisionTras === true
              ? "- Sistema anticolicion en ambas dicecciones de traslacion puente"
              : "")
          ),
          'etiquetaVelocidadTraslacionPuente': puGlobal.velocidadTraslacionPuente === 'Otros' ? (puGlobal.especifiqueVelocidadTraslacionPuente || "") : (puGlobal.velocidadTraslacionPuente || "")
        }
      };

      // IMPORTANTE: El template usa {#encabezado}
      // Si enviamos un objeto, docxtemplater lo usa como scope (bloque)
      // Si enviamos un array, docxtemplater lo usa como bucle
      // Enviamos ambos para máxima compatibilidad
      // Objetos específicos para etiquetas directas del usuario {vendedor.xxx}
      const vendedor = {
        slpName: encabezadoBase.vendedorNombre,
        telephone: encabezadoBase.vendedorTelefono,
        mobil: encabezadoBase.vendedorMobil,
        email: encabezadoBase.vendedorEmail
      };

      const vendedorSec = {
        slpName: encabezadoBase.vendedorSecNombre,
        telephone: encabezadoBase.vendedorSecTelefono,
        mobil: encabezadoBase.vendedorSecMobil,
        email: encabezadoBase.vendedorSecEmail
      };

      const datos = {
        ...cotizacionCompleta,
        ...encabezadoBase, // Datos a nivel raíz
        Oferta, // Mapeo solicitado
        vendedor, // Alias directo
        vendedorSec, // Alias directo
        BahiaDefiniciones, // Mapeo Bahia Global
        FormacionPrecios, // Mapeo Precios Global
        ArticuloDefiniciones: ArticuloDefinicionesGlobal, // Mapeo Global (Fallback)
        etiquetaAlturasIzaje: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaAlturasIzaje, // EXPLICIT MAPPING FOR {etiquetaAlturasIzaje}
        etiquetaVelocidadIzaje: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaVelocidadIzaje, // EXPLICIT MAPPING FOR {etiquetaVelocidadIzaje}
        etiquetaFrenoEmergencia: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaFrenoEmergencia, // EXPLICIT MAPPING FOR {etiquetaFrenoEmergencia}
        etiquetaFrenoEmergenciaSegundo: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaFrenoEmergenciaSegundo, // EXPLICIT MAPPING FOR {etiquetaFrenoEmergenciaSegundo}
        etiquetaTopeHidraulicoPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaTopeHidraulicoPuente, // EXPLICIT MAPPING FOR {etiquetaTopeHidraulicoPuente}
        etiquetaVelocidadPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaVelocidadPuente, // EXPLICIT MAPPING FOR {etiquetaVelocidadPuente}
        etiquetaDiametroRuedasPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaDiametroRuedasPuente, // EXPLICIT MAPPING FOR {etiquetaDiametroRuedasPuente}
        etiquetaTotalRuedasPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaTotalRuedasPuente, // EXPLICIT MAPPING FOR {etiquetaTotalRuedasPuente}
        etiquetaMotorModeloPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaMotorModeloPuente, // EXPLICIT MAPPING FOR {etiquetaMotorModeloPuente}
        etiquetaPotenciaPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaPotenciaPuente, // EXPLICIT MAPPING FOR {etiquetaPotenciaPuente}
        etiquetaInterruptorLimitePuente: vinetaSoloGuionMedio(ArticuloDefinicionesGlobal['Puente']?.etiquetaInterruptorLimitePuente), // EXPLICIT MAPPING FOR {etiquetaInterruptorLimitePuente}
        etiquetaSistemaInterruptorAnticolision: vinetaSoloGuionMedio(ArticuloDefinicionesGlobal['Puente']?.etiquetaSistemaInterruptorAnticolision), // EXPLICIT MAPPING FOR {etiquetaSistemaInterruptorAnticolision}
        etiquetaSistemaAnticolisionAmbos: vinetaSoloGuionMedio(ArticuloDefinicionesGlobal['Puente']?.etiquetaSistemaAnticolisionAmbos), // EXPLICIT MAPPING FOR {etiquetaSistemaAnticolisionAmbos}
        etiquetaTipoRiel: BahiaDefiniciones.Riel.etiquetaTipoRiel, // EXPLICIT MAPPING FOR {etiquetaTipoRiel}
        etiquetaObservacionesRiel: BahiaDefiniciones.Riel.etiquetaObservacionesRiel, // EXPLICIT MAPPING FOR {etiquetaObservacionesRiel}
        etiquetaCapacidadToneladas: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaCapacidadToneladas, // EXPLICIT MAPPING FOR {etiquetaCapacidadToneladas}
        etiquetaIzaje: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaIzaje, // EXPLICIT MAPPING FOR {etiquetaIzaje}
        etiquetaClasificacionCompleta: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaClasificacionCompleta, // EXPLICIT MAPPING FOR {etiquetaClasificacionCompleta}
        etiquetaVoltajeOperacionGancho1: ArticuloDefinicionesGlobal['Gancho']['Gancho 1'].etiquetaVoltajeOperacionGancho1, // EXPLICIT MAPPING FOR {etiquetaVoltajeOperacionGancho1}
        etiquetaVoltajeControlGancho1: ArticuloDefinicionesGlobal['Gancho']['Gancho 1'].etiquetaVoltajeControlGancho1, // EXPLICIT MAPPING FOR {etiquetaVoltajeControlGancho1}
        etiquetaTopeHidraulicoCarro: ArticuloDefinicionesGlobal['Carro'].etiquetaTopeHidraulicoCarro || ArticuloDefinicionesGlobal['Carro']['Carro 1'].etiquetaTopeHidraulicoCarro, // EXPLICIT MAPPING FOR {etiquetaTopeHidraulicoCarro}
        etiquetaVelocidadCarro: ArticuloDefinicionesGlobal['Carro'].etiquetaVelocidadCarro || ArticuloDefinicionesGlobal['Carro']['Carro 1'].etiquetaVelocidadCarro, // EXPLICIT MAPPING FOR {etiquetaVelocidadCarro}
        etiquetaReductorCarro1: ArticuloDefinicionesGlobal['Carro']['Carro 1'].etiquetaReductorCarro1, // EXPLICIT MAPPING FOR {etiquetaReductorCarro1}
        etiquetaMotorModeloCarro1: ArticuloDefinicionesGlobal['Carro']['Carro 1'].etiquetaMotorModeloCarro1, // EXPLICIT MAPPING FOR {etiquetaMotorModeloCarro1}
        etiquetaPotenciaCarro1: ArticuloDefinicionesGlobal['Carro']['Carro 1'].etiquetaPotenciaCarro1, // EXPLICIT MAPPING FOR {etiquetaPotenciaCarro1}
        observacionesCarro: ArticuloDefinicionesGlobal['Carro']?.Observaciones ?? "",
        etiquetaClasificacionGrua: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaClasificacionGrua, // EXPLICIT MAPPING FOR {etiquetaClasificacionGrua}
        etiquetaTerminosEntrega: encabezadoBase.terminosEntrega || "", // EXPLICIT MAPPING FOR {etiquetaTerminosEntrega}
        etiquetaMontajeIncluido, // EXPLICIT MAPPING FOR {etiquetaMontajeIncluido}
        etiquetaPruebasCarga, // EXPLICIT MAPPING FOR {etiquetaPruebasCarga}
        etiquetaTiempoEntrega: encabezadoBase.tiempoEntrega || "", // EXPLICIT MAPPING FOR {etiquetaTiempoEntrega}
        etiquetaDesglosePrecios, // EXPLICIT MAPPING FOR {etiquetaDesglosePrecios}
        etiquetaCondicionesPago, // EXPLICIT MAPPING FOR {etiquetaCondicionesPago}
        etiquetaListaCondicionesPago, // EXPLICIT MAPPING FOR {etiquetaListaCondicionesPago}
        etiquetaCostoAlimentacion, // EXPLICIT MAPPING FOR {etiquetaCostoAlimentacion}
        etiquetaCostoRiel, // EXPLICIT MAPPING FOR {etiquetaCostoRiel}
        etiquetaCostoMontaje, // EXPLICIT MAPPING FOR {etiquetaCostoMontaje}
        etiquetaCostoFlete, // EXPLICIT MAPPING FOR {etiquetaCostoFlete}
        etiquetaCostoGruas, // EXPLICIT MAPPING FOR {etiquetaCostoGruas}
        etiquetaNombreAlimentacion, // EXPLICIT MAPPING FOR {etiquetaNombreAlimentacion}
        etiquetaDescripcionAlimentacion, // EXPLICIT MAPPING FOR {etiquetaDescripcionAlimentacion}
        etiquetaNombreRiel, // EXPLICIT MAPPING FOR {etiquetaNombreRiel}
        etiquetaDescripcionRiel, // EXPLICIT MAPPING FOR {etiquetaDescripcionRiel}
        etiquetaNombreMontaje, // EXPLICIT MAPPING FOR {etiquetaNombreMontaje}
        etiquetaDescripcionMontaje, // EXPLICIT MAPPING FOR {etiquetaDescripcionMontaje}
        etiquetaNombreFlete, // EXPLICIT MAPPING FOR {etiquetaNombreFlete}
        etiquetaDescripcionFlete, // EXPLICIT MAPPING FOR {etiquetaDescripcionFlete}
        etiquetaTiempoGarantia: (() => {
          // Helper para extraer el valor de tiempoGarantia (puede ser string u objeto SAP)
          var extractGarantia = (val) => {
            console.log('extractGarantia llamada con val:', val, 'tipo:', typeof val);
            if (!val) {
              console.log('extractGarantia: val es falsy, retornando ""');
              return "";
            }
            if (typeof val === 'string') {
              console.log('extractGarantia: val es string, retornando:', val);
              return val;
            }
            if (typeof val === 'object' && val.u_Tiempodegarantia) {
              console.log('extractGarantia: val es objeto con u_Tiempodegarantia, retornando:', val.u_Tiempodegarantia);
              return val.u_Tiempodegarantia;
            }
            console.log('extractGarantia: ninguna condición cumplida, retornando ""');
            return "";
          };
          var resultado = extractGarantia(fpReal.tiempoGarantia) || extractGarantia(fp.tiempoGarantia) || extractGarantia(cotizacionCompleta.tiempoGarantia) || "";
          console.log('etiquetaTiempoGarantia resultado final:', resultado);
          return resultado;
        })(), // EXPLICIT MAPPING FOR {etiquetaTiempoGarantia}
        TotalGruasTexto: encabezadoBase.TotalGruasTexto || "", // EXPLICIT MAPPING FOR {TotalGruasTexto}
        SuReferenciaProductos: encabezadoBase.SuReferenciaProductos || "", // EXPLICIT MAPPING FOR {SuReferenciaProductos}
        etiquetaCabinaAireAcondicionado: ArticuloDefinicionesGlobal['Datos Basicos'].etiquetaCabinaAireAcondicionado, // EXPLICIT MAPPING FOR {etiquetaCabinaAireAcondicionado}
        etiquetaControlPuente: ArticuloDefinicionesGlobal['Puente'] ? ArticuloDefinicionesGlobal['Puente']['Control de puente'] : "", // EXPLICIT MAPPING FOR {etiquetaControlPuente}
        etiquetaVelocidadTraslacionPuente: ArticuloDefinicionesGlobal['Puente'].etiquetaVelocidadTraslacionPuente, // EXPLICIT MAPPING FOR {etiquetaVelocidadTraslacionPuente}
        etiquetaFolioSap: (encabezadoBase.folioPortal === '76-B' ? 'SHGMTY-18000002' : (encabezadoBase.folioSap || "Pendiente")), // EXPLICIT MAPPING FOR {etiquetaFolioSap}
        etiquetaCiudadFolio: obtenerCiudadDeFolio(encabezadoBase.folioPortal === '76-B' ? 'SHGMTY-18000002' : encabezadoBase.folioSap), // EXPLICIT MAPPING FOR {etiquetaCiudadFolio}
        'FormacionPrecios-Productos y Opciones Seleccionadas': FormacionPrecios, // Alias para clave del template con guiones
        encabezado: [encabezadoBase] // Enviamos como Array para que {#encabezado} funcione siempre
      };

      console.log('--- DATOS ENVIADOS A DOCXTEMPLATER ---');
      console.log('Cliente:', datos.clienteNombre);
      console.log('Folio:', datos.folioPortal);
      console.log('etiquetaTiempoGarantia:', datos.etiquetaTiempoGarantia); // DEBUG GARANTIA
      console.log('Oferta:', datos.Oferta);
      console.log('BahiaDefiniciones:', datos.BahiaDefiniciones);
      console.log('FormacionPrecios:', datos.FormacionPrecios);
      console.log('Estructura encabezado[0]:', Object.keys(datos.encabezado[0]));
      console.log('---------------------------------------');

      // Establecer los datos en el template (con sanitización XML previa)
      const datosSanitizados = sanitizeObject(datos);
      doc.setData(datosSanitizados);

      try {
        // Renderizar el documento
        doc.render();
        console.log('Documento renderizado con éxito.');
      } catch (error) {
        console.error("Detailed docxtemplater error:", error);
        if (error.properties && error.properties.errors) {
          console.log("FULL ERROR JSON:", JSON.stringify(error.properties.errors, null, 2));
        }
        throw new Error(`Error procesando plantilla: ${error.message}`);
      }

      // Generar el documento final
      const buf = doc.getZip().generate({
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      });

      // Crear el nombre del archivo - Usamos los datos del encabezadoBase directamente
      const clienteStr = encabezadoBase.clienteNombre || "SinCliente";
      const folioStr = encabezadoBase.folioPortal || "SinFolio";
      const fechaStr = new Date().toISOString().split("T")[0];

      const nombreArchivo = `Cotizacion_${clienteStr}_${folioStr}_${fechaStr}.docx`;

      // Descargar el archivo
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, nombreArchivo);

      console.log("Documento Word generado y descargado exitosamente");
    } catch (error) {
      console.error('Error generando documento Word:', error);
      if (error.properties && error.properties.errors) {
        console.log('--- DETALLES DEL ERROR DE PLANTILLA (JSON) ---');
        console.log(JSON.stringify(error.properties.errors, null, 2));
        console.log('----------------------------------------------');
      }
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const pdfGeneratorService = new PDFGeneratorService();
