<template>
  <v-container fluid>
    <v-row align="center" class="mb-2">
      <v-col>
        <span class="text-h6 font-weight-medium">
          {{ getTituloPagina() }}
        </span>
        <span v-if="storeCotizador.getIsEditMode || storeCotizador.getIsViewMode" class="text-caption ml-2 grey--text">
          ID: {{ storeCotizador.getEditId }}
        </span>
      </v-col>
      <v-col cols="auto">
        <v-btn v-if="storeCotizador.getIsEditMode" color="success" @click="actualizarCotizacion" :loading="loading"
          class="mr-2">
          <v-icon>mdi-content-save</v-icon>
          Actualizar Cotización
        </v-btn>
        <v-btn v-if="storeCotizador.getIsEditMode" color="secondary" variant="outlined" @click="cancelarEdicion"
          :disabled="loading">
          <v-icon>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn v-if="storeCotizador.getIsViewMode" color="primary" variant="outlined" @click="editarDesdeVista">
          <v-icon>mdi-pencil</v-icon>
          Editar
        </v-btn>
        <v-btn v-if="storeCotizador.getIsViewMode" color="secondary" variant="outlined" @click="volverALista">
          <v-icon>mdi-arrow-left</v-icon>
          Volver
        </v-btn>
        <v-btn v-else-if="!storeCotizador.getIsEditMode && !storeCotizador.getIsViewMode" color="primary"
          @click="crearCotizacion" :loading="loading">
          <v-icon>mdi-plus</v-icon>
          Crear Cotización
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" md="9">
        <CotizadorForm />
      </v-col>
      <v-col cols="12" md="3">
        <CotizadorInfoPanel />
      </v-col>
    </v-row>
    <ArticlesTable />
    <BahiasTable />
    <v-card class="pa-4 mb-4" elevation="2">
      <v-btn class="mt-2" size="x-large" width="100%" color="primary" prepend-icon="mdi-arrow-right"
        @click="formacionPrecio">Formación de
        Precios</v-btn>
    </v-card>
    <v-card class="pa-4 mb-4" elevation="2">
      <v-btn class="mt-2" size="x-large" width="100%" color="warning" prepend-icon="mdi-arrow-right"
        @click="cancelarCotizacion">Cancelar Cotización</v-btn>
    </v-card>
    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template #actions>
        <v-btn color="white" text @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import ArticlesTable from '@/components/Cotizacion/ArticlesTable.vue';
import BahiasTable from '@/components/Cotizacion/BahiasTable.vue';
import CotizadorForm from '@/components/Cotizacion/CotizadorForm.vue';
import CotizadorInfoPanel from '@/components/Cotizacion/CotizadorInfoPanel.vue';
import { cotizacionService } from '@/services/api';
import { pdfGeneratorService } from '@/services/pdfGenerator';
import { useAuthStore } from '@/stores/useAuthStore';
import { useArticlesStore } from '@/stores/useArticlesStore';
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { useBahiaDefinicionesStore } from '@/stores/useBahiaDefinicionesStore';
import { useBahiasStore } from '@/stores/useBahiasStore';
import { useCotizadorFormStore } from '@/stores/useCotizadorFormStore';
import { usePrecioVentaStore } from '@/stores/usePrecioVentaStore';
import { ensureArticuloLineUid } from '@/utils/articleLineUid';
import { reorderConceptosPreservandoPrecios, DIC_BAHIA_SECCIONES } from '@/utils/conceptosOrden';
import moment from 'moment';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'Oferta',
})

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadingWord = ref(false);

// Configuración del snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
});

const storeCotizador = useCotizadorFormStore()
const storeArticles = useArticlesStore()
const storeBahias = useBahiasStore()
const storeArticuloDefiniciones = useArticuloDefinicionesStore()
const storeBahiaDefiniciones = useBahiaDefinicionesStore()
const storePrecios = usePrecioVentaStore();
const storeAuth = useAuthStore();

// Verificar si estamos en modo edición al cargar la página
onMounted(() => {
  checkEditMode();
  storeArticuloDefiniciones.loadCatalogos();
});

// Observar cambios en la ruta para detectar modo edición
watch(() => route.query, (newQuery) => {
  //checkEditMode();
}, { immediate: true });

const checkEditMode = () => {
  const { mode, id } = route.query;
  if (mode === 'edit' && id) {
    storeCotizador.setEditMode(true);
    storeCotizador.setEditId(id);
  } else if (mode === 'view' && id) {
    storeCotizador.setViewMode(true);
    storeCotizador.setEditId(id);
    // Cargar datos para modo vista
    cargarCotizacionParaVista(id);
  } else {
    storeCotizador.resetToCreateMode();
  }
};

// Cargar cotización para modo vista
const cargarCotizacionParaVista = async (id) => {
  try {
    if (storeCotizador.form.cliente && storeCotizador.form.cliente.length > 0) {
      return;
    }
    loading.value = true;

    // Obtener la cotización completa por ID
    const response = await cotizacionService.getById(id);
    const cotizacionData = response.data;

    console.log('Datos de cotización para vista:', cotizacionData);

    // Cargar datos del encabezado en el store del cotizador
    if (cotizacionData.encabezado) {
      const encabezado = cotizacionData.encabezado;

      // Mapear datos del encabezado al formulario según el esquema de la API
      storeCotizador.form = {
        tipoCotizacion: encabezado.tipoCotizacion || '',
        tipoCuenta: encabezado.tipoCuenta || '',
        idioma: encabezado.idioma || '',
        cliente: {
          cardCode: encabezado.cliente || '',
          cardName: encabezado.clienteNombre || ''
        },
        clienteFinal: encabezado.clienteFinal || '',
        personaContacto: encabezado.contacto || '',
        direccionFiscal: encabezado.dirFiscal || '',
        direccionEntrega: encabezado.dirEntrega || '',
        referencia: encabezado.referencia || '',
        terminosEntrega: {
          trnspCode: encabezado.terminosEntrega || ''
        },
        folioPortal: encabezado.folioPortal?.toString() || '',
        folioSAP: encabezado.folioSap?.toString() || '',
        sapDocEntry: encabezado.sapDocEntry ?? null,
        fecha: encabezado.fecha ? moment(encabezado.fecha).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
        vencimiento: encabezado.vencimiento ? moment(encabezado.vencimiento).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
        moneda: encabezado.moneda || 'MXN',
        vendedor: encabezado.vendedor || null,
        vendedorSec: encabezado.vendedorSec || null,
      };
    }

    // Cargar productos seleccionados según el esquema CotizacionProductoCompleto
    if (cotizacionData.productos && Array.isArray(cotizacionData.productos)) {
      storeArticles.selectedArticles = cotizacionData.productos.map((item) => {
        const p = item.producto || item;
        return ensureArticuloLineUid({
          id: p.id || 0,
          uId: p.uId,
          itemCode: p.itemCode || '',
          itemName: p.itemName || '',
          qty: p.qty || 1,
          price: p.price || 0,
          bahia: p.bahia || '',
          definiciones: p.definiciones || null,
        });
      });

      console.log('Productos cargados para vista:', storeArticles.selectedArticles);
    }

    // Cargar bahías seleccionadas según el esquema CotizacionBahiaCompleta
    if (cotizacionData.bahias && Array.isArray(cotizacionData.bahias)) {
      storeBahias.selectedBahias = cotizacionData.bahias.map(item => ({
        id: item.bahia.id || 0,
        nombre: item.bahia.nombre || '',
        alimentacion: item.bahia.alimentacion || false,
        riel: item.bahia.riel || false,
        estructura: item.bahia.estructura || false,
        definiciones: item.bahia.definiciones || null
      }));

      console.log('Bahías cargadas para vista:', storeBahias.selectedBahias);
    }

    const arts = storeArticles.selectedArticles
    const bahs = storeBahias.selectedBahias
    if (cotizacionData.formacionPrecios && typeof cotizacionData.formacionPrecios === 'object') {
      const fp = { ...cotizacionData.formacionPrecios }
      if (Array.isArray(fp.conceptos) && fp.conceptos.length && arts.length) {
        fp.conceptos = reorderConceptosPreservandoPrecios(fp.conceptos, arts, bahs, DIC_BAHIA_SECCIONES)
      }
      storePrecios.$state = fp
    } else if (cotizacionData.conceptos && Array.isArray(cotizacionData.conceptos)) {
      storePrecios.conceptos = arts.length
        ? reorderConceptosPreservandoPrecios(cotizacionData.conceptos, arts, bahs, DIC_BAHIA_SECCIONES)
        : cotizacionData.conceptos
      console.log('Conceptos cargados para vista:', storePrecios.conceptos)
    }

    mostrarMensaje(`Cotización ${id} cargada para visualización`, 'success');

  } catch (error) {
    console.error('Error al cargar cotización para vista:', error);

    let errorMessage = 'Error al cargar la cotización para vista';
    if (error.response?.data?.message) {
      errorMessage += `: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    mostrarMensaje(errorMessage, 'error');
  } finally {
    loading.value = false;
  }
};

// Mostrar mensaje
const mostrarMensaje = (mensaje, tipo = 'success') => {
  const longRead = tipo === 'error' || tipo === 'warning';
  snackbar.value = {
    show: true,
    message: mensaje,
    color: tipo,
    timeout: longRead ? 12000 : 3000
  };
};

const getTituloPagina = () => {
  if (storeCotizador.getIsEditMode) {
    return 'Editar Cotización';
  } else if (storeCotizador.getIsViewMode) {
    return 'Ver Cotización';
  } else {
    return 'Cotizador';
  }
};

/** Validaciones mínimas antes de crear en portal y enviar a SAP (Service Layer Quotations). */
const validarCotizacionParaCrear = () => {
  const c = storeCotizador.form.cliente;
  const tieneCliente =
    c &&
    (typeof c === 'object'
      ? Boolean(String(c.cardCode || '').trim() || String(c.cardName || '').trim())
      : String(c).trim());
  if (!tieneCliente) {
    return 'Debe seleccionar un cliente (CardCode) antes de crear la cotización.';
  }
  const arts = storeArticles.selectedArticles || [];
  if (!arts.length) {
    return 'Debe agregar al menos una grúa (artículo) a la cotización.';
  }
  const sinCodigo = arts.some((a) => !a?.itemCode || String(a.itemCode).trim() === '');
  if (sinCodigo) {
    return 'Todas las líneas deben tener código de artículo (grúa).';
  }
  if (!storeAuth.user?.userName) {
    return 'Debe iniciar sesión: la serie SAP se toma del usuario en MIKNE.USUARIOS (NUMSERIESAP).';
  }
  return null;
};

const crearCotizacion = async () => {
  const validationError = validarCotizacionParaCrear();
  if (validationError) {
    mostrarMensaje(validationError, 'warning');
    return;
  }

  // Crear el objeto encabezado según el esquema CotizacionEncabezado
  const encabezado = {
    id: 0, // Para crear nueva cotización
    tipoCotizacion: storeCotizador.form.tipoCotizacion || '',
    tipoCuenta: storeCotizador.form.tipoCuenta || '',
    idioma: storeCotizador.form.idioma || '',
    cliente: storeCotizador.form.cliente?.cardCode || '',
    clienteNombre: storeCotizador.form.cliente?.nombreCompleto?.split(' - ')[1] || storeCotizador.form.cliente?.cardName || '',
    clienteFinal: storeCotizador.form.clienteFinal || '',
    contacto: storeCotizador.form.personaContacto || '', // Normalizado
    dirFiscal: storeCotizador.form.direccionFiscal || '', // Normalizado
    dirEntrega: storeCotizador.form.direccionEntrega || '', // Normalizado
    referencia: storeCotizador.form.referencia || '',
    terminosEntrega: storeCotizador.form.terminosEntrega?.trnspCode || (typeof storeCotizador.form.terminosEntrega === 'string' ? storeCotizador.form.terminosEntrega : ''),
    folioPortal: storeCotizador.form.folioPortal || '',
    folioSap: storeCotizador.form.folioSAP || '',
    sapDocEntry: storeCotizador.form.sapDocEntry ?? null,
    fecha: storeCotizador.form.fecha ? new Date(storeCotizador.form.fecha).toISOString() : null,
    vencimiento: storeCotizador.form.vencimiento ? new Date(storeCotizador.form.vencimiento).toISOString() : null,
    moneda: storeCotizador.form.moneda !== 'Seleccionar..' ? storeCotizador.form.moneda : 'MXN',
    estado: 'Borrador',
    total: 0,
    subtotal: 0,
    impuestos: 0,
    descuentos: 0,
    observacionesGenerales: '',
    condicionesComerciales: '',
    vigencia: 30,
    creadoPor: '',
    fechaCreacion: null,
    modificadoPor: '',
    fechaModificacion: null,
    vendedor: storeCotizador.form.vendedor || null,
    vendedorSec: storeCotizador.form.vendedorSec || null,
    usuario: storeAuth.user?.userName || storeAuth.user?.userId || '', // Incluir usuario actual
  }

  // Crear el objeto completo según el esquema CotizacionCompleta
  const cotizacionCompleta = {
    encabezado: encabezado,
    productos: storeArticles.selectedArticles,
    bahias: storeBahias.selectedBahias,
    formacionPrecios: { ...storePrecios.$state },
  }

  console.log('Objeto de cotización a enviar:', cotizacionCompleta)

  try {
    loading.value = true;
    const response = await cotizacionService.createWithSap(cotizacionCompleta);
    const created = response.data && typeof response.data === 'object' ? response.data : {};
    const newId = created.id;
    const folioPortal = created.folioPortal;
    const sapError = created.sapError;
    const sapFolio = created.folioSap || created.docNum || '';

    if (newId === undefined || newId === null || newId === '') {
      mostrarMensaje('No se recibió el ID de la cotización creada.', 'error');
      return;
    }

    storeCotizador.setEditId(newId);
    if (folioPortal) {
      storeCotizador.form.folioPortal = folioPortal;
    }
    if (sapFolio) {
      storeCotizador.form.folioSAP = sapFolio;
    }
    if (created.sapDocEntry != null && created.sapDocEntry !== '') {
      storeCotizador.form.sapDocEntry = created.sapDocEntry;
    }

    storeCotizador.setEditMode(true);
    router.replace({ query: { mode: 'edit', id: String(newId) } });

    try {
      cotizacionCompleta.encabezado.folioPortal = folioPortal || String(newId);
    } catch (_) {
      /* ignore */
    }

    if (sapError) {
      mostrarMensaje(
        `Cotización guardada en MIKNE (folio ${folioPortal || newId}). SAP: ${sapError}`,
        'warning'
      );
    } else {
      mostrarMensaje(
        sapFolio
          ? `Cotización creada. Folio SAP: ${sapFolio}`
          : 'Cotización creada en MIKNE y enviada a SAP.',
        'success'
      );
    }
  } catch (error) {
    console.error('Error al crear la cotización:', error);
    const d = error.response?.data;
    let msg = 'Error al crear la cotización';
    if (d?.dbError) {
      msg += `: ${d.dbError}`;
      if (d?.message) msg += ` — ${d.message}`;
    } else {
      if (d?.message) msg += `: ${d.message}`;
      if (d?.error) msg += ` (${d.error})`;
      if (d?.innerError) msg += ` [${d.innerError}]`;
    }
    if (!d?.message && !d?.dbError && error.message) msg += `: ${error.message}`;
    mostrarMensaje(msg, 'error');
  } finally {
    loading.value = false;
  }
}

const cancelarCotizacion = () => {
  // Limpiar stores después de crear exitosamente

  storeCotizador.form = {
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
    sapDocEntry: null,
    fecha: moment().format("YYYY-MM-DD"),
    vencimiento: moment().add(30, "days").format("YYYY-MM-DD"),
    moneda: "Seleccionar..",
    vendedor: null,
    vendedorSec: null,
  }
  storeArticles.selectedArticles = []
  storeBahias.selectedBahias = []
  storeArticuloDefiniciones.clearAll()
  storeBahiaDefiniciones.clearAll()

  storeCotizador.clearForm();
  storeArticles.clearSelectedArticles();
  storeBahias.clearSelectedBahias();
  storeArticuloDefiniciones.clearAll();
  storeBahiaDefiniciones.clearAll();
}

const actualizarCotizacion = async () => {
  if (!storeCotizador.getEditId) {
    console.error('No hay ID de edición');
    mostrarMensaje('Error: No hay ID de edición', 'error');
    return;
  }

  try {
    loading.value = true;

    // Crear el objeto encabezado según el esquema CotizacionEncabezado
    // Usamos el editId real para que el backend reconozca que es una actualización
    const encabezado = {
      id: storeCotizador.getEditId, 
      tipoCotizacion: storeCotizador.form.tipoCotizacion || '',
      tipoCuenta: storeCotizador.form.tipoCuenta || '',
      idioma: storeCotizador.form.idioma || '', // Normalizado a 'idioma' según backend
      cliente: storeCotizador.form.cliente?.cardCode || storeCotizador.form.cliente || '',
      clienteNombre: storeCotizador.form.clienteNombre || (storeCotizador.form.cliente?.nombreCompleto?.split(' - ')[1] || storeCotizador.form.cliente?.cardName || ''),
      clienteFinal: storeCotizador.form.clienteFinal || '',
      contacto: storeCotizador.form.personaContacto || '', // Normalizado a 'contacto'
      dirFiscal: storeCotizador.form.direccionFiscal || '', // Normalizado a 'dirFiscal'
      dirEntrega: storeCotizador.form.direccionEntrega || '', // Normalizado a 'dirEntrega'
      referencia: storeCotizador.form.referencia || '',
      terminosEntrega: storeCotizador.form.terminosEntrega?.trnspCode || (typeof storeCotizador.form.terminosEntrega === 'string' ? storeCotizador.form.terminosEntrega : ''),
      folioPortal: storeCotizador.form.folioPortal || '',
      folioSap: storeCotizador.form.folioSAP || '',
    sapDocEntry: storeCotizador.form.sapDocEntry ?? null,
      fecha: storeCotizador.form.fecha ? new Date(storeCotizador.form.fecha).toISOString() : null,
      vencimiento: storeCotizador.form.vencimiento ? new Date(storeCotizador.form.vencimiento).toISOString() : null,
      moneda: storeCotizador.form.moneda !== 'Seleccionar..' ? storeCotizador.form.moneda : 'MXN',
      estado: 'Borrador',
      total: 0,
      subtotal: 0,
      impuestos: 0,
      descuentos: 0,
      observacionesGenerales: '',
      condicionesComerciales: '',
      vigencia: 30,
      creadoPor: '',
      fechaCreacion: null,
      modificadoPor: '',
      fechaModificacion: new Date().toISOString(),
      vendedor: storeCotizador.form.vendedor || null,
      vendedorSec: storeCotizador.form.vendedorSec || null,
      usuario: storeAuth.user?.userName || storeAuth.user?.userId || '', // Incluir usuario actual
    }

    // Crear el objeto completo según el esquema CotizacionCompleta
    const cotizacionCompleta = {
      encabezado: encabezado,
      productos: storeArticles.selectedArticles,
      bahias: storeBahias.selectedBahias,
      formacionPrecios: { ...storePrecios.$state },
    }

    console.log('Actualizando cotización (PUT):', cotizacionCompleta);
    const updateRes = await cotizacionService.update(storeCotizador.getEditId, cotizacionCompleta);
    const ud = updateRes.data && typeof updateRes.data === 'object' ? updateRes.data : {};

    if (ud.folioSap) {
      storeCotizador.form.folioSAP = ud.folioSap;
    }
    if (ud.sapDocEntry != null && ud.sapDocEntry !== '') {
      storeCotizador.form.sapDocEntry = ud.sapDocEntry;
    }

    if (ud.sapError) {
      mostrarMensaje(
        `Cotización guardada en MIKNE (nueva versión). SAP: ${ud.sapError}`,
        'warning'
      );
    } else {
      mostrarMensaje(
        ud.folioSap
          ? `Cotización actualizada. Folio SAP: ${ud.folioSap}`
          : 'Cotización actualizada exitosamente (nueva versión en MIKNE y SAP).',
        'success'
      );
    }

    // Redirigir de vuelta a la lista de cotizaciones después de un breve delay
    setTimeout(() => {
      router.push('/cotizaciones');
    }, 1500);

  } catch (error) {
    console.error('Error al actualizar cotización:', error);

    let errorMessage = 'Error al actualizar la cotización';
    if (error.response?.data?.message) {
      errorMessage += `: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    mostrarMensaje(errorMessage, 'error');
  } finally {
    loading.value = false;
  }
};

const cancelarEdicion = () => {
  storeCotizador.resetToCreateMode();
  cancelarCotizacion();
  router.push('/cotizaciones');
  mostrarMensaje('Edición cancelada', 'info');
};

const editarDesdeVista = () => {
  storeCotizador.setEditMode(true);
  storeCotizador.setViewMode(false);
  mostrarMensaje('Modo de vista a modo de edición', 'info');
};

const volverALista = () => {
  router.push('/cotizaciones');
  mostrarMensaje('Volviendo a la lista de cotizaciones', 'info');
};

const formacionPrecio = () => {
  router.push({ path: '/FormacionPrecios', query: route.query });
}
</script>
