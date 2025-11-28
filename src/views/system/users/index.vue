<script setup lang="ts">
import { useAppStore, useLoadingStore, useRoleStore, useGroupStore, useUserStore } from '@/stores'
import { debounce } from 'lodash'
import { $t, renderLabelSelect, renderActionButtons, renderTagsCell } from '@/utils'
import { NSpace } from 'naive-ui'
import modalAction from './modalAction.vue'
import modalChangePwd from './modalChangePwd.vue'

const appStore = useAppStore()
const loadingStore = useLoadingStore()
const roleStore = useRoleStore()
const groupStore = useGroupStore()
const userStore = useUserStore()
const route = useRoute()
const groupType = route.meta.group || 'user'
const query = ref({
  text: '',
  groups: [],
  sortBy: 'created.at',
  sortType: 1, //1 ASC, -1 DESC
  flag: 1,
  page: 1,
  total: 0,
  pages: 0,
  limit: appStore.pageSizes[0],
  pageSizes: appStore.pageSizes.map(x => { return { label: String(x), value: x } })
})
const modalActionRef = ref()
const modalChangePwdRef = ref()
const viewType = ref<ViewType>(1)
const roles = computed(() => roleStore.all)
const groups = computed(() => groupStore.items)
const items = computed(() => userStore.items)
const item = ref<Models.IUser | null>(null)
const checkedRows = ref<Array<string | number>>([])
const columns = ref<any[]>([
  { type: 'selection' },
  {
    title: () => h('span', $t('components.users.username')),
    key: 'username',
    sortOrder: false,
    sorter: 'default'
  },
  {
    title: () => h('span', $t('components.users.fullName')),
    key: 'fullName',
    sortOrder: false,
    sorter: 'default'
  },
  {
    title: () => h('span', $t('components.users.groups')),
    key: 'groups',
    sortOrder: false,
    sorter: 'default',
    render: (row: any) => renderTagsCell(groups.value.filter(x => row.groups.includes(x.code)).map(x => ({ title: x.title, type: (x.type as any) || 'default', color: x.color || undefined })), appStore.colorMode)
  },
  {
    title: () => h('span', $t('components.users.roles')),
    key: 'roles',
    sortOrder: false,
    sorter: 'default',
    render: (row: any) => renderTagsCell(roles.value.filter(x => row.roles.includes(x._id)).map(x => ({ title: x.title, color: x.color || undefined })), appStore.colorMode)
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
        text: viewType.value ? $t('common.delete') : $t('common.recover'),
        icon: viewType.value ? 'icon-park-outline:delete-three' : 'icon-park-outline:recycling',
        type: viewType.value ? 'error' : 'warning',
        confirm: {
          title: viewType.value ? $t('message.confirm.deleteOne') : $t('message.confirm.recoverOne'),
          positiveText: $t('common.confirm'),
          negativeText: $t('common.cancel'),
          onConfirm: (r) => onConfirmFlag(r)
        }
      },
      {
        icon: 'icon-park-outline:more-one',
        text: 'More',
        options: [
          { label: $t('common.copy'), value: 'copy', icon: 'icon-park-outline:copy-one' },
          { label: $t('components.users.changePwd'), value: 'changePwd', icon: 'icon-park-outline:lock-one', color: '#409eff' },
          { label: $t('components.users.resetPwd'), value: 'resetPwd', icon: 'icon-park-outline:refresh', color: '#f56c6c' }
        ],
        onSelect: (r, val) => onSelectAction(r, val)
      }
    ])
  }
])
const onFetch = async (isResetPage?: boolean) => {
  if (isResetPage) query.value.page = 1
  // await userStore.get(query.value)
  await userStore.get(query.value)
}

onMounted(() => {
  // if (!groups.value || !groups.value.length)
  groupStore.filter({ key: groupType, flag: 1 })
  // if (!roles.value || !roles.value.length)
  roleStore.getAll()
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
const onSelectAction = (row: Models.IUser, option: any) => {
  if (option === 'edit') modalActionRef.value.openModal('edit', row)
  else if (option === 'copy') modalActionRef.value.openModal('add', { ...row, _id: null, username: `${row.username} - copy`, fullName: `${row.fullName} - copy`, password: '', flag: 0 })
  else if (option === 'changePwd') modalChangePwdRef.value.openModal('edit', row)
  else if (option === 'resetPwd') onConfirmResetPwd(row)
  else if (option === 'flag') onConfirmFlag(row)
  else return
}
const onConfirmFlag = async (row?: any) => {
  let rows = toRaw(checkedRows.value)
  if (row) rows = [row._id]
  const res = await userStore.updateFlag(rows, viewType.value === 1 ? 0 : 1)
  if (res.status) {
    // await userStore.removeItems(rows)
    checkedRows.value = []
    window.$message.success($t('message.success.updatedStatus'))
  }
}
const onConfirmResetPwd = (row: Models.IUser) => {
  const dialog = window.$dialog.warning({
    title: `${$t('components.users.resetPwd')} - ${row.username}`,
    content: () => $t('message.confirm.resetPwd'),
    maskClosable: false,
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      dialog.loading = true
      userStore.resetPassword(row._id).then(x => {
        if (x.status) window.$message.success($t('message.success.resetPwd', [x.data]), { duration: 6000 })
        else window.$message.error($t(`message.error.${x.statusMessage}`))
      }).then(() => {
        dialog.loading = false
        dialog.destroy()
      })
    }
  })
}
</script>

<template>
  <n-space vertical>
    <n-card :title="$t('components.users.title')">
      <template #header-extra>
        <n-space>
          <n-input v-model:value="query.text" :placeholder="$t('common.searchInput')" @input="onSearch" />
          <n-select :options="groups" value-field="code" label-field="title" :placeholder="$t('common.default')"
            multiple checkable virtual-scroll class="w-280px"
            :render-label="(option: any) => renderLabelSelect(option, appStore.colorMode)"
            @update:value="(v: any, o: any) => { query.groups = v; onFetch(true) }">
            <template #empty>{{ $t('common.noData') }}</template>
          </n-select>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="primary" text-color="#fff" attr-type="button" block
                @click="modalActionRef.openModal('add', userStore.getDefaultModel)">
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
    <modal-action ref="modalActionRef" :data="item" :roles="roles" :groups="groups"
      :data-default="userStore.getDefaultModel" :title="$t('route.users')" @on-close="() => item = null" />
    <modalChangePwd ref="modalChangePwdRef" :title="$t('components.users.changePwd')" />
  </n-space>
</template>

<style scoped></style>
