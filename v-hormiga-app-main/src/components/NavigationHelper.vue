<template>
  <div>
    <!-- Este componente no renderiza nada, solo proporciona métodos de navegación -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Métodos para navegar a definiciones de artículos
export const navigateToArticuloDefiniciones = {
  // Usando query parameters (recomendado)
  withQueryParams: (articulo) => {
    const query = {
      nombre: articulo.itemName || articulo.nombre,
      itemCode: articulo.itemCode,
      itemName: articulo.itemName
    };

    router.push({
      name: 'ArticuloDefiniciones',
      query: query
    });
  },

  // Usando route parameters
  withRouteParams: (articulo) => {
    router.push({
      name: 'ArticuloDefiniciones',
      params: {
        nombre: articulo.itemName || articulo.nombre,
        itemCode: articulo.itemCode,
        itemName: articulo.itemName
      }
    });
  },

  // Usando state en el router (alternativa)
  withState: (articulo) => {
    router.push({
      name: 'ArticuloDefiniciones',
      query: { nombre: articulo.itemName || articulo.nombre },
      state: { articulo }
    });
  }
};

// Métodos para navegar a definiciones de bahías
export const navigateToBahiaDefiniciones = {
  // Usando query parameters (recomendado)
  withQueryParams: (bahia) => {
    const query = {
      nombre: bahia.nombre,
      id: bahia.id
    };

    router.push({
      name: 'BahiaDefiniciones',
      query: query
    });
  },

  // Usando route parameters
  withRouteParams: (bahia) => {
    router.push({
      name: 'BahiaDefiniciones',
      params: {
        nombre: bahia.nombre,
        id: bahia.id
      }
    });
  },

  // Usando state en el router (alternativa)
  withState: (bahia) => {
    router.push({
      name: 'BahiaDefiniciones',
      query: { nombre: bahia.nombre },
      state: { bahia }
    });
  }
};

// Función helper para obtener datos del estado del router
export const getRouterState = () => {
  return router.currentRoute.value.state || {};
};

// Función helper para limpiar parámetros de la URL
export const cleanQueryParams = () => {
  router.replace({ query: {} });
};
</script>
