/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Styles
import "unfonts.css";

const app = createApp(App);
app.config.globalProperties.$filters = {
  currency(value) {
    let val = (value / 1).toFixed(2).replace(",", ".");
    return " " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  textCrop(value, len) {
    if (!value) return "";
    return value.length > len ? value.substr(0, len) : value;
  },
};
registerPlugins(app);

app.mount("#app");
