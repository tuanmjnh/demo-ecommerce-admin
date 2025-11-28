<script setup lang="ts">
import { useLoadingStore, useOptionsStore, usePostStore } from '@/stores'
import { viToSlug } from 'tm-libs/string'
import { NewGuid } from 'tm-libs/crypto'
import { $t, $tm } from '@/utils'

const route = useRoute()
const loadingStore = useLoadingStore()
const optionsStore = useOptionsStore()
const pageStore = usePostStore()
const mode = ref<'add' | 'edit'>('add')
const formRef = ref()
const modelForm = ref<Models.IPost>(JSON.parse(JSON.stringify(pageStore.item)))
const groupType = route.meta.group || 'page'
const statusKey = 'status'
const statusOptions = computed(() => optionsStore.getFilterByKey({ key: statusKey, flag: 1 }))
/** Create slug when entering title */
const updateSlug = () => {
  modelForm.value.slug = viToSlug(modelForm.value.title)
}

const onSubmit = () => {
  formRef.value.validate((err: any) => {
    if (err) return
    modelForm.value.key = groupType
    if (!modelForm.value.slug)
      modelForm.value.slug = viToSlug(modelForm.value.title)
    if (!modelForm.value.code) modelForm.value.code = NewGuid()

    const payload = JSON.parse(JSON.stringify(modelForm.value))

    if (mode.value === 'add') {
      pageStore.create(payload).then(res => {
        if (res.status) {
          window.$message.success($t('message.success.createdNew'))
          onReset()
        } else window.$message.error($t(`message.error.${res.statusMessage}`))
      })
    } else {
      pageStore.update(payload).then(res => {
        if (res.status) {
          window.$message.success($t('message.success.updated'))
        } else window.$message.error($t(`message.error.${res.statusMessage}`))
      })
    }
  })
}
const onReset = () => {
  formRef.value?.restoreValidation()
  pageStore.setItem().then(() => { modelForm.value = JSON.parse(JSON.stringify(pageStore.item)) })
}
watch(() => route.params.id, (n) => {
  if (n) {
    mode.value = 'edit'
    pageStore.findById(String(n)).then(res => { if (res.status) modelForm.value = res.data })
  } else {
    mode.value = 'add'
    if (pageStore.item._id) onReset()
    // if (pageStore.item._id) pageStore.copyItem().then(() => { modelForm.value = pageStore.item })
    // else modelForm.value = pageStore.item
  }
}, { deep: true, immediate: true })
</script>

<template>
  <n-layout has-sider>
    <!-- <n-layout-content class="p-4"> -->
    <div class="w-full mr-3">
      <n-scrollbar style="max-height: calc(100vh - 185px)">
        <n-card>
          <n-form ref="formRef" :model="modelForm" label-placement="top">
            <n-grid :cols="2" :x-gap="18">
              <n-form-item-gi :span="1" :label="$t('common.title')" path="title"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
                <n-input v-model:value="modelForm.title" @input="updateSlug" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
              </n-form-item-gi>

              <n-form-item-gi :span="1" :label="$t('common.permalink')">
                <n-input v-model:value="modelForm.slug" :placeholder="$tm(['common.autoGenerate', 'common.slug'])" />
              </n-form-item-gi>

              <n-form-item-gi :span="2" :label="$t('common.excerpt')">
                <n-input v-model:value="modelForm.desc" type="textarea" :autosize="{ minRows: 3 }" v-text-format:first
                  :placeholder="$tm(['common.pleaseInput', 'common.excerpt'])" />
              </n-form-item-gi>

              <n-form-item-gi :span="2" :label="$t('common.content')" path="content"
                :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.content']), trigger: ['blur', 'change', 'input'] }]">
                <TinymceEditor v-model:value="modelForm.content" :height="500" class="w-full" />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </n-card>
      </n-scrollbar>
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

        <n-form-item :label="$t('components.post.publishDate')">
          <n-date-picker type="datetime" v-model:value="modelForm.publishedAt" />
        </n-form-item>
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
      <!-- </n-layout-sider> -->
    </div>
  </n-layout>
</template>

<style scoped>
.n-layout {
  background: var(--n-color-modal);
}
</style>
