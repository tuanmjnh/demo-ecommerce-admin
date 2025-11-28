<script setup lang="ts">
import { $t, $tm } from '@/utils'
import { useLoadingStore, useGroupStore, useProductStore, useBillingStore } from '@/stores'
import { viToAscii } from 'tm-libs/string'
import TableGrid from './TableGrid.vue'
// import RightDrawer from './RightDrawer.vue'
import OderList from './OderList.vue'
import MenuList from './MenuList.vue'

const loadingStore = useLoadingStore()
const groupStore = useGroupStore()
const productStore = useProductStore()
const billingStore = useBillingStore()
const route = useRoute()
const groupType = route.meta.group || 'billing'
const groups = computed(() => groupStore.getFilterByKey({ key: groupType, flag: 1 }))
const groupsProduct = computed(() => groupStore.getFilterByKey({ key: 'billing-items', flag: 1 }))
const products = computed(() => productStore.items)
const tables = computed(() => billingStore.tables)
const selectedTable = ref<Models.BillingTable | null>(null)
const modelForm = ref<Models.IBilling>(JSON.parse(JSON.stringify(billingStore.getDefaultModel)))
const isConfirmOrder = ref(false)
const isConfirmUpdate = ref(false)
const isConfirmPay = ref(false)
const isConfirmCancel = ref(false)
const modelFormUpdateRef = ref()
const modelFormCancelRef = ref()
const modelFormConfirm = ref({
  reason: ''
})
//

function getRandomTimeToday() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0) // 00:00:00 Now

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999) // 23:59:59 Now

  const randomTime =
    startOfDay.getTime() +
    Math.random() * (endOfDay.getTime() - startOfDay.getTime())

  return Math.floor(randomTime)
}
const formattedTotal = (total) => total ? total.toLocaleString() + '₫' : '0₫'
const updateTotal = (billing: Models.IBilling) => {
  billing.total = billing.items.reduce((total, item) => total + item.price * item.quantity, 0)
  // return billing.items.reduce((total, item) => total + item.price * item.quantity, 0)
}
// demo data
// const tables = ref(
//   Array.from({ length: 20 }).map((_, i) => ({
//     _id: String(i + 1),
//     name: `Bàn ${i + 1}`,
//     status: i % 3 === 0 ? 'serving' : 'empty',
//     total: Math.floor(Math.random() * 200000),
//     created: { at: getRandomTimeToday() },
//   }))
// )
const onReset = () => {
  selectedTable.value = null
  modelForm.value = JSON.parse(JSON.stringify(billingStore.getDefaultModel))
  modelFormConfirm.value.reason = ''
}
function openDrawer(table: Models.BillingTable) {
  selectedTable.value = table
  if (table.billing) modelForm.value = JSON.parse(JSON.stringify(table.billing))
  // isShowLeftDrawer.value = true
  // isShowRightDrawer.value = true
}
function onSelectGroupProduct(group: Models.IGroup) {
  onFetchProducts({ groups: [group] }, false)
}
const onFetchTables = async () => {
  await billingStore.loadTables(groups.value)
  // console.log(tables.value)
}
const onFetchProducts = async (filter?: any, isLoadDB: boolean = true) => {
  if (!filter) filter = {}
  filter = { ...{ key: 'billing-items', flag: 1 }, ...filter }
  productStore.filter(filter).then((x) => {
    if (!x || !x.items.length)
      if (isLoadDB) productStore.getAll(filter)
  })
}
const selectedGroupsProductId = ref<string | null>(null)
// const emits = defineEmits(['select'])
const onSelectedGroupsProductId = (val) => {
  selectedGroupsProductId.value = val
}

const onAddProduct = (item: Models.IProduct) => {
  // if (selectedTable.value.group.status === 'empty') {
  modelForm.value.groupId = selectedTable.value.group._id
  const exist = modelForm.value.items.find(p => p.productId === item._id)
  if (exist) {
    exist.quantity += item.quantity || 1
  } else {
    modelForm.value.items.push({
      productId: item._id,
      name: item.title,
      price: item.priceSelling,
      quantity: item.quantity || 1
    })
  }
  updateTotal(modelForm.value)
}
const onSubProduct = (item: Models.OrderItem) => {
  modelForm.value.groupId = selectedTable.value.group._id
  const index = modelForm.value.items.findIndex(p => p.productId === item.productId)
  if (index > -1) {
    if (modelForm.value.items[index].quantity < 2) modelForm.value.items.splice(index, 1)
    else modelForm.value.items[index].quantity -= 1
    updateTotal(modelForm.value)
  }
}
const onRemoveProduct = (item: Models.OrderItem) => {
  modelForm.value.groupId = selectedTable.value.group._id
  const index = modelForm.value.items.findIndex(p => p.productId === item.productId)
  if (index > -1) {
    modelForm.value.items.splice(index, 1)
    updateTotal(modelForm.value)
  }
}
const onCreateOrder = () => {
  modelForm.value.code = viToAscii(modelForm.value.code)
  billingStore.createOrder({ group: selectedTable.value.group, billing: modelForm.value }).then((x) => {
    if (x.status) onReset()
    else window.$message.error($t(`message.error.${x.statusMessage}`))
    isConfirmOrder.value = false
  })
}
const onUpdateOrder = async () => {
  modelFormUpdateRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        if (!modelForm.value.items || !modelForm.value.items.length) {
          window.$message.error($tm(['common.pleaseSelect', 'components.billing.menuList']))
          isConfirmUpdate.value = false
          return
        }
        billingStore.updateOrder({ table: selectedTable.value, items: modelForm.value.items, reason: modelFormConfirm.value.reason }).then((x) => {
          if (x.status) onReset()
          //     selectedTable.value = null
          //     modelFormConfirm.value.reason = ''
          // }
          else window.$message.error($t(`message.error.${x.statusMessage}`))
          isConfirmUpdate.value = false
        })
        // console.log('modelForm', modelForm.value.items)
        // console.log('billing', selectedTable.value.billing.items)
      } catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
const onPayOrder = () => {
  billingStore.payOrder(selectedTable.value).then((x) => {
    if (x.status) onReset()
    //     selectedTable.value = null
    // }
    else window.$message.error($t(`message.error.${x.statusMessage}`))
    isConfirmPay.value = false
  })
}
const onCancelOrder = () => {
  modelFormCancelRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        billingStore.cancelOrder({ table: selectedTable.value, reason: modelFormConfirm.value.reason }).then((x) => {
          if (x.status) onReset()
          // {
          //   selectedTable.value = null
          //   modelFormConfirm.value.reason = ''
          // }
          else window.$message.error($t(`message.error.${x.statusMessage}`))
          isConfirmCancel.value = false
        })
      } catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
onMounted(() => {
  onFetchTables()
  onFetchProducts()
})
</script>

<template>
  <n-space vertical>
    <!-- <div class="border border-gray-300 bg-white dark:bg-transparent dark:border-gray-600 dark:text-gray-100 flex"> -->
    <!-- Left: Table list (full page grid) -->
    <n-card title="">
      <div class="flex-1 p-6 overflow-y-auto custom-scroll pr-2" :style="{ maxHeight: `calc(100vh - 220px)` }">
        <TableGrid :tables="tables" :selectedId="selectedTable?.group?._id" @select="openDrawer" />
      </div>
      <!-- Right: Drawer -->
      <Drawer :visible="!!selectedTable" direction="right" :overlay="true" :width="800" :outside-close="false"
        style="height: calc(100vh - 30px);top:32px" @close="onReset">
        <!-- <MenuList :products="products" /> -->
        <template #header>
          <div class="flex justify-between items-center border-b border-gray-700 p-4">
            <h2 class="text-lg font-semibold dark:text-white">{{ selectedTable.group?.title }}</h2>

            <div class="flex gap-2 justify-between items-center">
              <button v-if="selectedTable.group.status === 'empty' && modelForm?.items?.length"
                @click="isConfirmOrder = true" class="px-6 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md">
                {{ $t('components.billing.orderTable') }}
              </button>
              <button v-if="selectedTable.group.status === 'serving'" @click="isConfirmUpdate = true"
                class="px-6 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md">
                {{ $t('common.update') }}
              </button>
              <button v-if="selectedTable.group.status === 'serving'" @click="isConfirmPay = true"
                class="px-6 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-md">
                {{ $t('components.billing.payTable') }}
              </button>
              <button v-if="selectedTable.group.status === 'serving'" @click="isConfirmCancel = true"
                class="px-6 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md">
                {{ $t('components.billing.cancelTable') }}
              </button>
              <Tooltip :text="$t('common.close')" position="bottom">
                <nova-icon icon="icon-park-outline:close"
                  class="cursor-pointer color-gray-500 hover:color-gray-300 ml-6" @click="selectedTable = null" />
              </Tooltip>
            </div>
          </div>
        </template>
        <template #default>
          <div class="flex-1 overflow-y-auto">
            <!-- <h3 class="font-semibold text-lg">Danh sách món</h3> -->
            <!-- <select @change="onSelectedGroupsProductId(($event.target as HTMLSelectElement).value)"
            class="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg rounded-lg border border-gray-700 transition text-gray-900 text-sm rounded-lg block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white w-[96%] focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option v-for="e in groupsProduct" :key="e._id" :value="e._id" :selected="e._id === selectedGroup._id">{{
              e.title }}
            </option>
          </select> -->
            <!-- <div v-if="selectedTable.billing" class="flex justify-between gap-x-8 p-3">
              <div class="w-full">
                <n-input-group>
                  <n-input-group-label class="font-bold">{{ $t('components.billing.customer') }}</n-input-group-label>
                  <n-input-group-label>{{ selectedTable.billing.customer || $t('components.billing.customerNull')
                  }}</n-input-group-label>
                </n-input-group>
              </div>
              <div class="w-full">
                <n-input-group>
                  <n-input-group-label class="font-bold">{{ $t('common.note') }}</n-input-group-label>
                  <n-input-group-label>{{ selectedTable.billing.note || $t('common.noData') }}</n-input-group-label>
                </n-input-group>
              </div>
            </div> -->
            <!-- <div class="flex justify-between gap-x-8 p-3">
              <div class="w-full">
                <n-input-group>
                  <n-input-group-label class="font-bold">{{ $t('components.billing.customer') }}</n-input-group-label>
                  <n-input v-model:value="modelForm.customer"
                    :placeholder="$tm(['common.pleaseInput', 'components.billing.customer'])" />
                </n-input-group>
              </div>
              <div class="w-full">
                <n-input-group>
                  <n-input-group-label class="font-bold">{{ $t('common.note') }}</n-input-group-label>
                  <n-input v-model:value="modelForm.note" :placeholder="$tm(['common.pleaseInput', 'common.note'])" />
                </n-input-group>
              </div>
            </div> -->
            <div class="flex justify-between gap-x-8 p-x-3">
              <div class="w-full">
                <div class="font-bold p-2 drop-shadow-md">
                  {{ $t('components.billing.orderList') }}
                </div>
                <!-- <OderList v-if="selectedTable.billing" :products="selectedTable.billing.items" />
                <OderList v-else :products="modelForm.items" /> -->
                <OderList :products="modelForm.items" @subItem="onSubProduct" @removeItem="onRemoveProduct" />
              </div>
              <div class="w-full">
                <div class="font-bold p-2">{{ $t('components.billing.menuList') }}</div>
                <MenuList :products="products" @add="onAddProduct" />
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div>
            <span class="mr-1">{{ $t('common.total') }}:</span>
            <!-- <span class="font-semibold text-blue">{{
              selectedTable.billing ? formattedTotal(selectedTable.billing.total) : formattedTotal(modelForm.total)
              }}</span> -->
            <span class="font-semibold text-blue">{{ formattedTotal(modelForm.total) }}</span>
          </div>
        </template>
      </Drawer>
      <confirm-modal :visible="isConfirmOrder" :title="$tm(['common.confirm', 'components.billing.orderTable'])"
        :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
        confirm-class="bg-green-600 hover:bg-green-700 text-white" @confirm="onCreateOrder"
        @cancel="isConfirmOrder = false">
        <template #icon></template>
        <template #default>
          <n-form ref="modelFormUpdateRef" :model="modelFormConfirm" label-placement="left" :label-width="100">
            <n-form-item path="customer" :label="$t('components.billing.customer')" class="text-left">
              <n-input v-model:value="modelForm.customer"
                :placeholder="$tm(['common.pleaseInput', 'components.billing.customer'])" />
            </n-form-item>
            <n-form-item path="note" :label="$t('common.note')" class="text-left">
              <n-input v-model:value="modelForm.note" type="textarea"
                :placeholder="$tm(['common.pleaseInput', 'common.note'])" :autosize="{ minRows: 3, maxRows: 5 }" />
            </n-form-item>
          </n-form>
          <div class="font-semibold text-blue-500 mb-2">{{ $t('components.billing.confirmOrder') }}</div>
        </template>
      </confirm-modal>
      <confirm-modal :visible="isConfirmPay" :title="$tm(['common.confirm', 'components.billing.payTable'])"
        :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
        confirm-class="bg-blue-500 hover:bg-blue-400 text-white" @confirm="onPayOrder" @cancel="isConfirmPay = false">
        <template #icon></template>
        <template #default>
          <div class="font-semibold text-blue-500 mb-2">{{ $t('components.billing.confirmPay') }}</div>
        </template>
      </confirm-modal>
      <confirm-modal :visible="isConfirmUpdate" :title="$tm(['common.confirm', 'common.update'])"
        :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
        confirm-class="bg-green-600 hover:bg-green-700 text-white" @confirm="onUpdateOrder"
        @cancel="isConfirmUpdate = false">
        <template #icon></template>
        <template #default>
          <n-form ref="modelFormUpdateRef" :model="modelFormConfirm" label-placement="left" :label-width="150">
            <n-form-item :span="1" path="reason"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.note']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelFormConfirm.reason" v-text-format:words
                :placeholder="$tm(['common.pleaseInput', 'common.note'])" />
            </n-form-item>
          </n-form>
          <div class="font-semibold text-green-500 mb-2">{{ $t('components.billing.confirmUpdate') }}</div>
        </template>
      </confirm-modal>
      <confirm-modal :visible="isConfirmCancel" :title="$tm(['common.confirm', 'components.billing.cancelTable'])"
        :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')"
        confirm-class="bg-red-500 hover:bg-red-400 text-white" @confirm="onCancelOrder"
        @cancel="isConfirmCancel = false">
        <template #default>
          <n-form ref="modelFormCancelRef" :model="modelFormConfirm" label-placement="left" :label-width="150">
            <n-form-item :span="1" path="reason"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.options.reason_cancel.title']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelFormConfirm.reason" v-text-format:words
                :placeholder="$tm(['common.pleaseInput', 'components.options.reason_cancel.title'])" />
            </n-form-item>
          </n-form>
          <div class="font-semibold text-red-500 mb-2">{{ $t('components.billing.confirmCancel') }}</div>
        </template>
      </confirm-modal>
    </n-card>
    <LoadingSpinner :visible="loadingStore.isLoading" />
  </n-space>
</template>
