<script setup lang="ts">
import { computed, PropType } from 'vue'
import TagsManager from './TagsManager.vue'

export interface ISeoData {
  title?: string
  desc?: string
  tags?: string[]
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<ISeoData>,
    default: () => ({ title: '', desc: '', tags: null }),
  },
  dense: { type: Boolean, default: false },
  placeholderTitle: { type: String, default: "Please input SEO title" },
  placeholderDesc: { type: String, default: "Please input SEO description" },
  placeholderTags: { type: String, default: "Please input SEO tags" },
})
const emits = defineEmits(['update:modelValue'])

const seoData = computed({
  get: () => props.modelValue || { title: '', desc: '', tags: null },
  set: (val) => emits('update:modelValue', val),
})

function updateField<K extends keyof ISeoData>(key: K, value: ISeoData[K]) {
  emits('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="w-full">
    <div v-if="dense" class="grid grid-cols-1 gap-4">
      <n-input v-model:value="seoData.title" :placeholder="placeholderTitle" maxlength="70" show-count
        @input="(v) => updateField('title', v)" class="mb-2" />
      <n-input type="textarea" v-model:value="seoData.desc" :placeholder="placeholderDesc" maxlength="160" show-count
        :autosize="{ minRows: 3, maxRows: 5 }" @input="(v) => updateField('desc', v)" />
      <TagsManager v-model="seoData.tags" :placeholder="placeholderTags"
        @update:modelValue="(v) => updateField('tags', v)" />
    </div>
    <div v-else class="grid grid-cols-2 gap-4">
      <div>
        <n-input v-model:value="seoData.title" :placeholder="placeholderTitle" maxlength="70" show-count
          @input="(v) => updateField('title', v)" class="mb-2" />
        <n-input type="textarea" v-model:value="seoData.desc" :placeholder="placeholderDesc" maxlength="160" show-count
          :autosize="{ minRows: 3, maxRows: 5 }" @input="(v) => updateField('desc', v)" />
      </div>
      <TagsManager v-model="seoData.tags" :placeholder="placeholderTags"
        @update:modelValue="(v) => updateField('tags', v)" />
    </div>
  </div>
</template>

<style scoped>
.n-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
