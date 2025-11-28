<script setup lang="ts">
const props = defineProps({
  products: { type: Array as PropType<Models.OrderItem[]>, default: () => [] }
})
const formattedTotal = (total) => total ? total.toLocaleString() + '₫' : '0₫'
</script>

<template>
  <div class="dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <div
      class="grid grid-cols-8 text-sm font-semibold px-4 py-2 border-b bg-gray-200 border-gray-200 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-800">
      <div class="col-span-3">{{ $t('common.name') }}</div>
      <div class="col-span-2 text-center">{{ $t('components.product.quantity') }}</div>
      <div class="col-span-2 text-center">{{ $t('common.sum') }}</div>
      <div class="col-span-1 text-right">#</div>
    </div>

    <!-- Rows -->
    <div class="overflow-y-auto custom-scroll" :style="{ maxHeight: `calc(100vh - 230px)` }">
      <div v-for="item in products" :key="item.productId"
        class="grid grid-cols-8 items-center p-2 border-b border-gray-200 hover:bg-gray-300/40 dark:border-gray-800 dark:hover:bg-gray-700/40 transition">
        <div class="col-span-3">
          <div class="block truncate">{{ item.name }}</div>
          <div class="text-sm text-blue-400 font-semibold">
            {{ formattedTotal(item.price) }}
          </div>
        </div>

        <div class="col-span-2 text-center">
          <div class="text-sm text-blue-400 font-semibold">
            {{ item.quantity.toLocaleString() }}
          </div>
        </div>

        <div class="col-span-2 text-center">
          <div class="text-sm text-blue-400 font-semibold">
            {{ formattedTotal(item.price * item.quantity) }}
          </div>
        </div>
        <div class="col-span-1 text-right flex-inline gap-x-2 ml-2">
          <Tooltip :text="$t('common.decrease')" position="top">
            <div class="flex items-center justify-center px-2 py-1 transition-colors
                 text-yellow-500 hover:text-yellow-200 cursor-pointer" @click="$emit('subItem', item)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </Tooltip>
          <!-- <div class="flex items-center justify-center px-2 py-1 transition-colors
                 bg-red-500 hover:bg-red-400 text-white cursor-pointer" @click="$emit('removeItem', item)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* .dark .custom-scroll::-webkit-scrollbar-thumb {
  background-color: #4f678a;
} */
</style>
