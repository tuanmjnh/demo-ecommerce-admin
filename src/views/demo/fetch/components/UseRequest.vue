<script setup lang="ts">
import { fetchGet } from '@/services'

import { useRequest } from 'alova/client'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

const { data: fetchGetData, send: sendFetchGet } = useRequest(fetchGet({ a: 112211 }), {
  // When immediate is false, no signal is emitted by default.
  immediate: false,
})

async function handleRequestHook() {
  await sendFetchGet()
  emit('update', fetchGetData.value)
}
</script>

<template>
  <n-card title="useRequest style" size="small">
    <n-button @click="handleRequestHook">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
