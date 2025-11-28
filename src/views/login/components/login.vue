<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { useLoadingStore, useAuthStore } from '@/stores'
import { $t } from '@/utils'
import { loadBaseData } from '@/utils/loadBaseData'

const emit = defineEmits([
  'update:modelValue',
  'onLogin',
])

const loadingStore = useLoadingStore()
const authStore = useAuthStore()

function toOtherForm(type: any) {
  emit('update:modelValue', type)

}

const formModel = ref<Models.ILogin>(authStore.modelAuth)
const formRef = ref<FormInst | null>(null)

function handleGlobalKeyDown(event) {
  if (event.key === 'Enter') {
    onSubmit()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})

const onSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    // if (isRemember.value)
    //   local.set('loginAccount', { formModel.value, pwd })
    // else local.remove('loginAccount')
    const result = await authStore.login(JSON.parse(JSON.stringify(formModel.value)))
    if (result.status) {
      loadBaseData()
      window.$message.success($t('message.success.login'))
    } else {
      if (result.statusMessage) window.$message.error($t(`message.error.${result.statusMessage}`))
      else window.$message.error($t(`message.error.serverError`))
    }
    emit('onLogin', result.status)
    // console.log('login result', result)
  })
}
</script>

<template>
  <div>
    <n-h2 depth="3" class="text-center">
      {{ $t('login.signInTitle') }}
    </n-h2>
    <n-form ref="formRef" :model="formModel" :show-label="false" size="large">
      <n-form-item path="username"
        :rule="[{ required: true, message: $t('login.accountRuleTip'), trigger: ['blur', 'change', 'input'] }]">
        <n-input v-model:value="formModel.username" clearable :placeholder="$t('login.accountPlaceholder')"
          :disabled="loadingStore.isLoading" />
      </n-form-item>
      <n-form-item path="password"
        :rule="[{ required: true, message: $t('login.passwordRuleTip'), trigger: ['blur', 'change', 'input'] }]">
        <n-input v-model:value="formModel.password" type="password" :placeholder="$t('login.passwordPlaceholder')"
          clearable show-password-on="click" :disabled="loadingStore.isLoading">
          <template #password-invisible-icon>
            <icon-park-outline-preview-close-one />
          </template>
          <template #password-visible-icon>
            <icon-park-outline-preview-open />
          </template>
        </n-input>
      </n-form-item>
      <n-space vertical :size="20">
        <div class="flex-y-center justify-between">
          <n-checkbox v-model:checked="formModel.remember" :disabled="loadingStore.isLoading">
            {{ $t('login.rememberMe') }}
          </n-checkbox>
          <n-button type="primary" text @click="toOtherForm('resetPwd')" :disabled="loadingStore.isLoading">
            {{ $t('login.forgotPassword') }}
          </n-button>
        </div>
        <n-button block type="primary" text-color="#fff" size="large" :loading="loadingStore.isLoading"
          :disabled="loadingStore.isLoading" @click="onSubmit">
          {{ $t('login.signIn') }}
        </n-button>
        <n-flex>
          <n-text>{{ $t('login.noAccountText') }}</n-text>
          <n-button type="primary" text @click="toOtherForm('register')" :disabled="loadingStore.isLoading">
            {{ $t('login.signUp') }}
          </n-button>
        </n-flex>
      </n-space>
    </n-form>
    <n-divider>
      <span op-80>{{ $t('login.or') }}</span>
    </n-divider>
    <n-space justify="center">
      <n-button circle>
        <template #icon>
          <n-icon><icon-park-outline-wechat /></n-icon>
        </template>
      </n-button>
      <n-button circle>
        <template #icon>
          <n-icon><icon-park-outline-tencent-qq /></n-icon>
        </template>
      </n-button>
      <n-button circle>
        <template #icon>
          <n-icon><icon-park-outline-github-one /></n-icon>
        </template>
      </n-button>
    </n-space>
  </div>
</template>

<style scoped></style>
