<template>
  <v-card class="mb-4" id="datos-basicos" aria-label="Datos Básicos" flat>
    <v-card-title>Datos Básicos</v-card-title>
    <v-card-text>
      <v-row v-if="store.articuloActual.itemCode === 'KBK'">
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tensión de servicio</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tensionServicio"
            :items="['220 V', '230 V', '240 V', '380 V', '400 V', '415 V', '440 V', '460 V', '500 V', '525 V', '575 V']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Frecuencia</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.frecuencia" :items="['50 Hz', '60 Hz']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de corriente</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoCorriente" :items="['Corriente trifásica']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Ejecución</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.ejecucion" :items="['CE']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Del suelo al techo (h)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.izaje" type="number" min="0" @focus="$event.target.select()"
            :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Número de grúas en la vía</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.numGruaVia" :items="['1', '2', '3', '4', '5', '6']" density="compact" />
        </v-col>
        <template v-if="store.datosBasicos.numGruaVia > 1">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Gruas iguales</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-checkbox v-model="store.datosBasicos.gruasIguales" @update:modelValue="validateGanchos"
              density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Longitud de brazo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.longitudBrazo"
            :items="['No estándar', '850', '1800', '2750', '3700', '4600', '5300', '6000', '7000', '7600', '7800', '8500', '9000', '10000']"
            density="compact" />
        </v-col>
        <template v-if="store.datosBasicos.longitudBrazo === 'No estándar'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Longitud de brazo (valor)</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.datosBasicos.longitudBrazoValor" type="number" min="0" @focus="$event.target.select()"
              :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact" />
          </v-col>
        </template>
      </v-row>
      <v-row v-else-if="store.articuloActual.itemCode === 'Grua giratoria'">
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tensión de servicio</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tensionServicio"
            :items="['220 V', '230 V', '240 V', '380 V', '400 V', '415 V', '440 V', '460 V', '500 V', '525 V']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Frecuencia</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.frecuencia" :items="['50 Hz', '60 Hz']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de corriente</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoCorriente" :items="['Corriente trifásica']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Ejecución</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.ejecucion" :items="['CE']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de grúa</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoGrua" :items="['Pluma de pilar', 'Brazo de pared']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Deflexion</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.deflexion" :items="['1/220', '1/250', '1/300', '1/350', '1/500']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Ubicación de instalación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.ubicacionInstalacion" :items="['Adentro', 'Al aire libre']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Carga (Kg)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.carga"
            :items="[80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300, 8000, 10000]"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Longitud de brazo (mm)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.longitudBrazo"
            :items="['No estándar', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000', '11000', '12000']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Dispositivo de elevación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.dispositivoElevacion"
            :items="['Polipasto de Cadena', 'Polipasto de Cable']" density="compact"
            @update:model-value="getCodigoConstruccion(store.datosBasicos.dispositivoElevacion)" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Codigo de construcción</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.datosBasicos.codigoConstruccion" :items="codigoConstruccion" :loading="loading"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de carro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoCarro" :items="['Manual', 'Motorizado']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de brazo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoBrazo" :items="store.brazos" item-title="itemName"
            item-value="itemCode" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Anclaje en concreto</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.anclajeConcreto" :items="['Si', 'No']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Rango de giro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.rangoGiro" :items="['Limitado', 'Normal']" density="compact" />
        </v-col>
      </v-row>
      <v-row v-else-if="store.articuloActual.itemCode === 'Grua giratoria KBK'">
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tensión de servicio</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tensionServicio"
            :items="['220 V', '230 V', '240 V', '380 V', '400 V', '415 V', '440 V', '460 V', '500 V', '525 V']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Frecuencia</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.frecuencia" :items="['50 Hz', '60 Hz']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de corriente</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoCorriente" :items="['Corriente trifásica']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Ejecución</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.ejecucion" :items="['CE']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de grúa</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoGrua" :items="['Pluma de pilar', 'Brazo de pared']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Carga (Kg)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.carga"
            :items="[80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300, 8000, 10000]"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Longitud de brazo (mm)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.longitudBrazo"
            :items="['No estándar', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000', '11000', '12000']"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Dispositivo de elevación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.dispositivoElevacion"
            :items="['Polipasto de Cadena', 'Polipasto de Cable']" density="compact"
            @update:modelValue="getCodigoConstruccion(store.datosBasicos.dispositivoElevacion)" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Codigo de construcción</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.datosBasicos.codigoConstruccion" :items="codigoConstruccion" :loading="loading"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de giro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoGiro" :items="['Manual', 'Motorizado']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de carro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoCarro" :items="['Manual', 'Motorizado']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de brazo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoBrazo" :items="store.brazos" item-title="itemName"
            item-value="itemCode" density="compact" />
        </v-col>
        <v-col cols="12">
          <div class="custom-divider" />
          <v-card-title>Definicion de altura</v-card-title>
        </v-col>
        <!-- Definicion de altura: Hacemos 3 Checks
        1.- Altura
        2.- Pluma de borde inferior
        3.- Posicion mas alta del gancho
        -->

        <v-col cols="12" md="4" class="d-flex align-center">
          <v-checkbox v-model="store.datosBasicos.altura" label="Altura" class="text-body-1" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-checkbox v-model="store.datosBasicos.plumaBordeInferior" label="Pluma de borde inferior"
            class="text-body-1" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-checkbox v-model="store.datosBasicos.posicionMasAltaGancho" label="Posicion mas alta del gancho"
            class="text-body-1" />
        </v-col>
        <template v-if="store.datosBasicos.altura">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Altura</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.datosBasicos.altura" type="number" min="0" @focus="$event.target.select()"
              :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact"
              messages="Rango de altura [2140 - 6000] mm" />
          </v-col>
        </template>
        <template v-if="store.datosBasicos.plumaBordeInferior">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Pluma de borde inferior</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.datosBasicos.plumaBordeInferior" type="number" min="0" @focus="$event.target.select()"
              :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact"
              messages="Rango de altura [1900 - 5581] mm" />
          </v-col>
        </template>
        <template v-if="store.datosBasicos.posicionMasAltaGancho">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Posicion mas alta del gancho</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.datosBasicos.posicionMasAltaGancho" type="number" min="0" @focus="$event.target.select()"
              :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact"
              messages="Rango de altura [1473 - 5154] mm" />
          </v-col>
        </template>
      </v-row>
      <v-row v-else>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Capacidad de la(s) grúa(s)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.capacidadGrua" type="number" min="0" @focus="$event.target.select()"
            :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 kg" suffix="kg" density="compact"
            @input="() => store.datosBasicos.capacidadGruaToneladas = store.datosBasicos.capacidadGrua / 1000"
            :hint="store.datosBasicos.capacidadGruaToneladas + ' toneladas'" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Requiere equivalente FEM (CMAA)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.equivalenteFem" :items="['Si', 'No']" density="compact" />
        </v-col>
        <template v-if="store.datosBasicos.equivalenteFem === 'Si'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">FEM 9.511 / CMAA / ISO</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-select v-model="store.datosBasicos.equivalenteFemValue"
              :items="['1Bm / B-C / M3', '1Am / C / M4', '2m / D / M5', '3m / D / M6', '4m / E / M7', '5m / F / M8', 'Otro']"
              density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Claro</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.claro" type="number" min="0" @focus="$event.target.select()"
            :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact"
            @input="() => store.datosBasicos.claroM = store.datosBasicos.claro / 1000"
            :hint="store.datosBasicos.claroM + ' m'" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Clasificación puentes según DIN15018</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.clasificacionPuentes" :items="clasificacionPuenteList"
            density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Izaje</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.izaje" type="number" min="0" @focus="$event.target.select()"
            :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 mm" suffix="mm" density="compact"
            @input="actualizarIzaje()" :hint="store.datosBasicos.izajeM + ' m'" />
        </v-col>
        <v-col cols="12" md="12">
          <v-card flat>
            <v-card-title class="d-flex align-center">
              <span>Gancho(s)</span>
            </v-card-title>
            <v-card-text>
              <v-card class="mb-4" flat>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="4" class="d-flex align-center">
                      <label class="text-body-1">Cantidad de ganchos</label>
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-select v-model="store.datosBasicos.cantidadGanchos" :items="[1, 2, 3]" density="compact" />
                    </v-col>
                    <template v-for="(gancho, n) in ganchosArray" :key="n">
                      <v-col cols="12" md="4" class="d-flex align-center">
                        <label class="text-body-1">Capacidad de Gancho {{ n + 1 }}</label>
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-text-field v-model="gancho.capacidadGancho" type="number" min="0" @focus="$event.target.select()"
                          @input="actualizarPolipasto(n)" :rules="[v => v >= 0 || 'No se permite negativos']"
                          placeholder="0 kg" suffix="kg" density="compact" />
                      </v-col>
                    </template>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Especifique área de trabajo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.especifiqueAreaTrabajoProducto"
            :items="['Interior', 'Exterior', 'Polvoso', 'Polvoso explosivo', 'Otros']" density="compact" />
        </v-col>
        <template v-if="store.datosBasicos.especifiqueAreaTrabajoProducto === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique área de trabajo</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.datosBasicos.especifiqueAreaTrabajoProductoOtro" density="compact" />
          </v-col>
        </template>
        <!-- sección Controles -->
        <v-col cols="12" md="12">
          <v-card flat>
            <v-card-title class="d-flex align-center">
              <span>Tipo de Control</span>
              <v-spacer></v-spacer>
              <v-btn color="primary" size="small" @click="store.agregarControl">
                <v-icon>mdi-plus</v-icon> Agregar Tipo de Control
              </v-btn>
            </v-card-title>
            <v-card-text>
              <!-- Mensaje cuando no hay controles -->
              <v-alert v-if="store.datosBasicos.controles.length === 0" type="info" variant="tonal" class="mb-4">
                No hay tipo de control configurados. Haga clic en "Agregar Tipo de Control" para comenzar.
              </v-alert>
              <v-card v-else class="mb-4" v-for="(control, n) in store.datosBasicos.controles" :key="n" flat>
                <v-card-title class="d-flex align-center">
                  <span>Control {{ n + 1 }}</span>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-delete" variant="text" color="error" density="compact"
                    @click="store.eliminarControl(n)" :title="`Eliminar control ${n + 1}`"></v-btn>
                </v-card-title>
                <v-card-text>
                  <Controles :control="control" />
                  <div class="custom-divider" />
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Peso muerto de la grúa</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.pesoMuertoGrua" type="number" min="0" @focus="$event.target.select()"
            :rules="[v => v >= 0 || 'No se permite negativos']" placeholder="0 kg" suffix="kg" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Reacción máxima por rueda</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.reaccionMaximaRueda" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Ambiente</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.ambiente"
            :items="['Normal', 'Altas temperaturas', 'Humedo', 'A prueba de explision y/o antichispa', 'Vapores corrosivos', 'Polvoso', 'Marino', 'Otros']"
            density="compact" />
        </v-col>
        <template v-if="store.datosBasicos.ambiente === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique ambiente</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.datosBasicos.ambienteOtro" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Material que transporta</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.datosBasicos.materialTransporta" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.datosBasicos.observaciones" rows="2" density="compact" />
        </v-col>
        <v-col cols="12">
          <div class="custom-divider" />
        </v-col>
      </v-row>

    </v-card-text>
  </v-card>
</template>

<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { computed, ref, watch } from 'vue';
import { dataAppService } from '@/services/api';
import Controles from './Controles.vue';

defineOptions({
  name: 'DatosBasicos'
})

const store = useArticuloDefinicionesStore();
const codigoConstruccion = ref([]);
const loading = ref(false);

// Auto-guardado de datos básicos
const datosBasicos = computed(() => store.datosBasicos);
const clasificacionPuenteList = computed(() => {
  if (["ELKE", "EKKE", "EDKE", "EHPE", "EVPE"].includes(store.articuloActual.itemCode))
    return ['H2 / B3']
  if (["ZKKE", "ZHPE", "ZVPE"].includes(store.articuloActual.itemCode))
    return ['H2 / B3']
  return ['H1 / B2', 'H2 / B3', 'H3 / B4', 'H4 / B6']
});
function validateDispositivoTomaCarga() {
  if (store.datosBasicos.dispositivoTomaCarga && store.datosBasicos.equivalenteFemValue === '2m / D / M5 / H4') {
    alert('La equivalente FEM debe ser igual o superior a 3m / D / M6 / H4');
    store.datosBasicos.dispositivoTomaCarga = false;
  }
}
const validateGanchos = () => {
  if (store.datosBasicos.numGruaVia > 1 && store.datosBasicos.gruasIguales) {
    store.puente.puentes = store.puente.puentes.slice(0, 1);
  } else {
    for (let i = store.puente.puentes.length; i < store.datosBasicos.numGruaVia; i++) {
      store.puente.puentes.push({
        capacidadNominal: 0,
        deflexion: 0,
        deflexionValorNoEstandar: 0,
        suministroEnergiaPista: '',
        dispositivoLevacion: '',
        tipoCarro: '',
        disenoPuente: '',
        puenteHechoDe: '',
        perfilDelPuente: '',
        trasalacionPuente: '',
        diseñoCarroPuente: '',
        fuenteAlimentacionPolipasto: '',
        pesoAccesoriosAdicionales: 0,
        inlcuyeEstructura: false,
        columnas: 0,
        travesaños: 0,
        traves: 0,
        anclaQuimica: '',
        anclaQuimicaEspesor: 0,
        anclaQuimicaResistencia: 0,
        cimentacion: false,
        observaciones: ''
      });
    }
  }
}
const ganchosArray = computed(() => {
  if (!store.datosBasicos.ganchos) {
    store.datosBasicos.ganchos = [];
  }
  return store.datosBasicos.ganchos;
});

// Watcher para actualizar la cantidad datosBasicos ganchos
watch(() => store.datosBasicos.numGruaVia, (newValue) => {
  if (newValue && newValue > 0 && !store.datosBasicos.gruasIguales) {
    // Inicializar array datosBasicos ganchos si no existe
    if (!store.puente.puentes) {
      store.puente.puentes = [];
    }

    // Ajustar el array según la cantidad seleccionada
    const currentLength = store.puente.puentes.length;
    const targetLength = parseInt(newValue);

    if (targetLength > currentLength) {
      // SOLO agregar si realmente faltan y no estamos en medio de una hidratación
      // (Si hay datos en el primer puente, asumimos que ya está hidratado)
      for (let i = currentLength; i < targetLength; i++) {
        store.puente.puentes.push({
          capacidadNominal: 0,
          deflexion: 0,
          deflexionValorNoEstandar: 0,
          suministroEnergiaPista: '',
          dispositivoLevacion: '',
          tipoCarro: '',
          disenoPuente: '',
          puenteHechoDe: '',
          perfilDelPuente: '',
          trasalacionPuente: '',
          diseñoCarroPuente: '',
          fuenteAlimentacionPolipasto: '',
          pesoAccesoriosAdicionales: 0,
          inlcuyeEstructura: false,
          columnas: 0,
          travesaños: 0,
          traves: 0,
          anclaQuimica: '',
          anclaQuimicaEspesor: 0,
          anclaQuimicaResistencia: 0,
          cimentacion: false,
          observaciones: ''
        });
      }
    } else if (targetLength < currentLength) {
      // puente puentes excedentes
      store.puente.puentes = store.puente.puentes.slice(0, targetLength);
    }
  }
}, { immediate: true });
// Watcher para actualizar la cantidad datosBasicos ganchos
watch(() => store.datosBasicos.cantidadGanchos, (newValue) => {
  if (newValue && newValue > 0) {
    // Inicializar array datosBasicos ganchos si no existe
    if (!store.datosBasicos.ganchos) {
      store.datosBasicos.ganchos = [];
    }

    // Ajustar el array según la cantidad seleccionada
    const currentGanchosLength = store.datosBasicos.ganchos.length;
    const targetLength = newValue;

    if (targetLength > currentGanchosLength) {
      // datosBasicos ganchos faltantes
      for (let i = currentGanchosLength; i < targetLength; i++) {
        store.datosBasicos.ganchos.push({
          capacidadGancho: 0,
          izajeGancho: 0,
          velocidadTraslacionGancho: '',
          especifiqueVelocidadTraslacion: '',
          izaje: store.datosBasicos.izaje
        });
        
        // SOLO agregar polipasto si realmente falta en la otra sección
        // Esto previene duplicidad cuando cargamos datos existentes
        if (store.izaje.polipastos.length < targetLength) {
          store.agregarPolipasto();
        }
      }
    } else if (targetLength < currentGanchosLength) {
      // datosBasicos ganchos excedentes
      store.datosBasicos.ganchos = store.datosBasicos.ganchos.slice(0, targetLength);
      
      // Eliminar polipastos excedentes uno por uno hasta llegar al tamaño deseado
      while (store.izaje.polipastos.length > targetLength) {
        store.eliminarPolipasto(store.izaje.polipastos.length - 1);
      }
    }
  }
}, { immediate: true });

function eliminarGancho(index) {
  if (store.datosBasicos.ganchos && store.datosBasicos.ganchos.length > index) {
    store.datosBasicos.ganchos.splice(index, 1);
    store.datosBasicos.cantidadGanchos = store.datosBasicos.ganchos.length;
  }
}
function actualizarPolipasto(index) {
  if (store.izaje.polipastos && store.izaje.polipastos.length > index) {
    store.izaje.polipastos[index].capacidadGancho = store.datosBasicos.ganchos[index].capacidadGancho;
  }
}
function actualizarIzaje() {
  store.datosBasicos.izajeM = store.datosBasicos.izaje / 1000

  store.izaje.polipastos.forEach((polipasto, index) => {
    polipasto.izajeGancho = store.datosBasicos.izaje;
  })
}
async function getCodigoConstruccion(ganchoType) {
  if (!ganchoType) return;
  const currentItemCode = (store.articuloActual.itemCode || "").trim().toUpperCase();
  const isSpecial = ['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE', 'ZVPE', 'ZHPE', 'ZKKE'].some(code => currentItemCode.includes(code));
  
  loading.value = true;
  try {
    let response;
    if (isSpecial) {
      const groupCode = (ganchoType || "").includes('Cadena') ? '436' : '433';
      response = await dataAppService.getCodigoConstruccion(groupCode);
      
      if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
        const fallbackType = (ganchoType === 'Polipasto' || (ganchoType || "").includes('Cable') || (ganchoType || "").includes('Cadena')) ? '2' : '9';
        response = await dataAppService.getTipoRuedas(fallbackType);
      }
    } else {
      const tipo = (ganchoType === 'Polipasto' || (ganchoType || "").includes('Cable') || (ganchoType || "").includes('Cadena')) ? '2' : '9';
      response = await dataAppService.getTipoRuedas(tipo);
    }

    if (response?.data && Array.isArray(response.data)) {
      codigoConstruccion.value = response.data.map((item) => {
        if (typeof item === 'string') return item;
        return item.itemCode || item.ItemCode || item.itemName || item.ItemName || "";
      }).filter(i => i !== "");
    }
  } catch (error) {
    console.error("Error fetching construction codes:", error);
  } finally {
    loading.value = false;
  }
}
</script>
