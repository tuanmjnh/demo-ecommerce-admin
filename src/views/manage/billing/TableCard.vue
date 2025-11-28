<script setup lang="ts">
import { PropType, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import moment from 'moment'

const props = defineProps({
  table: { type: Object as PropType<Models.BillingTable>, required: true },
  // group: { type: Object as PropType<Models.IGroup>, required: true },
  isSelected: { type: Boolean as PropType<boolean>, default: false },
  // createdAt: { type: Number as PropType<number>, default: 0 },
  // customer: { type: String, default: '-' },
  // total: { type: Number as PropType<number>, default: 0 },
})

// const group = ref({ ...props.group })
// watch(props.table, (val) => {
//   console.log(val)
// }, { deep: true, immediate: true })
// state stores elapsed time (text)
const timeElapsed = ref('--:--:--')
let timer: any = null

/**
* Function to calculate service time
* based on table.created.at (timestamp or ISO string)
*/
function updateTime() {
  if (!props.table?.billing?.created?.at || props.table.group.status !== 'serving') {
    timeElapsed.value = '--:--:--'
    return
  }

  const created = moment(props.table.billing.created.at)
  const now = moment()
  const diff = moment.duration(now.diff(created))
  const h = String(diff.hours()).padStart(2, '0')
  const m = String(diff.minutes()).padStart(2, '0')
  const s = String(diff.seconds()).padStart(2, '0')
  timeElapsed.value = `${h}:${m}:${s}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

// const formattedTotal = computed(() =>
//   props.total ? props.total.toLocaleString() + '₫' : '0₫'
// )
const formattedTotal = (total) => total ? total.toLocaleString() + '₫' : '0₫'

const cardClass = computed(() => {
  const rs = ['dark:bg-gray-800 border-gray-700']
  if (props.table.group.status === 'serving')
    rs.push('bg-gray-600! border-indigo-900! text-white dark:text-yellow-50')
  if (props.table.group.status === 'reserved')
    rs.push('bg-indigo-900 border-indigo-700 text-indigo-50')
  if (props.isSelected)
    rs.push('ring-2 ring-blue-400! border-blue-400!')
  return rs
})

const statusClass = computed(() => {
  if (props.table.group.status === 'serving') return 'bg-yellow-700 text-white'
  if (props.table.group.status === 'reserved') return 'bg-indigo-600 text-white'
  return 'bg-green-600 text-white'
})
</script>

<template>
  <div
    class="cursor-pointer w-full h-36 flex flex-col justify-between p-4 rounded-xl border transition transform hover:border-sky-400! focus:outline-none"
    :class="cardClass" @click="$emit('click')">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="text-lg font-semibold">{{ props.table.group.title }}</div>
      <div class="text-xs px-2 py-1 rounded-full font-medium" :class="statusClass">
        {{ $t(`components.billing.${props.table.group.status}`) }}
      </div>
    </div>

    <!-- Body -->
    <div class="flex items-center justify-between">
      <div class="text-sm">
        <div>{{ $t(`components.billing.customer`) }}: <span class="font-medium">{{ props.table?.billing?.customer
            }}</span></div>
        <div class="mt-1">
          {{ $t(`common.time`) }}:
          <span class="font-medium">{{ timeElapsed }}</span>
        </div>
      </div>

      <div class="text-right">
        <div class="text-sm"> {{ $t(`common.sum`) }}</div>
        <div class="text-lg font-bold text-blue-500">{{ formattedTotal(props.table?.billing?.total) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:active {
  transform: scale(0.995);
}
</style>
