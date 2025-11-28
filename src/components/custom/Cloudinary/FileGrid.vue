<script setup lang="ts">
const props = defineProps<{
  files: Cloudinary.IResource[]
  readonly?: boolean
  multiple?: boolean
  modelValue: Cloudinary.IResource[]
}>()

// defineEmits(['select', 'rename', 'delete', 'preview'])
const emit = defineEmits<{
  // 2. EVENT CHÍNH (v-model): Trả lại mảng file đã chọn
  (e: 'update:modelValue', selectedFiles: Cloudinary.IResource[]): void;
  // Các events khác giữ nguyên
  (e: 'rename', file: Cloudinary.IResource): void;
  (e: 'delete', file: Cloudinary.IResource): void;
  (e: 'preview', file: Cloudinary.IResource): void;
}>();
const isSelected = (file: Cloudinary.IResource): boolean => {
  // Kiểm tra xem public_id của file có tồn tại trong modelValue không
  return props.modelValue.some(selectedFile => selectedFile.public_id === file.public_id);
};
const toggleFile = (file: Cloudinary.IResource) => {
  const isCurrentlySelected = isSelected(file);
  let newSelectedFiles: Cloudinary.IResource[];

  if (isCurrentlySelected) {
    // Bỏ chọn: Lọc file ra khỏi mảng
    newSelectedFiles = props.modelValue.filter(
      selectedFile => selectedFile.public_id !== file.public_id
    );
  } else {
    // Chọn: Thêm file vào mảng
    newSelectedFiles = props.multiple ? [...props.modelValue, file] : [file];
  }

  // EMIT TRẠNG THÁI MỚI VỀ COMPONENT CHA thông qua v-model
  emit('update:modelValue', newSelectedFiles);
};
const getThumbnailUrl = (file: Cloudinary.IResource) => {
  // Đây là nơi bạn có thể thêm biến đổi Cloudinary cho thumbnail
  return file.url;
}
</script>

<template>
  <div>
    <h3 class="font-semibold mb-2">Files</h3>

    <div v-if="!files.length" class="text-gray-500 text-sm">
      Không có file nào trong thư mục này.
    </div>

    <div class="grid grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
      <div v-for="f in files" :key="f.public_id"
        class="border rounded-lg p-2 relative group hover:shadow cursor-pointer transition"
        :class="[isSelected(f) ? 'border-indigo-600 shadow-md shadow-indigo-500/50' : '']">
        <div v-if="!readonly" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 z-100">
          <button class="p-1 rounded-full transition" :class="[
            isSelected(f)
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/70'
          ]" :title="isSelected(f) ? 'Bỏ chọn' : 'Chọn file'" @click.stop="toggleFile(f)">

            <svg v-if="isSelected(f)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor">
              <path
                d="M9 12L11 14L15 10M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2Z"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor">
              <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2Z"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <button
            class="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Đổi tên file" @click.stop="$emit('rename', f)">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor">
              <path
                d="M12 20H21M16.5 3.5L19.5 6.5M17.8 5.2L7.6 15.4C7.3 15.7 7.1 16.1 7 16.5L6 20L9.5 19C9.9 18.9 10.3 18.7 10.6 18.4L20.8 8.2C21.1 7.9 21.3 7.5 21.3 7.1C21.3 6.7 21.1 6.3 20.8 6L17.8 3C17.5 2.7 17.1 2.5 16.7 2.5C16.3 2.5 15.9 2.7 15.6 3L12 6.5"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <button
            class="p-1 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/70 transition"
            title="Xóa file" @click.stop="$emit('delete', f)">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor">
              <path
                d="M10 12V17M14 12V17M21 5H3M6 5L7.73171 18.6655C7.8436 19.5051 7.90045 19.9249 8.16398 20.245C8.40375 20.5353 8.7699 20.7061 9.15579 20.7303C9.57143 20.7565 10.0984 20.7686 11.1523 20.7686H12.8477C13.9016 20.7686 14.4286 20.7565 14.8442 20.7303C15.2301 20.7061 15.5962 20.5353 15.836 20.245C16.0995 19.9249 16.1564 19.5051 16.2683 18.6655L18 5M16 5V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V5"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <img :src="getThumbnailUrl(f)" class="rounded-md mb-2 max-h-40 object-cover mx-auto"
          @click="$emit('preview', f)" />
        <!-- <div class="text-xs truncate text-gray-800 dark:text-gray-200">
          {{ f.public_id }}
        </div> -->
        <!-- NAME OVERLAY -->
        <div
          class="absolute bottom-0 left-0 right-0 bg-black/50 text-white/90 text-[10px] p-1 truncate text-center backdrop-blur-[1px] transition-opacity duration-300">
          {{ f.display_name || f.public_id }}
        </div>
      </div>
    </div>
  </div>
</template>
