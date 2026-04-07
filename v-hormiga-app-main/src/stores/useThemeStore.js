import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: false,
    theme: "light",
  }),

  getters: {
    getIsDark: (state) => state.isDark,
    getTheme: (state) => state.theme,
    getThemeIcon: (state) =>
      state.isDark ? "mdi-weather-sunny" : "mdi-weather-night",
    getThemeTooltip: (state) =>
      state.isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
  },

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.theme = this.isDark ? "dark" : "light";

      // Aplicar el tema a la aplicación
      this.applyTheme();

      // Guardar en localStorage
      this.saveTheme();
    },

    setTheme(theme) {
      this.theme = theme;
      this.isDark = theme === "dark";

      // Aplicar el tema a la aplicación
      this.applyTheme();

      // Guardar en localStorage
      this.saveTheme();
    },

    applyTheme() {
      // Aplicar el tema usando CSS custom properties y clases
      this.applyThemeToDOM();

      // Aplicar tema a Vuetify si está disponible
      this.applyThemeToVuetify();
    },

    applyThemeToDOM() {
      try {
        // Obtener el elemento raíz de la aplicación
        const app = document.querySelector("#app") || document.body;

        if (this.isDark) {
          // Aplicar modo oscuro
          app.classList.add("v-theme--dark");
          app.classList.remove("v-theme--light");

          // Aplicar colores personalizados para modo oscuro
          document.documentElement.style.setProperty(
            "--v-background",
            "#121212"
          );
          document.documentElement.style.setProperty("--v-surface", "#1e1e1e");
          document.documentElement.style.setProperty("--v-primary", "#64b5f6");
          document.documentElement.style.setProperty(
            "--v-secondary",
            "#42a5f5"
          );
        } else {
          // Aplicar modo claro
          app.classList.add("v-theme--light");
          app.classList.remove("v-theme--dark");

          // Aplicar colores personalizados para modo claro
          document.documentElement.style.setProperty(
            "--v-background",
            "#f5f6fa"
          );
          document.documentElement.style.setProperty("--v-surface", "#fff");
          document.documentElement.style.setProperty("--v-primary", "#0d3878");
          document.documentElement.style.setProperty(
            "--v-secondary",
            "#1976d2"
          );
        }

        // Emitir evento personalizado para que otros componentes sepan del cambio
        window.dispatchEvent(
          new CustomEvent("themeChanged", {
            detail: { theme: this.theme, isDark: this.isDark },
          })
        );
      } catch (error) {
        console.warn("Error al aplicar el tema al DOM:", error);
      }
    },

    applyThemeToVuetify() {
      try {
        // Intentar aplicar el tema a Vuetify usando el contexto global
        if (window.__VUETIFY_INSTANCE__) {
          const vuetify = window.__VUETIFY_INSTANCE__;
          if (vuetify.theme && vuetify.theme.global) {
            vuetify.theme.global.name.value = this.theme;
          }
        }
      } catch (error) {
        console.warn("No se pudo aplicar el tema a Vuetify:", error);
      }
    },

    saveTheme() {
      try {
        localStorage.setItem("app_theme", this.theme);
        localStorage.setItem("app_isDark", JSON.stringify(this.isDark));
      } catch (error) {
        console.warn("No se pudo guardar el tema en localStorage:", error);
      }
    },

    loadTheme() {
      try {
        const savedTheme = localStorage.getItem("app_theme");
        const savedIsDark = localStorage.getItem("app_isDark");

        if (savedTheme) {
          this.theme = savedTheme;
          this.isDark = savedIsDark ? JSON.parse(savedIsDark) : false;
        }

        // Aplicar el tema cargado
        this.applyTheme();
      } catch (error) {
        console.warn("No se pudo cargar el tema desde localStorage:", error);
        // Usar tema por defecto
        this.theme = "light";
        this.isDark = false;
      }
    },

    // Inicializar el tema al cargar la aplicación
    initTheme() {
      this.loadTheme();
    },

    // Método para sincronizar con preferencias del sistema
    syncWithSystemPreference() {
      try {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const prefersDark = mediaQuery.matches;

        // Solo aplicar si no hay un tema guardado
        if (!localStorage.getItem("app_theme")) {
          this.setTheme(prefersDark ? "dark" : "light");
        }

        // Escuchar cambios en las preferencias del sistema
        mediaQuery.addEventListener("change", (e) => {
          if (!localStorage.getItem("app_theme")) {
            this.setTheme(e.matches ? "dark" : "light");
          }
        });
      } catch (error) {
        console.warn(
          "No se pudo sincronizar con las preferencias del sistema:",
          error
        );
      }
    },

    // Método para obtener colores del tema actual
    getThemeColors() {
      if (this.isDark) {
        return {
          background: "#121212",
          surface: "#1e1e1e",
          primary: "#64b5f6",
          secondary: "#42a5f5",
          error: "#ef5350",
          info: "#42a5f5",
          success: "#66bb6a",
          warning: "#ffa726",
        };
      } else {
        return {
          background: "#f5f6fa",
          surface: "#fff",
          primary: "#0d3878",
          secondary: "#1976d2",
          error: "#e53935",
          info: "#2196f3",
          success: "#43a047",
          warning: "#fbc02d",
        };
      }
    },
  },

  persist: {
    key: "theme",
    storage: localStorage,
    paths: ["isDark", "theme"],
  },
});
