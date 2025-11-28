<template>
  <n-space vertical>
    <n-button @click="openCreate" size="small">New Root</n-button>


    <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
      <MenuNode v-for="node in roots" :key="node.id" :node="node" @edit="openEdit" />
    </div>


    <n-modal v-model:show="showModal" preset="dialog" title="Menu Form">
      <MenuForm :model="editing" @saved="onSaved" @cancel="showModal = false" />
    </n-modal>
  </n-space>
</template>


<script setup lang="ts">
import { useMenuStore } from '@/stores/menu-demo'
import { computed, ref } from 'vue'
import MenuNode from './MenuNode.vue'
import MenuForm from './MenuForm.vue'


const store = useMenuStore()
const showModal = ref(false)
const editing = ref(null as any)


const roots = computed(() => store.items.filter(i => !i.pid).sort((a, b) => a.sort - b.sort))


function openCreate() {
  editing.value = null
  showModal.value = true
}


function openEdit(menu) {
  editing.value = menu
  showModal.value = true
}


function onSaved() {
  showModal.value = false
}
</script>