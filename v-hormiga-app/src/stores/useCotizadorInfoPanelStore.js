import moment from "moment";
import { defineStore } from "pinia";

export const useCotizadorInfoPanelStore = defineStore("cotizadorInfoPanel", {
  state: () => ({
    info: {
      folioPortal: "",
      folioSap: "",
      fecha: moment().format("YYYY-MM-DD"),
      vencimiento: moment().format("YYYY-MM-DD"),
      moneda: "MXN",
    },
  }),
  actions: {
    setMoneda(moneda) {
      this.info.moneda = moneda;
    },
    setFecha(fecha) {
      this.info.fecha = fecha;
    },
    setVencimiento(vencimiento) {
      this.info.vencimiento = vencimiento;
    },

    setFolioPortal(id) {
      this.info.folioPortal = id;
    },

    clearInfo() {
      this.info = {
        folioPortal: "",
        folioSap: "",
        fecha: moment().format("YYYY-MM-DD"),
        vencimiento: moment().format("YYYY-MM-DD"),
        moneda: "MXN",
      };
    },

    // Puedes agregar más setters según lo que necesites modificar desde la UI
  },

  persist: {
    key: "cotizador-info-panel",
    storage: localStorage,
    paths: ["info"],
  },
});
