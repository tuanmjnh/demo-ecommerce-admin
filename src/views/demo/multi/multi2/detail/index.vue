<script setup lang="ts">
import { useTabStore } from '@/stores'

const { modifyTab } = useTabStore()

const { fullPath, query } = useRoute()

modifyTab(fullPath, (target) => {
  target.meta.title = `Details page${query.id}`
})
</script>

<template>
  <n-space vertical>
    <n-alert title="Currently available information" type="warning">
      This is a detail subpage. It will not appear in the sidebar. It is actually the same level as the previous page,
      not a subordinate. Please note this.
    </n-alert>

    <n-h2>
      Details page id:{{ query.id }}
    </n-h2>
  </n-space>
</template>

<style scoped></style>
