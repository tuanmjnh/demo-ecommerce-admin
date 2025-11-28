<script lang="ts">
</script>

<script setup lang="ts">
import AMap from './components/AMap.vue'
import BMap from './components/BMap.vue'

defineOptions({
  name: 'map',
})

const maps = [
  {
    id: 'BMap',
    label: 'Baidu Map',
    component: BMap,
  },
  {
    id: 'AMap',
    label: 'AutoNavi Map',
    component: AMap,
  },
]
</script>

<template>
  <n-card title="Map Example (keepalive cache)">
    <n-tabs type="line" animated>
      <n-tab-pane v-for="item in maps" :key="item.id" :name="item.id" :tab="item.label" class="h-600px">
        <component :is="item.component" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped></style>
