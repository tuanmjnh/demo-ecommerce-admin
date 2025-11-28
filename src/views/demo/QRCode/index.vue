<script setup lang="ts">
const text = ref('nova-admin')
</script>

<template>
  <n-card title="QR code">
    <n-alert :show-icon="false" type="info">
      Using naiveUI - QR Code implementation
    </n-alert>
    <n-qr-code :value="text" />
    <n-input v-model:value="text" :maxlength="60" type="text" />
  </n-card>
</template>

<style scoped></style>
