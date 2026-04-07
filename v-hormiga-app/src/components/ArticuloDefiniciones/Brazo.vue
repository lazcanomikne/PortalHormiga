<template>
  <v-card class="mb-4" id="brazo" aria-label="Brazo" flat>
    <v-card-text v-if="store.articuloActual.itemCode === 'Grua giratoria'">
      <v-card-title>Opciones de montaje</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Montaje</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.Montaje" density="compact"
            :items="['Sin', 'Perno de anclaje + plantilla', 'Perno de anclaje + plantilla (se entrega con antelación)', 'Ancla compacta', 'Ancla superior']" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Brida de pie plano</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.BridaPiePlano" density="compact"
            :items="['Sin', 'Brida de pie plano: Tipo A (plana)', 'Brida de pie plano: Tipo B (plano mecanizado)']" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.brazo.sistemaPernosAnclaje" label="Sistema de pernos de anclaje"
            density="compact" />
        </v-col>
      </v-row>
      <div class="custom-divider" />
      <v-card-title>Opciones de giro</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Unidad de giro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.UnidadGiro" density="compact"
            :items="['Sin', 'Unidad de giro: Tipo A (Montado debajo)', 'Unidad de giro: Tipo B (Montado en la parte superior)']" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox label="Control de contactor para movimiento de giro"
            v-model="store.brazo.controlContactorMovimientoGiro" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Limitacion de giro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.limitacionGiro" density="compact"
            :items="['Sin', 'Tope de giro mecánico (atornillado)']" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox label="Limitacion de giro mecánico (eléctrica)" v-model="store.brazo.limitacionGiroElectrica"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Dispositivo de bloqueo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.dispositivoBloqueo" density="compact"
            :items="['Sin', 'Dispositivo de bloqueo para una posición', 'Dispositivo de bloqueo para varias posiciones']" />
        </v-col>
      </v-row>
      <div class="custom-divider" />
      <v-card-title>Tratamiento superficial / Protección climática</v-card-title>
      <v-row>
        <template v-if="store.brazo.galvanizadoGrua !== 'Si'">

          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Pintura (grúa)</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-select v-model="store.brazo.pinturaGrua" density="compact"
              :items="['Color estándar', 'Color personalizado']" />
          </v-col>
          <template v-if="store.brazo.pinturaGrua === 'Color personalizado'">
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Color personalizado (grúa)</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field v-model="store.brazo.colorPersonalizadoGrua" density="compact" />
            </v-col>
          </template>
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Pintura (unidad de giro)</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-select v-model="store.brazo.pinturaUnidadGiro" density="compact" :items="['Sin']" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Galvanizado en caliente (grúa)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.galvanizadoGrua" density="compact" :items="['Si', 'No']" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox label="Marquesina de protección contra la intemperie (para motor de giro)"
            v-model="store.brazo.marquesinaProteccionIntemperie" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox label="Capota protectora contra la intemperie en posición de estacionamiento (fija)"
            v-model="store.brazo.capotaProteccionIntemperieFija" density="compact" />
        </v-col>
      </v-row>
      <div class="custom-divider" />
      <v-card-title>Accesorios</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Fuente de alimentación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.fuenteAlimentacion" density="compact"
            :items="['Ninguno', 'Con parte superior de cable redonda alimentada por el centro', 'Con adorno de cables redondos', 'Con adorno de cables plano arrastrado']" />
        </v-col>
        <template v-if="store.brazo.fuenteAlimentacion == 'Con adorno de cables redondos'">
          <v-col cols="12" md="12">
            <v-checkbox label="Juego de colectores de corriente incl. Brazo de remolque"
              v-model="store.brazo.juegoColectoresCorriente" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="12">
          <v-checkbox label="Extensión del pilar" v-model="store.brazo.extensionPilar" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Punta de foque biselada</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.puntaFoqueBiselada" density="compact" :items="['Si', 'No']" />
        </v-col>
        <template v-if="store.brazo.puntaFoqueBiselada == 'Si'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Valor para la dimensión X</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.brazo.valorDimensionX" type="number" suffix="mm" density="compact" />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Valor para la dimensión Y</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.brazo.valorDimensionY" type="number" suffix="mm" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="12">
          <v-checkbox
            label="Actuadores para final de carrera de recorrido transversal (2 apagados, modo de operacion: interrupctor de rápido a lento o corte final)"
            v-model="store.brazo.actuadoresFinalCarreraRecorridoTransversal" density="compact" />
        </v-col>
      </v-row>
      <div class="custom-divider" />
      <v-card-title>Forma de entrega</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Embalaje</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.embalaje" density="compact"
            :items="['Envuelto en plástico retráctil', 'Palets de embalaje especiales']" />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-else>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tratamiento superficial para brazo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.brazo.tratamientoSuperficialBrazo" density="compact"
            :items="['Color estándar', 'Color personalizado', 'Hierro en blanco', 'Galvanizado en caliente']" />
        </v-col>
        <template v-if="store.brazo.tratamientoSuperficialBrazo === 'Color personalizado'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Color personalizado (brazo)</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.brazo.colorPersonalizadoBrazo" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.brazo.limitadorMovimientoGiro" label="Limitador de movimeinto de giro"
            density="compact" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
const store = useArticuloDefinicionesStore();
</script>
