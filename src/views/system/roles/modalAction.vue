<script setup lang="ts">
import { useAppStore, useLoadingStore, useRoleStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { debounce } from 'lodash'
import { toUpperCaseFirst, viToAscii } from 'tm-libs/string'
import { $t, $tm, generateCode, renderLabelIcon } from '@/utils'

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const roleStore = useRoleStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  routes = [],
  routesTree = []
} = defineProps<{
  title?: string
  data: Models.IRole | null
  dataDefault: Models.IRole | null
  routes: any[]
  routesTree: any[]
}>()
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'onOpen'): void
  (e: 'onClose'): void
}>()

const { bool: isLoadingTree, setTrue: startLoadingTree, setFalse: stopLoadingTree } = useBoolean(false)
const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const modalType = shallowRef<ModalType>('add')
const modelForm = ref({ ...data })
const modelFormRef = ref()
const routesAll: string[] = JSON.parse(JSON.stringify(routes.map(x => x.name)))
const routesAccess: string[] = JSON.parse(JSON.stringify(routes.filter(x => x.access).map(x => x.name)))
const onReset = () => {
  modelForm.value = { ...data, ...{ routes: roleStore.getAccessRoutes } }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })
async function openModal(type: ModalType = 'add', data: Models.IRole) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      // modelForm.value = { ...data, ...{ routes: roleStore.accessRoutes } }
      modelForm.value = { ...data }
      modelForm.value.key = modelForm.value.key || 'manager'
      modelForm.value.code = generateCode()
      modelForm.value.routes = modelForm.value.routes && modelForm.value.routes.length > 0 ? modelForm.value.routes : roleStore.getAccessRoutes
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
      modelForm.value.key = modelForm.value.key || 'manager'
      if (!modelForm.value.code) modelForm.value.code = generateCode()
    },
  } as any
  await handlers[type]()
}

const closeModal = () => {
  hiddenModal()
  emit('onClose')
}

defineExpose({ openModal })

const onCheckedAllRoutes = async () => {
  startLoadingTree()
  modelForm.value.routes = modelForm.value.routes?.length == routesAll.length ? routesAccess : routesAll
  setTimeout(() => { stopLoadingTree() }, 300)
}
const updateCheckedRoute = (
  keys: Array<string>,
  options: Array<any | null>,
  meta: {
    node: any | null
    action: 'check' | 'uncheck'
  }
) => {
  modelForm.value.routes = keys
}

watch(() => modelForm.value.code, debounce(async (n) => {
  if (!n) return
  modelForm.value.code = viToAscii(n).toUpperCase()
}, 600))

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        if (modalType.value == 'add') {
          roleStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          roleStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
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
  <n-modal v-model:show="modalVisible" :mask-closable="false" :closable="false" preset="card"
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
            <n-button type="success" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
              @click="onCheckedAllRoutes">
              <nova-icon icon="icon-park-outline:check-correct" />
            </n-button>
          </template>
          {{ $t('common.selectAll') }} / {{ $t('common.deselectAll') }}
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

    <n-grid :cols="2" :x-gap="18">
      <n-gi>
        <n-scrollbar style="max-height: calc(100vh - 160px)" trigger="none" class="pr-3">
          <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="150">
            <n-grid :cols="2" :x-gap="8">
              <n-form-item-gi :span="2" :label="$t('common.title')" path="title"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
                <n-input v-model:value="modelForm.title" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
              </n-form-item-gi>
              <!-- <n-form-item-gi :span="3" path="color" class="flex flex-row-reverse">
                <n-button type="info" text-color="#FFFFFF" :color="modelForm.color">
                  <nova-icon icon="icon-park-outline:background-color" />
                </n-button>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-color-picker :swatches="[
                      '#FFFFFF',
                      '#18A058',
                      '#2080F0',
                      '#F0A020',
                      'rgba(208, 48, 80, 1)',
                    ]" class="absolute opacity-0 overflow-hidden w-[46px] h-[34px]" default-value="#A3A3A3"
                      :modes="['hex']" @update:value="(val) => modelForm.color = val" />
                  </template>
                  {{ $t('common.color') }}
                </n-tooltip>
              </n-form-item-gi> -->
              <!-- <n-form-item-gi :span="12" :label="$t('common.key')" path="key"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.key']), trigger: ['blur', 'change', 'input'] }]">
                <n-input v-model:value="modelForm.key" :placeholder="$tm(['common.pleaseInput', 'common.key'])" />
              </n-form-item-gi> -->
              <n-form-item-gi :span="2" :label="$t('common.code')" path="code" :rule="[
                { required: true, message: $tm(['common.pleaseInput', 'common.code']), trigger: ['blur', 'change', 'input'] },
                {
                  asyncValidator: async (r, v) => {
                    if (await roleStore.exist({ filter: { code: v }, id: modelForm._id })) throw new Error($t('message.error.existCode'))
                  }, trigger: ['blur']
                }]">
                <n-input v-model:value="modelForm.code" v-text-format:upper
                  :placeholder="$tm(['common.pleaseInput', 'common.code'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="1" :label="$t('common.level')" path="level"
                :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.level']), trigger: ['blur', 'change', 'input'] }]">
                <n-input-number v-model:value="modelForm.level"
                  :placeholder="$tm(['common.pleaseInput', 'common.level'])" />
              </n-form-item-gi>
              <n-form-item-grid-item :span="1" label="Icon" path="icon" class="min-w-180px">
                <icon-select v-model:value="modelForm.icon" :disabled="modalType === 'view'" :show-input="false" />
              </n-form-item-grid-item>
              <n-form-item-gi :span="2" :label="$t('common.color')" path="color" class="">
                <n-input-group>
                  <n-input v-model:value="modelForm.color" :readonly="false" clearable
                    :placeholder="$tm(['common.select', 'common.color'])" />
                  <div class="flex flex-row-reverse">
                    <n-button type="info" text-color="#FFFFFF" :color="modelForm.color">
                      <nova-icon icon="icon-park-outline:background-color" />
                    </n-button>
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-color-picker :swatches="[
                          '#FFFFFF',
                          '#18A058',
                          '#2080F0',
                          '#F0A020',
                          'rgba(208, 48, 80, 1)',
                        ]" class="absolute opacity-0 overflow-hidden w-[46px] h-[34px]" default-value="#A3A3A3"
                          :show-alpha="false" :modes="['hex']" @update:value="(val) => modelForm.color = val" />
                      </template>
                      {{ $t('common.color') }}
                    </n-tooltip>
                  </div>
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('common.desc')" path="desc">
                <n-input v-model:value="modelForm.desc" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.desc'])" type="textarea"
                  :autosize="{ minRows: 3, maxRows: 5 }" />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('common.status')" path="flag">
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
      </n-gi>
      <n-gi>
        <n-scrollbar style="max-height: calc(100vh - 160px)" trigger="none" class="pr-3">
          <n-data-table v-if="isLoadingTree" :loading="isLoadingTree" class="h-700px" />
          <n-tree v-else block-line checkable show-line :data="routesTree" default-expand-all check-strategy="all"
            key-field="name" label-field="title" :default-checked-keys="modelForm.routes"
            :render-label="({ option }: any) => renderLabelIcon(option, appStore.colorMode, (option) => $t(`route.${option.name}`))"
            @update:checked-keys="updateCheckedRoute" />
        </n-scrollbar>
      </n-gi>
    </n-grid>
  </n-modal>
</template>

<style scoped></style>
