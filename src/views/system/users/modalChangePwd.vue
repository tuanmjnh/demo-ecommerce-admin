<script setup lang="ts">
import { useLoadingStore, useUserStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { $t, $tm } from '@/utils'
const loadingStore = useLoadingStore()
const userStore = useUserStore()
const {
  title = 'Modal',
} = defineProps<{
  title?: string
}>()
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'onOpen'): void
  (e: 'onClose'): void
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const modalType = shallowRef<ModalType>('edit')
const modelForm = ref()
const modelFormRef = ref()
const onReset = () => {
  modelFormRef?.value?.restoreValidation()
  modelForm.value.password = ''
}
async function openModal(type: ModalType = 'add', data: Models.IUser) {
  emit('onOpen')
  showModal()
  modalType.value = type
  modelForm.value = {
    userId: data._id,
    username: data.username,
    password: ''
  }
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
        userStore.changePassword(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
          if (x.status) {
            window.$message.success($t('message.success.resetPwd', [x.data]), { duration: 6000 })
            closeModal()
          }
          else window.$message.error($t(`message.error.${x.statusMessage}`))
        })
      } catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
</script>

<template>
  <n-modal v-model:show="modalVisible" :mask-closable="false" :closable="false" preset="card" class="w-600px"
    :title="`${title} - ${modelForm?.username}`" :segmented="{ content: true, action: true }">
    <template #header-extra>
      <n-space>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
              @click="onSubmit">
              <nova-icon icon="icon-park-outline:save-one" />
            </n-button>
          </template>
          {{ $t('common.save') }}
        </n-tooltip>
        <n-tooltip trigger="hover">
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
      <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="100">
        <n-grid :cols="24" :x-gap="12">
          <n-form-item-gi :span="24" :label="$t('components.users.password')" path="password"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.users.password']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.password" :disabled="loadingStore.isLoading"
              :placeholder="$tm(['common.input', 'components.users.password'])" />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
  </n-modal>
</template>

<style scoped></style>
