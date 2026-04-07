<template>
  <v-app>
    <v-main class="login-main">
      <div class="login-container">
        <div class="login-card-wrapper">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="logo-placeholder">
              <img src="@/assets/logohormigasmall.png" alt="Hormiga Logo" />
              <!-- <h1 class="text-h4 font-weight-bold text-primary mt-4">HORMIGA</h1> -->
              <p class="text-subtitle-1 text-medium-emphasis">Grúas, Polipastos, Servicios</p>
            </div>
          </div>

          <!-- Content Section -->
          <div class="content-section">
            <div class="login-form">
              <v-card flat class="login-card">
                <v-card-title class="text-h4 font-weight-bold text-center mb-6">
                  Iniciar Sesión
                </v-card-title>

                <PreventRefresh>
                  <v-form v-model="isValid" ref="formLogin" @submit.prevent="handleLogin">
                    <v-text-field v-model="form.user" label="Usuario" type="text" prepend-inner-icon="mdi-email"
                      variant="outlined" density="comfortable" :rules="emailRules" required class="mb-4" />

                    <v-text-field v-model="form.password" label="Contraseña" type="password"
                      prepend-inner-icon="mdi-lock" variant="outlined" density="comfortable" :rules="passwordRules"
                      required class="mb-6" @keydown.enter.prevent="handleLogin" />

                    <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="!isValid"
                      class="mb-4">
                      Iniciar Sesión
                    </v-btn>

                  </v-form>
                </PreventRefresh>
              </v-card>
            </div>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
defineOptions({
  name: 'Login',
  meta: {
    layout: 'login'
  }
})
import PreventRefresh from '@/components/PreventRefresh.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const loading = computed(() => authStore.getLoading)
const isValid = ref(false)
const formLogin = ref()

const form = reactive({
  user: '',
  password: '',
})

const emailRules = [
  v => !!v || 'El usuario es requerido',
  // v => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => v.length >= 3 || 'La contraseña debe tener al menos 6 caracteres'
]

import { handleApiError, handleApiSuccess } from '@/services/notification'

const handleLogin = async (event) => {
  // Prevenir el comportamiento por defecto del formulario
  if (event) {
    event.preventDefault()
  }

  try {
    // Validar el formulario
    const { valid } = await formLogin.value.validate()

    if (valid) {
      const response = await authStore.login({
        userName: form.user,
        password: form.password
      })

      if (response.success) {
        handleApiSuccess('¡Bienvenido!')
        // Redirigir al dashboard después del login exitoso
        router.push('/')
      } else {
        console.error('Error en login:', response.error)
        handleApiError(new Error(response.error), 'Error al iniciar sesión')
      }
    }
  } catch (error) {
    console.error('Error en login:', error)
    handleApiError(error, 'Error de conexión')
  }
}
</script>

<style scoped>
.login-main {
  background: linear-gradient(135deg, #f5f6fa 0%, #e3f2fd 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
}

.login-card-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(13, 56, 120, 0.1);
  overflow: hidden;
  display: flex;
  min-height: 600px;
}

.logo-section {
  flex: 1;
  background: linear-gradient(135deg, #0d3878 0%, #1976d2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
}

.logo-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.logo-placeholder {
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.content-section {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 960px) {
  .login-card-wrapper {
    flex-direction: column;
    min-height: auto;
  }

  .logo-section {
    padding: 2rem;
    min-height: 200px;
  }

  .content-section {
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .login-container {
    padding: 1rem;
  }

  .logo-section {
    padding: 1.5rem;
  }

  .content-section {
    padding: 1.5rem;
  }
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: transparent;
  box-shadow: none;
}

/* Animación de entrada */
.login-form {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
