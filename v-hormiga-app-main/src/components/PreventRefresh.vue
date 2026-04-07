<template>
  <div @submit.prevent @keydown.enter.prevent>
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  preventRefresh: {
    type: Boolean,
    default: true
  },
  preventEnter: {
    type: Boolean,
    default: true
  }
})

// Variables
let beforeUnloadHandler = null

// Métodos
const handleBeforeUnload = (event) => {
  if (props.preventRefresh) {
    event.preventDefault()
    event.returnValue = ''
    return ''
  }
}

const handleKeyDown = (event) => {
  if (props.preventEnter && event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
    event.preventDefault()
    return false
  }
}

// Lifecycle
onMounted(() => {
  if (props.preventRefresh) {
    beforeUnloadHandler = handleBeforeUnload
    window.addEventListener('beforeunload', beforeUnloadHandler)
  }

  if (props.preventEnter) {
    document.addEventListener('keydown', handleKeyDown, true)
  }
})

onUnmounted(() => {
  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  }

  if (props.preventEnter) {
    document.removeEventListener('keydown', handleKeyDown, true)
  }
})
</script>

<style scoped>
/* Estilos específicos si los necesitas */
</style>
