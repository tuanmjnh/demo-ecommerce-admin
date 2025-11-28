<script setup lang="ts">
const props = defineProps<{ file: Cloudinary.IResource }>()
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// --- LOGIC XỬ LÝ ẢNH ---
const imageLoaded = ref(false);
const imageError = ref(false);

/**
 * Handles the load event of the image, setting imageLoaded to true.
 */
const handleImageLoad = () => {
  imageLoaded.value = true;
};

/**
 * Handles the error event of the image, setting imageError to true.
 */
const handleImageError = () => {
  imageError.value = true;
  imageLoaded.value = true; // Mark as loaded to hide skeleton, show error message instead
};

// Computed property to format file size
const formattedFileSize = computed(() => {
  if (props.file && props.file.bytes) {
    const kb = props.file.bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    } else {
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    }
  }
  return 'N/A';
});

// Computed property to format creation date
const formattedCreationDate = computed(() => {
  if (props.file && props.file.created_at) {
    // file.created_at có thể là string (ISO) hoặc number (timestamp)
    const date = new Date(props.file.created_at);
    if (!isNaN(date.getTime())) { // Kiểm tra ngày hợp lệ
      return date.toLocaleString();
    }
  }
  return 'N/A';
});
</script>
<template>
  <div class="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-2001 backdrop-blur-sm"
    @click.self="$emit('close')">
    <div
      class="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full p-4 relative shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <button
        class="absolute top-2 right-2 rounded-md flex items-center justify-center text-lg py-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-[28px] z-100"
        @click="$emit('close')">
        <svg class="h-5 w-5 block mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="relative max-h-[70vh] flex items-center justify-center mx-auto rounded-lg overflow-hidden">
        <div v-if="!imageLoaded"
          class="w-full h-[70vh] bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center text-gray-400 text-sm">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L14 14m0 0l-1.586-1.586a2 2 0 00-2.828 0L7 16m0 0l-1.586-1.586a2 2 0 00-2.828 0L2 14v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-3m-6 3h.01M16 11H8">
            </path>
          </svg>
        </div>

        <img :src="file.url" :alt="file.display_name || 'Preview'"
          class="object-contain shadow-md dark:shadow-gray-800/60 transition-opacity duration-300 max-h-[70vh]"
          :class="{ 'opacity-0 absolute inset-0': !imageLoaded }" loading="lazy" @load="handleImageLoad"
          @error="handleImageError" />

        <div v-if="imageError"
          class="absolute inset-0 bg-red-100/80 dark:bg-red-900/80 flex items-center justify-center p-4 rounded-lg">
          <p class="text-sm text-red-700 dark:text-red-300 font-semibold text-center">
            Không thể tải ảnh. Vui lòng kiểm tra URL hoặc kết nối mạng.
          </p>
        </div>
      </div>

      <div class="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <div class="grid grid-cols-2 gap-4">
          <div><strong class="dark:text-gray-100">Name:</strong> {{ file.display_name || 'N/A' }}</div>
          <div><strong class="dark:text-gray-100">Format:</strong> {{ file.format || 'N/A' }}</div>
          <div>
            <strong class="dark:text-gray-100">Size:</strong>
            {{ formattedFileSize }}
          </div>
          <div>
            <strong class="dark:text-gray-100">Created:</strong>
            {{ formattedCreationDate }}
          </div>
          <div class="col-span-2"><strong class="dark:text-gray-100">Url:</strong> {{ file.secure_url || 'N/A' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>