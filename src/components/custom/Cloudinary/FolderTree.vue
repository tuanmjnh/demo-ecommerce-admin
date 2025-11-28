<script setup lang="ts">
import { ref } from 'vue'
import FolderNode from './FolderNode.vue'

const props = defineProps<{
  folders: Cloudinary.IFolder[]
  active: string
}>()

const emit = defineEmits(['select-folder', 'create-folder', 'load-subfolders'])

// Lưu danh sách thư mục đang mở
const openFolders = ref<Set<string>>(new Set())

function toggleFolder(folder: Cloudinary.IFolder) {
  if (openFolders.value.has(folder.path)) {
    openFolders.value.delete(folder.path)
  } else {
    openFolders.value.add(folder.path)
    // Nếu folder có con và chưa load thì emit event
    if (!folder.childrenLoaded && folder.hasChildren) {
      emit('load-subfolders', folder)
    }
  }
}

function isOpen(path: string) {
  return openFolders.value.has(path)
}

function create() {
  const name = prompt('Tên thư mục mới:')
  if (name) emit('create-folder', name)
}
</script>

<template>
  <div class="max-h-[80vh] overflow-y-auto pr-1">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold text-gray-800 dark:text-gray-100">Folders</h3>
      <span @click="create" class="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
        + New
      </span>
    </div>

    <!-- Tree list -->
    <ul class="space-y-1 text-sm">
      <FolderNode v-for="f in folders" :key="f.path" :folder="f" :active="active" :is-open="isOpen(f.path)"
        @toggle="toggleFolder" @select="$emit('select-folder', $event)" />
    </ul>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(150, 150, 150, 0.5);
}
</style>
