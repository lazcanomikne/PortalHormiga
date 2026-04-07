<template>
  <v-row no-gutters>
    <v-col cols="12" md="4" class="d-flex align-center">
      <label class="text-body-1">Tipo de Control</label>
    </v-col>
    <v-col cols="12" md="8">
      <v-select v-model="control.tipoControl" :items="catalogoTipoControl()" density="compact" />
    </v-col>
    <template v-if="['Botonera', 'Radio control'].includes(control.tipoControl)">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">{{ control.tipoControl }}</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-select v-model="control.medioControl" :items="catalogoMediosControl[control.tipoControl]"
          density="compact" />
      </v-col>
    </template>
    <template v-if="control.tipoControl === 'Cabina'">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique funciones de la cabina para la grúa, fabricante / modelo de silla y
          consola de mando</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.funcionesCabina" density="compact" />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Tipo de Cabina</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-select v-model="control.tipoCabina" :items="catalogoTipoCabina" density="compact" />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique características técnicas de cabina (vidrios, dimensión, acceso,
          etc.)</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.caracteristicasTecnicasCabina" density="compact" />
      </v-col>
    </template>
    <template v-if="control.tipoControl === 'Automático'">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique funciones de la automatización para la grúa</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.funcionesAutomatizacion" density="compact" />
      </v-col>
    </template>
    <template v-if="control.tipoControl === 'Semiautomático'">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique funciones de la semiautomatización para la grúa</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.funcionesSemiautomatizacion" density="compact" />
      </v-col>
    </template>
    <template v-if="control.tipoControl === 'PLC'">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique marca / modelo, funciones, lenguaje</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.marcaModeloPLC" density="compact" />
      </v-col>
    </template>
    <template v-if="control.tipoControl === 'HMI'">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique marca / modelo, funciones</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.marcaModeloHMI" density="compact" />
      </v-col>
    </template>
    <template v-if="control.medioControl === 'Otro'">
      <v-col cols="12" md="4" class="d-flex align-center">
        <label class="text-body-1">Especifique fabricante y modelo</label>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field v-model="control.fabricanteModelo" density="compact" />
      </v-col>
    </template>
    <v-col cols="12" md="4" class="d-flex align-center">
      <label class="text-body-1 font-weight-bold">Observaciones</label>
    </v-col>
    <v-col cols="12" md="8">
      <v-textarea variant="outlined" v-model="control.observaciones" rows="2"
        placeholder="Este texto aparece en Control/operación" density="compact" />
    </v-col>
  </v-row>
</template>


<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';

const store = useArticuloDefinicionesStore();
const props = defineProps({
  control: {
    type: Object,
    required: true
  },
});
const catalogoTipoControl = () => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode))
    return [
      "Botonera",
      "Radio control",
      "PLC",
      "Cabina"
    ]
  if (["ZKKE", "ZHPE", "ZVPE"].includes(store.articuloActual.itemCode)) {
    return [
      "Botonera",
      "Radio control",
      "Cabina",
      "PLC"
    ]
  }
  return [
    "Botonera",
    "Radio control",
    "Cabina",
    "Automático",
    "Semiautomático",
    "PLC",
    "HMI"
  ]
}
const catalogoMediosControl = {
  "Botonera": [
    "Botonera de mando DEMAG deslizante a lo largo del puente",
    "Botonera Fija en un extremo",
    "Botonera suspendida del carro",
    "Otro"
  ],
  "Radio control": [
    "Radio control DEMAG DRC-10",
    "Otro"
  ],
  "Cabina": [
    "Cabina fija",
    "Cabina móvil junto con el carro",
    "Cabina móvil independiente al carro",
    "Otro"
  ],
}
const catalogoTipoCabina = [
  "Cabina fija",
  "Cabina móvil junto con el carro",
  "Cabina móvil independiente al carro",
  "Otro"
]
</script>
