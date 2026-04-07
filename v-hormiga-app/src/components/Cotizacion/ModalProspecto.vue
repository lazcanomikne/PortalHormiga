<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Datos Prospecto
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid">
          <v-row dense>
            <!-- Empresa -->
            <v-col cols="12">
              <v-text-field
                v-model="prospecto.empresa"
                label="Empresa"
                required
                density="compact"
                :rules="[v => !!v || 'Empresa es requerida']"
              />
            </v-col>

            <!-- Referencia del Cliente y Giro de la empresa -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.referenciaCliente"
                label="Referencia del Cliente"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.giroEmpresa"
                label="Giro de la empresa"
                density="compact"
              />
            </v-col>

            <!-- Teléfono Contacto y RFC -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.telefonoContacto"
                label="Teléfono Contacto"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.rfc"
                label="RFC"
                density="compact"
              />
            </v-col>

            <!-- Dirección - Parte 1 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.calle"
                label="Calle"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.numeroInterior"
                label="Número Interior"
                density="compact"
              />
            </v-col>

            <!-- Dirección - Parte 2 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.numeroExterior"
                label="Número Exterior"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.colonia"
                label="Colonia"
                density="compact"
              />
            </v-col>

            <!-- Dirección - Parte 3 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.estado"
                label="Estado"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.ciudadMunicipio"
                label="Ciudad Municipio"
                density="compact"
              />
            </v-col>

            <!-- Código Postal y Vigencia -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.codigoPostal"
                label="Código Postal"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.vigencia"
                label="Vigencia"
                density="compact"
                type="date"
                prepend-inner-icon="mdi-calendar"
                clearable
              />
            </v-col>

            <!-- Impuesto IVA y Vendedor -->
            <v-col cols="12" md="6">
              <v-select
                v-model="prospecto.impuestoIva"
                :items="opcionesIva"
                label="Impuesto IVA"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.vendedor"
                label="Vendedor"
                density="compact"
              />
            </v-col>

            <!-- Nombre Contacto y Vendedor 2 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.nombreContacto"
                label="Nombre Contacto"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.vendedor2"
                label="Vendedor 2"
                density="compact"
              />
            </v-col>

            <!-- Apellido Contacto y Puesto de Contacto -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.apellidoContacto"
                label="Apellido Contacto"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="prospecto.puestoContacto"
                label="Puesto de Contacto"
                density="compact"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="outlined" @click="closeModal">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="guardarProspecto" :loading="loading">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useProspectoStore } from '@/stores/useProspectoStore'
import { notificationService } from '@/services/notification'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'prospecto-guardado'])

const store = useProspectoStore()
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const form = ref(null)

// Opciones para el campo de IVA
const opcionesIva = ['0%', '16%', 'Exento']

// Datos del prospecto
const prospecto = reactive({
  empresa: '',
  referenciaCliente: '',
  giroEmpresa: '',
  telefonoContacto: '',
  rfc: '',
  calle: '',
  numeroInterior: '',
  numeroExterior: '',
  colonia: '',
  estado: '',
  ciudadMunicipio: '',
  codigoPostal: '',
  vigencia: '',
  impuestoIva: '',
  vendedor: '',
  nombreContacto: '',
  vendedor2: '',
  apellidoContacto: '',
  puestoContacto: ''
})

// Observar cambios en modelValue para abrir/cerrar el modal
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
})

// Observar cambios en dialog para emitir el evento
watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const closeModal = () => {
  dialog.value = false
  resetForm()
}

const resetForm = () => {
  Object.keys(prospecto).forEach(key => {
    prospecto[key] = ''
  })
  if (form.value) {
    form.value.resetValidation()
  }
}

const guardarProspecto = async () => {
  if (!form.value) {
    return
  }

  // Validación manual adicional
  if (!prospecto.empresa.trim()) {
    notificationService.error('El campo Empresa es requerido')
    return
  }

  const { valid } = await form.value.validate()
  if (!valid) {
    return
  }

  loading.value = true

  try {
    // Guardar el prospecto usando el store
    const resultado = await store.guardarProspecto(prospecto)

    if (resultado.exito) {
      // Mostrar notificación de éxito
      notificationService.success(resultado.mensaje)

      // Emitir evento con los datos del prospecto guardado
      emit('prospecto-guardado', resultado.data)

      // Cerrar el modal
      closeModal()
    } else {
      console.error('Error al guardar prospecto:', resultado.mensaje)
      // Mostrar notificación de error
      notificationService.error(resultado.mensaje)
    }
  } catch (error) {
    console.error('Error al guardar prospecto:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-date-picker {
  width: 100%;
}
</style>
