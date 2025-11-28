<script setup lang="ts">
import TableCard from './TableCard.vue'
const props = defineProps<{
  tables: Models.BillingTable[],
  selectedId?: string | null,
}>()
// const tableList = computed(() => {
//   if (!props.groups?.length) return []
//   return props.groups.map(group => {
//     const billing = props.bills?.find(b => b.groupId === group._id && b.status !== 'paid' && b.status !== 'cancelled')
//     if (!group.status) group.status = 'empty'
//     return {
//       group: group,
//       billing: billing
//       // status: bill?.status ?? 'empty',
//       // total: bill?.total ?? 0,
//       // customer: bill?.customer ?? null,
//       // created: bill?.created ?? null,
//       // billCode: bill?.code ?? null,
//       // billKey: bill?.key ?? null,
//       // hasBill: !!bill
//     }
//   })
// })

// Theo dõi dữ liệu để debug (có thể bỏ)
// watch(props.tables, (val) => {
//   console.log(val)
// }, { deep: true, immediate: true })
</script>
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <TableCard v-for="e in tables" :key="e.group?._id" :table="e" :isSelected="e.group?._id === selectedId"
      @click="$emit('select', e)" />
  </div>
</template>
