<script setup lang="ts">
import { ref } from 'vue'
import { useCloudinaryStore } from '@/stores'
const API_PATH = '/cloudinary'
const props = defineProps<{
  currentFolder: Cloudinary.IFolder
  isLoading?: boolean
}>()
const emit = defineEmits(['uploaded', 'update:isLoading'])

const cloudinaryStore = useCloudinaryStore()
const loading = ref(false)

async function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return

  loading.value = true
  emit('update:isLoading', loading.value)
  try {
    // Lặp upload từng file
    for (const file of Array.from(files)) {
      // Lấy signature để upload
      //const res = await httpAxios.get(`${API_PATH}/signature`, {
      //   folder: props.currentFolder?.path && props.currentFolder.path.toLowerCase() !== 'root' ? props.currentFolder.path : null
      // })
      const res = await cloudinaryStore.getSignature({
        folder: props.currentFolder?.path && props.currentFolder.path.toLowerCase() !== 'root' ? props.currentFolder.path : null
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', res.apiKey)
      formData.append('timestamp', String(res.timestamp))
      formData.append('signature', res.signature)
      formData.append('upload_preset', res.preset)
      // Nếu có folder hiện tại, thêm vào upload
      if (props.currentFolder?.path && props.currentFolder.path.toLowerCase() !== 'root') {
        formData.append('folder', props.currentFolder.path)
      }

      await fetch(`https://api.cloudinary.com/v1_1/${res.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      })
    }

    emit('uploaded')
  } catch (err) {
    console.error('Upload failed:', err)
    alert('❌ Upload thất bại. Vui lòng thử lại!')
  } finally {
    loading.value = false
    emit('update:isLoading', loading.value)
      // reset input để có thể upload lại cùng file
      ; (e.target as HTMLInputElement).value = ''
  }
}
</script>

<template>
  <label
    class="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
    :class="{ 'animate-pulse bg-blue-500': loading }">
    <span v-if="loading" class="flex items-center gap-1">
      <svg class="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Đang tải...
    </span>
    <span v-else>📤 Upload</span>
    <input type="file" class="hidden" @change="onFileChange" multiple :disabled="loading" />
  </label>
</template>
