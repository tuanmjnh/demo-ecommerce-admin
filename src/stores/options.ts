import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems, updatePropsByCondition, filterItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'
import { pushIfNotExist } from 'tm-libs/array'

const API_PATH = '/options'

// Default model for option item creation/reset
const defaultModel: Models.IOptions = {
  _id: '',
  key: '',
  code: '',
  title: '',
  desc: '',
  meta: null,
  sort: 1,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' },
  updated: null
}

export const useOptionsStore = defineStore('optionsStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all option items (non-paginated, used for local filtering)
  const all = ref<Models.IOptions[]>([])
  // State for the currently displayed option items (e.g., in a list/table after fetching)
  const items = ref<Models.IOptions[]>([])
  // State for a single selected/edited option item
  const item = ref<Models.IOptions>(JSON.parse(JSON.stringify(defaultModel)))
  // State for meta
  const metaKeys = ref<{ value: string, label: string }[]>([])
  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IOptions>(() => JSON.parse(JSON.stringify(defaultModel)))

  // Getter that returns a function to filter items locally from the 'all' state by key/flag/sort.
  const getFilterByKey = (args?: any) => {
    const query = {
      text: '', // Assuming text search is optional or empty in this specific getter
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

  // Filters the 'all' state locally and updates the 'items' state with the result (used for local client-side filtering).
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

  const getMetaKeys = () => {
    metaKeys.value = all.value.filter(x => x.key === 'meta').map(x => { return { label: x.title, value: x.value } })
    return metaKeys.value || []
  }

  // Fetches ALL option items from the API (non-paginated) and updates the 'all' state.
  const getAll = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, getRequestItems(args))
      all.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { throw e }
  }

  // Fetches a paginated list of items from the API and updates the 'items' state.
  const get = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, getRequestItems(args, { key: args.key }))
      items.value = rs.data.items
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

  const getMeta = async (args?: any): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/meta`)
      metaKeys.value = rs.data
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

  // Checks for the existence of an item based on a filter and optional ID (Added for consistency)
  const exist = async (args: { filter: object, id?: string }): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { throw e }
  }

  // Creates a new item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IOptions) => {
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
  const update = async (args?: Models.IOptions) => {
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
        // Remove items from the current view list
        items.value = removeItems(items.value, ids, '_id')
        // Update the 'flag' property in 'all' list
        all.value = updatePropsByCondition(all.value, { _id: ids }, { flag: flag })
      }
      return rs
    } catch (e) { throw e }
  }

  const setMeta = async (args: string[]) => {
    try {
      const items = args.filter(Boolean).map(x => ({ ...defaultModel, ...{ key: 'meta', code: x, value: x, title: x } }))
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/meta`, items)
      // all.value = addItems(all.value, items)
      pushIfNotExist(all.value, items, 'value')
      metaKeys.value = all.value.filter(x => x.key === 'meta').map(x => { return { label: x.title, value: x.value } })
      return rs
    } catch (e) { throw e }
  }

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IOptions) => {
    item.value = args ? JSON.parse(JSON.stringify(args)) : JSON.parse(JSON.stringify(defaultModel))
  }

  // Resets the local state to initial empty/default values. (Equivalent to original 'clear' action)
  function resetStore() {
    all.value = []
    items.value = []
    item.value = JSON.parse(JSON.stringify(defaultModel))
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // state
    all,
    items,
    item,
    metaKeys,
    // getters
    getDefaultModel,
    getFilterByKey,
    getMetaKeys,
    // actions
    filter,
    getAll,
    get,
    getDistinct,
    getByKey,
    getMeta,
    findById,
    findByCode,
    exist,
    create,
    update,
    updateFlag,
    setMeta,
    setItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency
  }
}, { persist: true }) // Set persist to true as in the original store