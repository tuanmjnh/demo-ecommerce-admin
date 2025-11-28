<script setup lang="ts">
import { useLoadingStore, useCompanyStore } from '@/stores'
import { $t, $tm } from '@/utils'
import { viToSlug } from 'tm-libs/string'
import { httpAxiosLoading } from '@/services'

const companyStore = useCompanyStore()
const loadingStore = useLoadingStore()

// form refs
const formRef = ref()
const modelForm = reactive({ ...companyStore.getDefault })

// helpers
const onLoad = async () => {
  try {
    await companyStore.load(true)
    Object.assign(modelForm, companyStore.item)
  } catch (e) {
    console.error(e)
  }
}

// upload logo helper (simple) - adjust to your upload API
async function uploadFile(file: File): Promise<string | null> {
  try {
    const fd = new FormData()
    fd.append('file', file)
    // adjust endpoint to your upload handler
    const res = await httpAxiosLoading.post('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // assume res.data.url or res.data.data.url
    const url = res?.data?.url || res?.data?.data?.url
    return url || null
  } catch (e) {
    // console.error(e)
    window.$message?.error($t('message.error.error'))
    return null
  }
}

async function onSave() {
  formRef.value?.validate(async (err: any) => {
    if (err) return
    try {
      const payload = { ...modelForm }
      const rs = await companyStore.update(payload)
      if (rs) {
        window.$message?.success($t ? $t('message.success.updated') : 'Saved')
      } else {
        window.$message?.error($t ? $t('message.error.error') : 'Save failed')
      }
    } catch (e) {
      // console.error(e)
      window.$message?.error($t('message.error.error'))
    }
  })
}

function onReset() {
  Object.assign(modelForm, companyStore.getDefault)
  formRef.value?.restoreValidation?.()
}

onMounted(onLoad)
</script>

<template>
  <n-layout>
    <n-layout-content class="p-4">
      <n-card size="large" :title="$t('components.company.title')">
        <template #header-extra>
          <n-space justify="end">
            <!-- <n-button class="px-6" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
              @click="onReset">
              {{ $t('common.reset') }}
            </n-button> -->
            <n-button type="primary" class="px-10" text-color="#fff" attr-type="button" block
              :loading="loadingStore.isLoading" @click="onSave">
              {{ $t('common.update') }}
            </n-button>
          </n-space>
        </template>
        <n-form ref="formRef" :model="modelForm" label-placement="top">
          <n-tabs type="line" animated>
            <n-tab-pane name="info" :tab="$t('tabs.info')">
              <n-scrollbar style="max-height: calc(100vh - 380px)" trigger="none" class="pr-5">
                <div class="grid grid-cols-2 gap-4 mb-3">
                  <div class="flex gap-2">
                    <MediaGallery v-model="modelForm.logo" size="auto" class="w-full flex items-center justify-center"
                      :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
                      :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
                      :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
                      :upload-select-text="$t('components.upload.selectorDrag')"
                      :upload-new-file="$t('components.upload.newLogo')" />
                    <MediaGalleryLinks v-model="modelForm.logo" class="mb-2" quaternary size="250x160" maxHeight="340px"
                      :placeholder="$tm(['common.pleaseInput', 'common.link'])" :title="$t('common.link')"
                      :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
                      :delete-title="$tm(['common.confirm', 'common.delete'])"
                      :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
                      :rename-text="$tm(['common.input', 'common.renameFile'])" />
                  </div>
                  <div>
                    <n-form-item :label="$t('components.company.name')" path="name"
                      :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.company.name']), trigger: ['blur', 'change', 'input'] }]">
                      <n-input v-model:value="modelForm.name"
                        :placeholder="$tm(['common.pleaseInput', 'components.company.name'])" />
                    </n-form-item>
                    <n-form-item :label="$t('components.company.shortName')">
                      <n-input v-model:value="modelForm.shortName" placeholder="Tên rút gọn" />
                    </n-form-item>
                  </div>
                </div>

                <n-grid :cols="2" :x-gap="20" :y-gap="8">
                  <n-form-item-gi :label="$t('common.phoneNumber')">
                    <n-input v-model:value="modelForm.phone" placeholder="Điện thoại chính" />
                  </n-form-item-gi>

                  <n-form-item-gi :label="$t('common.Hotline', 'Hotline')">
                    <n-input v-model:value="modelForm.hotline" placeholder="Hotline" />
                  </n-form-item-gi>

                  <n-form-item-gi label="Email">
                    <n-input v-model:value="modelForm.email" placeholder="info@example.com" />
                  </n-form-item-gi>

                  <n-form-item-gi :label="$t('components.company.taxCode')">
                    <n-input v-model:value="modelForm.taxCode" placeholder="Mã số thuế" />
                  </n-form-item-gi>

                  <n-form-item-gi :label="$t('components.company.openingHours')">
                    <n-input v-model:value="modelForm.openingHours" placeholder="VD: Mon-Fri 8:00 - 17:00" />
                  </n-form-item-gi>

                  <n-form-item-gi :span="2" :label="$t('common.address')">
                    <n-input v-model:value="modelForm.address" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
                  </n-form-item-gi>

                  <n-form-item-gi :label="$t('common.socialNetwork')">
                    <div class="grid grid-cols-1 gap-4 w-full">
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-input v-model:value="modelForm.social.zalo"
                            :placeholder="$tm(['common.pleaseInput', 'Zalo'])" />
                        </template>
                        Zalo
                      </n-tooltip>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-input v-model:value="modelForm.social.facebook"
                            :placeholder="$tm(['common.pleaseInput', 'Facebook'])" />
                        </template>
                        Facebook
                      </n-tooltip>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-input v-model:value="modelForm.social.instagram"
                            :placeholder="$tm(['common.pleaseInput', 'Instagram'])" />
                        </template>
                        Instagram
                      </n-tooltip>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-input v-model:value="modelForm.social.youtube"
                            :placeholder="$tm(['common.pleaseInput', 'Youtube'])" />
                        </template>
                        Youtube
                      </n-tooltip>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-input v-model:value="modelForm.social.linkedin"
                            :placeholder="$tm(['common.pleaseInput', 'Linkedin'])" />
                        </template>
                        Linkedin
                      </n-tooltip>
                    </div>
                  </n-form-item-gi>
                  <!-- <n-form-item-gi label="Instagram">
                <n-input v-model:value="modelForm.social.instagram" />
              </n-form-item-gi>
              <n-form-item-gi label="YouTube">
                <n-input v-model:value="modelForm.social.youtube" />
              </n-form-item-gi>
              <n-form-item-gi label="LinkedIn">
                <n-input v-model:value="modelForm.social.linkedin" />
              </n-form-item-gi> -->
                  <n-form-item-gi :span="1" :label="$t('common.seoData')">
                    <SeoManager v-model="modelForm.seo" dense
                      :placeholder-title="$tm(['common.pleaseInput', 'common.seoTitle'])"
                      :placeholder-desc="$tm(['common.pleaseInput', 'common.seoDesc'])"
                      :placeholder-tags="$tm(['common.pleaseInput', 'common.seoTags'])" />
                  </n-form-item-gi>
                  <!-- <n-form-item-gi label="SEO Title">
                <n-input v-model:value="modelForm.seo.title" />
              </n-form-item-gi>

              <n-form-item-gi label="SEO Description">
                <n-input v-model:value="modelForm.seo.desc" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
              </n-form-item-gi>

              <n-form-item-gi label="SEO Keywords (comma separated)">
                <n-input :value="modelForm.seo.tags?.join(',')"
                  @update:value="(v) => modelForm.seo.tags = v.split(',').map(s => s.trim()).filter(Boolean)" />
              </n-form-item-gi> -->
                  <n-form-item-gi :span="2" :label="$t('common.map')">
                    <n-input v-model:value="modelForm.mapEmbed" type="textarea"
                      :autosize="{ minRows: 3, maxRows: 6 }" />
                  </n-form-item-gi>
                </n-grid>
              </n-scrollbar>
            </n-tab-pane>
            <n-tab-pane name="banner" :tab="$t('Banner')">
              <n-scrollbar style="max-height: calc(100vh - 380px)" trigger="none" class="pr-5">
                <n-form-item :span="2" :label="$t('common.banner', 'Banner')">
                  <MediaGalleryLinks v-model="modelForm.banner" class="mb-2" quaternary size="250x160" maxHeight="340px"
                    :placeholder="$tm(['common.pleaseInput', 'common.link'])" :title="$t('common.link')"
                    :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
                    :delete-title="$tm(['common.confirm', 'common.delete'])"
                    :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
                    :rename-text="$tm(['common.input', 'common.renameFile'])" />
                  <div class="w-full flex items-center justify-center">
                    <MediaGallery v-model="modelForm.banner" size="800x300"
                      :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
                      :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
                      :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
                      :upload-select-text="$t('components.upload.selectorDrag')"
                      :upload-new-file="$t('components.upload.newFile')" />
                  </div>
                </n-form-item>
              </n-scrollbar>
            </n-tab-pane>
            <n-tab-pane name="slider" :tab="$t('Slider')">
              <MediaGalleryLinks v-model="modelForm.images" class="mb-2" quaternary size="250x160" maxHeight="340px"
                :placeholder="$tm(['common.pleaseInput', 'common.link'])" :title="$t('common.link')"
                :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
                :delete-title="$tm(['common.confirm', 'common.delete'])"
                :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
                :rename-text="$tm(['common.input', 'common.renameFile'])" />
              <n-scrollbar style="max-height: calc(100vh - 380px)" trigger="none" class="pr-5">
                <MediaGallery v-model="modelForm.images" multiple size="469x300"
                  :delete-title="$tm(['common.confirm', 'common.delete'])" :confirm-text="$t('common.confirm')"
                  :cancel-text="$t('common.cancel')" :delete-message="$t('message.confirm.deleteOne')"
                  :rename-title="$t('common.renameFile')" :rename-text="$tm(['common.input', 'common.renameFile'])"
                  :upload-select-text="$t('components.upload.selectorDrag')"
                  :upload-new-file="$t('components.upload.newFile')" />
              </n-scrollbar>
            </n-tab-pane>
          </n-tabs>
        </n-form>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.text-muted {
  color: var(--n-color-text-3);
}
</style>