<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-text-field label="Folio Portal" v-model="store.form.folioPortal" density="compact" readonly />
    <v-text-field label="Folio SAP" v-model="store.form.folioSAP" density="compact" readonly />
    <v-text-field type="date" label="Fecha" v-model="store.form.fecha" density="compact" />
    <v-text-field type="date" label="Vencimiento" v-model="store.form.vencimiento" density="compact" />
    <v-select label="Moneda" v-model="store.form.moneda" :items="monedas" density="compact" />
    <v-autocomplete label="Vendedor principal" v-model="store.form.vendedor" :items="vendedores" item-title="slpName"
      item-value="slpCode" return-object density="compact" clearable no-data-text="No se encontraron vendedores"
      :loading="loadingVendedores" />
    <v-autocomplete label="Vendedor secundario" v-model="store.form.vendedorSec" :items="vendedores" item-title="slpName"
      item-value="slpCode" return-object density="compact" clearable no-data-text="No se encontraron vendedores"
      :loading="loadingVendedores" />
    <v-text-field label="Tiempo de Entrega" v-model="store.form.tiempoEntrega" density="compact" maxlength="50"
      counter="50" />
  </v-card>
</template>

<script setup>
import { useCotizadorFormStore } from '@/stores/useCotizadorFormStore'
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore'
import { dataAppService } from '@/services/api'
import { computed, onMounted, ref } from 'vue'

const store = useCotizadorFormStore()
// Eliminamos la referencia local 'const info = store.form' para no perder reactividad al resetear el store
const monedas = ['Seleccionar..', 'MXN', 'US$', 'EUR']
const loadingVendedores = ref(false)
const vendedores = ref([])

const loadVendedores = async () => {
  loadingVendedores.value = true
  try {
    const response = await dataAppService.getVendedores()
    vendedores.value = response.data
    console.log('Vendedores cargados:', vendedores.value)
  } catch (error) {
    console.error('Error al cargar vendedores:', error)
  } finally {
    loadingVendedores.value = false
  }
}

onMounted(async () => {
  await loadVendedores()
})
</script>
