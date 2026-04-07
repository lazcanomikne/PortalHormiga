<template>
  <v-container fluid>
    <v-row align="center" class="mb-4">
      <v-col>
        <span class="text-h5 font-weight-medium">Autorizaciones - Validación de Costos</span>
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

    <!-- Tabla de Autorizaciones -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center">
        <span>Cotizaciones Pendientes de Validación</span>
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
          
          <!-- Botón de Adjunto -->
          <v-btn :icon="item.archivoCostos ? 'mdi-file-excel' : 'mdi-paperclip'" 
            variant="text" size="small" 
            :color="item.archivoCostos ? 'success' : 'grey'"
            @click="triggerFileUpload(item)"
            title="Adjuntar Excel de Costos"></v-btn>
          
          <!-- Input de archivo oculto -->
          <input type="file" :id="'fileInput-' + item.id" hidden accept=".xls,.xlsx" 
            @change="handleFileUpload($event, item)">

          <v-btn icon="mdi-check-circle" variant="text" size="small" color="success" 
            :disabled="!item.archivoCostos"
            @click="aprobarCotizacion(item)"
            title="Aprobar (Requiere Excel)"></v-btn>
          
          <v-btn icon="mdi-close-circle" variant="text" size="small" color="error" @click="rechazarCotizacion(item)"
            title="Rechazar"></v-btn>
        </template>

        <!-- Columna de fecha -->
        <template #item.fecha="{ item }">
          {{ $filters.textCrop(item.fecha, 10) }}
        </template>

        <!-- Columna de total -->
        <template #item.total="{ item }">
          <span class="font-weight-bold">
            {{ formatCurrency(item.total, item.moneda) }}
          </span>
        </template>

        <!-- Columna de Estado -->
        <template #item.estado="{ item }">
          <v-chip :color="getColorEstado(item.estado)" variant="tonal" size="small">
            {{ item.estado || 'N/A' }}
          </v-chip>
        </template>

        <!-- Columna de Excel -->
        <template #item.archivoCostos="{ item }">
          <v-btn v-if="item.archivoCostos" icon="mdi-file-excel" variant="text" size="small" color="success"
            @click="descargarExcel(item.archivoCostos)" title="Descargar Excel de Costos"></v-btn>
          <v-icon v-else color="grey-lighten-1" title="Sin excel">mdi-file-alert-outline</v-icon>
        </template>

        <!-- Expansión de fila para mostrar más detalles -->
        <template #expanded-row="{ columns, item }">
          <td :colspan="columns.length">
            <v-card class="ma-2 pa-3" variant="outlined">
              <v-row>
                <v-col cols="12" md="6">
                  <strong>Cliente:</strong> {{ item.cliente || 'N/A' }}<br>
                  <strong>Contacto:</strong> {{ item.contacto || 'N/A' }}<br>
                  <strong>Referencia:</strong> {{ item.referencia || 'N/A' }}
                </v-col>
                <v-col cols="12" md="6">
                  <strong>Dir. Fiscal:</strong> {{ item.dirFiscal || 'N/A' }}<br>
                  <strong>Dir. Entrega:</strong> {{ item.dirEntrega || 'N/A' }}<br>
                  <strong>Términos:</strong> {{ item.terminosEntrega || 'N/A' }}
                </v-col>
              </v-row>
            </v-card>
          </td>
        </template>

        <!-- Mensaje cuando no hay datos -->
        <template #no-data>
          <v-alert type="info" variant="tonal" class="ma-4">
            No hay cotizaciones pendientes de validación.
            <v-btn color="primary" variant="text" @click="cargarCotizaciones">
              Reintentar
            </v-btn>
          </v-alert>
        </template>
      </v-data-table>

      <!-- Resumen de datos -->
      <v-card-actions class="d-flex justify-space-between">
        <span class="text-caption">
          Total: {{ cotizacionesFiltradas.length }} pendientes
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
  name: 'Autorizaciones'
});

const router = useRouter();
const loading = ref(false);
const dialog = ref(false);
const search = ref('');
const cotizaciones = ref([]);
const itemClicked = ref(null)
const ultimaActualizacion = ref('');

// Filtros
const filtros = ref({
  tipoCotizacion: null,
  moneda: null,
  cliente: ''
});

// Opciones de filtros
const tiposCotizacion = ['Comercial', 'Técnica', 'Servicio', 'Producto'];
const monedas = ['MXN', 'USD', 'EUR'];

// Configuración del snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
});

const headers = [
  { title: 'Portal', key: 'folioPortal', sortable: true, width: '90px', minWidth: '90px', align: 'center' },
  { title: 'Folio SAP', key: 'folioSap', sortable: true, width: '120px', minWidth: '120px', align: 'center' },
  { title: 'Cliente/Prospecto', key: 'clienteNombre', sortable: true, minWidth: '220px', align: 'start' },
  { title: 'Referencia', key: 'referencia', sortable: true, minWidth: '180px', align: 'start' },
  { title: 'Moneda', key: 'moneda', sortable: true, width: '100px', minWidth: '100px', align: 'center' },
  { title: 'Captura', key: 'fecha', sortable: true, width: '120px', minWidth: '120px', align: 'center' },
  { title: 'Total', key: 'total', sortable: true, width: '150px', minWidth: '150px', align: 'end' },
  { title: 'Estado', key: 'estado', sortable: true, width: '140px', minWidth: '140px', align: 'center' },
  { title: 'Excel', key: 'archivoCostos', sortable: false, width: '80px', minWidth: '80px', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '220px', minWidth: '220px', align: 'center' }
];

// Cotizaciones filtradas (Solo Validacion Costos)
const cotizacionesFiltradas = computed(() => {
  let resultado = cotizaciones.value.filter(c => c.estado === 'Validacion Costos');

  if (filtros.value.tipoCotizacion) {
    resultado = resultado.filter(c => c.tipoCotizacion === filtros.value.tipoCotizacion);
  }

  if (filtros.value.moneda) {
    resultado = resultado.filter(c => c.moneda === filtros.value.moneda);
  }

  if (filtros.value.cliente) {
    resultado = resultado.filter(c =>
      c.clienteNombre?.toLowerCase().includes(filtros.value.cliente.toLowerCase())
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
    mostrarMensaje('Error al cargar las cotizaciones', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await cargarCotizaciones();
});

// Aplicar filtros
const aplicarFiltros = () => {
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
    'Abierto': 'grey',
    'Borrador': 'orange',
    'Validacion Costos': 'info',
    'Aprobada': 'success',
    'Rechazada': 'error',
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
  if (url) {
    window.open(url, '_blank');
  }
};

const formatCurrency = (value, currency = 'MXN') => {
  if (value === undefined || value === null) return '$0.00';
  
  let validCurrency = currency || 'MXN';
  if (validCurrency === 'US$') validCurrency = 'USD';
  
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: validCurrency,
    }).format(value);
  } catch (e) {
    return `$${Number(value).toFixed(2)} ${validCurrency}`;
  }
};

// Funciones para manejar archivos
const triggerFileUpload = (item) => {
  const input = document.getElementById('fileInput-' + item.id);
  if (input) input.click();
};

const handleFileUpload = async (event, item) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar extensión
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension !== 'xls' && extension !== 'xlsx') {
    mostrarMensaje('Solo se permiten archivos Excel (.xls, .xlsx)', 'error');
    return;
  }

  try {
    loading.value = true;
    const response = await cotizacionService.uploadExcel(item.id, file);
    mostrarMensaje(`Archivo "${file.name}" subido exitosamente`);
    await cargarCotizaciones(); // Recargar para actualizar el estado del botón
  } catch (error) {
    console.error('Error al subir archivo:', error);
    mostrarMensaje('Error al subir el archivo Excel', 'error');
  } finally {
    loading.value = false;
  }
};

// Aprobar cotización
const aprobarCotizacion = async (item) => {
  if (confirm(`¿Estás seguro de que quieres APROBAR la cotización ${item.folioPortal || item.id}?`)) {
    try {
      loading.value = true;
      await cotizacionService.updateStatus(item.id, 'Aprobada');
      mostrarMensaje(`Cotización ${item.folioPortal || item.id} aprobada exitosamente`);
      await cargarCotizaciones();
    } catch (error) {
      console.error('Error al aprobar:', error);
      mostrarMensaje('Error al aprobar la cotización', 'error');
    } finally {
      loading.value = false;
    }
  }
};

// Rechazar cotización
const rechazarCotizacion = async (item) => {
  if (confirm(`¿Estás seguro de que quieres RECHAZAR la cotización ${item.folioPortal || item.id}?`)) {
    try {
      loading.value = true;
      await cotizacionService.updateStatus(item.id, 'Rechazada');
      mostrarMensaje(`Cotización ${item.folioPortal || item.id} rechazada exitosamente`);
      await cargarCotizaciones();
    } catch (error) {
      console.error('Error al rechazar:', error);
      mostrarMensaje('Error al rechazar la cotización', 'error');
    } finally {
      loading.value = false;
    }
  }
};

// Ver cotización
const verCotizacion = async (item) => {
  try {
    loading.value = true;
    const response = await cotizacionService.getByFolio(item.folioPortal);
    // Simular procesamiento similar a Cotizaciones.vue
    const cotizacionData = JSON.parse(response.data.replace(/ /g, ''));
    await pdfGeneratorService.generarYDescargarWord(cotizacionData);
    mostrarMensaje(`PDF generado exitosamente`, 'success');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    mostrarMensaje('Error al generar el PDF', 'error');
  } finally {
    loading.value = false;
    dialog.value = false;
  }
};
</script>
