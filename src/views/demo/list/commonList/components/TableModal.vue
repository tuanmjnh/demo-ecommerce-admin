<script setup lang="ts">
interface Props {
  visible: boolean
  type?: ModalType
  modalData?: any
}
const {
  visible,
  type = 'add',
  modalData = null,
} = defineProps<Props>()

const emit = defineEmits<Emits>()
const defaultFormModal: Entity.User = {
  userName: '',
  gender: 0,
  email: '',
  role: [],
}
const formModel = ref({ ...defaultFormModal })

interface Emits {
  (e: 'update:visible', visible: boolean): void
}

const modalVisible = computed({
  get() {
    return visible
  },
  set(visible) {
    closeModal(visible)
  },
})
function closeModal(visible = false) {
  emit('update:visible', visible)
}
type ModalType = 'add' | 'edit'
const title = computed(() => {
  const titles: Record<ModalType, string> = {
    add: 'Add user',
    edit: 'Edit user',
  }
  return titles[type]
})

function UpdateFormModelByModalType() {
  const handlers = {
    add: () => {
      formModel.value = { ...defaultFormModal }
    },
    edit: () => {
      if (modalData)
        formModel.value = { ...modalData }
    },
  }
  handlers[type]()
}
watch(
  () => visible,
  (newValue) => {
    if (newValue)
      UpdateFormModelByModalType()
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalVisible" :mask-closable="false" preset="card" :title="title" class="w-700px" :segmented="{
      content: true,
      action: true,
    }"
  >
    <n-form label-placement="left" :model="formModel" label-align="left" :label-width="80">
      <n-grid :cols="24" :x-gap="18">
        <n-form-item-grid-item :span="12" label="Username" path="name">
          <n-input v-model:value="formModel.userName" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="Age" path="age">
          <n-input-number v-model:value="formModel.gender" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="Gender" path="gender">
          <n-radio-group v-model:value="formModel.gender">
            <n-space>
              <n-radio :value="1">
                Male
              </n-radio>
              <n-radio :value="0">
                Female
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="12" label="Mail" path="email">
          <n-input v-model:value="formModel.email" />
        </n-form-item-grid-item>
      </n-grid>
    </n-form>
    <template #action>
      <n-space justify="center">
        <n-button @click="closeModal()">
          Cancel
        </n-button>
        <n-button type="primary">
          Submit
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped></style>
