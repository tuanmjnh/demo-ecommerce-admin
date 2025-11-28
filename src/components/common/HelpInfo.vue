<script setup lang="ts">
interface Props {
  icon?: string
  message: string
  class?: string
  classTooltip?: string
}

const { message } = defineProps<Props>()
</script>

<template>
  <n-tooltip :show-arrow="false" trigger="hover" scrollable :class="classTooltip">
    <template #trigger>
      <nova-icon :icon="icon ? icon : 'icon-park-outline:help'" class="op-50 cursor-help" :class="class" />
      <!-- <icon-park-outline-help class="op-50 cursor-help" :class="class" /> -->
    </template>
    <span v-html="message"></span>
  </n-tooltip>
</template>
