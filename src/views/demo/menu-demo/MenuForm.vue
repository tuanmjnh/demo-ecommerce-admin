<template>
  <n-form :model="form" :rules="rules" ref="formRef" label-placement="top">
    <n-form-item label="Title" path="title">
      <n-input v-model:value="form.title" />
    </n-form-item>


    <n-form-item label="Icon" path="icon">
      <n-input v-model:value="form.icon" />
    </n-form-item>


    <n-form-item label="Type" path="type">
      <n-select v-model:value="form.type" :options="types" />
    </n-form-item>


    <n-form-item v-if="form.type === 'EXTERNAL'" label="External URL" path="url">
      <n-input v-model:value="form.url" placeholder="https://..." />
    </n-form-item>


    <n-form-item v-if="form.type !== 'EXTERNAL'" label="Reference ID" path="refId">
      <n-input v-model:value="form.refId" placeholder="content_xx / category_xx" />
    </n-form-item>


    <n-space>
      <n-button @click="submit">Save</n-button>
      <n-button @click="$emit('cancel')" ghost>Cancel</n-button>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMenuStore } from '@/stores/menu-demo'
import type { Menu } from '@/stores/menu-demo/types'


const props = defineProps<{ model?: Menu | null }>()
const emits = defineEmits(['saved', 'cancel'])


const store = useMenuStore()
const formRef = ref(null)


const types = [
  { label: 'Category', value: 'CATEGORY' },
  { label: 'Content', value: 'CONTENT' },
  { label: 'External', value: 'EXTERNAL' },
  { label: 'Group', value: 'GROUP' }
]


const emptyMenu: Menu = {
  id: `m_${Date.now()}`,
  title: '',
  icon: 'ri-folder-line',
  pid: null,
  type: 'GROUP',
  refId: null,
  url: null,
  sort: 100,
  flag: 1,
  created: { by: 'me', at: new Date().toISOString() }
}


const form = ref<Menu>(props.model ? { ...props.model } : { ...emptyMenu })


watch(() => props.model, (val) => {
  form.value = val ? { ...val } : { ...emptyMenu }
})


const rules = {
  title: { required: true, message: 'Title is required', trigger: 'blur' },
  type: { required: true, message: 'Type is required', trigger: 'change' },
  url: {
    validator: () => {
      // only validate URL when type is EXTERNAL
      if (form.value.type !== 'EXTERNAL') return true
      return !!form.value.url
    },
    message: 'URL required for EXTERNAL menu',
    trigger: 'blur'
  },
  refId: {
    validator: () => {
      // only validate refId when type is not EXTERNAL
      if (form.value.type === 'EXTERNAL') return true
      return !!form.value.refId
    },
    message: 'refId required for CONTENT/CATEGORY',
    trigger: 'blur'
  }
}


function submit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const exists = store.getById(form.value.id)
      if (exists) store.update(form.value.id, form.value)
      else store.create(form.value)


      emits('saved', form.value)
    }
  })
}
</script>