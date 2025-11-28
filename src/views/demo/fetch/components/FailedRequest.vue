<script setup lang="ts">
import { FailedRequest } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function failedRequest() {
  const res = await FailedRequest()
  emit('update', res)
}
</script>

<template>
  <n-card title="Fail-Server Error" size="small">
    <n-button type="error" @click="failedRequest">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
