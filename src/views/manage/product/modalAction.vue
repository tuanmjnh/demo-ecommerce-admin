<script setup lang="ts">
import { useAppStore, useLoadingStore, useOptionsStore, useProductStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { debounce } from 'lodash'
import { toUpperCaseFirst, viToSlug, viToAscii } from 'tm-libs/string'
import { $t, $tm, generateCode, renderLabelSelect } from '@/utils'

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const optionsStore = useOptionsStore()
const productStore = useProductStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  groups = []
} = defineProps<{
  title?: string
  data: Models.IProduct | null
  dataDefault: Models.IProduct | null,
  groups: any[], //Models.IGroup[]
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
const pinKey = 'pin_product'
const pinOptions = computed(() => optionsStore.getFilterByKey({ key: pinKey, flag: 1 }))
const unitOptions = computed(() => optionsStore.getFilterByKey({ key: 'unit', flag: 1 }))
const fileList = ref<any[]>([])
const tabModel = ref('info')
const onReset = () => {
  modelForm.value = { ...data }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
  if (!modelForm.value.code) modelForm.value.code = generateCode()
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })
async function openModal(type: ModalType = 'add', data: Models.IProduct) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      modelForm.value = { ...data }
      modelForm.value.code = generateCode()
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
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

watch(() => modelForm.value.code, debounce(async (n) => {
  if (!n) return
  modelForm.value.code = viToAscii(n).toUpperCase()
}, 600))

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        modelForm.value.slug = viToSlug(modelForm.value.title)
        if (modalType.value == 'add') {
          productStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          productStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
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
    :title="`${toUpperCaseFirst(modalType)} - ${title}`" :segmented="{ content: true, action: true }">
    <template #header-extra>
      <n-space>
        <n-tooltip v-if="tabModel == 'images'" trigger="hover" placement="bottom">
          <template #trigger>
            <MediaGalleryLinks v-model="modelForm.images" multiple size="250x160" maxHeight="340px"
              :placeholder="$tm(['common.pleaseInput', 'common.link'])" :title="$t('common.link')"
              :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
              :delete-title="$tm(['common.confirm', 'common.delete'])" :delete-message="$t('message.confirm.deleteOne')"
              :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])" />
          </template>
          {{ $t('common.save') }}
        </n-tooltip>
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
      <n-tabs v-model:value="tabModel" type="line" animated>
        <n-tab-pane name="info" :tab="$t('tabs.info')">
          <n-scrollbar style="max-height: calc(100vh - 250px)" trigger="none" class="pr-3">
            <n-grid :cols="24" :x-gap="18">
              <n-form-item-gi :span="16" :label="$t('common.title')" path="title"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
                <n-input v-model:value="modelForm.title" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" :label="$t('components.product.code')" path="code" :rule="[
                { required: true, message: $tm(['common.pleaseInput', 'components.product.code']), trigger: ['blur', 'change', 'input'] },
                {
                  asyncValidator: async (r, v) => {
                    if (await productStore.exist({ filter: { code: v }, id: modelForm._id })) throw new Error($t('message.error.existCode'))
                  }, trigger: ['blur']
                }
              ]">
                <n-input v-model:value="modelForm.code" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.product.code'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" :label="$t('components.product.groups')" path="groups"
                :rule="[{ type: 'array', required: true, message: $tm(['common.pleaseInput', 'components.product.groups']), trigger: ['blur', 'change', 'input'] }]">
                <n-tree-select :options="groups" key-field="_id" label-field="title" :placeholder="$t('common.default')"
                  multiple checkable virtual-scroll check-strategy="all" :default-value="modelForm.groups"
                  :default-expanded-keys="modelForm.groups"
                  :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
                  @update:value="(v: any, o: any) => { modelForm.groups = v }">
                  <template #empty>{{ $t('common.noData') }}</template>
                </n-tree-select>
              </n-form-item-gi>
              <n-form-item-gi :span="24" :label="$t('common.avatar')" path="image">
                <MediaGallery v-model="modelForm.image" :delete-title="$tm(['common.confirm', 'common.delete'])"
                  :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
                  :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
                  :rename-text="$tm(['common.input', 'common.renameFile'])" />
                <MediaGalleryLinks class="ml-5" v-model="modelForm.image" quaternary size="250x160" maxHeight="340px"
                  :placeholder="$tm(['common.pleaseInput', 'common.link'])" :title="$t('common.link')"
                  :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
                  :delete-title="$tm(['common.confirm', 'common.delete'])"
                  :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
                  :rename-text="$tm(['common.input', 'common.renameFile'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" :label="$t('common.desc')" path="desc">
                <n-input v-model:value="modelForm.desc" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.desc'])" type="textarea"
                  :autosize="{ minRows: 3, maxRows: 5 }" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" :label="$t('common.attach')" path="attachs">
                <n-upload action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f" :default-file-list="fileList">
                  <n-button>Upload File</n-button>
                </n-upload>
              </n-form-item-gi>
              <!-- <n-form-item-gi :span="24" :label="$t('common.meta')" path="meta">
                <n-input-number v-model:value="modelForm.meta" :placeholder="$tm(['common.pleaseInput', 'common.meta'])" />
              </n-form-item-gi> -->
              <n-form-item-gi :span="24" :label="$t('common.pin')" path="pins">
                <n-select v-model:value="modelForm.pins" :options="pinOptions" clearable filterable multiple
                  :placeholder="$tm(['common.pleaseSelect', 'common.pin'])" value-field="code"
                  :render-label="(o: any) => $t(`components.options.${pinKey}.${o.code}`, o.title)">
                  <template #empty>{{ $t('common.noData') }}</template>
                </n-select>
              </n-form-item-gi>
              <n-form-item-gi :span="24" :label="$t('common.tags')" path="tags">
                <TagsManager v-model="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('common.sort')" path="sort"
                :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.sort']), trigger: ['blur', 'change', 'input'] }]">
                <n-input-number v-model:value="modelForm.sort"
                  :placeholder="$tm(['common.pleaseInput', 'common.sort'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('common.status')" path="flag">
                <n-switch v-model:value="modelForm.flag" :default-value="1" :checked-value="1" :unchecked-value="0">
                  <template #checked>
                    {{ $t('common.display') }}
                  </template>
                  <template #unchecked>
                    {{ $t('common.hidden') }}
                  </template>
                </n-switch>
              </n-form-item-gi>
              <n-form-item-gi v-if="modalType == 'edit'" :span="24" :label="$t('common.created')">
                <span v-if="modelForm.created && modelForm.created.at" class="mr-2">
                  {{ appStore.formatDateTime(modelForm.created.at) }}
                </span>
                <span v-else class="mr-2 color-sky-300 italic">{{ $t('common.updating') }}</span>
                <span v-if="modelForm.created?.by">-</span>
                <span v-if="modelForm.created?.by" class="ml-2">{{ modelForm.created?.by }}</span>
              </n-form-item-gi>
            </n-grid>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="content" :tab="$t('tabs.content')">
          <!-- <RichTextEditor v-model="modelForm.content" :disabled="true" /> -->
          <!-- <MarkDownEditor v-model="modelForm.content" /> -->
          <!-- <n-scrollbar style="max-height: calc(100vh - 190px)" trigger="none" class="pr-3"> -->
          <TinymceEditor v-model:value="modelForm.content" :height="500"
            :placeholder="$tm(['common.pleaseInput', 'common.content'])" />
          <!-- </n-scrollbar> -->
        </n-tab-pane>
        <n-tab-pane name="attributes" :tab="$t('tabs.attributes')">
          <n-scrollbar style="max-height: calc(100vh - 190px)" trigger="none" class="pr-3">
            <n-grid :cols="24" :x-gap="18">
              <n-form-item-gi :span="12" :label="$t('components.product.priceSelling')" path="priceSelling">
                <n-input-group>
                  <n-input-number v-model:value="modelForm.priceSelling"
                    :placeholder="$tm(['common.pleaseInput', 'components.product.priceSelling'])" />
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button type="primary" text-color="#fff" @click="modelForm.priceSelling = -1">
                        <nova-icon icon="icon-park-outline:two-ellipses" />
                      </n-button>
                    </template>
                    {{ $t('components.product.priceContact') }}
                  </n-tooltip>
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.pricePromotional')" path="pricePromotional">
                <n-input-group>
                  <n-input-number v-model:value="modelForm.pricePromotional"
                    :placeholder="$tm(['common.pleaseInput', 'components.product.pricePromotional'])" />
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button type="primary" text-color="#fff" @click="modelForm.pricePromotional = -1">
                        <nova-icon icon="icon-park-outline:two-ellipses" />
                      </n-button>
                    </template>
                    {{ $t('components.product.priceContact') }}
                  </n-tooltip>
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.quantity')" path="quantity">
                <n-input-number v-model:value="modelForm.quantity"
                  :placeholder="$tm(['common.pleaseInput', 'components.product.quantity'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12">
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.unit')" path="unit">
                <n-select v-model:value="modelForm.unit" :options="unitOptions" clearable filterable
                  :placeholder="$tm(['common.pleaseSelect', 'common.status'])" value-field="code" label-field="title">
                  <template #empty>{{ $t('common.noData') }}</template>
                </n-select>
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.brand')" path="brand">
                <n-input v-model:value="modelForm.brand" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.product.brand'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.originName')" path="originName">
                <n-input v-model:value="modelForm.originName" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.product.originName'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.originAddress')" path="originAddress">
                <n-input v-model:value="modelForm.originAddress" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.product.originAddress'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.weight')" path="weight">
                <n-input-number v-model:value="modelForm.weight"
                  :placeholder="$tm(['common.pleaseInput', 'components.product.weight'])" />
              </n-form-item-gi>
              <n-form-item-gi :span="12" :label="$t('components.product.warranty')" path="warranty">
                <n-input v-model:value="modelForm.warranty" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.product.warranty'])" />
              </n-form-item-gi>
            </n-grid>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="images" :tab="$t('tabs.images')">
          <n-scrollbar style="max-height: calc(100vh - 350px)" trigger="none" class="pr-3">
            <MediaGallery v-model="modelForm.images" multiple size="276" show-name
              :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
              :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
              :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
              :upload-select-text="$t('components.upload.selectorDrag')"
              :upload-new-file="$t('components.upload.newFile')" />
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>
    </n-form>
  </n-modal>
</template>

<style scoped></style>
