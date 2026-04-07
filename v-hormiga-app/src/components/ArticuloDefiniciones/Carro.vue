<template>
  <v-card class="mb-4" id="carro" aria-label="Carro" flat>
    <v-card-title class="d-flex align-center">
      <span>Carro</span>
      <v-spacer></v-spacer>
    </v-card-title>
    <v-card-text>
      <!-- Cantidad de carros -->
      <v-row v-if="cantidadCarros > 1">
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Cantidad de carros</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.carro.cantidadCarros" :items="[1, 2, 3]" density="compact" />
        </v-col>
      </v-row>

      <!-- Control simultaneo o independiente (solo si hay más de 1 carro) -->
      <v-row v-if="store.carro.cantidadCarros > 1">
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Control de carros</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.carro.controlSimultaneoIndependiente"
            :items="['Control simultaneo', 'Control independiente']" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.carro.switchLimite2PasosIzquierdo" label="Interruptor limite de 2 pasos izquierdo"
            density="compact" />
          <v-checkbox v-model="store.carro.interruptorLimite2PasosDerechos"
            label="Interruptor limite de 2 pasos derechos" density="compact" />
        </v-col>
      </v-row>
      <!-- Carros dinámicos -->
      <v-row>
        <v-col cols="12" md="12">
          <v-expansion-panels>
            <v-expansion-panel v-for="(carro, n) in carrosArray" :key="n">
              <v-expansion-panel-title>
                <span class="text-h6 text-weight-medium">Carro {{ n + 1 }}</span>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-delete" variant="text" color="error" density="compact" @click="eliminarCarro(n)"
                  :title="`Eliminar carro`"></v-btn>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card class="mb-4" flat>
                  <v-card-text>
                    <v-row>
                      <!-- Control carro -->
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Control carro</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-select v-model="carro.control"
                          :items="['Contactores / Dos velocidades', 'Inversor / Velocidad variable']"
                          density="compact" />
                      </v-col>

                      <!-- Velocidad de carro -->
                      <v-col cols="12" md="12">
                        <v-row>
                          <v-col cols="12" md="4" class="d-flex align-center">
                            <label class="text-body-1">Velocidad de carro</label>
                          </v-col>
                          <v-col cols="12" :md="carro.control == 'Contactores / Dos velocidades' ? 2 : 5">
                            <v-text-field v-model="carro.velocidad1" type="number" step="0.01" min="0" @focus="$event.target.select()"
                              :rules="[v => v >= 0 || 'No se permite negativos']"
                              :label="carro.control == 'Contactores / Dos velocidades' ? 'Vel. m/min' : 'Vel. m-min'"
                              density="compact" />
                          </v-col>
                          <v-col v-if="carro.control == 'Contactores / Dos velocidades'" cols="12" md="1"
                            class="d-flex justify-center" no-gutters>
                            <span class="text-center text-subtitle-1 font-weight-bold">{{ carro.control == 'Contactores / Dos velocidades' ? '/'
                              : '-' }}</span>
                          </v-col>
                          <v-col cols="12" md="2" v-if="carro.control == 'Contactores / Dos velocidades'">
                            <v-text-field v-model="carro.velocidad2" type="number" step="0.01" min="0" @focus="$event.target.select()"
                              :rules="[v => v >= 0 || 'No se permite negativos']" label="Vel. m/min"
                              density="compact" />
                          </v-col>
                          <v-col cols="12" md="3" class="d-flex align-center"
                            v-if="carro.control == 'Contactores / Dos velocidades'">
                            <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                              carro.velocidad1 }}{{ carro.control == 'Contactores / Dos velocidades' ? '/' : '-'
                              }}{{
                                carro.velocidad2 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                              m/min</span>
                          </v-col>
                          <v-col cols="12" md="3" class="d-flex align-center" v-else>
                            <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                              carro.velocidad1 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                              m-min</span>
                          </v-col>
                        </v-row>
                      </v-col>

                      <!-- Tipo de inversor (solo si se selecciona Inversor) -->
                      <template v-if="carro.control === 'Inversor / Velocidad variable'">
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Tipo de Inversor</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-select v-model="carro.tipoInversor" :items="['DEMAG ACS 880', 'DEMAG DIC-4', 'Otro']"
                            density="compact" />
                        </v-col>
                      </template>

                      <!-- Velocidad de traslación -->
                      <template v-if="store.carro.cantidadCarros >= 1">
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Velocidad de traslación en m/min</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-select v-model="carro.velocidadTraslacion"
                            :items="['28.8/7.2 m/min', '7.58/30 m/min', '24/8 m/min', '1.05 - 31.5 m/min', 'Otra']"
                            density="compact" />
                        </v-col>
                      </template>

                      <!-- Especifique velocidad de traslación-->
                      <template v-if="carro.velocidadTraslacion === 'Otra'">
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Especifique velocidad de traslación</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="carro.especifiqueVelocidadTraslacion" density="compact"
                            suffix="m/min" />
                        </v-col>
                      </template>
                      <template v-if="!['ZKKE', 'ZHPE', 'ZVPE'].includes(store.articuloActual.itemCode)">
                        <!-- Cantidad de ruedas traslación -->
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Cantidad de ruedas traslación</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="carro.cantidadRuedasTraslacion" type="number" min="0" @focus="$event.target.select()"
                            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="piezas" />
                        </v-col>

                        <!-- Diámetro de ruedas -->
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Diámetro de ruedas (mm)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="carro.diametroRuedas" type="number" min="0" @focus="$event.target.select()"
                            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="mm" />
                        </v-col>

                        <!-- Tipo de rueda motriz (A) -->
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Cantidad de ruedas motriz (A)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="carro.cantidadTipoRuedaMotrizA" type="number" min="0" @focus="$event.target.select()"
                            density="compact" />
                        </v-col>
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Tipo de rueda motriz (A)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-combobox v-model="carro.tipoRuedaMotrizA" :items="store.tipoRuedas1" density="compact" />
                        </v-col>

                        <!-- Tipo de rueda conducida (MA) -->
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Cantidad de conducida (MA)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="carro.cantidadTipoRuedaConducidaMA" type="number" min="0" @focus="$event.target.select()"
                            density="compact" />
                        </v-col>
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Tipo de rueda conducida (MA)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-combobox v-model="carro.tipoRuedaConducidaMA" :items="store.tipoRuedas1"
                            density="compact" />
                        </v-col>

                        <!-- Tipo de rueda loca (NA) -->
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Cantidad de loca (NA)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="carro.cantidadTipoRuedaLocaNA" type="number" min="0" @focus="$event.target.select()"
                            density="compact" />
                        </v-col>
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1">Tipo de rueda loca (NA)</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-combobox v-model="carro.tipoRuedaLocaNA" :items="store.tipoRuedas2" density="compact" />
                        </v-col>
                      </template>
                      <!-- Material de ruedas
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Material de ruedas</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="carro.materialRuedas" density="compact" />
                      </v-col>-->

                      <!-- Motorreductor / Modelo -->
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Motorreductor / Modelo <b>{{ carro.cantidadTipoRuedaMotrizA > 0 ?
                          'x' + carro.cantidadTipoRuedaMotrizA : ''
                            }}</b></label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-combobox v-model="carro.motorreductorModelo" :items="store.motorreductor"
                          density="compact" />
                      </v-col>

                      <!-- Reductor -->
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Reductor</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="carro.reductor" density="compact" />
                      </v-col>

                      <!-- Motor / Modelo -->
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Motor / Modelo</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="carro.motorModelo" density="compact" />
                      </v-col>

                      <!-- Motor / potencia -->
                      <v-col cols="12" md="12">
                        <v-row>
                           <v-col cols="12" md="4" class="d-flex align-center">
                             <label class="text-body-1">Motor / Potencia (Kw)</label>
                           </v-col>
                           <v-col cols="12" :md="carro.control == 'Contactores / Dos velocidades' ? 2 : 5">
                             <v-text-field v-model="carro.motorPotencia1" type="number" step="0.01" min="0" @focus="$event.target.select()"
                               :rules="[v => v >= 0 || 'No se permite negativos']" :label="`Motor `" density="compact" />
                           </v-col>
                           <v-col v-if="carro.control == 'Contactores / Dos velocidades'" cols="12" md="1"
                             class="d-flex justify-center" no-gutters>
                             <span class="text-center text-subtitle-1 font-weight-bold">{{ carro.control == 'Contactores / Dos velocidades' ? '/'
                               : '-' }}</span>
                           </v-col>
                           <v-col cols="12" md="2" v-if="carro.control == 'Contactores / Dos velocidades'">
                             <v-text-field v-model="carro.motorPotencia2" type="number" step="0.01" min="0" @focus="$event.target.select()"
                               :rules="[v => v >= 0 || 'No se permite negativos']" :label="`potencia`"
                               density="compact" />
                           </v-col>
                           <v-col cols="12" md="3" class="d-flex align-center"
                             v-if="carro.control == 'Contactores / Dos velocidades'">
                             <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                               carro.motorPotencia1 }}{{ carro.control == 'Contactores / Dos velocidades' ? '/' : '-'
                               }}{{
                                 carro.motorPotencia2 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                               Kw</span>
                           </v-col>
                           <v-col cols="12" md="3" class="d-flex align-center" v-else>
                             <div class="text-subtitle-1 font-weight-bold text-center mr-2">{{
                               carro.motorPotencia1 }}</div> <span class="text-subtitle-1 font-weight-bold text-center">
                               Kw</span>
                           </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="12" md="12">
                        <div class="custom-divider" />
                      </v-col>
                      <v-col cols="12" md="12">
                        <label class="text-body-1 font-weight-bold">Accesorios</label>
                      </v-col>
                      <!-- Tope hidráulico -->
                      <v-col cols="12" md="12" v-if="showMe">
                        <v-checkbox v-model="carro.topeHidraulico" :label="`Tope hidráulico`" density="compact" />
                      </v-col>

                      <!-- Tope celulosa -->
                      <v-col cols="12" md="12">
                        <v-checkbox v-model="carro.topeCelulosa" :label="`Tope celulosa`" density="compact" />
                      </v-col>

                      <!-- Freno electrohidráulico -->
                      <v-col cols="12" md="12" v-if="showMe">
                        <v-checkbox v-model="carro.frenoElectrohidraulico" :label="`Freno electrohidráulico`"
                          density="compact" />
                      </v-col>

                      <v-col cols="12" md="12" v-if="showMe">
                        <v-checkbox v-model="carro.plataforma" :label="`Plataforma`" density="compact" />
                      </v-col>

                      <template v-if="carro.plataforma">
                        <v-col cols="12" md="4" class="d-flex align-center">
                          <label class="text-body-1 font-weight-bold">Observaciones plataforma</label>
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-textarea variant="outlined" v-model="carro.observacionesPlataforma" rows="2"
                            density="compact" />
                        </v-col>
                      </template>

                    </v-row>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
        <!-- Observaciones generales -->
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.carro.observaciones" rows="2" density="compact" />
        </v-col>
        <v-col cols="12">
          <div class="custom-divider" />
        </v-col>
      </v-row>

      <!-- Mensaje cuando no hay carros -->
      <v-alert v-if="carrosArray.length === 0" type="info" variant="tonal" class="mb-4">
        No hay carros configurados. Seleccione la cantidad de carros para comenzar.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { computed, defineProps, watch } from 'vue';

defineOptions({
  name: 'Carro'
})
const props = defineProps({
  cantidadCarros: {
    type: Number,
    required: true
  }
});
const store = useArticuloDefinicionesStore();
const showMe = computed(() => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode)) return false;
  if (["ZKKE", "ZHPE", "ZVPE"].includes(store.articuloActual.itemCode)) return false;
  return true;
});
// Computed para manejar el array de carros
const carrosArray = computed(() => {
  if (!store.carro.carros) {
    store.carro.carros = [];
  }
  return store.carro.carros;
});

// Watcher para actualizar la cantidad de carros
watch(() => store.carro.cantidadCarros, (newValue) => {
  if (newValue && newValue > 0) {
    // Inicializar array de carros si no existe
      // Inicializar array de carros si no existe
      if (!store.carro.carros) {
        store.carro.carros = [];
      }
      // Ajustar el array según la cantidad seleccionada
      const currentLength = store.carro.carros.length;
      const targetLength = newValue;

    if (targetLength > currentLength) {
      // Agregar carros faltantes
      for (let i = currentLength; i < targetLength; i++) {
        store.carro.carros.push({
          control: '',
          tipoInversor: '',
          velocidadTraslacion: '',
          especifiqueVelocidadTraslacion: '',
          interruptorFinalCarrera: '',
          especifiqueMarcaModeloInterruptor: '',
          cantidadRuedasTraslacion: 4, // Valor por defecto
          diametroRuedas: 0,
          tipoRuedaMotrizA: '',
          tipoRuedaConducidaMA: '',
          tipoRuedaLocaNA: '',
          materialRuedas: '30070', // Valor por defecto
          motorreductorModelo: '',
          reductor: '',
          motorModelo: '',
          motorPotencia1: 0,
          motorPotencia2: 0,
          velocidad1: 0,
          velocidad2: 0,
          topeHidraulico: false,
          topeCelulosa: false,
          frenoElectrohidraulico: false,
          plataforma: false,
          observacionesPlataforma: '',
          observaciones: ''
        });
      }
    } else if (targetLength < currentLength) {
      // Remover carros excedentes
      store.carro.carros = store.carro.carros.slice(0, targetLength);
    }
  }
}, { immediate: true });
watch(() => props.cantidadCarros, (newValue) => {
  if (newValue && newValue > 0) {
    store.carro.cantidadCarros = newValue;
  }
}, { immediate: true });
function eliminarCarro(index) {
  if (store.carro.carros && store.carro.carros.length > index) {
    store.carro.carros.splice(index, 1);
    store.carro.cantidadCarros = store.carro.carros.length;
  }
}
</script>
