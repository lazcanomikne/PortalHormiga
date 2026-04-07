<template>
  <v-navigation-drawer :rail="!sidebar.open" expand-on-hover :permanent="isDesktop" :temporary="!isDesktop" app
    width="280" class="sidebar">
    <!-- Header del Sidebar con Logo -->
    <div class="pa-4 d-flex justify-center align-center" v-if="sidebar.open" style="height: 64px;">
        <img :src="theme.current.value.dark ? '/assets/logohormigasmalldark.png' : '/assets/logohormigasmall.png'"
             alt="Hormiga Logo"
             style="max-height: 40px; max-width: 100%; object-fit: contain; transition: all 0.3s ease;" />
    </div>
    <v-divider v-if="sidebar.open" class="mb-2" />

    <v-list v-model:opened="open" density="compact" nav>
      <template v-for="item in menu" :key="item.label">
        <!-- Caso: Item con hijos (Submenú) -->
        <v-list-group v-if="item.child" :value="item.label">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :title="item.label" 
              :active="item.child.some(ch => route.path === ch.route)"
              class="parent-item">
              <template v-slot:prepend>
                <v-badge dot color="primary" :model-value="item.child.some(ch => route.path === ch.route)" offset-x="4" offset-y="4">
                  <v-icon :icon="item.icon"></v-icon>
                </v-badge>
              </template>
            </v-list-item>
          </template>
          
          <v-list-item v-for="ch in item.child" :key="ch.label" :to="ch.route" :title="ch.label"
            :active="route.path === ch.route" link class="child-item">
            <template v-slot:prepend>
              <v-badge dot color="primary" :model-value="route.path === ch.route" offset-x="4" offset-y="4" size="x-small">
                <v-icon :icon="ch.icon || 'mdi-circle-small'" size="small"></v-icon>
              </v-badge>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Caso: Item sin hijos (Link directo) -->
        <v-list-item v-else :to="item.route" :title="item.label"
          :active="route.path === item.route" link class="parent-item">
          <template v-slot:prepend>
            <v-badge dot color="primary" :model-value="route.path === item.route" offset-x="4" offset-y="4">
              <v-icon :icon="item.icon"></v-icon>
            </v-badge>
          </template>
        </v-list-item>
      </template>
    </v-list>

    <template #append>
      <v-divider />
      <v-list-item @click="navegarASettings" prepend-icon="mdi-cog" title="Settings" class="parent-item"></v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { usePageNavigationStore } from '@/stores/usePageNavigationStore'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const sidebar = useSidebarStore()
const pageNavigationStore = usePageNavigationStore()
const route = useRoute()
const router = useRouter()
const theme = useTheme()
const isDesktop = computed(() => window.innerWidth >= 768)
const open = ref([])

// Computed para obtener la navegación de la página actual
const pageNavigation = computed(() => pageNavigationStore.navigationByPage)

// Observar cambios en la ruta para regenerar la navegación
watch(route, () => {
  // Esperar a que el DOM se actualice
  setTimeout(() => {
    pageNavigationStore.generatePageNavigation(route.fullPath)
  }, 100)
}, { immediate: false })

// Generar navegación al montar el componente
onMounted(() => {
  pageNavigationStore.generatePageNavigation(route.fullPath)
})

const menu = [
  {
    label: 'Inicio', icon: 'mdi-home-variant-outline', route: '/', active: route.path === '/'
  },
  {
    label: 'Ventas', icon: 'mdi-briefcase', child: [
      { label: 'Oferta (Crear / Actualizar)', icon: 'mdi-file-document-edit', route: '/oferta', active: route.path === '/oferta' },
      { label: 'Cotizaciones', icon: 'mdi-file-document-multiple', route: '/cotizaciones', active: route.path === '/cotizaciones' },
      { label: 'Autorizaciones', icon: 'mdi-check-decagram', route: '/autorizaciones', active: route.path === '/autorizaciones' },
    ]
  },
  {
    label: 'Administración', icon: 'mdi-shield-account', child: [
      { label: 'Gestión de Usuarios', icon: 'mdi-account-group', route: '/usuarios', active: route.path === '/usuarios' }
    ]
  }
]

// Navegar a la página de Settings
const navegarASettings = () => {
  router.push('/settings');
}
</script>

<style scoped>
.sidebar {
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estilo para los ítems del menú */
.v-list-item {
  margin: 4px 8px !important;
  border-radius: 8px !important;
  min-height: 44px !important;
}

/* Fondo sutil en modo expandido para ítems principales */
.sidebar:not(.v-navigation-drawer--rail) .v-list-item--active:not(.child-item) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  margin: 4px 12px !important;
  border-radius: 8px !important;
}

/* Fondo para sub-items en modo expandido */
.sidebar:not(.v-navigation-drawer--rail) .child-item.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
  margin: 2px 12px 2px 32px !important;
  border-radius: 6px !important;
}

/* Alineación de sub-menús expandidos */
:deep(.v-list-group__items) .v-list-item {
  padding-inline-start: 12px !important;
}

.child-item {
  padding-left: 24px !important;
}

/* Color y estilo cuando está activo */
.v-list-item--active {
  color: rgb(var(--v-theme-primary)) !important;
}

.v-list-item--active :deep(.v-icon) {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Ajustes para modo RAIL (Colapsado) */
:deep(.v-navigation-drawer--rail) .v-list {
  padding-inline: 0 !important;
}

:deep(.v-navigation-drawer--rail) .v-list-item {
  margin: 4px 0 !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
}

:deep(.v-navigation-drawer--rail) .child-item {
  margin-left: 0 !important;
  padding-left: 0 !important;
}

:deep(.v-navigation-drawer--rail) .v-list-item__prepend {
  width: 50px !important;
  height: 32px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  margin: 0 !important;
  position: relative !important;
}

/* Cápsula centrada en modo RAIL usando el contenedor prepend */
:deep(.v-navigation-drawer--rail) .v-list-item--active .v-list-item__prepend {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  border-radius: 16px !important;
}

/* Garantizar que el badge y el icono sean visibles */
:deep(.v-navigation-drawer--rail) .v-list-item__prepend > * {
  z-index: 2;
}

/* Garantizar que el badge sea visible en rail */
:deep(.v-badge--dot .v-badge__badge) {
  width: 8px;
  height: 8px;
  border: 1.5px solid white;
}

/* En modo rail quitamos la línea vertical para evitar desbalance */
:deep(.v-navigation-drawer--rail) .v-list-item--active::before {
  display: none;
}

/* Línea vertical de acento para modo expandido */
.sidebar:not(.v-navigation-drawer--rail) .v-list-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 0 4px 4px 0;
}
</style>
