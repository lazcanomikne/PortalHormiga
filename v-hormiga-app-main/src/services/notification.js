// Servicio para manejar notificaciones sin dependencia de Vuetify Snackbar
export const notificationService = {
  // Mostrar notificación de éxito
  success(message, options = {}) {
    this.showNotification(message, 'success', options)
  },

  // Mostrar notificación de error
  error(message, options = {}) {
    this.showNotification(message, 'error', options)
  },

  // Mostrar notificación de advertencia
  warning(message, options = {}) {
    this.showNotification(message, 'warning', options)
  },

  // Mostrar notificación de información
  info(message, options = {}) {
    this.showNotification(message, 'info', options)
  },

  // Método principal para mostrar notificaciones
  showNotification(message, type = 'info', options = {}) {
    // Crear elemento de notificación
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

    // Agregar estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      animation: slideInRight 0.3s ease-out;
    `

    // Agregar estilos para el contenido
    const content = notification.querySelector('.notification-content')
    content.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    `

    // Agregar estilos para el botón de cerrar
    const closeBtn = notification.querySelector('.notification-close')
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin: 0;
      opacity: 0.8;
      transition: opacity 0.2s;
    `

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '1'
    })

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.opacity = '0.8'
    })

    // Agregar animación CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)

    // Agregar al DOM
    document.body.appendChild(notification)

    // Auto-remover después del timeout
    const timeout = options.timeout || (type === 'error' ? 6000 : 4000)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in'
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove()
          }
        }, 300)
      }
    }, timeout)
  },

  // Obtener color según el tipo
  getColor(type) {
    const colors = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3'
    }
    return colors[type] || colors.info
  },

  // Cerrar todas las notificaciones
  closeAll() {
    const notifications = document.querySelectorAll('.notification')
    notifications.forEach(notification => notification.remove())
  }
}
//   // Mostrar notificación de éxito
//   success(message, options = {}) {
//     const snackbar = useSnackbar()
//     snackbar.add({
//       text: message,
//       color: 'success',
//       timeout: options.timeout || 4000,
//       location: options.location || 'top',
//       ...options
//     })
//   },

//   // Mostrar notificación de error
//   error(message, options = {}) {
//     const snackbar = useSnackbar()
//     snackbar.add({
//       text: message,
//       color: 'error',
//       timeout: options.timeout || 6000,
//       location: options.location || 'top',
//       ...options
//     })
//   },

//   // Mostrar notificación de advertencia
//   warning(message, options = {}) {
//     const snackbar = useSnackbar()
//     snackbar.add({
//       text: message,
//       color: 'warning',
//       timeout: options.timeout || 5000,
//       location: options.location || 'top',
//       ...options
//     })
//   },

//   // Mostrar notificación de información
//   info(message, options = {}) {
//     const snackbar = useSnackbar()
//     snackbar.add({
//       text: message,
//       color: 'info',
//       timeout: options.timeout || 4000,
//       location: options.location || 'top',
//       ...options
//     })
//   },

//   // Mostrar notificación de carga
//   loading(message = 'Cargando...', options = {}) {
//     const snackbar = useSnackbar()
//     return snackbar.add({
//       text: message,
//       color: 'primary',
//       loading: true,
//       timeout: -1, // Sin timeout
//       location: options.location || 'top',
//       ...options
//     })
//   },

//   // Cerrar notificación específica
//   close(id) {
//     const snackbar = useSnackbar()
//     snackbar.remove(id)
//   },

//   // Cerrar todas las notificaciones
//   closeAll() {
//     const snackbar = useSnackbar()
//     snackbar.clear()
//   }
// }

// // Helper para manejar errores de API
export const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
  let message = defaultMessage

  if (error.response?.data?.message) {
    message = error.response.data.message
  } else if (error.response?.data?.error) {
    message = error.response.data.error
  } else if (error.message) {
    message = error.message
  }

  notificationService.error(message)
  return message
}

// Helper para manejar respuestas exitosas
export const handleApiSuccess = (message = 'Operación exitosa') => {
  notificationService.success(message)
}

// Helper para mostrar errores de validación
export const handleValidationErrors = (errors) => {
  if (typeof errors === 'object') {
    Object.values(errors).forEach(error => {
      if (Array.isArray(error)) {
        error.forEach(msg => notificationService.error(msg))
      } else {
        notificationService.error(error)
      }
    })
  } else if (Array.isArray(errors)) {
    errors.forEach(error => notificationService.error(error))
  } else {
    notificationService.error(errors)
  }
}
