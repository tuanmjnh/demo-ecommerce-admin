<script setup lang="ts">
const text = ref('# Hello Editor ![Image Description](https://via.placeholder.com/350x150)')
</script>

<template>
  <n-card title="MarkDown Editor">
    <n-space vertical :size="12">
      <n-alert title="based on md-editor-v3 Encapsulation" type="success" />
      <MarkDownEditor v-model="text" />
    </n-space>
  </n-card>
</template>

<style scoped></style>
