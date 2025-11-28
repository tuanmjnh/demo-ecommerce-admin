<script setup lang="ts">
import CloudUpload from './CloudUpload.vue'
import FolderTree from './FolderTree.vue'
import FileGrid from './FileGrid.vue'

const props = defineProps<{
  folders: Cloudinary.IFolder[]
  files: Cloudinary.IResource[]
  filteredFiles: Cloudinary.IResource[]
  currentFolder: Cloudinary.IFolder
  search: string
  readonly?: boolean
  compact?: boolean
  isLoading?: boolean
  mode?: string
  acceptText?: string
  multiple?: boolean
}>()

const emit = defineEmits([
  'create-folder',
  'select-folder',
  'select-file',
  'rename-file',
  'delete-file',
  'preview',
  'update:search',
  'refresh',
  'close',
  'selected'
])
const selectedFile = ref<Cloudinary.IResource[]>([])
const isUploadLoading = ref(false)
</script>

<template>
  <!-- Header -->
  <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
    <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
      🌩️ Cloudinary Manager
    </h2>
    <div class="flex flex-initial gap-2 justify-between items-center">
      <button v-if="selectedFile && selectedFile.length" :disable="isUploadLoading"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        :class="{ 'opacity-70 cursor-not-allowed': isLoading }" :disabled="isLoading"
        @click="$emit('selected', selectedFile)" title="Chấp nhận">
        <span v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.75V6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M17.1213 6.87868L16.0607 7.93934" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M19.25 12H17.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M17.1213 17.1213L16.0607 16.0607" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M12 17.75V19.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M6.87868 17.1213L7.93934 16.0607" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M4.75 12H6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
            <path d="M6.87868 6.87868L7.93934 7.93934" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"></path>
          </svg>
        </span>
        <svg v-else class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {{ acceptText || 'Chấp nhận' }}
      </button>
      <CloudUpload v-if="!props.readonly" @uploaded="$emit('refresh')" :currentFolder="props.currentFolder"
        v-model:is-loading="isUploadLoading" />
      <button v-if="mode !== 'select'" :disable="isUploadLoading"
        class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-md flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 text-sm px-4 py-2"
        @click="$emit('close')">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Breadcrumb -->
  <!-- <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
    <span v-for="(part, index) in props.currentFolder.path.split('/').filter(Boolean)" :key="index"
      class="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" @click="$emit('select-folder', part)">
      {{ part || 'root' }}
      <span v-if="index < props.currentFolder.path.split('/').length - 1"
        class="text-gray-400 dark:text-gray-500">/</span>
    </span>
  </div> -->

  <div class="grid grid-cols-12 gap-4 mt-4">
    <!-- 📁 Folder Tree -->
    <div
      class="col-span-3 border-r border-gray-200 dark:border-gray-700 pr-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <FolderTree :folders="props.folders" :active="props.currentFolder.path" :readonly="props.readonly"
        @select-folder="$emit('select-folder', $event)" @create-folder="$emit('create-folder', $event)" />
    </div>

    <!-- 🖼️ File Area -->
    <div class="col-span-9 space-y-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm overflow-y-auto max-h-[75vh]"
      :class="{ 'p-2': props.compact }">
      <input :value="props.search" @input="(e) => $emit('update:search', (e.target as HTMLInputElement).value)"
        type="text" placeholder="🔍 Tìm kiếm file..."
        class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm w-1/2 focus:ring focus:ring-blue-500/20 focus:outline-none transition" />

      <FileGrid v-model="selectedFile" :files="props.filteredFiles" :readonly="props.readonly" :multiple="multiple"
        @rename="$emit('rename-file', $event)" @delete="$emit('delete-file', $event)"
        @preview="$emit('preview', $event)" @select="$emit('select-file', $event)" />
    </div>
  </div>
</template>
