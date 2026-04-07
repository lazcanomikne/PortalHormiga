<template>
  <div>
    <AuthGuard />
  </div>
</template>

<script setup>
defineOptions({
  name: 'Dashboard'
})

import AuthGuard from '@/components/AuthGuard.vue'
</script>
