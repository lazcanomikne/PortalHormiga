import { dataAppService } from "@/services/api";
import { defineStore } from "pinia";
import { useArticlesStore } from "./useArticlesStore";
const articlesStore = useArticlesStore();

export const useArticuloDefinicionesStore = defineStore(
  "articuloDefiniciones",
  {
    state: () => ({
      // Artículo actual para el que se están editando las definiciones
      articuloActual: null,
      currentTab: "datosBasicos",

      // Datos básicos según CotizacionProductoDatosBasicos
      datosBasicos: {
        id: 0,
        idCotizacionProducto: 0,
        // Capacidades y dimensiones
        capacidadGrua: 0,
        capacidadNivelGruaAccesorios: 0,
        claro: 0,
        clasificacionPuentes: "",
        izaje: 0,
        claseElevacion: "",
        cantidadGanchos: 0,
        ganchos: [],
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
        reaccionMaximaRueda: "",
        // Observaciones finales
        obrLuminarias: "",
        observaciones: "",
      },
      // Izaje según CotizacionProductoIzaje
      izaje: {
        id: 0,
        idCotizacionProducto: 0,
        cantidadPolipastos: 0,
        polipastos: [],
        // Campos globales de izaje
        sumadorCarga: false,
        dispositivoMedicionSobrecarga: "",
        observacionIzaje: "",
        tipoPolipasto: [],
        // Propiedades de control múltiple
        simultaneo: false,
        independiente: false,
        sincrono: false,
      },
      // Carro - Nueva sección
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
      // Puente - Nueva sección
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
      // Flete - Nueva sección
      flete: {
        id: 0,
        idCotizacionProducto: 0,
        fletePorParteShosa: false,
        gruaFlete: false,
        alimentacionElectrica: false,
        observaciones: "",
      },
      // Montaje - Nueva sección
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
      brazo: {
        id: 0,
        idCotizacionProducto: 0,
        montaje: "",
        tratamientoSuperficialBrazo: "",
        limitadorMovimientoGiro: "",
        actuadoresFinalCarreraRecorridoTransversal: "",
        puntaFoqueBiselada: "",
        fuenteAlimentacion: "",
        pinturaUnidadGiro: "",
        dispositivoBloqueo: "",
        pinturaGrua: "",
        galvanizadoGrua: "",
        embalaje: "",
        limitacionGiro: "",
      },
      columna: {
        id: 0,
        idCotizacionProducto: 0,
        montaje: "",
        placaMovil: "",
        certificadoFabricacion: "",
        certificateAccordingToECMachineryDirective: "",
      },
      // Artículo actual seleccionado
      tipoRuedas1: [],
      tipoRuedas2: [],
      motorreductor: [],
      modelos: [],
      plazosDias: [],
      tipoFianza: [],
      agentes: [],
      tipoGarantias: [],
      vendedores: [],
      brazos: [],
    }),

    actions: {
      // Establecer el artículo actual
      setArticuloActual(articulo) {
        this.articuloActual = articulo;
      },

      // Actualizar el tab actual
      updateCurrentTab(tab) {
        this.currentTab = tab;
      },

      // Actualizar datos básicos
      updateDatosBasicos(datos) {
        this.datosBasicos = { ...this.datosBasicos, ...datos };
      },

      // Actualizar adicionales
      updateAdicionales(datos) {
        this.adicionales = { ...this.adicionales, ...datos };
      },

      // Actualizar izaje
      updateIzaje(datos) {
        this.izaje = { ...this.izaje, ...datos };
      },

      // Actualizar carro
      updateCarro(datos) {
        this.carro = { ...this.carro, ...datos };
      },

      // Actualizar puente
      updatePuente(datos) {
        this.puente = { ...this.puente, ...datos };
      },

      // Actualizar flete
      updateFlete(datos) {
        this.flete = { ...this.flete, ...datos };
      },

      // Actualizar montaje
      updateMontaje(datos) {
        this.montaje = { ...this.montaje, ...datos };
      },

      // Actualizar información complementaria
      updateInformacionComplementaria(datos) {
        this.informacionComplementaria = {
          ...this.informacionComplementaria,
          ...datos,
        };
      },

      // Actualizar formación de precios
      updateFormacionPrecios(datos) {
        this.formacionPrecios = { ...this.formacionPrecios, ...datos };
      },

      agregarPolipasto() {
        this.izaje.polipastos.push({
          gancho: "",
          capacidadGancho: 0,
          izajeGancho: 0,
          codigoContruccion: "",
          codigoContruccion1: "",
          control: "",
          controlInversor: "",
          controlInversorOtro: "",
          velIzaje1: 0,
          velIzaje2: 0,
          voltajeControl: "",
          voltajeControlOtro: "",
          voltajeOperacion: "",
          voltajeOperacionOtro: "",
          potenciaMotorIzaje: 0,
          potenciaMotorIzaje2: 0,
          tipoFreno: "",
          clasificacion: "",
          frenoEmergencia: false,
          observaciones: "",
          velocidadIzaje1: 0,
          velocidadIzaje2: 0,
          motorModeloGanchoPrincipal: "",
          frenoElectrohidraulico: false,
          frenoElectromagnetico: false,
          frenoSeguridad: false,
          potenciaMotorPrincipal1: 0,
          potenciaMotorPrincipal2: 0,
          segundoFreno: false,
          dispositivoTomaCarga: false,
          carrete: false,
          especifiqueDispositivoGancho1: "",
          especifiqueDispositivoGancho2: "",
          carreteGancho: "",
        });
      },
      eliminarPolipasto(index) {
        this.izaje.polipastos.splice(index, 1);
      },

      // Limpiar todos los datos
      clearAll() {
        this.$reset();
      },

      // Obtener objeto completo para la API
      getDefinicionesCompletas() {
        return {
          datosBasicos: { ...this.datosBasicos },
          izaje: { ...this.izaje },
          carro: { ...this.carro },
          puente: { ...this.puente },
          flete: { ...this.flete },
          montaje: { ...this.montaje },
          brazo: { ...this.brazo },
          columna: { ...this.columna },
        };
      },

      // Navegar a definiciones de artículo (Alternativa 4)
      navegarADefiniciones(articulo) {
        this.setArticuloActual(articulo);

        // Cargar las definiciones del artículo específico
        if (articulo.definiciones) {
          this.cargarDefinicionesDelArticulo(articulo.definiciones);
        } else {
          // Si no tiene definiciones, inicializar con valores por defecto
          this.inicializarDefinicionesPorDefecto();
        }

        console.log("Navegando a definiciones para:", articulo);
      },

      // Cargar definiciones desde un artículo específico
      cargarDefinicionesDelArticulo(definiciones) {
        this.datosBasicos = {
          ...this.datosBasicos,
          ...definiciones.datosBasicos,
        };
        this.adicionales = { ...this.adicionales, ...definiciones.adicionales };
        this.izaje = { ...this.izaje, ...definiciones.izaje };
        this.carro = { ...this.carro, ...definiciones.carro };
        this.puente = { ...this.puente, ...definiciones.puente };
        this.flete = { ...this.flete, ...definiciones.flete };
        this.montaje = { ...this.montaje, ...definiciones.montaje };
        this.informacionComplementaria = {
          ...this.informacionComplementaria,
          ...definiciones.informacionComplementaria,
        };
        this.formacionPrecios = {
          ...this.formacionPrecios,
          ...definiciones.formacionPrecios,
        };
        this.brazo = { ...this.brazo, ...definiciones.brazo };
        this.columna = { ...this.columna, ...definiciones.columna };
      },

      // Inicializar definiciones por defecto
      inicializarDefinicionesPorDefecto() {
        // Los valores por defecto ya están en el state inicial
        // Solo necesitamos asegurarnos de que estén limpios
        this.resetearDefiniciones();
      },

      // Resetear definiciones a valores por defecto
      resetearDefiniciones() {
        // Resetear a los valores iniciales del state
        // (Los valores ya están definidos en el state inicial)
      },

      // Guardar definiciones en el artículo actual
      guardarDefinicionesEnArticulo() {
        if (!this.articuloActual) return;

        const definiciones = this.getDefinicionesCompletas();

        // Importar el store de artículos para actualizar las definiciones
        const articlesStore = useArticlesStore();

        articlesStore.updateArticleDefiniciones(
          this.articuloActual.itemCode,
          definiciones
        );
      },

      // Guardar una sección específica de definiciones
      guardarSeccionDefiniciones(seccion, datos) {
        if (!this.articuloActual) return;

        articlesStore.updateArticleDefinicionSection(
          this.articuloActual.itemCode,
          seccion,
          datos
        );
      },

      // Método para auto-guardar cuando se modifiquen los datos
      autoGuardar() {
        if (this.articuloActual) {
          this.guardarDefinicionesEnArticulo();
        }
      },
      agregarControl() {
        this.datosBasicos.controles.push({
          tipoControl: "",
          medioControl: "",
          funcionesCabina: "",
          tipoCabina: "",
          caracteristicasTecnicasCabina: "",
          funcionesAutomatizacion: "",
          funcionesSemiautomatizacion: "",
          marcaModeloPLC: "",
          marcaModeloHMI: "",
          fabricanteModelo: "",
          observaciones: "",
        });
      },
      eliminarControl(index) {
        this.datosBasicos.controles.splice(index, 1);
      },
      agregarCarro() {
        this.carro.carros.push({
          control: "",
          tipoInversor: "",
          velocidadTraslacion: "",
          especifiqueVelocidadTraslacion: "",
          interruptorFinalCarrera: "",
          especifiqueMarcaModeloInterruptor: "",
          cantidadRuedasTraslacion: 4,
          diametroRuedas: 0,
          cantidadTipoRuedaMotrizA: 0,
          tipoRuedaMotrizA: "",
          cantidadTipoRuedaConducidaMA: 0,
          tipoRuedaConducidaMA: "",
          cantidadTipoRuedaLocaNA: 0,
          tipoRuedaLocaNA: "",
          materialRuedas: "30070",
          motorreductorModelo: "",
          reductor: "",
          motorModelo: "",
          motorPotencia1: 0,
          motorPotencia2: 0,
          topeHidraulico: false,
          topeCelulosa: false,
          frenoElectrohidraulico: false,
          plataforma: false,
          observacionesPlataforma: "",
          observaciones: "",
        });
      },
      eliminarCarro(index) {
        this.carro.carros.splice(index, 1);
      },
      async loadCatalogos() {
        this.tipoRuedas1 = await (
          await dataAppService.getTipoRuedas("5")
        ).data.map((item) => item.itemCode);
        this.tipoRuedas2 = await (
          await dataAppService.getTipoRuedas("6")
        ).data.map((item) => item.itemCode);
        this.motorreductor = await (
          await dataAppService.getTipoMotorreductor()
        ).data.map((item) => item.itemCode);
        this.modelos = await (
          await dataAppService.getModelos()
        ).data.map((item) => item.itemCode);
        this.plazosDias = await (await dataAppService.getPlazoDias()).data;

        this.tipoFianza = await (await dataAppService.getTipoFianza()).data;
        this.agentes = await (await dataAppService.getAgentes()).data;
        this.tipoGarantias = await (
          await dataAppService.getTipoGarantias()
        ).data;
        this.vendedores = await (await dataAppService.getVendedores()).data;
        this.brazos = await (await dataAppService.getBrazos()).data;
      },
    },

    persist: {
      key: "articulo-definiciones",
      storage: localStorage,
      paths: [
        "articuloActual",
        "currentTab",
        "datosBasicos",
        "adicionales",
        "izaje",
        "carro",
        "puente",
        "flete",
        "montaje",
        "informacionComplementaria",
        "formacionPrecios",
        "tipoRuedas1",
        "tipoRuedas2",
        "motorreductor",
        "modelos",
        "plazosDias",
        "tipoFianza",
        "agentes",
        "tipoGarantias",
        "codigoContruccion",
        "brazo",
      ],
    },
  }
);
