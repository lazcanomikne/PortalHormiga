<template>
  <v-card class="mb-4" outlined v-if="store.bahiaActual.riel">
    <v-card-title>Riel</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de riel (m)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.riel.tipoRiel" :items="['ASCE', 'Burbach', 'Cuadrado', 'Rectangular', 'Otros']"
            density="compact" />
        </v-col>
        <template v-if="store.riel.tipoRiel">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique tipo de riel</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.riel.especifiqueTipoRiel" maxlength="50" counter="50" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Metros lineales de riel</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.riel.metrosLinealesRiel" type="number" suffix="m" maxlength="50" counter="50"
            density="compact"
            @focus="clearZeroOnFocus(store.riel, 'metrosLinealesRiel')"
            @blur="restoreZeroIfEmptyOnBlur(store.riel, 'metrosLinealesRiel')" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Calidad/Material riel según EN10025</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.riel.calidadMaterialRiel" :items="['S35555J2+N', 'Otro']" density="compact" />
        </v-col>
        <template v-if="store.riel.calidadMaterialRiel === 'Otro'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique Calidad/Material de riel</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.riel.especifiqueCalidadMaterialRiel" maxlength="50" counter="50"
              density="compact" />
          </v-col>
        </template>

        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.riel.observaciones" placeholder="Observaciones..." rows="2"
            maxlength="250" counter="250" density="compact" />
        </v-col>
        <v-col cols="12">
          <div class="custom-divider" />
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useBahiaDefinicionesStore } from '@/stores/useBahiaDefinicionesStore';
import {
  clearZeroOnFocus,
  restoreZeroIfEmptyOnBlur,
} from '@/utils/numericFieldZeroPlaceholder';

const store = useBahiaDefinicionesStore();
</script>
