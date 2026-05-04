<template>
  <v-container fluid class="pa-6">
    <!-- Header de Bienvenida -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold text-primary mb-2">
          Bienvenido
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Resumen de actividad en Portal Hormiga
        </p>
      </v-col>
    </v-row>

    <!-- KPIs / Tarjetas de Resumen -->
    <v-row class="mb-6">
      <!-- Total Ofertas -->
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100 rounded-lg">
          <v-card-text class="d-flex flex-column align-center justify-center pa-4">
            <v-icon icon="mdi-file-document-multiple-outline" size="48" color="primary" class="mb-3"></v-icon>
            <div class="text-h4 font-weight-bold mb-1">{{ stats.total }}</div>
            <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">Total Ofertas</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- En Validación -->
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100 rounded-lg">
          <v-card-text class="d-flex flex-column align-center justify-center pa-4">
            <v-icon icon="mdi-clipboard-clock-outline" size="48" color="info" class="mb-3"></v-icon>
            <div class="text-h4 font-weight-bold mb-1 text-info">{{ stats.validacion }}</div>
            <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">En Validación Costos</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Aprobadas -->
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100 rounded-lg">
          <v-card-text class="d-flex flex-column align-center justify-center pa-4">
            <v-icon icon="mdi-check-decagram-outline" size="48" color="success" class="mb-3"></v-icon>
            <div class="text-h4 font-weight-bold mb-1 text-success">{{ stats.aprobadas }}</div>
            <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">Aprobadas / Orden Venta</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Pedidos SAP (Simulado o real si hay status) -->
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100 rounded-lg">
          <v-card-text class="d-flex flex-column align-center justify-center pa-4">
            <v-icon icon="mdi-cube-send" size="48" color="warning" class="mb-3"></v-icon>
            <div class="text-h4 font-weight-bold mb-1 text-warning">{{ stats.pedidos }}</div>
            <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">Completadas</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Actividad Reciente y Acciones Rápidas -->
    <v-row>
      <!-- Tabla de Actividad Reciente -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="d-flex align-center py-3 px-4">
            <span class="text-h6 font-weight-medium">Ofertas Recientes</span>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" to="/cotizaciones" size="small">
              Ver todas
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-data-table
            :headers="headers"
            :items="recentQuotes"
            :loading="loading"
            density="comfortable"
            hide-default-footer
            class="recent-table"
          >
            <template #item.estado="{ item }">
              <v-chip :color="getColorEstado(item.estado)" size="x-small" label class="font-weight-medium">
                {{ item.estado || 'Abierto' }}
              </v-chip>
            </template>
            <template #item.fecha="{ item }">
              <span class="text-body-2 text-medium-emphasis">
                {{ formatDate(item.fecha) }}
              </span>
            </template>
            <template #bottom></template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Acciones Rápidas -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg mb-6">
          <v-card-title class="py-3 px-4 text-h6 font-weight-medium">Acciones Rápidas</v-card-title>
          <v-divider></v-divider>
          <v-list class="py-2">
            <v-list-item :to="{ path: '/oferta', query: { nueva: '1' } }" color="primary" rounded="lg" class="mx-2 mb-1">
              <template v-slot:prepend>
                <v-avatar color="primary" variant="tonal" rounded>
                  <v-icon icon="mdi-plus"></v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">Nueva Oferta</v-list-item-title>
              <v-list-item-subtitle>Crear una nueva cotización</v-list-item-subtitle>
            </v-list-item>

            <v-list-item to="/cotizaciones" color="secondary" rounded="lg" class="mx-2">
              <template v-slot:prepend>
                <v-avatar color="secondary" variant="tonal" rounded>
                  <v-icon icon="mdi-magnify"></v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">Buscar Oferta</v-list-item-title>
              <v-list-item-subtitle>Consultar historial</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Banner de Ayuda o Info Adicional -->
        <v-card color="primary" variant="tonal" class="rounded-lg">
          <v-card-text class="d-flex flex-column align-start">
            <div class="text-h6 font-weight-bold mb-1">¿Necesitas ayuda?</div>
            <p class="text-body-2 mb-3">Contacta al soporte técnico para reportar problemas.</p>
            <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-lifebuoy">
              Soporte
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { cotizacionService } from '@/services/api';
import moment from 'moment';

const loading = ref(false);
const cotizaciones = ref([]);

// Stats KPIs
const stats = computed(() => {
  const all = cotizaciones.value;
  return {
    total: all.length,
    validacion: all.filter(c => c.estado === 'Validacion Costos').length,
    aprobadas: all.filter(c => c.estado === 'Aprobada' || c.estado === 'Orden de Venta').length, // Asumiendo estados
    pedidos: all.filter(c => c.estado === 'Completada' || c.estado === 'Cerrada').length // Asumiendo estados
  };
});

// Recent Activity (Top 5)
const recentQuotes = computed(() => {
  // Ordenar por fecha descendente (asumiendo que fecha es string ISO o similar, si no, parsear)
  // Si la fecha viene como string "DD/MM/YYYY" o similar, moment ayudaria.
  // Vamos a asumir que el API devuelve las más recientes primero o las ordenamos simple.
  return [...cotizaciones.value]
    .sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha)) 
    .slice(0, 5);
});

const headers = [
  { title: 'Folio', key: 'folioPortal', align: 'start' },
  { title: 'Cliente', key: 'cliente' },
  { title: 'Fecha', key: 'fecha', align: 'end' },
  { title: 'Estado', key: 'estado', align: 'end' },
];

const cargarDatos = async () => {
  try {
    loading.value = true;
    const response = await cotizacionService.getAll();
    cotizaciones.value = response.data || [];
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  } finally {
    loading.value = false;
  }
};

const getColorEstado = (estado) => {
  if (!estado) return 'grey';
  const e = estado.toLowerCase();
  if (e.includes('aprobada') || e.includes('venta')) return 'success';
  if (e.includes('validac')) return 'info';
  if (e.includes('rechaza')) return 'error';
  if (e.includes('borrador')) return 'orange';
  if (e.includes('abierto')) return 'grey';
  if (e.includes('cerrad') || e.includes('complet')) return 'grey-darken-1';
  return 'grey';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return moment(dateStr).format('DD/MM/YYYY');
};

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.recent-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
