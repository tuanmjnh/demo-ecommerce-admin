<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui'
import { useAppStore, useLoadingStore, useOptionsStore, usePostStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { NewGuid } from 'tm-libs/crypto'
import { toUpperCaseFirst, viToSlug, viToAscii } from 'tm-libs/string'
import { $t, $tm, generateCode, renderLabelSelect } from '@/utils'

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const optionsStore = useOptionsStore()
const postStore = usePostStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  groups = [],
} = defineProps<{
  title?: string
  data: Models.IPost | null
  dataDefault: Models.IPost | null,
  groups: any[] //Models.IGroup[]
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
const relatedLinks = ref('')
// const pins = [] as any[]//[{ label: 'New', value: 'post' }, { label: 'Hot', value: 'hot' }]
const pinKey = 'pin_post'
const pinOptions = computed(() => optionsStore.getFilterByKey({ key: pinKey, flag: 1 }))
const statusKey = 'status'
const statusOptions = computed(() => optionsStore.getFilterByKey({ key: statusKey, flag: 1 }))
const authorOptions = computed(() => optionsStore.getFilterByKey({ key: 'author', flag: 1 }))
const fileList = ref<UploadFileInfo[]>([
  {
    id: 'c',
    name: 'test.png',
    status: 'finished',
    url: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
  },
])
const onReset = () => {
  modelForm.value = { ...data }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
  if (!modelForm.value.code) modelForm.value.code = generateCode()
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })
async function openModal(type: ModalType = 'add', data: Models.IPost) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      modelForm.value = { ...data }
      modelForm.value.code = NewGuid()
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
      if (!modelForm.value.code) modelForm.value.code = NewGuid()
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
        modelForm.value.slug = viToSlug(modelForm.value.title)
        modelForm.value.relatedLinks = relatedLinks.value ? relatedLinks.value.split('\n') : null
        if (modalType.value == 'add') {
          postStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          postStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
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
  <n-modal v-model:show="modalVisible" :mask-closable="false" :closable="false" preset="card" class="max-w-1200px"
    :block-scroll="false" :trap-focus="false" :title="`${toUpperCaseFirst(modalType)} - ${title}`"
    :segmented="{ content: true, action: true }">
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


    <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="150">
      <n-tabs type="line" animated>
        <n-tab-pane name="info" :tab="$t('tabs.info')">
          <n-scrollbar style="max-height: calc(100vh - 250px)" trigger="none" class="pr-3">
            <n-grid :cols="2" :x-gap="18">
              <n-form-item-gi :span="2" :label="$t('common.title')" path="title"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
                <n-input v-model:value="modelForm.title" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('common.avatar')" path="image">
                <MediaGallery v-model="modelForm.image" size="auto"
                  :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
                  :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
                  :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
                  :upload-select-text="$t('components.upload.selectorDrag')"
                  :upload-new-file="$t('components.upload.newFile')" />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('components.post.groups')" path="groups"
                :rule="[{ type: 'array', required: true, message: $tm(['common.pleaseInput', 'components.post.groups']), trigger: ['blur', 'change', 'input'] }]">
                <n-tree-select :options="groups" key-field="_id" label-field="title" :placeholder="$t('common.default')"
                  multiple checkable virtual-scroll check-strategy="all" :default-value="modelForm.groups"
                  :default-expanded-keys="modelForm.groups"
                  :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
                  @update:value="(v: any, o: any) => { modelForm.groups = v }">
                  <template #empty>{{ $t('common.noData') }}</template>
                </n-tree-select>
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('common.desc')" path="desc">
                <n-input v-model:value="modelForm.desc" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.desc'])" type="textarea"
                  :autosize="{ minRows: 3, maxRows: 5 }" />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('components.post.footer')" path="footer">
                <n-input v-model:value="modelForm.bottomContent" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.post.footer'])" type="textarea"
                  :autosize="{ minRows: 3, maxRows: 5 }" />
              </n-form-item-gi>
              <!-- <n-form-item-gi :span="1" :label="$t('common.key')" path="key"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.key']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.key" :placeholder="$tm(['common.pleaseInput', 'common.key'])"
              :readonly="modalType === 'edit'" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.code')" path="code"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.code']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.code" :placeholder="$tm(['common.pleaseInput', 'common.code'])" />
          </n-form-item-gi> -->
              <n-form-item-gi :span="2" :label="$t('components.post.author')" path="author"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.post.author']), trigger: ['blur', 'change', 'input'] }]">
                <n-input-group>
                  <n-input v-model:value="modelForm.author" v-text-format:first
                    :placeholder="$tm(['common.pleaseInput', 'components.post.author'])" />
                  <!-- <n-select :options="authorOptions" clearable filterable style="width: 33%;"
                    :placeholder="$tm(['common.pleaseSelect', 'common.pin'])" value-field="code"
                    :render-label="(o: any) => $t(`components.options.author.${o.code}`, o.title)"
                    @update:value="(o: any) => modelForm.author = o.code">
                    <template #empty>{{ $t('common.noData') }}</template>
                  </n-select> -->
                  <n-dropdown :options="authorOptions" key-field="code"
                    :render-label="(o: any) => $t(`components.options.author.${o.code}`, o.title)"
                    @select="(k: any, o: any) => modelForm.author = o.title">
                    <n-button>{{ $t('common.select') }}</n-button>
                  </n-dropdown>
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi :span="1" :label="$t('components.post.date')" path="date"
                :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'components.post.date']), trigger: ['blur', 'change', 'input'] }]">
                <n-date-picker v-model:value="modelForm.date" type="date" format="dd-MM-yyyy"
                  :placeholder="$tm(['common.pleaseInput', 'components.post.date'])" input-readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="1" :label="$t('components.post.expired')" path="expiredAt">
                <n-date-picker v-model:value="modelForm.expiredAt" type="date" format="dd-MM-yyyy"
                  :placeholder="$tm(['common.pleaseInput', 'components.post.expired'])" input-readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('components.post.links')" path="links">
                <n-input v-model:value="relatedLinks" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.post.links'])" type="textarea"
                  :autosize="{ minRows: 1, maxRows: 5 }" />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('common.attach')" path="attachs">
                <n-upload action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f" :default-file-list="fileList">
                  <n-button>Upload File</n-button>
                </n-upload>
              </n-form-item-gi>
              <!-- <n-form-item-gi :span="1" :label="$t('common.sort')" path="sort"
            :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.sort']), trigger: ['blur', 'change', 'input'] }]">
            <n-input-number v-model:value="modelForm.sort" :placeholder="$tm(['common.pleaseInput', 'common.sort'])" />
          </n-form-item-gi> -->
              <n-form-item-gi :span="1" :label="$t('common.pin')" path="pins">
                <n-select v-model:value="modelForm.pins" :options="pinOptions" clearable filterable multiple
                  :placeholder="$tm(['common.pleaseSelect', 'common.pin'])" value-field="code"
                  :render-label="(o: any) => $t(`components.options.${pinKey}.${o.code}`, o.title)">
                  <template #empty>{{ $t('common.noData') }}</template>
                </n-select>
              </n-form-item-gi>
              <!-- <n-form-item-gi :span="2" :label="$t('common.meta')" path="meta"> -->
              <!-- <n-input-number v-model:value="modelForm.meta" :placeholder="$tm(['common.pleaseInput', 'common.meta'])" /> -->
              <!-- </n-form-item-gi> -->
              <n-form-item-gi :span="1" :label="$t('common.tags')" path="tags">
                <TagsManager v-model="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])"
                  :help-message="$t('message.help.tagPost')" />
              </n-form-item-gi>
              <n-form-item-gi :span="2" :label="$t('common.seoData')" path="tags">
                <SeoManager v-model="modelForm.seo" :placeholder-title="$tm(['common.pleaseInput', 'common.seoTitle'])"
                  :placeholder-desc="$tm(['common.pleaseInput', 'common.seoDesc'])"
                  :placeholder-tags="$tm(['common.pleaseInput', 'common.seoTags'])" />
              </n-form-item-gi>
              <!-- <n-form-item-gi :span="2" :label="$t('common.attributes')" path="meta">
          </n-form-item-gi> -->
              <!-- <n-form-item-gi :span="1" :label="$t('common.status')" path="status">
                <n-tag type="warning">
                  {{ toUpperCaseFirst(modelForm.status) }}
                </n-tag>
              </n-form-item-gi> -->
              <n-form-item-gi :span="1" :label="$t('common.status')" path="status">
                <n-select v-model:value="modelForm.status" :options="statusOptions" clearable filterable
                  :placeholder="$tm(['common.pleaseSelect', 'common.status'])" value-field="code"
                  :render-label="(o: any) => $t(`components.options.${statusKey}.${o.code}`, o.title)">
                  <template #empty>{{ $t('common.noData') }}</template>
                </n-select>
              </n-form-item-gi>
              <n-form-item-gi :span="1" :label="$t('common.active')" path="flag">
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
                <span v-if="modelForm.createdAt && modelForm.createdAt" class="mr-2">
                  {{ appStore.formatDateTime(modelForm.createdAt) }}
                </span>
                <span v-else class="mr-2 color-sky-300 italic">{{ $t('common.updating') }}</span>
                <!-- <span v-if="modelForm.createdBy">-</span>
                <span v-if="modelForm.createdBy" class="ml-2">{{ modelForm.createdBy }}</span> -->
              </n-form-item-gi>
            </n-grid>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="content" :tab="$t('tabs.content')">
          <TinymceEditor v-model:value="modelForm.content" :height="500"
            :placeholder="$tm(['common.pleaseInput', 'common.content'])" />
        </n-tab-pane>
      </n-tabs>
    </n-form>
  </n-modal>
</template>

<style scoped></style>
