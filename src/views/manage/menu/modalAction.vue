<script setup lang="ts">
import { useAppStore, useLoadingStore, useMenuStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { toUpperCaseFirst } from 'tm-libs/string'
import { $t, $tm, renderLabelSelect } from '@/utils'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const menuStore = useMenuStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
} = defineProps<{
  title?: string
  data: Models.IMenu | null
  dataDefault: Models.IMenu | null
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
const menus = ref([])
const onReset = () => {
  modelForm.value = { ...data }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
}

async function openModal(type: ModalType = 'add', data: Models.IMenu) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      modelForm.value = { ...data }
      menus.value = menuStore.getTreeMenusSelect()
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
      menus.value = menuStore.getTreeMenusSelect(modelForm.value._id)
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
      menus.value = menuStore.getTreeMenusSelect(modelForm.value._id)
    },
  } as any
  await handlers[type]()
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
        if (modalType.value == 'add') {
          menuStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          menuStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
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

    <n-scrollbar style="max-height: calc(100vh - 160px)" trigger="none" class="pr-5">
      <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="150">
        <n-grid :cols="2">
          <n-form-item-gi :span="1" :label="$t('common.title')" path="title"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.title" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
          </n-form-item-gi>

          <n-form-item-gi :span="2" :label="$t('components.groups.dependent')" path="parent">
            <n-tree-select :options="menus" key-field="_id" label-field="title" :default-value="modelForm.pid"
              :placeholder="$t('common.default')" :default-expanded-keys="[modelForm.pid]"
              :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
              @update:value="(v: any, o: any) => { modelForm.pid = v }">
              <template #empty>{{ $t('common.noData') }}</template>
            </n-tree-select>
            <help-info class="ml-2" :message="$t('components.groups.dependentHelp')" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" label="Icon" path="icon">
            <icon-select v-model:value="modelForm.icon" :disabled="modalType === 'view'" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.sort')" path="sort"
            :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.sort']), trigger: ['blur', 'change', 'input'] }]">
            <n-input-number v-model:value="modelForm.sort" :placeholder="$tm(['common.pleaseInput', 'common.sort'])" />
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
          <n-form-item-gi :span="2" :label="$t('common.attributes')" path="meta">
            <!-- <n-input-number v-model:value="modelForm.meta" :placeholder="$tm(['common.pleaseInput', 'common.meta'])" /> -->
          </n-form-item-gi>
          <n-form-item-gi v-if="modalType == 'edit'" :span="2" :label="$t('common.created')">
            <span v-if="modelForm.createdAt && modelForm.createdAt" class="mr-2">
              {{ appStore.formatDateTime(modelForm.createdAt) }}
            </span>
            <span v-else class="mr-2 color-sky-300 italic">{{ $t('common.updating') }}</span>
            <!-- <span v-if="modelForm.createdBy">-</span>
                <span v-if="modelForm.createdBy" class="ml-2">{{ modelForm.createdBy }}</span> -->
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
    <!-- <modal-select ref="modalSelectRef" :nodes="nodes" /> -->
  </n-modal>
</template>

<style scoped></style>
