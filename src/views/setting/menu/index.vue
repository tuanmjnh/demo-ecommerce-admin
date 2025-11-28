<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import CopyText from '@/components/custom/CopyText.vue'
import { useBoolean } from '@/hooks'
import { fetchAllRoutes } from '@/services'
import { createIcon } from '@/utils'
import { arrayToTree } from 'tm-libs/array'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import TableModal from './components/TableModal.vue'
import { NaiveUI } from '@/types/global'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

function deleteData(id: number | string) {
  window.$message.success(`Delete menu id:${id}`)
}

const tableModalRef = ref()

const columns: DataTableColumns<AppRoute.RowRoute> = [
  {
    type: 'selection',
    width: 30,
  },
  {
    title: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: 'icon',
    align: 'center',
    key: 'icon',
    width: '6em',
    render: (row) => {
      return row.icon && createIcon(row.icon, { size: 20 })
    },
  },
  {
    title: 'title',
    align: 'center',
    key: 'title',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'path',
    key: 'path',
    render: (row) => {
      return (
        <CopyText value={row.path} />
      )
    },
  },
  {
    title: 'Component path',
    key: 'componentPath',
    ellipsis: {
      tooltip: true,
    },
    render: (row) => {
      return row.componentPath || '-'
    },
  },
  {
    title: 'Sort value',
    key: 'order',
    align: 'center',
    width: '6em',
  },
  {
    title: 'Menu type',
    align: 'center',
    key: 'menuType',
    width: '6em',
    render: (row) => {
      const menuType = row.menuType || 'page'
      const menuTagType: Record<AppRoute.MenuType, NaiveUI.ThemeColor> = {
        dir: 'primary',
        page: 'warning',
      }
      return <NTag type={menuTagType[menuType]}>{menuType}</NTag>
    },
  },
  {
    title: 'operate',
    align: 'center',
    key: 'actions',
    width: '15em',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            onClick={() => tableModalRef.value.openModal('view', row)}
          >
            Check
          </NButton>
          <NButton
            size="small"
            onClick={() => tableModalRef.value.openModal('edit', row)}
          >
            edit
          </NButton>
          <NPopconfirm onPositiveClick={() => deleteData(row.id)}>
            {{
              default: () => 'Confirm Delete',
              trigger: () => <NButton size="small" type="error">delete</NButton>,
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
]

const tableData = ref<AppRoute.RowRoute[]>([])

onMounted(() => {
  getAllRoutes()
})
async function getAllRoutes() {
  startLoading()
  const { data } = await fetchAllRoutes()
  tableData.value = arrayToTree(data)
  endLoading()
}

const checkedRowKeys = ref<number[]>([])
async function handlePositiveClick() {
  window.$message.success(`Batch delete id:${checkedRowKeys.value.join(',')}`)
}
</script>

<template>
  <n-card>
    <template #header>
      <NButton type="primary" @click="tableModalRef.openModal('add')">
        <template #icon>
          <icon-park-outline-add-one />
        </template>
        New
      </NButton>
    </template>

    <template #header-extra>
      <n-flex>
        <NButton type="primary" secondary @click="getAllRoutes">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          refresh
        </NButton>
        <NPopconfirm @positive-click="handlePositiveClick">
          <template #trigger>
            <NButton type="error" secondary>
              <template #icon>
                <icon-park-outline-delete-five />
              </template>
              Batch Deletion
            </NButton>
          </template>
          Are you sure to delete all selected menus?
        </NPopconfirm>
      </n-flex>
    </template>
    <n-data-table v-model:checked-row-keys="checkedRowKeys" :row-key="(row: AppRoute.RowRoute) => row.id"
      :columns="columns" :data="tableData" :loading="loading" size="small" :scroll-x="1200" />
    <TableModal ref="tableModalRef" :all-routes="tableData" modal-name="menu" />
  </n-card>
</template>
