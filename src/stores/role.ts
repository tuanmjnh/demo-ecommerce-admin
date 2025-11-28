import { staticRoutes } from '@/router/routes.static'
import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'

const API_PATH = '/role'

// Default model for role item creation/reset
const defaultModel: Models.IRole = {
  _id: '',
  key: 'manager',
  code: '',
  title: '',
  desc: '',
  level: 1,
  color: null,
  icon: 'icon-park-outline:protect',
  routes: [],
  sort: 1,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' },
  updated: null
}

export const useRoleStore = defineStore('roleStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all role items (non-paginated, used for local lookups)
  const all = ref<Models.IRole[]>([])
  // State for the currently displayed role items (e.g., in a list/table after fetching)
  const items = ref<Models.IRole[]>([])
  // State for a single selected/edited role item
  const item = ref<Models.IRole>(JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IRole>(() => JSON.parse(JSON.stringify(defaultModel)))

  // Computes the names of all static routes that require access/permission checks.
  const getAccessRoutes = computed<string[]>(() => staticRoutes.filter(x => x.access).map(x => x.name as string))

  /** ------------------ ACTIONS ------------------ **/

  // Fetches ALL role items from the API (non-paginated) and updates the 'all' state.
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
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, getRequestItems(args))
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

  // Creates a new role item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IRole) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates an existing role item, updates it in 'items' and 'all' states upon success.
  const update = async (args?: Models.IRole) => {
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
        // If 'all' needs to reflect the flag change, use updatePropsByCondition if needed.
      }
      return rs
    } catch (e) { throw e }
  }

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IRole) => {
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
    getAccessRoutes, // Renamed 'accessRoutes' to 'getAccessRoutes' for consistency
    // actions
    getAll,
    get,
    getDistinct,
    getByKey,
    findById,
    findByCode,
    exist, // Added for consistency
    create,
    update,
    updateFlag,
    setItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency
  }
}, { persist: true }) // Set persist to true as in the original store