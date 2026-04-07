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
      <v-card v-for="(gancho, n) in store.izaje.polipastos" :key="n" flat>
        <v-card-title class="d-flex align-center">
          <span>Gancho {{ n + 1 }}</span>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text flat>
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Capacidad de Gancho</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field v-model="gancho.capacidadGancho" type="number" min="0"
                :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 kg" suffix="kg" density="compact"
                @input="() => gancho.capacidadGanchoToneladas = gancho.capacidadGancho / 1000"
                :hint="gancho.capacidadGanchoToneladas + ' toneladas'" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Izaje Gancho</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field v-model="gancho.izajeGancho" type="number" min="0"
                :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact" />
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
              <v-text-field v-model="gancho.intermitencia" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Izaje con o sin desplazamiento lateral</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="gancho.izajeConSinDesplazamientoLateral"
                :items="['Con desplazamiento lateral', 'Sin desplazamiento lateral']" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Gancho</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="gancho.gancho" :items="ganchoList" density="compact"
                @update:model-value="getCodigoContruccion(gancho.gancho)" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Código de construcción</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-combobox v-model="gancho.codigoContruccion1" :items="codigoContruccion" item-value="itemCode"
                density="compact" />
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
                  <label class="text-body-1">Velocidad de Izaje Gancho</label>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field v-model="gancho.velIzaje1" type="number" step="0.01" min="0"
                    :rules="[v => v >= 0 || 'No se permite negativos']" :label="`Vel.(m) ${n + 1}`" density="compact" />
                </v-col>
                <v-col cols="12" md="1" class="d-flex justify-center" no-gutters>
                  <span class="text-center text-h3">{{ gancho.control === 'Contactores / Dos velocidades' ? '/' : '-'
                  }}</span>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field v-model="gancho.velIzaje2" type="number" step="0.01" min="0"
                    :rules="[v => v >= 0 || 'No se permite negativos']" :label="`Vel. (min) ${n + 1}`"
                    density="compact" />
                </v-col>
                <v-col cols="12" md="3" class="d-flex" v-if="gancho.velIzaje1 && gancho.velIzaje2">
                  <div class="text-h5 font-weight-small text-center mr-2">{{
                    gancho.velIzaje1 }}{{ gancho.control === 'Contactores / Dos velocidades' ? '/' : '-' }}{{
                      gancho.velIzaje2 }}</div> <span class="text-h5 font-weight-small text-center">
                    m/min</span>
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
                :items="['220 V/60 Hz', '440 V/60 Hz', '460 V/60 Hz', '480 V/60 Hz', 'Otro']" density="compact" />
            </v-col>
            <template v-if="gancho.voltajeOperacion === 'Otro'">
              <v-col cols="12" md="4" class="d-flex align-center">
                <label class="text-body-1">Especifique voltaje de operación</label>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="gancho.voltajeOperacionOtro" density="compact" />
              </v-col>
            </template>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Potencia motor de izaje</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field v-model="gancho.potenciaMotorIzaje" density="compact" type="number" min="0"
                :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 Kw" suffix="Kw" />
            </v-col>
            <template v-if="gancho.velIzaje1 == 1.2 && gancho.velIzaje2 == 4.8">
              <v-col cols="12" md="4" class="d-flex align-center">
                <label class="text-body-1">Potencia motor de izaje 2</label>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="gancho.potenciaMotorIzaje2" density="compact" type="number" min="0"
                  :rules="[v => v >= 0 || 'No se permite negativos']" />
              </v-col>
            </template>
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
              <v-select v-model="gancho.clasificacion" :items="['M4', 'M5', 'M6', 'M7', 'M8']" density="compact" />
            </v-col>
            <v-col cols="12" md="12">
              <v-checkbox v-model="gancho.frenoEmergencia" label="Freno emergencia" density="compact" />
            </v-col>
            <v-col cols="12" md="12">
              <div class="custom-divider" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1 font-weight-bold">Observaciones</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-textarea variant="outlined" v-model="gancho.observaciones" rows="2" density="compact" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { dataAppService } from '@/services/api';
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';

defineOptions({
  name: 'MecanismoIzaje'
})
const codigoContruccion = ref([]);
const store = useArticuloDefinicionesStore();
const tipoFrenosList = computed(() => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode)) return ['Freno Electromagnetico', 'Freno Cónico'];
  if (['ZVPE', 'ZHPE', 'ZKKE'].includes(store.articuloActual.itemCode)) return ['Freno electromagnético', 'Freno Cónico'];
  return ['Freno electromagnético', 'Freno Hidraulico', 'Freno Cónico'];
});
const ganchoList = computed(() => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode)) return ['Polipasto de Cadena', 'Polipasto de Cable'];
  if (['ZVPE', 'ZHPE', 'ZKKE'].includes(store.articuloActual.itemCode)) return ['Polipasto de Cadena', 'Polipasto de Cable'];
  return ['Polipaste', 'Malacate'];
})
function filterItemsFunction(tipo) {
  return store.tipoPolipasto?.filter(item => item.itmsGrpNam === `Poli${tipo}`).map(item => item.itemName) || []
}

async function getCodigoContruccion(ganchoType) {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE', 'ZVPE', 'ZHPE', 'ZKKE'].includes(store.articuloActual.itemCode)) {
    const tipo = ganchoType === 'Polipasto de Cadena' ? '436' : '433';
    codigoContruccion.value = await (await dataAppService.getCodigoContruccion(tipo)).data.map((item) => item.itemCode);
  } else {
    const tipo = ganchoType === 'Malacate' ? '9' : '2';
    codigoContruccion.value = await (await dataAppService.getTipoRuedas(tipo)).data.map((item) => item.itemCode);
  }
}
</script>
