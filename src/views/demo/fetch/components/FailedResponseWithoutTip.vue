<script setup lang="ts">
import { FailedResponseWithoutTip } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function failedResponse() {
  const res = await FailedResponseWithoutTip()
  emit('update', res)
}
</script>

<template>
  <n-card title="Failure-Business operation error (no prompt)" size="small">
    <n-button type="error" @click="failedResponse">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
