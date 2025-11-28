<script setup lang="ts">
import { useLoadingStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { $t, $tm } from '@/utils'

const loadingStore = useLoadingStore()

const {
  title = 'Import',
} = defineProps<{
  title?: string
}>()
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'onOpen'): void
  (e: 'onClose'): void
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const modelForm = ref({
  data: ''
})
const modelFormRef = ref()
const onReset = () => {
  modelForm.value = { data: '' }
  modelFormRef?.value?.restoreValidation()
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })

async function openModal() {
  emit('onOpen')
  showModal()
}

const closeModal = () => {
  hiddenModal()
  emit('onClose')
}

defineExpose({ openModal })

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        // const data = JSON.parse(modelForm.value.data.trim())
        // // console.log(data)
        // window.electron.routes.import(JSON.parse(JSON.stringify(data))).then(x => {
        //   if (x.status) {
        //     modelForm.value.data = ''
        //     window.$message.success($t('message.success.import'))
        //   } else window.$message.error($t(`message.error.import`))
        // }).then(() => stopLoading())
      }
      catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
</script>

<template>
  <n-modal v-model:show="modalVisible" :mask-closable="false" :closable="false" preset="card" class="w-900px"
    :title="title" :segmented="{ content: true, action: true }">
    <template #header-extra>
      <n-space>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
              @click="onSubmit">
              <nova-icon icon="icon-park-outline:save-one" />
            </n-button>
          </template>
          {{ $t('common.import') }}
        </n-tooltip>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button type="tertiary" attr-type="button" block :disabled="loadingStore.isLoading" @click="closeModal">
              <nova-icon icon="icon-park-outline:close" />
            </n-button>
          </template>
          {{ $t('common.close') }}
        </n-tooltip>
      </n-space>
    </template>

    <n-scrollbar style="max-height: calc(100vh - 160px)" trigger="none" class="pr-3">
      <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="150">
        <n-grid :cols="2" :x-gap="18">
          <n-form-item-gi :span="2" :label="$t('common.title')" path="data"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.data" v-trim-blur :disabled="loadingStore.isLoading"
              :placeholder="$tm(['common.pleaseInput', 'common.title'])" type="textarea"
              :autosize="{ minRows: 15, maxRows: 20 }" />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
  </n-modal>
</template>

<style scoped></style>
