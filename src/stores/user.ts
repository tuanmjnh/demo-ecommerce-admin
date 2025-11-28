import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'

const API_PATH = '/user'

// Default model for user item creation/reset
const defaultModel: Models.IUser = {
  _id: '',
  username: '',
  password: '',
  groups: [],
  fullName: '',
  email: '',
  phone: '',
  personNumber: '',
  region: '',
  avatar: null,
  avatars: [],
  about: '',
  dateBirth: Date.now(),
  gender: '',
  address: '',
  roles: [],
  salt: '',
  verified: false,
  flag: 1,
  lastLogin: null,
  lastChangePass: null,
  created: { at: Date.now(), by: '', ip: '' },
  updated: null
}

export const useUserStore = defineStore('userStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all user items (non-paginated, often used for selection/lookups)
  const all = ref<Models.IUser[]>([])
  // State for the currently displayed user items (e.g., in a list/table after fetching)
  const items = ref<Models.IUser[]>([])
  // State for a single selected/edited user item
  const item = ref<Models.IUser>(JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IUser>(() => JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ ACTIONS ------------------ **/

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

  // Finds an item by ID and updates the 'item' state.
  const findById = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${args}`)
      item.value = rs.data
      return rs
    } catch (e) { throw e }
  }

  // Finds items by username (not modifying state, returns response).
  const findByUsername = async (args?: string): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find`, { username: args })
      return rs
    } catch (e) { throw e }
  }

  // Finds items by group (not modifying state, returns response).
  const findByGroup = async (args?: string): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find`, { groups: args })
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

  // Creates a new user item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IUser) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates an existing user item, updates it in 'items' and 'all' states upon success.
  const update = async (args?: Models.IUser) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${args._id}`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) { throw e }
  }

  // Updates the user's profile details (excluding sensitive fields like password).
  const updateProfile = async (args?: Models.IUser): Promise<Common.IResponseItem> => {
    try {
      const body = {
        fullName: args.fullName,
        email: args.email,
        phone: args.phone,
        personNumber: args.personNumber,
        region: args.region,
        about: args.about,
        dateBirth: args.dateBirth,
        gender: args.gender,
        address: args.address,
        avatar: args.avatar
      }
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`user-profile/${args._id}`, body)
      // Note: State update for 'item' or currently logged-in user is often handled outside the general store
      return rs
    } catch (e) { throw e }
  }

  // Handles changing the user's password, requiring the old password.
  const changePasswordProfile = async (args?: { _id: string, oldPassword: string, newPassword: string }): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`user-profile/change-password`, args)
      return rs
    } catch (e) { throw e }
  }

  // Resets a user's password (typically by an admin or via a password reset token process).
  const changePassword = async (args?: { userId: string, password: string }): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/change-password`, args)
      return rs
    } catch (e) { throw e }
  }
  const resetPassword = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/reset-password/`, args)
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
      }
      return rs
    } catch (e) { throw e }
  }

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IUser) => {
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
    // actions
    get,
    getItems,
    findById,
    findByUsername,
    findByGroup,
    exist,
    create,
    update,
    updateProfile,
    changePasswordProfile,
    changePassword,
    resetPassword,
    updateFlag,
    setItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency
  }
}, { persist: false }) // Set persist to false as in the original store