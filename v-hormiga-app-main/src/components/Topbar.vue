<template>
  <v-app-bar app flat>
    <v-app-bar-nav-icon @click="sidebar.toggle" />
    <v-avatar class="mr-2">
      <img v-if="user?.imgUrl" :src="user.imgUrl" alt="Avatar" />
      <v-icon v-else>mdi-account-circle</v-icon>
    </v-avatar>
    <span class="font-weight-medium">
      Bienvenido {{ user?.userDesc || 'Usuario' }}
      <span>({{ user?.userName || 'Usuario' }})</span>
    </span>
    <v-spacer />

    <!-- Botón de cambio de tema -->
    <v-btn icon @click="toggleTheme()" :title="themeStore.getThemeTooltip" class="mr-2 theme-toggle"
      :color="theme.current.value.dark ? 'warning' : 'primary'">
      <v-icon>{{ themeStore.getThemeIcon }}</v-icon>
    </v-btn>

    <!-- Botón de logout -->
    <v-btn icon @click="logout" title="Salir" :loading="authStore.getLoading" color="error">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const router = useRouter()
const sidebar = useSidebarStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const theme = useTheme()

const user = computed(() => authStore.getUser)

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error en logout:', error)
  }
}
const toggleTheme = () => {
  theme.toggle()
}
// Inicializar el tema al montar el componente
onMounted(() => {
  themeStore.applyThemeToVuetify()
})

// Observar cambios en el tema para aplicar clases al body
watch(() => themeStore.getTheme, (newTheme) => {
  // Aplicar clase al body para estilos globales
  document.body.className = document.body.className
    .replace(/v-theme--(light|dark)/g, '')
    .trim()

  if (newTheme) {
    document.body.classList.add(`v-theme--${newTheme}`)
  }
}, { immediate: true })
</script>

<style scoped>
.theme-toggle {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.v-app-bar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
