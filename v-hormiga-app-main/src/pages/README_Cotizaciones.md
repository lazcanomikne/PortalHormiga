# Página de Cotizaciones

## Descripción
Esta página muestra una lista completa de todas las cotizaciones del sistema en formato de tabla, con funcionalidades de búsqueda, filtrado y gestión.

## Funcionalidades

### 📋 **Visualización de Datos**
- Tabla con todos los campos solicitados de cotizaciones
- Paginación configurable (10, 25, 50, 100 elementos por página)
- Ordenamiento por columnas
- Búsqueda global en todos los campos

### 🔍 **Filtros Avanzados**
- **Tipo de Cotización**: Comercial, Técnica, Servicio, Producto
- **Moneda**: MXN, USD, EUR
- **Cliente**: Búsqueda por nombre de cliente
- **Botón de Limpiar Filtros**: Restablece todos los filtros

### 📊 **Campos Mostrados**
1. **ID** - Identificador único de la cotización
2. **TIPO_COTIZACION** - Tipo de cotización
3. **TIPO_CUENTA** - Tipo de cuenta del cliente
4. **IDIOMA_COTIZACION** - Idioma de la cotización
5. **CLIENTE** - Nombre del cliente
6. **CONTACTO** - Información de contacto
7. **DIR_FISCAL** - Dirección fiscal
8. **DIR_ENTREGA** - Dirección de entrega
9. **REFERENCIA** - Referencia de la cotización
10. **TERMINOS_ENTREGA** - Términos de entrega
11. **FOLIO_PORTAL** - Folio del portal
12. **FOLIO_SAP** - Folio de SAP
13. **FECHA** - Fecha de creación
14. **VENCIMIENTO** - Fecha de vencimiento
15. **MONEDA** - Moneda de la cotización

### 🎨 **Características Visuales**
- **Chips de colores** para moneda y estado
- **Formato de fechas** en formato español (DD/MM/YYYY)
- **Expansión de filas** para mostrar detalles adicionales
- **Indicadores de estado** con colores diferenciados
- **Responsive design** para diferentes tamaños de pantalla

### ⚡ **Acciones Disponibles**
- **Ver** - Visualizar detalles de la cotización
- **Editar** - Modificar la cotización existente
- **Eliminar** - Eliminar la cotización (con confirmación)
- **Nueva Cotización** - Crear una nueva cotización

## Endpoints Utilizados

### GET `/cotizacion`
- **Propósito**: Obtener todas las cotizaciones
- **Método**: `cotizacionService.getAll()`
- **Respuesta**: Array de objetos con datos de cotizaciones

### DELETE `/cotizacion/{id}`
- **Propósito**: Eliminar una cotización específica
- **Método**: `cotizacionService.delete(id)`
- **Parámetros**: ID de la cotización

## Navegación

### Rutas Relacionadas
- **`/cotizaciones`** - Lista de cotizaciones (esta página)
- **`/cotizacion`** - Crear/editar cotización
- **`/cotizacion/{id}`** - Ver cotización específica

### Navegación Automática
- Al hacer clic en "Nueva Cotización" se navega a la página de creación
- Los botones de acción están preparados para navegar a páginas específicas

## Estados de la Aplicación

### Loading States
- **Carga inicial**: Muestra spinner mientras se obtienen los datos
- **Operaciones**: Indicadores de carga para acciones específicas

### Error Handling
- **Errores de API**: Muestra mensajes de error en snackbar
- **Datos vacíos**: Mensaje informativo cuando no hay cotizaciones
- **Reintento**: Botón para reintentar la carga en caso de error

### Mensajes de Usuario
- **Snackbar**: Notificaciones temporales para acciones exitosas/fallidas
- **Confirmaciones**: Diálogos de confirmación para acciones destructivas

## Personalización

### Filtros Personalizables
Los filtros se pueden modificar fácilmente editando las constantes:
```javascript
const tiposCotizacion = ['Comercial', 'Técnica', 'Servicio', 'Producto'];
const monedas = ['MXN', 'USD', 'EUR'];
```

### Colores de Estado
Los colores de los chips se pueden personalizar en las funciones:
```javascript
const getColorMoneda = (moneda) => {
  const colores = {
    'MXN': 'success',
    'USD': 'info',
    'EUR': 'warning',
    'default': 'grey'
  };
  return colores[moneda] || colores.default;
};
```

## Dependencias

### Componentes Vue
- `v-data-table` - Tabla de datos principal
- `v-card` - Contenedores de secciones
- `v-btn` - Botones de acción
- `v-select` - Selectores de filtros
- `v-text-field` - Campos de texto y búsqueda
- `v-chip` - Indicadores visuales
- `v-alert` - Mensajes informativos
- `v-snackbar` - Notificaciones temporales

### Servicios
- `cotizacionService` - API para operaciones de cotizaciones
- `useRouter` - Navegación entre páginas

### Composables Vue
- `ref` - Referencias reactivas
- `computed` - Propiedades computadas
- `onMounted` - Hook del ciclo de vida

## Consideraciones Técnicas

### Performance
- **Filtrado reactivo**: Los filtros se aplican automáticamente sin recargar datos
- **Paginación**: Solo se muestran los elementos necesarios
- **Búsqueda optimizada**: Búsqueda en tiempo real sin llamadas a la API

### Responsive Design
- **Grid system**: Uso de `v-row` y `v-col` para layout responsivo
- **Density**: Componentes compactos para mejor uso del espacio
- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla

### Accesibilidad
- **Títulos descriptivos**: Cada botón tiene un título explicativo
- **Iconos semánticos**: Uso de iconos Material Design apropiados
- **Contraste**: Colores que cumplen con estándares de accesibilidad

## Futuras Mejoras

### Funcionalidades Planificadas
- **Exportación**: PDF, Excel, CSV
- **Bulk actions**: Acciones en lote para múltiples cotizaciones
- **Filtros avanzados**: Por fecha, rango de precios, estado
- **Vistas personalizadas**: Diferentes layouts de tabla
- **Notificaciones**: Alertas para cotizaciones próximas a vencer

### Integraciones
- **WebSockets**: Actualizaciones en tiempo real
- **Offline support**: Cache local para uso sin conexión
- **Sync**: Sincronización automática con el servidor
