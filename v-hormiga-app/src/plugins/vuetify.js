/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";
import { VMaskInput } from "vuetify/labs/VMaskInput";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VMaskInput,
  },
  defaults: {
    VSelect: {
      scrollStrategy: "reposition",
    },
    VCombobox: {
      scrollStrategy: "reposition",
    },
    VAutocomplete: {
      scrollStrategy: "reposition",
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#f5f6fa",
          surface: "#fff",
          primary: "#0d3878",
          secondary: "#1976d2",
          error: "#e53935",
          info: "#2196f3",
          success: "#43a047",
          warning: "#fbc02d",
        },
        variables: {
          "border-radius-root": "12px",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#121212",
          surface: "#1e1e1e",
          primary: "#64b5f6",
          secondary: "#42a5f5",
          error: "#ef5350",
          info: "#42a5f5",
          success: "#66bb6a",
          warning: "#ffa726",
        },
        variables: {
          "border-radius-root": "12px",
        },
      },
    },
  },
});
