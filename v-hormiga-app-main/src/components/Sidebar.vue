<template>
  <v-navigation-drawer :rail="!sidebar.open" expand-on-hover :permanent="isDesktop" :temporary="!isDesktop" app
    width="300" class="sidebar">
    <v-list dense>
      <v-list-item>
        <v-list-item-avatar>
          <img :src="theme.current.value.dark ? 'assets/logohormigasmalldark.png' : 'assets/logohormigasmall.png'"
            alt="Hormiga Logo" />
        </v-list-item-avatar>
      </v-list-item>
      <v-divider />
    </v-list>
    <v-list v-model="open" density="compact" v-for="item in menu" :key="item.label" :to="item.route"
      :active="route.path === item.route">
      <v-list-group :value="item.label" exact-path link="false">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-content>
              <v-list-item-title> {{ item.label }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-list-item v-for="ch in item.child" :key="ch.label" :to="ch.route" :active="route.path === ch.route">
          <template v-slot:prepend>
            <v-icon :icon="ch.icon"></v-icon>
          </template>
          <v-list-item-title v-text="ch.label"></v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
    <template #append>
      <v-divider />
      <v-list-item @click="navegarASettings">
        <template v-slot:prepend>
          <v-icon icon="mdi-cog"></v-icon>
        </template>
        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item>
    </template>
    <v-divider></v-divider>

    <!-- Navegación automática basada en IDs de la página -->
    <!-- Navegación automática eliminada -->
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
const open = ref('')

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
    label: 'Ventas', icon: 'mdi-briefcase', child: [
      { label: 'Oferta', icon: 'mdi-file-document-edit', route: '/oferta', active: route.path === '/oferta' },
      { label: 'Cotizaciones', icon: 'mdi-file-document-multiple', route: '/cotizaciones', active: route.path === '/cotizaciones' },
      { label: 'Autorizaciones', icon: 'mdi-check-decagram', route: '/autorizaciones', active: route.path === '/autorizaciones' },
    ]
  },
]

// Navegar a la página de Settings
const navegarASettings = () => {
  router.push('/settings');
}
</script>

<style scoped>
.page-nav-item {
  margin-left: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.page-nav-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.page-nav-item .v-list-item-title {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
