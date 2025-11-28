<template>
  <div class="my-2">
    <div class="flex items-center gap-3">
      <i :class="node.icon" class="text-lg"></i>


      <div class="flex-1">
        <div class="font-medium">{{ node.title }}</div>
        <div class="text-sm text-slate-500">{{ node.type }}</div>
      </div>


      <n-button size="tiny" @click="$emit('edit', node)">Edit</n-button>
      <n-button size="tiny" @click="addChild">Add</n-button>
      <n-button size="tiny" type="error" @click="del">Del</n-button>
    </div>


    <div v-if="children.length" class="pl-6 mt-2 border-l ml-2">
      <MenuNode v-for="c in children" :key="c.id" :node="c" @edit="$emit('edit', $event)" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useMenuStore } from '@/stores/menu-demo'
import type { Menu } from '@/stores/menu-demo/types'


const props = defineProps<{ node: Menu }>()
const store = useMenuStore()


const children = computed(() => store.items.filter(i => i.pid === props.node.id).sort((a, b) => a.sort - b.sort))


function addChild() {
  const newItem: Menu = {
    id: `m_${Date.now()}`,
    title: 'New Child',
    icon: 'ri-file-list-line',
    pid: props.node.id,
    type: 'CONTENT',
    refId: 'content_demo',
    url: null,
    sort: 999,
    flag: 1,
    created: { by: 'me', at: new Date().toISOString() }
  }
  store.create(newItem)
}


function del() {
  store.remove(props.node.id)
}
</script>