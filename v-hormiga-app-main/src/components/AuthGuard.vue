<template>
  <div v-if="isLoading" class="auth-loading">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    />
    <p class="mt-4 text-body-1">Verificando autenticación...</p>
  </div>
  <router-view v-else />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)

onMounted(async () => {
  try {
    const isAuthenticated = await authStore.checkAuth()

    if (!isAuthenticated) {
      // Si no está autenticado, redirigir al login
      router.push('/login')
    }
  } catch (error) {
    console.error('Error verificando autenticación:', error)
    router.push('/login')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f6fa 0%, #e3f2fd 100%);
}
</style>
