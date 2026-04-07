# Navegación con Store State (Alternativa 4)

## Descripción

Esta implementación utiliza **Store State** para pasar datos entre componentes durante la navegación, eliminando la dependencia de parámetros de URL y proporcionando una solución robusta y fácil de mantener.

## Ventajas

✅ **No depende de parámetros de URL**
✅ **Estado persistente durante la sesión**
✅ **Fácil de debuggear**
✅ **Datos complejos sin problemas**
✅ **No se pierde al recargar la página**
✅ **Múltiples fuentes de datos en un solo lugar**

## Stores Disponibles

### 1. `useArticuloDefinicionesStore`
- **Propósito**: Manejar definiciones de artículos
- **Método de navegación**: `navegarADefiniciones(articulo)`
- **Página destino**: `ArticuloDefiniciones`

### 2. `useBahiaDefinicionesStore`
- **Propósito**: Manejar definiciones de bahías
- **Método de navegación**: `navegarADefiniciones(bahia)`
- **Página destino**: `BahiaDefiniciones`

### 3. `usePrecioVentaStore`
- **Propósito**: Manejar precios de venta
- **Método de navegación**: `navegarAPrecioVenta(articulo)`
- **Página destino**: `PrecioVenta`

## Patrón de Uso

### Paso 1: Importar los stores necesarios
```javascript
import { useArticuloDefinicionesStore } from '@/stores/useArticuloDefinicionesStore';
import { useBahiaDefinicionesStore } from '@/stores/useBahiaDefinicionesStore';
import { usePrecioVentaStore } from '@/stores/usePrecioVentaStore';
import { useRouter } from 'vue-router';
```

### Paso 2: Inicializar stores y router
```javascript
const router = useRouter();
const storeArticulo = useArticuloDefinicionesStore();
const storeBahia = useBahiaDefinicionesStore();
const storePrecio = usePrecioVentaStore();
```

### Paso 3: Crear función de navegación
```javascript
function navegarADefiniciones(item) {
  // 1. Establecer datos en el store
  storeArticulo.navegarADefiniciones(item);
  
  // 2. Navegar a la página
  router.push({ name: 'ArticuloDefiniciones' });
}
```

## Ejemplos de Implementación

### Desde una tabla de artículos
```javascript
function showDefiniciones(item) {
  storeArticulo.navegarADefiniciones(item);
  router.push({ name: 'ArticuloDefiniciones' });
}

function showPrice(item) {
  storePrecio.navegarAPrecioVenta(item);
  router.push({ name: 'PrecioVenta' });
}
```

### Desde una tabla de bahías
```javascript
function showDefiniciones(item) {
  storeBahia.navegarADefiniciones(item);
  router.push({ name: 'BahiaDefiniciones' });
}
```

### Desde un botón flotante
```javascript
function navegarDesdeBotonFlotante() {
  storeArticulo.navegarADefiniciones(articuloEjemplo);
  router.push({ name: 'ArticuloDefiniciones' });
}
```

### Desde un menú
```javascript
function navegarDesdeMenu(tipo) {
  switch (tipo) {
    case 'articulo':
      storeArticulo.navegarADefiniciones(articuloEjemplo);
      router.push({ name: 'ArticuloDefiniciones' });
      break;
    case 'precio':
      storePrecio.navegarAPrecioVenta(articuloEjemplo);
      router.push({ name: 'PrecioVenta' });
      break;
    case 'bahia':
      storeBahia.navegarADefiniciones(bahiaEjemplo);
      router.push({ name: 'BahiaDefiniciones' });
      break;
  }
}
```

## Estructura de Datos

### Artículo
```javascript
const articulo = {
  itemCode: 'ART001',
  itemName: 'Grúa Puente',
  nombre: 'Grúa Puente de 10 toneladas',
  descripcion: 'Grúa puente industrial para uso pesado',
  price: 150000
};
```

### Bahía
```javascript
const bahia = {
  id: 'BAH001',
  nombre: 'Bahía de Estampados',
  descripcion: 'Bahía especializada en estampados industriales'
};
```

## Páginas de Destino

### ArticuloDefiniciones.vue
- Obtiene datos de: `store.articuloActual`
- Muestra formularios para: `datosBasicos`, `adicionales`, `izaje`
- Valida si hay artículo seleccionado

### BahiaDefiniciones.vue
- Obtiene datos de: `store.bahiaActual`
- Muestra formularios para: `alimentacion`, `riel`, `estructura`
- Valida si hay bahía seleccionada

### PrecioVenta.vue
- Obtiene datos de: `store.articuloActual`
- Muestra formularios para: `precioVenta`, `configuraciones`
- Calcula precio automáticamente
- Valida si hay artículo seleccionado

## Limpieza de Stores

Para evitar conflictos, es recomendable limpiar los stores cuando sea necesario:

```javascript
// Limpiar todos los stores
storeArticulo.clearAll();
storeBahia.clearAll();
storePrecio.clearAll();
```

## Debugging

Los stores incluyen logs para facilitar el debugging:

```javascript
console.log('Navegando a definiciones de artículo:', item);
console.log('Definiciones guardadas:', store.getDefinicionesCompletas());
console.log('Precio de venta guardado:', datosCompletos);
```

## Componentes de Ejemplo

- `ExampleNavigation.vue`: Ejemplos básicos de navegación
- `NavigationExamples.vue`: Ejemplos desde diferentes contextos
- `ArticlesTable.vue`: Implementación en tabla de artículos
- `BahiasTable.vue`: Implementación en tabla de bahías

## Consideraciones

1. **Estado persistente**: Los datos permanecen en el store durante toda la sesión
2. **Validación**: Las páginas validan si hay datos antes de mostrar formularios
3. **Limpieza**: Usar `clearAll()` cuando sea necesario limpiar el estado
4. **Debugging**: Usar los logs incluidos para debugging
5. **Flexibilidad**: Fácil de extender para nuevos tipos de navegación 