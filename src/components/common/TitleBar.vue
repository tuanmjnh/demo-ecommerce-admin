<template>
  <header :class="[
    'relative z-3000 h-8 flex items-center justify-between pl-3 text-sm font-medium select-none transition-colors duration-150 draggable',
    isFocused ? themeClasses.bg : themeClasses.bgBlur,
    themeClasses.text
  ]">
    <!-- App title -->
    <div class="flex items-center gap-2 no-drag">
      <img src="/icon.png" alt="app" class="h-4 w-4 rounded" />
      <span>{{ title }}</span>
      <template v-if="!isOnline">
        <span class="w-2 h-2 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
        <span>Offline</span>
      </template>
    </div>

    <!-- Window controls -->
    <div class="flex items-center no-drag">
      <button @click="minimize" :class="[baseBtnClass, themeClasses.hover]" title="Minimize">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 10 10" fill="currentColor">
          <rect y="8" width="10" height="1" />
        </svg>
      </button>

      <button @click="maximize" :class="[baseBtnClass, themeClasses.hover]" title="Maximize">
        <svg v-if="!isMaximized" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 10 10" fill="none"
          stroke="currentColor">
          <rect x="1" y="1" width="8" height="8" stroke-width="1" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 10 10" fill="none"
          stroke="currentColor">
          <path d="M3 1h6v6h-1V2H3V1z" stroke-width="1" />
          <rect x="1" y="3" width="6" height="6" stroke-width="1" />
        </svg>
      </button>

      <button @click="close" :class="[baseBtnClass, 'hover:bg-[#e81123] hover:text-white']" title="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 2l6 6M8 2L2 8" stroke-width="1.5" stroke="currentColor" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({
  title: { type: String, default: 'TM Browser' },
  theme: { type: String, default: '' },
  isOnline: { type: Boolean, default: true }
})

const isFocused = ref(true)
const isMaximized = ref(false)

const minimize = () => window.electron.windowControl('minimize')
const maximize = () => window.electron.windowControl('maximize')
const close = () => window.electron.windowControl('close')

const handleFocus = () => (isFocused.value = true)
const handleBlur = () => (isFocused.value = false)

onMounted(() => {
  window.addEventListener('focus', handleFocus)
  window.addEventListener('blur', handleBlur)
})
onUnmounted(() => {
  window.removeEventListener('focus', handleFocus)
  window.removeEventListener('blur', handleBlur)
})

const baseBtnClass = 'w-12 h-8 flex items-center justify-center transition bg-transparent'

const themeClasses = computed(() => {
  if (props.theme === 'dark') {
    return {
      bg: props.isOnline ? 'bg-[#2d2d2d]' : 'bg-yellow-600',
      bgBlur: 'bg-[#3a3a3a]',
      text: 'text-gray-200',
      hover: 'hover:bg-[#4a4a4a]'
    }
  }
  return {
    bg: props.isOnline ? 'bg-[#e5e5e5]' : 'bg-yellow-600',
    bgBlur: 'bg-[#f0f0f0]',
    text: props.isOnline ? 'text-gray-800' : 'text-gray-200',
    hover: 'hover:bg-[#d0d0d0]'
  }
})
</script>

<style scoped>
.draggable {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
