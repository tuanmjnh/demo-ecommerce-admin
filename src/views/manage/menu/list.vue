<script setup lang="ts">
import { useAppStore, useLoadingStore, useMenuStore } from '@/stores'
import { debounce } from 'lodash'
import { $t, renderLabelCell, renderActionButtons } from '@/utils'
import modalAction from './modalAction.vue'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const menuStore = useMenuStore()

const query = ref({
  text: '',
  type: '',
  sortBy: 'sort',
  sortType: 1, //1 ASC, -1 DESC
  flag: 1,
  page: 1,
  total: 0,
  pages: 0,//Math.ceil(rowsCount / pageSize)
  limit: 0,//appStore.pageSizes[0],
  pageSizes: appStore.pageSizes.map(x => { return { label: String(x), value: x } })
})
const modalActionRef = ref()
const viewType = ref<ViewType>(1)
const items = computed(() => menuStore.getTreeMenus)
const item = ref<Models.IMenu | null>(null)
const checkedRows = ref<Array<string | number>>([])
const columns = ref<any[]>([
  { type: 'selection' },
  {
    title: () => h('span', $t('common.title')),
    key: 'title',
    sortOrder: false,
    sorter: 'default',
    render: (row: any) => renderLabelCell(row, appStore.colorMode)
  },
  {
    title: () => h('span', $t('common.code')),
    key: 'code',
    width: 200,
    sortOrder: false,
    sorter: 'default'
  },
  {
    title: () => h('span', $t('common.level')),
    key: 'level',
    width: 100,
    sortOrder: false,
    sorter: 'default'
  },
  {
    title: () => h('span', $t('common.sort')),
    key: 'sort',
    width: 100,
    sortOrder: false,
    sorter: 'default'
  },
  {
    title: () => h('span', $t('common.action')),
    key: 'action',
    align: 'center',
    width: 150,
    render: (row: any) => renderActionButtons(row, [
      {
        text: $t('common.edit'),
        icon: 'icon-park-outline:edit',
        type: 'success',
        onClick: (r) => modalActionRef.value.openModal('edit', r)
      },
      {
        text: $t('common.copy'),
        icon: 'icon-park-outline:copy-one',
        type: 'info',
        onClick: (r) => modalActionRef.value.openModal('add', { ...r, _id: null, code: null, title: `${r.title} - copy`, flag: 0 })
      },
      {
        text: viewType.value ? $t('common.delete') : $t('common.recover'),
        icon: viewType.value ? 'icon-park-outline:delete-three' : 'icon-park-outline:recycling',
        type: viewType.value ? 'error' : 'warning',
        confirm: {
          title: viewType.value ? $t('message.confirm.deleteOne') : $t('message.confirm.recoverOne'),
          positiveText: $t('common.confirm'),
          negativeText: $t('common.cancel'),
          onConfirm: (r) => onConfirmFlag(r)
        }
      }
    ])
  }
])
const onFetch = async (isResetPage?: boolean) => {
  if (isResetPage) query.value.page = 1
  await menuStore.filter(query.value)
}
onMounted(() => {
  onFetch()
})
const onSearch = debounce((text?: string) => { onFetch(true) }, 600)
const onSorterChange = (sorter: any) => {
  columns.value.forEach((column: any) => {
    /** column.sortOrder !== undefined means it is uncontrolled */
    if (column.sortOrder === undefined)
      return
    if (!sorter) {
      column.sortOrder = false
      return
    }
    if (column.key === sorter.columnKey) {
      column.sortOrder = sorter.order
      query.value.sortBy = column.key
      query.value.sortType = column.sortOrder == 'descend' ? -1 : 1
    }
    else column.sortOrder = false
  })
}
const onViewType = (val: any) => {
  query.value.flag = val
  checkedRows.value = []
  onFetch(true)
}
const onConfirmFlag = async (row?: any) => {
  let rows = toRaw(checkedRows.value)
  if (row) rows = [row._id]
  const res = await menuStore.updateFlag(rows, viewType.value === 1 ? 0 : 1)
  if (res.status) {
    checkedRows.value = []
    window.$message.success($t('message.success.updatedStatus'))
  }
}
</script>

<template>
  <n-space vertical>
    <n-card :title="$t('components.menu.title')">
      <template #header-extra>
        <n-space>
          <n-input v-model:value="query.text" :placeholder="$t('common.searchInput')" @input="onSearch" />
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="primary" text-color="#fff" attr-type="button" block
                @click="modalActionRef.openModal('add', { ...menuStore.getDefaultModel })">
                <nova-icon icon="icon-park-outline:add-one" />
              </n-button>
            </template>
            {{ $t('common.addNew') }}
          </n-tooltip>
          <n-tooltip v-if="checkedRows && checkedRows.length" trigger="hover">
            <template #trigger>
              <n-popconfirm :negative-text="$t('common.cancel')" :positive-text="$t('common.confirm')"
                @positive-click="onConfirmFlag()">
                <template #trigger>
                  <n-button v-if="viewType" type="error" text-color="#fff" attr-type="button" block>
                    <nova-icon icon="icon-park-outline:delete-themes" />
                  </n-button>
                  <n-button v-else type="warning" text-color="#fff" attr-type="button" block>
                    <nova-icon icon="icon-park-outline:recycling" />
                  </n-button>
                </template>
                {{ viewType ? $t('message.confirm.deleteSelected') : $t('message.confirm.recoverSelected') }}
              </n-popconfirm>
            </template>
            {{ viewType ? $t('common.deleteSelected') : $t('common.recoverSelected') }}
          </n-tooltip>
          <n-popselect v-model:value="viewType" @update:value="onViewType"
            :options="[{ label: $t('common.display'), value: 1 }, { label: $t('common.hidden'), value: 0 }]">
            <template #empty> {{ $t('common.noData') }}</template>
            <n-button quaternary attr-type="button" block>
              <nova-icon icon="icon-park-outline:more-one" />
            </n-button>
          </n-popselect>
        </n-space>
      </template>
      <n-data-table v-model:checked-row-keys="checkedRows" :columns="columns" max-height="calc(100vh - 380px)"
        class="cell-inline" :loading="loadingStore.isLoading" virtual-scroll :data="items" :bordered="false"
        :row-key="(row) => row._id" @update:sorter="onSorterChange">
        <template #empty>{{ $t('common.noData') }}</template>
      </n-data-table>
      <!-- <div class="flex flex-row-reverse mt-3">
        <n-pagination v-model:page="query.page" v-model:page-size="query.limit" :page-count="query.pages"
          show-size-picker :page-sizes="query.pageSizes" @update:page="(val) => { query.page = val; onFetch() }"
          @update:page-size="(val) => { query.limit = val; query.page = 1; onFetch() }" />
      </div> -->
    </n-card>
    <modal-action ref="modalActionRef" :data="item" :data-default="menuStore.getDefaultModel"
      :title="$t('route.groupsUser')" @on-close="() => item = null" />
  </n-space>
</template>

<style scoped></style>
