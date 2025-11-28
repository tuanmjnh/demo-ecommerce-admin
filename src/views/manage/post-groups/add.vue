<script setup lang="ts">
import { useAppStore, useLoadingStore, useGroupStore } from '@/stores'
import { viToSlug } from 'tm-libs/string'
import { NewGuid } from 'tm-libs/crypto'
import { $t, $tm, renderLabelSelect } from '@/utils'

const route = useRoute()

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const groupStore = useGroupStore()
const mode = ref<'add' | 'edit'>('add')
const formRef = ref()
const modelForm = ref<Models.IGroup>(JSON.parse(JSON.stringify(groupStore.item)))
const groupType = route.meta.group || 'post'
const groups = computed(() => groupStore.getTreeGroupsSelect(modelForm.value._id))
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
      groupStore.create(payload).then(res => {
        if (res.status) {
          window.$message.success($t('message.success.createdNew'))
          onReset()
        } else window.$message.error($t(`message.error.${res.statusMessage}`))
      })
    } else {
      groupStore.update(payload).then(res => {
        if (res.status) {
          window.$message.success($t('message.success.updated'))
        } else window.$message.error($t(`message.error.${res.statusMessage}`))
      })
    }
  })
}
const onReset = () => {
  formRef.value?.restoreValidation()
  groupStore.setItem().then(() => { modelForm.value = JSON.parse(JSON.stringify(groupStore.item)) })
}
watch(() => route.params.id, (n) => {
  if (n) {
    mode.value = 'edit'
    groupStore.findById(String(n)).then(res => { if (res.status) modelForm.value = res.data })
    console.log()
    // if (!modelForm.value.seo) modelForm.value.seo = { title: '', desc: '', tags: null }
  } else {
    mode.value = 'add'
    if (groupStore.item._id) onReset()
  }
}, { deep: true, immediate: true })
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

            <n-form-item-gi :span="2" :label="$t('common.excerpt')" path="desc">
              <n-input v-model:value="modelForm.desc" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"
                v-text-format:first :placeholder="$tm(['common.pleaseInput', 'common.excerpt'])" />
            </n-form-item-gi>

            <n-form-item-gi :span="2" :label="$t('common.content')" path="content"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.content']), trigger: ['blur', 'change', 'input'] }]">
              <TinymceEditor v-model:value="modelForm.content" :height="645" class="w-full" />
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
        <!-- <n-form ref="formRef" :model="modelForm" label-placement="top"> -->
        <n-form-item :label="$t('common.displayMode')">
          <n-select v-model:value="modelForm.flag"
            :options="[{ label: $t('common.public'), value: 1 }, { label: $t('common.private'), value: 0 }]" />
        </n-form-item>
        <n-form-item :span="2" :label="$t('components.groups.dependent')" path="parent">
          <!-- <n-input-group> -->
          <n-tree-select :options="(groups as any)" key-field="_id" label-field="title"
            :default-value="modelForm.parent" :placeholder="$t('common.default')"
            :default-expanded-keys="[modelForm.parent]"
            :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
            @update:value="(v: any, o: any) => { modelForm.parent = v }">
            <template #empty>{{ $t('common.noData') }}</template>
          </n-tree-select>
          <help-info class="ml-2" :message="$t('components.groups.dependentHelp')" />
          <!-- </n-input-group> -->
        </n-form-item>
        <n-form-item :span="1" :label="$t('common.sort')" path="sort">
          <!-- :rule="[{ type: 'number', required: true, message: $tm(['common.pleaseInput', 'common.sort']), trigger:
          ['blur', 'change', 'input'] }]" -->
          <n-input-number v-model:value="modelForm.sort" :placeholder="$tm(['common.pleaseInput', 'common.sort'])" />
        </n-form-item>
        <!-- </n-form> -->
      </n-card>

      <n-card :title="$t('common.avatar')" size="small" class="mt-3">
        <MediaGallery v-model="modelForm.image" size="auto" :delete-title="$tm(['common.confirm', 'common.delete'])"
          :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
          :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
          :rename-text="$tm(['common.input', 'common.renameFile'])"
          :upload-select-text="$t('components.upload.selectorDrag')"
          :upload-new-file="$t('components.upload.newFile')" />
      </n-card>

      <n-card :title="$t('common.seoData')" size="small" class="mt-3">
        <SeoManager v-model="modelForm.seo" dense :placeholder-title="$tm(['common.pleaseInput', 'common.seoTitle'])"
          :placeholder-desc="$tm(['common.pleaseInput', 'common.seoDesc'])"
          :placeholder-tags="$tm(['common.pleaseInput', 'common.seoTags'])" />
      </n-card>

      <n-card :title="$t('common.tags')" size="small" class="mt-3">
        <TagsManager v-model="modelForm.tags" :placeholder="$tm(['common.pleaseInput', 'common.tags'])"
          :help-message="$t('message.help.tagPost')" />
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
