<script setup lang="ts">
import { fetchFormPost } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function post() {
  const params = {
    data: '2022-2-2',
    name: 'for',
  }
  const res = await fetchFormPost(params)
  emit('update', res)
}
</script>

<template>
  <n-card title="formPost" size="small">
    <n-button @click="post">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
