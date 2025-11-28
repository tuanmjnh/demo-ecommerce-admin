<script setup lang="ts">
import { useAppStore, useLoadingStore, useUserStore } from '@/stores'
import { useBoolean } from '@/hooks'
import { debounce } from 'lodash'
import { toUpperCaseFirst, viToAscii } from 'tm-libs/string'
import { $t, $tm, renderLabelSelect } from '@/utils'
const appStore = useAppStore()
const loadingStore = useLoadingStore()
const userStore = useUserStore()
const {
  title = 'Modal',
  data = null,
  dataDefault = null,
  roles = [],
  groups = []
} = defineProps<{
  title?: string
  data?: Models.IUser | null
  dataDefault: Models.IUser | null
  roles: any[] //Models.IRole[]
  groups: any[] //Models.IGroup[]
}>()
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'onOpen'): void
  (e: 'onClose'): void
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const modalType = shallowRef<ModalType>('add')
const modelForm = ref({ ...data })
const modelFormRef = ref()

const onReset = () => {
  modelForm.value = { ...data }
  modelFormRef?.value?.restoreValidation()
  if (modalType.value === 'add') modelForm.value = { ...dataDefault }
  // if (modelForm.value._id) modalType.value = 'edit'
  // else modalType.value = 'add'
}
// watch(modalVisible, n => { onReset() }, { deep: true, immediate: true })
async function openModal(type: ModalType = 'add', data: Models.IUser) {
  emit('onOpen')
  modalType.value = type
  showModal()
  const handlers = {
    async add() {
      modelForm.value = { ...data }
    },
    async view() {
      if (!data) return
      modelForm.value = { ...data }
    },
    async edit() {
      if (!data) return
      modelForm.value = { ...data }
    },
  } as any
  await handlers[type]()
}

const closeModal = () => {
  hiddenModal()
  emit('onClose')
}

defineExpose({ openModal })

watch(() => modelForm.value.username, debounce(async (n) => {
  if (!n) return
  modelForm.value.username = viToAscii(n).toLowerCase()
}, 600))

const onSubmit = () => {
  modelFormRef?.value?.validate((errors: any) => {
    if (!errors) {
      try {
        if (modalType.value == 'add') {
          userStore.create(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.createdNew'))
              onReset()
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        } else {
          userStore.update(JSON.parse(JSON.stringify(modelForm.value))).then(x => {
            if (x.status) {
              window.$message.success($t('message.success.updated'))
              closeModal()
            }
            else window.$message.error($t(`message.error.${x.statusMessage}`))
          })
        }
      } catch (e) {
        window.$message.error(String(e))
      }
    }
  })
}
</script>

<template>
  <n-modal v-model:show="modalVisible" :mask-closable="false" :closable="false" preset="card" class="w-900px"
    :title="`${toUpperCaseFirst(modalType)} - ${title}`" :segmented="{ content: true, action: true }">
    <template #header-extra>
      <n-space>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button type="primary" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
              @click="onSubmit">
              <nova-icon icon="icon-park-outline:save-one" />
            </n-button>
          </template>
          {{ $t('common.save') }}
        </n-tooltip>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button type="tertiary" attr-type="button" block :disabled="loadingStore.isLoading" @click="closeModal">
              <nova-icon icon="icon-park-outline:close" />
            </n-button>
          </template>
          {{ $t('common.close') }}
        </n-tooltip>
      </n-space>
    </template>
    <n-scrollbar style="max-height: calc(100vh - 160px)" trigger="none" class="pr-3">
      <n-form ref="modelFormRef" label-placement="left" :model="modelForm" :label-width="150">
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi :span="1" :label="$t('components.users.username')" path="username" :rule="[
            { required: true, message: $tm(['common.pleaseInput', 'components.users.username']), trigger: ['blur', 'change', 'input'] },
            {
              asyncValidator: async (r, v) => {
                if (await userStore.exist({ filter: { username: v }, id: modelForm._id })) throw new Error($t('message.error.existCode'))
              }, trigger: ['blur']
            }]">
            <n-input v-model:value="modelForm.username" v-text-format:lower
              :placeholder="$tm(['common.pleaseInput', 'components.users.username'])" />
          </n-form-item-gi>
          <n-form-item-gi v-if="modalType === 'add'" :span="1" :label="$t('components.users.password')" path="password"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.users.password']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.password"
              :placeholder="$tm(['common.pleaseInput', 'components.users.password'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.fullName')" path="fullName"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.users.fullName']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.fullName" v-text-format:words
              :placeholder="$tm(['common.pleaseInput', 'components.users.fullName'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.groups')" path="groups"
            :rule="[{ type: 'array', required: true, message: $tm(['common.pleaseInput', 'components.users.groups']), trigger: ['blur', 'change', 'input'] }]">
            <n-select v-model:value="modelForm.groups" :options="groups" clearable filterable multiple
              value-field="code" :placeholder="$tm(['common.pleaseSelect', 'components.users.groups'])"
              :render-label="(option: any) => renderLabelSelect(option, appStore.colorMode)">
              <template #empty>{{ $t('common.noData') }}</template>
            </n-select>
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.roles')" path="roles"
            :rule="[{ type: 'array', required: true, message: $tm(['common.pleaseInput', 'components.users.roles']), trigger: ['blur', 'change', 'input'] }]">
            <n-select v-model:value="modelForm.roles" :options="roles" clearable filterable multiple value-field="_id"
              :placeholder="$tm(['common.pleaseSelect', 'components.users.roles'])"
              :render-label="(option: any) => renderLabelSelect(option, appStore.colorMode)">
              <template #empty>{{ $t('common.noData') }}</template>
            </n-select>
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.email')" path="email"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'components.users.email']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.email"
              :placeholder="$tm(['common.pleaseInput', 'components.users.email'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.dateBirth')" path="dateBirth">
            <n-date-picker v-model:value="modelForm.dateBirth" type="date" format="dd-MM-yyyy" input-readonly
              :placeholder="$tm(['common.pleaseSelect', 'components.users.dateBirth'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.phone')" path="phone">
            <n-input v-model:value="modelForm.phone"
              :placeholder="$tm(['common.pleaseInput', 'components.users.phone'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.personNumber')" path="personNumber">
            <n-input v-model:value="modelForm.personNumber"
              :placeholder="$tm(['common.pleaseInput', 'components.users.personNumber'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('components.users.address')" path="address">
            <n-input v-model:value="modelForm.address" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'components.users.address'])" />
          </n-form-item-gi>
          <n-form-item-gi :span="2" :label="$t('common.about')" path="about">
            <n-input v-model:value="modelForm.about" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.about'])" type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }" />
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('components.users.verify')" path="verified">
            <n-switch v-model:value="modelForm.verified">
              <!-- <template #checked>
                {{ $t('common.display') }}
              </template>
              <template #unchecked>
                {{ $t('common.hidden') }}
              </template> -->
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi :span="1" :label="$t('common.status')" path="flag">
            <n-switch v-model:value="modelForm.flag" :default-value="1" :checked-value="1" :unchecked-value="0">
              <template #checked>
                {{ $t('common.display') }}
              </template>
              <template #unchecked>
                {{ $t('common.hidden') }}
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi v-if="modalType == 'edit'" :span="2" :label="$t('common.created')">
            <span v-if="modelForm.created && modelForm.created.at" class="mr-2">
              {{ appStore.formatDateTime(modelForm.created.at) }}
            </span>
            <span v-else class="mr-2 color-sky-300 italic">{{ $t('common.updating') }}</span>
            <span v-if="modelForm.created?.by">-</span>
            <span v-if="modelForm.created?.by" class="ml-2">{{ modelForm.created?.by }}</span>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-scrollbar>
  </n-modal>
</template>

<style scoped></style>
