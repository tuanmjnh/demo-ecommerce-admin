<script setup lang="ts">
import type { TreeDropInfo } from 'naive-ui'
import { useAppStore, useLoadingStore, useOptionsStore, useMenuStore, useGroupStore, usePostStore, useProductStore } from '@/stores'
import { debounce } from 'lodash'
import { $t, $tm } from '@/utils'
import { viToSlug } from 'tm-libs/string'

const appStore = useAppStore()
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

// Data tree menu
const treeMenu = computed({
  get() { return menuStore.tree },
  set(newValue) { menuStore.tree = newValue }
}) //computed(() => menuStore.tree)

const isConfirmDelete = ref(false)
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

// options
const menuTypeKey = 'menu_type'
const menuTypeOptions = computed(() => optionsStore.getFilterByKey({ key: menuTypeKey, flag: 1 }))
// type items
const query = ref({
  text: '',
  key: '',
  groups: [],
  sortBy: 'created.at',
  sortType: -1, //1 ASC, -1 DESC
  flag: 1,
  page: 1,
  total: 0,
  pages: 0,
  limit: appStore.pageSizes[0],
  pageSizes: appStore.pageSizes.map(x => { return { label: String(x), value: x } })
})
const typeItemsTab = ref<'latest' | 'all'>('latest')
const typeItemsSelected = ref()
const itemSelected = ref(null)
const typeItems = ref([])
const typeItemsAll = ref([])
const loadTypeItems = async (type: Common.MenuType) => {
  typeItemsSelected.value = []
  typeItems.value = []
  modelForm.value.url = ''
  if (type == 'PAGE' || type == 'POST') {
    query.value.key = type.toLowerCase()
    const res = await postStore.getItems(query.value)//({ key: type.toLowerCase(), flag: 1, page: 1, limit: 25, sortBy: 'created.at', sortType: -1 })
    typeItems.value = res.data.items
    // console.log(typeItems.value)
    // console.log('PAGE')
  } else if (type == 'PRODUCT') {
    query.value.key = type.toLowerCase()
    const res = await productStore.getItems(query.value)//({ key: type.toLowerCase(), flag: 1, page: 1, limit: 15, sortBy: 'created.at', sortType: -1 })
    typeItems.value = res.data.items
  } else if (type == 'CATEGORY') {
    query.value.key = 'post'
    const res = await groupStore.getFilter(query.value)//({ key: 'post', flag: 1, page: 1, limit: 30, sortBy: 'created.at', sortType: -1 })
    typeItems.value = res
  } else if (type == 'LINK') {
    typeItems.value = []
  } else if (type == 'MODULE') {
    // console.log('MODULE')
  }
  await loadTypeItemsSelect()
}
const onSearchTypeItems = debounce((text?: string) => { loadTypeItems(modelForm.value.type) }, 600)

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
const onCheckedtypeItems = (values: (string | number)[]) => {
  if (!values.length) {
    itemSelected.value = null
    modelForm.value.title = ''
    modelForm.value.url = ''
    modelForm.value.refId = null
    return
  }

  const id = values[0]
  const found = typeItems.value.find(x => x._id === id)
  if (!found) return

  itemSelected.value = found
  modelForm.value.refId = found._id
  modelForm.value.title = found.title
  modelForm.value.url = found.slug || found.url || ''
  formRef.value?.restoreValidation()
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
}

/* ------------------------------------
 * Add new menu
 * ------------------------------------ */
function onReset(force?: boolean) {
  mode.value = 'create'
  if (force) modelForm.value.pid = null
  else modelForm.value.pid = modelForm.value?.pid || selected.value?.pid
  selectedKeys.value = []
  selected.value = null
  typeItemsSelected.value = []
  itemSelected.value = null
  // modelForm.value = { ...JSON.parse(JSON.stringify(menuStore.getDefaultModel)), type: modelForm.value.type }
  modelForm.value._id = null
  modelForm.value.title = ''
  modelForm.value.url = ''
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

/** Create slug when entering title */
watch(() => modelForm.value.url, debounce(async (n) => {
  if (!n) return
  modelForm.value.url = ['#', '/'].includes(n) ? n : viToSlug(n)
}, 600))


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
    }
    else {
      window.$message.error($t(`message.error.${res.statusMessage}`))
    }
  })
}

/* ------------------------------------
 * Save edited menu
 * ------------------------------------ */
async function saveEdit() {
  formRef.value.validate(async (err: any) => {
    if (err) return
    selected.value.type = modelForm.value.type
    selected.value.url = modelForm.value.url
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
  isConfirmDelete.value = false
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
async function onDrop({ dragNode, node, dropPosition }: TreeDropInfo) {
  const tree = treeMenu.value

  // ----- 1. Find a node in the tree -----
  function findNode(key, nodes, parent = null) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (n._id === key) return { node: n, parent, index: i }
      if (n.children) {
        const r = findNode(key, n.children, n)
        if (r) return r
      }
    }
    return null
  }

  const dragInfo = findNode(dragNode._id, tree)
  const dropInfo = findNode(node._id, tree)
  if (!dragInfo || !dropInfo) return

  // ----- 2. Block drag on its child -----
  function isChildOf(target, parent) {
    if (!parent.children) return false
    for (const c of parent.children) {
      if (c._id === target._id) return true
      if (isChildOf(target, c)) return true
    }
    return false
  }

  if (isChildOf(dropInfo.node, dragInfo.node)) {
    window.$message.warning($t('message.warning.dragChildNode'))
    return
  }

  // ----- 3. Remove from old siblings -----
  const oldSiblings = dragInfo.parent ? dragInfo.parent.children : tree
  oldSiblings.splice(dragInfo.index, 1)

  // ----- 4. Insert into new position -----
  let newPid = null
  let newSiblings = null

  if (dropPosition === "inside") {
    // be a child
    dropInfo.node.children = dropInfo.node.children || []
    dropInfo.node.children.unshift(dragInfo.node)
    newPid = dropInfo.node._id
    newSiblings = dropInfo.node.children
  } else {
    // before or after
    const siblings = dropInfo.parent ? dropInfo.parent.children : tree
    let insertIndex = dropInfo.index
    if (dropPosition === "after") insertIndex += 1

    siblings.splice(insertIndex, 0, dragInfo.node)
    newPid = dropInfo.parent ? dropInfo.parent._id : null
    newSiblings = siblings
  }

  dragInfo.node.pid = newPid

  // ----- 5. Normalize sort -----
  const updates = []
  newSiblings.forEach((item, index) => {
    const newSort = (index + 1) * 10
    if (item.sort !== newSort) {
      item.sort = newSort
      updates.push({ id: item._id, pid: item.pid, sort: newSort })
    }
  })

  // ----- 6. Commit bulk -----
  bulkChanges.value.push(...updates)
  debouncedCommit()

  // ----- 7. Reactive update -----
  treeMenu.value = [...tree]
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

watch(() => modelForm.value.type, (n) => {
  query.value.page = 1
  loadTypeItems(n)
}, { deep: true })
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
        <!-- <n-space>
          <n-button type="primary" text-color="#fff" attr-type="button" block class="mb-2"
            :loading="loadingStore.isLoading" @click="onReset(true)">
            {{ $t('common.addNew') }}
          </n-button>
        </n-space> -->
      </template>
      <n-scrollbar style="max-height: calc(100vh - 310px)" trigger="none" class="pr-3">
        <n-tree :data="treeMenu" key-field="_id" label-field="title" children-field="children" virtual-scroll
          :item-size="32" draggable @drop="onDrop" @update:selected-keys="onSelect" default-expand-all
          :selected-keys="selectedKeys">
          <template #empty>
            <n-empty :description="$t('common.noData')">
              <template #extra>
              </template>
            </n-empty>
          </template>
        </n-tree>
      </n-scrollbar>
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
          <n-input-group class="mb-3">
            <n-input-group-label class="flex items-center justify-items-center">
              <nova-icon icon="icon-park-outline:search" />
            </n-input-group-label>
            <n-input v-model:value="query.text" @input="onSearchTypeItems" clearable
              :placeholder="$tm(['common.pleaseInput', 'common.search'])" />
          </n-input-group>
          <template v-if="typeItems.length">
            <n-scrollbar style="max-height: calc(100vh - 450px)" trigger="none" class="pr-3">
              <n-checkbox-group v-model:value="typeItemsSelected" :max="1" @update-value="onCheckedtypeItems">
                <n-space vertical item-style="display: flex;">
                  <n-checkbox v-for="e in typeItems" :key="e._id" :value="e._id" :label="e.title" />
                </n-space>
              </n-checkbox-group>
            </n-scrollbar>
            <div class="flex flex-row-reverse mt-3">
              <n-pagination v-model:page="query.page" v-model:page-size="query.limit" :page-count="query.pages"
                show-size-picker :page-sizes="query.pageSizes"
                @update:page="(val) => { query.page = val; loadTypeItems(modelForm.type) }"
                @update:page-size="(val) => { query.limit = val; query.page = 1; loadTypeItems(modelForm.type) }" />
            </div>
          </template>
          <n-data-table v-if="loadingStore.isLoading" :loading="loadingStore.isLoading" :bordered="false" />
          <n-empty v-else-if="!loadingStore.isLoading && !typeItems.length" :description="$t('common.noData')" />
          <!-- <n-tabs v-model:value="typeItemsTab" type="line" animated>
            <n-tab-pane name="latest" :tab="$t('common.latest')">
              <n-checkbox-group v-if="typeItems.length" v-model:value="typeItemsSelected" :max="1"
                @update-value="onCheckedtypeItems">
                <n-scrollbar style="max-height: calc(100vh - 440px)" trigger="none" class="pr-3">
                  <n-space vertical item-style="display: flex;">
                    <n-checkbox v-for="e in typeItems" :key="e._id" :value="e._id" :label="e.title" />
                  </n-space>
                </n-scrollbar>
              </n-checkbox-group>
              <n-empty v-else :description="$t('common.noData')" />
            </n-tab-pane>
            <n-tab-pane name="all" :tab="$t('common.all')">
              <n-checkbox-group v-if="typeItemsAll" v-model:value="typeItemsSelected">
                <n-scrollbar style="max-height: calc(100vh - 440px)" trigger="none" class="pr-3">
                  <n-space vertical item-style="display: flex;">
                    <n-checkbox v-for="e in 20" :key="e" value="Beijing" label="Beijing" />
                  </n-space>
                  <div class="flex flex-row-reverse mt-3">
                    <n-pagination v-model:page="query.page" v-model:page-size="query.limit" :page-count="query.pages"
                      show-size-picker :page-sizes="query.pageSizes"
                      @update:page="(val) => { query.page = val; loadTypeItemsAll() }"
                      @update:page-size="(val) => { query.limit = val; query.page = 1; loadTypeItemsAll() }" />
                  </div>
                </n-scrollbar>
              </n-checkbox-group>
              <n-empty v-else :description="$t('common.noData')" />
            </n-tab-pane>
          </n-tabs> -->
        </template>
      </n-space>
    </n-card>

    <!-- RIGHT PANEL -->
    <n-card class="flex-1" size="small" :segmented="{ content: true }">
      <template v-if="mode === 'create'" #header>
        <n-space justify="end">
          <n-button class="px-6" text-color="#fff" attr-type="button" block :loading="loadingStore.isLoading"
            @click="onReset(true)">
            {{ $t('common.reset') }}
          </n-button>
          <n-button type="primary" class="px-6" text-color="#fff" attr-type="button" block
            :loading="loadingStore.isLoading" @click="saveCreate">
            {{ $t('common.addNew') }}
          </n-button>
        </n-space>
      </template>
      <template v-else #header>
        <div class="flex">
          <div class="flex-1">
            <n-button type="primary" text-color="#fff" attr-type="button" class="mb-2" :loading="loadingStore.isLoading"
              @click="onReset()">
              {{ $t('common.addNew') }}
            </n-button>
          </div>
          <n-space justify="end">
            <n-button type="error" class="px-6" :loading="loadingStore.isLoading" text-color="#fff"
              @click="isConfirmDelete = true">
              {{ $t('common.delete') }}
            </n-button>
            <n-button type="primary" class="px-6" :loading="loadingStore.isLoading" text-color="#fff" @click="saveEdit">
              {{ $t('common.save') }}
            </n-button>
          </n-space>
        </div>
        <!-- </n-space> -->
      </template>
      <!-- CREATE FORM -->
      <n-scrollbar style="max-height: calc(100vh - 310px)" trigger="none" class="pr-3">
        <template v-if="mode === 'create'">
          <!-- <h3 class="text-lg font-semibold mb-3">Create New Menu</h3> -->
          <n-form ref="formRef" :model="modelForm" label-width="100">

            <n-form-item :label="$t('common.title')" path="title"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelForm.title" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
            </n-form-item>

            <!-- slug or refId can be selected from category/post/product -->
            <n-form-item v-if="modelForm.type !== 'LINK'" :label="$t('common.slug')" path="url"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.slug']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="modelForm.url" :placeholder="$tm(['common.pleaseInput', 'common.slug'])" />
            </n-form-item>

            <n-form-item :label="$t('components.groups.dependent')">
              <n-tree-select v-model:value="modelForm.pid" :options="menuStore.tree" key-field="_id" label-field="title"
                children-field="children" :placeholder="$tm(['common.pleaseSelect', 'components.groups.dependent'])"
                clearable />
              <help-info class="ml-2" :message="$t('components.groups.dependentHelp')" />
            </n-form-item>

            <n-form-item :label="$t('common.preview')">
              <n-input :value="previewUrlCreate" readonly :placeholder="$t('common.preview')" />
              <n-button class="ml-2" text-color="#fff" :loading="loadingStore.isLoading"
                @click="openUrl(previewUrlCreate)">{{ $t('common.open') }}</n-button>
            </n-form-item>

          </n-form>
        </template>

        <!-- EDIT FORM -->
        <template v-else>
          <n-form ref="formRef" :model="selected" label-width="100">

            <n-form-item :label="$t('common.title')" path="title"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.title']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="selected.title" v-text-format:first
                :placeholder="$tm(['common.pleaseInput', 'common.title'])" />
            </n-form-item>

            <n-form-item v-if="modelForm.type !== 'LINK'" :label="$t('common.slug')" path="url"
              :rule="[{ required: true, message: $tm(['common.pleaseInput', 'common.slug']), trigger: ['blur', 'change', 'input'] }]">
              <n-input v-model:value="selected.url" :placeholder="$tm(['common.pleaseInput', 'common.slug'])" />
            </n-form-item>

            <n-form-item :label="$t('components.groups.dependent')">
              <n-tree-select v-model:value="selected.pid" :options="menuStore.tree" key-field="_id" label-field="title"
                children-field="children" :placeholder="$tm(['common.pleaseSelect', 'components.groups.dependent'])"
                :default-value="selected.pid" :default-expanded-keys="[selected.pid]" clearable />
              <help-info class="ml-2" :message="$t('components.groups.dependentHelp')" />
            </n-form-item>

            <n-form-item :label="$t('common.preview')">
              <n-input v-model:value="previewUrl" readonly :placeholder="$t('common.preview')" />
              <n-button class="ml-2" :loading="loadingStore.isLoading" @click="openUrl(previewUrl)">
                {{ $t('common.open') }}
              </n-button>
            </n-form-item>

          </n-form>

          <!-- <n-divider /> -->

          <!-- <n-button v-if="bulkChanges.length" size="small" type="info" :loading="loadingStore.isLoading"
          @click="commitBulkReorder">
          Apply Bulk Reorder ({{ bulkChanges.length }})
        </n-button> -->
        </template>
      </n-scrollbar>
    </n-card>
    <confirm-modal :visible="isConfirmDelete" :title="$tm(['common.confirm', 'common.delete'])"
      :confirm-text="$t('common.confirm')" :cancel-text="$t('common.cancel')" @confirm="removeItem"
      @cancel="isConfirmDelete = false">
      <template #default>
        <div class="text-center">
          <p>{{ $t('message.confirm.deleteTree') }}</p>
          <span class="font-semibold text-red-500"> {{ selected?.title }}</span>
        </div>
      </template>
    </confirm-modal>
  </div>
</template>
