import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
const host = window.location.hostname;
// Puerto API en dev: .env.development (VITE_API_DEV_PORT); fallback 9002 = back local típico (Vite 9001).
const apiPort = import.meta.env.VITE_API_DEV_PORT || "9002";

// Logic for baseURL
let apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  // If no env var, we determine based on hostname
  if (host === "localhost" || host === "127.0.0.1") {
    apiBaseUrl = `http://127.0.0.1:${apiPort}/api`;
  } else {
    apiBaseUrl = `http://${host}:${apiPort}/api`;
  }
}

// Listados contra HANA pueden tardar >10s; configurable con VITE_API_TIMEOUT_MS
const parsedTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS);
const axiosTimeout =
  Number.isFinite(parsedTimeout) && parsedTimeout > 0
    ? parsedTimeout
    : 120000;

console.log("Connect to API:", apiBaseUrl);

// Configuración base de axios
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: axiosTimeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para requests (peticiones salientes)
api.interceptors.request.use(
  (config) => {
    // Obtener el token del store de autenticación
    const authStore = useAuthStore();
    const token = authStore.getToken;

    // Si hay token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar headers adicionales
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    config.headers["X-Client-Version"] = "1.0.0";
    config.headers["X-Client-Name"] = "hormiga-app";

    // Log de la petición (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    // Log del error en la petición
    if (import.meta.env.DEV) {
      console.error("❌ API Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Interceptor para responses (respuestas entrantes)
api.interceptors.response.use(
  (response) => {
    // Log de la respuesta (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    // Log del error en la respuesta
    if (import.meta.env.DEV) {
      console.error("❌ API Response Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
        errors: error.response?.data?.errors,
      });
    }

    // Manejo de errores específicos
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido (app usa hash router: /#/login)
          const authStore = useAuthStore();
          await authStore.logout();
          window.location.href = `${window.location.origin}${import.meta.env.BASE_URL || "/"}#/login`;
          break;

        case 403:
          // Acceso denegado
          console.error(
            "Acceso denegado:",
            data?.message || "No tienes permisos para esta acción"
          );
          break;

        case 404:
          // Recurso no encontrado
          console.error(
            "Recurso no encontrado:",
            data?.message || "El recurso solicitado no existe"
          );
          break;

        case 503:
          console.error("Servicio no disponible (503):", {
            message: data?.message,
            dbError: data?.dbError,
            error: data?.error,
          });
          break;

        case 422:
        case 400:
          // Error de validación o petición incorrecta
          if (data?.errors) {
            console.group('❌ Detalles de Validación (Error 400/422):');
            Object.keys(data.errors).forEach(key => {
              console.error(`${key}:`, data.errors[key]);
            });
            console.groupEnd();
          }
          console.error(
            `Error ${status}:`,
            data?.message || data?.title || "Error en la petición"
          );
          break;
      }
    } else if (error.request) {
      // Error de red (sin respuesta del servidor)
      console.error("Error de red:", "No se pudo conectar con el servidor");
    } else {
      // Error en la configuración de la petición
      console.error("Error de configuración:", error.message);
    }

    return Promise.reject(error);
  }
);

// Funciones helper para diferentes tipos de peticiones
export const apiService = {
  // GET request
  get: (url, config = {}) => api.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),

  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),

  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),

  // Upload file
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Download file
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: "blob",
    });
  },
};

// Servicios específicos para diferentes módulos
export const authService = {
  login: (credentials) => apiService.post("/auth/login", credentials),
  sendPing: (email) => apiService.post("/auth/send-ping", { email }),
  verifyPing: (email, pingCode) => apiService.post("/auth/verify-ping", { email, pingCode }),
  logout: () => apiService.post("/auth/logout"),
  refresh: () => apiService.post("/auth/refresh"),
  forgotPassword: (email) =>
    apiService.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiService.post("/auth/reset-password", { token, password }),
  changePassword: (passwordData) =>
    apiService.post("/auth/change-password", passwordData),
  profile: () => apiService.get("/auth/profile"),
  updateProfile: (data) => apiService.put("/auth/profile", data),
};

export const cotizacionService = {
  getAll: (params = {}) =>
    apiService.get("/cotizacion", {
      params,
      // La lista lee toda la tabla + JSON; puede superar el timeout global en redes lentas
      timeout: Math.max(axiosTimeout, 180000),
    }),
  getById: (id) => apiService.get(`/cotizacion/${id}`),
  getByFolio: (folio) => apiService.get(`/cotizacion/folio/${folio}`),
  updateStatus: (id, status) => apiService.put(`/cotizacion/${id}/status`, { estado: status }),
  create: (data) => apiService.post("/cotizacion", data),
  /** Crea en MIKNE y luego envía a SAP Service Layer (mismo flujo en servidor). */
  createWithSap: (data) => apiService.post("/cotizacion/with-sap", data),
  update: (id, data) => apiService.put(`/cotizacion/${id}`, data),
  delete: (id) => apiService.delete(`/cotizacion/${id}`),
  save: (id, data) => apiService.patch(`/cotizacion/${id}/save`, data),
  getVersions: (id) => apiService.get(`/cotizacion/${id}/versions`),
  uploadExcel: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiService.upload(`/cotizacion/${id}/upload-excel`, formData);
  },
  getExcelDownloadUrl: (fileName) => {
    if (!fileName) return null;
    // La URL base es apiBaseUrl sin el /api final + /uploads/costos/
    const baseUrl = apiBaseUrl.replace(/\/api$/, "");
    return `${baseUrl}/uploads/costos/${fileName}`;
  },
  sendToSap: (id, userName) => apiService.post(`/cotizacion/${id}/send-to-sap`, { userName }),
  /** POST /b1s/v1/Orders (mismo cuerpo que cotización); host desde ConnectionStrings:ApiSAP. */
  createOrderInSap: (id, userName) =>
    apiService.post(`/cotizacion/${id}/create-order-sap`, { userName }),
};

export const articlesService = {
  getAll: (params = {}) => apiService.get("/articles", { params }),
  getById: (id) => apiService.get(`/articles/${id}`),
  create: (data) => apiService.post("/articles", data),
  update: (id, data) => apiService.put(`/articles/${id}`, data),
  delete: (id) => apiService.delete(`/articles/${id}`),
  getDefiniciones: (id) => apiService.get(`/articles/${id}/definiciones`),
  updateDefiniciones: (id, data) =>
    apiService.put(`/articles/${id}/definiciones`, data),
};

export const bahiasService = {
  getAll: (params = {}) => apiService.get("/bahias", { params }),
  getById: (id) => apiService.get(`/bahias/${id}`),
  create: (data) => apiService.post("/bahias", data),
  update: (id, data) => apiService.put(`/bahias/${id}`, data),
  delete: (id) => apiService.delete(`/bahias/${id}`),
  getDefiniciones: (id) => apiService.get(`/bahias/${id}/definiciones`),
  updateDefiniciones: (id, data) =>
    apiService.put(`/bahias/${id}/definiciones`, data),
};

export const clientesService = {
  getAll: (params = {}) => apiService.get("/clientes", { params }),
  getById: (id) => apiService.get(`/clientes/${id}`),
  create: (data) => apiService.post("/clientes", data),
  update: (id, data) => apiService.put(`/clientes/${id}`, data),
  delete: (id) => apiService.delete(`/clientes/${id}`),
  search: (query) =>
    apiService.get("/clientes/search", { params: { q: query } }),
};

/**
 * GET /cotizacion/:id devolvía antes un string JSON escapado; con Content(raw) llega objeto.
 * Normaliza ambos para cargar encabezado (ubicacionFinal, tiempoEntrega, etc.).
 */
export function parseCotizacionGetPayload(data) {
  if (data == null) return null;
  if (
    typeof data === "object" &&
    !Array.isArray(data) &&
    Object.prototype.hasOwnProperty.call(data, "encabezado")
  ) {
    return data;
  }
  if (typeof data === "string") {
    try {
      return JSON.parse(data.replace(/\u001f/g, ""));
    } catch {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return data;
}

/** Normaliza la respuesta del API cuando viene de DataTable (objeto con table/Table/rows) o ya es un array. */
export function normalizeDataAppRows(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    const nested =
      data.table ?? data.Table ?? data.rows ?? data.Rows ?? data.data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

/**
 * Motorreductores: el API filtra por grupo OITB (435). Se mantiene la función para no romper imports;
 * ya no se filtra por E11/E22/E34 en cliente (esas cadenas no coinciden con los ItemName reales).
 */
export function filterMotorreductorRowsByItemName(data) {
  return normalizeDataAppRows(data);
}

/**
 * Listas OITM para v-combobox: artículo · nombre · disponible (OnHand total).
 * @param {object} [options] keepItemName / keepItmsGrpNam para datos extra en el ítem (no en el título).
 */
export function mapOitmInventarioItems(rows, options = {}) {
  const opts = typeof options === "object" && options !== null ? options : {};
  const {
    keepItmsGrpNam = false,
    keepItemName = false,
  } = opts;
  const arr = normalizeDataAppRows(rows);
  return arr
    .map((item) => {
      if (typeof item === "string") return { title: item, value: item };
      const code = item.itemCode ?? item.ItemCode ?? "";
      if (!code) return null;
      const nm = String(item.itemName ?? item.ItemName ?? "").trim();
      const qty =
        item.onHand ??
        item.OnHand ??
        item.stock ??
        item.Stock;
      const qtyStr =
        qty != null && qty !== "" ? String(qty).trim() : "";
      const bits = [
        String(code),
        nm !== "" ? nm : null,
        qtyStr !== "" ? `Disp.: ${qtyStr}` : null,
      ].filter(Boolean);
      const title = bits.length > 1 ? bits.join(" · ") : String(code);
      const out = { title, value: String(code) };
      if (keepItemName) {
        const nameForKeep = item.itemName ?? item.ItemName;
        if (nameForKeep != null && nameForKeep !== "")
          out.itemName = String(nameForKeep);
      }
      if (keepItmsGrpNam) {
        const g = item.itmsGrpNam ?? item.ItmsGrpNam;
        if (g != null && g !== "") out.itmsGrpNam = String(g);
      }
      return out;
    })
    .filter(Boolean);
}

export function mapCodigoConstruccionItems(rows) {
  return mapOitmInventarioItems(rows);
}

/** Combo «Tipo de carro» / motor BXP: artículo · nombre · Disp.; el valor guardado es solo ItemCode. */
export function mapOitmTipoCarroComboRows(rows) {
  const arr = normalizeDataAppRows(rows);
  return arr
    .map((item) => {
      const code = item.itemCode ?? item.ItemCode ?? "";
      if (!code) return null;
      const nm = String(item.itemName ?? item.ItemName ?? "").trim();
      const onHand = item.onHand ?? item.OnHand;
      const oh =
        onHand != null && onHand !== "" ? String(onHand).trim() : "";
      const bits = [String(code), nm !== "" ? nm : null, oh !== "" ? `Disp.: ${oh}` : null].filter(
        Boolean
      );
      return {
        title: bits.length > 1 ? bits.join(" · ") : String(code),
        value: String(code),
      };
    })
    .filter(Boolean);
}

export const dataAppService = {
  getClientes: () => apiService.get("/dataapp/clientes"),
  getPersonaContacto: (cardCode) =>
    apiService.get(`/dataapp/personacontacto`, { params: { cardCode } }),
  getDireccionFiscal: (cardCode) =>
    apiService.get(`/dataapp/direccionfiscal`, { params: { cardCode } }),
  getDireccionEntrega: (cardCode) =>
    apiService.get(`/dataapp/direccionentrega`, { params: { cardCode } }),
  getTerminosEntrega: () => apiService.get(`/dataapp/terminosentrega`),
  getArticulos: () => apiService.get(`/dataapp/articulos`),
  getTipoFianza: () => apiService.get(`/dataapp/tipofianza`),
  getAgentes: () => apiService.get(`/dataapp/agentes`),
  getTipoGarantias: () => apiService.get(`/dataapp/tipogarantias`),
  getTipoPolipasto: () => apiService.get(`/dataapp/tipopalipastos`),
  getTipoRuedas: (type) =>
    apiService.get(`/dataapp/tipoderuedas`, { params: { type } }),
  /** OITM ItemCode + OnHand: U_BXP_TIPO = '11' en SHOSAPROD.OITM. */
  getOitmBxpTipoCarro: () => apiService.get(`/dataapp/oitm-bxp-tipo-carro`),
  /** OITM ItemCode + OnHand: U_BXP_TIPO = '12' (Motorreductor / Modelo). */
  getOitmBxpTipoMotorreductor: () =>
    apiService.get(`/dataapp/oitm-bxp-tipo-motorreductor`),
  getCodigoConstruccion: (code) =>
    apiService.get(`/dataapp/codigosconstruccion`, { params: { code } }),
  getTipoMotorreductor: () => apiService.get(`/dataapp/motorreductores`),
  getModelos: () => apiService.get(`/dataapp/modelos`),
  getPlazoDias: () => apiService.get(`/dataapp/plazosdias`),
  getVendedores: () => apiService.get(`/dataapp/vendedores`),
  getBrazos: (code = 481) =>
    apiService.get(`/dataapp/tipobrazos`, { params: { code } }),
};

export const usuariosService = {
  getAll: () => apiService.get("/usuarios"),
  create: (data) => apiService.post("/usuarios", data),
  update: (username, data) => apiService.put(`/usuarios/${username}`, data),
  delete: (username) => apiService.post(`/usuarios/delete/${username}`),
};

export default api;
