/**
 * Objeto completo de una cotización con todas las propiedades
 * Incluye encabezado, productos, bahías y conceptos
 */

export const cotizacionCompleta = {
  // ===== ENCABEZADO DE LA COTIZACIÓN =====
  encabezado: {
    id: 0,
    tipoCotizacion: "Nueva",
    tipoCuenta: "Cliente",
    idioma: "Español",
    cliente: "Empresa Ejemplo S.A. de C.V.",
    personaContacto: "Juan Pérez",
    direccionFiscal: "Av. Principal 123, Col. Centro, CDMX",
    direccionEntrega: "Planta Industrial, Zona Industrial Norte",
    referencia: "REF-2024-001",
    terminosEntrega: "FOB Origen",
    folioPortal: "PORT-2024-001",
    folioSAP: "SAP-2024-001",
    fecha: "2024-01-15",
    vencimiento: "2024-02-14",
    moneda: "MXN",
    estado: "Borrador",
    total: 0,
    subtotal: 0,
    impuestos: 0,
    descuentos: 0,
    observacionesGenerales: "",
    condicionesComerciales: "",
    vigencia: 30,
    creadoPor: "",
    fechaCreacion: "",
    modificadoPor: "",
    fechaModificacion: "",
  },

  // ===== PRODUCTOS/ARTÍCULOS =====
  productos: [
    {
      id: 1,
      itemCode: "GRUA-001",
      itemName: "Grúa Puente 5 Ton",
      qty: 1,
      price: 500000.0,
      bahia: "Bahía Principal",
      definiciones: {
        // Datos básicos del producto
        datosBasicos: {
          id: 0,
          idCotizacionProducto: 0,
          // Capacidades y dimensiones
          capacidadGrua: 5000,
          capacidadNivelGruaAccesorios: 5000,
          claro: 12000,
          izaje: 6000,
          longitudRecorrido: 25000,
          pesoMuertoGrua: 15000,
          cargaMaximaRueda: 2500,
          // Plataforma
          gruaConPlataforma: false,
          observacionesPlataforma: "",
          // Controles
          controles: [
            {
              id: 0,
              idCotizacionProducto: 0,
              medioControl: "Botonera",
              fabricanteModelo: "DEMAG",
              observaciones: "Control estándar",
              tipoControl: "Botonera",
              tipoCabina: "",
              caracteristicasTecnicasCabina: "",
              funcionesCabina: "",
              funcionesAutomatizacion: "",
              funcionesSemiautomatizacion: "",
              marcaModeloPLC: "",
              marcaModeloHMI: "",
            },
          ],
          // Voltajes
          voltajeOperacion: "440 V/60 Hz",
          voltajeOperacionOtro: "",
          voltajeControl: "24 V/60 Hz",
          voltajeControlOtro: "",
          // Observaciones de control
          obsDatosBasicosControl: "Control estándar con botonera",
          // Clasificación FEM/CMAA
          equivalenteFem: "Si",
          equivalenteFemValue: "1Dm / A / M1 / H1",
          claseElevacion: "H1 / B2",
          deflexion: "L/800",
          obsClasificacion: "Clasificación estándar",
          // Pintura
          tipoPintura: "Estandar SHOSA",
          colorPintura: "RAL 7035",
          // Ambiente
          ambiente: "Normal",
          ambienteOtro: "",
          materialTransporta: "Material general",
          // Accesorios
          tipoGancho: "Sencillo",
          dispositivoTomaCarga: false,
          carreteRetractil: false,
          torreta: false,
          tipoTorreta: "",
          especifiqueTorretaEspecial: "",
          sirena: true,
          tipoSirena: "Estandar Hormiga",
          especifiqueSirenaEspecial: "",
          luminarias: true,
          tipoLuminarias: "LED",
          cantidadLuminarias: 4,
          // Ensayos y protección
          tipoEnsayosNoDestructivos: "Liquidos penetrantes",
          proteccionGabineteEletrico: "IP55",
          // Mantenimiento
          cursoMantenimiento: true,
          cantidadHorasCurso: 8,
          lubricanteCentral: false,
          equipoEletricoClimatizado: false,
          // Observaciones finales
          obrLuminarias: "Luminarias LED de alta eficiencia",
        },

        // Adicionales
        adicionales: {
          id: 0,
          idCotizacionProducto: 0,
          dispositivoTomaCarga: false,
          carreteRetractil: false,
          torreta: false,
          especifiqueTorretaEspecial: "",
          sirena: true,
          tipoSirena: "Estandar Hormiga",
          especifiqueSirenaEspecial: "",
          luminarias: true,
          tipoLuminarias: "LED",
          cantidadLuminarias: 4,
          observaciones: "Accesorios estándar incluidos",
        },

        // Izaje
        izaje: {
          id: 0,
          idCotizacionProducto: 0,
          cantidadPolipastos: 1,
          polipastos: [
            {
              id: 0,
              idCotizacionProducto: 0,
              // Campos básicos del polipasto
              tipoMecanismoElevacion: "Cable",
              modelo: "DEMAG ZK 5-1",
              capacidadMecanismoIzaje: 5000,
              izajeGancho: 6000,
              control: "Contactores",
              controlInversor: "",
              // Velocidad de izaje (dos campos para m/min)
              velocidadIzaje1: "8",
              velocidadIzaje2: "2",
              // Motor
              motorModeloGanchoPrincipal: "DEMAG 4KW",
              potenciaMotorPrincipal1: "4",
              potenciaMotorPrincipal2: "1",
              // Frenos
              frenoElectrohidraulico: true,
              frenoElectromagnetico: false,
              frenoSeguridad: true,
              // Accesorios específicos del polipasto
              segundoFreno: false,
              dispositivoTomaCarga: false,
              carrete: false,
              especifiqueDispositivoGancho1: "",
              especifiqueDispositivoGancho2: "",
              carreteGancho: "",
              // Observaciones
              observaciones: "Polipasto estándar con freno electrohidráulico",
            },
          ],
          // Campos globales de izaje
          sumadorCarga: false,
          dispositivoMedicionSobrecarga: "Electronico",
          observacionIzaje: "Sistema de izaje estándar",
          tipoPolipasto: [],
        },

        // Alimentación
        alimentacion: {
          id: 0,
          idCotizacionProducto: 0,
          aliEleLarNave: true,
          longitudSistema: 25,
          acomElec: "Trifásica 440V",
          localAcometida: "Al centro",
          localAcometidaOtro: "",
          amperaje: 20,
          temperatura: "40",
          temperaturaOtro: "",
          adecuadaAlimentar: "Sistema completo",
          interruptorGeneral: true,
          tipoAlim: "Barras",
          tipoAlimOtro: "",
          areaTrabajo: "Interior",
          sistemaAlimentacionFestoon: "",
          tipoSistemaAlimentacion: "Barras conductoras",
          observaciones: "Alimentación estándar con barras conductoras",
        },

        // Tipo de Alimentación
        tipoAlim: {
          id: 0,
          idCotizacionProducto: 0,
          tipoSistemaAlimentacion: "Barras conductoras",
        },

        // Riel
        riel: {
          id: 0,
          idCotizacionProducto: 0,
          tipoRiel: "ASCE",
          tipoRielOtro: "",
          metrosLinealesRiel: 25,
          calidadMaterialRiel: "S35555J2+N",
          calidadMaterialRielOtro: "",
          observaciones: "Riel ASCE estándar",
        },

        // Estructura
        estructura: {
          id: 0,
          idCotizacionProducto: 0,
          lotesRequeridos: 1,
          trabeCarril: true,
          columnas: true,
          cantidadColumnas: 2,
          distanciaColumnas: 12000,
          mensula: false,
          caminoRodaduraPiso: false,
          placaAhogada: false,
          placaSobreNivelPiso: false,
          placaSobreGround: false,
          anclajeQuimico: false,
          caminoRodaduraPisoEjeB: false,
          placaAhogadaEjeB: false,
          placaSobreNivelPisoEjeB: false,
          placaSobreGroundEjeB: false,
          anclajeQuimicoEjeB: false,
          cimentacion: true,
          montajePlaca: true,
          montajeTrabeCarril: true,
          metrosLinealesTrabeCarril: 25,
          nptNhr: 0,
          pinturaEstructura: true,
          tipoPintura: "Estandar SHOSA",
          tipoCodigoPintura: 0,
          colorPintura: 0,
          fijacionColumnas: "SHOSA",
          observaciones: "Estructura estándar con cimentación",
        },

        // Carro
        carro: {
          id: 0,
          idCotizacionProducto: 0,
          cantidadCarros: 1,
          controlSimultaneoIndependiente: "",
          switchLimite2PasosIzquierdo: false,
          interruptorLimite2PasosDerechos: false,
          observaciones: "Carro estándar",
          carros: [
            {
              id: 0,
              idCotizacionProducto: 0,
              // Control y tipo de inversor
              control: "Contactores / Dos velocidades",
              tipoInversor: "",
              // Velocidad de traslación
              velocidadTraslacion: "28.8/7.2",
              especifiqueVelocidadTraslacion: "",
              // Interruptor final de carrera
              interruptorFinalCarrera: "Dos pasos",
              especifiqueMarcaModeloInterruptor: "DEMAG",
              // Ruedas
              cantidadRuedasTraslacion: 4,
              diametroRuedas: 200,
              tipoRuedaMotrizA: "A-200",
              tipoRuedaConducidaMA: "MA-200",
              tipoRuedaLocaNA: "NA-200",
              materialRuedas: "30070",
              // Motorreductor y motor
              motorreductorModelo: "SEW-2.2KW",
              reductor: "SEW",
              motorModelo: "SEW 2.2KW",
              motorPotencia1: 2.2,
              motorPotencia2: 0.5,
              // Accesorios
              topeHidraulico: false,
              topeCelulosa: true,
              frenoElectrohidraulico: false,
              plataforma: false,
              observacionesPlataforma: "",
              // Observaciones generales
              observaciones: "Carro estándar con tope celulosa",
            },
          ],
        },

        // Puente
        puente: {
          id: 0,
          idCotizacionProducto: 0,
          controlPuente: "Contactores",
          tipoInversor: "",
          velocidadTraslacionPuente: "28.8/7.2",
          especifiqueVelocidadTraslacionPuente: "",
          ruedasMotrices: {
            cantidadRuedas: 4,
            diametroRuedas: 200,
            tipoRuedaMotriz: "A-200",
            tipoRuedaMotrizOtro: "",
            tipoRuedaLoca: "NA-200",
            tipoRuedaLocaOtro: "",
            materialRuedas: "GGG70",
            modeloRuedas: "DEMAG",
            modeloRuedasOtro: "",
          },
          ruedasLocas: {
            cantidadRuedas: 4,
            diametroRuedas: 200,
            materialRuedas: "GGG70",
            modeloRuedas: "DEMAG",
            modeloRuedasOtro: "",
          },
          cantidadMotorreductores: 2,
          motorreductorModelo: "SEW-2.2KW",
          motorreductorModeloOtro: "",
          reductor: "SEW",
          motorModeloPuente: "SEW 2.2KW",
          motorPotenciaKw1: 2.2,
          motorPotenciaKw2: 0.5,
          switchLimFinCarrDel: true,
          interLimFinCarrTras: true,
          sisAnticolisionDel: false,
          sisAnticolisionTras: false,
          topeHidraulico: false,
          topeCelulosa: true,
          frenoElectrohidraulico: false,
          tipoAlimentacion: "Barras",
          especifiqueTipoAlimentacion: "",
          especifiqueAreaTrabajo: "Interior",
          especifiqueAreaTrabajoOtro: "",
          especifiqueSistemaAlimentacion: "",
          especifiqueSistemaAlimentacionOtro: "",
          observaciones: "Puente estándar con topes celulosa",
        },

        // Flete
        flete: {
          id: 0,
          idCotizacionProducto: 0,
          fletePorParteShosa: false,
          gruaFlete: false,
          alimentacionElectrica: false,
          observaciones: "Flete por cuenta del cliente",
        },

        // Montaje
        montaje: {
          id: 0,
          idCotizacionProducto: 0,
          gruaMontaje: false,
          pruebasCargaMontaje: true,
          alimentacionElectricaMontaje: false,
          rielMontaje: false,
          estructuraMontaje: false,
          gruasMoviles: "",
          plataformaElevacionGeny: "",
          lineaVida: "",
          observaciones: "Montaje por cuenta del cliente",
        },

        // Información complementaria
        informacionComplementaria: {
          id: 0,
          idCotizacionProducto: 0,
          seguridadCarnetIdentificacion: true,
          examenMedico: true,
          cursoSeguridad: true,
          bomberos: false,
          supervisorSeguridad: true,
          permisosAltura: true,
          permisosSoldar: false,
          tarjetaForaneaImss: false,
          afil15: false,
          sanitariosClientes: true,
          sanitariosRentados: false,
          areaResguardoHerramienta: true,
          comprobantesPagoPersonalImss: true,
          equipoProteccionPersonal: true,
          constanciaHabilidadesLaboralesDc3: true,
          platicasSeguridadImpartidas: true,
          examenesMedicos: true,
          permisoTrabajo: true,
          analisisRiesgo: true,
          permisoTrabajoEspaciosConfinados: false,
          permisoTrabajosElectricos: true,
          tecnicoSeguridad: true,
          extintoresAreaTrabajo: true,
          lonasTrabajosAltura: true,
          lonaAntichispas: false,
          oficinaMovil: false,
          ambulancia: false,
          cuotaSindical: false,
          setRefacciones: false,
          estudioTopografico: false,
          observaciones: "Documentación de seguridad estándar",
        },

        // Formación de precios
        formacionPrecios: {
          id: 0,
          idCotizacionProducto: 0,
          plazoPago: "30 días",
          observaciones: "Precio base sin descuentos",
        },
      },
    },
  ],

  // ===== BAHÍAS =====
  bahias: [
    {
      id: 1,
      nombre: "Bahía Principal",
      alimentacion: true,
      riel: true,
      estructura: true,
      definiciones: {
        // Alimentación de la bahía
        alimentacion: {
          id: 0,
          idCotizacionBahia: 0,
          // Alimentación eléctrica
          aliEleLarNave: true,
          longitudSistema: 25,
          acomElec: 1,
          // Localización de acometida
          localAcometida: "Al centro",
          localAcometidaOtro: "",
          // Características eléctricas
          amperaje: 20,
          temperatura: "40",
          temperaturaOtro: "",
          // Especificaciones
          adecuadaAlimentar: "Sistema completo de grúas",
          interruptorGeneral: true,
          // Tipo de alimentación
          tipoAlimentacion: "Barras",
          tipoAlimOtro: "",
          especifiqueAreaTrabajo: "Interior",
          // Sistema Festoon
          especifiqueSistemaAlimentacion: "Ligero",
          // Observaciones
          observaciones: "Alimentación principal para grúas puente",
        },

        // Riel de la bahía
        riel: {
          id: 0,
          idCotizacionBahia: 0,
          // Tipo de riel
          tipoRiel: "ASCE",
          especifiqueTipoRiel: "",
          // Medidas
          metrosLinealesRiel: 25,
          // Calidad del material
          calidadMaterialRiel: "S35555J2+N",
          especifiqueCalidadMaterialRiel: "",
          // Observaciones
          observaciones: "Riel ASCE para grúas puente",
        },

        // Estructura de la bahía
        estructura: {
          id: 0,
          idCotizacionBahia: 0,
          // Lotes y componentes
          lotesRequeridos: 1,
          trabeCarril: true,
          columnas: true,
          mensula: false,
          // Columnas
          cantidadColumnas: 2,
          distanciaColumnas: 12000,
          // Montaje de trabe carril
          montajeTrabeCarril: "Y",
          metLinTraCarril: 25,
          // Medidas
          nptNhr: 0,
          // Pintura
          pinturaEstructura: "Y",
          tipoPintura: "Estandar SHOSA",
          tipoCodigoPintura: 0,
          colorPintura: 7035,
          // Fijación
          fijacionColumnas: "SHOSA",
          // Observaciones
          observaciones: "Estructura principal para grúas puente",
        },
      },
    },
  ],

  // ===== CONCEPTOS ADICIONALES =====
  conceptos: [
    {
      id: 1,
      codigo: "CONC-001",
      descripcion: "Instalación y puesta en marcha",
      cantidad: 1,
      precioUnitario: 50000.0,
      importe: 50000.0,
      tipo: "Servicio",
      categoria: "Instalación",
      observaciones: "Incluye instalación completa y pruebas",
    },
    {
      id: 2,
      codigo: "CONC-002",
      descripcion: "Capacitación operadores",
      cantidad: 2,
      precioUnitario: 5000.0,
      importe: 10000.0,
      tipo: "Servicio",
      categoria: "Capacitación",
      observaciones: "8 horas de capacitación por operador",
    },
    {
      id: 3,
      codigo: "CONC-003",
      descripcion: "Garantía extendida 2 años",
      cantidad: 1,
      precioUnitario: 25000.0,
      importe: 25000.0,
      tipo: "Garantía",
      categoria: "Servicio",
      observaciones: "Garantía extendida por 2 años adicionales",
    },
  ],

  // ===== RESUMEN FINANCIERO =====
  resumen: {
    subtotalProductos: 500000.0,
    subtotalBahias: 0.0,
    subtotalConceptos: 85000.0,
    subtotal: 585000.0,
    descuentoPorcentaje: 0,
    descuentoMonto: 0.0,
    subtotalConDescuento: 585000.0,
    ivaPorcentaje: 16,
    ivaMonto: 93600.0,
    total: 678600.0,
    moneda: "MXN",
    tipoCambio: 1.0,
    observacionesFinancieras: "Precios válidos por 30 días",
  },

  // ===== METADATOS =====
  metadata: {
    version: "1.0",
    fechaCreacion: "2024-01-15T10:30:00Z",
    fechaModificacion: "2024-01-15T10:30:00Z",
    creadoPor: "Usuario Sistema",
    modificadoPor: "Usuario Sistema",
    estado: "Borrador",
    versionDocumento: 1,
    comentarios: "Cotización inicial",
  },
};

export default cotizacionCompleta;
