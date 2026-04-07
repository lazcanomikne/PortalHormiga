<template>
  <v-card class="mb-4" outlined v-if="store.bahiaActual.alimentacion">
    <v-card-title>Alimentación</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.alimentacion.aliEleLarNave" label="Alimentación eléctrica a lo largo de la nave"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Longitud del sistema (m)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.alimentacion.longitudSistema" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="m" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">No. de acometidas eléctricas</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.alimentacion.acomElec" type="number" density="compact" suffix="pza" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Localización de acometida</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.alimentacion.localAcometida" :items="['Al centro', 'En un extremo', 'Otra']"
            density="compact" />
        </v-col>
        <template v-if="store.alimentacion.localAcometida === 'Otra'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique localización de acometida</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.alimentacion.localAcometidaOtro" density="compact" maxlength="150" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Amperaje (amp)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.alimentacion.amperaje" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" suffix="amp" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Temperatura (°C)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.alimentacion.temperatura" :items="['40', 'Otra']" density="compact" />
        </v-col>
        <template v-if="store.alimentacion.temperatura === 'Otra'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique temperatura</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.alimentacion.temperaturaOtro" density="compact" suffix="°C" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Adecuada para alimentar</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.alimentacion.adecuadaAlimentar" density="compact" maxlength="150" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.alimentacion.interruptorGeneral" label="Interruptor General" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de alimentación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.alimentacion.tipoAlimentacion"
            :items="['Barras', 'Encapsulada', 'Festoon / cable plano', 'Cadena porta cable', 'Carrete recuperador', 'Otros']"
            density="compact" />
        </v-col>
        <template v-if="store.alimentacion.tipoAlimentacion === 'Barras'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique área de trabajo</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-select v-model="store.alimentacion.especifiqueAreaTrabajo"
              :items="['Interior', 'Exterior', 'Polvoso', 'Polvoso explosivo', 'Otros']" density="compact" />
          </v-col>
        </template>
        <template v-if="store.alimentacion.tipoAlimentacion === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique alimentación</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.alimentacion.tipoAlimOtro" density="compact" maxlength="50" />
          </v-col>
        </template>
        <!-- <v-col cols="12" md="12">
          <v-divider thickness="2" opacity="1" color="primary" class="my-2" />
          <span class="text-h6">Sistema de alimentación Festoon</span>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Especifique sistema de alimentación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.alimentacion.especifiqueSistemaAlimentacion" :items="['Ligero', 'Pesado', 'Otros']"
            density="compact" />
        </v-col> -->

        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.alimentacion.observaciones" placeholder="observaciones.."
            rows="2" density="compact" maxlength="250" counter="250" />
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useBahiaDefinicionesStore } from '@/stores/useBahiaDefinicionesStore';

const store = useBahiaDefinicionesStore();
</script>
