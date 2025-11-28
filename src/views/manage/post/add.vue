<script setup lang="ts">
import { useAppStore, useLoadingStore, useOptionsStore, useGroupStore, usePostStore } from '@/stores'
import { viToSlug } from 'tm-libs/string'
import { NewGuid } from 'tm-libs/crypto'
import { $t, $tm, renderLabelSelect } from '@/utils'

const route = useRoute()
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const optionsStore = useOptionsStore()
const groupStore = useGroupStore()
const postStore = usePostStore()
const mode = ref<'add' | 'edit'>('add')
const formRef = ref()
const modelForm = ref<Models.IPost>(JSON.parse(JSON.stringify(postStore.item)))
const relatedLinks = ref('')
const groupType = route.meta.group || 'post'
const groups = computed(() => groupStore.getTreeGroups)
const pinKey = 'pin_post'
const pinOptions = computed(() => optionsStore.getFilterByKey({ key: pinKey, flag: 1 }))
const statusKey = 'status'
const statusOptions = computed(() => optionsStore.getFilterByKey({ key: statusKey, flag: 1 }))
const authorOptions = computed(() => optionsStore.getFilterByKey({ key: 'author', flag: 1 }))
/** Create slug when entering title */
const updateSlug = () => {
  modelForm.value.slug = viToSlug(modelForm.value.title)
}
const onSubmit = () => {
  formRef.value.validate((err: any) => {
    if (err) return
    modelForm.value.key = groupType
    modelForm.value.relatedLinks = relatedLinks.value ? relatedLinks.value?.split('\n') : null
    modelForm.value.meta = modelForm.value.meta?.filter(x => x.key) || null
    if (!modelForm.value.slug)
      modelForm.value.slug = viToSlug(modelForm.value.title)
    if (!modelForm.value.code) modelForm.value.code = NewGuid()

    const payload = JSON.parse(JSON.stringify(modelForm.value))

    if (mode.value === 'add') {
      postStore.create(payload).then(res => {
        if (res.status) {
          window.$message.success($t('message.success.createdNew'))
          onReset()
        } else window.$message.error($t(`message.error.${res.statusMessage}`))
      })
      if (modelForm.value.meta && modelForm.value.meta.length)
        optionsStore.setMeta(modelForm.value.meta.map((m: any) => m.key))
    } else {
      postStore.update(payload).then(res => {
        if (res.status) {
          window.$message.success($t('message.success.updated'))
        } else window.$message.error($t(`message.error.${res.statusMessage}`))
      })
      if (modelForm.value.meta && modelForm.value.meta.length)
        optionsStore.setMeta(modelForm.value.meta.map((m: any) => m.key))
    }
  })
}
const onReset = () => {
  formRef.value?.restoreValidation()
  postStore.setItem().then(() => { modelForm.value = JSON.parse(JSON.stringify(postStore.item)) })
}
watch(() => route.params.id, (n) => {
  if (n) {
    mode.value = 'edit'
    postStore.findById(String(n)).then(res => { if (res.status) modelForm.value = res.data })
  } else {
    mode.value = 'add'
    if (postStore.item._id) onReset()
    // if (postStore.item._id) postStore.copyItem().then(() => { modelForm.value = postStore.item })
    // else modelForm.value = postStore.item
  }
}, { deep: true, immediate: true })

const getMetaValue = (key: string) => {
  if (!Array.isArray(modelForm.value.meta)) return ''
  return modelForm.value.meta.find((m: any) => m.key === key)?.value || ''
}
const setMetaValue = (key: string, value: string) => {
  if (!Array.isArray(modelForm.value.meta)) modelForm.value.meta = []
  const idx = modelForm.value.meta.findIndex((m: any) => m.key === key)
  if (idx > -1) modelForm.value.meta[idx].value = value
  else modelForm.value.meta.push({ key, value })
}

const videoUrl = computed({
  get: () => getMetaValue('videoUrl'),
  set: (v) => setMetaValue('videoUrl', v)
})
const audioUrl = computed({
  get: () => getMetaValue('audioUrl'),
  set: (v) => setMetaValue('audioUrl', v)
})
const quoteText = computed({
  get: () => getMetaValue('quoteText'),
  set: (v) => setMetaValue('quoteText', v)
})
const quoteAuthor = computed({
  get: () => getMetaValue('quoteAuthor'),
  set: (v) => setMetaValue('quoteAuthor', v)
})
const targetUrl = computed({
  get: () => getMetaValue('targetUrl'),
  set: (v) => setMetaValue('targetUrl', v)
})
</script>

<template>
  <n-layout has-sider>
    <!-- <n-layout-content class="p-4"> -->
    <div class="w-full mr-3">
      <!-- <n-scrollbar style="max-height: calc(100vh - 185px)"> -->
      <n-card>
        <n-form ref="formRef" :model="modelForm" label-placement="top">
          <n-grid :cols="2" :x-gap="18">
            <!-- <n-form-item-gi :span="1" :label="$t('components.post.groups')" path="groups"
              :rule="[{ required: true, message: $tm(['common.pleaseSelect', 'components.post.groups']), trigger: ['blur', 'change', 'input'] }]">
              <n-tree-select :options="(groups as any)" key-field="_id" label-field="title"
                :placeholder="$t('common.default')" multiple checkable virtual-scroll check-strategy="all"
                :default-value="modelForm.groups" :default-expanded-keys="modelForm.groups"
                :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
                @update:value="(v: any, o: any) => { modelForm.groups = v }">
                <template #empty>{{ $t('common.noData') }}</template>
</n-tree-select>
</n-form-item-gi> -->

            <n-form-item-gi :span="1" :label="$t('common.title')" path="title"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelForm.title" @input="updateSlug" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="1" :label="$t('common.permalink')">
              <n-input v-model:value="modelForm.slug" :placeholder="$tm(['common.autoGenerate', 'common.slug'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="1" :label="$t('components.post.author')" path="author">
              <n-input-group>
                <n-input v-model:value="modelForm.author" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'components.post.author'])" />
                <n-dropdown :options="authorOptions" key-field="code"
                  :render-label="(o: any) => $t(`components.options.author.${o.code}`, o.title)"
                  @select="(k: any, o: any) => modelForm.author = o.title">
                  <n-button>{{ $t('common.select') }}</n-button>
                </n-dropdown>
              </n-input-group>
            </n-form-item-gi>

            <n-form-item-gi :span="1" :label="$t('common.pin')">
              <n-select v-model:value="modelForm.pins" :options="pinOptions" filterable multiple
                :placeholder="$tm(['common.pleaseSelect', 'common.pin'])" value-field="code"
                :render-label="(o: any) => $t(`components.options.${pinKey}.${o.code}`, o.title)">
                <template #empty>{{ $t('common.noData') }}</template>
              </n-select>
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.excerpt')" path="desc">
              <n-input v-model:value="modelForm.desc" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
                v-text-format:first :placeholder="$tm(['common.pleaseInput', 'common.excerpt'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('components.post.footer')" path="footer">
              <n-input v-model:value="modelForm.bottomContent" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'components.post.footer'])" type="textarea"
                :autosize="{ minRows: 3, maxRows: 5 }" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('components.post.links')" path="links">
              <n-input v-model:value="relatedLinks" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'components.post.links'])" type="textarea"
                :autosize="{ minRows: 1, maxRows: 5 }" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.gallery')" v-if="modelForm.format === 'gallery'">
              <div>
                <MediaGalleryLinks class="absolute -top-10 right-0" v-model="modelForm.images" quaternary multiple
                  size="250x160" maxHeight="340px" :placeholder="$tm(['common.pleaseInput', 'common.link'])"
                  :title="$t('common.link')" :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
                  :delete-title="$tm(['common.confirm', 'common.delete'])"
                  :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
                  :rename-text="$tm(['common.input', 'common.renameFile'])" />
                <n-scrollbar style="max-height: 160px" trigger="none" class="pr-5">
                  <MediaGallery v-model="modelForm.images" multiple size="220x160" show-name
                    :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
                    :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
                    :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
                    :upload-select-text="$t('components.upload.selectorDrag')"
                    :upload-new-file="$t('components.upload.newFile')" />
                </n-scrollbar>
              </div>
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.videoUrl')" v-if="modelForm.format === 'video'">
              <n-input v-model:value="videoUrl" :placeholder="$tm(['common.pleaseInput', 'common.videoUrl'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.audioUrl')" v-if="modelForm.format === 'audio'">
              <n-input v-model:value="audioUrl" :placeholder="$tm(['common.pleaseInput', 'common.audioUrl'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.quoteText')" v-if="modelForm.format === 'quote'">
              <n-input v-model:value="quoteText" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }"
                :placeholder="$tm(['common.pleaseInput', 'common.quoteText'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="2" :label="$t('common.quoteAuthor')" v-if="modelForm.format === 'quote'">
              <n-input v-model:value="quoteAuthor" :placeholder="$tm(['common.pleaseInput', 'common.quoteAuthor'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.targetUrl')" v-if="modelForm.format === 'link'">
              <n-input v-model:value="targetUrl" :placeholder="$tm(['common.pleaseInput', 'common.targetUrl'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.content')" path="content"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.content']), trigger: ['blur', 'change', 'input'] }]">
              <TinymceEditor v-model:value="modelForm.content" :height="765" class="w-full" />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>
      <!-- </n-scrollbar> -->
      <!-- </n-layout-content> -->
    </div>
    <!-- <n-layout-sider width="280" bordered class="p-3"> -->
    <div class="w-[390px]">
      <n-card size="small" :segmented="{ content: true }">
        <template #header>
          <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
            @click="onSubmit">
            {{ mode === 'add' ? $t('common.publish') : $t('common.update') }}
          </n-button>
        </template>
        <n-form-item :label="$t('common.format')">
          <n-select v-model:value="modelForm.format" :options="[
            { label: $t('common.standard'), value: 'standard' },
            { label: $t('common.gallery'), value: 'gallery' },
            { label: $t('common.video'), value: 'video' },
            { label: $t('common.audio'), value: 'audio' },
            { label: $t('common.quote'), value: 'quote' },
            { label: $t('common.link'), value: 'link' },
          ]" filterable :placeholder="$tm(['common.pleaseSelect', 'common.format'])">
            <template #empty>{{ $t('common.noData') }}</template>
          </n-select>
        </n-form-item>
        <!-- <n-form ref="formRef" :model="modelForm" label-placement="top"> -->
        <n-form-item :label="$t('common.status')">
          <!-- <n-select v-model:value="modelForm.status" :options="[
            { label: $t('components.options.status.DRAFT'), value: 'DRAFT' },
            { label: $t('components.options.status.PUBLISHED'), value: 'PUBLISHED' }
          ]" /> -->
          <n-select v-model:value="modelForm.status" :options="statusOptions" filterable
            :placeholder="$tm(['common.pleaseSelect', 'common.status'])" value-field="code"
            :render-label="(o: any) => $t(`components.options.${statusKey}.${o.code}`, o.title)">
            <template #empty>{{ $t('common.noData') }}</template>
          </n-select>
        </n-form-item>
        <n-form-item :label="$t('common.displayMode')">
          <n-select v-model:value="modelForm.flag"
            :options="[{ label: $t('common.public'), value: 1 }, { label: $t('common.private'), value: 0 }]" />
        </n-form-item>
        <n-form-item :span="1" :label="$t('components.post.groups')" path="groups">
          <!-- :rule="[{ required: true, message: $tm(['common.pleaseSelect', 'components.post.groups']), trigger: ['blur', 'change', 'input'] }]"> -->
          <n-tree-select :options="(groups as any)" key-field="_id" label-field="title"
            :placeholder="$t('common.default')" multiple checkable virtual-scroll check-strategy="all"
            :default-value="modelForm.groups" :default-expanded-keys="modelForm.groups"
            :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
            @update:value="(v: any, o: any) => { modelForm.groups = v }">
            <template #empty>{{ $t('common.noData') }}</template>
          </n-tree-select>
        </n-form-item>

        <n-form-item :label="$t('components.post.publishDate')">
          <n-date-picker v-model:value="modelForm.publishedAt" type="date" format="dd-MM-yyyy"
            :placeholder="$tm(['common.pleaseInput', 'components.post.date'])" input-readonly />
        </n-form-item>
        <n-form-item :span="1" :label="$t('components.post.expired')" path="expiredAt">
          <n-date-picker v-model:value="modelForm.expiredAt" type="date" format="dd-MM-yyyy" clearable
            :placeholder="$tm(['common.pleaseInput', 'components.post.expired'])" input-readonly />
        </n-form-item>

        <n-form-item :span="1" :label="$t('common.tags')" path="tags">
          <TagsManager v-model="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])"
            :help-message="$t('message.help.tagPost')" />
        </n-form-item>
        <!-- </n-form> -->
      </n-card>

      <n-card :title="$t('common.avatar')" size="small" class="mt-3">
        <template #header-extra>
          <MediaGalleryLinks v-model="modelForm.image" quaternary
            :placeholder="$tm(['common.pleaseInput', 'common.link'])" :title="$t('common.link')"
            :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
            :delete-title="$tm(['common.confirm', 'common.delete'])" :delete-message="$t('message.confirm.deleteOne')"
            :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])" />
        </template>
        <MediaGallery v-model="modelForm.image" size="auto" :delete-title="$tm(['common.confirm', 'common.delete'])"
          :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
          :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
          :rename-text="$tm(['common.input', 'common.renameFile'])"
          :upload-select-text="$t('components.upload.selectorDrag')"
          :upload-new-file="$t('components.upload.newFile')" />
      </n-card>

      <!-- <n-card title="Page Attributes" size="small" class="mt-3">
        <n-form-item label="Parent">
          <n-tree-select v-model:value="model.parentId" :options="pageTree" key-field="_id" label-field="title"
            clearable />
        </n-form-item>

        <n-form-item label="Template">
          <n-select v-model:value="modelForm.template" :options="[
            { label: 'Default Template', value: 'default' },
            { label: 'Full Width', value: 'fullwidth' }
          ]" />
        </n-form-item>
      </n-card> -->
      <!-- <n-card :title="$t('components.post.groups')" size="small" class="mt-3">
        <n-tree-select :options="(groups as any)" key-field="_id" label-field="title"
          :placeholder="$t('common.default')" multiple checkable virtual-scroll check-strategy="all"
          :default-value="modelForm.groups" :default-expanded-keys="modelForm.groups"
          :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
          @update:value="(v: any, o: any) => { modelForm.groups = v }">
          <template #empty>{{ $t('common.noData') }}</template>
        </n-tree-select>
      </n-card> -->

      <n-card :title="$t('common.seoData')" size="small" class="mt-3">
        <SeoManager v-model="modelForm.seo" dense :placeholder-title="$tm(['common.pleaseInput', 'common.seoTitle'])"
          :placeholder-desc="$tm(['common.pleaseInput', 'common.seoDesc'])"
          :placeholder-tags="$tm(['common.pleaseInput', 'common.seoTags'])" />
      </n-card>

      <n-card :title="$t('common.meta')" size="small" class="mt-3">
        <n-form-item :span="1" :label="$t('common.tags')" path="tags">
          <TagsManager v-model="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])"
            :help-message="$t('message.help.tagPost')" />
        </n-form-item>
        <n-form-item :span="1" :label="$t('common.attributes')" path="tags">
          <MetaManager v-model="modelForm.meta" :placeholder-key="$t('common.attributeName')"
            :placeholder-value="$t('common.attributeValue')" />
        </n-form-item>
      </n-card>

      <!-- <n-card :title="$t('common.attach')" size="small" class="mt-3">
      </n-card> -->
      <!-- </n-layout-sider> -->
    </div>
  </n-layout>
</template>

<style scoped>
.n-layout {
  background: var(--n-color-modal);
}
</style>
