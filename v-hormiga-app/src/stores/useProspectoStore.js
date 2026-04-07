import { defineStore } from "pinia";

export const useProspectoStore = defineStore("prospecto", {
  state: () => ({
    prospecto: {
      empresa: "",
      referenciaCliente: "",
      giroEmpresa: "",
      telefonoContacto: "",
      rfc: "",
      calle: "",
      numeroInterior: "",
      numeroExterior: "",
      colonia: "",
      estado: "",
      ciudadMunicipio: "",
      codigoPostal: "",
      vigencia: "",
      impuestoIva: "",
      vendedor: "",
      nombreContacto: "",
      vendedor2: "",
      apellidoContacto: "",
      puestoContacto: "",
    },
    prospectos: [],
    loading: false,
  }),

  getters: {
    getProspecto: (state) => state.prospecto,
    getProspectos: (state) => state.prospectos,
    getLoading: (state) => state.loading,
  },

  actions: {
    setProspecto(prospecto) {
      this.prospecto = { ...prospecto };
    },

    clearProspecto() {
      this.prospecto = {
        empresa: "",
        referenciaCliente: "",
        giroEmpresa: "",
        telefonoContacto: "",
        rfc: "",
        calle: "",
        numeroInterior: "",
        numeroExterior: "",
        colonia: "",
        estado: "",
        ciudadMunicipio: "",
        codigoPostal: "",
        vigencia: "",
        impuestoIva: "",
        vendedor: "",
        nombreContacto: "",
        vendedor2: "",
        apellidoContacto: "",
        puestoContacto: "",
      };
    },

    async guardarProspecto(prospecto) {
      this.loading = true;
      try {
        // Aquí implementarías la llamada a la API para guardar el prospecto
        // Por ahora solo lo agregamos a la lista local
        const nuevoProspecto = {
          id: Date.now(), // ID temporal
          ...prospecto,
          fechaCreacion: new Date().toISOString(),
        };

        this.prospectos.push(nuevoProspecto);
        this.clearProspecto();

        return {
          exito: true,
          mensaje: "Prospecto guardado exitosamente",
          data: nuevoProspecto,
        };
      } catch (error) {
        console.error("Error al guardar prospecto:", error);
        return {
          exito: false,
          mensaje: "Error al guardar el prospecto",
          error: error.message,
        };
      } finally {
        this.loading = false;
      }
    },

    async obtenerProspectos() {
      this.loading = true;
      try {
        // Aquí implementarías la llamada a la API para obtener prospectos
        // Por ahora retornamos la lista local
        return this.prospectos;
      } catch (error) {
        console.error("Error al obtener prospectos:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },
  },

  persist: {
    key: "prospecto",
    storage: localStorage,
    paths: ["prospecto", "prospectos"],
  },
});
