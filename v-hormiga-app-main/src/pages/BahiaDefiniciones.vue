<template>
  <v-container>
    <v-row align="center" class="ma-0 px-4 py-2">
      <v-col cols="auto">
        <v-btn icon @click="volver">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <div class="text-h6 font-weight-medium">
          {{ nombreBahia }} / Estampados
        </div>
      </v-col>
    </v-row>

    <!-- Información de la bahía actual -->
    <v-alert v-if="!store.bahiaActual" type="warning" class="mb-4">
      No hay una bahía seleccionada. Por favor, seleccione una bahía desde la página anterior.
    </v-alert>

    <div v-else>
      <v-row>
        <!-- Columna de Navegación Lateral (Sticky) -->
        <v-col cols="12" md="3" class="sticky-sidebar-container">
          <v-card class="elevation-2 rounded-lg mb-4 sticky-sidebar-card">
            <v-list density="comfortable" class="py-2" v-model:opened="openedGroups">
              <div class="px-4 py-4 bg-grey-lighten-4 border-b">
                <div class="d-flex align-center justify-space-between mb-2">
                  <v-chip size="default" color="primary" variant="flat" label class="font-weight-black text-h6 px-4">
                    {{ store.bahiaActual?.nombre }}
                  </v-chip>
                </div>
                <div class="text-subtitle-1 font-weight-bold truncate-2-lines line-height-tight">
                  Bahía
                </div>
              </div>
              
              <v-list-item
                v-for="step in steps"
                :key="step.value"
                :value="step.value"
                :active="pageNavigationStore.currentTab === step.value"
                @click="pageNavigationStore.currentTab = step.value"
                class="mb-1 mx-2"
                min-height="60"
                active-color="primary"
                rounded="lg"
              >
                <template v-slot:prepend>
                  <div class="mr-3 position-relative d-flex align-center justify-center" style="width: 32px; height: 32px;">
                     <span class="text-caption font-weight-bold">{{ step.index }}</span>
                  </div>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ step.label }}
                </v-list-item-title>
                
                <template v-slot:append>
                  <v-icon v-if="pageNavigationStore.currentTab === step.value" color="primary">mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>

            <v-divider class="my-2 mx-4"></v-divider>
            
            <div class="px-4 pb-4 text-center">
              <v-btn
                block
                color="primary"
                size="large"
                prepend-icon="mdi-content-save"
                @click="guardarDefiniciones"
                variant="elevated"
                class="rounded-lg font-weight-bold"
              >
                Guardar
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Columna de Contenido Principal -->
        <v-col cols="12" md="9">
          <v-card class="elevation-2 rounded-lg">
            <!-- Pestañas Superiores (Sticky) -->
            <v-tabs
              v-model="pageNavigationStore.currentTab"
              bg-color="white"
              color="primary"
              align-tabs="start"
              class="border-b"
            >
              <v-tab
                v-for="step in steps"
                :key="step.value"
                :value="step.value"
                class="text-none font-weight-medium"
              >
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
              <v-window-item value="alimentacion" v-if="store.bahiaActual.alimentacion">
                <v-card-text class="pa-0">
                  <Alimentacion />
                </v-card-text>
              </v-window-item>

              <v-window-item value="riel" v-if="store.bahiaActual.riel">
                <v-card-text class="pa-0">
                  <Riel />
                </v-card-text>
              </v-window-item>

              <v-window-item value="estructura" v-if="store.bahiaActual.estructura">
                <v-card-text class="pa-0">
                  <Estructura />
                </v-card-text>
              </v-window-item>
            </v-window>

            <!-- Navegación entre pasos -->
            <v-divider></v-divider>
            <v-card-actions class="pa-4 bg-grey-lighten-5">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-chevron-left"
                @click="prevStep"
                :disabled="isFirstStep"
                color="primary"
              >
                Anterior
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                v-if="!isLastStep"
                color="primary"
                append-icon="mdi-chevron-right"
                @click="nextStep"
                variant="elevated"
              >
                Siguiente Paso
              </v-btn>
              <v-btn
                v-else
                color="success"
                prepend-icon="mdi-check"
                @click="guardarDefiniciones"
                variant="elevated"
              >
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
import { useBahiaDefinicionesStore } from '@/stores/useBahiaDefinicionesStore';
import { usePageNavigationStore } from '@/stores/usePageNavigationStore';
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Componentes
import Alimentacion from '@/components/BahiaDefiniciones/Alimentacion.vue';
import Estructura from '@/components/BahiaDefiniciones/Estructura.vue';
import Riel from '@/components/BahiaDefiniciones/Riel.vue';

defineOptions({
  name: 'BahiaDefiniciones'
})

const router = useRouter();
const store = useBahiaDefinicionesStore();
const pageNavigationStore = usePageNavigationStore();
const openedGroups = ref([])

// Obtener información de la bahía desde el store (Alternativa 4)
const nombreBahia = computed(() => {
  return store.bahiaActual?.nombre || 'Bahía';
});

// Definición dinámica de pasos según la configuración de la bahía
const steps = computed(() => {
  if (!store.bahiaActual) return [];
  
  let items = [];

  if (store.bahiaActual.alimentacion) {
    items.push({ label: 'Alimentación', value: 'alimentacion' });
  }
  
  if (store.bahiaActual.riel) {
    items.push({ label: 'Riel', value: 'riel' });
  }
  
  if (store.bahiaActual.estructura) {
    items.push({ label: 'Estructura', value: 'estructura' });
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





function volver () {
  router.go(-1)
}

function guardarDefiniciones () {
  // Guardar las definiciones en la bahía específica
  store.guardarDefinicionesEnBahia();
  console.log('Definiciones guardadas en bahía:', store.bahiaActual.nombre);
  console.log('Definiciones guardadas:', store.getDefinicionesCompletas());
  // Aquí podrías mostrar un mensaje de éxito
  volver();
}

onMounted(() => {
  // Asegurar que estamos en el primer paso al entrar si no hay tab seleccionado
  if ((!pageNavigationStore.currentTab || !steps.value.some(s => s.value === pageNavigationStore.currentTab)) && steps.value.length > 0) {
    pageNavigationStore.currentTab = steps.value[0].value;
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
  top: 80px; /* Below main app bar */
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
  font-size: 0.875rem !important; /* Más pequeño para que quepa mejor */
  color: #555;
}

/* Estilo para que el scroll sea suave */
.v-window {
  transition: 0.3s ease;
}
</style>
