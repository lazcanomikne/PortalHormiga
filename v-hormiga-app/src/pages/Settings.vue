<template>
  <v-container fluid>
    <v-row align="center" class="mb-4">
      <v-col>
        <span class="text-h5 font-weight-medium">Configuración del Usuario</span>
      </v-col>
    </v-row>

    <!-- Información del Usuario -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-account-circle" class="mr-2"></v-icon>
        Información del Perfil
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="userInfo.userName" label="Usuario" readonly density="compact" variant="outlined"
              prepend-inner-icon="mdi-account"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="userInfo.userDesc" label="Descripcion" readonly density="compact" variant="outlined"
              prepend-inner-icon="mdi-account"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Cambiar Contraseña -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-lock-reset" class="mr-2"></v-icon>
        Cambiar Contraseña
      </v-card-title>
      <v-card-text>
        <v-form ref="passwordForm" v-model="passwordFormValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="passwordData.currentPassword" label="Contraseña Actual" type="password"
                density="compact" variant="outlined" prepend-inner-icon="mdi-lock"
                :rules="[v => !!v || 'La contraseña actual es requerida']" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="passwordData.newPassword" label="Nueva Contraseña" type="password"
                density="compact" variant="outlined" prepend-inner-icon="mdi-lock-plus" :rules="[
                  v => !!v || 'La nueva contraseña es requerida',
                  v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
                  v => /[A-Z]/.test(v) || 'Debe contener al menos una mayúscula',
                  v => /[a-z]/.test(v) || 'Debe contener al menos una minúscula',
                  v => /[0-9]/.test(v) || 'Debe contener al menos un número'
                ]" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="passwordData.confirmPassword" label="Confirmar Nueva Contraseña" type="password"
                density="compact" variant="outlined" prepend-inner-icon="mdi-lock-check" :rules="[
                  v => !!v || 'Debe confirmar la nueva contraseña',
                  v => v === passwordData.newPassword || 'Las contraseñas no coinciden'
                ]" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-btn color="primary" @click="cambiarContraseña" :loading="loadingPassword"
                :disabled="!passwordFormValid" prepend-icon="mdi-content-save">
                Cambiar Contraseña
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Información de la Sesión -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-information" class="mr-2"></v-icon>
        Información de la Sesión
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field :value="sessionInfo.fechaInicio" label="Fecha de Inicio de Sesión" readonly density="compact"
              variant="outlined" prepend-inner-icon="mdi-calendar-start"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :value="sessionInfo.ipAddress" label="Dirección IP" readonly density="compact"
              variant="outlined" prepend-inner-icon="mdi-ip-network"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :value="sessionInfo.navegador" label="Navegador" readonly density="compact" variant="outlined"
              prepend-inner-icon="mdi-web"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :value="sessionInfo.sistemaOperativo" label="Sistema Operativo" readonly density="compact"
              variant="outlined" prepend-inner-icon="mdi-desktop-classic"></v-text-field>
          </v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="warning" @click="cerrarSesion" prepend-icon="mdi-logout">
              Cerrar Sesión
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template #actions>
        <v-btn color="white" text @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'Settings'
});

const router = useRouter();
const authStore = useAuthStore();
const passwordForm = ref(null);
const passwordFormValid = ref(false);
const loadingPassword = ref(false);
const loadingPreferences = ref(false);

// Información del usuario
const userInfo = ref({
  nombre: '',
  apellido: '',
  email: '',
  rol: '',
  ultimoAcceso: '',
  estado: ''
});

// Datos para cambiar contraseña
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Preferencias de la aplicación
const preferencias = ref({
  idioma: 'es',
  tema: 'light',
  zonaHoraria: 'America/Mexico_City',
  moneda: 'MXN',
  notificacionesEmail: true,
  notificacionesPush: true
});

// Información de la sesión
const sessionInfo = ref({
  fechaInicio: '',
  ipAddress: '',
  navegador: '',
  sistemaOperativo: ''
});

// Configuración del snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
});

// Cargar información del usuario
const cargarInformacionUsuario = async () => {
  try {
    // Obtener información del perfil desde la API
    const response = await authService.profile();
    const profileData = response.data;

    // Actualizar la información del usuario
    userInfo.value = {
      nombre: profileData.nombre || 'Usuario',
      apellido: profileData.apellido || '',
      email: profileData.email || authStore.getUser?.email || '',
      rol: profileData.rol || 'Usuario',
      ultimoAcceso: profileData.ultimoAcceso || new Date().toLocaleString('es-ES'),
      estado: profileData.estado || 'Activo'
    };

    // Cargar preferencias guardadas
    if (profileData.preferencias) {
      preferencias.value = { ...preferencias.value, ...profileData.preferencias };
    }

  } catch (error) {
    console.error('Error al cargar información del usuario:', error);
    // Usar información del store si falla la API
    const user = authStore.getUser;
    if (user) {
      userInfo.value = {
        userName: user.userName || 'Usuario',
        userDesc: user.userDesc || '',
      };
    }
  }
};

// Obtener información del navegador
const obtenerInformacionNavegador = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  // Detectar navegador
  let navegador = 'Desconocido';
  if (userAgent.includes('Chrome')) navegador = 'Chrome';
  else if (userAgent.includes('Firefox')) navegador = 'Firefox';
  else if (userAgent.includes('Safari')) navegador = 'Safari';
  else if (userAgent.includes('Edge')) navegador = 'Edge';

  // Detectar sistema operativo
  let sistemaOperativo = 'Desconocido';
  if (platform.includes('Win')) sistemaOperativo = 'Windows';
  else if (platform.includes('Mac')) sistemaOperativo = 'macOS';
  else if (platform.includes('Linux')) sistemaOperativo = 'Linux';

  sessionInfo.value = {
    fechaInicio: new Date().toLocaleString('es-ES'),
    ipAddress: 'Detectando...',
    navegador: navegador,
    sistemaOperativo: sistemaOperativo
  };

  // Intentar obtener la IP (opcional)
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      sessionInfo.value.ipAddress = data.ip;
    })
    .catch(() => {
      sessionInfo.value.ipAddress = 'No disponible';
    });
};

// Cambiar contraseña
const cambiarContraseña = async () => {
  if (!passwordForm.value.validate()) {
    return;
  }

  try {
    loadingPassword.value = true;

    // Llamar al método del store para cambiar contraseña
    const resultado = await authStore.changePassword({
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    });

    if (resultado.success) {
      // Limpiar el formulario
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

      mostrarMensaje(resultado.message, 'success');
    }

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    mostrarMensaje('Error al cambiar la contraseña: ' + (error.message || 'Error desconocido'), 'error');
  } finally {
    loadingPassword.value = false;
  }
};

// Guardar preferencias
const guardarPreferencias = async () => {
  try {
    loadingPreferences.value = true;

    // Aquí deberías llamar a la API para guardar las preferencias
    await authService.updateProfile({ preferencias: preferencias.value });

    mostrarMensaje('Preferencias guardadas exitosamente', 'success');

  } catch (error) {
    console.error('Error al guardar preferencias:', error);
    mostrarMensaje('Error al guardar las preferencias', 'error');
  } finally {
    loadingPreferences.value = false;
  }
};

// Cerrar sesión
const cerrarSesion = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Forzar redirección
    router.push('/login');
  }
};

// Mostrar mensaje
const mostrarMensaje = (mensaje, tipo = 'success') => {
  snackbar.value = {
    show: true,
    message: mensaje,
    color: tipo,
    timeout: 3000
  };
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarInformacionUsuario();
  obtenerInformacionNavegador();
});
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 16px;
}

.v-btn {
  border-radius: 8px;
}
</style>
