import { authService } from "@/services/api";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
  }),

  getters: {
    getUser: (state) => state.user,
    getIsAuthenticated: (state) => state.isAuthenticated,
    getToken: (state) => state.token,
    getLoading: (state) => state.loading,
  },

  actions: {
    async login(credentials) {
      this.loading = true;

      try {
        // Llamada real a la API
        const response = await authService.login(credentials);

        const { userData, sessionData } = response.data;

        this.user = userData;
        this.token = sessionData;
        this.isAuthenticated = true;

        // Guardar en localStorage
        localStorage.setItem("auth_token", JSON.stringify(sessionData));
        localStorage.setItem("user_data", JSON.stringify(userData));

        return { success: true, userData, sessionData };
      } catch (error) {
        console.error("Error en login:", error);
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;

      try {
        // Llamada real a la API de logout
        await authService.logout();

        // Limpiar estado
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;

        // Limpiar localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        return { success: true };
      } catch (error) {
        console.error("Error en logout:", error);
        // Aún limpiamos el estado local aunque falle la llamada al servidor
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkAuth() {
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (token && userData) {
        try {
          // Aquí podrías validar el token con el backend
          this.token = token;
          this.user = JSON.parse(userData);
          this.isAuthenticated = true;
          return true;
        } catch (error) {
          console.error("Error validando token:", error);
          this.logout();
          return false;
        }
      }

      return false;
    },

    async forgotPassword(email) {
      this.loading = true;

      try {
        // Llamada real a la API
        const response = await authService.forgotPassword(email);
        return {
          success: true,
          message:
            response.data.message ||
            "Se ha enviado un email con las instrucciones",
        };
      } catch (error) {
        console.error("Error en forgot password:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async changePassword(passwordData) {
      this.loading = true;

      try {
        // Llamada real a la API para cambiar contraseña
        const response = await authService.changePassword(passwordData);
        return {
          success: true,
          message: response.data.message || "Contraseña cambiada exitosamente",
        };
      } catch (error) {
        console.error("Error en change password:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },

  persist: {
    key: "auth",
    storage: localStorage,
    paths: ["user", "isAuthenticated", "token"],
  },
});
