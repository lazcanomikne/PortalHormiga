<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-data-table :headers="headers" :items="store.selectedArticles" class="elevation-2" hide-default-footer
      density="compact" no-data-text="Sin artículos agregados">
      <template #item.bahia="{ item }">
        <v-combobox v-model="item.bahia" :items="storeBahias.getBahiasList" density="compact" hide-details />
      </template>
      <template #item.definiciones="{ item }">
        <div class="d-flex align-center gap-2">
          <v-chip :color="item.definiciones && hasDefinicionesCompletas(item.definiciones) ? 'success' : 'warning'"
            size="small" variant="outlined">
            {{ item.definiciones && hasDefinicionesCompletas(item.definiciones) ? 'Completas' : 'Pendientes' }}
          </v-chip>
          <v-btn flat small icon @click="showDefiniciones(item)">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </template>
      <template #item.resumen="{ item }">
        <div v-if="item.definiciones && item.definiciones.datosBasicos" class="text-caption">
          <div><strong>Capacidad:</strong> {{ item.definiciones.datosBasicos.capacidadGrua || 0 }} kg</div>
          <div><strong>Claro:</strong> {{ item.definiciones.datosBasicos.claro || 0 }} mm</div>
          <div><strong>Izaje:</strong> {{ item.definiciones.datosBasicos.izaje || 0 }} mm</div>
        </div>
        <div v-else class="text-caption text-grey">
          Sin definiciones
        </div>
      </template>
      <!-- <template #item.price="{ item }">
        {{ $filters.currency(item.price) }}
        <v-btn flat small icon @click="showPrice(item)">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </template> -->
      <template #item.actions="{ index, item }">
        <v-tooltip :text="`Borrar articulo ${item.itemCode}`" location="top">
          <template #activator="{ props }">
            <v-btn icon="mdi-delete" variant="text" small flat v-bind="props" color="error"
              @click="removeArticle(index)">
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <template #item.qty="{ item }">
        <v-text-field type="number" :rules="[v => v > 0 || 'No puede ingresar valores negativos']" min="1" hide-details
          v-model="item.qty" density="compact" @update:model-value="v => { if (+v < 0) item.qty = 1 }" />
      </template>
    </v-data-table>
    <v-btn class="mt-2" color="primary" @click="() => (dialog = true)">Agregar grúa</v-btn>
    <!--
    Modal para agregar grúa con una tabla de articulos que viene de la api
    -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title>Agregar grúa</v-card-title>
        <v-card-text>
          <v-data-table v-model="selectedItem" :headers="headersTablaArticulos" :items="store.articles"
            :search="searchArticulo" class="elevation-2" disable-sort item-key="itemCode" fixed-header
            select-strategy="single" return-object show-select @update:model-value="addArticle" density="compact">
            <template v-slot:top>
              <v-banner sticky icon="search" flat>
                <v-text-field v-model="searchArticulo" label="Buscar articulo" class="mx-4" density="compact" />
              </v-banner>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { useArticlesStore } from '@/stores/useArticlesStore'
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore'
import { useBahiasStore } from '@/stores/useBahiasStore'
import { usePrecioVentaStore } from '@/stores/usePrecioVentaStore'
import { useRouter } from 'vue-router'

const store = useArticlesStore()
const storeBahias = useBahiasStore()
const storeArticuloDefiniciones = useArticuloDefinicionesStore()
const storePrecioVenta = usePrecioVentaStore()
const selectedItem = ref(null)
const router = useRouter()
const dialog = ref(false)
const searchArticulo = ref('')

const headersTablaArticulos = [
  { title: 'Codigo', value: 'itemCode' },
  { title: 'Nombre de Grúa', value: 'itemName' },
]

const headers = [
  { title: '', value: 'actions', sortable: false },
  { title: 'Código de Grúa', value: 'itemCode' },
  { title: 'Nombre de Grúa', value: 'itemName' },
  { title: 'Cantidad', value: 'qty' },
  { title: 'Asignar Bahía', value: 'bahia' },
  { title: 'Definiciones', value: 'definiciones', sortable: false },
  { title: 'Resumen', value: 'resumen', sortable: false }
]

onMounted(async () => {
  await store.loadArticle()
})

function addArticle (item) {
  store.addArticle(item[0])
  selectedItem.value = null
  dialog.value = false
}

function removeArticle (index) {
  store.removeArticle(index)
}

// Navegación usando Store State (Alternativa 4)
function showDefiniciones (item) {

  // 1. Establecer el artículo en el store de definiciones
  storeArticuloDefiniciones.navegarADefiniciones(item)

  // 2. Navegar a la página
  router.push({ name: '/ArticuloDefiniciones' })

  console.log('Navegando a definiciones de grúa:', item)
}

function showPrice (item) {
  // 1. Establecer el artículo en el store de precio de venta
  storePrecioVenta.navegarAPrecioVenta(item)

  // 2. Navegar a la página
  router.push({ name: '/PrecioVenta' })

  console.log('Navegando a precio de venta:', item)
}

// Función para verificar si las definiciones están completas
function hasDefinicionesCompletas (definiciones) {
  if (!definiciones) return false

  // Verificar que al menos los datos básicos estén completos
  const datosBasicos = definiciones.datosBasicos
  return datosBasicos &&
    datosBasicos.capacidadGrua > 0 &&
    datosBasicos.claro > 0 &&
    datosBasicos.izaje > 0
}
</script>
