<script setup lang="ts">
import { $t, $tm } from '@/utils'
import { useLoadingStore, useAuthStore, useUserStore } from '@/stores'
const loadingStore = useLoadingStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const { user } = authStore
const modelFormRef = ref()
const modelForm = ref({ ...user })

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        userStore.updateProfile(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
          if (x.status) window.$message.success($t('message.success.updated'))
          else window.$message.error($t(`message.error.${x.statusMessage}`))
          authStore.updateProfile(x.data)
        })
      } catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
// const onChangeAvatar = (file) => {
//   console.log(file)
//   console.log(modelForm.value)
// }
</script>

<template>
  <n-space vertical>
    <n-card :title="$t('components.users.information')">
      <!-- <n-space size="large"> -->
      <div class="grid grid-cols-3 gap-4">
        <!-- <n-avatar round :size="128" :src="user?.avatar.url" /> -->
        <MediaGallery v-model="modelForm.avatar" size="auto" :delete-title="$tm(['common.confirm', 'common.delete'])"
          :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
          :delete-message="$t('message.confirm.deleteOne')" :rename-title="$t('common.renameFile')"
          :rename-text="$tm(['common.input', 'common.renameFile'])"
          :upload-select-text="$t('components.upload.selectorDrag')"
          :upload-new-file="$t('components.upload.newFile')" />
        <div class="col-span-2">
          <div class="text-lg mb-2">
            {{ $t('components.users.hello') }} <span class="font-bold color-blue">{{ user?.fullName }}</span>
          </div>
          <!-- <n-descriptions label-placement="left" :column="2" class="col-span-2">
            <n-descriptions-item label="ID">
              <span class="font-bold">{{ user?._id }}</span>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('components.users.username')">
              <span class="font-bold">{{ user?.username }}</span>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('components.users.fullName')">
              <span class="font-bold">{{ user?.fullName }}</span>
            </n-descriptions-item>
            <n-descriptions-item :label="$t('components.users.roles')">
              <span class="font-bold">{{ user?.roles }}</span>
            </n-descriptions-item>
          </n-descriptions> -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-1">
              <span class="mr-1">ID:</span>
              <span class="font-bold">{{ user?._id }}</span>
            </div>
            <div class="col-span-1">
              <span class="mr-1">{{ $t('components.users.username') }}:</span>
              <span class="font-bold">{{ user?.username }}</span>
            </div>
            <div class="col-span-1">
              <span class="mr-1">{{ $t('components.users.fullName') }}:</span>
              <span class="font-bold">{{ user?.fullName }}</span>
            </div>
            <div class="col-span-1">
              <span class="mr-1">{{ $t('components.users.roles') }}:</span>
              <span class="font-bold">{{ user?.roles }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- </n-space> -->
    </n-card>
    <n-card :title="$t('components.users.modify')">
      <template #header-extra>
        <n-space>
          <n-button type="primary" text-color="#fff" attr-type="button" :loading="loadingStore.isLoading" block
            @click="onSubmit">
            {{ $t('common.update') }}
          </n-button>
        </n-space>
      </template>
      <n-data-table v-if="loadingStore.isLoading" :loading="loadingStore.isLoading"
        class="h-700px absolute w-full h-full" />
      <n-space justify="center">
        <n-form ref="modelFormRef" :model="modelForm" label-placement="left" :label-width="150">
          <n-grid :cols="2" :x-gap="12">
            <n-form-item-gi :span="1" :label="$t('components.users.fullName')" path="fullName"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.users.fullName']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelForm.fullName" v-text-format:words
                :placeholder="$tm(['common.pleaseInput', 'components.users.fullName'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :label="$t('components.users.email')" path="email"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.users.email']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelForm.email"
                :placeholder="$tm(['common.pleaseInput', 'components.users.email'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :label="$t('components.users.dateBirth')" path="dateBirth">
              <n-date-picker v-model:value="modelForm.dateBirth" type="date" format="dd-MM-yyyy" input-readonly
                :placeholder="$tm(['common.pleaseSelect', 'components.users.dateBirth'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :label="$t('components.users.phone')" path="phone">
              <n-input v-model:value="modelForm.phone"
                :placeholder="$tm(['common.pleaseInput', 'components.users.phone'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :label="$t('components.users.personNumber')" path="personNumber">
              <n-input v-model:value="modelForm.personNumber"
                :placeholder="$tm(['common.pleaseInput', 'components.users.personNumber'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :label="$t('components.users.address')" path="address">
              <n-input v-model:value="modelForm.address" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'components.users.address'])" />
            </n-form-item-gi>
            <n-form-item-gi :span="2" :label="$t('common.about')" path="about">
              <n-input v-model:value="modelForm.about" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'common.about'])" type="textarea"
                :autosize="{ minRows: 3, maxRows: 5 }" />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-space>
    </n-card>
  </n-space>
</template>

<style scoped></style>
