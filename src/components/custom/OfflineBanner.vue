<template>
  <div v-if="!network.isOnline" class="text-red-600 p-2 text-center fixed z-1000 bottom-0 right-0">
    {{ title }}
  </div>
</template>


<script setup lang="ts">
import { useNetworkStore } from '@/stores'
const network = useNetworkStore()
const props = defineProps({
  title: { type: String, default: '⚠️ You are offline. Changes will be saved and automatically synced when online.' },
})
// style = "background:#ff4444;color:white;padding:8px;text-align:center;"
</script>
