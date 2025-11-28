<script setup lang="ts">
import { ref, onUnmounted, nextTick, watchEffect } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  position: { type: String as PropType<'top' | 'right' | 'bottom' | 'left'>, default: 'top' },
  delay: { type: Number, default: 200 },
})

const show = ref(false)
const tooltipStyle = ref<Record<string, string>>({})
let timeout: ReturnType<typeof setTimeout> | null = null
const targetEl = ref<HTMLElement | null>(null)

function onEnter(e: MouseEvent) {
  targetEl.value = e.currentTarget as HTMLElement
  timeout = setTimeout(async () => {
    await nextTick()
    updateTooltipPosition()
    show.value = true
  }, props.delay)
}

function onLeave() {
  if (timeout) clearTimeout(timeout)
  show.value = false
}

function updateTooltipPosition() {
  if (!targetEl.value) return
  const rect = targetEl.value.getBoundingClientRect()

  const style: Record<string, string> = {
    position: 'fixed',
    zIndex: '9999',
  }

  switch (props.position) {
    case 'top':
      style.left = `${rect.left + rect.width / 2}px`
      style.top = `${rect.top - 8}px`
      style.transform = 'translate(-50%, -100%)'
      break
    case 'bottom':
      style.left = `${rect.left + rect.width / 2}px`
      style.top = `${rect.bottom + 8}px`
      style.transform = 'translate(-50%, 0)'
      break
    case 'left':
      style.left = `${rect.left - 8}px`
      style.top = `${rect.top + rect.height / 2}px`
      style.transform = 'translate(-100%, -50%)'
      break
    case 'right':
      style.left = `${rect.right + 8}px`
      style.top = `${rect.top + rect.height / 2}px`
      style.transform = 'translate(0, -50%)'
      break
  }

  tooltipStyle.value = style
}

onUnmounted(() => {
  if (timeout) clearTimeout(timeout)
})
</script>

<template>
  <!-- wrapper -->
  <div class="inline-block" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
  </div>

  <!-- teleport to body -->
  <teleport to="body">
    <transition enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in" enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <div v-if="show" class="px-2 py-1 text-xs rounded shadow-md whitespace-nowrap
               bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900
               border border-gray-700/30 dark:border-gray-300/30" :style="tooltipStyle">
        {{ text }}
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* đảm bảo tooltip mượt và không bị chọn */
div[style] {
  pointer-events: none;
  user-select: none;
}
</style>
