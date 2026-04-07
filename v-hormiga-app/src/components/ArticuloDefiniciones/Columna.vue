<template>
  <v-card class="mb-4" id="columna" aria-label="Columna" flat>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tratamiento superficial para pilar</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.columna.tratamientoSuperficialPilar"
            :items="['Color estándar', 'Color personalizado', 'Hierro en blanco', 'Galvanizado en caliente']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Montaje</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.columna.montaje"
            :items="['Sin', 'Plantilla con varillas de anclaje', 'Placa intermedia para pernos de anclaje Chem mín. espesor del hormigón 170 mm', 'Placa intermedia para pernos de anclaje Chem mín. espesor del hormigón 140 mm']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Placa móvil</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.columna.placaMovil" :items="['Si', 'Sin']" density="compact" />
        </v-col>
      </v-row>
      <div class="custom-divider" />
      <v-card-title>Certificados</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Certificate according to EC machinery directive</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.columna.certificadoFabricacion" :items="['Pendiente SAP']" density="compact" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
const store = useArticuloDefinicionesStore();
</script>
