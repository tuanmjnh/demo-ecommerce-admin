<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <n-card class="h-130vh">
    This page contains a detail page that is not in the side menu
    <n-button @click="router.push({ path: '/multi/multi2/detail', query: { id: 1 } })">
      Jump to detail subpage 1
    </n-button>
    <n-button @click="router.push({ path: '/multi/multi2/detail', query: { id: 2 } })">
      Jump to detail subpage 2
    </n-button>
    <n-button @click="router.push({ path: '/multi/multi2/detail', query: { id: 3 } })">
      Jump to detail subpage 3
    </n-button>
  </n-card>
</template>

<style scoped></style>
