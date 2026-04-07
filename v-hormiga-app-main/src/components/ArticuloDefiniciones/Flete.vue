<template>
  <v-card class="mb-4" id="flete" aria-label="Flete" flat>
    <v-card-title>Flete</v-card-title>
    <v-card-text>
      <v-row v-if="store.articuloActual.itemCode !== 'KBK'">
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.flete.fletePorParteShosa" label="Flete por parte de SHOSA" density="compact" />
        </v-col>
        <!-- <v-col cols="12" md="12">
          <v-checkbox v-model="store.flete.gruaFlete" label="Grúa" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.flete.alimentacionElectrica" label="Alimentación eléctrica" density="compact" />
        </v-col> -->

        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.flete.observaciones" rows="2" density="compact" />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.flete.gruaFlete" label="Grúa" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.flete.observaciones" rows="2" density="compact" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';

defineOptions({
  name: 'Flete'
})

const store = useArticuloDefinicionesStore();
</script>
