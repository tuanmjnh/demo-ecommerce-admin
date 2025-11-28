<script lang="ts" setup>
const props = defineProps({
  visible: { type: Boolean, default: true },
  text: { type: String, default: 'Footer' },
})
</script>
<template>
  <n-layout-footer v-if="visible" bordered position="absolute" class="h-40px flex-center z-1">
    {{ text }}
  </n-layout-footer>
</template>