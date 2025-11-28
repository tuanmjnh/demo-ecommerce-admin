<script setup lang="ts">
import { useAppStore, useLoadingStore, useRouteStore } from '@/stores'
import { debounce } from 'lodash'
import { $t, renderLabelCell, renderActionButtons } from '@/utils'
import { NTag } from 'naive-ui'
import CopyText from '@/components/custom/CopyText.vue'
import modalAction from './modalAction.vue'
import modalImport from './modalImport.vue'

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const routeStore = useRouteStore()
const modalActionRef = ref()
const modalImportRef = ref()
const viewType = ref<ViewType>(1)
const items = computed(() => routeStore.getRoutesTree)
const item = ref<Models.RouteItem | null>(null)
const checkedRows = ref<Array<string | number>>([])
const query = ref({
  text: '',
  sortBy: 'sort',
  sortType: 1, //1 ASC, -1 DESC
  flag: 1,
  page: 1
})
const columns = computed<any[]>(() => {
  const baseColumns: any[] = [
    { type: 'selection' },
    {
      title: () => h('span', $t('common.title')),
      key: 'title',
      sortOrder: false,
      sorter: 'default',
      render: (row: any) => renderLabelCell(row, appStore.colorMode)
    },
    {
      title: () => h('span', $t('common.name')),
      key: 'name',
      sortOrder: false,
      sorter: 'default'
    },
    {
      title: () => h('span', $t('common.path')),
      key: 'path',
      sortOrder: false,
      sorter: 'default',
      render: (row: any) => h(CopyText, { value: row.path })
    },

    {
      title: () => h('span', $t('common.type')),
      key: 'type',
      sortOrder: false,
      sorter: 'default',
      render: (row: any) => row.type == 'page' ?
        h(NTag, { type: 'warning' }, { default: () => $t('common.page') }) :
        h(NTag, { type: 'primary' }, { default: () => $t('common.directory') })
    }
  ]

  if (import.meta.env.VITE_ROUTE_LOAD_MODE == 'static') {
    baseColumns.push({
      title: () => h('span', $t('common.action')),
      key: 'action',
      align: 'center',
      width: 80,
      render: (row: any) => renderActionButtons(row, [
        {
          text: $t('common.view'),
          icon: 'icon-park-outline:view-grid-detail',
          type: 'default',
          onClick: (r) => modalActionRef.value.openModal('view', r)
        }
      ])
    })
  } else {
    baseColumns.push({
      title: () => h('span', $t('common.action')),
      key: 'action',
      align: 'center',
      width: 200,
      render: (row: any) => renderActionButtons(row, [
        {
          text: $t('common.view'),
          icon: 'icon-park-outline:view-grid-detail',
          type: 'default',
          onClick: (r) => modalActionRef.value.openModal('view', r)
        },
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
    })
  }
  return baseColumns
})

const onFetch = async (isResetPage?: boolean) => {
  if (isResetPage) query.value.page = 1
  await routeStore.getAll()
}
onMounted(() => { onFetch() })
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
const onOpenModal = (row?: any) => {
  item.value = row ? row : routeStore.getDefaultModel
}
const onCopy = (row: any) => {
  item.value = { ...row, _id: null, key: '', title: `${row.title} - copy`, flag: 0 }
}
const onConfirmFlag = async (row?: any) => {
  let rows = toRaw(checkedRows.value)
  if (row) rows = [row._id]
  const res = await routeStore.updateFlag(rows, viewType.value === 1 ? 0 : 1)
  if (res.status) {
    // await routeStore.removeItems(rows)
    checkedRows.value = []
    window.$message.success($t('message.success.updatedStatus'))
  }
}
</script>

<template>
  <n-space vertical>
    <n-card :title="$t('components.routes.title')">
      <template #header-extra>
        <n-space>
          <n-input v-model:value="query.text" :placeholder="$t('common.searchInput')" @input="onSearch" />
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="primary" text-color="#fff" attr-type="button" block
                @click="modalActionRef.openModal('add', routeStore.getDefaultModel)">
                <nova-icon icon="icon-park-outline:add-one" />
              </n-button>
            </template>
            {{ $t('common.addNew') }}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="success" text-color="#fff" attr-type="button" block @click="modalImportRef.openModal()">
                <nova-icon icon="icon-park-outline:doc-add" />
              </n-button>
            </template>
            {{ $t('common.import') }}
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
      <!-- :scroll-x="1200" -->
      <n-data-table v-model:checked-row-keys="checkedRows" :columns="columns" max-height="calc(100vh - 380px)"
        :loading="loadingStore.isLoading" virtual-scroll :data="items" :bordered="false" :row-key="(row) => row.id"
        @update:sorter="onSorterChange">
        <template #empty>{{ $t('common.noData') }}</template>
      </n-data-table>
    </n-card>
    <modal-action ref="modalActionRef" :data="item" :data-default="routeStore.getDefaultModel" :all-routes="items"
      :title="$t('route.routes')" @on-close="() => item = null" />
    <modal-import ref="modalImportRef" :title="`${$t('common.import')} - ${$t('route.routes')}`" />
  </n-space>
</template>

<style scoped></style>
