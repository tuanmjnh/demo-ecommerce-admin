<script setup lang="ts">
import { useAppStore, useLoadingStore, useOptionsStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { debounce } from 'lodash'
import { toUpperCaseFirst, viToAscii } from 'tm-libs/string'
import { $t, $tm } from '@/utils'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const optionsStore = useOptionsStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  keyOption = 'gender'
} = defineProps<{
  title?: string
  data: Models.IOptions | null
  dataDefault: Models.IOptions | null
  keyOption: string
}>()
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'onOpen'): void
  (e: 'onClose'): void
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const modalType = shallowRef<ModalType>('add')
const modelForm = ref({ ...data })
const modelFormRef = ref()

const onReset = () => {
  modelForm.value = { ...data }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
  modelForm.value.key = keyOption
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })
async function openModal(type: ModalType = 'add', data: Models.IOptions) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      modelForm.value = { ...data }
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
    },
  } as any
  await handlers[type]()
}

const closeModal = () => {
  hiddenModal()
  emit('onClose')
}

defineExpose({ openModal })

watch(() => modelForm.value.key, debounce(async (n) => {
  if (!n) return
  modelForm.value.key = viToAscii(n).toLowerCase()
}, 600))

watch(() => modelForm.value.code, debounce(async (n) => {
  if (!n) return
  modelForm.value.code = viToAscii(n).toUpperCase()
}, 600))

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        if (modalType.value == 'add') {
          optionsStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          optionsStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.updated'))
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        }
      } catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
</script>

<template>
  <n-modal v-model:show="modalVisible" :mask-closable="false" :closable="false" preset="card" class="w-900px"
    :title="`${toUpperCaseFirst(modalType)} - ${title}`" :segmented="{ content: true, action: true }">
    <template #header-extra>
      <n-space>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
              @click="onSubmit">
              <nova-icon icon="icon-park-outline:save-one" />
            </n-button>
          </template>
          {{ $t('common.save') }}
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
          <n-form-item-gi :span="2" :label="$t('common.title')" path="title"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.title" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.key')" path="key"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.key']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.key" v-text-format:lower
              :placeholder="$tm(['common.pleaseInput', 'common.key'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.code')" path="code" :rule="[
            { required: true, message: $tm(['common.pleaseInput', 'common.code']), trigger: ['blur', 'change', 'input'] },
            {
              asyncValidator: async (r, v) => {
                if (await optionsStore.exist({ filter: { key: modelForm.key, code: v }, id: modelForm._id })) throw new Error($t('message.error.existCode'))
              }, trigger: ['blur']
            }]">
            <n-input v-model:value="modelForm.code" v-text-format:upper
              :placeholder="$tm(['common.pleaseInput', 'common.code'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('common.desc')" path="desc">
            <n-input v-model:value="modelForm.desc" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.desc'])" type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.status')" path="flag">
            <n-switch v-model:value="modelForm.flag" :default-value="1" :checked-value="1" :unchecked-value="0">
              <template #checked>
                {{ $t('common.display') }}
              </template>
              <template #unchecked>
                {{ $t('common.hidden') }}
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.sort')" path="sort"
            :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.sort']), trigger: ['blur', 'change', 'input'] }]">
            <n-input-number v-model:value="modelForm.sort" :placeholder="$tm(['common.pleaseInput', 'common.sort'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('common.attributes')" path="meta">
            <!-- <n-input-number v-model:value="modelForm.meta" :placeholder="$tm(['common.pleaseInput', 'common.meta'])" /> -->
          </n-form-item-gi>
          <n-form-item-gi v-if="modalType == 'edit'" :span="2" :label="$t('common.created')">
            <span v-if="modelForm.created && modelForm.created.at" class="mr-2">
              {{ appStore.formatDateTime(modelForm.created.at) }}
            </span>
            <span v-else class="mr-2 color-sky-300 italic">{{ $t('common.updating') }}</span>
            <span v-if="modelForm.created?.by">-</span>
            <span v-if="modelForm.created?.by" class="ml-2">{{ modelForm.created?.by }}</span>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
  </n-modal>
</template>

<style scoped></style>
