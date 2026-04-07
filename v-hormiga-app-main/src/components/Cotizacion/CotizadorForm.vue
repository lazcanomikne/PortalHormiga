<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-form>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-select v-model="form.tipoCotizacion" :items="tiposCotizacion" label="Tipo de Cotización" required
            density="compact" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="form.tipoCuenta" :items="tiposCuenta" label="Tipo de Cuenta" required density="compact"
            @update:model-value="onTipoCuentaChange" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="form.idioma" :items="idiomas" label="Idioma Cotización" density="compact" />
        </v-col>
        <v-col cols="12" md="6">
          <v-combobox v-model="form.cliente" item-title="nombreCompleto" item-value="cardCode" :items="clientes"
            label="Cliente" required density="compact" @update:model-value="loadData" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.personaContacto" item-title="name" item-value="name" :items="personaContacto"
            label="Persona de Contacto" density="compact" :loading="loadingData" />
        </v-col>
        <v-col cols="12" md="12">
          <v-select v-model="form.direccionFiscal" item-title="dirFiscal" item-value="dirFiscal"
            :items="direccionFiscal" label="Dirección Fiscal" density="compact" :loading="loadingData" />
        </v-col>
        <v-col cols="12" md="12">
          <v-select v-model="form.direccionEntrega" item-title="dirEntrega" item-value="dirEntrega"
            :items="direccionEntrega" label="Dirección de Entrega" density="compact" :loading="loadingData"
            @update:model-value="loadDireccionEntrega" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.referencia" label="Referencia" placeholder="Capturar referencia..."
            density="compact" />
        </v-col>
        <v-col cols="12" md="6">
          <v-combobox v-model="form.terminosEntrega" item-value="trnspName" item-title="trnspName"
            :items="terminosEntrega" label="Términos de Entrega" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-text-field v-model="form.clienteFinal" label="Cliente Final" placeholder="Capturar cliente final..."
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-text-field v-model="form.ubicacionFinal" label="Ubicación Final" placeholder="Capturar ubicación final..."
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
const form = store.form
const loadingData = ref(false)
const showModalProspecto = ref(false)
const city = ref('')
const clientes = ref([])
const terminosEntrega = ref([])
const direccionFiscal = ref([])
const direccionEntrega = ref([])
const personaContacto = ref([])

const loadDireccionEntrega = async () => {
  city.value = form.direccionEntrega.split(',')[4]
  terminosEntrega.value = await (await dataAppService.getTerminosEntrega()).data
  terminosEntrega.value.filter(item => item.trnspName.includes('(city)')).forEach(item => {
    item.trnspName = item.trnspName.replace('(city)', city.value)
  })
}

watch(form.direccionEntrega, () => {
  loadDireccionEntrega()
})

const loadData = async () => {
  try {
    if ((typeof form.cliente) == 'object') {
      form.clienteFinal = form.cliente.nombreCompleto.split(' - ')[1] || ''
      loadingData.value = true
      direccionFiscal.value = await (await dataAppService.getDireccionFiscal(form.cliente.cardCode)).data
      direccionEntrega.value = await (await dataAppService.getDireccionEntrega(form.cliente.cardCode)).data
      personaContacto.value = await (await dataAppService.getPersonaContacto(form.cliente.cardCode)).data

      form.personaContacto = personaContacto.value[0].name
      form.direccionEntrega = direccionEntrega.value.find(p => p.tipo == "Principal").dirEntrega
      form.direccionFiscal = direccionFiscal.value.find(p => p.tipo == "Principal").dirFiscal
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
  form.cliente = clienteTemporal

  // Limpiar campos que no aplican para prospectos
  form.personaContacto = `${datosProspecto.nombreContacto} ${datosProspecto.apellidoContacto}`
  form.direccionFiscal = `${datosProspecto.calle} ${datosProspecto.numeroExterior}, ${datosProspecto.colonia}, ${datosProspecto.ciudadMunicipio}, ${datosProspecto.estado}`
  form.direccionEntrega = form.direccionFiscal

  console.log('Cliente temporal creado:', clienteTemporal)

  // Mostrar notificación de éxito
  notificationService.success(`Prospecto "${datosProspecto.empresa}" agregado exitosamente`)
}

onMounted(async () => {
  if (store.isEditMode && (typeof form.cliente) != 'object') {
    terminosEntrega.value = await (await dataAppService.getTerminosEntrega()).data
    clientes.value = await (await dataAppService.getClientes()).data
    form.cliente = clientes.value.find(x => x.cardCode === form.cliente)
    await loadData()
    return;
  }
  terminosEntrega.value = await (await dataAppService.getTerminosEntrega()).data
  clientes.value = await (await dataAppService.getClientes()).data
})
const tiposCotizacion = ['Seleccionar..', 'Refacciones / Servicios', 'Componentes', 'Grúas']
const tiposCuenta = ['Seleccionar..', 'Cliente', 'Prospecto']
const idiomas = ['Seleccionar..', 'Español', 'Inglés']

</script>
