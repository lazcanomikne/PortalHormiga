import moment from "moment";
import { defineStore } from "pinia";

export const useCotizadorFormStore = defineStore("cotizadorForm", {
  state: () => ({
    form: {
      tipoCotizacion: "",
      tipoCuenta: "",
      idioma: "",
      cliente: "",
      personaContacto: "",
      direccionFiscal: "",
      direccionEntrega: "",
      referencia: "",
      terminosEntrega: "",
      folioPortal: "",
      folioSAP: "",
      fecha: moment().format("YYYY-MM-DD"),
      vencimiento: moment().add(30, "days").format("YYYY-MM-DD"), // agregar 30 dias a la fecha actual, para que se calcule de 30 dias a partir de la fecha actual y lo tome el modal de vencimiento
      moneda: "MXN",
      vendedor: null,
      vendedorSec: null,
      usuario: "",
      clienteFinal: "",
      ubicacionFinal: "",
      tiempoEntrega: "",
    },
    isEditMode: false,
    isViewMode: false,
    editId: null,
  }),

  getters: {
    getIsEditMode: (state) => state.isEditMode,
    getIsViewMode: (state) => state.isViewMode,
    getEditId: (state) => state.editId,
  },

  actions: {
    clearForm() {
      this.form = {
        tipoCotizacion: "",
        tipoCuenta: "",
        idioma: "",
        cliente: "",
        personaContacto: "",
        direccionFiscal: "",
        direccionEntrega: "",
        referencia: "",
        terminosEntrega: "",
        folioPortal: "",
        folioSap: "",
        fecha: moment().format("YYYY-MM-DD"),
        vencimiento: moment().add(30, "days").format("YYYY-MM-DD"), // agregar 30 dias a la fecha actual, para que se calcule de 30 dias a partir de la fecha actual y lo tome el modal de vencimiento
        moneda: "MXN",
        vendedor: null,
        vendedorSec: null,
        vendedorSec: null,
        usuario: "",
        clienteFinal: "",
        ubicacionFinal: "",
        tiempoEntrega: "",
      };
      this.isEditMode = false;
      this.isViewMode = false;
      this.editId = null;
    },

    setEditMode(isEdit) {
      this.isEditMode = isEdit;
      if (isEdit) {
        this.isViewMode = false;
      }
    },

    setViewMode(isView) {
      this.isViewMode = isView;
      if (isView) {
        this.isEditMode = false;
      }
    },

    setEditId(id) {
      this.editId = id;
    },

    resetToCreateMode() {
      this.isEditMode = false;
      this.isViewMode = false;
      this.editId = null;
    },
  },

  persist: {
    key: "cotizador-form",
    storage: localStorage,
    paths: ["form", "isEditMode", "isViewMode", "editId"],
  },
});
