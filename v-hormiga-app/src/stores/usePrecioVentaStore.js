import { defineStore } from "pinia";
import { useArticlesStore } from "./useArticlesStore";

export const usePrecioVentaStore = defineStore("precioVenta", {
  state: () => ({
    // Datos del precio de venta
    formacionPrecios: {
      id: 0,
      idArticulo: 0,
      precioBase: 0,
      descuento: 0,
      precioFinal: 0,
      moneda: "MXN",
      fechaVigencia: null,
      observaciones: "",
      condicionesPago: "",
      plazoEntrega: "",
      garantia: "",
      terminosComerciales: "",

      // Nuevas propiedades según especificación
      plazoPago: "", // Plazo de pago
      plazoPagoOtro: "", // Plazo de pago Otro (campo numérico)
      cantEvePago: 1, // Cantidad de eventos de pago (1-20)
      cliReqFianza: "", // Cliente requiere fianza
      tipoFianza1: "", // Tipo de fianza
      tipoFianza2: "", // Tipo de fianza
      tipoFianza3: "", // Tipo de fianza
      tipoFianza4: "", // Tipo de fianza
      agente: "", // Agente
      brokerCliente: "", // Broker indicado por cliente
      aplicaPenal: false, // Aplica penalización
      penalizacion: "", // Especifique penalización
      seguroRespCivil: false, // Seguro de responsabilidad civil
      definidoPor: "", // Definido por (SHOSA/Cliente)
      aseguradora: "", // Especifique aseguradora
      montoSeguro: 0, // Especifique monto
      tiempoGarantia: "", // Tiempo de garantía
      dosier: false, // Dosier
      tipoFactura: "", // Factura
      especificacionCliente: "", // Especificación del cliente
      tipoCotizacion: "", // Cotización
      observacionesFP: "", // Observaciones Formación de Precios
    },

    // Configuraciones adicionales
    configuraciones: {
      incluyeInstalacion: false,
      incluyeTransporte: false,
      incluyeCapacitacion: false,
      incluyeGarantia: false,
      incluyeMantenimiento: false,
      observacionesAdicionales: "",
      eventosPago: [], // Array para almacenar los eventos de pago
    },
    conceptos: [],
    concepto: {
      id: 0,
      idCotizacion: 0,
      concepto: "",
      descripcion: "",
      cantidad: 1,
      precioUnit: 0,
      total: 0,
    },
  }),

  getters: {
    // Calcular precio final
    precioCalculado: (state) => {
      const precioBase = state.formacionPrecios.precioBase || 0;
      const descuento = state.formacionPrecios.descuento || 0;
      return precioBase - (precioBase * descuento) / 100;
    },

    // Calcular el total de porcentajes de eventos de pago
    totalPorcentajesEventos: (state) => {
      return state.configuraciones.eventosPago.reduce((total, evento) => {
        return total + (parseFloat(evento.porcentaje) || 0);
      }, 0);
    },

    // Verificar si el total de porcentajes es válido (no excede 100%)
    porcentajesEventosValidos: (state) => {
      const total = state.configuraciones.eventosPago.reduce(
        (total, evento) => {
          return total + (parseFloat(evento.porcentaje) || 0);
        },
        0
      );
      return total <= 100;
    },
  },

  actions: {
    // Actualizar precio de venta
    updatePrecioVenta(datos) {
      this.formacionPrecios = { ...this.formacionPrecios, ...datos };
    },

    // Actualizar configuraciones
    updateConfiguraciones(datos) {
      this.configuraciones = { ...this.configuraciones, ...datos };
    },

    // Calcular precio automáticamente
    calcularPrecio() {
      this.formacionPrecios.precioFinal = this.precioCalculado;
    },

    // Agregar un nuevo evento de pago
    agregarEventoPago() {
      // Verificar si ya se alcanzó el 100% de porcentajes
      if (this.totalPorcentajesEventos >= 100) {
        console.warn(
          "No se puede agregar más eventos: ya se alcanzó el 100% de porcentajes"
        );
        return false;
      }

      const nuevoEvento = {
        id: Date.now(), // ID único temporal
        porcentaje: 0,
        descripcion: "",
        condicion: "",
      };
      this.configuraciones.eventosPago.push(nuevoEvento);
      console.log("Evento de pago agregado:", nuevoEvento);
      return true;
    },

    // Eliminar un evento de pago por índice
    eliminarEventoPago(index) {
      if (index >= 0 && index < this.configuraciones.eventosPago.length) {
        const eventoEliminado = this.configuraciones.eventosPago.splice(
          index,
          1
        )[0];
        console.log("Evento de pago eliminado:", eventoEliminado);
      }
    },

    // Validar que los eventos de pago estén completos
    validarEventosPago() {
      if (this.configuraciones.eventosPago.length === 0) {
        return { valido: true, mensaje: "No hay eventos de pago configurados" };
      }

      // Verificar que todos los campos estén completos
      for (let i = 0; i < this.configuraciones.eventosPago.length; i++) {
        const evento = this.configuraciones.eventosPago[i];
        if (!evento.porcentaje || !evento.condicion) {
          return {
            valido: false,
            mensaje: `El evento ${i + 1} tiene campos incompletos`,
          };
        }
      }

      // Verificar que el total no exceda 100%
      if (!this.porcentajesEventosValidos) {
        return {
          valido: false,
          mensaje: `El total de porcentajes (${this.totalPorcentajesEventos}%) excede el 100%`,
        };
      }

      return { valido: true, mensaje: "Eventos de pago válidos" };
    },

    // Validar campos obligatorios de formación de precios
    validarFormacionPrecios() {
      const errores = [];

      // Campos obligatorios para cotización y pedido
      if (
        !this.formacionPrecios.plazoPago &&
        !this.formacionPrecios.plazoPagoOtro
      ) {
        errores.push("Plazo de pago es obligatorio");
      }

      if (!this.formacionPrecios.cliReqFianza) {
        errores.push("Cliente requiere fianza es obligatorio");
      }

      if (!this.formacionPrecios.tipoFianza1) {
        errores.push("Tipo de fianza es obligatorio");
      }
      if (!this.formacionPrecios.tipoFianza2) {
        errores.push("Tipo de fianza es obligatorio");
      }
      if (!this.formacionPrecios.tipoFianza3) {
        errores.push("Tipo de fianza es obligatorio");
      }
      if (!this.formacionPrecios.tipoFianza4) {
        errores.push("Tipo de fianza es obligatorio");
      }

      if (!this.formacionPrecios.tiempoGarantia) {
        errores.push("Tiempo de garantía es obligatorio");
      }

      if (!this.formacionPrecios.tipoFactura) {
        errores.push("Tipo de factura es obligatorio");
      }

      if (!this.formacionPrecios.tipoCotizacion) {
        errores.push("Tipo de cotización es obligatorio");
      }

      // Validaciones condicionales
      if (
        this.formacionPrecios.tipoFactura === "Según especificación cliente" &&
        !this.formacionPrecios.especificacionCliente
      ) {
        errores.push(
          "Especificación del cliente es obligatoria cuando el tipo de factura es 'Según especificación cliente'"
        );
      }

      if (
        this.formacionPrecios.aplicaPenal &&
        !this.formacionPrecios.penalizacion
      ) {
        errores.push(
          "Especificación de penalización es obligatoria cuando aplica penalización"
        );
      }

      if (this.formacionPrecios.seguroRespCivil) {
        if (!this.formacionPrecios.definidoPor) {
          errores.push(
            "Definido por es obligatorio cuando se requiere seguro de responsabilidad civil"
          );
        }
        if (!this.formacionPrecios.aseguradora) {
          errores.push(
            "Aseguradora es obligatoria cuando se requiere seguro de responsabilidad civil"
          );
        }
      }

      if (
        this.formacionPrecios.agente === "Cliente" &&
        !this.formacionPrecios.brokerCliente
      ) {
        errores.push(
          "Broker indicado por cliente es obligatorio cuando el agente es 'Cliente'"
        );
      }

      // Validar cantidad de eventos de pago
      if (
        this.formacionPrecios.cantEvePago < 1 ||
        this.formacionPrecios.cantEvePago > 20
      ) {
        errores.push("La cantidad de eventos de pago debe estar entre 1 y 20");
      }

      return {
        valido: errores.length === 0,
        mensaje:
          errores.length === 0
            ? "Formación de precios válida"
            : errores.join("; "),
        errores: errores,
      };
    },

    // Limpiar todos los datos
    clearAll() {
      this.formacionPrecios = {
        id: 0,
        idArticulo: 0,
        precioBase: 0,
        descuento: 0,
        precioFinal: 0,
        moneda: "MXN",
        fechaVigencia: null,
        observaciones: "",
        condicionesPago: "",
        plazoEntrega: "",
        garantia: "",
        terminosComerciales: "",

        // Limpiar nuevas propiedades
        plazoPago: "",
        plazoPagoOtro: "",
        cantEvePago: 1,
        cliReqFianza: "",
        tipoFianza1: "",
        tipoFianza2: "",
        tipoFianza3: "",
        tipoFianza4: "",
        agente: "",
        brokerCliente: "",
        aplicaPenal: false,
        penalizacion: "",
        seguroRespCivil: false,
        definidoPor: "",
        aseguradora: "",
        montoSeguro: 0,
        tiempoGarantia: "",
        dosier: false,
        tipoFactura: "",
        especificacionCliente: "",
        tipoCotizacion: "",
        observacionesFP: "",
      };
      this.configuraciones = {
        incluyeInstalacion: false,
        incluyeTransporte: false,
        incluyeCapacitacion: false,
        incluyeGarantia: false,
        incluyeMantenimiento: false,
        observacionesAdicionales: "",
        eventosPago: [], // Limpiar también los eventos de pago
      };
      this.conceptos = [];
    },

    // Navegar a precio de venta (Alternativa 4)
    navegarAPrecioVenta(articulo) {
      console.log("Navegando a precio de venta para:", articulo);
    },

    // Guardar precio de venta y actualizar el precio del artículo
    guardarPrecioVenta() {
      // Validar formación de precios antes de guardar
      /*const validacionFormacion = this.validarFormacionPrecios();
      if (!validacionFormacion.valido) {
        console.error(
          "Error de validación en formación de precios:",
          validacionFormacion.mensaje
        );
        return {
          exito: false,
          error: validacionFormacion.mensaje,
        };
      }*/

      // Validar eventos de pago antes de guardar
      const validacionEventos = this.validarEventosPago();
      if (!validacionEventos.valido) {
        console.error(
          "Error de validación en eventos de pago:",
          validacionEventos.mensaje
        );
        return {
          exito: false,
          error: validacionEventos.mensaje,
        };
      }

      //this.calcularPrecio();

      // Obtener el store de artículos
      const articlesStore = useArticlesStore();

      // Actualizar el precio del artículo en el store de artículos
      // recorrer los conceptos y actualizar el precio del artículo
      this.conceptos.forEach((concepto) => {
        const articuloIndex = articlesStore.selectedArticles.findIndex(
          (art) => art.uId === concepto.uId || (art.itemCode === concepto.concepto && !art.uId)
        );
        if (articuloIndex !== -1) {
          articlesStore.selectedArticles[articuloIndex].price =
            concepto.precioUnit;
        }
      });

      const datosCompletos = {
        articulo: articlesStore.selectedArticles,
        formacionPrecios: { ...this.formacionPrecios },
        configuraciones: { ...this.configuraciones },
      };
      console.log("Precio de venta guardado:", datosCompletos);
      return {
        exito: true,
        datos: datosCompletos,
      };
    },
    addConcepto(items) {
      this.conceptos.push(...items);
    },
    deleteConcepto(index) {
      this.conceptos.splice(index, 1);
    },
  },

  persist: {
    key: "formacion-precios",
    storage: localStorage,
    paths: ["formacionPrecios", "configuraciones", "conceptos"],
  },
});
