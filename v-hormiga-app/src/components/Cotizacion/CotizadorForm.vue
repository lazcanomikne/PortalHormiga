<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-form>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-select v-model="store.form.tipoCotizacion" :items="tiposCotizacion" label="Tipo de Cotización" required
            density="compact" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="store.form.tipoCuenta" :items="tiposCuenta" label="Tipo de Cuenta" required density="compact"
            @update:model-value="onTipoCuentaChange" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="store.form.idioma" :items="idiomas" label="Idioma Cotización" density="compact" />
        </v-col>
        <v-col cols="12" md="6">
          <v-combobox v-model="store.form.cliente" item-title="nombreCompleto" item-value="cardCode" :items="clientes"
            label="Cliente" required density="compact" @update:model-value="loadData" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="store.form.personaContacto" item-title="name" item-value="name" :items="personaContacto"
            label="Persona de Contacto" density="compact" :loading="loadingData" />
        </v-col>
        <v-col cols="12" md="12">
          <v-select v-model="store.form.direccionFiscal" item-title="dirFiscal" item-value="dirFiscal"
            :items="direccionFiscal" label="Dirección Fiscal" density="compact" :loading="loadingData" />
        </v-col>
        <v-col cols="12" md="12">
          <v-select v-model="store.form.direccionEntrega" item-title="dirEntrega" item-value="dirEntrega"
            :items="direccionEntrega" label="Dirección de Entrega" density="compact" :loading="loadingData"
            @update:model-value="loadDireccionEntrega" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="store.form.referencia" label="Referencia" placeholder="Capturar referencia..."
            density="compact" />
        </v-col>
        <v-col cols="12" md="6">
          <v-combobox v-model="store.form.terminosEntrega" item-value="trnspName" item-title="trnspName"
            :items="terminosEntrega" label="Términos de Entrega" density="compact" return-object />
        </v-col>
        <v-col cols="12" md="12">
          <v-text-field v-model="store.form.clienteFinal" label="Cliente Final" placeholder="Capturar cliente final..."
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-text-field v-model="store.form.ubicacionFinal" label="Ubicación Final" placeholder="Capturar ubicación final..."
            density="compact" />
        </v-col>
      </v-row>
    </v-form>
  </v-card>

  <!-- Modal para capturar datos del prospecto -->
  <ModalProspecto v-model="showModalProspecto" @prospecto-guardado="onProspectoGuardado" />
</template>

<script setup>
import { dataAppService } from '@/services/api'
import { notificationService } from '@/services/notification'
import { useCotizadorFormStore } from '@/stores/useCotizadorFormStore'
import { useProspectoStore } from '@/stores/useProspectoStore'
import { onMounted, ref, watch } from 'vue'
import ModalProspecto from './ModalProspecto.vue'

const store = useCotizadorFormStore()
const storeProspecto = useProspectoStore()
// Eliminamos la referencia local 'const form = store.form' para no perder reactividad al resetear el store
const loadingData = ref(false)
const showModalProspecto = ref(false)
const city = ref('')
const clientes = ref([])
const terminosEntrega = ref([])
const direccionFiscal = ref([])
const direccionEntrega = ref([])
const personaContacto = ref([])

/** El backend guarda el Code SAP (terminosEntrega / trnspCode); el combo muestra el texto U_TerminosEntrega (trnspName). */
function resolveTerminosEntregaSelection() {
  const list = terminosEntrega.value
  if (!list?.length) return
  const te = store.form.terminosEntrega
  if (te == null || te === '') return

  const code =
    typeof te === 'object' && te !== null ? te.trnspCode ?? te.TrnspCode : null
  const name =
    typeof te === 'object' && te !== null ? te.trnspName ?? te.TrnspName : null
  const rawStr = typeof te === 'string' ? te : null

  const found = list.find((t) => {
    const tc = t.trnspCode ?? t.TrnspCode
    const tn = t.trnspName ?? t.TrnspName
    if (code != null && code !== '') return String(tc) === String(code)
    if (name != null && name !== '') return tn === name
    if (rawStr != null && rawStr !== '')
      return String(tc) === String(rawStr) || tn === rawStr
    return false
  })
  if (found) store.form.terminosEntrega = found
}

const loadDireccionEntrega = async () => {
  // Con el nuevo formato estandarizado: Calle, Colonia, Ciudad, Estado, CP, Pais
  // La ciudad está en la posición 3 (índice 2)
  city.value = store.form.direccionEntrega.split(',')[2]?.trim() || ''
  terminosEntrega.value = await (await dataAppService.getTerminosEntrega()).data
  terminosEntrega.value.filter(item => item.trnspName.includes('(city)')).forEach(item => {
    item.trnspName = item.trnspName.replace('(city)', city.value)
  })

  resolveTerminosEntregaSelection()
}

watch(() => store.form.direccionEntrega, () => {
  loadDireccionEntrega()
})

const loadData = async () => {
  try {
    if ((typeof store.form.cliente) == 'object') {
      store.form.clienteFinal = store.form.cliente.nombreCompleto.split(' - ')[1] || ''
      loadingData.value = true
      direccionFiscal.value = await (await dataAppService.getDireccionFiscal(store.form.cliente.cardCode)).data
      direccionEntrega.value = await (await dataAppService.getDireccionEntrega(store.form.cliente.cardCode)).data
      personaContacto.value = await (await dataAppService.getPersonaContacto(store.form.cliente.cardCode)).data

      store.form.personaContacto = personaContacto.value[0].name
      store.form.direccionEntrega = direccionEntrega.value.find(p => p.tipo == "Principal").dirEntrega
      store.form.direccionFiscal = direccionFiscal.value.find(p => p.tipo == "Principal").dirFiscal
      loadDireccionEntrega()
    }
  } catch (error) {
    loadingData.value = false
  } finally {
    loadingData.value = false
  }
}


// Función para manejar el cambio en tipo de cuenta
const onTipoCuentaChange = (value) => {
  if (value === 'Prospecto') {
    showModalProspecto.value = true
  }
}

// Función para manejar cuando se guarda el prospecto
const onProspectoGuardado = (datosProspecto) => {
  console.log('Datos del prospecto guardados:', datosProspecto)

  // Crear un cliente temporal con los datos del prospecto
  const clienteTemporal = {
    cardCode: `PROSP_${Date.now()}`, // ID temporal para prospecto
    nombreCompleto: `${datosProspecto.empresa} (Prospecto)`,
    nombre: datosProspecto.empresa,
    esProspecto: true,
    datosProspecto: datosProspecto
  }

  // Agregar el cliente temporal a la lista de clientes
  clientes.value.push(clienteTemporal)

  // Seleccionar automáticamente el cliente temporal
  store.form.cliente = clienteTemporal

  // Limpiar campos que no aplican para prospectos
  store.form.personaContacto = `${datosProspecto.nombreContacto} ${datosProspecto.apellidoContacto}`
  // Formato estandarizado: Calle Numero, Colonia, Ciudad/Municipio, Estado, CP, Pais
  store.form.direccionFiscal = `${datosProspecto.calle} ${datosProspecto.numeroExterior}, ${datosProspecto.colonia}, ${datosProspecto.ciudadMunicipio}, ${datosProspecto.estado}, ${datosProspecto.codigoPostal}, MX`
  store.form.direccionEntrega = store.form.direccionFiscal

  console.log('Cliente temporal creado:', clienteTemporal)

  // Mostrar notificación de éxito
  notificationService.success(`Prospecto "${datosProspecto.empresa}" agregado exitosamente`)
}

onMounted(async () => {
  if (store.isEditMode && (typeof store.form.cliente) != 'object') {
    terminosEntrega.value = await (await dataAppService.getTerminosEntrega()).data
    clientes.value = await (await dataAppService.getClientes()).data
    store.form.cliente = clientes.value.find(x => x.cardCode === store.form.cliente)
    resolveTerminosEntregaSelection()
    await loadData()
    return;
  }
  terminosEntrega.value = await (await dataAppService.getTerminosEntrega()).data
  clientes.value = await (await dataAppService.getClientes()).data
  resolveTerminosEntregaSelection()
})
const tiposCotizacion = ['Seleccionar..', 'Refacciones / Servicios', 'Componentes', 'Grúas']
const tiposCuenta = ['Seleccionar..', 'Cliente', 'Prospecto']
const idiomas = ['Seleccionar..', 'Español', 'Inglés']

</script>
