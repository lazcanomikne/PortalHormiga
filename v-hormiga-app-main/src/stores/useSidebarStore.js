// src/stores/useSidebarStore.js
import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    open: window.innerWidth >= 768,
  }),
  actions: {
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
    openSidebar() {
      this.open = true;
    },
  },

  persist: {
    key: "sidebar",
    storage: localStorage,
    paths: ["open"],
  },
});
