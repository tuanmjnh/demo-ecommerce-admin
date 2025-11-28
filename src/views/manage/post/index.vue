<script setup lang="ts">
import { useAppStore, useLoadingStore, useGroupStore, usePostStore } from '@/stores'
import { debounce } from 'lodash'
import { $t, renderLabelSelect, renderActionButtons, renderTooltipCell, renderTagsPreviewTooltip } from '@/utils'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const groupStore = useGroupStore()
const postStore = usePostStore()
const router = useRouter()
const route = useRoute()
const groupType = route.meta.group || 'post'
const query = ref({
  text: '',
  key: groupType,
  groups: [],
  sort: '-createdAt',
  sortBy: 'created.at',
  sortType: -1, //1 ASC, -1 DESC
  flag: 1,
  page: 1,
  total: 0,
  pages: 0,
  limit: appStore.pageSizes[0],
  pageSizes: appStore.pageSizes.map(x => { return { label: String(x), value: x } })
})
const viewType = ref<ViewType>(1)
const groups = computed(() => groupStore.getTreeGroups)
const items = computed(() => postStore.items)
const checkedRows = ref<Array<string | number>>([])
const columns = ref<any[]>([
  { type: 'selection' },
  {
    title: () => h('span', $t('common.title')),
    key: 'title',
    sortOrder: false,
    sorter: 'default',
    render: (row: any) => renderTooltipCell(row.title)
  },
  {
    title: () => h('span', $t('common.desc')),
    key: 'desc',
    sortOrder: false,
    render: (row: any) => renderTooltipCell(row.desc)
  },
  {
    title: () => h('span', $t('common.group')),
    key: 'groups',
    sortOrder: false,
    sorter: 'default',
    width: 200,
    render: (row: any) => renderTagsPreviewTooltip({
      tags: groupStore.items.filter(x => row.groups.includes(x._id)).map(x => { return { ...x, type: 'default' } })
    })
  },
  // {
  //   title: () => h('span', $t('common.key')),
  //   key: 'key',
  //   sortOrder: false,
  //   sorter: 'default'
  // },
  // {
  //   title: () => h('span', $t('common.code')),
  //   key: 'code',
  //   sortOrder: false,
  //   sorter: 'default'
  // },
  // {
  //   title: () => h('span', $t('common.sort')),
  //   key: 'sort',
  //   sortOrder: false,
  //   sorter: 'default'
  // },
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
        onClick: (r) => onEdit(r) //modalActionRef.value.openModal('edit', r)
      },
      {
        text: $t('common.copy'),
        icon: 'icon-park-outline:copy-one',
        type: 'info',
        onClick: (r) => onCopy(r)// modalActionRef.value.openModal('add', { ...r, _id: null, code: null, title: `${r.title} - copy`, flag: 0 })
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
const onAdd = async () => {
  postStore.setItem()
  router.push(`add`)
}
const onEdit = async (item: Models.IPost) => {
  postStore.setItem(item)
  router.push(`edit/${item._id}`)
}
const onCopy = async (item: Models.IPost) => {
  postStore.copyItem(item)
  router.push(`add`)
}
const onFetch = async (isResetPage?: boolean) => {
  if (isResetPage) query.value.page = 1
  await postStore.getItems(query.value)
}
onMounted(() => {
  onFetch()
  groupStore.filter({ key: groupType, flag: 1 })
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
  const res = await postStore.updateFlag(rows, viewType.value === 1 ? 0 : 1)
  if (res.status) {
    checkedRows.value = []
    window.$message.success($t('message.success.updatedStatus'))
  }
}
</script>

<template>
  <n-space vertical>
    <n-card :title="$t('components.post.title')">
      <template #header-extra>
        <n-space>
          <n-input v-model:value="query.text" :placeholder="$t('common.searchInput')" @input="onSearch" />
          <n-tree-select :options="(groups as any)" key-field="_id" label-field="title"
            :placeholder="$t('common.default')" multiple checkable virtual-scroll check-strategy="all" class="w-380px"
            :render-label="({ option }: any) => renderLabelSelect(option, appStore.colorMode)"
            @update:value="(v: any, o: any) => { query.groups = v; onFetch(true) }">
            <template #empty>{{ $t('common.noData') }}</template>
          </n-tree-select>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
                @click="onAdd">
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
            :options="[{ label: $t('common.public'), value: 1 }, { label: $t('common.private'), value: 0 }]">
            <template #empty> {{ $t('common.noData') }}</template>
            <n-button quaternary attr-type="button" block>
              <nova-icon icon="icon-park-outline:more-one" />
            </n-button>
          </n-popselect>
        </n-space>
      </template>
      <n-data-table v-model:checked-row-keys="checkedRows" :columns="columns" max-height="calc(100vh - 400px)"
        :loading="loadingStore.isLoading" virtual-scroll :data="items" :bordered="false" :row-key="(row) => row._id"
        @update:sorter="onSorterChange">
        <template #empty>{{ $t('common.noData') }}</template>
      </n-data-table>
      <div class="flex flex-row-reverse mt-3">
        <n-pagination v-model:page="query.page" v-model:page-size="query.limit" :page-count="query.pages"
          show-size-picker :page-sizes="query.pageSizes" @update:page="(val) => { query.page = val; onFetch() }"
          @update:page-size="(val) => { query.limit = val; query.page = 1; onFetch() }" />
      </div>
    </n-card>
    <!-- <modal-action ref="modalActionRef" :data="item" :data-default="postStore.getDefaultModel" :title="$t('route.post')"
      :groups="groups" @on-close="() => item = null" /> -->
  </n-space>
</template>

<style scoped></style>
