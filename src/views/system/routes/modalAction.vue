<script setup lang="ts">
import { useAppStore, useLoadingStore, useRouteStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { debounce } from 'lodash'
import { toUpperCaseFirst, viToAscii } from 'tm-libs/string'
import { $t, $tm } from '@/utils'

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const routeStore = useRouteStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  allRoutes = []
} = defineProps<{
  title?: string
  data: Models.RouteItem | null
  dataDefault: Models.RouteItem | null
  allRoutes: Models.RouteItem[]
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
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })

async function openModal(type: ModalType = 'add', data: Models.RouteItem) {
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

const dirTreeOptions = computed(() => {
  return filterDirectory(JSON.parse(JSON.stringify(allRoutes)))
})

function filterDirectory(node: any[]) {
  return node.filter((item) => {
    if (item.children) {
      const childDir = filterDirectory(item.children)
      if (childDir.length > 0)
        item.children = childDir
      else
        Reflect.deleteProperty(item, 'children')
    }

    return (item.menuType === 'dir')
  })
}

watch(() => modelForm.value.name, debounce(async (n) => {
  if (!n) return
  modelForm.value.name = viToAscii(n)
}, 600))

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        if (modalType.value == 'add') {
          routeStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else if (modalType.value == 'edit') {
          routeStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
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
        <n-tooltip v-if="modalType !== 'view'" trigger="hover" placement="bottom">
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
      <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="150"
        :disabled="modalType === 'view'">
        <n-grid :cols="2" :x-gap="18">
          <n-form-item-grid-item :span="2" path="pid">
            <template #label>
              {{ $t('common.parentDirectory') }}
              <HelpInfo :message="$t('message.help.routePid')" />
            </template>
            <n-tree-select v-model:value="modelForm.pid" filterable clearable :options="dirTreeOptions" key-field="id"
              label-field="title" children-field="children"
              :placeholder="$tm(['common.pleaseSelect', 'common.parentDirectory'])" />
          </n-form-item-grid-item>
          <n-form-item-gi :span="1" :label="$t('common.title')" path="title"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.title" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.name')" path="name" :rule="[
            { required: true, message: $tm(['common.pleaseInput', 'common.name']), trigger: ['blur', 'change', 'input'] },
            {
              asyncValidator: async (r, v) => {
                if (await routeStore.exist({ filter: { namespace: v }, id: modelForm._id })) throw new Error($t('message.error.existCode'))
              }, trigger: ['blur']
            }
          ]">
            <n-input v-model:value="modelForm.name" v-trim-blur
              :placeholder="$tm(['common.pleaseInput', 'common.name'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.path')" path="path"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.path']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.path" v-text-format:first placeholder="Eg: /system/user" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.group')" path="group"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.group']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.group" v-text-format:first placeholder="Eg: user" />
          </n-form-item-gi>
          <n-form-item-grid-item :span="1" :label="$t('common.type')" path="menuType">
            <n-radio-group v-model:value="modelForm.type" name="radiogroup">
              <n-space>
                <n-radio value="dir">
                  {{ $t('common.directory') }}
                </n-radio>
                <n-radio value="page">
                  {{ $t('common.page') }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item-grid-item>
          <n-form-item-grid-item :span="1" label="Icon" path="icon">
            <icon-select v-model:value="modelForm.icon" :disabled="modalType === 'view'" />
          </n-form-item-grid-item>
          <n-form-item-grid-item v-if="modelForm.type === 'page'" :span="2" :label="$t('common.component')"
            path="component">
            <n-input v-model:value="modelForm.component" v-text-format:first placeholder="Eg: /system/user/index.vue" />
          </n-form-item-grid-item>
          <n-form-item-grid-item :span="1" path="order">
            <template #label>
              {{ $t('common.sort') }}
              <HelpInfo :message="$t('message.help.sort')" />
            </template>
            <n-input-number v-model:value="modelForm.sort" />
          </n-form-item-grid-item>
          <n-form-item-grid-item v-if="modelForm.type === 'page'" :span="1" path="href">
            <template #label>
              {{ $t('common.externalLinks') }}
              <HelpInfo :message="$t('message.help.externalLinks')" />
            </template>
            <n-input v-model:value="modelForm.href" v-text-format:first placeholder="Eg: https://example.com" />
          </n-form-item-grid-item>
          <n-form-item-grid-item :span="1" :label="$t('components.routes.loginRequire')" path="requiresAuth">
            <n-switch v-model:value="modelForm.require" />
          </n-form-item-grid-item>
          <n-form-item-grid-item v-if="modelForm.type === 'page'" :span="1" :label="$t('components.routes.cachePage')"
            path="keep">
            <n-switch v-model:value="modelForm.keep" />
          </n-form-item-grid-item>
          <n-form-item-grid-item v-if="modelForm.type === 'page'" :span="1" :label="$t('components.routes.tabBar')"
            path="tab">
            <n-switch v-model:value="modelForm.tab" />
          </n-form-item-grid-item>
          <n-form-item-grid-item v-if="modelForm.type === 'page'" :span="1" :label="$t('components.routes.pinTabBar')"
            path="pin">
            <n-switch v-model:value="modelForm.pin" />
          </n-form-item-grid-item>
          <n-form-item-grid-item :span="1" :label="$t('components.routes.hideMenu')" path="hide">
            <n-switch v-model:value="modelForm.hide" />
          </n-form-item-grid-item>
          <n-form-item-grid-item v-if="modelForm.type === 'page' && modelForm.hide" :span="2" path="active">
            <template #label>
              {{ $t('components.routes.highlight') }}
              <HelpInfo :message="$t('message.help.highlightMenu')" />
            </template>
            <n-input v-model:value="modelForm.active" v-text-format:first />
          </n-form-item-grid-item>
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
