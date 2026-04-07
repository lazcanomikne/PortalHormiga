import { defineStore } from "pinia";
import { useBahiasStore } from "./useBahiasStore";
const storeBahias = useBahiasStore();

export const useBahiaDefinicionesStore = defineStore("bahiaDefiniciones", {
  state: () => ({
    // Tab actual
    currentTab: "alimentacion",
    // Alimentación según CotizacionBahiaAlimentacion
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
    // Riel según CotizacionBahiaRiel
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
    // Estructura según CotizacionBahiaEstructura
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
    // Bahía actual seleccionada
    bahiaActual: {
      nombre: "",
      alimentacion: false,
      riel: false,
      estructura: false,
      index: -1, // Índice de la bahía en el array de selectedBahias
    },
  }),

  actions: {
    // Establecer la bahía actual
    setBahiaActual(bahia, index = -1) {
      this.bahiaActual = { ...bahia, index };

      // Cargar las definiciones existentes de la bahía si las tiene
      if (bahia.definiciones) {
        this.alimentacion = {
          ...this.alimentacion,
          ...bahia.definiciones.alimentacion,
        };
        this.riel = { ...this.riel, ...bahia.definiciones.riel };
        this.estructura = {
          ...this.estructura,
          ...bahia.definiciones.estructura,
        };
      }
    },

    // Actualizar alimentación
    updateAlimentacion(datos) {
      this.alimentacion = { ...this.alimentacion, ...datos };
    },

    // Actualizar riel
    updateRiel(datos) {
      this.riel = { ...this.riel, ...datos };
    },

    // Actualizar estructura
    updateEstructura(datos) {
      this.estructura = { ...this.estructura, ...datos };
    },

    // Guardar definiciones en la bahía específica
    guardarDefinicionesEnBahia() {
      if (this.bahiaActual.index >= 0) {
        const definicionesCompletas = this.getDefinicionesCompletas();

        // Actualizar cada tipo de definición en la bahía específica
        if (this.bahiaActual.alimentacion) {
          storeBahias.updateBahiaDefiniciones(
            this.bahiaActual.index,
            "alimentacion",
            definicionesCompletas.alimentacion
          );
        }
        if (this.bahiaActual.riel) {
          storeBahias.updateBahiaDefiniciones(
            this.bahiaActual.index,
            "riel",
            definicionesCompletas.riel
          );
        }
        if (this.bahiaActual.estructura) {
          storeBahias.updateBahiaDefiniciones(
            this.bahiaActual.index,
            "estructura",
            definicionesCompletas.estructura
          );
        }

        console.log(
          "Definiciones guardadas en bahía:",
          this.bahiaActual.nombre
        );
      }
    },

    // Limpiar todos los datos
    clearAll() {
      this.alimentacion = {
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
      };

      this.riel = {
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
      };

      this.estructura = {
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
      };

      this.bahiaActual = {
        nombre: "",
        alimentacion: false,
        riel: false,
        estructura: false,
        index: -1,
      };
    },

    // Obtener objeto completo para la API
    getDefinicionesCompletas() {
      return {
        alimentacion: { ...this.alimentacion },
        riel: { ...this.riel },
        estructura: { ...this.estructura },
      };
    },

    // Navegar a definiciones de bahía (Alternativa 4)
    navegarADefiniciones(bahia, index) {
      this.setBahiaActual(bahia, index);
      // Aquí podrías usar el router para navegar
      // Por ahora solo establece la bahía actual
      console.log("Navegando a definiciones para:", bahia, "índice:", index);
    },
    // Actualizar el tab actual
    updateCurrentTab(tab) {
      this.currentTab = tab;
    },
  },

  persist: {
    key: "bahia-definiciones",
    storage: localStorage,
    paths: ["currentTab", "alimentacion", "riel", "estructura", "bahiaActual"],
  },
});
