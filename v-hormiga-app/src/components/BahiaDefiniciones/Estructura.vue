<template>
  <v-card class="mb-4" outlined v-if="store.bahiaActual.estructura">
    <v-card-title>Estructura</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Cantidad de lotes requeridos</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.estructura.lotesRequeridos" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact"
            @focus="clearZeroOnFocus(store.estructura, 'lotesRequeridos')"
            @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'lotesRequeridos')" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.estructura.trabeCarril" label="Trabe carril" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.estructura.columnas" label="Columnas" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.estructura.mensula" label="Ménsula" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Cantidad de columnas (pza)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.estructura.cantidadColumnas" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="pza"
            @focus="clearZeroOnFocus(store.estructura, 'cantidadColumnas')"
            @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'cantidadColumnas')" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Distancia entre columnas (mm)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.estructura.distanciaColumnas" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="mm"
            @focus="clearZeroOnFocus(store.estructura, 'distanciaColumnas')"
            @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'distanciaColumnas')" />
        </v-col>
        <v-col cols="12" md="12">
          <v-radio-group v-model="store.estructura.montajeTrabeCarril" inline density="compact">
            <template v-slot:label>
              <div>Montaje de trabe carril</div>
            </template>
            <v-radio label="Sí" value="Y"></v-radio>
            <v-radio label="No" value="N"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Metros Lineales de trabe carril</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.estructura.metLinTraCarril" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="m"
            @focus="clearZeroOnFocus(store.estructura, 'metLinTraCarril')"
            @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'metLinTraCarril')" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">NPT a NHR (aprox.) (mm)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.estructura.nptNhr" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" suffix="mm"
            @focus="clearZeroOnFocus(store.estructura, 'nptNhr')"
            @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'nptNhr')" />
        </v-col>
        <v-col cols="12" md="12">
          <v-radio-group v-model="store.estructura.pinturaEstructura" inline density="compact">
            <template v-slot:label>
              <div>Pintura de estructura</div>
            </template>
            <v-radio label="Sí" value="Y"></v-radio>
            <v-radio label="No" value="N"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de pintura</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.estructura.tipoPintura"
            :items="['Estandar SHOSA', 'Estandar SHOSA con sandblast', 'Otra con sandblast', 'Otra']"
            density="compact" />
        </v-col>
        <template
          v-if="store.estructura.tipoPintura === 'Otra con sandblast' || store.estructura.tipoPintura === 'Otra'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Tipo y codigo de pintura</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.estructura.tipoCodigoPintura" type="number" min="0"
              :rules="[v => v >= 0 || 'No se permite negativos']" density="compact"
              @focus="clearZeroOnFocus(store.estructura, 'tipoCodigoPintura')"
              @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'tipoCodigoPintura')" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Color de pintura (RAL)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.estructura.colorPintura" type="number" min="0" :rules="[
            v => !isNaN(Number(v)) || 'Solo se permiten números',
            v => v >= 0 || 'No se permite negativos'
          ]" density="compact" suffix="RAL"
            @focus="clearZeroOnFocus(store.estructura, 'colorPintura')"
            @blur="restoreZeroIfEmptyOnBlur(store.estructura, 'colorPintura')" />
        </v-col>
        <v-col cols="12" md="12">
          <v-radio-group v-model="store.estructura.fijacionColumnas" inline density="compact">
            <template v-slot:label>
              <div>Fijacion de columnas</div>
            </template>
            <v-radio label="SHOSA" value="SHOSA"></v-radio>
            <v-radio label="Cliente" value="Cliente"></v-radio>
          </v-radio-group>
        </v-col>


        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.estructura.observaciones" placeholder="Observaciones..."
            rows="2" maxlength="250" counter="250" density="compact" />
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
