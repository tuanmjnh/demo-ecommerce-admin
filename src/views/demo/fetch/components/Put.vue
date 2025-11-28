<script setup lang="ts">
import { fetchPut } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function put() {
  const res = await fetchPut({ a: 112211, b: false })
  emit('update', res)
}
</script>

<template>
  <n-card title="Put" size="small">
    <n-button @click="put">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
