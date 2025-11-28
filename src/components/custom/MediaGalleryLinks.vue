<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  modelValue: Common.IFileAttach[] | Common.IFileAttach | null
  placeholder?: string
  helpMessage?: string
  multiple?: boolean
  title?: string
  deleteTitle?: string
  deleteMessage?: string
  confirmText?: string
  cancelText?: string
  renameTitle?: string
  renameText?: string
  size?: string | number
  class?: string
  maxHeight?: string | number
  quaternary?: boolean
}>()
const emits = defineEmits(['update:modelValue'])
const formModel = ref({
  link: '',
  files: null
})
const isConfirm = ref(false)
const onReset = () => {
  formModel.value.link = ''
  formModel.value.files = null
}
const onConfirm = () => {
  emits('update:modelValue', formModel.value.files)
  isConfirm.value = false
  onReset()
}
watch(() => formModel.value.link, () => {
  if (formModel.value.link) {
    formModel.value.files = []
    if (props.multiple) {
      const links = formModel.value.link.trim().split('\n')
      links.forEach(link => {
        formModel.value.files.push({
          public_id: link,
          display_name: link,
          url: link,
          format: 'jpg'
        })
      })
    } else {
      const links = formModel.value.link.trim().split(' ')
      if (links.length) {
        const link = links[0]
        formModel.value.files = {
          public_id: link,
          display_name: link,
          url: link,
          format: 'jpg'
        }
      }
    }
  }
})
</script>
<template>
  <n-tooltip trigger="hover" placement="bottom">
    <template #trigger>
      <n-button :class="class" :quaternary="quaternary" :text-color="quaternary ? '' : '#fff'" type="primary"
        @click="isConfirm = true">
        <template #icon>
          <nova-icon icon="icon-park-outline:copy-link" />
        </template>
      </n-button>
    </template>
    {{ title }}
  </n-tooltip>
  <n-modal v-model:show="isConfirm" style="width: 600px">
    <n-card style="width: 600px" :title="title" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <template #header-extra>
        <n-space justify="end">
          <n-button type="primary" text-color="#fff" @click="onConfirm">
            <!-- <template #icon>
            <nova-icon icon="icon-park-outline:save-one" />
          </template> -->
            {{ confirmText || 'Confirm' }}
          </n-button>
          <!-- <n-button ghost type="tertiary" text-color="#fff" @click="isConfirm = false">
            <template #icon>
              <nova-icon icon="icon-park-outline:copy-link" />
            </template>
  </n-button> -->
        </n-space>
      </template>
      <n-input v-if="multiple" type="textarea" v-model:value="formModel.link" :placeholder="placeholder" />
      <n-input v-else v-model:value="formModel.link" :placeholder="placeholder" />
      <template #footer>
        <n-scrollbar :style="{ 'max-height': maxHeight || '340px' }">
          <MediaGallery v-model="formModel.files" :show-upload="false" :size="size" :multiple="multiple"
            :delete-title="deleteTitle" :confirm-text="confirmText" :cancel-text="cancelText"
            :delete-message="deleteMessage" :rename-title="renameTitle" :rename-text="renameText" @delete="onReset" />
        </n-scrollbar>
      </template>
    </n-card>
  </n-modal>
  <!-- <ConfirmModal :visible="isConfirm" :title="title" :confirm-text="confirmText" :cancel-text="cancelText"
      @confirm="onConfirm" @cancel="isConfirm = false">
      <template #default>
        <div class="text-center">
          <input type="text" v-model="formModel.link"
            class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm w-full focus:ring focus:ring-blue-500/20 focus:outline-none transition" />
        </div>
      </template>
    </ConfirmModal> -->
  <!-- <div class="w-full">
    <n-input-group>
      <n-input v-model:value="formModel.link" :placeholder="placeholder" />
      <n-button strong secondary type="primary" @click="onConfirm">
        <template #icon>
          <nova-icon icon="icon-park-outline:add-four" />
        </template>
      </n-button>
      <div class="pl-2">
        <help-info v-if="helpMessage" :message="helpMessage" classTooltip="max-w-300px max-h-200px"
          class="h-full flex items-center" />
      </div>
    </n-input-group>
  </div> -->
</template>

<style scoped></style>