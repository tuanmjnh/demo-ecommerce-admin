<script setup lang="ts">
import type { FormItemRule } from 'naive-ui'
import HelpInfo from '@/components/common/HelpInfo.vue'
import { Regex } from '@/constants'
import { useBoolean } from '@/hooks'
import { fetchRoleList } from '@/services'

interface Props {
  modalName?: string
  allRoutes: AppRoute.RowRoute[]
}

const {
  modalName = '',
  allRoutes,
} = defineProps<Props>()

const emit = defineEmits<{
  open: []
  close: []
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)
const { bool: submitLoading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const formDefault: AppRoute.RowRoute = {
  name: '',
  path: '',
  id: -1,
  pid: null,
  title: '',
  requiresAuth: true,
  keepAlive: false,
  hide: false,
  withoutTab: true,
  pinTab: false,
  menuType: 'page',
}
const formModel = ref<AppRoute.RowRoute>({ ...formDefault })

type ModalType = 'add' | 'view' | 'edit'
const modalType = shallowRef<ModalType>('add')
const modalTitle = computed(() => {
  const titleMap: Record<ModalType, string> = {
    add: 'Add',
    view: 'View',
    edit: 'Edit',
  }
  return `${titleMap[modalType.value]}${modalName}`
})

async function openModal(type: ModalType = 'add', data: AppRoute.RowRoute) {
  emit('open')
  modalType.value = type
  getRoleList()
  showModal()
  const handlers = {
    async add() {
      formModel.value = { ...formDefault }
    },
    async view() {
      if (!data)
        return
      formModel.value = { ...data }
    },
    async edit() {
      if (!data)
        return
      formModel.value = { ...data }
    },
  }
  await handlers[type]()
}

function closeModal() {
  hiddenModal()
  endLoading()
  emit('close')
}

defineExpose({
  openModal,
})

const formRef = ref()
async function submitModal() {
  const handlers = {
    async add() {
      return new Promise((resolve) => {
        setTimeout(() => {
          window.$message.success('Simulate the addition successfully')
          resolve(true)
        }, 2000)
      })
    },
    async edit() {
      return new Promise((resolve) => {
        setTimeout(() => {
          window.$message.success('Simulation editing successful')
          resolve(true)
        }, 2000)
      })
    },
    async view() {
      return true
    },
  }
  await formRef.value?.validate()
  startLoading()
  await handlers[modalType.value]() && closeModal()
}

const dirTreeOptions = computed(() => {
  return filterDirectory(JSON.parse(JSON.stringify(allRoutes)))
})

function filterDirectory(node: any[]) {
  return node.filter((item) => {
    if (item.children) {
      const childDir = filterDirectory(item.children)
      if (childDir.length > 0)
        item.children = childDir
      else
        Reflect.deleteProperty(item, 'children')
    }

    return (item.menuType === 'dir')
  })
}

const rules = {
  name: {
    required: true,
    // message: 'Please enter the menu name',
    validator(rule: FormItemRule, value: string) {
      if (!value)
        return new Error('Please enter the menu name')

      if (!new RegExp(Regex.RouteName).test(value))
        return new Error('Menu can only contain alphanumeric characters_!@#$%^&*~-')

      return true
    },
    trigger: 'blur',
  },
  path: {
    required: true,
    message: 'Please enter the menu path',
    trigger: 'blur',
  },
  componentPath: {
    required: true,
    message: 'Please enter the component path',
    trigger: 'blur',
  },
  title: {
    required: true,
    message: 'Please enter the menu title',
    trigger: 'blur',
  },
}

const options = ref()
async function getRoleList() {
  const { data } = await fetchRoleList()
  options.value = data
}
</script>

<template>
  <n-modal v-model:show="modalVisible" :mask-closable="false" preset="card" :title="modalTitle" class="w-700px"
    :segmented="{
      content: true,
      action: true,
    }">
    <n-form ref="formRef" :rules="rules" label-placement="left" :label-width="100" :model="formModel"
      :disabled="modalType === 'view'">
      <n-grid :cols="2" :x-gap="18">
        <n-form-item-grid-item :span="2" path="pid">
          <template #label>
            Parent Directory
            <HelpInfo message="If left blank, it will be the top level menu." />
          </template>
          <n-tree-select v-model:value="formModel.pid" filterable clearable :options="dirTreeOptions" key-field="id"
            label-field="title" children-field="children" placeholder="Please select the parent directory" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="Menu Name" path="name">
          <n-input v-model:value="formModel.name" placeholder="Eg: system" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="title" path="title">
          <n-input v-model:value="formModel.title" placeholder="Eg: My-System" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="2" label="Routing Path" path="path">
          <n-input v-model:value="formModel.path" placeholder="Eg: /system/user" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="Menu Type" path="menuType">
          <n-radio-group v-model:value="formModel.menuType" name="radiogroup">
            <n-space>
              <n-radio value="dir">
                Table of contents
              </n-radio>
              <n-radio value="page">
                page
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="icon" path="icon">
          <icon-select v-model:value="formModel.icon" :disabled="modalType === 'view'" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="formModel.menuType === 'page'" :span="2" label="Component Path"
          path="componentPath">
          <n-input v-model:value="formModel.componentPath" placeholder="Eg: /system/user/index.vue" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" path="order">
          <template #label>
            Menu Sorting
            <HelpInfo message="The smaller the number, the higher the ranking." />
          </template>
          <n-input-number v-model:value="formModel.order" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="formModel.menuType === 'page'" :span="1" path="href">
          <template #label>
            External links
            <HelpInfo
              message="After filling in, click the menu to jump to the address, and fill in the component path arbitrarily" />
          </template>
          <n-input v-model:value="formModel.href" placeholder="Eg: https://example.com" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="Login access" path="requiresAuth">
          <n-switch v-model:value="formModel.requiresAuth" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="formModel.menuType === 'page'" :span="1" label="Page Cache" path="keepAlive">
          <n-switch v-model:value="formModel.keepAlive" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="formModel.menuType === 'page'" :span="1" label="Tab bar visible" path="withoutTab">
          <n-switch v-model:value="formModel.withoutTab" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="formModel.menuType === 'page'" :span="1" label="Permanent tab bar" path="pinTab">
          <n-switch v-model:value="formModel.pinTab" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="Hide side menu" path="hide">
          <n-switch v-model:value="formModel.hide" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="formModel.menuType === 'page' && formModel.hide" :span="2" path="activeMenu">
          <template #label>
            Highlight Menu
            <HelpInfo
              message="The current route is not displayed in the left menu, but a menu needs to be highlighted" />
          </template>
          <n-input v-model:value="formModel.activeMenu" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="2" path="roles">
          <template #label>
            Access Roles
            <HelpInfo message="If this is not filled in, all roles can access it." />
          </template>
          <n-select v-model:value="formModel.roles" multiple filterable label-field="role" value-field="id"
            :options="options" />
        </n-form-item-grid-item>
      </n-grid>
    </n-form>
    <template v-if="modalType !== 'view'" #action>
      <n-space justify="center">
        <n-button @click="closeModal">
          Cancel
        </n-button>
        <n-button type="primary" :loading="submitLoading" @click="submitModal">
          submit
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped></style>
