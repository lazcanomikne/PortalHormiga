import { dataAppService } from "@/services/api";
import { defineStore } from "pinia";

const DEFINITION_DEFAULTS = {
  datosBasicos: {
    id: 0,
    idCotizacionProducto: 0,
    // Capacidades y dimensiones
    capacidadGrua: 0,
    capacidadNivelGruaAccesorios: 0,
    claro: 0,
    izaje: 0,
    longitudRecorrido: 0,
    pesoMuertoGrua: 0,
    cargaMaximaRueda: 0,
    // Plataforma
    gruaConPlataforma: false,
    observacionesPlataforma: "",
    // Controles
    controles: [],
    // Voltajes
    voltajeOperacion: "",
    voltajeOperacionOtro: "",
    voltajeControl: "",
    voltajeControlOtro: "",
    // Observaciones de control
    obsDatosBasicosControl: "",
    // Clasificación FEM/CMAA
    equivalenteFem: "",
    equivalenteFemValue: "",
    claseElevacion: "",
    deflexion: "",
    obsClasificacion: "",
    // Pintura
    tipoPintura: "",
    colorPintura: "",
    // Ambiente
    ambiente: "",
    ambienteOtro: "",
    materialTransporta: "",
    // Accesorios
    tipoGancho: "",
    dispositivoTomaCarga: false,
    carreteRetractil: false,
    torreta: false,
    tipoTorreta: "",
    especifiqueTorretaEspecial: "",
    sirena: false,
    tipoSirena: "",
    especifiqueSirenaEspecial: "",
    luminarias: false,
    tipoLuminarias: "",
    cantidadLuminarias: 0,
    // Ensayos y protección
    tipoEnsayosNoDestructivos: "",
    proteccionGabineteEletrico: "",
    // Mantenimiento
    cursoMantenimiento: false,
    cantidadHorasCurso: 0,
    lubricanteCentral: false,
    equipoEletricoClimatizado: false,
    // Observaciones finales
    obrLuminarias: "",
    cantidadGanchos: 0,
    especifiqueAreaTrabajoProducto: "",
    especifiqueAreaTrabajoProductoOtro: "",
    reaccionMaximaRueda: "",
  },
  gancho: {
    id: 0,
    idCotizacionProducto: 0,
    cantidadPolipastos: 0,
    polipastos: [],
    // Campos globales de gancho
    sumadorCarga: false,
    dispositivoMedicionSobrecarga: "",
    observacionIzaje: "",
    tipoPolipasto: [],
  },
  carro: {
    id: 0,
    idCotizacionProducto: 0,
    cantidadCarros: 1,
    controlSimultaneoIndependiente: "",
    switchLimite2PasosIzquierdo: false,
    interruptorLimite2PasosDerechos: false,
    observaciones: "",
    carros: [], // Array de carros individuales
  },
  puente: {
    id: 0,
    idCotizacionProducto: 0,
    controlPuente: "",
    tipoInversor: "",
    velocidadTraslacionPuente: "",
    especifiqueVelocidadTraslacionPuente: "",
    ruedasMotrices: {
      cantidadRuedas: 0,
      diametroRuedas: 0,
      tipoRuedaMotriz: null,
      tipoRuedaMotrizOtro: null,
      tipoRuedaLoca: null,
      tipoRuedaLocaOtro: null,
      materialRuedas: "GGG70",
      modeloRuedas: null,
      modeloRuedasOtro: null,
    },
    ruedasLocas: {
      cantidadRuedas: 0,
      diametroRuedas: 0,
      materialRuedas: "GGG70",
      modeloRuedas: null,
      modeloRuedasOtro: null,
    },
    cantidadMotorreductores: 0,
    motorreductorModelo: "",
    motorreductorModeloOtro: "",
    reductor: "",
    motorModeloPuente: "",
    motorPotenciaKw1: 0,
    motorPotenciaKw2: 0,
    switchLimFinCarrDel: false,
    interLimFinCarrTras: false,
    sisAnticolisionDel: false,
    sisAnticolisionTras: false,
    topeHidraulico: false,
    topeCelulosa: false,
    frenoElectrohidraulico: false,
    tipoAlimentacion: "",
    especifiqueTipoAlimentacion: "",
    especifiqueSistemaAlimentacion: "",
    especifiqueSistemaAlimentacionOtro: "",
    observaciones: "",
    puentes: [],
  },
  flete: {
    id: 0,
    idCotizacionProducto: 0,
    fletePorParteShosa: false,
    gruaFlete: false,
    alimentacionElectrica: false,
    observaciones: "",
  },
  montaje: {
    id: 0,
    idCotizacionProducto: 0,
    gruaMontaje: false,
    pruebasCargaMontaje: false,
    alimentacionElectricaMontaje: false,
    rielMontaje: false,
    estructuraMontaje: false,
    gruasMoviles: "",
    plataformaElevacionGeny: "",
    lineaVida: "",
    observaciones: "",
  },
  brazo: {},
  columna: {},
};

const ITEM_DEFINITIONS_MAPPING = {
  KBK: ["datosBasicos", "puente", "flete", "montaje"],
  "Grua giratoria": ["datosBasicos", "brazo"],
  "Grua giratoria KBK": ["datosBasicos", "brazo", "columna"],
  DEFAULT: ["datosBasicos", "gancho", "carro", "puente", "flete", "montaje"],
};

export const useArticlesStore = defineStore("articles", {
  state: () => ({
    articles: [],
    selectedArticles: [],
  }),
  actions: {
    async loadArticle() {
      this.articles = await (await dataAppService.getArticulos()).data;
    },
    addArticle(item) {
      const allowedSections =
        ITEM_DEFINITIONS_MAPPING[item.itemCode] ||
        ITEM_DEFINITIONS_MAPPING["DEFAULT"];

      const definiciones = {};

      allowedSections.forEach((section) => {
        // Deep copy defaults
        definiciones[section] = JSON.parse(
          JSON.stringify(DEFINITION_DEFAULTS[section] || {})
        );

        // Custom logic for defaults that depend on itemCode (from original code)
        if (section === "puente") {
          const isSpecial = ["ZKKE", "ZHPE", "ZVPE"].includes(item.itemCode);
          if (isSpecial) {
            definiciones[section].ruedasMotrices.cantidadRuedas = 2;
            definiciones[section].ruedasLocas.cantidadRuedas = 2;
            definiciones[section].especifiqueSistemaAlimentacion = "Ligero";
          }
        }
      });

      this.selectedArticles.push({
        uId: Date.now() + Math.random().toString(36).substr(2, 9),
        itemCode: item.itemCode,
        itemName: item.itemName,
        qty: 1,
        price: 0.0,
        bahia: "Seleccionar..",
        definiciones: definiciones,
      });
    },
    removeArticle(index) {
      this.selectedArticles.splice(index, 1);
    },

    clearSelectedArticles() {
      this.selectedArticles = [];
    },

    // Métodos para manejar definiciones por artículo
    updateArticleDefiniciones(uId, definiciones) {
      const article = this.selectedArticles.find(
        (item) => item.uId === uId
      );

      if (article) {
        const allowedSections =
          ITEM_DEFINITIONS_MAPPING[article.itemCode] ||
          ITEM_DEFINITIONS_MAPPING["DEFAULT"];

        // Filter incoming definitions to only include allowed sections.
        // El store UI usa estado "izaje" pero el JSON persistido y el backend usan "gancho".
        const filteredDefiniciones = {};
        Object.keys(definiciones).forEach((key) => {
          const normalizedKey = key === "izaje" ? "gancho" : key;
          if (allowedSections.includes(normalizedKey)) {
            filteredDefiniciones[normalizedKey] = definiciones[key];
          }
        });

        article.definiciones = { ...article.definiciones, ...filteredDefiniciones };
      }
    },

    getArticleDefiniciones(uId) {
      const article = this.selectedArticles.find(
        (item) => item.uId === uId
      );
      return article ? article.definiciones : null;
    },

    updateArticleDefinicionSection(uId, section, data) {
      const article = this.selectedArticles.find((item) => item.uId === uId);
      const sectionKey = section === "izaje" ? "gancho" : section;
      if (article && article.definiciones[sectionKey]) {
        article.definiciones[sectionKey] = {
          ...article.definiciones[sectionKey],
          ...data,
        };
      }
    },
  },

  persist: {
    key: "articles",
    storage: localStorage,
    paths: ["selectedArticles"],
  },
});
