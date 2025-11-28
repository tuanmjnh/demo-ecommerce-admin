<script setup lang="ts">
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

const { userInfo } = authStore
const formRef = ref()
const formValue = ref({
  user: {
    name: '',
    age: '',
  },
  phone: '',
})
const rules = {
  user: {
    name: {
      required: true,
      message: 'Please enter your name',
      trigger: 'blur',
    },
    age: {
      required: true,
      message: 'Please enter your age',
      trigger: ['input', 'blur'],
    },
  },
  phone: {
    required: true,
    message: 'Please enter your phone number',
    trigger: ['input'],
  },
}

function handleValidateClick() {
  formRef.value?.validate((errors: any) => {
    if (!errors)
      window.$message.success('Verification passed')
    else window.$message.error('Verification failed')
  })
}
</script>

<template>
  <n-space vertical>
    <n-card title="Personal information">
      <n-space size="large">
        <n-avatar round :size="128" :src="userInfo?.avatar" />

        <n-descriptions label-placement="left" :column="2"
          :title="`Good evening, ${userInfo?.nickname}, here is a simple personal center template`">
          <n-descriptions-item label="id">
            {{ userInfo?.id }}
          </n-descriptions-item>
          <n-descriptions-item label="Username">
            {{ userInfo?.userName }}
          </n-descriptions-item>
          <n-descriptions-item label="Real name">
            {{ userInfo?.nickname }}
          </n-descriptions-item>
          <n-descriptions-item label="Role">
            {{ userInfo?.role }}
          </n-descriptions-item>
        </n-descriptions>
      </n-space>
    </n-card>
    <n-card title="Information modification">
      <n-space justify="center">
        <n-form ref="formRef" class="w-500px" :label-width="80" :model="formValue" :rules="rules">
          <n-form-item label="Name" path="user.name">
            <n-input v-model:value="formValue.user.name" placeholder="Enter your name" />
          </n-form-item>
          <n-form-item label="Age" path="user.age">
            <n-input v-model:value="formValue.user.age" placeholder="Enter age" />
          </n-form-item>
          <n-form-item label="Telephone number" path="phone">
            <n-input v-model:value="formValue.phone" placeholder="Telephone number" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" attr-type="button" block @click="handleValidateClick">
              Verify
            </n-button>
          </n-form-item>
        </n-form>
      </n-space>
    </n-card>
  </n-space>
</template>

<style scoped></style>
