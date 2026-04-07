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
                  <v-form v-model="isValid" ref="formLogin" @submit.prevent="step === 1 ? handleSendPing() : handleVerifyPing()">
                    <!-- Step 1: Email -->
                    <div v-if="step === 1">
                      <v-text-field v-model="form.email" label="Correo Electrónico" type="email" prepend-inner-icon="mdi-email"
                        variant="outlined" density="comfortable" :rules="emailRules" required class="mb-6" 
                        @keydown.enter.prevent="handleSendPing" />

                      <v-btn color="primary" size="large" block :loading="loading" :disabled="!isValid"
                        class="mb-4" @click="handleSendPing">
                        Enviar Código
                      </v-btn>
                    </div>

                    <!-- Step 2: Ping Code -->
                    <div v-if="step === 2">
                      <p class="text-body-2 mb-4 text-center">
                        Hemos enviado un código a <b>{{ form.email }}</b>
                      </p>
                      <v-text-field v-model="form.pingCode" label="Código de 6 dígitos" type="text"
                        prepend-inner-icon="mdi-numeric" variant="outlined" density="comfortable" :rules="pingRules"
                        required class="mb-6" @keydown.enter.prevent="handleVerifyPing" maxlength="6" />

                      <v-btn color="primary" size="large" block :loading="loading" :disabled="!isValid"
                        class="mb-4" @click="handleVerifyPing">
                        Verificar e Ingresar
                      </v-btn>

                      <v-btn variant="text" block @click="step = 1" :disabled="loading">
                        Volver a ingresar correo
                      </v-btn>
                    </div>
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
import { handleApiError, handleApiSuccess } from '@/services/notification'

const router = useRouter()
const authStore = useAuthStore()
const loading = computed(() => authStore.getLoading)
const isValid = ref(false)
const formLogin = ref()
const step = ref(1)

const form = reactive({
  email: '',
  pingCode: '',
})

const emailRules = [
  v => !!v || 'El correo es requerido',
  v => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido'
]

const pingRules = [
  v => !!v || 'El código es requerido',
  v => v.length === 6 || 'El código debe tener 6 dígitos'
]

const handleSendPing = async () => {
  try {
    const { valid } = await formLogin.value.validate()
    if (valid) {
      const response = await authStore.sendPing(form.email)
      if (response.success) {
        handleApiSuccess('Código enviado. Revisa tu correo.')
        step.value = 2
      } else {
        handleApiError(new Error(response.error), 'Error al enviar código')
      }
    }
  } catch (error) {
    handleApiError(error, 'Error de conexión')
  }
}

const handleVerifyPing = async () => {
  try {
    const { valid } = await formLogin.value.validate()
    if (valid) {
      const response = await authStore.verifyPing(form.email, form.pingCode)
      if (response.success) {
        handleApiSuccess('¡Bienvenido!')
        router.push('/')
      } else {
        handleApiError(new Error(response.error), 'Error al verificar código')
      }
    }
  } catch (error) {
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
