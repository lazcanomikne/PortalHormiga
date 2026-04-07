# Servicios de API

Este directorio contiene todos los servicios para manejar las comunicaciones con el backend.

## Archivos

### `api.js`
Configuración principal de axios con interceptores para:
- Headers automáticos (Authorization, Content-Type, etc.)
- Manejo de errores centralizado
- Logs en desarrollo
- Servicios específicos por módulo

### `notification.js`
Servicio para manejar notificaciones de manera consistente:
- Notificaciones de éxito, error, advertencia, información
- Helpers para manejar errores de API
- Integración con Vuetify Snackbar

## Uso

### Configuración de Variables de Entorno

Crea un archivo `.env` basado en `env.example`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=HORMIGA
VITE_APP_VERSION=1.0.0
```

### Uso de Servicios

```javascript
import { authService, cotizacionService, notificationService } from '@/services/api'

// Login
try {
  const response = await authService.login({ user: 'admin', password: '123' })
  notificationService.success('Login exitoso')
} catch (error) {
  notificationService.error('Error en login')
}

// Obtener cotizaciones
try {
  const cotizaciones = await cotizacionService.getAll({ page: 1, limit: 10 })
} catch (error) {
  // El interceptor maneja automáticamente los errores
}
```

### Headers Automáticos

Los siguientes headers se agregan automáticamente a todas las peticiones:

- `Authorization: Bearer {token}` - Token de autenticación
- `Content-Type: application/json` - Tipo de contenido
- `Accept: application/json` - Aceptación de respuestas JSON
- `X-Requested-With: XMLHttpRequest` - Identificador de petición AJAX
- `X-Client-Version: 1.0.0` - Versión del cliente
- `X-Client-Name: hormiga-app` - Nombre del cliente

### Manejo de Errores

Los errores se manejan automáticamente según el código de estado:

- **401**: Token expirado → Logout automático
- **403**: Acceso denegado → Notificación de error
- **404**: Recurso no encontrado → Notificación de error
- **422**: Error de validación → Notificación de errores específicos
- **500**: Error del servidor → Notificación de error

### Servicios Disponibles

#### AuthService
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `refresh()` - Renovar token
- `forgotPassword(email)` - Recuperar contraseña
- `resetPassword(token, password)` - Resetear contraseña
- `profile()` - Obtener perfil
- `updateProfile(data)` - Actualizar perfil

#### CotizacionService
- `getAll(params)` - Obtener todas las cotizaciones
- `getById(id)` - Obtener cotización por ID
- `create(data)` - Crear cotización
- `update(id, data)` - Actualizar cotización
- `delete(id)` - Eliminar cotización
- `save(id, data)` - Guardar cotización

#### ArticlesService
- `getAll(params)` - Obtener todos los artículos
- `getById(id)` - Obtener artículo por ID
- `create(data)` - Crear artículo
- `update(id, data)` - Actualizar artículo
- `delete(id)` - Eliminar artículo
- `getDefiniciones(id)` - Obtener definiciones del artículo
- `updateDefiniciones(id, data)` - Actualizar definiciones

#### BahiasService
- `getAll(params)` - Obtener todas las bahías
- `getById(id)` - Obtener bahía por ID
- `create(data)` - Crear bahía
- `update(id, data)` - Actualizar bahía
- `delete(id)` - Eliminar bahía
- `getDefiniciones(id)` - Obtener definiciones de la bahía
- `updateDefiniciones(id, data)` - Actualizar definiciones

#### ClientesService
- `getAll(params)` - Obtener todos los clientes
- `getById(id)` - Obtener cliente por ID
- `create(data)` - Crear cliente
- `update(id, data)` - Actualizar cliente
- `delete(id)` - Eliminar cliente
- `search(query)` - Buscar clientes

### Notificaciones

```javascript
import { notificationService } from '@/services/notification'

// Notificaciones básicas
notificationService.success('Operación exitosa')
notificationService.error('Ha ocurrido un error')
notificationService.warning('Advertencia')
notificationService.info('Información')

// Notificación de carga
const loadingId = notificationService.loading('Procesando...')
// ... hacer algo
notificationService.close(loadingId)

// Helpers para API
import { handleApiError, handleApiSuccess } from '@/services/notification'

try {
  await someApiCall()
  handleApiSuccess('Operación completada')
} catch (error) {
  handleApiError(error, 'Error personalizado')
}
```

## Desarrollo

### Logs

En modo desarrollo, todas las peticiones y respuestas se logean en la consola con emojis para fácil identificación:

- 🚀 API Request - Peticiones salientes
- ✅ API Response - Respuestas exitosas
- ❌ API Response Error - Errores de respuesta

### Testing

Para testing, puedes mockear los servicios:

```javascript
// En tests
import { authService } from '@/services/api'
import { vi } from 'vitest'

vi.mock('@/services/api', () => ({
  authService: {
    login: vi.fn()
  }
}))
``` 