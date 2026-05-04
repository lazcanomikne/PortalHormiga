<template>
  <v-card class="mb-4" id="mecanismo-izaje" aria-label="Mecanismo de izaje" flat>
    <v-card-title class="d-flex align-center">
      <span>Gancho{{ store.izaje.polipastos.length > 1 ? "s" : "" }}</span>
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <v-alert v-if="store.izaje.polipastos.length === 0" type="info" variant="tonal" class="mb-4">
        No hay polipastos configurados. Haga clic en "Agregar Gancho" para comenzar.
      </v-alert>
      <v-row v-if="store.izaje.polipastos.length > 1">
        <v-col cols="12" md="4">
          <v-checkbox v-model="store.izaje.simultaneo" label="Simultaneo" density="compact" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox v-model="store.izaje.independiente" label="Independiente" density="compact" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox v-model="store.izaje.sincrono" label="Sincrono" density="compact" />
        </v-col>
      </v-row>
      <v-expansion-panels multiple>
        <v-expansion-panel v-for="(gancho, n) in store.izaje.polipastos" :key="n">
          <v-expansion-panel-title>
            <span class="text-h6 font-weight-medium">Gancho {{ n + 1 }}</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat>
              <v-card-text class="px-0">
                <v-row>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Capacidad de Gancho</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="gancho.capacidadGancho" type="number" min="0" @focus="$event.target.select()"
                      :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 kg" suffix="kg" density="compact"
                      @input="() => gancho.capacidadGanchoToneladas = gancho.capacidadGancho / 1000"
                      :hint="gancho.capacidadGanchoToneladas + ' toneladas'" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Izaje Gancho</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="gancho.izajeGancho" type="number" min="0" @focus="$event.target.select()"
                      :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm"
                      density="compact" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Motor/modelo</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="gancho.motorModelo" density="compact" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Intermitencia</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="gancho.intermitencia" density="compact" suffix="%" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Izaje con True vertical lift</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.izajeConSinDesplazamientoLateral"
                      :items="['Con True vertical lift', 'Sin True vertical lift']" density="compact" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Mecanismo de elevación</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.gancho" :items="ganchoList" density="compact"
                      @update:model-value="getCodigoConstruccion(gancho.gancho, n)" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Código de construcción</label>
                  </v-col>
                   <v-col cols="12" md="8">
                     <v-combobox v-model="gancho.codigoConstruccion" :items="codigoConstruccionMap[n] || []"
                      item-title="title" item-value="value"
                      density="compact" :loading="loadingRef[n]" no-data-text="No hay datos disponibles" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Geometría de ramales</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="gancho.geometriaRamales" density="compact" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Control Gancho</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.control"
                      :items="['Contactores / Dos velocidades', 'Inversor / Velocidad variable']" density="compact" />
                  </v-col>
                  <template v-if="gancho.control === 'Inversor / Velocidad variable'">
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Tipo de inversor</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-combobox v-model="gancho.controlInversor" :items="['ACS 880', 'DEMAG DIC-4', 'Otro']"
                        density="compact" />
                    </v-col>
                  </template>
                  <template v-if="gancho.controlInversor === 'Otro'">
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Especifique tipo de inversor</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="gancho.controlInversorOtro" density="compact" />
                    </v-col>
                  </template>
                  <v-col cols="12" md="12">
                    <v-row>
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Velocidad de Izaje Gancho m/min</label>
                      </v-col>
                      <v-col cols="12" :md="gancho.control === 'Contactores / Dos velocidades' ? 2 : 5">
                        <v-text-field v-model.number="gancho.velIzaje1" type="number" step="any" min="0" @focus="$event.target.select()"
                          :rules="[v => v >= 0 || 'No se permite negativos']"
                          :label="gancho.control === 'Contactores / Dos velocidades' ? 'Vel. m/min' : 'Vel. m-min'"
                          density="compact"
                          @blur="roundDecimalOnBlur(gancho, 'velIzaje1', 2)" />
                      </v-col>
                      <v-col v-if="gancho.control === 'Contactores / Dos velocidades'" cols="12" md="1"
                        class="d-flex justify-center" no-gutters>
                        <span class="text-center text-subtitle-1 font-weight-bold">/</span>
                      </v-col>
                      <v-col v-if="gancho.control === 'Contactores / Dos velocidades'" cols="12" md="2">
                        <v-text-field v-model.number="gancho.velIzaje2" type="number" step="any" min="0" @focus="$event.target.select()"
                          :rules="[v => v >= 0 || 'No se permite negativos']" label="Vel. m/min"
                          density="compact"
                          @blur="roundDecimalOnBlur(gancho, 'velIzaje2', 2)" />
                      </v-col>
                      <v-col cols="12" md="3" class="d-flex align-center"
                        v-if="gancho.control === 'Contactores / Dos velocidades'">
                        <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                          gancho.velIzaje1 }}/{{
                            gancho.velIzaje2 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                          m/min</span>
                      </v-col>
                      <v-col cols="12" md="3" class="d-flex align-center" v-else>
                        <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                          gancho.velIzaje1 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                          m-min</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Voltaje de Control</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.voltajeControl"
                      :items="['24 V/60 Hz', '48 V/60 Hz', '110 V/60 Hz', '220 V/60 Hz', 'Otro']" density="compact" />
                  </v-col>
                  <template v-if="gancho.voltajeControl === 'Otro'">
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Especifique voltaje de control</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="gancho.voltajeControlOtro" density="compact" />
                    </v-col>
                  </template>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Voltaje de operación trifásico</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.voltajeOperacion"
                      :items="['220 V/60 Hz', '440 V/60 Hz', '460 V/60 Hz', '480 V/60 Hz', 'Otro']"
                      density="compact" />
                  </v-col>
                  <template v-if="gancho.voltajeOperacion === 'Otro'">
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Especifique voltaje de operación</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="gancho.voltajeOperacionOtro" density="compact" />
                    </v-col>
                  </template>
                  <v-col cols="12" md="12">
                    <v-row>
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Potencia motor de izaje</label>
                      </v-col>
                      <v-col cols="12" :md="gancho.control === 'Contactores / Dos velocidades' ? 2 : 5">
                        <v-text-field v-model.number="gancho.potenciaMotorIzaje" type="number" step="any" min="0" @focus="$event.target.select()"
                          :rules="[v => v >= 0 || 'No se permite negativos']"
                          label="Pot. Kw"
                          density="compact"
                          @blur="roundDecimalOnBlur(gancho, 'potenciaMotorIzaje', 2)" />
                      </v-col>
                      <v-col v-if="gancho.control === 'Contactores / Dos velocidades'" cols="12" md="1"
                        class="d-flex justify-center" no-gutters>
                        <span class="text-center text-subtitle-1 font-weight-bold">/</span>
                      </v-col>
                      <v-col v-if="gancho.control === 'Contactores / Dos velocidades'" cols="12" md="2">
                        <v-text-field v-model.number="gancho.potenciaMotorIzaje2" type="number" step="any" min="0" @focus="$event.target.select()"
                          :rules="[v => v >= 0 || 'No se permite negativos']" label="Pot. Kw"
                          density="compact"
                          @blur="roundDecimalOnBlur(gancho, 'potenciaMotorIzaje2', 2)" />
                      </v-col>
                      <v-col cols="12" md="3" class="d-flex align-center"
                        v-if="gancho.control === 'Contactores / Dos velocidades'">
                        <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                          gancho.potenciaMotorIzaje }}/{{
                            gancho.potenciaMotorIzaje2 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                          Kw</span>
                      </v-col>
                      <v-col cols="12" md="3" class="d-flex align-center" v-else>
                        <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                          gancho.potenciaMotorIzaje }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                          Kw</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Tipo de freno</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.tipoFreno" :items="tipoFrenosList" density="compact" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1">Clasificación del gancho {{ n + 1 }} ISO</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-select v-model="gancho.clasificacion" :items="['M4', 'M5', 'M6', 'M7', 'M8']"
                      density="compact" />
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-checkbox v-model="gancho.frenoEmergencia" label="Freno emergencia" density="compact" />
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="text-body-1 font-weight-bold">Observaciones</label>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-textarea variant="outlined" v-model="gancho.observaciones" rows="2" density="compact" />
                  </v-col>
                  <v-col cols="12" md="12">
                    <div class="custom-divider" />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { dataAppService, mapCodigoConstruccionItems, normalizeDataAppRows } from '@/services/api';
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { roundDecimalOnBlur } from '@/utils/numericFieldZeroPlaceholder';

defineOptions({
  name: 'MecanismoIzaje'
})
const codigoConstruccionMap = ref({});
const store = useArticuloDefinicionesStore();
const tipoFrenosList = computed(() => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode)) return ['Freno Electromagnetico', 'Freno Cónico'];
  if (['ZVPE', 'ZHPE', 'ZKKE'].includes(store.articuloActual.itemCode)) return ['Freno electromagnético', 'Freno Cónico'];
  return ['Freno electromagnético', 'Freno electrohidraulico', 'Freno Cónico'];
});
const ganchoList = computed(() => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode)) return ['Polipasto de Cadena', 'Polipasto de Cable'];
  if (['ZVPE', 'ZHPE', 'ZKKE'].includes(store.articuloActual.itemCode)) return ['Polipasto de Cadena', 'Polipasto de Cable'];
  return ['Polipasto', 'Malacate'];
})
function filterItemsFunction(tipo) {
  return store.tipoPolipasto?.filter(item => item.itmsGrpNam === `Poli${tipo}`).map(item => item.itemName) || []
}

const loadingRef = ref({});
async function getCodigoConstruccion(ganchoType, index) {
  if (!ganchoType) return;
  const currentItemCode = (store.articuloActual.itemCode || "").trim().toUpperCase();
  loadingRef.value = { ...loadingRef.value, [index]: true };
  try {
    const isSpecial = ['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE', 'ZVPE', 'ZHPE', 'ZKKE', 'ZKKW'].some(code => currentItemCode.includes(code));
    
    let response;
    if (isSpecial) {
      const groupCode = (ganchoType || "").includes('Cadena') ? '436' : '433';
      response = await dataAppService.getCodigoConstruccion(groupCode);
      
      // Fallback si la consulta especial no devuelve nada
      if (normalizeDataAppRows(response?.data).length === 0) {
        const fallbackType = (ganchoType === 'Polipasto' || (ganchoType || "").includes('Cable') || (ganchoType || "").includes('Cadena')) ? '2' : '9';
        response = await dataAppService.getTipoRuedas(fallbackType);
      }
    } else {
      const tipo = (ganchoType === 'Polipasto' || (ganchoType || "").includes('Cable') || (ganchoType || "").includes('Cadena')) ? '2' : '9';
      response = await dataAppService.getTipoRuedas(tipo);
    }

    const rows = normalizeDataAppRows(response?.data);
    const items = mapCodigoConstruccionItems(rows);
    codigoConstruccionMap.value = { ...codigoConstruccionMap.value, [index]: items };
  } catch (error) {
    console.error("Error fetching construction codes:", error);
  } finally {
    loadingRef.value = { ...loadingRef.value, [index]: false };
  }
}

onMounted(() => {
  store.izaje.polipastos.forEach((gancho, index) => {
    if (gancho.gancho) {
      getCodigoConstruccion(gancho.gancho, index);
    }
  });
});

// Watch para cuando se cargan los datos de una cotización existente
watch(() => store.izaje.polipastos, (newPolipastos) => {
  if (newPolipastos && newPolipastos.length > 0) {
    newPolipastos.forEach((gancho, index) => {
      // Solo cargar si no tenemos ya los códigos para este índice o si el gancho cambió
      if (gancho.gancho && !codigoConstruccionMap.value[index]) {
        getCodigoConstruccion(gancho.gancho, index);
      }
    });
  }
}, { deep: true });
</script>
