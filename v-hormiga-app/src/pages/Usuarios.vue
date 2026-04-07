<template>
  <v-container fluid>
    <v-row align="center" class="mb-4">
      <v-col>
        <span class="text-h5 font-weight-medium">Gestión de Usuarios</span>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="nuevoUsuario">
          <v-icon prepend>mdi-plus</v-icon>
          Nuevo Usuario
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center">
        <span>Lista de Usuarios</span>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar usuario" single-line
          hide-details density="compact" class="max-width-300"></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="usuarios" :search="search" :loading="loading"
        :items-per-page="10" class="elevation-1" density="compact" hover>
        
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="warning" @click="editarUsuario(item)"
            title="Editar usuario" class="mr-1"></v-btn>
          <v-btn icon="mdi-trash-can" variant="text" size="small" color="error" @click="confirmarBorrado(item)"
            title="Eliminar usuario"></v-btn>
        </template>

        <template #no-data>
          <v-alert type="info" variant="tonal" class="ma-4">
            No se encontraron usuarios.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogo Crear/Editar -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.userName" label="Usuario SAP" :readonly="isEdit"
                  :rules="[v => !!v || 'Campo requerido']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.userDesc" label="Nombre Completo"
                  :rules="[v => !!v || 'Campo requerido']" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.email" label="Correo Electrónico" type="email"
                  :rules="[v => !!v || 'Campo requerido']" required></v-text-field>
              </v-col>
              <!-- En edición, la contraseña es opcional. En nuevo es obligatoria. -->
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.password" label="Contraseña SAP" type="password"
                  :hint="isEdit ? 'En blanco para mantenerla' : ''"
                  :persistent-hint="isEdit"
                  :rules="isEdit ? [] : [v => !!v || 'Campo requerido']" :required="!isEdit"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.serieSap" label="Serie SAP"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.numSerieSap" label="Número de Serie SAP"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-grey" variant="text" @click="cerrarDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="guardarUsuario" :loading="saving">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogo Confirmación Borrado -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">Confirmar Eliminación</v-card-title>
        <v-card-text class="pt-4">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete?.userName }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-grey" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="borrarUsuario" :loading="deleting">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usuariosService } from '@/services/api';

defineOptions({ name: 'Usuarios' });

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const search = ref('');
const usuarios = ref([]);
const dialog = ref(false);
const deleteDialog = ref(false);
const userToDelete = ref(null);
const isEdit = ref(false);

const formDefault = {
  userName: '',
  email: '',
  userDesc: '',
  password: '',
  serieSap: '',
  numSerieSap: '',
  imgUrl: ''
};
const form = ref({ ...formDefault });

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const headers = [
  { title: 'Usuario SAP', key: 'userName', sortable: true, width: '120px', minWidth: '120px', align: 'center' },
  { title: 'Nombre Completo', key: 'userDesc', sortable: true, minWidth: '200px', align: 'start' },
  { title: 'Correo', key: 'email', sortable: true, width: '220px', minWidth: '220px', align: 'start' },
  { title: 'Serie SAP', key: 'serieSap', sortable: true, width: '110px', minWidth: '110px', align: 'center' },
  { title: 'Num Serie', key: 'numSerieSap', sortable: true, width: '110px', minWidth: '110px', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '130px', minWidth: '130px', align: 'center' }
];

const mostrarMensaje = (msg, color = 'success') => {
  snackbar.value = { show: true, message: msg, color };
};

const cargarUsuarios = async () => {
  try {
    loading.value = true;
    const { data } = await usuariosService.getAll();
    usuarios.value = data || [];
  } catch (error) {
    mostrarMensaje('Error al cargar usuarios', 'error');
  } finally {
    loading.value = false;
  }
};

const nuevoUsuario = () => {
  isEdit.value = false;
  form.value = { ...formDefault };
  dialog.value = true;
};

const editarUsuario = (item) => {
  isEdit.value = true;
  form.value = {
    userName: item.userName,
    email: item.email,
    userDesc: item.userDesc,
    serieSap: item.serieSap || '',
    numSerieSap: item.numSerieSap || '',
    password: '', 
    imgUrl: item.imgUrl || ''
  };
  dialog.value = true;
};

const confirmarBorrado = (item) => {
  userToDelete.value = item;
  deleteDialog.value = true;
};

const borrarUsuario = async () => {
  try {
    deleting.value = true;
    await usuariosService.delete(userToDelete.value.userName);
    mostrarMensaje('Usuario eliminado correctamente');
    deleteDialog.value = false;
    await cargarUsuarios();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error al eliminar usuario';
    mostrarMensaje(errorMsg, 'error');
  } finally {
    deleting.value = false;
  }
};

const cerrarDialog = () => {
  dialog.value = false;
  form.value = { ...formDefault };
};

const guardarUsuario = async () => {
  if (!form.value.userName || !form.value.userDesc || !form.value.email || (!isEdit.value && !form.value.password)) {
    mostrarMensaje('Por favor completa todos los campos requeridos', 'warning');
    return;
  }

  try {
    saving.value = true;
    if (isEdit.value) {
      await usuariosService.update(form.value.userName, form.value);
      mostrarMensaje('Usuario actualizado correctamente');
    } else {
      await usuariosService.create(form.value);
      mostrarMensaje('Usuario creado exitosamente');
    }
    cerrarDialog();
    await cargarUsuarios();
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al guardar el usuario';
    mostrarMensaje(msg, 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>
