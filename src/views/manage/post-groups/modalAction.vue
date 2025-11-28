<script setup lang="ts">
import { useAppStore, useLoadingStore, useGroupStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { debounce } from 'lodash'
import { viToAscii, viToSlug } from 'tm-libs/string'
import { $t, $tm, generateCode, renderLabelSelect } from '@/utils'
// import modalSelect from './modalSelect.vue'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const groupStore = useGroupStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  groupType = 'user'
} = defineProps<{
  title?: string
  data: Models.IGroup | null
  dataDefault: Models.IGroup | null
  groupType: string
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
// const groups = computed(() => groupStore.treeGroups)
const groups = ref([])
const onReset = () => {
  modelForm.value = { ...data }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
  modelForm.value.key = groupType
  if (!modelForm.value.code) modelForm.value.code = generateCode()
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })

async function openModal(type: ModalType = 'add', data: Models.IGroup) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      modelForm.value = { ...data }
      modelForm.value.code = generateCode()
      groups.value = groupStore.getTreeGroupsSelect()
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
      groups.value = groupStore.getTreeGroupsSelect(modelForm.value._id)
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
      if (!modelForm.value.code) modelForm.value.code = generateCode()
      groups.value = groupStore.getTreeGroupsSelect(modelForm.value._id)
    },
  } as any
  await handlers[type]()
  // console.log(groups.value)
  // console.log(modelForm.value)
}

const closeModal = () => {
  hiddenModal()
  emit('onClose')
}

defineExpose({ openModal })

watch(() => modelForm.value.code, debounce(async (n) => {
  if (!n) return
  modelForm.value.code = viToAscii(n).toUpperCase()
}, 600))

watch(() => modelForm.value.title, debounce(async (n) => {
  if (!n) return
  modelForm.value.slug = viToSlug(n)
}, 600))

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        modelForm.value.code = viToAscii(modelForm.value.code)
        if (modalType.value == 'add') {
          groupStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          groupStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
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
    :title="`${$t(`common.${modalType}`)} - ${title}`" :segmented="{ content: true, action: true }">
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
          <!-- <n-form-item-gi :span="12" :label="$t('common.key')" path="key"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.key']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.key" :placeholder="$tm(['common.pleaseInput', 'common.key'])" />
          </n-form-item-gi> -->
          <n-form-item-gi :span="1" :label="$t('common.code')" path="code" :rule="[
            { required: true, message: $tm(['common.pleaseInput', 'common.code']), trigger: ['blur', 'change', 'input'] },
            {
              asyncValidator: async (r, v) => {
                if (await groupStore.exist({ filter: { code: v }, id: modelForm._id })) throw new Error($t('message.error.existCode'))
              }, trigger: ['blur']
            }
          ]">
            <n-input v-model:value="modelForm.code" v-text-format:upper
              :placeholder="$tm(['common.pleaseInput', 'common.code'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('components.groups.dependent')" path="parent">
            <!-- <n-input-group> -->
            <n-tree-select :options="groups" key-field="_id" label-field="title" :default-value="modelForm.parent"
              :placeholder="$t('common.default')" :default-expanded-keys="[modelForm.parent]"
              :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
              @update:value="(v: any, o: any) => { modelForm.parent = v }">
              <template #empty>{{ $t('common.noData') }}</template>
            </n-tree-select>
            <help-info class="ml-2" :message="$t('components.groups.dependentHelp')" />
            <!-- </n-input-group> -->
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.color')" path="color" class="">
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
          <n-form-item-grid-item :span="1" label="Icon" path="icon">
            <icon-select v-model:value="modelForm.icon" :disabled="modalType === 'view'" />
          </n-form-item-grid-item>
          <n-form-item-gi :span="1" :label="$t('common.level')" path="level"
            :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.level']), trigger: ['blur', 'change', 'input'] }]">
            <n-input-number v-model:value="modelForm.level"
              :placeholder="$tm(['common.pleaseInput', 'common.level'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.sort')" path="sort"
            :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.sort']), trigger: ['blur', 'change', 'input'] }]">
            <n-input-number v-model:value="modelForm.sort" :placeholder="$tm(['common.pleaseInput', 'common.sort'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('common.desc')" path="desc">
            <n-input v-model:value="modelForm.desc" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.desc'])" type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('common.content')" path="content">
            <n-input v-model:value="modelForm.content" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.content'])" type="textarea"
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
          <n-form-item-gi :span="2" :label="$t('common.tags')" path="tags">
            <!-- <n-input-number v-model:value="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])" /> -->
            <TagsManager v-model="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])"
              :help-message="$t('message.help.tagPost')" />
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
    <!-- <modal-select ref="modalSelectRef" :nodes="nodes" /> -->
  </n-modal>
</template>

<style scoped></style>
