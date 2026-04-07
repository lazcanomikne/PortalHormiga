import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
const host = window.location.hostname;

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://172.28.222.18:8081/api"
    : `http://${host}:8081/api`,
  timeout: 10000,
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
      });
    }

    // Manejo de errores específicos
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido
          const authStore = useAuthStore();
          await authStore.logout();
          window.location.href = "/login";
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

        case 422:
          // Error de validación
          console.error("Error de validación:", data?.errors || data?.message);
          break;

        case 500:
          // Error del servidor
          console.error(
            "Error del servidor:",
            data?.message || "Error interno del servidor"
          );
          break;

        default:
          console.error(
            `Error ${status}:`,
            data?.message || "Error desconocido"
          );
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
  getAll: (params = {}) => apiService.get("/cotizacion", { params }),
  getById: (id) => apiService.get(`/cotizacion/${id}`),
  create: (data) => apiService.post("/cotizacion", data),
  update: (id, data) => apiService.put(`/cotizacion/${id}`, data),
  delete: (id) => apiService.delete(`/cotizacion/${id}`),
  save: (id, data) => apiService.patch(`/cotizacion/${id}/save`, data),
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
  getCodigoContruccion: (code) =>
    apiService.get(`/dataapp/codigosconstruccion`, { params: { code } }),
  getTipoMotorreductor: () => apiService.get(`/dataapp/motorreductores`),
  getModelos: () => apiService.get(`/dataapp/modelos`),
  getPlazoDias: () => apiService.get(`/dataapp/plazosdias`),
  getVendedores: () => apiService.get(`/dataapp/vendedores`),
  getBrazos: () => apiService.get(`/dataapp/tipobrazos`),
};
// Exportar la instancia de axios por si se necesita acceso directo
export default api;
