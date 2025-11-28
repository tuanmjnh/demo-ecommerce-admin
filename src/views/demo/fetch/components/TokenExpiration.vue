<script setup lang="ts">
import { expiredTokenRequest } from '@/services'

const emit = defineEmits<{
  update: [data: any] // Named tuple syntax
}>()

async function expiredToken() {
  const res = await expiredTokenRequest()
  emit('update', res)
}
</script>

<template>
  <n-card title="Token Expiration" size="small">
    Pay attention to the second request, the token has been refreshed
    <n-button type="error" @click="expiredToken">
      click
    </n-button>
  </n-card>
</template>

<style scoped></style>
