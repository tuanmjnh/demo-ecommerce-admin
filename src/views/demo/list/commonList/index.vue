<script setup lang="tsx">
import type { DataTableColumns, FormInst } from 'naive-ui'
import { Gender } from '@/constants'
import { useBoolean } from '@/hooks'
import { fetchUserPage } from '@/services'
import { NButton, NPopconfirm, NSpace, NSwitch, NTag } from 'naive-ui'
import TableModal from './components/TableModal.vue'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)
const { bool: visible, setTrue: openModal } = useBoolean(false)

const initialModel = {
  condition_1: '',
  condition_2: '',
  condition_3: '',
  condition_4: '',
}
const model = ref({ ...initialModel })

const formRef = ref<FormInst | null>()
function sendMail(id?: number) {
  window.$message.success(`Deleting a user id:${id}`)
}
const columns: DataTableColumns<Entity.User> = [
  {
    title: 'First name',
    align: 'center',
    key: 'userName',
  },
  {
    title: 'Age',
    align: 'center',
    key: 'age',
  },
  {
    title: 'Gender',
    align: 'center',
    key: 'gender',
    render: (rowData) => {
      const tagType = {
        0: 'primary',
        1: 'success',
      } as const
      if (rowData.gender !== undefined && rowData.gender !== null) {
        return (
          <NTag type={tagType[rowData.gender]}>
            {Gender[rowData.gender]}
          </NTag>
        )
      }
      return null
    },
  },
  {
    title: 'Email',
    align: 'center',
    key: 'email',
  },
  {
    title: 'Status',
    align: 'center',
    key: 'status',
    render: (row) => {
      return (
        <NSwitch
          value={row.status}
          checked-value={1}
          unchecked-value={0}
          onUpdateValue={(value: 0 | 1) =>
            handleUpdateDisabled(value, row.id!)}
        >
          {{ checked: () => 'Enable', unchecked: () => 'Disable' }}
        </NSwitch>
      )
    },
  },
  {
    title: 'Operation',
    align: 'center',
    key: 'actions',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton size="small" onClick={() => handleEditTable(row)}>
            Edit
          </NButton>
          <NPopconfirm onPositiveClick={() => sendMail(row.id)}>
            {{
              default: () => 'Confirm Delete',
              trigger: () => <NButton size="small">Delete</NButton>,
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
]

const listData = ref<Entity.User[]>([])
function handleUpdateDisabled(value: 0 | 1, id: number) {
  const index = listData.value.findIndex(item => item.id === id)
  if (index > -1)
    listData.value[index].status = value
}

onMounted(() => {
  getUserList()
})
async function getUserList() {
  startLoading()
  await fetchUserPage().then((res: any) => {
    listData.value = res.data.list
    endLoading()
  })
}
function changePage(page: number, size: number) {
  window.$message.success(`Pager:${page},${size}`)
}
function handleResetSearch() {
  model.value = { ...initialModel }
}

type ModalType = 'add' | 'edit'
const modalType = ref<ModalType>('add')
function setModalType(type: ModalType) {
  modalType.value = type
}

const editData = ref<Entity.User | null>(null)
function setEditData(data: Entity.User | null) {
  editData.value = data
}

function handleEditTable(row: Entity.User) {
  setEditData(row)
  setModalType('edit')
  openModal()
}
function handleAddTable() {
  openModal()
  setModalType('add')
}
</script>

<template>
  <NSpace vertical size="large">
    <n-card>
      <n-form ref="formRef" :model="model" label-placement="left" inline :show-feedback="false">
        <n-flex>
          <n-form-item label="Name" path="condition_1">
            <n-input v-model:value="model.condition_1" placeholder="Please enter" />
          </n-form-item>
          <n-form-item label="Age" path="condition_2">
            <n-input v-model:value="model.condition_2" placeholder="Please enter" />
          </n-form-item>
          <n-form-item label="Gender" path="condition_3">
            <n-input v-model:value="model.condition_3" placeholder="Please enter" />
          </n-form-item>
          <n-form-item label="Address" path="condition_4">
            <n-input v-model:value="model.condition_4" placeholder="Please enter" />
          </n-form-item>
          <n-flex class="ml-auto">
            <NButton type="primary" @click="getUserList">
              <template #icon>
                <icon-park-outline-search />
              </template>
              Search
            </NButton>
            <NButton strong secondary @click="handleResetSearch">
              <template #icon>
                <icon-park-outline-redo />
              </template>
              Reset
            </NButton>
          </n-flex>
        </n-flex>
      </n-form>
    </n-card>
    <n-card>
      <NSpace vertical size="large">
        <div class="flex gap-4">
          <NButton type="primary" @click="handleAddTable">
            <template #icon>
              <icon-park-outline-add-one />
            </template>
            New
          </NButton>
          <NButton strong secondary>
            <template #icon>
              <icon-park-outline-afferent />
            </template>
            Batch Import
          </NButton>
          <NButton strong secondary class="ml-a">
            <template #icon>
              <icon-park-outline-download />
            </template>
            Download
          </NButton>
        </div>
        <n-data-table :columns="columns" :data="listData" :loading="loading" />
        <Pagination :count="100" @change="changePage" />
        <TableModal v-model:visible="visible" :type="modalType" :modal-data="editData" />
      </NSpace>
    </n-card>
  </NSpace>
</template>
