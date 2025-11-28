<script setup lang="ts">
import { useLoadingStore, useOptionsStore, useMenuStore, useGroupStore, usePostStore, useProductStore } from '@/stores'
import { debounce } from 'lodash'
import { $t, $tm } from '@/utils'

const loadingStore = useLoadingStore()
const optionsStore = useOptionsStore()
const groupStore = useGroupStore()
const postStore = usePostStore()
const productStore = useProductStore()
const menuStore = useMenuStore()

const expandedKeys = ref([])
const selectedKeys = ref([])

// Mode: "create" | "edit"
const mode = ref<'create' | 'edit'>('create')

// selected for edit
const selected = ref(null)

// new model for creation
const formRef = ref()
const modelForm = ref<Models.IMenu>(JSON.parse(JSON.stringify(menuStore.getDefaultModel)))

// preview URL
const previewUrl = ref('')
const previewUrlCreate = ref('')

// bulk reorder
const bulkChanges = ref([])

const query = ref({
  text: ''
})
// options
const menuTypeKey = 'menu_type'
const menuTypeOptions = computed(() => optionsStore.getFilterByKey({ key: menuTypeKey, flag: 1 }))
// type items
const typeItemsTab = ref<'latest' | 'all'>('latest')
const typeItemsSelected = ref()
const itemSelected = ref(null)
const typeItems = ref([])

const loadTypeItems = async (type: Common.MenuType) => {
  typeItemsSelected.value = []
  typeItems.value = []
  modelForm.value.url = ''
  if (type == 'PAGE' || type == 'POST') {
    const res = await postStore.getItems({ key: type.toLowerCase(), flag: 1, page: 1, limit: 15, sortBy: 'createdAt', sortType: -1 })
    typeItems.value = res.data.items
    // console.log(typeItems.value)
    // console.log('PAGE')
  } else if (type == 'PRODUCT') {
    const res = await productStore.getItems({ key: type.toLowerCase(), flag: 1, page: 1, limit: 15, sortBy: 'created.at', sortType: -1 })
    typeItems.value = res.data.items
  } else if (type == 'CATEGORY') {
    const res = await groupStore.getFilter({ flag: 1, page: 1, limit: 15, sortBy: 'created.at', sortType: -1 })
    typeItems.value = res
  } else if (type == 'LINK') {
    typeItems.value = []
  } else if (type == 'MODULE') {
    // console.log('MODULE')
  }
  await loadTypeItemsSelect()
}
const loadTypeItemsSelect = async () => {
  if (mode.value == 'edit') {
    const item = typeItems.value.find(x => x._id == selected.value.refId)
    if (item) {
      itemSelected.value = item
      typeItemsSelected.value = [item._id]
    }
    if (modelForm.value.type == 'LINK') {
      modelForm.value.url = selected.value.url
    }
  }
}
const onCheckedtypeItems = (val: (string | number)[]) => {
  // if (val) typeItemsSelected.value = [val]
  // else typeItemsSelected.value = []
  // typeItemsSelected.value = []
  if (val && val.length) {
    const idx = typeItems.value.findIndex(x => val.includes(x._id))
    itemSelected.value = typeItems.value[idx]
    modelForm.value.title = itemSelected.value.title
    modelForm.value.url = itemSelected.value.slug
    modelForm.value.refId = itemSelected.value._id
    // typeItems.value.forEach(item => {
    // if (val.includes(item._id)) {
    //   typeItemsSelected.value.push(item)
    // }
    // })
  } else {
    itemSelected.value = null
    modelForm.value.title = ''
    modelForm.value.url = ''
    modelForm.value.refId = null
  }
  formRef.value?.restoreValidation()
  // console.log(val)
  // console.log(itemSelected.value)
}
/* ------------------------------------
 * When click tree item
 * ------------------------------------ */
function onSelect(keys) {
  if (!keys.length) return
  selectedKeys.value = keys
  mode.value = 'edit'
  selected.value = JSON.parse(JSON.stringify(menuStore.getFindById(keys[0])))
  previewUrl.value = menuStore.resolveUrl(selected.value)
  modelForm.value.type = selected.value.type
  loadTypeItemsSelect()
  // console.log(selected.value)
  // onCheckedtypeItems(selected.value.refId)
  // modelForm.value.url = selected.value.url
  // console.log(selected.value)
  // console.log(modelForm.value.url, selected.value.url)
}

/* ------------------------------------
 * Add new menu
 * ------------------------------------ */
function onReset() {
  mode.value = 'create'
  selectedKeys.value = []
  selected.value = null
  typeItemsSelected.value = []
  itemSelected.value = null
  // modelForm.value = { ...JSON.parse(JSON.stringify(menuStore.getDefaultModel)), type: modelForm.value.type }
  modelForm.value._id = null
  modelForm.value.title = ''
  modelForm.value.url = ''
  modelForm.value.pid = null
  modelForm.value.refId = null
  modelForm.value.sort = 1
  modelForm.value.flag = 1
  previewUrlCreate.value = '#'
  formRef.value?.restoreValidation()
}

/* ------------------------------------
 * Open URL preview
 * ------------------------------------ */
function openUrl(url: string) {
  if (!url) return
  if (!url.startsWith('http')) {
    window.open(window.location.origin + url)
  } else {
    window.open(url)
  }
}

/* ------------------------------------
 * Save new menu
 * ------------------------------------ */
async function saveCreate() {
  formRef.value.validate(async (err: any) => {
    if (err) return
    const data = {
      ...modelForm.value,
      sort: menuStore.getChildren(modelForm.value.pid).length * 10 + 10
    }

    const res = await menuStore.create(data)
    if (res.status) {
      // menuStore.getAll(true)
      onReset() // reset form
      window.$message.success($t('message.success.createdNew'))
    } else window.$message.error($t(`message.error.${res.statusMessage}`))
  })
}

/* ------------------------------------
 * Save edited menu
 * ------------------------------------ */
async function saveEdit() {
  formRef.value.validate(async (err: any) => {
    if (err) return
    const res = await menuStore.update(selected.value)
    if (res.status) {
      previewUrl.value = menuStore.resolveUrl(selected.value)
      window.$message.success($t('message.success.updated'))
    } else window.$message.error($t(`message.error.${res.statusMessage}`))
  })
}

/* ------------------------------------
 * Delete menu
 * ------------------------------------ */
async function removeItem() {
  if (!selected.value) return
  await menuStore.remove(selected.value._id)
  onReset()
}
// async function removeItem() {
//   if (!selected.value) return
//   await menuStore.remove(selected.value._id)
//   onReset()
// }

/* ------------------------------------
 * Drag & drop reorder
 * ------------------------------------ */
function onDrop({ node }) {
  const parentId = node.parent ? node.parent._id : null
  const siblings = menuStore.getChildren(parentId)

  siblings.forEach((item, index) => {
    const targetSort = (index + 1) * 10
    if (item.sort !== targetSort) {
      bulkChanges.value.push({ id: item._id, pid: parentId, sort: targetSort })
      item.sort = targetSort
    }
  })
  console.log(parentId)
  debouncedCommit()
}

const debouncedCommit = debounce(() => {
  if (!bulkChanges.value.length) return
  menuStore.updatePositions([...bulkChanges.value])
  bulkChanges.value = []
}, 300)

function commitBulkReorder() {
  if (!bulkChanges.value.length) return
  menuStore.updatePositions([...bulkChanges.value])
  bulkChanges.value = []
}

watch(() => modelForm.value.type, (n) => { loadTypeItems(n) }, { deep: true })
/* ------------------------------------
 * Resolve preview URL real-time
 * ------------------------------------ */
watch(() => modelForm.value, () => { previewUrlCreate.value = menuStore.resolveUrl(modelForm.value) }, { deep: true })

watch(() => selected.value, () => { if (selected.value) { previewUrl.value = menuStore.resolveUrl(selected.value) } }, { deep: true })

// On Mounted
onMounted(() => {
  loadTypeItems(modelForm.value.type)
  menuStore.getAll(true)
})
</script>

<template>
  <div class="flex h-full gap-4 p-4">
    <!-- LEFT PANEL -->
    <n-card :title="$t('components.menu.list')" class="w-1/3" size="small" :segmented="{ content: true }">
      <template #header-extra>
        <n-space>
          <n-button type="primary" text-color="#fff" attr-type="button" block class="mb-2"
            :loading="loadingStore.isLoading" @click="onReset">
            {{ $t('common.addNew') }}
          </n-button>
        </n-space>
      </template>
      <n-tree :data="menuStore.tree" key-field="_id" label-field="title" children-field="children" virtual-scroll
        :item-size="32" draggable @dragend="onDrop" @update:selected-keys="onSelect"
        :default-expanded-keys="expandedKeys" :selected-keys="selectedKeys">
        <template #empty>
          <n-empty :description="$t('common.noData')">
            <template #extra>
              <!-- <n-button size="small">
                Find Something New
              </n-button> -->
            </template>
          </n-empty>
        </template>
      </n-tree>
    </n-card>

    <!-- CENTER PANEL -->
    <n-card :title="$t('components.menu.type')" class="w-1/3" size="small" :segmented="{ content: true }">
      <n-space vertical>
        <n-select v-model:value="modelForm.type" :options="menuTypeOptions" filterable
          :placeholder="$tm(['common.pleaseSelect', 'common.pin'])" value-field="code"
          :render-label="(o: any) => $t(`components.options.${menuTypeKey}.${o.code}`, o.title)">
          <template #empty>{{ $t('common.noData') }}</template>
        </n-select>
        <template v-if="modelForm.type === 'LINK'">
          <n-form-item :label="$t('common.link')" class="mt-3">
            <n-input v-model:value="modelForm.url" placeholder="https://example.com" />
          </n-form-item>
        </template>
        <template v-else>
          <n-input-group>
            <n-input-group-label class="flex items-center justify-items-center">
              <nova-icon icon="icon-park-outline:search" />
            </n-input-group-label>
            <n-input v-model:value="query.text" :placeholder="$tm(['common.pleaseInput', 'common.search'])" />
          </n-input-group>
          <n-tabs v-model:value="typeItemsTab" type="line" animated>
            <n-tab-pane name="latest" :tab="$t('common.latest')">
              <n-checkbox-group v-if="typeItems.length" v-model:value="typeItemsSelected" :max="1"
                @update-value="onCheckedtypeItems">
                <n-space vertical item-style="display: flex;">
                  <n-checkbox v-for="e in typeItems" :key="e._id" :value="e._id" :label="e.title" />
                </n-space>
              </n-checkbox-group>
              <n-empty v-else :description="$t('common.noData')" />
            </n-tab-pane>
            <n-tab-pane name="all" :tab="$t('common.all')">
              <!-- <n-checkbox-group v-model:value="typeItems">
                <n-space vertical item-style="display: flex;">
                  <n-checkbox value="Beijing" label="Beijing" />
                  <n-checkbox value="Shanghai" label="Shanghai" />
                  <n-checkbox value="Guangzhou" label="Guangzhou" />
                  <n-checkbox value="Shenzhen" label="Shenzhen" />
                </n-space>
              </n-checkbox-group> -->
              <n-empty :description="$t('common.noData')" />
            </n-tab-pane>
          </n-tabs>
        </template>
      </n-space>
    </n-card>

    <!-- RIGHT PANEL -->
    <n-card class="flex-1" size="small" :segmented="{ content: true }">
      <template v-if="mode === 'create'" #header>
        <n-space justify="end">
          <n-button class="px-6" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
            @click="onReset">
            {{ $t('common.reset') }}
          </n-button>
          <n-button type="primary" class="px-6" text-color="#fff" attr-type="button" block
            :loading="loadingStore.isLoading" @click="saveCreate">
            {{ $t('common.save') }}
          </n-button>
        </n-space>
      </template>
      <template v-else #header>
        <n-space justify="end">
          <n-popconfirm :positive-text="$t('common.confirm')" :negative-text="$t('common.cancel')"
            @positive-click="removeItem">
            <template #trigger>
              <n-button type="error" class="px-6" :loading="loadingStore.isLoading" text-color="#fff">
                {{ $t('common.delete') }}
              </n-button>
            </template>
            {{ $t('message.confirm.deleteOne') }}
          </n-popconfirm>
          <n-button type="primary" class="px-6" :loading="loadingStore.isLoading" text-color="#fff" @click="saveEdit">
            {{ $t('common.save') }}
          </n-button>
        </n-space>
      </template>
      <!-- CREATE FORM -->
      <template v-if="mode === 'create'">
        <!-- <h3 class="text-lg font-semibold mb-3">Create New Menu</h3> -->
        <n-form ref="formRef" :model="modelForm" label-width="100">

          <n-form-item :label="$t('common.title')" path="title"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.title" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
          </n-form-item>

          <!-- <n-form-item label="Parent">
            <n-tree-select v-model:value="modelForm.pid" :options="menuStore.tree" key-field="_id" label-field="title"
              children-field="children" clearable />
          </n-form-item> -->

          <!-- ONLY SHOW WHEN type = link -->
          <!-- <n-form-item label="URL" v-if="modelForm.type === 'LINK'">
            <n-input v-model:value="modelForm.url" placeholder="https://example.com" />
          </n-form-item> -->

          <!-- slug or refId can be selected from category/post/product -->
          <n-form-item v-if="modelForm.type !== 'LINK'" :label="$t('common.slug')" path="url"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.slug']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="modelForm.url" :placeholder="$tm(['common.pleaseInput', 'common.slug'])" />
          </n-form-item>

          <n-form-item :label="$t('common.preview')">
            <n-input :value="previewUrlCreate" readonly :placeholder="$t('common.preview')" />
            <n-button class="ml-2" text-color="#fff" :loading="loadingStore.isLoading"
              @click="openUrl(previewUrlCreate)">{{ $t('common.open') }}</n-button>
          </n-form-item>

          <!-- <n-form-item>
            <n-button type="primary" text-color="#fff" :loading="loadingStore.isLoading" @click="saveCreate">
              {{ $t('common.save') }}
            </n-button>
            <n-button class="ml-2" text-color="#fff" :disabled="loadingStore.isLoading" @click="onReset">
              {{ $t('common.reset') }}
            </n-button>
          </n-form-item> -->

        </n-form>
      </template>

      <!-- EDIT FORM -->
      <template v-else>
        <!-- <h3 class="text-lg font-semibold mb-3">Edit Menu</h3> -->

        <n-form ref="formRef" :model="selected" label-width="100">

          <n-form-item :label="$t('common.title')" path="title"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="selected.title" v-text-format:first
              :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
          </n-form-item>

          <!-- <n-form-item label="Parent">
            <n-tree-select v-model:value="selected.pid" :options="menuStore.tree" key-field="_id" label-field="title"
              children-field="children" clearable />
          </n-form-item> -->

          <n-form-item v-if="modelForm.type !== 'LINK'" :label="$t('common.slug')" path="url"
            :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.slug']), trigger: ['blur', 'change', 'input'] }]">
            <n-input v-model:value="selected.url" :placeholder="$tm(['common.pleaseInput', 'common.slug'])" />
          </n-form-item>

          <n-form-item :label="$t('common.preview')">
            <n-input v-model:value="previewUrl" readonly :placeholder="$t('common.preview')" />
            <n-button class="ml-2" :loading="loadingStore.isLoading" @click="openUrl(previewUrl)">
              {{ $t('common.open') }}
            </n-button>
          </n-form-item>

          <!-- <n-form-item>
            <n-button type="primary" :loading="loadingStore.isLoading" text-color="#fff" @click="saveEdit">
              {{ $t('common.save') }}
            </n-button>
            <n-button type="error" class="ml-2" :loading="loadingStore.isLoading" text-color="#fff" @click="removeItem">
              {{ $t('common.delete') }}
            </n-button>
          </n-form-item> -->

        </n-form>

        <!-- <n-divider /> -->

        <n-button v-if="bulkChanges.length" size="small" type="info" :loading="loadingStore.isLoading"
          @click="commitBulkReorder">
          Apply Bulk Reorder ({{ bulkChanges.length }})
        </n-button>
      </template>

    </n-card>

  </div>
</template>
