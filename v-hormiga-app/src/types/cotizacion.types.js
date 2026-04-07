/**
 * Tipos y interfaces para la estructura de cotizaciones
 * Documentación de la estructura completa de una cotización
 */

// ===== ENCABEZADO =====
export const encabezadoType = {
  id: "number",
  tipoCotizacion: "string", // Nueva, Modificación, Renovación
  tipoCuenta: "string", // Cliente, Prospecto
  idioma: "string", // Español, Inglés
  cliente: "string",
  personaContacto: "string",
  direccionFiscal: "string",
  direccionEntrega: "string",
  referencia: "string",
  terminosEntrega: "string", // FOB Origen, FOB Destino, etc.
  folioPortal: "string",
  folioSap: "string",
  fecha: "string", // YYYY-MM-DD
  vencimiento: "string", // YYYY-MM-DD
  moneda: "string", // MXN, USD, EUR
  estado: "string", // Borrador, Enviada, Aprobada, Rechazada
  total: "number",
  subtotal: "number",
  impuestos: "number",
  descuentos: "number",
  observacionesGenerales: "string",
  condicionesComerciales: "string",
  vigencia: "number", // días
  creadoPor: "string",
  fechaCreacion: "string",
  modificadoPor: "string",
  fechaModificacion: "string",
};

// ===== DATOS BÁSICOS DEL PRODUCTO =====
export const datosBasicosType = {
  id: "number",
  idCotizacionProducto: "number",
  // Capacidades y dimensiones
  capacidadGrua: "number",
  capacidadNivelGruaAccesorios: "number",
  claro: "number",
  izaje: "number",
  longitudRecorrido: "number",
  pesoMuertoGrua: "number",
  cargaMaximaRueda: "number",
  // Plataforma
  gruaConPlataforma: "boolean",
  observacionesPlataforma: "string",
  // Controles
  controles: "array", // Array de objetos control
  // Voltajes
  voltajeOperacion: "string",
  voltajeOperacionOtro: "string",
  voltajeControl: "string",
  voltajeControlOtro: "string",
  // Observaciones de control
  obsDatosBasicosControl: "string",
  // Clasificación FEM/CMAA
  equivalenteFem: "string",
  equivalenteFemValue: "string",
  claseElevacion: "string",
  deflexion: "string",
  obsClasificacion: "string",
  // Pintura
  tipoPintura: "string",
  colorPintura: "string",
  // Ambiente
  ambiente: "string",
  ambienteOtro: "string",
  materialTransporta: "string",
  // Accesorios
  tipoGancho: "string",
  dispositivoTomaCarga: "boolean",
  carreteRetractil: "boolean",
  torreta: "boolean",
  tipoTorreta: "string",
  especifiqueTorretaEspecial: "string",
  sirena: "boolean",
  tipoSirena: "string",
  especifiqueSirenaEspecial: "string",
  luminarias: "boolean",
  tipoLuminarias: "string",
  cantidadLuminarias: "number",
  // Ensayos y protección
  tipoEnsayosNoDestructivos: "string",
  proteccionGabineteEletrico: "string",
  // Mantenimiento
  cursoMantenimiento: "boolean",
  cantidadHorasCurso: "number",
  lubricanteCentral: "boolean",
  equipoEletricoClimatizado: "boolean",
  // Observaciones finales
  obrLuminarias: "string",
};

// ===== CONTROL =====
export const controlType = {
  id: "number",
  idCotizacionProducto: "number",
  medioControl: "string",
  fabricanteModelo: "string",
  observaciones: "string",
  tipoControl: "string",
  tipoCabina: "string",
  caracteristicasTecnicasCabina: "string",
  funcionesCabina: "string",
  funcionesAutomatizacion: "string",
  funcionesSemiautomatizacion: "string",
  marcaModeloPLC: "string",
  marcaModeloHMI: "string",
};

// ===== POLIPASTO =====
export const polipastoType = {
  id: "number",
  idCotizacionProducto: "number",
  // Campos básicos del polipasto
  tipoMecanismoElevacion: "string", // Cable, Cadena
  modelo: "string",
  capacidadMecanismoIzaje: "number",
  izajeGancho: "number",
  control: "string", // Contactores, Inversor
  controlInversor: "string",
  // Velocidad de izaje (dos campos para m/min)
  velocidadIzaje1: "string",
  velocidadIzaje2: "string",
  // Motor
  motorModelo: "string",
  potenciaMotorPrincipal1: "string",
  potenciaMotorPrincipal2: "string",
  // Frenos
  frenoElectrohidraulico: "boolean",
  frenoElectromagnetico: "boolean",
  frenoSeguridad: "boolean",
  // Accesorios específicos del polipasto
  segundoFreno: "boolean",
  dispositivoTomaCarga: "boolean",
  carrete: "boolean",
  especifiqueDispositivoGancho1: "string",
  especifiqueDispositivoGancho2: "string",
  carreteGancho: "string",
  // Observaciones
  observaciones: "string",
};

// ===== IZAJE =====
export const izajeType = {
  id: "number",
  idCotizacionProducto: "number",
  cantidadPolipastos: "number",
  polipastos: "array", // Array de objetos polipasto
  // Campos globales de izaje
  sumadorCarga: "boolean",
  dispositivoMedicionSobrecarga: "string",
  observacionIzaje: "string",
  tipoPolipasto: "array",
};

// ===== CARRO =====
export const carroType = {
  id: "number",
  idCotizacionProducto: "number",
  cantidadCarros: "number",
  controlSimultaneoIndependiente: "string",
  switchLimite2PasosIzquierdo: "boolean",
  interruptorLimite2PasosDerechos: "boolean",
  observaciones: "string",
  carros: "array", // Array de objetos carro individual
};

// ===== CARRO INDIVIDUAL =====
export const carroIndividualType = {
  id: "number",
  idCotizacionProducto: "number",
  // Control y tipo de inversor
  control: "string",
  tipoInversor: "string",
  // Velocidad de traslación
  velocidadTraslacion: "string",
  especifiqueVelocidadTraslacion: "string",
  // Interruptor final de carrera
  interruptorFinalCarrera: "string",
  especifiqueMarcaModeloInterruptor: "string",
  // Ruedas
  cantidadRuedasTraslacion: "number",
  diametroRuedas: "number",
  tipoRuedaMotrizA: "string",
  tipoRuedaConducidaMA: "string",
  tipoRuedaLocaNA: "string",
  materialRuedas: "string",
  // Motorreductor y motor
  motorreductorModelo: "string",
  reductor: "string",
  motorModelo: "string",
  motorPotencia1: "number",
  motorPotencia2: "number",
  // Accesorios
  topeHidraulico: "boolean",
  topeCelulosa: "boolean",
  frenoElectrohidraulico: "boolean",
  plataforma: "boolean",
  observacionesPlataforma: "string",
  // Observaciones generales
  observaciones: "string",
};

// ===== ALIMENTACIÓN BAHÍA =====
export const alimentacionBahiaType = {
  id: "number",
  idCotizacionBahia: "number",
  // Alimentación eléctrica
  aliEleLarNave: "boolean",
  longitudSistema: "number",
  acomElec: "number",
  // Localización de acometida
  localAcometida: "string",
  localAcometidaOtro: "string",
  // Características eléctricas
  amperaje: "number",
  temperatura: "string",
  temperaturaOtro: "string",
  // Especificaciones
  adecuadaAlimentar: "string",
  interruptorGeneral: "boolean",
  // Tipo de alimentación
  tipoAlimentacion: "string",
  tipoAlimOtro: "string",
  especifiqueAreaTrabajo: "string",
  // Sistema Festoon
  especifiqueSistemaAlimentacion: "string",
  // Observaciones
  observaciones: "string",
};

// ===== RIEL BAHÍA =====
export const rielBahiaType = {
  id: "number",
  idCotizacionBahia: "number",
  // Tipo de riel
  tipoRiel: "string",
  especifiqueTipoRiel: "string",
  // Medidas
  metrosLinealesRiel: "number",
  // Calidad del material
  calidadMaterialRiel: "string",
  especifiqueCalidadMaterialRiel: "string",
  // Observaciones
  observaciones: "string",
};

// ===== ESTRUCTURA BAHÍA =====
export const estructuraBahiaType = {
  id: "number",
  idCotizacionBahia: "number",
  // Lotes y componentes
  lotesRequeridos: "number",
  trabeCarril: "boolean",
  columnas: "boolean",
  mensula: "boolean",
  // Columnas
  cantidadColumnas: "number",
  distanciaColumnas: "number",
  // Montaje de trabe carril
  montajeTrabeCarril: "string",
  metLinTraCarril: "number",
  // Medidas
  nptNhr: "number",
  // Pintura
  pinturaEstructura: "string",
  tipoPintura: "string",
  tipoCodigoPintura: "number",
  colorPintura: "number",
  // Fijación
  fijacionColumnas: "string",
  // Observaciones
  observaciones: "string",
};

// ===== PRODUCTO COMPLETO =====
export const productoType = {
  id: "number",
  itemCode: "string",
  itemName: "string",
  qty: "number",
  price: "number",
  bahia: "string",
  definiciones: {
    datosBasicos: "object", // datosBasicosType
    adicionales: "object",
    izaje: "object", // izajeType
    alimentacion: "object",
    tipoAlim: "object",
    riel: "object",
    estructura: "object",
    carro: "object", // carroType
    puente: "object",
    flete: "object",
    montaje: "object",
    informacionComplementaria: "object",
    formacionPrecios: "object",
  },
};

// ===== BAHÍA COMPLETA =====
export const bahiaType = {
  id: "number",
  nombre: "string",
  alimentacion: "boolean",
  riel: "boolean",
  estructura: "boolean",
  definiciones: {
    alimentacion: "object", // alimentacionBahiaType
    riel: "object", // rielBahiaType
    estructura: "object", // estructuraBahiaType
  },
};

// ===== CONCEPTO =====
export const conceptoType = {
  id: "number",
  codigo: "string",
  descripcion: "string",
  cantidad: "number",
  precioUnitario: "number",
  importe: "number",
  tipo: "string", // Servicio, Producto, Garantía
  categoria: "string",
  observaciones: "string",
};

// ===== RESUMEN FINANCIERO =====
export const resumenType = {
  subtotalProductos: "number",
  subtotalBahias: "number",
  subtotalConceptos: "number",
  subtotal: "number",
  descuentoPorcentaje: "number",
  descuentoMonto: "number",
  subtotalConDescuento: "number",
  ivaPorcentaje: "number",
  ivaMonto: "number",
  total: "number",
  moneda: "string",
  tipoCambio: "number",
  observacionesFinancieras: "string",
};

// ===== METADATOS =====
export const metadataType = {
  version: "string",
  fechaCreacion: "string",
  fechaModificacion: "string",
  creadoPor: "string",
  modificadoPor: "string",
  estado: "string",
  versionDocumento: "number",
  comentarios: "string",
};

// ===== COTIZACIÓN COMPLETA =====
export const cotizacionCompletaType = {
  encabezado: "object", // encabezadoType
  productos: "array", // Array de productoType
  bahias: "array", // Array de bahiaType
  conceptos: "array", // Array de conceptoType
  resumen: "object", // resumenType
  metadata: "object", // metadataType
};

export default {
  encabezadoType,
  datosBasicosType,
  controlType,
  polipastoType,
  izajeType,
  carroType,
  carroIndividualType,
  alimentacionBahiaType,
  rielBahiaType,
  estructuraBahiaType,
  productoType,
  bahiaType,
  conceptoType,
  resumenType,
  metadataType,
  cotizacionCompletaType,
};
