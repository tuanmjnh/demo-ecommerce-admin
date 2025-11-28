<script setup lang="ts">
import { useAppStore, useLoadingStore, usePostStore } from '@/stores'
import { viToSlug } from 'tm-libs/string'
import { NewGuid } from 'tm-libs/crypto'
import { $t, $tm } from '@/utils'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const postStore = usePostStore()
const query = ref({
  text: '',
  key: 'banner-slider',
  groups: [],
  sortBy: 'created.at',
  sortType: -1, //1 ASC, -1 DESC
  flag: 1,
  page: 1,
  total: 0,
  pages: 0,
  limit: appStore.pageSizes[0],
  pageSizes: appStore.pageSizes.map(x => { return { label: String(x), value: x } })
})
const modelForm = ref<Models.IPost>(JSON.parse(JSON.stringify(postStore.getDefaultModel)))
const onFetch = async () => {
  try {
    postStore.findByKey(query.value.key).then(x => {
      if (x.status && x.data) modelForm.value = x.data as any
    }).catch(e => {
      // window.$message.error($t(`message.error.${e}`))
      // console.log(e)
    })
  } catch (e) {
    window.$message.error($t(`message.error.${e.statusMessage}`))
  }
}
onMounted(() => {
  onFetch()
})

const onSubmit = () => {
  try {
    modelForm.value.key = query.value.key
    modelForm.value.code = NewGuid()
    modelForm.value.title = 'Banner - Slider'
    modelForm.value.slug = viToSlug(modelForm.value.title)
    if (modelForm.value._id) {
      postStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
        if (x.status) {
          window.$message.success($t('message.success.updated'))
        }
        else window.$message.error($t(`message.error.${x.statusMessage}`))
      })
    } else {
      postStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
        if (x.status) {
          window.$message.success($t('message.success.createdNew'))
        }
        else window.$message.error($t(`message.error.${x.statusMessage}`))
      })
    }
  } catch (e) {
    window.$message.error($t(`message.error.noExistFile`))
  }
}
</script>

<template>
  <n-space vertical>
    <n-card :title="$t('components.post.title')">
      <template #header-extra>
        <n-space>
          <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading" icon
            @click="onSubmit">
            <template #icon>
              <nova-icon icon="icon-park-outline:update-rotation" />
            </template>
            {{ $t('common.update') }}
          </n-button>
        </n-space>
      </template>
      <n-form ref="modelFormRef" :model="modelForm" :label-width="150">
        <n-form-item :span="16" :label="$t('common.banner', 'Banner')" path="image"
          :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
          <n-scrollbar style="max-height: calc(100vh - 190px)" trigger="none" class="pr-3">
            <div class="w-full flex items-center justify-center">
              <MediaGallery v-model="modelForm.image" size="800x300"
                :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
                :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
                :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
                :upload-select-text="$t('components.upload.selectorDrag')"
                :upload-new-file="$t('components.upload.newFile')" />
            </div>
          </n-scrollbar>
        </n-form-item>
        <n-form-item :span="16" :label="$t('common.slider', 'Slider')" path="images"
          :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
          <n-scrollbar style="max-height: calc(100vh - 190px)" trigger="none" class="pr-3">
            <MediaGallery v-model="modelForm.images" multiple size="auto"
              :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
              :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
              :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
              :upload-select-text="$t('components.upload.selectorDrag')"
              :upload-new-file="$t('components.upload.newFile')" />
          </n-scrollbar>
        </n-form-item>
      </n-form>
    </n-card>
    <!-- <modal-action ref="modalActionRef" :data="item" :data-default="postStore.getDefaultModel" :title="$t('route.post')"
      :groups="groups" @on-close="() => item = null" /> -->
  </n-space>
</template>

<style scoped></style>
