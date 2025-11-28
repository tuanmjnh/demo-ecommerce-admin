<script setup lang="ts">
import { FailedResponse } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function failedResponse() {
  const res = await FailedResponse()
  emit('update', res)
}
</script>

<template>
  <n-card title="Fail-Business operation error" size="small">
    <n-button type="error" @click="failedResponse">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
