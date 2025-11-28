<script setup lang="ts">
import { useOptionsStore } from '@/stores'

interface Props {
  modelValue: Common.IMeta[] | null
  placeholderKey?: string
  placeholderValue?: string
}

const props = defineProps<Props>()
const emits = defineEmits(['update:modelValue'])

const metaStore = useOptionsStore()
const localMeta = ref<Common.IMeta[]>([])

const keyOptions = computed(() => {
  return metaStore.getMetaKeys()
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localMeta.value = [...newVal]
  } else {
    localMeta.value = []
  }
}, { immediate: true, deep: true })

const addMeta = () => {
  localMeta.value.push({ key: '', value: '' })
  updateModel()
}

const removeMeta = (index: number) => {
  localMeta.value.splice(index, 1)
  updateModel()
}

const updateModel = () => {
  emits('update:modelValue', localMeta.value)
}

// const onKeyBlur = (key: string) => {
//   if (key) {
//     metaStore.addKey(key)
//   }
// }
</script>

<template>
  <div class="meta-manager">
    <div v-for="(item, index) in localMeta" :key="index" class="meta-item mb-2 flex gap-2 items-center">
      <!-- <n-auto-complete v-model:value="item.key" :options="keyOptions" :placeholder="placeholderKey || 'Key'"
        @update:value="updateModel" /> @blur="onKeyBlur(item.key)" -->
      <n-select v-model:value="item.key" :options="keyOptions" filterable :placeholder="placeholderKey || 'Key'"
        @update:value="updateModel" />
      <n-input v-model:value="item.value" :placeholder="placeholderValue || 'Value'" @update:value="updateModel" />
      <n-button type="error" quaternary circle @click="removeMeta(index)">
        <template #icon>
          <nova-icon icon="icon-park-outline:delete" />
        </template>
      </n-button>
    </div>
    <n-button type="primary" dashed block @click="addMeta">
      <template #icon>
        <nova-icon icon="icon-park-outline:plus" />
      </template>
      {{ $t('common.add') }}
    </n-button>
  </div>
</template>

<style scoped>
.meta-manager {
  width: 100%;
}
</style>
