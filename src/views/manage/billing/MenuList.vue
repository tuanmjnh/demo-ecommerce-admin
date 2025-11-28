<script setup lang="ts">
const props = defineProps({
  products: { type: Array as PropType<Models.IProduct[]>, default: () => [] },
})
const emits = defineEmits(['add'])
function addItem(item: Models.IProduct) {
  emits('add', { ...item })
  nextTick(() => { item.quantity = 1 })
}
const formattedTotal = (total) => total ? total.toLocaleString() + '₫' : '0₫'
</script>


<template>
  <div class="dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <div
      class="grid grid-cols-8 text-sm font-semibold px-4 py-2 border-b bg-gray-200 border-gray-200 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-800">
      <div class="col-span-4">{{ $t('common.name') }}</div>
      <div class="col-span-3 text-center">{{ $t('components.product.quantity') }}</div>
      <div class="col-span-1 text-right">#</div>
    </div>

    <!-- Rows -->
    <div class="overflow-y-auto custom-scroll" :style="{ maxHeight: `calc(100vh - 230px)` }">
      <div v-for="item in products" :key="item._id"
        class="grid grid-cols-8 items-center p-2 border-b border-gray-200 hover:bg-gray-300/40 dark:border-gray-800 dark:hover:bg-gray-700/40 transition">
        <div class="col-span-4">
          <div class="block truncate">{{ item.title }}</div>
          <div class="text-sm text-blue-400 font-semibold">
            {{ formattedTotal(item.priceSelling) }}
          </div>
        </div>

        <div class="col-span-3 text-center">
          <input type="number" min="1" v-model.number="item.quantity" class="w-20 text-center border px-1 py-1 text-gray-900 dark:text-gray-100
                 bg-gray-50 border-gray-300 focus:outline-none focus:border-blue-500
                 dark:bg-gray-950 dark:border-gray-700" />
        </div>

        <div class="col-span-1 text-right">
          <Tooltip :text="$t('common.add')" position="top">
            <div class="flex items-center justify-center px-2 py-1 transition-colors
                 text-green-600 hover:text-green-500 cursor-pointer" @click="addItem(item)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" class="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
