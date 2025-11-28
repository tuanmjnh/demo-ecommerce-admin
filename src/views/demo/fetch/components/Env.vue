<script setup lang="ts">
const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function get() {
  const res = import.meta.env
  emit('update', res)
}
</script>

<template>
  <n-card title="Check environment variables" size="small">
    <n-button @click="get">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
