import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems, updatePropsByCondition, filterItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'

const API_PATH = '/product'

// Default model for product item creation/reset
const defaultModel: Models.IProduct = {
  _id: '',
  code: '',
  title: '',
  slug: '',
  desc: '',
  content: '',
  groups: [],
  variants: null,
  stocks: null,
  priceSelling: -1,
  pricePromotional: -1,
  quantity: 0,
  unit: 'CAI',
  brand: '',
  originName: '',
  originAddress: '',
  weight: 0,
  warranty: '',
  image: null,
  images: null,
  tags: null,
  attributes: null,
  meta: null,
  pins: null,
  sort: 1,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' }
}

export const useProductStore = defineStore('productStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all product items (non-paginated, used for local filtering/lookups)
  const all = ref<Models.IProduct[]>([])
  // State for the currently displayed product items (e.g., in a list/table after fetching)
  const items = ref<Models.IProduct[]>([])
  // State for a single selected/edited product item
  const item = ref<Models.IProduct>(JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IProduct>(() => JSON.parse(JSON.stringify(defaultModel)))
  /**
  * Getter function to filter the 'all' state based on query parameters (client-side).
  * Note: This is implemented as a function that returns the result, wrapping it with loading state.
  * @param params - Filtering and pagination parameters.
  */
  const getFilterByKey = (params: any) => {
    const query = {
      text: params.text || '',
      textKeys: ['key', 'code', 'title'],
      keys: { groups: params.groups, key: params.key, flag: params.flag },
      sort: { key: params.sortBy, value: params.sortType },
      page: params.page,
      limit: params.limit
    }
    const { items: filteredItems } = filterItems(all.value, query)
    return filteredItems
  }

  /** ------------------ ACTIONS ------------------ **/

  /**
  * Performs client-side filtering and pagination of the 'all' state.
  * @param params - Filtering and pagination parameters.
  */
  const filter = async (params?: any): Promise<Common.IData> => {
    const query = {
      text: params.text,
      textKeys: ['key', 'code', 'title'],
      keys: { key: params.key, flag: params.flag },
      sort: { key: params.sortBy, value: params.sortType },
      page: params.page,
      limit: params.limit
    }
    const result = filterItems(all.value, query)
    items.value = result.items
    params.total = result.total
    params.pages = result.pages
    return { items: result.items, total: result.total, pages: result.pages, page: result.page, limit: result.limit }
  }

  // Fetches ALL product items from the API (non-paginated) and updates the 'all' state.
  const getAll = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to format query parameters, including groups
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, getRequestItems(args, { groups: args.groups }))
      all.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { throw e }
  }

  // Fetches a paginated list of items from the API (GET method) and updates the 'items' state.
  const get = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to format query parameters, including groups
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, getRequestItems(args, { groups: args.groups }))
      items.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { throw e }
  }

  // Fetches a paginated list of items from the API (POST method - likely for complex filtering) and updates the 'items' state.
  const getItems = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to format query parameters (sent in body for POST)
      const rs = await httpAxiosLoading.post<Common.IResponseItems>(`${API_PATH}/items`, getRequestItems(args, { groups: args.groups }))
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

  // Creates a new product item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IProduct) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates an existing product item, updates it in 'items' and 'all' states upon success.
  const update = async (args?: Models.IProduct) => {
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
        // NOTE: The original store did not explicitly update the 'all' state's flag here.
        // If 'all' needs to reflect the flag change (for local consistency/filtering), uncomment the line below.
        all.value = updatePropsByCondition(all.value, { _id: ids }, { flag: flag })
      }
      return rs
    } catch (e) { throw e }
  }

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IProduct) => {
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
    // getters
    getDefaultModel,
    getFilterByKey,
    // actions
    filter,
    getAll,
    get,
    getItems,
    getDistinct,
    getByKey,
    findById,
    findByCode,
    exist,
    create,
    update,
    updateFlag,
    setItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency
  }
}, { persist: true }) // Set persist to true as in the original store