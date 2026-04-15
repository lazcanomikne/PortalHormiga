<template>
  <v-container fluid>
    <v-row align="center" class="mb-4">
      <v-col>
        <span class="text-h5 font-weight-medium">Cotizaciones</span>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="nuevaCotizacion">
          <v-icon>mdi-plus</v-icon>
          Nueva Cotización
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filtros adicionales -->
    <v-card class="mb-4" outlined>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select v-model="filtros.tipoCotizacion" :items="tiposCotizacion" label="Filtrar por tipo" clearable
              density="compact" @update:model-value="aplicarFiltros"></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="filtros.moneda" :items="monedas" label="Filtrar por moneda" clearable density="compact"
              @update:model-value="aplicarFiltros"></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filtros.cliente" label="Filtrar por cliente" clearable density="compact"
              @update:model-value="aplicarFiltros"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="secondary" variant="outlined" @click="limpiarFiltros" density="compact">
              Limpiar Filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Cotizaciones -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center">
        <span>Lista de Cotizaciones</span>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar cotización" single-line
          hide-details density="compact" class="max-width-300"></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="cotizacionesFiltradas" :search="search" :loading="loading"
        :items-per-page="10" :items-per-page-options="[10, 25, 50, 100]" class="elevation-1" density="compact" hover
        show-expand>
        <!-- Columna de acciones -->
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" color="primary" @click="itemClicked = item; dialog = true"
            title="Ver cotización"></v-btn>
          <v-btn icon="mdi-pencil" variant="text" size="small" color="warning" @click="editarCotizacion(item)"
            title="Editar cotización"></v-btn>
          <v-btn icon="mdi-shield-account" variant="text" size="small" color="info"
            :loading="enviandoAutorizacionId === item.id"
            :disabled="enviandoAutorizacionId != null || creandoPedidoSapId != null"
            title="Enviar a autorizaciones (validación de costos); puede reenviarse cuando se requiera"
            @click="enviarAAutorizaciones(item)"></v-btn>
          <v-btn icon="mdi-cart-plus" variant="text" size="small" color="deep-purple"
            :loading="creandoPedidoSapId === item.id"
            :disabled="enviandoAutorizacionId != null || creandoPedidoSapId != null"
            title="Crear pedido en SAP (Service Layer Orders)"
            @click="crearPedidoEnSap(item)"></v-btn>
          <v-btn icon="mdi-cancel" variant="text" size="small" color="error" @click="cancelarCotizacion(item)"
            title="Cancelar cotización"></v-btn>
        </template>

        <!-- Columna de fecha -->
        <template #item.fecha="{ item }">
          {{ $filters.textCrop(item.fecha, 10) }}
        </template>

        <!-- Columna de vencimiento -->
        <template #item.vencimiento="{ item }">
          {{ $filters.textCrop(item.vencimiento, 10) }}
        </template>

        <!-- Cliente/Prospecto: lista usa clienteNombre; si falta, mostrar código u objeto resuelto en API -->
        <template #item.clienteNombre="{ item }">
          {{ item.clienteNombre || item.cliente || '—' }}
        </template>

        <!-- Total (suma Productos y Opciones / conceptos; moneda en columna aparte) -->
        <template #item.total="{ item }">
          <span class="text-no-wrap">{{ formatTotalLista(item.total) }}</span>
        </template>

        <!-- Columna de moneda -->
        <template #item.moneda="{ item }">
          <v-chip :color="getColorMoneda(item.moneda)" variant="tonal" size="small">
            {{ item.moneda || 'N/A' }}
          </v-chip>
        </template>

        <!-- Excel de costos (adjunto en autorizaciones; visible al volver a la lista) -->
        <template #item.archivoCostos="{ item }">
          <span v-if="item.archivoCostos" class="d-inline-flex align-center">
            <v-btn icon="mdi-file-eye-outline" variant="text" size="small" color="primary"
              @click="abrirVisorExcel(item.archivoCostos)" title="Ver Excel de costos"></v-btn>
            <v-btn icon="mdi-download" variant="text" size="small" color="success"
              @click="descargarExcel(item.archivoCostos)" title="Descargar Excel de costos"></v-btn>
          </span>
          <v-icon v-else color="grey-lighten-1" title="Sin Excel de costos">mdi-file-alert-outline</v-icon>
        </template>

        <!-- Columna de estado -->
        <!-- <template #item.ESTADO="{ item }">
          <v-chip
            :color="getColorEstado(item.ESTADO)"
            variant="tonal"
            size="small"
          >
            {{ item.ESTADO || 'Pendiente' }}
          </v-chip>
        </template> -->

        <!-- Expansión de fila para mostrar más detalles e historial -->
        <template #expanded-row="{ columns, item }">
          <td :colspan="columns.length">
            <v-card class="ma-2 pa-3" variant="outlined">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-subtitle-1 font-weight-bold mb-2">Detalles de la Cotización Actual</div>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend><v-icon color="primary">mdi-account</v-icon></template>
                      <v-list-item-title>Cliente: {{ item.clienteNombre || item.cliente }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend><v-icon color="primary">mdi-map-marker</v-icon></template>
                      <v-list-item-title>Ubicación: {{ item.ubicacionFinal || 'No especificada' }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend><v-icon color="primary">mdi-currency-usd</v-icon></template>
                      <v-list-item-title>Moneda: {{ item.moneda }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend><v-icon color="primary">mdi-account-edit</v-icon></template>
                      <v-list-item-title>Usuario: {{ item.usuario || 'N/A' }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-subtitle-1 font-weight-bold mb-2">Historial de Versiones (HANA History)</div>
                  <v-btn v-if="!versionesCache[item.id]" size="small" color="secondary" :loading="loadingVersions[item.id]" @click="cargarVersiones(item.id)">
                    Consultar Historial
                  </v-btn>
                  
                  <v-data-table v-if="versionesCache[item.id]" :headers="headersVersiones" :items="versionesCache[item.id]" density="compact" class="elevation-0 border" hide-default-footer>
                    <template v-slot:item.total="{ item: v }">
                      {{ formatTotalLista(v.total) }}
                    </template>
                    <template v-slot:item.acciones="{ item: v }">
                      <v-btn icon size="x-small" color="primary" @click="itemClicked = v; dialog = true" title="Ver Versión">
                        <v-icon size="small">mdi-eye</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                  <div v-else-if="loadingVersions[item.id]" class="text-caption italic mt-2">Consultando historial en SAP HANA...</div>
                </v-col>
              </v-row>
            </v-card>
          </td>
        </template>

        <!-- Mensaje cuando no hay datos -->
        <template #no-data>
          <v-alert type="info" variant="tonal" class="ma-4">
            No se encontraron cotizaciones.
            <v-btn color="primary" variant="text" @click="cargarCotizaciones">
              Reintentar
            </v-btn>
          </v-alert>
        </template>
      </v-data-table>

      <!-- Resumen de datos -->
      <v-card-actions class="d-flex justify-space-between">
        <span class="text-caption">
          Total: {{ cotizacionesFiltradas.length }} cotizaciones
        </span>
        <span class="text-caption">
          Última actualización: {{ ultimaActualizacion }}
        </span>
      </v-card-actions>
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

    <v-dialog v-model="dialogExcel" max-width="960" scrollable @update:model-value="onDialogExcelToggle">
      <v-card>
        <v-card-title class="d-flex align-center flex-wrap">
          <span>Excel de costos</span>
          <v-spacer />
          <v-btn size="small" variant="text" @click="abrirExcelNuevaPestana(excelNombreArchivo)">
            Abrir archivo
          </v-btn>
          <v-btn size="small" variant="text" @click="dialogExcel = false">Cerrar</v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <p v-if="excelViewerNota" class="text-caption text-medium-emphasis px-4 pt-2 mb-0">
            {{ excelViewerNota }}
          </p>
          <div class="excel-viewer-wrap" style="min-height: 480px">
            <iframe v-if="excelViewerSrc" :src="excelViewerSrc" title="Vista previa Excel"
              class="excel-viewer-iframe" style="width: 100%; height: 70vh; border: 0"></iframe>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Opciones de visualización</v-card-title>
        <v-card-text class="ma-8">
          <v-row class="pa-2" justify="center">
            <v-btn block @click="verCotizacion(itemClicked)">
              Cotizacion
            </v-btn>
          </v-row>
          <v-row class="pa-2" justify="center">
            <v-btn block @click="generarHojaDatosTecnicos(itemClicked)">
              Hoja Datos Tecnicos
            </v-btn>
          </v-row>
          <v-row class="pa-2" justify="center">
            <v-btn block @click="generarHojaCostos(itemClicked)">
              Hoja de Costos
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { cotizacionService } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  reorderConceptosPreservandoPrecios,
  DIC_BAHIA_SECCIONES,
  normalizeArticlesForOrden,
  normalizeBahiasForOrden
} from '@/utils/conceptosOrden';
import { ensureArticuloLineUid } from '@/utils/articleLineUid';
import { pdfGeneratorService } from '@/services/pdfGenerator';
import { useArticlesStore } from '@/stores/useArticlesStore';
import { useBahiasStore } from '@/stores/useBahiasStore';
import { useCotizadorFormStore } from '@/stores/useCotizadorFormStore';
import { useCotizadorInfoPanelStore } from '@/stores/useCotizadorInfoPanelStore';
import { usePrecioVentaStore } from '@/stores/usePrecioVentaStore';
import moment from 'moment';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'Cotizaciones'
});

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const dialog = ref(false);
const search = ref('');
const cotizaciones = ref([]);
const itemClicked = ref(null)
const ultimaActualizacion = ref('');
const enviandoAutorizacionId = ref(null);
const creandoPedidoSapId = ref(null);

const dialogExcel = ref(false);
const excelViewerSrc = ref('');
const excelNombreArchivo = ref('');
const excelViewerNota =
  'Vista previa con Microsoft Office Online. En servidores internos o sin HTTPS puede no cargar; use «Abrir archivo» o el icono de descarga.';

// Versioning state
const loadingVersions = ref({})
const versionesCache = ref({})

const storeCotizador = useCotizadorFormStore()
const storeCotizadorInfo = useCotizadorInfoPanelStore()
const storeArticles = useArticlesStore()
const storeBahias = useBahiasStore()
const storePrecios = usePrecioVentaStore();

// Filtros
const filtros = ref({
  tipoCotizacion: null,
  moneda: null,
  cliente: ''
});

// Opciones de filtros
const tiposCotizacion = ['Comercial', 'Técnica', 'Servicio', 'Producto'];
const monedas = ['MXN', 'USD', 'EUR'];

function formatTotalLista (n) {
  if (n == null || n === '' || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Configuración del snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
});

// Headers de la tabla principal
const headers = [
  { title: 'Portal', key: 'folioPortal', sortable: true, width: '80px' },
  { title: 'Folio SAP', key: 'folioSap', sortable: true },
  { title: 'Cliente/Prospecto', key: 'clienteNombre', sortable: true },
  { title: 'Referencia', key: 'referencia', sortable: true },
  { title: 'Total', key: 'total', sortable: true, align: 'end' },
  { title: 'Moneda', key: 'moneda', sortable: true },
  { title: 'Tipo Cotización', key: 'tipoCotizacion', sortable: true },
  { title: 'Captura', key: 'fecha', sortable: true, width: '120px' },
  { title: 'Usuario', key: 'usuario', sortable: true },
  { title: 'Excel costos', key: 'archivoCostos', sortable: false, width: '120px', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '300px' }
];

// Headers de la tabla de versiones
const headersVersiones = [
  { title: 'Folio', key: 'folioPortal' },
  { title: 'Vendedor', key: 'vendedor.slpName' },
  { title: 'Usuario Modif.', key: 'usuario' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'Total', key: 'total', align: 'end' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'end' }
]

// Cotizaciones filtradas
const cotizacionesFiltradas = computed(() => {
  let resultado = cotizaciones.value;

  if (filtros.value.tipoCotizacion) {
    resultado = resultado.filter(c => c.tipoCotizacion === filtros.value.tipoCotizacion);
  }

  if (filtros.value.moneda) {
    resultado = resultado.filter(c => c.moneda === filtros.value.moneda);
  }

  if (filtros.value.cliente) {
    resultado = resultado.filter(c =>
      c.cliente?.toLowerCase().includes(filtros.value.cliente.toLowerCase())
    );
  }

  return resultado;
});

// Cargar cotizaciones
const cargarCotizaciones = async () => {
  try {
    loading.value = true;
    const response = await cotizacionService.getAll();
    cotizaciones.value = response.data || [];
    ultimaActualizacion.value = new Date().toLocaleString('es-ES');
  } catch (error) {
    console.error('Error al cargar cotizaciones:', error);
    const d = error.response?.data;
    const partes = [d?.message, d?.error].filter(Boolean);
    let msg =
      partes.length > 0 ? partes.join(' — ') : 'Error al cargar las cotizaciones';
    if (msg.length > 320) msg = msg.slice(0, 317) + '…';
    mostrarMensaje(msg, 'error');
  } finally {
    loading.value = false;
  }
};

// Cargar versiones de una cotización
const cargarVersiones = async (id) => {
  if (!id) return;
  if (versionesCache.value[id]) return;

  loadingVersions.value[id] = true;
  try {
    const response = await cotizacionService.getVersions(id);
    versionesCache.value[id] = response.data;
  } catch (error) {
    console.error("Error al cargar versiones:", error);
    mostrarMensaje('Error al cargar el historial de versiones', 'error');
  } finally {
    loadingVersions.value[id] = false;
  }
}

// Aplicar filtros
const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente a través del computed
  console.log('Filtros aplicados:', filtros.value);
};

// Limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    tipoCotizacion: null,
    moneda: null,
    cliente: ''
  };
  search.value = '';
};

// Obtener color para la moneda
const getColorMoneda = (moneda) => {
  const colores = {
    'MXN': 'success',
    'USD': 'info',
    'EUR': 'warning',
    'default': 'grey'
  };
  return colores[moneda] || colores.default;
};

// Obtener color para el estado
const getColorEstado = (estado) => {
  const colores = {
    'Aprobada': 'success',
    'Pendiente': 'warning',
    'Rechazada': 'error',
    'En Revisión': 'info',
    'default': 'grey'
  };
  return colores[estado] || colores.default;
};

// Mostrar mensaje
const mostrarMensaje = (mensaje, tipo = 'success') => {
  snackbar.value = {
    show: true,
    message: mensaje,
    color: tipo,
    timeout: 3000
  };
};

const descargarExcel = (fileName) => {
  const url = cotizacionService.getExcelDownloadUrl(fileName);
  if (url) window.open(url, '_blank');
};

const abrirExcelNuevaPestana = (fileName) => {
  descargarExcel(fileName);
};

const abrirVisorExcel = (fileName) => {
  const url = cotizacionService.getExcelDownloadUrl(fileName);
  if (!url) {
    mostrarMensaje('No hay archivo de costos para mostrar', 'warning');
    return;
  }
  excelNombreArchivo.value = fileName;
  excelViewerSrc.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  dialogExcel.value = true;
};

const onDialogExcelToggle = (open) => {
  if (!open) excelViewerSrc.value = '';
};

// Navegar a nueva cotización
const nuevaCotizacion = () => {
  router.push('/oferta');
};

// Ver cotización
const verCotizacion = async (item) => {
  console.log('Viendo cotización:', item);

  try {
    loading.value = true;

    // Obtener la cotización completa por ID
    const response = await cotizacionService.getById(item.id);
    const cotizacionData = JSON.parse(response.data.replace(//g, ''));
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const fecha = new Date().toLocaleDateString("es-MX", options)
    cotizacionData.fechaImpresion = fecha;
    console.log('Datos de cotización para vista:', cotizacionData);

    // Generar y mostrar PDF
    await pdfGeneratorService.generarYDescargarWord(cotizacionData);

    mostrarMensaje(`PDF de cotización ${item.id} generado exitosamente`, 'success');

  } catch (error) {
    console.error('Error al cargar cotización para vista:', error);

    let errorMessage = 'Error al cargar la cotización';
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
function toCamelCase(key, value) {
  if (value && typeof value === 'object') {
    for (var k in value) {
      if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
        value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
        delete value[k];
      }
    }
  }
  return value;
}

// Editar cotización
const editarCotizacion = async (item) => {
  console.log('Editando cotización:', item);

  try {
    loading.value = true;

    // Obtener la cotización completa por ID
    const response = await cotizacionService.getById(item.id);
    const cotizacionData = JSON.parse(response.data.replace(//g, ''), toCamelCase);

    console.log('Datos de cotización cargados:', cotizacionData);

    // Limpiar stores antes de cargar nuevos datos
    storeCotizador.clearForm();
    storeCotizadorInfo.clearInfo();
    storeArticles.clearSelectedArticles();
    storeBahias.clearSelectedBahias();

    // Cargar datos del encabezado en el store del cotizador
    // Cargar datos del encabezado en el store del cotizador
    if (cotizacionData.encabezado) {
      const encabezado = cotizacionData.encabezado;

      // Mapear datos del encabezado al formulario según el esquema de la API
      storeCotizador.form = {
        tipoCotizacion: encabezado.tipoCotizacion || '',
        tipoCuenta: encabezado.tipoCuenta || '',
        idioma: encabezado.idiomaCotizacion || encabezado.idioma || '', // Soportar ambos por compatibilidad
        cliente: encabezado.cliente || '',
        clienteNombre: encabezado.clienteNombre || '',
        personaContacto: encabezado.contacto || encabezado.personaContacto || '', // Soportar ambos
        direccionFiscal: encabezado.dirFiscal || encabezado.direccionFiscal || '', // Soportar ambos
        direccionEntrega: encabezado.dirEntrega || encabezado.direccionEntrega || '', // Soportar ambos
        referencia: encabezado.referencia || '',
        terminosEntrega: encabezado.terminosEntrega || '',
        folioPortal: item.folioPortal,
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
      storeArticles.selectedArticles = cotizacionData.productos.map((row) =>
        ensureArticuloLineUid({ ...row })
      );
    }

    // Cargar bahías seleccionadas según el esquema CotizacionBahiaCompleta
    if (cotizacionData.bahias && Array.isArray(cotizacionData.bahias)) {
      storeBahias.selectedBahias = cotizacionData.bahias;
    }

    if (cotizacionData.formacionPrecios) {
      const arts = normalizeArticlesForOrden(cotizacionData.productos)
      const bahs = normalizeBahiasForOrden(cotizacionData.bahias)
      const fp = { ...cotizacionData.formacionPrecios }
      if (Array.isArray(fp.conceptos) && fp.conceptos.length && arts.length) {
        fp.conceptos = reorderConceptosPreservandoPrecios(
          fp.conceptos,
          arts,
          bahs,
          DIC_BAHIA_SECCIONES
        )
      }
      storePrecios.$state = fp
    }

    // Marcar que estamos en modo edición
    storeCotizador.setEditMode(true);
    storeCotizador.setEditId(item.id);

    // Navegar a la página de cotización en modo edición
    router.push({
      path: '/oferta',
      query: {
        mode: 'edit',
        id: item.id
      }
    });

    mostrarMensaje(`Cotización ${item.id} cargada para edición`, 'success');

  } catch (error) {
    console.error('Error al cargar cotización para edición:', error);

    let errorMessage = 'Error al cargar la cotización';
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

const enviarAAutorizaciones = async (item) => {
  const folio = item.folioPortal || item.id;
  if (
    !confirm(
      `¿Enviar la cotización ${folio} al módulo de Autorizaciones?\n` +
        'Quedará en estado «Validación de costos» (puede enviarse de nuevo cuando lo necesite).'
    )
  ) {
    return;
  }
  try {
    enviandoAutorizacionId.value = item.id;
    await cotizacionService.updateStatus(item.id, 'Validacion Costos');
    mostrarMensaje(`Cotización ${folio} enviada a Autorizaciones`, 'success');
    await cargarCotizaciones();
  } catch (error) {
    console.error('Error al enviar a autorizaciones:', error);
    const d = error.response?.data;
    const partes = [d?.message, d?.error].filter(Boolean);
    let msg =
      partes.length > 0 ? partes.join(' — ') : 'Error al enviar la cotización a autorizaciones';
    if (msg.length > 320) msg = msg.slice(0, 317) + '…';
    mostrarMensaje(msg, 'error');
  } finally {
    enviandoAutorizacionId.value = null;
  }
};

const crearPedidoEnSap = async (item) => {
  const folio = item.folioPortal || item.id;
  if (
    !confirm(
      `¿Crear pedido en SAP para la cotización ${folio}?\n` +
        'Se enviará a Service Layer (POST Orders) con los mismos datos que una cotización.'
    )
  ) {
    return;
  }
  const u = authStore.user;
  const userName = u?.userName ?? u?.UserName ?? '';
  try {
    creandoPedidoSapId.value = item.id;
    const response = await cotizacionService.createOrderInSap(item.id, userName || undefined);
    const doc = response?.data?.folioPedidoSap ?? response?.data?.docNum;
    mostrarMensaje(
      doc
        ? `Pedido SAP creado: ${doc}`
        : (response?.data?.message ?? 'Pedido creado en SAP'),
      'success'
    );
  } catch (error) {
    console.error('Error al crear pedido en SAP:', error);
    const d = error.response?.data;
    const partes = [d?.message, d?.error].filter(Boolean);
    let msg = partes.length > 0 ? partes.join(' — ') : 'Error al crear el pedido en SAP';
    if (msg.length > 320) msg = msg.slice(0, 317) + '…';
    mostrarMensaje(msg, 'error');
  } finally {
    creandoPedidoSapId.value = null;
  }
};

// Cancelar cotización
const cancelarCotizacion = async (item) => {
  if (confirm(`¿Estás seguro de que quieres cancelar la cotización ${item.id}?`)) {
    try {
      await cotizacionService.delete(item.id);
      mostrarMensaje(`Cotización ${item.id} cancelada exitosamente`);
      await cargarCotizaciones(); // Recargar la lista
    } catch (error) {
      console.error('Error al cancelar cotización:', error);
      mostrarMensaje('Error al cancelar la cotización', 'error');
    }
  }
};

// Generar hoja de costos
const generarHojaCostos = async (item) => {
  if (!item) {
    mostrarMensaje('No hay cotización seleccionada', 'error');
    return;
  }

  try {
    loading.value = true;
    dialog.value = false;

    // Obtener la cotización completa por ID
    const response = await cotizacionService.getById(item.id);
    const cotizacionData = response.data;

    console.log('Generando hoja de costos para:', cotizacionData);

    // Generar el HTML de la hoja de costos
    const htmlContent = generarHTMLHojaCostos(cotizacionData);

    // Crear y abrir la ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      printWindow.print();
    };

    mostrarMensaje('Hoja de costos generada exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar hoja de costos:', error);
    mostrarMensaje('Error al generar la hoja de costos', 'error');
  } finally {
    loading.value = false;
  }
};

// Función para generar el HTML de la hoja de costos
const generarHTMLHojaCostos = (cotizacionData) => {
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Obtener datos del primer producto para la sección de datos básicos
  const primerProducto = cotizacionData.productos?.[0];
  const datosBasicos = primerProducto?.datosBasicos;
  const izaje = primerProducto?.izaje;

  // Función auxiliar para convertir booleanos a SI/NO
  const convertirBooleano = (valor) => {
    if (valor === true) return 'SI';
    if (valor === false) return 'NO';
    if (valor === null || valor === undefined) return 'NO APLICA';
    return valor.toString();
  };

  // Función auxiliar para obtener valor o placeholder
  const obtenerValor = (valor, placeholder = '') => {
    return valor || placeholder;
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoja de Costos - ${cotizacionData.encabezado?.referencia || 'N/A'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .reference {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .date-info {
            text-align: right;
            margin-bottom: 20px;
        }
        .page-info {
            text-align: right;
            margin-bottom: 20px;
        }
        .section-bar {
            background-color: #808080;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
        }
        .data-row {
            display: flex;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
        }
        .data-label {
            flex: 1;
            font-weight: bold;
        }
        .data-value {
            flex: 1;
            text-align: left;
        }
        .data-value-right {
            flex: 1;
            text-align: right;
        }
        .page-break {
            page-break-before: always;
        }
        @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <!-- Página 1: Datos Básicos -->
    <div class="header">
        <div class="company-name">Sistemas Hormiga, S.A. de C.V.</div>
        <div class="report-title">Informe de costos</div>
        <div class="reference">Nuestra referencia ${cotizacionData.encabezado?.referencia || 'SHGCDMX1'}</div>
    </div>

    <div class="date-info">
        Ciudad de México a ${fecha}
    </div>

    <div class="page-info">
        Página 1 de 7
    </div>

    <div class="section-bar">SECCIÓN DATOS BÁSICOS</div>

    <div class="data-row">
        <div class="data-label">Tipo de Grúa:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.fabricanteModelo, 'ELKE')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Cantidad de grúas iguales:</div>
        <div class="data-value">${obtenerValor(cotizacionData.productos?.length || 1, '1')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Corren la misma trabe carril:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.trabeCarril, '1')}</div>
        <div class="data-value-right">${convertirBooleano(datosBasicos?.trabeCarril)}</div>
    </div>

    <div class="data-row">
        <div class="data-label">Capacidad de la (s) grúa(s):</div>
        <div class="data-value">${obtenerValor(datosBasicos?.capacidadGrua, '2000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Claro:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.claro, '2000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Izaje:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.izaje, '2000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Voltate de operación trifásico:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.voltajeOperacionTrifasico, 'otro')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Voltaje de control:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.voltajeControl, '3000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Cantidad de controles:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.cantidadControles, '1')}</div>
        <div class="data-value-right">Uno</div>
    </div>

    <div class="data-row">
        <div class="data-label">Medio de control:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.medioControl, 'Radiocontrol otro')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Observacones datos básicos/control:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.obsDatosBasicosControl, 'Observaciones datos basicos/control')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">FEM/ISO:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.femIso, '1BmM3')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Peso muerto de la grúa (aprox.):</div>
        <div class="data-value">${obtenerValor(datosBasicos?.pesoMuertoGrua, '4000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Carga máxima por rueda (aprox.):</div>
        <div class="data-value">${obtenerValor(datosBasicos?.cargaMaximaRueda, '4000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Equivalente FEM en CMAA:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.similarClaseCmaa, 'Similar a Clase de CMAA')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Clase de Elevación:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.claseElevacion, 'H2')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Grupo de solicitación estructural:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.grupoSolicitacion, '3')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Tipo de pintura:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.tipoPintura, '0')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Ambiente:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.ambiente, 'undefined')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Trabaja en:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.trabajaEn, '1')}</div>
        <div class="data-value-right">Intemperie</div>
    </div>

    <div class="data-row">
        <div class="data-label">Elevación sobre nivel del mar > 1000m:</div>
        <div class="data-value">${convertirBooleano(datosBasicos?.elevacionNivelMar === '1000')}</div>
        <div class="data-value-right">${convertirBooleano(datosBasicos?.elevacionNivelMar === '1000')}</div>
    </div>

    <div class="data-row">
        <div class="data-label">Elevación sobre nivel del mar > 3000m:</div>
        <div class="data-value">${convertirBooleano(datosBasicos?.elevacionNivelMar === '3000')}</div>
        <div class="data-value-right">${convertirBooleano(datosBasicos?.elevacionNivelMar === '3000')}</div>
    </div>

    <div class="data-row">
        <div class="data-label">Material que transporta:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.materialTransporta, 'Material que Transporta')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Observaciones clasificación:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.obsClasificacion, 'Observaciones Clasificacion')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Observaciones:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.obsDatosBasicosControl, 'Observaciones')}</div>
        <div class="data-value-right"></div>
    </div>

    <!-- Página 2: Mecanismo de Izaje -->
    <div class="page-break">
        <div class="header">
            <div class="company-name">Sistemas Hormiga, S.A. de C.V.</div>
            <div class="report-title">Hoja de datos técnicos</div>
            <div class="reference">Nuestra referencia ${cotizacionData.encabezado?.referencia || 'SHGCDMX1'}</div>
        </div>

        <div class="date-info">
            Ciudad de México a ${fecha}
        </div>

        <div class="page-info">
            Página 2 de 7
        </div>

        <div class="section-bar">SECCIÓN MECANISMO DE IZAJE</div>

        <!-- Gancho Principal -->
        <div class="data-row">
            <div class="data-label">Cantidad de Polipastos:</div>
            <div class="data-value">${obtenerValor(izaje?.cantidadPolipastos, '1')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Tipo de mecanismo de elevación gancho principal:</div>
            <div class="data-value">${obtenerValor(izaje?.tipoMecanismoElevacion1, 'Cadena')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Modelo:</div>
            <div class="data-value">${obtenerValor(izaje?.modelo1, 'Polipasto de Cable EKDR-Com 3-3.2t 4/1- 10Z-5.4/0.96 440 00-60 24/6 300')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Capacidad de mecanismo de izaje principal:</div>
            <div class="data-value">${obtenerValor(izaje?.capacidadMecanismoIzaje1, '2000')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Izaje gancho principal:</div>
            <div class="data-value">${obtenerValor(izaje?.izajeGancho1, '2000')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Control via contactores:</div>
            <div class="data-value">${convertirBooleano(izaje?.control1)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.control1)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Velocidad de izaje:</div>
            <div class="data-value">${obtenerValor(izaje?.velocidadIzaje1, '200')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Motor modelo gancho principal:</div>
            <div class="data-value">${obtenerValor(izaje?.motorModeloGanchoPrincipal1, 'Polipasto de Cable EKDR-Com 3-3.2t 4/1- 10Z-5.4/0.96 440 00-60 24/6 300')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Potencia motor principal:</div>
            <div class="data-value">${obtenerValor(izaje?.potenciaMotorPrincipal1, '300')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Con variador de frecuencia:</div>
            <div class="data-value">${convertirBooleano(izaje?.variadorFrecuencia)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.variadorFrecuencia)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Control simultáneo o independiente de carro(s):</div>
            <div class="data-value">${obtenerValor(izaje?.controlSimultaneo, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Observaciones:</div>
            <div class="data-value">${obtenerValor(izaje?.observacionIzaje, 'Observaciones')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Segundo freno para gancho principal:</div>
            <div class="data-value">${convertirBooleano(izaje?.segundoFreno)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.segundoFreno)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Dispositivo de toma de carga:</div>
            <div class="data-value">${convertirBooleano(izaje?.dispositivoTomaCarga)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.dispositivoTomaCarga)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Carrete retráctil:</div>
            <div class="data-value">${convertirBooleano(izaje?.carrete)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.carrete)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Dispositivo medición sobrecarga:</div>
            <div class="data-value">${obtenerValor(izaje?.dispositivoMedicionSobrecarga, '2')}</div>
            <div class="data-value-right">NO</div>
        </div>

        <div class="data-row">
            <div class="data-label">Sumador de carga:</div>
            <div class="data-value">${convertirBooleano(izaje?.sumadorCarga)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.sumadorCarga)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Observaciones izaje:</div>
            <div class="data-value">${obtenerValor(izaje?.observacionIzaje, 'Observaciones izaje')}</div>
            <div class="data-value-right"></div>
        </div>

        <!-- Gancho Auxiliar -->
        <div class="data-row">
            <div class="data-label">Tipo de mecanismo de elevación gancho auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.tipoMecanismoElevacion2, '')}</div>
            <div class="data-value-right">NO APLICA</div>
        </div>

        <div class="data-row">
            <div class="data-label">Modelo auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.modelo2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Capacidad de mecanismo de izaje auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.capacidadMecanismoIzaje2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Izaje gancho auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.izajeGancho2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Control via contactores auxiliar:</div>
            <div class="data-value">${convertirBooleano(izaje?.control2)}</div>
            <div class="data-value-right">NO APLICA</div>
        </div>

        <div class="data-row">
            <div class="data-label">Velocidad de izaje auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.velocidadIzaje2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Motor modelo gancho auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.motorModeloGanchoPrincipal2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Potencia motor auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.potenciaMotorPrincipal2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Con variador de frecuencia auxiliar:</div>
            <div class="data-value">${convertirBooleano(izaje?.variadorFrecuenciaAuxiliar)}</div>
            <div class="data-value-right">NO APLICA</div>
        </div>

        <div class="data-row">
            <div class="data-label">Control simultáneo o independiente de carro(s) auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.controlSimultaneoAuxiliar, '')}</div>
            <div class="data-value-right"></div>
        </div>
    </div>
</body>
</html>`;
};

// Función para generar la hoja de datos técnicos
const generarHojaDatosTecnicos = async (item) => {
  if (!item) {
    mostrarMensaje('No hay cotización seleccionada', 'error');
    return;
  }

  try {
    loading.value = true;
    dialog.value = false;

    // Obtener la cotización completa por ID
    const response = await cotizacionService.getById(item.id);
    const cotizacionData = response.data;

    console.log('Generando hoja de datos técnicos para:', cotizacionData);

    // Generar el HTML de la hoja de datos técnicos
    const htmlContent = generarHTMLHojaDatosTecnicos(cotizacionData);

    // Crear y abrir la ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      printWindow.print();
    };

    mostrarMensaje('Hoja de datos técnicos generada exitosamente', 'success');

  } catch (error) {
    console.error('Error al generar hoja de datos técnicos:', error);
    mostrarMensaje('Error al generar la hoja de datos técnicos', 'error');
  } finally {
    loading.value = false;
  }
};

// Función para generar el HTML de la hoja de datos técnicos
const generarHTMLHojaDatosTecnicos = (cotizacionData) => {
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Obtener datos del primer producto para la sección de datos básicos
  const primerProducto = cotizacionData.productos?.[0];
  const datosBasicos = primerProducto?.datosBasicos;
  const izaje = primerProducto?.izaje;

  // Función auxiliar para convertir booleanos a SI/NO
  const convertirBooleano = (valor) => {
    if (valor === true) return 'SI';
    if (valor === false) return 'NO';
    if (valor === null || valor === undefined) return 'NO APLICA';
    return valor.toString();
  };

  // Función auxiliar para obtener valor o placeholder
  const obtenerValor = (valor, placeholder = '') => {
    return valor || placeholder;
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoja de Datos Técnicos - ${cotizacionData.encabezado?.referencia || 'N/A'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .reference {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .date-info {
            text-align: right;
            margin-bottom: 20px;
        }
        .page-info {
            text-align: right;
            margin-bottom: 20px;
        }
        .section-bar {
            background-color: #808080;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
        }
        .data-row {
            display: flex;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
        }
        .data-label {
            flex: 1;
            font-weight: bold;
        }
        .data-value {
            flex: 1;
            text-align: left;
        }
        .data-value-right {
            flex: 1;
            text-align: right;
        }
        .page-break {
            page-break-before: always;
        }
        @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <!-- Página 1: Datos Básicos -->
    <div class="header">
        <div class="company-name">Sistemas Hormiga, S.A. de C.V.</div>
        <div class="report-title">Hoja de datos técnicos</div>
        <div class="reference">Nuestra referencia ${cotizacionData.encabezado?.referencia || 'SHGCDMX1'}</div>
    </div>

    <div class="date-info">
        Ciudad de México a ${fecha}
    </div>

    <div class="page-info">
        Página 1 de 7
    </div>

    <div class="section-bar">SECCIÓN DATOS BÁSICOS</div>

    <div class="data-row">
        <div class="data-label">Tipo de Grúa:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.fabricanteModelo, 'ELKE')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Cantidad de grúas iguales:</div>
        <div class="data-value">${obtenerValor(cotizacionData.productos?.length || 1, '1')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Corren la misma trabe carril:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.trabeCarril, '1')}</div>
        <div class="data-value-right">${convertirBooleano(datosBasicos?.trabeCarril)}</div>
    </div>

    <div class="data-row">
        <div class="data-label">Capacidad de la (s) grúa(s):</div>
        <div class="data-value">${obtenerValor(datosBasicos?.capacidadGrua, '2000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Claro:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.claro, '2000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Izaje:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.izaje, '2000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Voltate de operación trifásico:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.voltajeOperacionTrifasico, 'otro')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Voltaje de control:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.voltajeControl, '3000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Cantidad de controles:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.cantidadControles, '1')}</div>
        <div class="data-value-right">Uno</div>
    </div>

    <div class="data-row">
        <div class="data-label">Medio de control:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.medioControl, 'Radiocontrol otro')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Observacones datos básicos/control:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.obsDatosBasicosControl, 'Observaciones datos basicos/control')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">FEM/ISO:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.femIso, '1BmM3')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Peso muerto de la grúa (aprox.):</div>
        <div class="data-value">${obtenerValor(datosBasicos?.pesoMuertoGrua, '4000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Carga máxima por rueda (aprox.):</div>
        <div class="data-value">${obtenerValor(datosBasicos?.cargaMaximaRueda, '4000')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Equivalente FEM en CMAA:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.similarClaseCmaa, 'Similar a Clase de CMAA')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Clase de Elevación:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.claseElevacion, 'H2')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Grupo de solicitación estructural:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.grupoSolicitacion, '3')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Tipo de pintura:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.tipoPintura, '0')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Ambiente:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.ambiente, 'undefined')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Trabaja en:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.trabajaEn, '1')}</div>
        <div class="data-value-right">Intemperie</div>
    </div>

    <div class="data-row">
        <div class="data-label">Elevación sobre nivel del mar > 1000m:</div>
        <div class="data-value">${convertirBooleano(datosBasicos?.elevacionNivelMar === '1000')}</div>
        <div class="data-value-right">${convertirBooleano(datosBasicos?.elevacionNivelMar === '1000')}</div>
    </div>

    <div class="data-row">
        <div class="data-label">Elevación sobre nivel del mar > 3000m:</div>
        <div class="data-value">${convertirBooleano(datosBasicos?.elevacionNivelMar === '3000')}</div>
        <div class="data-value-right">${convertirBooleano(datosBasicos?.elevacionNivelMar === '3000')}</div>
    </div>

    <div class="data-row">
        <div class="data-label">Material que transporta:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.materialTransporta, 'Material que Transporta')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Observaciones clasificación:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.obsClasificacion, 'Observaciones Clasificacion')}</div>
        <div class="data-value-right"></div>
    </div>

    <div class="data-row">
        <div class="data-label">Observaciones:</div>
        <div class="data-value">${obtenerValor(datosBasicos?.obsDatosBasicosControl, 'Observaciones')}</div>
        <div class="data-value-right"></div>
    </div>

    <!-- Página 2: Mecanismo de Izaje -->
    <div class="page-break">
        <div class="header">
            <div class="company-name">Sistemas Hormiga, S.A. de C.V.</div>
            <div class="report-title">Hoja de datos técnicos</div>
            <div class="reference">Nuestra referencia ${cotizacionData.encabezado?.referencia || 'SHGCDMX1'}</div>
        </div>

        <div class="date-info">
            Ciudad de México a ${fecha}
        </div>

        <div class="page-info">
            Página 2 de 7
        </div>

        <div class="section-bar">SECCIÓN MECANISMO DE IZAJE</div>

        <!-- Gancho Principal -->
        <div class="data-row">
            <div class="data-label">Cantidad de Polipastos:</div>
            <div class="data-value">${obtenerValor(izaje?.cantidadPolipastos, '1')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Tipo de mecanismo de elevación gancho principal:</div>
            <div class="data-value">${obtenerValor(izaje?.tipoMecanismoElevacion1, 'Cadena')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Modelo:</div>
            <div class="data-value">${obtenerValor(izaje?.modelo1, 'Polipasto de Cable EKDR-Com 3-3.2t 4/1- 10Z-5.4/0.96 440 00-60 24/6 300')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Capacidad de mecanismo de izaje principal:</div>
            <div class="data-value">${obtenerValor(izaje?.capacidadMecanismoIzaje1, '2000')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Izaje gancho principal:</div>
            <div class="data-value">${obtenerValor(izaje?.izajeGancho1, '2000')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Control via contactores:</div>
            <div class="data-value">${convertirBooleano(izaje?.control1)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.control1)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Velocidad de izaje:</div>
            <div class="data-value">${obtenerValor(izaje?.velocidadIzaje1, '200')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Motor modelo gancho principal:</div>
            <div class="data-value">${obtenerValor(izaje?.motorModeloGanchoPrincipal1, 'Polipasto de Cable EKDR-Com 3-3.2t 4/1- 10Z-5.4/0.96 440 00-60 24/6 300')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Potencia motor principal:</div>
            <div class="data-value">${obtenerValor(izaje?.potenciaMotorPrincipal1, '300')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Con variador de frecuencia:</div>
            <div class="data-value">${convertirBooleano(izaje?.variadorFrecuencia)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.variadorFrecuencia)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Control simultáneo o independiente de carro(s):</div>
            <div class="data-value">${obtenerValor(izaje?.controlSimultaneo, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Observaciones:</div>
            <div class="data-value">${obtenerValor(izaje?.observacionIzaje, 'Observaciones')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Segundo freno para gancho principal:</div>
            <div class="data-value">${convertirBooleano(izaje?.segundoFreno)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.segundoFreno)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Dispositivo de toma de carga:</div>
            <div class="data-value">${convertirBooleano(izaje?.dispositivoTomaCarga)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.dispositivoTomaCarga)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Carrete retráctil:</div>
            <div class="data-value">${convertirBooleano(izaje?.carrete)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.carrete)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Dispositivo medición sobrecarga:</div>
            <div class="data-value">${obtenerValor(izaje?.dispositivoMedicionSobrecarga, '2')}</div>
            <div class="data-value-right">NO</div>
        </div>

        <div class="data-row">
            <div class="data-label">Sumador de carga:</div>
            <div class="data-value">${convertirBooleano(izaje?.sumadorCarga)}</div>
            <div class="data-value-right">${convertirBooleano(izaje?.sumadorCarga)}</div>
        </div>

        <div class="data-row">
            <div class="data-label">Observaciones izaje:</div>
            <div class="data-value">${obtenerValor(izaje?.observacionIzaje, 'Observaciones izaje')}</div>
            <div class="data-value-right"></div>
        </div>

        <!-- Gancho Auxiliar -->
        <div class="data-row">
            <div class="data-label">Tipo de mecanismo de elevación gancho auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.tipoMecanismoElevacion2, '')}</div>
            <div class="data-value-right">NO APLICA</div>
        </div>

        <div class="data-row">
            <div class="data-label">Modelo auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.modelo2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Capacidad de mecanismo de izaje auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.capacidadMecanismoIzaje2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Izaje gancho auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.izajeGancho2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Control via contactores auxiliar:</div>
            <div class="data-value">${convertirBooleano(izaje?.control2)}</div>
            <div class="data-value-right">NO APLICA</div>
        </div>

        <div class="data-row">
            <div class="data-label">Velocidad de izaje auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.velocidadIzaje2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Motor modelo gancho auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.motorModeloGanchoPrincipal2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Potencia motor auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.potenciaMotorPrincipal2, '')}</div>
            <div class="data-value-right"></div>
        </div>

        <div class="data-row">
            <div class="data-label">Con variador de frecuencia auxiliar:</div>
            <div class="data-value">${convertirBooleano(izaje?.variadorFrecuenciaAuxiliar)}</div>
            <div class="data-value-right">NO APLICA</div>
        </div>

        <div class="data-row">
            <div class="data-label">Control simultáneo o independiente de carro(s) auxiliar:</div>
            <div class="data-value">${obtenerValor(izaje?.controlSimultaneoAuxiliar, '')}</div>
            <div class="data-value-right"></div>
        </div>
    </div>
</body>
</html>`;
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarCotizaciones();
});
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>
