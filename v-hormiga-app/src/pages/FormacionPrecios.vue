<template>
  <v-container fluid>
    <v-row align="center" class="mb-2">
      <v-col cols="auto">
        <v-btn icon @click="volver">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <span class="text-h6 font-weight-medium">Formación de precios</span>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="guardarPrecioVenta">Guardar</v-btn>
      </v-col>
    </v-row>

    <!-- Información del artículo actual -->
    <!-- <v-alert v-if="!store.articuloActual" type="warning" class="mb-4">
      No hay un artículo seleccionado. Por favor, seleccione un artículo desde la página anterior.
    </v-alert> -->

    <div>
      <!-- Formación de precios (original) -->
      <v-card class="mb-4" outlined>
        <v-card-title>Formación de precios</v-card-title>
        <v-card-text>
          <v-row>
            <!-- Plazo de pago -->
            <v-col cols="12" md="12">
              <v-combobox ref="plazoPagoRef" v-model="store.formacionPrecios.plazoPago" label="Plazo de pago" item-title="pymntGroup"
                item-value="pymntGroup" :items="storeArticuloDefiniciones.plazosDias" density="compact" clearable
                hide-selected />
            </v-col>

            <!-- Plazo de pago Otro (numérico) -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.plazoPago === 'Otros'">
              <v-text-field v-model="store.formacionPrecios.plazoPagoOtro" label="Plazo de pago Otro" type="number"
                suffix="días" density="compact"
                @focus="clearZeroOnFocus(store.formacionPrecios, 'plazoPagoOtro')"
                @blur="restoreZeroIfEmptyOnBlur(store.formacionPrecios, 'plazoPagoOtro')" />
            </v-col>

            <!-- Cliente requiere fianza -->
            <v-col cols="12" md="12">
              <v-select v-model="store.formacionPrecios.cliReqFianza" label="Cliente requiere fianza"
                :items="opcionesFianza" item-title="text" item-value="value" density="compact"
                :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>

            <!-- Tipo de fianza -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.cliReqFianza >= 1">
              <v-select v-model="store.formacionPrecios.tipoFianza1" label="Tipo de fianza 1"
                :items="storeArticuloDefiniciones.tipoFianza" item-title="u_Tipodefianza" item-value="u_Tipodefianza" density="compact"
                :loading="loadingData" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>
            <v-col cols="12" md="12" v-if="store.formacionPrecios.cliReqFianza >= 2">
              <v-select v-model="store.formacionPrecios.tipoFianza2" label="Tipo de fianza 2"
                :items="storeArticuloDefiniciones.tipoFianza" item-title="u_Tipodefianza" item-value="u_Tipodefianza" density="compact"
                :loading="loadingData" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>
            <v-col cols="12" md="12" v-if="store.formacionPrecios.cliReqFianza >= 3">
              <v-select v-model="store.formacionPrecios.tipoFianza3" label="Tipo de fianza 3"
                :items="storeArticuloDefiniciones.tipoFianza" item-title="u_Tipodefianza" item-value="u_Tipodefianza" density="compact"
                :loading="loadingData" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>
            <v-col cols="12" md="12" v-if="store.formacionPrecios.cliReqFianza >= 4">
              <v-select v-model="store.formacionPrecios.tipoFianza4" label="Tipo de fianza 4"
                :items="storeArticuloDefiniciones.tipoFianza" item-title="u_Tipodefianza" item-value="u_Tipodefianza" density="compact"
                :loading="loadingData" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>

            <!-- Agente -->
            <v-col cols="12" md="12">
              <v-select v-model="store.formacionPrecios.agente" label="Agente"
                :items="storeArticuloDefiniciones.agentes" item-title="u_Agente" item-value="u_Agente"
                density="compact" />
            </v-col>

            <!-- Broker indicado por cliente -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.agente.includes('Otro')">
              <v-text-field v-model="store.formacionPrecios.brokerCliente" label="Broker indicado por cliente"
                density="compact" maxlength="30" counter="30" />
            </v-col>

            <!-- Aplica penalización -->
            <v-col cols="12" md="12">
              <v-checkbox v-model="store.formacionPrecios.aplicaPenal" label="Aplica penalización" />
            </v-col>

            <!-- Especifique penalización -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.aplicaPenal">
              <v-text-field v-model="store.formacionPrecios.penalizacion" label="Especifique penalización"
                placeholder="0.5 % Por día de retrazo" density="compact" />
            </v-col>

            <!-- Seguro de responsabilidad civil -->
            <v-col cols="12" md="12">
              <v-checkbox v-model="store.formacionPrecios.seguroRespCivil" label="Seguro de responsabilidad civil" />
            </v-col>

            <!-- Definido por (SHOSA/Cliente) -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.seguroRespCivil">
              <v-radio-group v-model="store.formacionPrecios.definidoPor" inline>
                <v-radio label="SHOSA" value="SHOSA" />
                <v-radio label="Cliente" value="Cliente" />
              </v-radio-group>
            </v-col>

            <!-- Especifique aseguradora -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.definidoPor == 'Cliente'">
              <v-text-field v-model="store.formacionPrecios.aseguradora" label="Especifique aseguradora"
                density="compact" maxlength="100" counter="100" />
            </v-col>

            <!-- Especifique monto (miles con coma; valor numérico en el store) -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.seguroRespCivil">
              <v-text-field label="Especifique monto" :model-value="montoSeguroLocal"
                @update:model-value="onMontoSeguroInput" density="compact" hide-details inputmode="decimal"
                @focus="onMontoSeguroFocus" @blur="onMontoSeguroBlur">
                <template v-slot:prepend>
                  {{ storeInfoPanel.form.moneda }}
                </template>
              </v-text-field>
            </v-col>

            <!-- Tiempo de garantía -->
            <v-col cols="12" md="6">
              <v-select v-model="store.formacionPrecios.tiempoGarantia" label="Tiempo de garantía"
                :items="storeArticuloDefiniciones.tipoGarantias" item-title="u_Tiempodegarantia" item-value="u_Tiempodegarantia" density="compact"
                :loading="loadingData" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>

            <!-- Dosier -->
            <v-col cols="12" md="6">
              <v-checkbox v-model="store.formacionPrecios.dosier" label="Dosier" />
            </v-col>

            <!-- Factura -->
            <v-col cols="12" md="6">
              <v-select v-model="store.formacionPrecios.tipoFactura" label="Factura" :items="opcionesFactura"
                density="compact" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>

            <!-- Cotización -->
            <v-col cols="12" md="6">
              <v-select v-model="store.formacionPrecios.tipoCotizacion" label="Cotización" :items="opcionesCotizacion"
                density="compact" :rules="[v => !!v || 'Campo obligatorio']" />
            </v-col>

            <!-- Especificación del cliente -->
            <v-col cols="12" md="12" v-if="store.formacionPrecios.tipoFactura === 'Según especificación cliente'">
              <v-text-field v-model="store.formacionPrecios.especificacionCliente" label="Especificación del cliente"
                density="compact" maxlength="100" counter="100"
                :rules="[v => !!v || 'Campo obligatorio cuando factura es según especificación cliente']" />
            </v-col>

            <!-- Observaciones -->
            <v-col cols="12" md="12">
              <v-textarea variant="outlined" v-model="store.formacionPrecios.observacionesFP" label="Observaciones"
                rows="2" density="compact" maxlength="250" counter="250" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <!-- Eventos de pagos -->
      <v-card class="mb-4" outlined>
        <v-card-title class="d-flex align-center">
          <span>Eventos de Pago</span>
          <v-spacer></v-spacer>
          <v-chip :color="store.porcentajesEventosValidos ? 'success' : 'error'" variant="tonal" class="mr-2">
            Total: {{ store.totalPorcentajesEventos }}%
          </v-chip>
          <v-btn color="primary" size="small" @click="store.agregarEventoPago"
            :disabled="store.totalPorcentajesEventos >= 100">
            <v-icon>mdi-plus</v-icon> Agregar Evento
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Mensaje cuando no hay eventos -->
          <v-alert v-if="store.configuraciones.eventosPago.length === 0" type="info" variant="tonal" class="mb-4">
            No hay eventos de pago configurados. Haga clic en "Agregar Evento" para comenzar.
          </v-alert>

          <!-- Mensaje de advertencia cuando se acerca al 100% -->
          <v-alert
            v-if="store.configuraciones.eventosPago.length > 0 && store.totalPorcentajesEventos > 90 && store.totalPorcentajesEventos < 100"
            type="warning" variant="tonal" class="mb-4">
            Atención: El total de porcentajes está cerca del 100% ({{ store.totalPorcentajesEventos }}%)
          </v-alert>

          <!-- Mensaje de error cuando excede el 100% -->
          <v-alert v-if="store.configuraciones.eventosPago.length > 0 && !store.porcentajesEventosValidos" type="error"
            variant="tonal" class="mb-4">
            Error: El total de porcentajes ({{ store.totalPorcentajesEventos }}%) excede el 100%
          </v-alert>

          <!-- Lista de eventos -->
          <v-card v-for="(evento, index) in store.configuraciones.eventosPago" :key="evento.id || index" class="mb-3">
            <v-card-title class="d-flex align-center">
              <span>Evento de pago {{ index + 1 }}</span>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-delete" variant="text" color="error" density="compact"
                @click="store.eliminarEventoPago(index)" :title="`Eliminar evento ${index + 1}`"></v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <v-combobox v-model="evento.condicion" :items="opcionesCondiciones" label="Condición de pago"
                    density="compact" placeholder="Ej: Al firmar contrato, Al recibir mercancía"
                    :rules="[v => !!v || 'La condición es requerida']" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="evento.porcentaje" label="Porcentaje" type="number" suffix="%"
                    density="compact" min="0" max="100"
                    :rules="[v => v >= 0 && v <= 100 || 'El porcentaje debe estar entre 0 y 100']"
                    @focus="clearZeroOnFocus(evento, 'porcentaje')"
                    @blur="restoreZeroIfEmptyOnBlur(evento, 'porcentaje')" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
      <!-- Tabla de Productos -->
      <v-card class="mb-4" outlined>
        <v-card-title class="d-flex align-center">
          <span>Productos y Opciones Seleccionadas</span>
          <v-spacer></v-spacer>
          <v-btn color="primary" size="small" @click="handlerAddConcepto">
            <v-icon>mdi-plus</v-icon> Agregar
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Precio Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in store.conceptos" :key="index">
                <td>
                  <v-text-field v-if="item.edit" hide-details density="compact" v-model="item.codigo" />
                  <span v-else>{{ item.codigo }}</span>
                </td>
                <td>
                  <v-text-field v-if="item.edit" hide-details density="compact" v-model="item.descripcion" />
                  <span v-else>{{ item.descripcion }}</span>
                </td>
                <td>
                  <v-text-field v-if="item.edit" hide-details density="compact" v-model="item.cantidad" type="number"
                    @input="() => recalcConceptoTotal(item)"
                    @focus="clearZeroOnFocus(item, 'cantidad')"
                    @blur="restoreZeroIfEmptyOnBlur(item, 'cantidad')" />
                  <span v-else>{{ item.cantidad }}</span>
                </td>
                <td>
                  <v-text-field type="number" v-model="item.precioUnitario"
                    @input="() => recalcConceptoTotal(item)" density="compact"
                    hide-details
                    @focus="clearZeroOnFocus(item, 'precioUnitario')"
                    @blur="restoreZeroIfEmptyOnBlur(item, 'precioUnitario')">
                    <template v-slot:prepend>
                      {{ storeInfoPanel.form.moneda }}
                    </template>
                  </v-text-field>
                </td>
                <td>
                  <v-text-field variant="plain" density="compact" hide-details readonly>
                    <template v-slot:prepend>
                      {{ storeInfoPanel.form.moneda }}
                    </template>
                    {{ $filters.currency(item.precioTotal) }}
                  </v-text-field>
                </td>
                <td v-if="item.edit">
                  <v-btn icon="mdi-delete" variant="text" size="small" @click="handlerDeleteConcepto(index)"></v-btn>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right font-weight-bold">Total:</td>
                <td>
                  <v-text-field variant="plain" density="compact" hide-details>
                    <template v-slot:prepend>
                      {{ storeInfoPanel.form.moneda }}
                    </template>
                    {{ $filters.currency(totalProductos) }}
                  </v-text-field>
                </td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { dataAppService } from '@/services/api';
import { useArticlesStore } from '@/stores/useArticlesStore';
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { useBahiasStore } from '@/stores/useBahiasStore';
import { useCotizadorFormStore } from "@/stores/useCotizadorFormStore";
import { usePrecioVentaStore } from '@/stores/usePrecioVentaStore';
import { reorderConceptosPreservandoPrecios, DIC_BAHIA_SECCIONES } from '@/utils/conceptosOrden';
import {
  clearZeroOnFocus,
  formatThousandsComma,
  parseNumberLoose,
  restoreZeroIfEmptyOnBlur,
} from '@/utils/numericFieldZeroPlaceholder';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'PrecioVenta'
})

const router = useRouter();
const store = usePrecioVentaStore();
const storeArticuloDefiniciones = useArticuloDefinicionesStore();
const storeBahias = useBahiasStore()
const storeArticles = useArticlesStore()
const storeInfoPanel = useCotizadorFormStore()
const loadingData = ref(false)
const plazoPagoRef = ref(null)

// Opciones para los campos según la especificación
const plazosPago = ref(['Seleccionar..']) // Se llenará desde SAP
const opcionesFianza = ref([
  { text: 'No aplica', value: 0 },
  { text: 'Requiere una fianza', value: 1 },
  { text: 'Requiere dos fianza', value: 2 },
  { text: 'Requiere tres fianza', value: 3 },
  { text: 'Requiere cuatro fianza', value: 4 }
])
const opcionesCondiciones = ref(['Anticipo', 'Emisión dibujo', 'Autorización dibujo', 'Según avance', 'Contra embraque', 'Contra entrega', 'Contra puesta en marcha', 'Otro'])
const opcionesFactura = ref([
  'Global',
  'Desglosada',
  'Según especificación cliente'
])
const opcionesCotizacion = ref(['Global', 'Desglosada'])

const dic = DIC_BAHIA_SECCIONES

const totalProductos = computed(() => {
  return store.conceptos.reduce((total, item) => total + item.precioTotal, 0)
})

const montoSeguroLocal = ref('')
const montoSeguroEditing = ref(false)

function syncMontoSeguroDisplayFromStore() {
  if (montoSeguroEditing.value) return
  const v = store.formacionPrecios.montoSeguro
  const n = v === null || v === undefined || v === '' ? 0 : Number(v)
  montoSeguroLocal.value = formatThousandsComma(Number.isNaN(n) ? 0 : n)
}

watch(
  () => store.formacionPrecios.montoSeguro,
  () => syncMontoSeguroDisplayFromStore()
)

watch(
  () => store.formacionPrecios.seguroRespCivil,
  (on) => {
    if (!on) {
      montoSeguroEditing.value = false
    } else {
      syncMontoSeguroDisplayFromStore()
    }
  }
)

function onMontoSeguroFocus() {
  montoSeguroEditing.value = true
  const v = store.formacionPrecios.montoSeguro
  if (v === 0 || v === null || v === undefined || v === '') {
    montoSeguroLocal.value = ''
  } else {
    const n = Number(v)
    montoSeguroLocal.value = Number.isNaN(n) ? '' : String(n)
  }
}

function onMontoSeguroBlur() {
  montoSeguroEditing.value = false
  const n = parseNumberLoose(montoSeguroLocal.value)
  store.formacionPrecios.montoSeguro = n
  montoSeguroLocal.value = formatThousandsComma(n)
}

function onMontoSeguroInput(val) {
  montoSeguroLocal.value = val ?? ''
}

/** Evita NaN en total cuando cantidad/precio son null tras limpiar el cero al enfocar. */
function recalcConceptoTotal(item) {
  const c = Number(item.cantidad)
  const p = Number(item.precioUnitario)
  const cc = Number.isNaN(c) ? 0 : c
  const pp = Number.isNaN(p) ? 0 : p
  item.precioTotal = cc * pp
}

function volver() {
  router.go(-1)
}
const loadData = async () => {
  try {
    loadingData.value = true

    // Cargar plazos de pago desde SAP (si existe el endpoint)
    try {
      const plazosData = await (await dataAppService.getPlazosPago()).data
      plazosPago.value = ['Seleccionar..', ...plazosData.map(item => item.plazo)]
    } catch (error) {
      console.warn('No se pudo cargar plazos de pago desde SAP, usando valores por defecto')
      plazosPago.value = [
        'Seleccionar..',
        '30 días',
        '45 días',
        '60 días',
        '90 días',
        '120 días',
        'Otros'
      ]
    }

    // El Store ya viene prehidratado desde Oferta.vue y ademas cuenta con persistencia local
    // de Pinia para refrescos de pantalla, por lo que no es necesario volver a llamar al getById
    // basado en si el cliente escribio o no el plazoPago asumiendo que perdio la sesion.

  } catch (error) {
    loadingData.value = false;
    console.error('Error cargando datos:', error);
  } finally {
    loadingData.value = false;
  }
}

const loadTableData = () => {
  store.conceptos = reorderConceptosPreservandoPrecios(
    store.conceptos,
    storeArticles.selectedArticles,
    storeBahias.selectedBahias,
    dic
  )
}

const handlerAddConcepto = () => {
  store.addConcepto([{
    codigo: '',
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    precioTotal: 0,
    edit: true,
    manual: true
  }])
}

const handlerDeleteConcepto = (index) => {
  store.deleteConcepto(index)
}

onMounted(async () => {
  await loadData()
  loadTableData()
  syncMontoSeguroDisplayFromStore()
  if (plazoPagoRef.value) {
    plazoPagoRef.value.focus()
  }
})
function guardarPrecioVenta() {
  const resultado = store.guardarPrecioVenta();

  if (resultado.exito) {
    console.log('Precio de venta guardado:', resultado.datos);
    // Aquí podrías mostrar un mensaje de éxito
    volver();
  } else {
    console.error('Error al guardar:', resultado.error);
    // Aquí podrías mostrar un mensaje de error
    alert(`Error: ${resultado.error}`);
  }
}
</script>
<style scoped>
.v-col-md-12 {
  padding-bottom: 1px !important;
}
</style>
