<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FilePreview from '../FilePreview.vue'
import ManagerContent from './ManagerContent.vue'
import ConfirmModal from '../ConfirmModal.vue'
import LoadingSpinner from '../LoadingSpinner.vue'
import { useCloudinaryStore } from '@/stores'
const cloudinaryStore = useCloudinaryStore()
const props = withDefaults(defineProps<{
  mode?: 'modal' | 'normal' | 'select'
  multiple?: boolean
  deleteTitle?: string
  deleteMessage?: string
  confirmText?: string
  cancelText?: string
  renameTitle?: string
  renameText?: string
}>(), {
  deleteTitle: 'Confirm action',
  deleteMessage: 'Are you sure you want to perform this action?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  renameTitle: 'Rename file',
  renameText: 'Input new filename',
})

const emit = defineEmits(['close', 'select-file', 'selected-files'])

const isLoading = ref(true)
const isConfirmDelete = ref(false)
const isConfirmRename = ref(false)
const isFilePreview = ref(false)
const files = ref<Cloudinary.IResource[]>([])
const folders = ref<Cloudinary.IFolder[]>([])
const currentFolder = ref<Cloudinary.IFolder>({ name: 'root', path: 'root', external_id: null })
const selectedFile = ref<any | null>(null)
const search = ref('')
const renameInput = ref('')

// Breadcrumb logic
const breadcrumbParts = computed(() => currentFolder.value.path.split('/').filter(Boolean))

function navigateTo(index: number) {
  const path = breadcrumbParts.value.slice(0, index + 1).join('/') || 'root'
  currentFolder.value.path = path
  fetchFiles()
}

async function fetchFolders() {
  try {
    const res = await cloudinaryStore.getFolders()
    folders.value = res.folders
  } catch (error) {
    isLoading.value = false
  } finally {
    isLoading.value = false
  }
}

async function fetchFiles() {
  try {
    isLoading.value = true
    const res = await cloudinaryStore.getFiles({ folder: currentFolder.value.path })
    if (res) {
      files.value = res.resources
    }
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
  } finally {
    isLoading.value = false
  }
}

async function onCreateFolder(name: string) {
  const res = await cloudinaryStore.createFolder(currentFolder.value.path)
  await fetchFolders()
}

async function onOpenConfirmRename(file: Cloudinary.IResource) {
  selectedFile.value = file
  isConfirmRename.value = true
  renameInput.value = file.public_id
}

async function onConfirmRename() {
  if (!renameInput.value || renameInput.value === selectedFile.value.public_id) {
    isConfirmRename.value = false
    return null
  } else {
    isConfirmRename.value = false
    const res = await cloudinaryStore.renameFile({ from: selectedFile.value.public_id, to: renameInput.value })
    await fetchFiles()
  }
}

async function deleteFile(file: Cloudinary.IResource) {
  const res = await cloudinaryStore.deleteFile(encodeURIComponent(file.public_id))
  await fetchFiles()
}

async function onOpenConfirmDelete(file: Cloudinary.IResource) {
  selectedFile.value = file
  isConfirmDelete.value = true
}

async function confirmDelete() {
  await deleteFile(selectedFile.value)
  selectedFile.value = null
  isConfirmDelete.value = false
}

function onSelectFolder(folder: Cloudinary.IFolder) {
  currentFolder.value = folder
  fetchFiles()
}

function onOpenPreview(file: Cloudinary.IResource) {
  if (props.mode === 'select') emit('select-file', file)
  else selectedFile.value = file
  isFilePreview.value = true
}

const filteredFiles = computed(() => {
  if (!search.value.trim()) return files.value
  return files.value.filter((f) =>
    f.public_id.toLowerCase().includes(search.value.toLowerCase())
  )
})

const onSelectedFiles = (files: Cloudinary.IResource) => {
  emit('selected-files', files)
}

onMounted(() => {
  fetchFolders()
  fetchFiles()
})
</script>

<template>
  <!-- Modal mode -->
  <div v-if="mode === 'modal' || mode === 'select'"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-2000">
    <div
      class="bg-gray-50 dark:bg-gray-900 rounded-xl max-w-6xl w-full mx-4 p-4 shadow-2xl relative overflow-y-auto max-h-[90vh]">
      <ManagerContent :folders="folders" :files="files" :filtered-files="filteredFiles" :current-folder="currentFolder"
        v-model:search="search" :is-loading="isLoading" :multiple="multiple" :readonly="mode === 'select'" :mode="mode"
        :compact="mode === 'select'" @select-folder="onSelectFolder" @rename-file="onOpenConfirmRename"
        @delete-file="onOpenConfirmDelete" @preview="onOpenPreview" @create-folder="onCreateFolder"
        @close="$emit('close')" @refresh="fetchFiles" @selected="onSelectedFiles" />
    </div>
  </div>

  <!-- Normal mode -->
  <div v-else class="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-[80vh] transition-colors duration-300 rounded-xl">
    <ManagerContent :folders="folders" :files="files" :filtered-files="filteredFiles" :mode="mode"
      :current-folder="currentFolder" v-model:search="search" :is-loading="isLoading" :multiple="multiple"
      @select-folder="onSelectFolder" @rename-file="onOpenConfirmRename" @delete-file="onOpenConfirmDelete"
      @preview="onOpenPreview" @create-folder="onCreateFolder" @refresh="fetchFiles" @selected="onSelectedFiles" />
  </div>

  <!-- Preview Modal -->
  <FilePreview v-if="isFilePreview" :file="selectedFile" @close="isFilePreview = false" />
  <!-- Confirm Modal delete -->
  <ConfirmModal :visible="isConfirmDelete" :title="deleteTitle" :confirmText="confirmText" :cancelText="cancelText"
    @confirm="confirmDelete" @cancel="isConfirmDelete = false">
    <template #default>
      <div class="text-center">
        <p>{{ deleteMessage }}</p>
        <span class="font-semibold text-red-500"> {{ selectedFile.public_id }}</span>
      </div>
    </template>
  </ConfirmModal>
  <!-- Confirm Modal rename -->
  <ConfirmModal :visible="isConfirmRename" :title="renameTitle" :confirmText="confirmText" :cancelText="cancelText"
    @confirm="onConfirmRename" @cancel="isConfirmRename = false">
    <template #icon></template>
    <template #default>
      <div class="font-semibold text-red-500 mb-2"> {{ selectedFile.public_id }}</div>
      <input type="text" :value="renameInput" @input="(e) => renameInput = (e.target as HTMLInputElement).value"
        :placeholder="renameText"
        class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm w-1/2 focus:ring focus:ring-blue-500/20 focus:outline-none transition" />
    </template>
  </ConfirmModal>
  <LoadingSpinner :visible="isLoading" />
</template>
