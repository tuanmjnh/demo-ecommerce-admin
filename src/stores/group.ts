import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems, arrayToTree, updatePropsByCondition, filterItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'
import { viToSlug } from 'tm-libs/string'

const API_PATH = '/group'

// Default group model for 'all' list/tree root
const defaultGroup: Models.IGroup = {
  _id: null,
  key: '',
  code: '',
  parent: null,
  title: 'Default',
  slug: null,
  slugFull: null,
  seo: { title: '', desc: '', tags: null },
  desc: '',
  level: 1,
  content: '',
  url: null,
  image: null,
  images: null,
  quantity: null,
  position: null,
  tags: null,
  icon: 'icon-park-outline:group',
  color: null,
  meta: null,
  time: null,
  sort: 1,
  flag: 1,
  type: null,
  name: null,
  path: null,
  redirect: null,
  component: null,
  children: null,
  created: { at: Date.now(), by: '', ip: '' }
}

// Default model for item creation/reset
const defaultModel: Models.IGroup = {
  _id: '',
  key: 'gender',
  code: '',
  parent: null,
  title: '',
  slug: null,
  slugFull: null,
  seo: { title: '', desc: '', tags: null },
  desc: '',
  level: 1,
  content: '',
  url: null,
  image: null,
  images: null,
  quantity: null,
  position: null,
  tags: null,
  icon: 'icon-park-outline:group',
  color: null,
  meta: null,
  time: null,
  sort: 1,
  flag: 1,
  type: null,
  name: null,
  path: null,
  redirect: null,
  component: null,
  children: null,
  created: { at: Date.now(), by: '', ip: '' }
}

export const useGroupStore = defineStore('groupStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all group items (usually used for filtering locally or creating tree structures)
  const all = ref<Models.IGroup[]>([])
  // State for the currently displayed group items (e.g., in a list/table after filtering/fetching)
  const items = ref<Models.IGroup[]>([])
  // State for a single selected/edited group item
  const item = ref<Models.IGroup>(JSON.parse(JSON.stringify((defaultModel))))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IGroup>(() => JSON.parse(JSON.stringify((defaultModel))))

  // Computes the groups array into a tree structure
  const getTreeGroups = computed<Models.IGroup[]>(() => {
    return arrayToTree(items.value, '_id', 'parent')
  })

  // Returns a function to compute a tree structure suitable for select/dropdown components,
  // optionally excluding one item (to prevent selecting itself as a parent) and including the default group.
  const getTreeGroupsSelect = computed(() => {
    return (exclude?: string) => {
      const filteredItems = exclude ? items.value.filter(x => x._id !== exclude) : items.value
      const tree = arrayToTree(filteredItems, '_id', 'parent')
      return [defaultGroup, ...tree]
    }
  })

  // Getter to filter items locally from the 'all' state.
  // This structure matches the model store's filterByKey.
  const getFilter = (args?: any) => {
    const query = {
      text: args.text,
      textKeys: ['key', 'code', 'title'],
      keys: { key: args.key, flag: args.flag },
      sort: { key: args.sortBy, value: args.sortType },
      page: args.page,
      limit: args.limit
    }

    const { items, pages } = filterItems(all.value, query)
    args.pages = pages
    return items
  }

  // Getter to filter items locally from the 'all' state.
  // This structure matches the model store's filterByKey.
  const getFilterByKey = (args?: any) => {
    const query = {
      text: args.text,
      textKeys: ['key', 'code', 'title'],
      keys: { key: args.key, flag: args.flag },
      sort: { key: args.sortBy, value: args.sortType },
      page: args.page,
      limit: args.limit
    }
    const { items } = filterItems(all.value, query)
    return items
  }

  /** ------------------ ACTIONS ------------------ **/

  // Filters the 'all' state locally and updates the 'items' state with the result.
  const filter = async (args?: any): Promise<Common.IData> => {
    const query = {
      text: args.text,
      textKeys: ['key', 'code', 'title'],
      keys: { key: args.key, flag: args.flag },
      sort: { key: args.sortBy, value: args.sortType },
      page: args.page,
      limit: args.limit
    }
    const result = filterItems(all.value, query)
    items.value = result.items
    // Update the pagination metadata in the arguments/params object
    args.total = result.total
    args.pages = result.pages
    return { items: items.value, total: result.total, pages: result.pages, page: result.page, limit: result.limit }
  }

  // Fetches a paginated list of items from the API and updates the 'items' state.
  const get = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to prepare query parameters
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, getRequestItems(args, { key: args.key }))
      items.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { throw e }
  }

  // Fetches ALL items from the API (non-paginated) and updates the 'all' state.
  const getAll = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, getRequestItems(args))
      all.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { throw e }
  }

  // Fetches distinct values (not modifying state).
  const getDistinct = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/distinct`, args)
      return rs
    } catch (e) { throw e }
  }

  // Fetches items filtered by 'key' (not modifying state, returns response).
  const getByKey = async (args?: string): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, { key: args })
      return rs
    } catch (e) { throw e }
  }

  // Finds an item by ID and updates the 'item' state.
  const findById = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${args}`)
      item.value = rs.data
      return rs
    } catch (e) { throw e }
  }

  // Finds items by code (not modifying state, returns response).
  const findByCode = async (args?: string): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find`, { code: args })
      return rs
    } catch (e) { throw e }
  }

  // Checks for the existence of an item based on a filter and optional ID (not modifying state).
  const exist = async (args: { filter: object, id?: string }): Promise<boolean> => {
    try {
      // The original config store had this, but the group store didn't. Adding it for consistency.
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { throw e }
  }

  // Creates a new item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IGroup) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates an existing item, updates it in 'items' and 'all' states upon success.
  const update = async (args?: Models.IGroup) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${args._id}`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates the flag property for multiple items (e.g., soft delete/archive).
  const updateFlag = async (ids: (string | number)[], flag: number) => {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseArray>(API_PATH, { items: ids, flag })
      if (rs.status) {
        // Remove from 'items' (assuming it's the view list)
        items.value = removeItems(items.value, ids, '_id')
        // Update the 'flag' property in 'all' list
        all.value = updatePropsByCondition(all.value, { _id: ids }, { flag: flag })
      }
      return rs
    } catch (e) { throw e }
  }

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IGroup) => {
    item.value = args ? JSON.parse(JSON.stringify((args))) : JSON.parse(JSON.stringify((defaultModel)))
  }
  const copyItem = async (args?: Models.IGroup) => {
    item.value = args ?
      { ...args, _id: null, code: null, title: `${args.title} - copy`, slug: viToSlug(`${args.title} - copy`), flag: 0 } :
      { ...item.value, _id: null, code: null, title: `${item.value.title} - copy`, slug: viToSlug(`${item.value.title} - copy`), flag: 0 }
    // item.value = args ? JSON.parse(JSON.stringify : JSON.parse(JSON.stringify(defaultModel)
  }
  // Resets the local state to initial empty/default values. (Equivalent to original 'clear' action)
  function resetStore() {
    all.value = []
    items.value = []
    item.value = JSON.parse(JSON.stringify((defaultModel)))
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // state
    all,
    items,
    item,
    // getters
    getDefaultModel,
    getTreeGroups,
    getTreeGroupsSelect,
    getFilter,
    getFilterByKey,
    // actions
    filter,
    get,
    getAll,
    getDistinct,
    getByKey,
    findById,
    findByCode,
    exist,
    create,
    update,
    updateFlag,
    setItem,
    copyItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency with config store
  }
}, { persist: true }) // Set persist to true as in the original store