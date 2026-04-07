<template>
  <v-container>
    <v-row align="center" class="ma-0 px-4 py-2">
      <v-col cols="auto">
        <v-btn icon @click="volver">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <div id="nombre-articulo" :aria-label="store.articuloActual.itemCode" class="text-h6 font-weight-medium">
          {{ nombreArticulo }} / Grúa
        </div>
      </v-col>
    </v-row>

    <!-- Información del artículo actual -->
    <v-alert v-if="!store.articuloActual" type="warning" class="mb-4">
      No hay un artículo seleccionado. Por favor, seleccione un artículo desde la página anterior.
    </v-alert>

    <div v-else>
      <v-row>
        <!-- Columna de Navegación Lateral (Sticky) -->
        <!-- Columna de Navegación Lateral (Sticky) -->
        <v-col cols="12" md="3" class="sticky-sidebar-container">
          <v-card class="elevation-2 rounded-lg mb-4 sticky-sidebar-card">
            <v-list density="comfortable" class="py-2" v-model:opened="openedGroups">
              <div class="px-4 py-4 bg-grey-lighten-4 border-b">
                <div class="d-flex align-center justify-space-between mb-2">
                  <v-chip size="default" color="primary" variant="flat" label class="font-weight-black text-h6 px-4">
                    {{ store.articuloActual?.itemCode }}
                  </v-chip>
                </div>
                <div class="text-subtitle-1 font-weight-bold truncate-2-lines line-height-tight"
                  :title="store.articuloActual?.itemName">
                  {{ store.articuloActual?.itemName }}
                </div>
              </div>

              <v-list-item v-for="step in steps" :key="step.value" :value="step.value"
                :active="pageNavigationStore.currentTab === step.value"
                @click="pageNavigationStore.currentTab = step.value" class="mb-1 mx-2" min-height="60"
                active-color="primary" rounded="lg">
                <template v-slot:prepend>
                  <div class="mr-3 position-relative d-flex align-center justify-center"
                    style="width: 32px; height: 32px;">
                    <span class="text-caption font-weight-bold">{{ step.index }}</span>
                  </div>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ step.label }}
                </v-list-item-title>

                <template v-slot:append>
                  <v-icon v-if="pageNavigationStore.currentTab === step.value"
                    color="primary">mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>

            <v-divider class="my-2 mx-4"></v-divider>

            <div class="px-4 pb-4 text-center">
              <v-btn block color="primary" size="large" prepend-icon="mdi-content-save" @click="guardarDefiniciones"
                variant="elevated" class="rounded-lg font-weight-bold">
                Guardar
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Columna de Contenido Principal -->
        <v-col cols="12" md="9">
          <v-card class="elevation-2 rounded-lg">
            <!-- Pestañas Superiores (Sticky) -->
            <v-tabs v-model="pageNavigationStore.currentTab" bg-color="white" color="primary" align-tabs="start"
              class="border-b">
              <v-tab v-for="step in steps" :key="step.value" :value="step.value" class="text-none font-weight-medium">
                {{ step.label }}
              </v-tab>
            </v-tabs>

            <v-card-title class="px-6 pt-6 d-flex align-center">
              <span class="text-h6 font-weight-bold text-primary">{{ currentStepLabel }}</span>
              <v-spacer></v-spacer>
              <div class="text-caption grey--text font-weight-medium">
                Sección: {{ currentStepIndex + 1 }} de {{ steps.length }}
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-window v-model="pageNavigationStore.currentTab" class="pa-0 min-vh-50">
              <v-window-item value="datosBasicos">
                <v-card-text class="pa-0">
                  <DatosBasicos />
                </v-card-text>
              </v-window-item>

              <v-window-item value="brazo">
                <v-card-text class="pa-0">
                  <Brazo />
                </v-card-text>
              </v-window-item>

              <v-window-item value="columna">
                <v-card-text class="pa-0">
                  <Columna />
                </v-card-text>
              </v-window-item>

              <v-window-item value="gancho">
                <v-card-text class="pa-0">
                  <MecanismoIzaje />
                </v-card-text>
              </v-window-item>

              <v-window-item value="carro">
                <v-card-text class="pa-0">
                  <Carro :cantidadCarros="store.datosBasicos.cantidadGanchos" />
                </v-card-text>
              </v-window-item>

              <v-window-item value="caminoRodadura">
                <v-card-text class="pa-0">
                  <CaminoRodadura />
                </v-card-text>
              </v-window-item>

              <v-window-item value="puente">
                <v-card-text class="pa-0">
                  <Puente />
                </v-card-text>
              </v-window-item>

              <v-window-item value="flete">
                <v-card-text class="pa-0">
                  <Flete />
                </v-card-text>
              </v-window-item>

              <v-window-item value="montaje">
                <v-card-text class="pa-0">
                  <Montaje />
                </v-card-text>
              </v-window-item>
            </v-window>

            <!-- Navegación entre pasos -->
            <v-divider></v-divider>
            <v-card-actions class="pa-4 bg-grey-lighten-5">
              <v-btn variant="outlined" prepend-icon="mdi-chevron-left" @click="prevStep" :disabled="isFirstStep"
                color="primary">
                Anterior
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn v-if="!isLastStep" color="primary" append-icon="mdi-chevron-right" @click="nextStep"
                variant="elevated">
                Siguiente Paso
              </v-btn>
              <v-btn v-else color="success" prepend-icon="mdi-check" @click="guardarDefiniciones" variant="elevated">
                Finalizar Captura
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

  </v-container>
</template>

<script setup>
import { dataAppService } from '@/services/api';
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { usePageNavigationStore } from '@/stores/usePageNavigationStore';
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// Componentes
import Carro from '@/components/ArticuloDefiniciones/Carro.vue';
import DatosBasicos from '@/components/ArticuloDefiniciones/DatosBasicos.vue';
import Flete from '@/components/ArticuloDefiniciones/Flete.vue';
import MecanismoIzaje from '@/components/ArticuloDefiniciones/MecanismoIzaje.vue';
import Montaje from '@/components/ArticuloDefiniciones/Montaje.vue';
import Brazo from '@/components/ArticuloDefiniciones/Brazo.vue';
import Columna from '@/components/ArticuloDefiniciones/Columna.vue';
import Puente from '@/components/ArticuloDefiniciones/Puente.vue';
import CaminoRodadura from '@/components/ArticuloDefiniciones/CaminoRodadura.vue';

defineOptions({
  name: 'ArticuloDefiniciones'
})

const router = useRouter();
const store = useArticuloDefinicionesStore();
const pageNavigationStore = usePageNavigationStore();
const tipoPolipasto = ref([])
const openedGroups = ref([])

// Definición dinámica de pasos según el tipo de artículo
const steps = computed(() => {
  const itemCode = store.articuloActual?.itemCode || '';
  let items = [];

  if (itemCode === 'KBK') {
    items = [
      { label: 'Datos Básicos', value: 'datosBasicos' },
      { label: 'Camino de Rodadura', value: 'caminoRodadura' },
      { label: 'Puente', value: 'puente' },
      { label: 'Flete', value: 'flete' },
      { label: 'Montaje', value: 'montaje' }
    ];
  } else if (itemCode === 'Grua giratoria') {
    items = [
      { label: 'Datos Básicos', value: 'datosBasicos' },
      { label: 'Brazo', value: 'brazo' }
    ];
  } else if (itemCode === 'Grua giratoria KBK') {
    items = [
      { label: 'Datos Básicos', value: 'datosBasicos' },
      { label: 'Brazo', value: 'brazo' },
      { label: 'Columna', value: 'columna' }
    ];
  } else {
    items = [
      { label: 'Datos Básicos', value: 'datosBasicos' },
      { label: 'Gancho', value: 'gancho' },
      { label: 'Carro', value: 'carro' },
      { label: 'Puente', value: 'puente' },
      { label: 'Flete', value: 'flete' },
      { label: 'Montaje', value: 'montaje' }
    ];
  }

  return items.map((item, index) => ({ ...item, index: index + 1 }));
});

const currentStepLabel = computed(() => {
  return steps.value.find(s => s.value === pageNavigationStore.currentTab)?.label || '';
});

const currentStepIndex = computed(() => {
  return steps.value.findIndex(s => s.value === pageNavigationStore.currentTab);
});

const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);

function nextStep() {
  if (!isLastStep.value) {
    pageNavigationStore.currentTab = steps.value[currentStepIndex.value + 1].value;
  }
}

function prevStep() {
  if (!isFirstStep.value) {
    pageNavigationStore.currentTab = steps.value[currentStepIndex.value - 1].value;
  }
}

// Función para enfocar el primer campo input
const focusFirstInput = async () => {
  await nextTick();
  // Pequeño retraso para permitir que la transición de v-window termine o el DOM se actualice
  setTimeout(() => {
    // Buscar inputs dentro del item activo de v-window
    // Nota: Vuetify renderiza v-window-item, buscamos el visible
    const container = document.querySelector('.v-window-item--active');
    if (container) {
      const input = container.querySelector('input, select, textarea');
      if (input) {
        input.focus();
        // A veces es necesario seleccionar el texto también
        // input.select(); 
      }
    }
  }, 300);
};

// Observar cambios en la pestaña actual para enfocar
watch(() => pageNavigationStore.currentTab, () => {
  focusFirstInput();
});





// Obtener información del artículo desde el store (Alternativa 4)
const nombreArticulo = computed(() => {
  return store.articuloActual?.itemCode ||
    store.articuloActual?.itemCode ||
    'Artículo';
});

function volver() {
  router.go(-1)
}

function guardarDefiniciones() {
  // Los datos se guardan automáticamente en el store
  console.log('Definiciones guardadas:', store.getDefinicionesCompletas());
  console.log('Artículo actual:', store.articuloActual);
  // Aquí podrías mostrar un mensaje de éxito
  store.autoGuardar();
  volver();
}

const loadData = async () => {
  tipoPolipasto.value = await (await dataAppService.getTipoPolipasto()).data
  store.tipoPolipasto = tipoPolipasto.value;

  if (['ZKKW', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode))
    store.datosBasicos.claseElevacion = 'H2 / B3';
  if (['EVPE', 'ZVPE'].includes(store.articuloActual.itemCode))
    store.datosBasicos.claseElevacion = 'H2 / B3';
  if (['EHPE'].includes(store.articuloActual.itemCode))
    store.datosBasicos.claseElevacion = 'H3 / B4';
  if (['EHPE'].includes(store.articuloActual.itemCode))
    store.datosBasicos.claseElevacion = 'H4 / B6';
  if (['EHPE'].includes(store.articuloActual.itemCode))
    store.datosBasicos.claseElevacion = 'H5 / B6';
  
  // Enfocar al cargar los datos iniciales
  focusFirstInput();
}

onMounted(() => {
  loadData()
  // Asegurar que estamos en el primer paso al entrar
  if (!pageNavigationStore.currentTab || !steps.value.some(s => s.value === pageNavigationStore.currentTab)) {
    pageNavigationStore.currentTab = 'datosBasicos';
  }
})
</script>

<style>
.v-col-md-12 {
  padding-bottom: 1px !important;
}

/* Sticky Sidebar Styles */
.sticky-sidebar-container {
  position: relative;
}

.sticky-sidebar-card {
  position: sticky;
  top: 80px;
  /* Below main app bar */
  align-self: start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 5;
}

.line-height-tight {
  line-height: 1.25 !important;
}

.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}



/* Reducir espacios entre campos de captura */
.v-window-item .v-row {
  margin-top: -8px;
  margin-bottom: -8px;
}

.v-window-item .v-col {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.v-window-item .text-body-1 {
  font-size: 0.875rem !important;
  /* Más pequeño para que quepa mejor */
  color: #555;
}

/* Estilo para que el scroll sea suave */
.v-window {
  transition: 0.3s ease;
}
</style>
