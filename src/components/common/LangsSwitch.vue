<script setup lang="ts">
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const options = [
  {
    label: 'Tiếng Việt',
    value: 'viVN',
  },
  {
    label: 'English',
    value: 'enUS',
  },
  {
    label: '日本語',
    value: 'jaJP',
  },
  {
    label: '한국어',
    value: 'koKR',
  },
  {
    label: '中文',
    value: 'zhCN',
  },
]
</script>

<template>
  <n-popselect :value="appStore.lang" :options="options" trigger="click" @update:value="appStore.setAppLang">
    <CommonWrapper>
      <icon-park-outline-translate />
    </CommonWrapper>
  </n-popselect>
</template>

<style scoped></style>
