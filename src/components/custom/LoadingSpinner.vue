<template>
  <div class="flex items-center justify-center w-full h-full absolute z-1001 top-0" v-if="visible">
    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible?: boolean
}>()
</script>

<style scoped>
/* Optional: smoother spinning */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
