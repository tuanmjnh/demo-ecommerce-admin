<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[] | null
  placeholder?: string
  helpMessage?: string
}
const props = defineProps<Props>()
const emits = defineEmits(['update:modelValue'])

const inputTag = ref('')

/** push tag if not exist */
function addTag() {
  const tag = inputTag.value?.trim()
  if (!tag) return
  const newTags = [...(props.modelValue || [])]
  if (!newTags.includes(tag)) newTags.push(tag)
  emits('update:modelValue', newTags)
  inputTag.value = ''
}

/** remove tag */
function removeTag(tag: string) {
  emits(
    'update:modelValue',
    props.modelValue.filter((t) => t !== tag)
  )
}
</script>
<template>
  <div class="w-full">
    <n-input-group>
      <n-input v-model:value="inputTag" :placeholder="placeholder" @keydown.enter.prevent="addTag" clearable />
      <n-button strong secondary type="primary" @click="addTag">
        <template #icon>
          <nova-icon icon="icon-park-outline:add-four" />
        </template>
      </n-button>
      <div class="pl-2">
        <help-info v-if="helpMessage" :message="helpMessage" classTooltip="max-w-300px max-h-200px"
          class="h-full flex items-center" />
      </div>
    </n-input-group>
    <n-space style="margin-top: 8px;" wrap>
      <n-tag v-for="(tag, i) in modelValue" :key="i" closable @close="removeTag(tag)">
        {{ tag }}
      </n-tag>
    </n-space>
  </div>
</template>

<style scoped>
.tag-manager {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
