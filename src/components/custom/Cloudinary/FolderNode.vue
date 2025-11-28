<script setup lang="ts">
import FolderNode from './FolderNode.vue'

const props = defineProps<{
  folder: Cloudinary.IFolder
  active: string
  isOpen: boolean
}>()

const emit = defineEmits(['toggle', 'select'])
</script>

<template>
  <li>
    <!-- Folder Item -->
    <div :class="[
      'flex items-center gap-1 p-1 rounded cursor-pointer transition-colors duration-150 select-none',
      active === folder.path
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/40 dark:text-blue-200 font-semibold'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
    ]">
      <!-- Toggle icon -->
      <span v-if="folder.hasChildren" class="w-4 flex justify-center cursor-pointer text-xs select-none"
        @click.stop="emit('toggle', folder)">
        {{ isOpen ? '▾' : '▸' }}
      </span>
      <span v-else class="w-4 flex justify-center opacity-40 text-xs">•</span>

      <!-- Folder name -->
      <span @click="emit('select', folder)" class="w-full">
        {{ folder.name }}
      </span>
    </div>

    <!-- Subfolders -->
    <transition name="fade">
      <ul v-if="isOpen && folder.children?.length"
        class="pl-5 border-l border-gray-200 dark:border-gray-700 mt-1 space-y-1">
        <FolderNode v-for="sub in folder.children" :key="sub.path" :folder="sub" :active="active" :is-open="false"
          @toggle="emit('toggle', $event)" @select="emit('select', $event)" />
      </ul>
    </transition>
  </li>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
