<template>
  <v-card class="mb-4" id="datos-basicos" aria-label="Camino de Rodadura / Grua" flat>
    <v-card-title>Camino de Rodadura / Grua</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="12">
          <v-card flat>
            <v-card-title class="d-flex align-center">
              <span>Camino de rodadura / grúa</span>
            </v-card-title>
            <v-card-text>
              <v-card class="mb-4" flat>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Longitud total de la Carrilera (L)</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="store.datosBasicos.longitudTotalCarrilera" type="number" min="0"
                        :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm"
                        density="compact" />
                    </v-col>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Espaciado mínimo requerido entre soportes</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-select v-model="store.datosBasicos.espaciadoMinimoSoportes"
                        :items="['Valor no Estandar', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000', '15000', '20000', '25000', '30000', '35000', '40000', '50000', '55000', '60000', '65000', '75000', '80000', '85000', '90000', '95000', '100000', '110000', '120000', '130000', '140000']"
                        density="compact" />
                    </v-col>
                    <template v-if="store.datosBasicos.espaciadoMinimoSoportes == 'Valor no Estandar'">
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Valor no estandar</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="store.datosBasicos.espaciadoMinimoSoportesValor" type="number" min="0"
                          :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm"
                          density="compact" />
                      </v-col>
                    </template>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Grúa construida de:</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-select v-model="store.datosBasicos.gruaConstruidaDe" :items="['Aluminio', 'Acero']"
                        density="compact" />
                    </v-col>
                    <template v-if="store.datosBasicos.gruaConstruidaDe == 'Aluminio'">
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Perfil del puente</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-select v-model="store.datosBasicos.perfilDelPuente"
                          :items="['KBK II-L', 'KBK II', 'KBK II-H', 'KBK III']" density="compact" />
                      </v-col>
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Suministro de energía de la pista</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-select v-model="store.datosBasicos.suministroEnergiaPista"
                          :items="['Conductor interno', 'Sin']" density="compact" />
                      </v-col>
                    </template>
                    <template v-if="store.datosBasicos.gruaConstruidaDe == 'Acero'">
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Perfil del puente</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-select v-model="store.datosBasicos.perfilDelPuente" :items="['A16', 'A18', 'A22', 'A28']"
                          density="compact" />
                      </v-col>
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Suministro de energía de la pista</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-select v-model="store.datosBasicos.suministroEnergiaPista"
                          :items="['Festón', 'Conductor interno', 'Sin']" density="compact" />
                      </v-col>
                    </template>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Máx. Deflexion requerida permitida</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-select v-model="store.datosBasicos.maxDeflexionRequeridaPermitida"
                        :items="['Estándar', 'No estándar', '1/350', '1/500']" density="compact" />
                    </v-col>
                    <template v-if="store.datosBasicos.maxDeflexionRequeridaPermitida == 'No estándar'">
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Deflexión no estándar</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="store.datosBasicos.maxDeflexionNoEstandar" type="number" min="0"
                          :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm"
                          density="compact" />
                      </v-col>
                    </template>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Carga maxima permitida requerida de</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-select v-model="store.datosBasicos.cargaMaximaPermitidaRequeridaDe"
                        :items="['No estándar', '400kg', '750kg', '1400kg', '1700kg', '2600kg']" density="compact" />
                    </v-col>
                    <template v-if="store.datosBasicos.cargaMaximaPermitidaRequeridaDe == 'No estándar'">
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Carga maxima permitida requerida de
                          suspension</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="store.datosBasicos.maxDeflexionNoEstandar" type="number" min="0"
                          :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 kg" suffix="kg"
                          density="compact" />
                      </v-col>
                    </template>

                  </v-row>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';

defineOptions({
  name: 'CaminoRodadura'
})

const store = useArticuloDefinicionesStore();
</script>
