import { defineStore } from "pinia";

export const useBahiasStore = defineStore("bahias", {
  state: () => ({
    bahias: [],
    selectedBahias: [],
  }),
  getters: {
    getBahiasList: (state) => state.selectedBahias.map((bahia) => bahia.nombre),
  },
  actions: {
    addBahia() {
      this.selectedBahias.push({
        nombre: "",
        alimentacion: false,
        riel: false,
        estructura: false,
        definiciones: {
          alimentacion: {
            id: 0,
            idCotizacionBahia: 0,
            // Alimentación eléctrica
            aliEleLarNave: false,
            longitudSistema: 0,
            acomElec: 0,
            // Localización de acometida
            localAcometida: "",
            localAcometidaOtro: "",
            // Características eléctricas
            amperaje: 0,
            temperatura: "",
            temperaturaOtro: "",
            // Especificaciones
            adecuadaAlimentar: "",
            interruptorGeneral: false,
            // Tipo de alimentación
            tipoAlimentacion: "",
            tipoAlimOtro: "",
            especifiqueAreaTrabajo: "",
            // Sistema Festoon
            especifiqueSistemaAlimentacion: "",
            // Observaciones
            observaciones: "",
          },
          riel: {
            id: 0,
            idCotizacionBahia: 0,
            // Tipo de riel
            tipoRiel: "",
            especifiqueTipoRiel: "",
            // Medidas
            metrosLinealesRiel: 0,
            // Calidad del material
            calidadMaterialRiel: "",
            especifiqueCalidadMaterialRiel: "",
            // Observaciones
            observaciones: "",
          },
          estructura: {
            id: 0,
            idCotizacionBahia: 0,
            // Lotes y componentes
            lotesRequeridos: 0,
            trabeCarril: false,
            columnas: false,
            mensula: false,
            // Columnas
            cantidadColumnas: 0,
            distanciaColumnas: 0,
            // Montaje de trabe carril
            montajeTrabeCarril: "",
            metLinTraCarril: 0,
            // Medidas
            nptNhr: 0,
            // Pintura
            pinturaEstructura: "",
            tipoPintura: "",
            tipoCodigoPintura: 0,
            colorPintura: 0,
            // Fijación
            fijacionColumnas: "",
            // Observaciones
            observaciones: "",
          },
        },
      });
    },
    removeBahia(index) {
      this.selectedBahias.splice(index, 1);
    },

    clearSelectedBahias() {
      this.selectedBahias = [];
    },

    // Actualizar definiciones de una bahía específica
    updateBahiaDefiniciones(bahiaIndex, tipoDefinicion, datos) {
      if (this.selectedBahias[bahiaIndex]) {
        this.selectedBahias[bahiaIndex].definiciones[tipoDefinicion] = {
          ...this.selectedBahias[bahiaIndex].definiciones[tipoDefinicion],
          ...datos,
        };
      }
    },

    // Obtener definiciones completas de una bahía
    getBahiaDefiniciones(bahiaIndex) {
      return this.selectedBahias[bahiaIndex]?.definiciones || null;
    },
  },

  persist: {
    key: "bahias",
    storage: localStorage,
    paths: ["selectedBahias"],
  },
});
