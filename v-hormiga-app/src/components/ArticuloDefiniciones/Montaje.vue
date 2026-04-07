<template>
  <v-card class="mb-4" id="montaje" aria-label="Montaje" flat>
    <v-card-title>Montaje</v-card-title>
    <v-card-text v-if="store.articuloActual.itemCode !== 'KBK'">
      <v-row>
        <!-- Campos booleanos -->
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.gruaMontaje" label="Grúa" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.pruebasCargaMontaje" label="Pruebas de carga" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.alimentacionElectricaMontaje" label="Alimentación eléctrica"
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.rielMontaje" label="Riel" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.estructuraMontaje" label="Estructura" density="compact" />
        </v-col>
      </v-row>

      <div class="custom-divider" />
      <h4 class="mb-2">Accesorios para montaje</h4>

      <!-- Campos de catálogo -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Grúas móviles</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.montaje.gruasMoviles" :items="['SHOSA', 'Cliente']" density="compact"
            :rules="[v => !!v || 'Campo obligatorio']" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Plataforma de elevación para trabajos en altura (Genie)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.montaje.plataformaElevacionGeny" :items="['SHOSA', 'Cliente']" density="compact"
            :rules="[v => !!v || 'Campo obligatorio']" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Línea de vida</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.montaje.lineaVida" :items="['SHOSA', 'Cliente', 'Sin linea de vida']" density="compact"
            :rules="[v => !!v || 'Campo obligatorio']" />
        </v-col>
      </v-row>


      <!-- Campo de observaciones -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.montaje.observaciones" rows="3" density="compact"
            :rules="[v => !v || v.length <= 250 || 'Máximo 250 caracteres']" counter="250" />
        </v-col>
      </v-row>

      <div class="custom-divider" />

      <!-- Botón "Copiar datos a..." (condicional) -->
      <v-row v-if="mostrarBotonCopiar">
        <v-col cols="12" md="12">
          <v-btn color="primary" variant="outlined" @click="copiarDatos" class="mt-2">
            <v-icon left>mdi-content-copy</v-icon>
            Copiar datos a...
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-else>
      <v-row>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.gruaMontaje" label="Grúa" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.montaje.pruebasCargaMontaje" label="Pruebas de carga" density="compact" />
        </v-col>
        <h4 class="mb-2">Accesorios para montaje</h4>
      </v-row>
      <!-- Campos de catálogo -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Grúas móviles</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.montaje.gruasMoviles" :items="['SHOSA', 'Cliente']" density="compact"
            :rules="[v => !!v || 'Campo obligatorio']" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Plataforma de elevación para trabajos en altura (Genie)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.montaje.plataformaElevacionGeny" :items="['SHOSA', 'Cliente']" density="compact"
            :rules="[v => !!v || 'Campo obligatorio']" />
        </v-col>
      </v-row>
      <!-- Campo de observaciones -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.montaje.observaciones" rows="3" density="compact"
            :rules="[v => !v || v.length <= 250 || 'Máximo 250 caracteres']" counter="250" />
        </v-col>
      </v-row>
      <div class="custom-divider" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { computed } from 'vue';

defineOptions({
  name: 'Montaje'
});

const store = useArticuloDefinicionesStore();

// Computed para mostrar el botón "Copiar datos a..." si hay más de una grúa del mismo modelo
const mostrarBotonCopiar = computed(() => {
  // Esta lógica se puede implementar según las reglas de negocio específicas
  // Por ejemplo, si hay múltiples grúas del mismo modelo
  return false; // Por ahora deshabilitado, se puede habilitar según necesidades
});

function copiarDatos() {
  // Implementar lógica para copiar datos a otras grúas del mismo modelo
  console.log('Copiar datos a otras grúas del mismo modelo');
}
</script>

<style scoped>
/* Estilos específicos para este componente si son necesarios */
</style>
