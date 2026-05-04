<template>
  <v-container fluid>
    <!-- Una sola fila sticky: título + acciones (misma escala que «Agregar bahía»: v-btn por defecto) -->
    <v-row :class="['oferta-toolbar', 'mb-2', 'align-center', 'flex-nowrap', toolbarModoClass]" no-gutters>
      <v-col class="min-width-0 flex-grow-1 pe-2 oferta-toolbar-title">
        <span class="text-h6 font-weight-medium text-truncate d-block">
          {{ getTituloPagina() }}
        </span>
        <span v-if="storeCotizador.getIsEditMode || storeCotizador.getIsViewMode" class="text-caption grey--text">
          ID: {{ storeCotizador.getEditId }}
        </span>
      </v-col>
      <v-col cols="auto" class="flex-shrink-0 d-flex align-center oferta-toolbar-actions">
        <template v-if="fabMostrarCrear">
          <v-btn color="primary" prepend-icon="mdi-plus" class="text-none me-1"
            :loading="loading" @click="crearCotizacion">
            Crear
          </v-btn>
          <v-btn color="warning" variant="outlined" prepend-icon="mdi-broom" class="text-none"
            @click="limpiarCotizacion">
            Limpiar
          </v-btn>
        </template>
        <template v-else-if="storeCotizador.getIsEditMode">
          <v-btn color="success" prepend-icon="mdi-content-save" class="text-none me-1"
            :loading="loading" @click="actualizarCotizacion">
            Actualizar
          </v-btn>
          <v-btn color="secondary" variant="outlined" prepend-icon="mdi-close" class="text-none"
            :disabled="loading" @click="cancelarEdicion">
            Cancelar
          </v-btn>
        </template>
        <template v-else-if="storeCotizador.getIsViewMode">
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-pencil" class="text-none me-1"
            @click="editarDesdeVista">
            Editar
          </v-btn>
          <v-btn color="secondary" variant="outlined" prepend-icon="mdi-arrow-left" class="text-none"
            @click="volverALista">
            Volver
          </v-btn>
        </template>
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
    <BahiasTable />
    <ArticlesTable />
    <v-card class="pa-4 mb-4" elevation="2">
      <v-btn class="mt-2" size="x-large" width="100%" color="primary" prepend-icon="mdi-arrow-right"
        @click="formacionPrecio">
        Formación de Precios
      </v-btn>
    </v-card>
    <!-- FAB: crear / actualizar / volver / limpiar (menú); no ocupa segunda fila en la barra -->
    <v-menu v-model="fabMenuAbierto" location="top end" :close-on-content-click="true">
      <template #activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" class="oferta-fab" color="primary" icon size="large" elevation="6"
          :disabled="loading" aria-label="Acciones de cotización">
          <v-icon>mdi-menu-open</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" min-width="260" class="oferta-fab-menu">
        <v-list-item v-if="fabMostrarCrear" prepend-icon="mdi-plus" title="Crear cotización" @click="onFabCrear" />
        <v-list-item v-if="fabMostrarCrear" prepend-icon="mdi-broom" title="Limpiar"
          subtitle="Formulario, grúas y bahías" @click="onFabLimpiar" />
        <v-list-item v-if="fabMostrarActualizar" prepend-icon="mdi-content-save" title="Actualizar cotización"
          @click="onFabActualizar" />
        <v-list-item v-if="fabMostrarActualizar" prepend-icon="mdi-close" title="Cancelar actualización"
          subtitle="Vuelve al listado sin guardar" @click="onFabCancelarActualizacion" />
        <v-list-item v-if="storeCotizador.getIsViewMode" prepend-icon="mdi-pencil" title="Editar"
          @click="onFabEditar" />
        <v-list-item v-if="storeCotizador.getIsViewMode" prepend-icon="mdi-arrow-left" title="Volver"
          @click="onFabVolverLista" />
      </v-list>
    </v-menu>
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

<style scoped>
.oferta-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(var(--v-theme-surface));
  padding: 10px 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
/* Crear documento: sombra azul hacia abajo */
.oferta-toolbar--crear {
  box-shadow: 0 12px 28px -10px rgba(33, 150, 243, 0.55), 0 4px 12px -6px rgba(33, 150, 243, 0.35);
}
/* Actualizar cotización: sombra verde hacia abajo */
.oferta-toolbar--editar {
  box-shadow: 0 12px 28px -10px rgba(56, 142, 60, 0.5), 0 4px 12px -6px rgba(56, 142, 60, 0.32);
}
/* Solo lectura: sombra neutra suave */
.oferta-toolbar--vista {
  box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.18);
}
.oferta-toolbar-title {
  padding-inline-start: 12px;
}
.min-width-0 {
  min-width: 0;
}
.oferta-fab {
  position: fixed;
  right: 20px;
  bottom: 100px;
  z-index: 11;
}
.oferta-fab-menu {
  margin-bottom: 8px;
}
.oferta-toolbar-actions {
  gap: 6px;
}
</style>

<script setup>
import ArticlesTable from '@/components/Cotizacion/ArticlesTable.vue';
import BahiasTable from '@/components/Cotizacion/BahiasTable.vue';
import CotizadorForm from '@/components/Cotizacion/CotizadorForm.vue';
import CotizadorInfoPanel from '@/components/Cotizacion/CotizadorInfoPanel.vue';
import { cotizacionService, parseCotizacionGetPayload } from '@/services/api';
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';
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

const fabMenuAbierto = ref(false);
const fabMostrarCrear = computed(
  () => !storeCotizador.getIsEditMode && !storeCotizador.getIsViewMode
);
const fabMostrarActualizar = computed(() => storeCotizador.getIsEditMode);
const toolbarModoClass = computed(() => {
  if (storeCotizador.getIsEditMode) {
    return "oferta-toolbar--editar";
  }
  if (storeCotizador.getIsViewMode) {
    return "oferta-toolbar--vista";
  }
  return "oferta-toolbar--crear";
});

/** Limpia encabezado, grúas, bahías, definiciones y formación de precios (cotización nueva). */
function limpiarContenidoCotizacion() {
  storeCotizador.clearForm();
  storeArticles.clearSelectedArticles();
  storeBahias.clearSelectedBahias();
  storeArticuloDefiniciones.clearAll();
  storeBahiaDefiniciones.clearAll();
  storePrecios.clearAll();
}

function esRutaOferta() {
  const n = String(route.name || "");
  const p = route.path || "";
  return /oferta/i.test(n) || /oferta/i.test(p);
}

/**
 * Sincroniza modo edición/vista según query.
 * Importante: sin mode/id NO se limpian stores — si no, al volver desde Definiciones (/#/oferta sin query)
 * se borraban bahías y grúas en captura nueva. Para empezar cotización en blanco usar ?nueva=1 (lista o inicio).
 */
function sincronizarModoDesdeRuta() {
  if (!esRutaOferta()) {
    return;
  }
  const mode = route.query.mode;
  const id = route.query.id;
  const nueva = route.query.nueva;
  if (mode === "edit" && id) {
    storeCotizador.setEditMode(true);
    storeCotizador.setViewMode(false);
    storeCotizador.setEditId(id);
    return;
  }
  if (mode === "view" && id) {
    storeCotizador.setViewMode(true);
    storeCotizador.setEditMode(false);
    storeCotizador.setEditId(id);
    void cargarCotizacionParaVista(id);
    return;
  }
  if (nueva === "1" || nueva === "true") {
    limpiarContenidoCotizacion();
    const rest = { ...route.query };
    delete rest.nueva;
    void nextTick(() => {
      router.replace({ path: route.path, query: rest });
    });
    return;
  }
}

onMounted(() => {
  storeArticuloDefiniciones.loadCatalogos();
});

watch(
  () => [route.path, route.name, route.query.mode, route.query.id, route.query.nueva],
  () => {
    sincronizarModoDesdeRuta();
  },
  { immediate: true }
);

// Cargar cotización para modo vista
const cargarCotizacionParaVista = async (id) => {
  try {
    if (storeCotizador.form.cliente && storeCotizador.form.cliente.length > 0) {
      return;
    }
    loading.value = true;

    // Obtener la cotización completa por ID
    const response = await cotizacionService.getById(id);
    const cotizacionData =
      parseCotizacionGetPayload(response.data) || {};

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
        clienteNombre: encabezado.clienteNombre || '',
        ubicacionFinal: encabezado.ubicacionFinal || '',
        tiempoEntrega: encabezado.tiempoEntrega || '',
        personaContacto: encabezado.contacto || '',
        direccionFiscal: encabezado.dirFiscal || '',
        direccionEntrega: encabezado.dirEntrega || '',
        referencia: encabezado.referencia || '',
        terminosEntrega: encabezado.terminosEntrega || '',
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
      if (Array.isArray(fp.conceptos) && arts.length) {
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
    ubicacionFinal: storeCotizador.form.ubicacionFinal || '',
    tiempoEntrega: storeCotizador.form.tiempoEntrega || '',
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

    limpiarContenidoCotizacion();

    // Misma experiencia que al actualizar: lista de cotizaciones; replace evita volver a captura con datos viejos
    setTimeout(() => {
      router.replace("/cotizaciones");
    }, 1500);
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

/** Vacía encabezado, grúas, bahías y formación de precios (permanece en Oferta). */
const limpiarCotizacion = () => {
  limpiarContenidoCotizacion();
};

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
      ubicacionFinal: storeCotizador.form.ubicacionFinal || '',
      tiempoEntrega: storeCotizador.form.tiempoEntrega || '',
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

    limpiarContenidoCotizacion();

    // Lista de cotizaciones; replace para no volver a la oferta con datos viejos al usar "atrás"
    setTimeout(() => {
      router.replace("/cotizaciones");
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
  limpiarContenidoCotizacion();
  router.push("/cotizaciones");
  mostrarMensaje("Edición cancelada", "info");
};

const editarDesdeVista = () => {
  storeCotizador.setEditMode(true);
  storeCotizador.setViewMode(false);
  mostrarMensaje('Modo de vista a modo de edición', 'info');
};

const volverALista = () => {
  limpiarContenidoCotizacion();
  router.push("/cotizaciones");
  mostrarMensaje("Volviendo a la lista de cotizaciones", "info");
};

const formacionPrecio = () => {
  router.push({ path: '/FormacionPrecios', query: route.query });
};

function onFabCrear() {
  fabMenuAbierto.value = false;
  void crearCotizacion();
}

function onFabActualizar() {
  fabMenuAbierto.value = false;
  void actualizarCotizacion();
}

function onFabCancelarActualizacion() {
  fabMenuAbierto.value = false;
  cancelarEdicion();
}

function onFabEditar() {
  fabMenuAbierto.value = false;
  editarDesdeVista();
}

function onFabVolverLista() {
  fabMenuAbierto.value = false;
  volverALista();
}

function onFabLimpiar() {
  fabMenuAbierto.value = false;
  limpiarCotizacion();
}
</script>
