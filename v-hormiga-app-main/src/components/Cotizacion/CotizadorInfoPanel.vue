<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-text-field label="Folio Portal" v-model="info.folioPortal" density="compact" readonly />
    <v-text-field label="Folio SAP" v-model="info.folioSAP" density="compact" readonly />
    <v-text-field type="date" label="Fecha" v-model="info.fecha" density="compact" />
    <v-text-field type="date" label="Vencimiento" v-model="info.vencimiento" density="compact" />
    <v-select label="Moneda" v-model="info.moneda" :items="monedas" density="compact" />
    <v-combobox label="Vendedor principal" v-model="info.vendedor" :items="vendedores" item-title="slpName"
      return-object density="compact" />
    <v-combobox label="Vendedor secundario" v-model="info.vendedorSec" :items="vendedores" item-title="slpName"
      return-object density="compact" />
  </v-card>
</template>

<script setup>
import { useCotizadorFormStore } from '@/stores/useCotizadorFormStore'
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore'
const store = useCotizadorFormStore()
const info = store.form
const monedas = ['Seleccionar..', 'MXN', 'US$', 'EUR']
const storeArticuloDefiniciones = useArticuloDefinicionesStore()
const vendedores = storeArticuloDefiniciones.vendedores
</script>
