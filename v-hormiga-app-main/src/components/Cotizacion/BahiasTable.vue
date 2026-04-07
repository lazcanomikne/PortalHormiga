<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-data-table :headers="headers" :items="store.selectedBahias" class="elevation-2" hide-default-footer
      density="compact" no-data-text="Sin bahías agregadas">
      <template #item.nombre="{ item }">
        <v-text-field variant="filled" hide-details v-model="item.nombre" density="compact" label="Nombre bahía" />
      </template>
      <template #item.alimentacion="{ item }">
        <v-checkbox v-model="item.alimentacion" hide-details density="compact" />
      </template>
      <template #item.riel="{ item }">
        <v-checkbox v-model="item.riel" hide-details density="compact" />
      </template>
      <template #item.estructura="{ item }">
        <v-checkbox v-model="item.estructura" hide-details density="compact" />
      </template>
      <template #item.definiciones="{ item, index }">
        <v-btn flat small icon @click="showDefiniciones(item, index)"
          :disabled="!item.riel && !item.alimentacion && !item.estructura">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </template>
      <template #item.actions="{ index }">
        <v-tooltip text="Eliminar bahía" location="top">
          <template #activator="{ props }">
            <v-btn variant="text" small flat icon v-bind="props" color="error" @click="removeBahia(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-btn class="mt-2" color="primary" @click="addBahia">Agregar bahía</v-btn>
  </v-card>
</template>

<script setup>
import { useBahiaDefinicionesStore } from '@/stores/useBahiaDefinicionesStore'
import { useBahiasStore } from '@/stores/useBahiasStore'
import { useRouter } from 'vue-router'

const store = useBahiasStore()
const storeBahiaDefiniciones = useBahiaDefinicionesStore()
const router = useRouter()

const headers = [
  { title: '', value: 'actions' },
  { title: 'Bahía', value: 'nombre' },
  { title: 'Alimentación', value: 'alimentacion' },
  { title: 'Riel', value: 'riel' },
  { title: 'Estructura', value: 'estructura' },
  { title: 'Definiciones', value: 'definiciones', sortable: false }
]

function addBahia () {
  store.addBahia()
}

function removeBahia (index) {
  store.removeBahia(index)
}

// Navegación usando Store State (Alternativa 4)
function showDefiniciones (item, index) {
  // 1. Establecer la bahía en el store de definiciones
  storeBahiaDefiniciones.navegarADefiniciones(item, index)

  // 2. Navegar a la página
  router.push({ name: '/BahiaDefiniciones' })

  console.log('Navegando a definiciones de bahía:', item, 'índice:', index)
}
</script>
