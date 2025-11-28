<script setup lang="ts">
import { withoutToken } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function withoutTokenRequest() {
  const res = await withoutToken()
  emit('update', res)
}
</script>

<template>
  <n-card title="Do not carry tokens" size="small">
    <n-button @click="withoutTokenRequest">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
