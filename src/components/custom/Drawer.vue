<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Drawer' },
  direction: { type: String as () => 'left' | 'right', default: 'right' },
  width: { type: [String, Number], default: 400 },
  overlay: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  outsideClose: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const drawerWrapper = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (!props.visible || !drawerWrapper.value) return
  const drawerEl = drawerWrapper.value.querySelector('div')
  if (drawerEl && !drawerEl.contains(event.target as Node)) {
    emit('close')
  }
}

function handleEsc(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  if (props.outsideClose) document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEsc)
})
onBeforeUnmount(() => {
  if (props.outsideClose) document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEsc)
})

const widthClass = computed(() =>
  typeof props.width === 'number' ? `w-[${props.width}px]` : `w-[${props.width}]`
)
const widthStyle = computed(() =>
  typeof props.width === 'number' ? `width:${props.width}px;` : `width:${props.width};`
)
const transitionEnterFrom = computed(() =>
  props.direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'
)

const transitionLeaveTo = computed(() =>
  props.direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'
)
</script>

<template>
  <Transition :enter-from-class="transitionEnterFrom" enter-active-class="transition transform duration-300 ease-out"
    enter-to-class="translate-x-0 opacity-100" leave-active-class="transition transform duration-300 ease-in"
    :leave-from-class="'translate-x-0 opacity-100'" :leave-to-class="transitionLeaveTo">
    <div v-if="visible" class="fixed inset-y-0 z-1000 flex"
      :class="direction === 'right' ? 'right-0 justify-end' : 'left-0 justify-start'">
      <!-- Overlay (tùy chọn) -->
      <div v-if="overlay" class="fixed inset-0 bg-black/50 transition-opacity duration-300" @click="$emit('close')" />

      <!-- Wrapper để bắt click outside -->
      <div ref="drawerWrapper" class="relative h-full flex" @click.self="$emit('close')">
        <!-- Drawer content -->
        <div class="relative h-full bg-white dark:bg-gray-900 border-gray-500 shadow-xl flex flex-col" :class="[
          direction === 'right' ? 'border-l' : 'border-r', widthClass]" :style="widthStyle">
          <!-- Header -->
          <template v-if="$slots.header">
            <slot name="header" />
          </template>
          <template v-else>
            <div class="flex justify-between items-center border-b border-gray-300 p-4">
              <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
              <button v-if="showClose" class="px-3 py-1 rounded bg-red-600 hover:bg-red-700" @click="$emit('close')">
                Close
              </button>
            </div>
          </template>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="border-t border-gray-700 p-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
