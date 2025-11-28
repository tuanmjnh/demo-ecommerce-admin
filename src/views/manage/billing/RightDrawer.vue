<script setup lang="ts">
import MenuList from './MenuList.vue'
defineProps({
  group: { type: Object as PropType<Models.IGroup>, default: null },
  groupsProduct: { type: Object as PropType<Models.IGroup[]>, default: null },
  products: { type: Array as PropType<Models.IProduct[]>, default: () => [] },
})
const emits = defineEmits(['select', 'close'])
const selectedGroupsProductId = ref<string | null>(null)
// const emits = defineEmits(['select'])
const onSelectedGroupsProductId = (val) => {
  selectedGroupsProductId.value = val
  emits('select', val)
}
</script>

<template>
  <Transition enter-active-class="transition transform duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition transform duration-300 ease-in" leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0">
    <div v-if="group" class="fixed inset-0 flex justify-end z-2001">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50 transition-opacity duration-300" @click="$emit('close')" />

      <!-- Drawer content -->
      <div class="relative w-[450px] bg-gray-900 border-l border-gray-700 shadow-xl p-6 flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 class="text-xl font-semibold">{{ group.title }}</h2>
          <div class="flex gap-2">
            <button class="px-3 py-1 rounded bg-red-600 hover:bg-red-700" @click="$emit('close')">
              Đóng
            </button>
            <button v-if="group.status === 'serving'" class="px-3 py-1 rounded bg-green-600 hover:bg-green-700">
              Thanh toán
            </button>
            <button v-else class="px-3 py-1 rounded bg-green-600 hover:bg-green-700">
              Đặt bàn
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto mt-4 space-y-4">
          <h3 class="font-semibold text-lg">Danh sách món</h3>
          <select @change="onSelectedGroupsProductId(($event.target as HTMLSelectElement).value)"
            class="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg rounded-lg border border-gray-700 transition text-gray-900 text-sm rounded-lg block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white w-[96%] focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <!-- <option selected>Choose a country</option> -->
            <option v-for="e in groupsProduct" :key="e._id" :value="e._id" :selected="e._id === group._id">{{ e.title }}
            </option>
          </select>
          <MenuList :products="products" />
        </div>
      </div>
    </div>
  </Transition>
</template>
