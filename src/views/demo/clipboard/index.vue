<script setup lang="ts">
const text = ref('Hello nova-admin')
</script>

<template>
  <n-card title="Clipboard Example">
    <n-h3>v-copy instruction</n-h3>
    <n-input-group>
      <n-input v-model:value="text" placeholder="Please enter the content to copy" />
      <n-button v-copy="text" type="primary">
        v-copy
      </n-button>
    </n-input-group>
    <n-h3>copy-text</n-h3>
    <copy-text v-model:value="text" />
  </n-card>
</template>

<style scoped></style>
