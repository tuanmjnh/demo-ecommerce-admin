<script setup lang="ts">
import { computed, ref } from 'vue';
import ImageCard from './ImageCard.vue'
import ConfirmModal from './ConfirmModal.vue'

type FileResource = any;

// ===================== PROPS =====================
const props = withDefaults(
  defineProps<{
    modelValue: FileResource[] | FileResource | null
    class?: string
    multiple?: boolean
    deleteTitle?: string
    deleteMessage?: string
    confirmText?: string
    cancelText?: string
    renameTitle?: string
    renameText?: string
    size?: string | number
    uploadSelectText?: string
    uploadNewFile?: string
    showName?: boolean
    showUpload?: boolean
  }>(),
  {
    deleteTitle: 'Confirm action',
    deleteMessage: 'Are you sure you want to perform this action?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    renameTitle: 'Rename file',
    renameText: 'Input new filename',
    uploadSelectText: 'Select or Drag and Drop files',
    uploadNewFile: 'Upload new file',
    showUpload: true
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', files: FileResource[] | FileResource | null): void;
  (e: 'selected', files: FileResource[]): void;
  (e: 'preview', file: FileResource): void;
  (e: 'edit', file: FileResource): void;
  (e: 'delete', file: FileResource): void;
  (e: 'update', file: any): void;
}>();

// ===================== STATE =====================
const modalUpload = ref(false);
const isConfirmDelete = ref(false);

const selectedFile = ref<FileResource | null>(null)
const selectedIndex = ref<number | null>(null)

// Selected file list for multi-select
const selectedFiles = ref<FileResource[]>([]);

// ===================== HELPERS =====================

// Check if file is selected
const isSelected = (file: FileResource): boolean => {
  if (!file) return false;
  return selectedFiles.value.some(s => s.public_id === file.public_id);
};

// Toggle select/unselect file
const handleToggleFile = (file: FileResource) => {
  const exists = isSelected(file);

  if (props.multiple) {
    if (exists) {
      // Remove from selection
      selectedFiles.value = selectedFiles.value.filter(f => f.public_id !== file.public_id);
    } else {
      // Add to selection
      selectedFiles.value.push(file);
    }
  } else {
    // Always 1 selected item in single mode
    selectedFiles.value = [file];
  }

  emit('selected', selectedFiles.value);
};

// Check if list is empty
const isNoFile = computed(() => {
  return !props.modelValue || (Array.isArray(props.modelValue) && props.modelValue.length === 0);
});

// Merge two arrays by key
function mergeByKey<T extends Record<string, any>>(base: T[], updates: T[], key: keyof T): T[] {
  const map = new Map(base.map(item => [item[key], { ...item }]))
  for (const item of updates) {
    const k = item[key]
    if (map.has(k)) {
      map.set(k, { ...map.get(k), ...item })
    } else {
      map.set(k, item)
    }
  }
  return Array.from(map.values())
}

// ===================== ACTION HANDLERS =====================

const isConfirmRename = ref(false)
const renameInput = ref('')

// Edit a file
const onEditFile = (file: FileResource) => {
  selectedFile.value = file
  renameInput.value = file.display_name || file.public_id
  isConfirmRename.value = true
  emit('edit', file)
}

const onConfirmRename = () => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const clone = [...props.modelValue]
    const idx = clone.findIndex(f => f.public_id === selectedFile.value.public_id)
    if (idx > -1) {
      clone[idx] = { ...clone[idx], display_name: renameInput.value }
      emit('update:modelValue', clone)
      emit('update', clone)
    }
  } else if (props.modelValue) {
    const updated = { ...props.modelValue, display_name: renameInput.value }
    emit('update:modelValue', updated)
    emit('update', updated)
  }
  isConfirmRename.value = false
}

// Open confirm delete modal
const onOpenConfirmDelete = (file: FileResource, index: number) => {
  selectedFile.value = file
  selectedIndex.value = index
  isConfirmDelete.value = true
}

// Confirm deletion
const onConfirmDelete = () => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const clone = [...props.modelValue]
    if (selectedIndex.value !== null && selectedIndex.value > -1) {
      clone.splice(selectedIndex.value, 1)
    }
    emit('update:modelValue', clone)
    emit('update', clone)
  } else {
    emit('update:modelValue', null)
    emit('update', null)
  }

  emit('delete', selectedFile.value!)
  isConfirmDelete.value = false
}

// Handle file selection from file manager
const onFileManagerSelected = (files: FileResource[]) => {
  if (files && files.length) {
    if (props.multiple) {
      const newItems = files.map(f => ({
        public_id: f.public_id,
        display_name: f.display_name,
        url: f.url,
        format: f.format,
        bytes: f.bytes,
        created_at: Date.parse(f.created_at)
      }))

      const base = Array.isArray(props.modelValue) ? [...props.modelValue] : []
      const merged = mergeByKey(base, newItems, 'public_id')

      emit('update:modelValue', merged)
      emit('update', merged)
    } else {
      const single = files[0]
      const result = {
        public_id: single.public_id,
        display_name: single.display_name,
        url: single.url,
        format: single.format,
        bytes: single.bytes,
        created_at: Date.parse(single.created_at)
      }

      emit('update:modelValue', result)
      emit('update', result)
    }
  }

  modalUpload.value = false
}


</script>

<template>
  <!-- File list -->
  <div :class="class">
    <div v-if="multiple" class="flex flex-wrap gap-3 overflow-y-auto">
      <ImageCard v-for="(f, i) in modelValue" :key="f.public_id" :file="f" :size="size" :is-show-selected="multiple"
        :isSelected="isSelected(f)" :upload-select-text="uploadSelectText" :upload-new-file="uploadNewFile"
        :show-name="showName" @toggle="handleToggleFile" @preview="emit('preview', f)" @edit="onEditFile(f)"
        @delete="onOpenConfirmDelete(f, i)" />
      <!-- No file – show upload dropzone -->
      <ImageCard v-if="showUpload" :file="null" :is-show-selected="multiple" :isSelected="false" :size="size"
        :upload-select-text="uploadSelectText" :upload-new-file="uploadNewFile" :show-name="showName"
        @upload="modalUpload = true" />
    </div>
    <!-- Single file -->
    <ImageCard v-if="!isNoFile && !multiple" :file="modelValue" :size="size" :is-show-selected="false"
      :isSelected="isSelected(modelValue as any)" :upload-select-text="uploadSelectText"
      :upload-new-file="uploadNewFile" :show-name="showName" @toggle="handleToggleFile"
      @preview="emit('preview', modelValue)" @edit="onEditFile(modelValue)"
      @delete="onOpenConfirmDelete(modelValue, 0)" />
    <div v-if="isNoFile && !multiple" :class="class">
      <ImageCard v-if="showUpload" :file="null" :is-show-selected="multiple" :isSelected="false" :size="size"
        :upload-select-text="uploadSelectText" :upload-new-file="uploadNewFile" :show-name="showName"
        @upload="modalUpload = true" />
    </div>
  </div>

  <!-- File manager modal -->
  <Cloudinary v-if="modalUpload" :multiple="multiple" mode="modal" @close="modalUpload = false"
    :delete-title="deleteTitle" :confirm-text="confirmText" :cancel-text="cancelText" :delete-message="deleteMessage"
    :rename-title="renameTitle" :rename-text="renameText" @selected-files="onFileManagerSelected" />

  <!-- Confirm delete dialog -->
  <ConfirmModal :visible="isConfirmDelete" :title="deleteTitle" :confirm-text="confirmText" :cancel-text="cancelText"
    @confirm="onConfirmDelete" @cancel="isConfirmDelete = false">
    <template #default>
      <div class="text-center">
        <p>{{ deleteMessage }}</p>
        <span class="font-semibold text-red-500">
          {{ selectedFile?.display_name }}
        </span>
      </div>
    </template>
  </ConfirmModal>

  <!-- Confirm Rename dialog -->
  <ConfirmModal :visible="isConfirmRename" :title="renameTitle" :confirm-text="confirmText" :cancel-text="cancelText"
    @confirm="onConfirmRename" @cancel="isConfirmRename = false">
    <template #default>
      <div class="text-center">
        <p class="mb-2">{{ renameText }}</p>
        <input type="text" v-model="renameInput"
          class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm w-full focus:ring focus:ring-blue-500/20 focus:outline-none transition" />
      </div>
    </template>
  </ConfirmModal>
</template>
