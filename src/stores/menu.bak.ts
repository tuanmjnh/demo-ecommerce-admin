import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems, arrayToTree, updatePropsByCondition, filterItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'

const API_PATH = '/menu'

// Default menu model for 'all' list/tree root
const defaultMenu: Models.IMenu = {
  _id: null,
  title: 'Default',
  icon: 'icon-park-outline:application-menu',
  pid: null,
  type: 'category',
  refId: null, // categoryId or contentId
  url: null, // if it is an external link
  sort: 1,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' }
}

// Default model for item creation/reset
const defaultModel: Models.IMenu = {
  _id: null,
  title: '',
  icon: 'icon-park-outline:application-menu',
  pid: null,
  type: 'category',
  refId: null, // categoryId or contentId
  url: null, // if it is an external link
  sort: 1,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' }
}

export const useMenuStore = defineStore('menuStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all menu items (usually used for filtering locally or creating tree structures)
  const all = ref<Models.IMenu[]>([])
  // State for the currently displayed menu items (e.g., in a list/table after filtering/fetching)
  const items = ref<Models.IMenu[]>([])
  // State for a single selected/edited menu item
  const item = ref<Models.IMenu>(structuredClone(defaultModel))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IMenu>(() => structuredClone(defaultModel))

  // Computes the menus array into a tree structure
  const getTreeMenus = computed<Models.IMenu[]>(() => {
    // Note: The original store used 'items' for this, but 'all' is usually better for full tree views
    return arrayToTree(items.value, '_id', 'parent')
  })

  // Returns a function to compute a tree structure suitable for select/dropdown components,
  // optionally excluding one item (to prevent selecting itself as a parent) and including the default menu.
  const getTreeMenusSelect = computed(() => {
    return (exclude?: string | number) => {
      // Filter out the excluded item, convert to tree, and prepend the defaultMenu
      if (exclude) return [...[defaultMenu], ...arrayToTree(items.value.filter(x => x._id !== exclude), '_id', 'parent')]
      // If no exclusion, convert all 'items' to tree and prepend the defaultMenu
      else return [...[defaultMenu], ...arrayToTree(items.value, '_id', 'parent')]
    }
  })

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
      // The original config store had this, but the menu store didn't. Adding it for consistency.
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { throw e }
  }

  // Fetches tree values
  const getTree = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/tree`, args)
      return rs
    } catch (e) { throw e }
  }
  // Fetches tree resolved values
  const getTreeResolved = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/tree-resolved`, args)
      return rs
    } catch (e) { throw e }
  }

  // Creates a new item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IMenu) => {
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
  const update = async (args?: Models.IMenu) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${args._id}`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates position item
  const updatePosition = async (args: { id: string, pid: string, sort: number }) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/update-position`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates position items
  const updatePositions = async (args?: Models.IMenu[]) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/update-positions`, args)
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
  const setItem = async (args?: Models.IMenu) => {
    item.value = args ? structuredClone(args) : structuredClone(defaultModel)
  }

  // Resets the local state to initial empty/default values. (Equivalent to original 'clear' action)
  function resetStore() {
    all.value = []
    items.value = []
    item.value = structuredClone(defaultModel)
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // state
    all,
    items,
    item,
    // getters
    getDefaultModel,
    getTreeMenus,
    getTreeMenusSelect,
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
    getTree,
    getTreeResolved,
    create,
    update,
    updatePosition,
    updatePositions,
    updateFlag,
    setItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency with config store
  }
}, { persist: true }) // Set persist to true as in the original store