<template>
  <v-card class="mb-4" id="puente" aria-label="Puente" flat>
    <v-card-title>Puente</v-card-title>
    <v-card-text v-if="store.articuloActual.itemCode === 'KBK'">
      <v-tabs v-model="tabs">
        <v-tab v-for="(puente, index) in store.puente.puentes" :key="index" :value="index">Puente {{
          !store.datosBasicos.gruasIguales ? index + 1 : numberToString(store.datosBasicos.numGruaVia) }}
        </v-tab>
      </v-tabs>
      <v-window v-model="tabs">
        <v-window-item v-for="(puente, index) in store.puente.puentes" :key="index" :value="index">
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Capacidad nominal</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.capacidadNominal"
                :items="['80 kg', '100 kg', '125 kg', '160 kg', '200 kg', '250 kg', '315 kg', '400 kg', '500 kg', '630 kg', '800 kg', '1000 kg', '1250 kg', '1600 kg', '2000 kg', '2500 kg', '3200 kg']"
                density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Deflexion</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.deflexion" :items="['Estandar', 'No estandar', '1/275', '1/350', '1/500']"
                density="compact" />
            </v-col>
            <template v-if="puente.deflexion === 'No estandar'">
              <v-col cols="12" md="4" class="d-flex align-center">
                <label class="text-body-1">Valor no estándar</label>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="puente.deflexionValorNoEstandar" density="compact" />
              </v-col>
            </template>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Suministro de energia de la pista</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.suministroEnergiaPista"
                :items="['Luz entre ejes grúa (lKr)', 'Longitud de viga puente (IHT)']" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Dispositivo de elevacion</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.dispositivoElevacion" :items="['Polipasto de Cadena', 'Polipasto de Cable']"
                @update:model-value="getCodigoContruccion(puente.dispositivoElevacion)" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Codigo de construcción</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-combobox v-model="puente.codigoConstruccion" :items="codigoContruccion" :loading="loading"
                density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Tipo de carro</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.tipoCarro" :items="['Manual', 'Motorizado']" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Diseño de puente</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.disenoPuente" :items="['Monopuente']" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Puente hecho de:</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.puenteHechoDe" :items="['Aluminio', 'Acero']" density="compact" />
            </v-col>
            <template v-if="puente.puenteHechoDe == 'Aluminio'">
              <v-col cols="12" md="4" class="d-flex align-center">
                <label class="text-body-1">Perfil del puente</label>
              </v-col>
              <v-col cols="12" md="8">
                <v-select v-model="puente.perfilDelPuente" :items="['KBK II-L', 'KBK II', 'KBK II-H', 'KBK III']"
                  density="compact" />
              </v-col>
            </template>
            <template v-if="puente.puenteHechoDe == 'Acero'">
              <v-col cols="12" md="4" class="d-flex align-center">
                <label class="text-body-1">Perfil del puente</label>
              </v-col>
              <v-col cols="12" md="8">
                <v-select v-model="puente.perfilDelPuente" :items="['A16', 'A18', 'A22', 'A28']" density="compact" />
              </v-col>
            </template>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Traslación puente</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.trasalacionPuente" :items="['Manual', 'Motorizado']" density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Diseño de carro puente</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.diseñoCarroPuente" :items="['Etándar', 'Articulado', 'Rígido', 'Aumentó']"
                density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Fuente de alimentación del polipasto</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-select v-model="puente.fuenteAlimentacionPolipasto" :items="['Festón', 'Conductor Interno']"
                density="compact" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Peso de accesorios adicionales</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field v-model="puente.pesoAccesoriosAdicionales" type="number" suffix="kg" density="compact" />
            </v-col>
            <v-col cols="12" md="12">
              <v-checkbox v-model="puente.inlcuyeEstructura" label="Incluye estructura" />
            </v-col>
            <template v-if="puente.inlcuyeEstructura">
              <v-col cols="12" md="12">
                <v-checkbox v-model="puente.columnas" label="Columnas" />
              </v-col>
              <v-col cols="12" md="12">
                <v-checkbox v-model="puente.travesaños" label="Travesaños" />
              </v-col>
              <v-col cols="12" md="12">
                <v-checkbox v-model="puente.traves" label="Traves" />
              </v-col>
              <v-col cols="12" md="12">
                <v-checkbox v-model="puente.anclaQuimica" label="Ancla quimica" />
              </v-col>
              <template v-if="puente.anclaQuimica">
                <v-col cols="12" md="4" class="d-flex align-center">
                  <label class="text-body-1">Espesor</label>
                </v-col>
                <v-col cols="12" md="8">
                  <v-text-field v-model="puente.anclaQuimicaEspesor" suffix="mm" density="compact" />
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center">
                  <label class="text-body-1">Resistencia</label>
                </v-col>
                <v-col cols="12" md="8">
                  <v-text-field v-model="puente.anclaQuimicaResistencia" suffix="kg/cm2" density="compact" />
                </v-col>
              </template>
            </template>
            <v-col cols="12" md="12">
              <v-checkbox v-model="puente.cimentacion" label="Cimentación" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1 font-weight-bold">Observaciones</label>
            </v-col>
            <v-col cols="12" md="8">
              <v-textarea variant="outlined" v-model="puente.observaciones" rows="2" density="compact" />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card-text>
    <v-card-text v-else>
      <!-- Control de puente -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Control de puente</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.puente.controlPuente"
            :items="['Contactores / Dos velocidades', 'Inversor / Velocidad variable']" density="compact" />
        </v-col>

        <!-- Tipo de Inversor (condicional) -->
        <template v-if="store.puente.controlPuente === 'Inversor / Velocidad variable'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Tipo de inversor</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-select v-model="store.puente.tipoInversor" :items="['DEMAG ACS 880', 'DEMAG DIC-4', 'Otros']"
              density="compact" />
          </v-col>
        </template>

        <!-- Velocidad de traslación puente en m/min -->
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Velocidad de traslación puente en m/min</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.puente.velocidadTraslacionPuente" :items="['37.8/9.5', '2.35 - 40', 'Otros']"
            density="compact" />
        </v-col>

        <!-- Especifique velocidad de traslación puente m/min (condicional) -->
        <template v-if="store.puente.velocidadTraslacionPuente === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique velocidad de traslación puente m/min</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.especifiqueVelocidadTraslacionPuente" density="compact" />
          </v-col>
        </template>
      </v-row>

      <div class="custom-divider" />

      <!-- Sección Ruedas motrices -->
      <v-card-title>Ruedas motrices</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Cantidad de ruedas (pzas)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model.number="store.puente.ruedasMotrices.cantidadRuedas" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" suffix="pzas" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Diámetro de ruedas (mm)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model.number="store.puente.ruedasMotrices.diametroRuedas" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" suffix="mm" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de rueda motriz (A)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.puente.ruedasMotrices.tipoRuedaMotriz" :items="store.tipoRuedas1"
            density="compact" />
        </v-col>
        <template v-if="store.puente.ruedasMotrices.tipoRuedaMotriz === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique tipo de rueda motriz</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.ruedasMotrices.tipoRuedaMotrizOtro" density="compact" />
          </v-col>
        </template>
        <!-- <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de rueda loca (NA)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.puente.ruedasMotrices.tipoRuedaLoca" :items="store.tipoRuedas2"
            density="compact" />
        </v-col> -->
        <template v-if="store.puente.ruedasMotrices.tipoRuedaLoca === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique tipo de rueda loca</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.ruedasMotrices.tipoRuedaLocaOtro" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Material de ruedas</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.puente.ruedasMotrices.materialRuedas" density="compact" />
        </v-col>
        <!-- <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Modelo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.puente.ruedasMotrices.modeloRuedas" :items="store.modelos" density="compact" />
        </v-col> -->
        <template v-if="store.puente.ruedasMotrices.modeloRuedas === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique modelo de ruedas</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.ruedasMotrices.modeloRuedasOtro" density="compact" />
          </v-col>
        </template>
      </v-row>

      <div class="custom-divider" />

      <!-- Sección Ruedas locas -->
      <v-card-title>Ruedas locas</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Cantidad de ruedas (pzas)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model.number="store.puente.ruedasLocas.cantidadRuedas" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" suffix="pzas" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Diámetro de ruedas (mm)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model.number="store.puente.ruedasLocas.diametroRuedas" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" suffix="mm" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Material de ruedas</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.puente.ruedasLocas.materialRuedas" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Modelo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.puente.ruedasLocas.modeloRuedas" :items="store.modelos" density="compact" />
        </v-col>
        <template v-if="store.puente.ruedasLocas.modeloRuedas === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique modelo de ruedas</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.ruedasLocas.modeloRuedasOtro" density="compact" />
          </v-col>
        </template>
      </v-row>

      <div class="custom-divider" />

      <!-- Total de ruedas (informativo) -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Total de ruedas (pzas)</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field :model-value="totalRuedas" suffix="pzas" readonly density="compact" />
        </v-col>
      </v-row>

      <div class="custom-divider" />

      <!-- Motorreductores y Motores -->
      <v-card-title>Motorreductores y Motores</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Cantidad de motorreductores</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model.number="store.puente.cantidadMotorreductores" type="number" min="0"
            :rules="[v => v >= 0 || 'No se permite negativos']" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Motorreductor / Modelo <b>{{ store.puente.cantidadMotorreductores > 0 ?
            'x' + store.puente.cantidadMotorreductores : ''
          }}</b></label>
        </v-col>
        <v-col cols="12" md="8">
          <v-combobox v-model="store.puente.motorreductorModelo" :items="store.motorreductor" density="compact" />
        </v-col>
        <template v-if="store.puente.motorreductorModelo === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique motorreductor / modelo</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.motorreductorModeloOtro" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Reductor</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.puente.reductor" density="compact" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Motor / Modelo</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="store.puente.motorModeloPuente" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-center">
              <label class="text-body-1">Motor / Potencia (Kw)</label>
            </v-col>
            <v-col cols="12" :md="store.puente.controlPuente == 'Contactores / Dos velocidades' ? 2 : 5">
              <v-text-field v-model.number="store.puente.motorPotenciaKw1" label="Motor" type="number" min="0"
                step="0.01" :rules="[v => v >= 0 || 'No se permite negativos']" suffix="Kw" density="compact" />
            </v-col>
            <v-col v-if="store.puente.controlPuente == 'Contactores / Dos velocidades'" cols="12" md="1"
              class="d-flex justify-center" no-gutters>
              <span class="text-center text-h3">/</span>
            </v-col>
            <v-col cols="12" md="2" v-if="store.puente.controlPuente == 'Contactores / Dos velocidades'">
              <v-text-field v-model.number="store.puente.motorPotenciaKw2" label="potencia (Kw)" type="number" min="0"
                step="0.01" :rules="[v => v >= 0 || 'No se permite negativos']" suffix="Kw" density="compact" />
            </v-col>
            <v-col cols="12" md="3" class="d-flex" v-if="store.puente.controlPuente == 'Contactores / Dos velocidades'">
              <div class="text-h4 font-weight-medium text-center mr-2">{{
                store.puente.motorPotenciaKw1 }}/{{
                  store.puente.motorPotenciaKw2 }}</div> <span class="text-h4 font-weight-medium text-center">
                Kw</span>
            </v-col>
            <v-col cols="12" md="3" class="d-flex" v-else>
              <div class="text-h4 font-weight-medium text-center mr-2">{{
                store.puente.motorPotenciaKw1 }}</div> <span class="text-h4 font-weight-medium text-center">
                Kw</span>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de pintura</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.datosBasicos.tipoPintura"
            :items="['Estandar SHOSA', 'Estandar SHO SA con sandblast', 'Otra con sandblast', 'Otra']"
            density="compact" />
        </v-col>
      </v-row>

      <div class="custom-divider" />

      <!-- Accesorios y Sistemas -->
      <v-card-title>Accesorios y Sistemas</v-card-title>
      <v-row>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.switchLimFinCarrDel" label="Interruptor límite de 2 pasos delantero"
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.interLimFinCarrTras" label="Interruptor límite de 2 pasos trasero"
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.sisAnticolisionDel" label="Sistema anticolisión delantero"
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.sisAnticolisionTras" label="Sistema anticolisión trasero"
            density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.topeHidraulico" v-if="showMe" label="Tope hidráulico" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.topeCelulosa" label="Tope celulosa" density="compact" />
        </v-col>
        <v-col cols="12" md="12">
          <v-checkbox v-model="store.puente.frenoElectrohidraulico" v-if="showMe" label="Freno electrohidráulico"
            density="compact" />
        </v-col>
      </v-row>

      <div class="custom-divider" />

      <!-- Alimentación y Área de Trabajo -->
      <v-card-title>Alimentación y Área de Trabajo</v-card-title>
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Tipo de alimentación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.puente.tipoAlimentacion"
            :items="['Festoon / cable plano', 'Cadena porta cable', 'Otros']" density="compact" />
        </v-col>
        <template v-if="store.puente.tipoAlimentacion === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique tipo de alimentación</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.especifiqueTipoAlimentacion" density="compact" />
          </v-col>
        </template>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1">Especifique sistema de alimentación</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-select v-model="store.puente.especifiqueSistemaAlimentacion" :items="['Ligero', 'Pesado', 'Otros']"
            density="compact" />
        </v-col>
        <template v-if="store.puente.especifiqueSistemaAlimentacion === 'Otros'">
          <v-col cols="12" md="4" class="d-flex align-center">
            <label class="text-body-1">Especifique sistema de alimentación</label>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="store.puente.especifiqueSistemaAlimentacionOtro" density="compact" />
          </v-col>
        </template>
      </v-row>

      <div class="custom-divider" />

      <!-- Observaciones -->
      <v-row>
        <v-col cols="12" md="4" class="d-flex align-center">
          <label class="text-body-1 font-weight-bold">Observaciones</label>
        </v-col>
        <v-col cols="12" md="8">
          <v-textarea variant="outlined" v-model="store.puente.observaciones" rows="2" density="compact" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { computed, onMounted, watch } from 'vue';
import { dataAppService } from '@/services/api';

defineOptions({
  name: 'Puente'
});

const store = useArticuloDefinicionesStore();
const codigoContruccion = ref([]);
const loading = ref(false);
const tabs = ref(0);
const showMe = computed(() => {
  if (['EVPE', 'ELKE', 'EKKE', 'EDKE', 'EHPE'].includes(store.articuloActual.itemCode)) return false;
  if (["ZKKE", "ZHPE", "ZVPE"].includes(store.articuloActual.itemCode)) return false;
  return true;
});


// Campo calculado para el total de ruedas
const totalRuedas = computed(() => {
  const cantidadMotrices = store.puente.ruedasMotrices?.cantidadRuedas || 0;
  const cantidadLocas = store.puente.ruedasLocas?.cantidadRuedas || 0;
  return cantidadMotrices + cantidadLocas;
});
const numberToString = (number) => {
  const numbers = [];
  for (let i = 1; i <= number; i++) {
    numbers.push(i);
  }
  return numbers.join(", ");
}
watch(() => store.puente.ruedasMotrices.diametroRuedas, (newValue) => {
  if (newValue && newValue > 0) {
    store.puente.ruedasLocas.diametroRuedas = newValue
  }
})
watch(() => store.puente.ruedasMotrices.materialRuedas, (newValue) => {
  if (newValue) {
    store.puente.ruedasLocas.materialRuedas = newValue
  }
})

// Inicialización de valores por defecto
onMounted(() => {
  // Inicializar ruedas motrices
  if (!store.puente.ruedasMotrices) {
    store.puente.ruedasMotrices = {
      cantidadRuedas: ["ZKKE", "ZHPE", "ZVPE"].includes(store.articuloActual.itemCode) ? 2 : 4,
      diametroRuedas: 0,
      tipoRuedaMotriz: null,
      tipoRuedaMotrizOtro: null,
      tipoRuedaLoca: null,
      tipoRuedaLocaOtro: null,
      materialRuedas: 'GGG70',
      modeloRuedas: null,
      modeloRuedasOtro: null,
    };
  }

  // Inicializar ruedas locas
  if (!store.puente.ruedasLocas) {
    store.puente.ruedasLocas = {
      cantidadRuedas: ["ZKKE", "ZHPE", "ZVPE"].includes(store.articuloActual.itemCode) ? 2 : 4,
      diametroRuedas: 0,
      materialRuedas: 'GGG70',
      modeloRuedas: null,
      modeloRuedasOtro: null,
    };
  }

  // Inicializar otros campos
  if (store.puente.cantidadMotorreductores === undefined) {
    store.puente.cantidadMotorreductores = 0;
  }
  if (store.puente.motorPotenciaKw === undefined) {
    store.puente.motorPotenciaKw = 0;
  }
});
async function getCodigoContruccion(ganchoType) {
  const tipo = ganchoType === 'Polipasto de Cadena' ? '436' : '433';
  loading.value = true;
  codigoContruccion.value = await (await dataAppService.getCodigoContruccion(tipo)).data.map((item) => item.itemCode);
  loading.value = false;
}
</script>

<style scoped>
/* Estilos específicos para este componente si son necesarios */
</style>
