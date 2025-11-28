import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'

const API_PATH = '/post-interaction'

// Default model for post interaction item creation/reset
const defaultModel: Models.IPostInteraction = {
  _id: '',
  postId: null,
  postSlug: null,
  userId: null,
  sessionId: null,
  ip: null,
  userAgent: null,
  author: null,
  type: null, // 'view' | 'like' | 'share' | 'comment' | 'rate'
  action: null, // 'add' | 'remove'
  comment: null,
  rating: 5,
  meta: null,
  flag: 1,
  status: 'active',
  createdAt: Date.now()
}

export const usePostInteractionStore = defineStore('postInteractionStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all interaction items (non-paginated)
  const all = ref<Models.IPostInteraction[]>([])
  // State for the currently displayed interaction items (e.g., in a list/table)
  const items = ref<Models.IPostInteraction[]>([])
  // State for a single selected/edited interaction item
  const item = ref<Models.IPostInteraction>(JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IPostInteraction>(() => JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ ACTIONS ------------------ **/

  // =========================================
  // 📦 Basic CRUD Operations
  // =========================================

  // Fetches ALL interaction items from the API (non-paginated) and updates the 'all' state.
  const getAll = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(
        API_PATH,
        getRequestItems(args)
      )
      all.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) {
      throw e
    }
  }

  // Finds an item by ID and updates the 'item' state.
  const findById = async (id: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${id}`)
      item.value = rs.data
      return rs
    } catch (e) {
      throw e
    }
  }

  // Checks for the existence of an item based on a filter and optional ID (Added for consistency)
  const exist = async (args: { filter: object, id?: string }): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { throw e }
  }

  // Creates a new interaction item, adds it to 'items' and 'all' states upon success.
  const create = async (args: Models.IPostInteraction): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) {
      throw e
    }
  }

  // Updates an existing interaction item, updates it in 'items' and 'all' states upon success.
  const update = async (args: Models.IPostInteraction): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(
        `${API_PATH}/${args._id}`,
        args
      )
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) {
      throw e
    }
  }

  // Updates the flag property for multiple items (e.g., soft delete/archive).
  const updateFlag = async (ids: (string | number)[], flag: number) => {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseArray>(API_PATH, { items: ids, flag })
      if (rs.status) {
        // Remove items from the current view list
        items.value = removeItems(items.value, ids, '_id')
        // NOTE: The original store did not update 'all' flag here.
        // If 'all' is meant to reflect the flag change, you should add:
        // all.value = updatePropsByCondition(all.value, { _id: ids }, { flag: flag })
      }
      return rs
    } catch (e) {
      throw e
    }
  }

  // =========================================
  // 🚀 Interaction Specific Actions
  // =========================================

  // Records a ost view interaction.
  const addView = async (params: { postId: string; postSlug?: string; ip?: string; userAgent?: string; sessionId?: string }) => {
    return await httpAxiosLoading.post(`${API_PATH}/view`, params)
  }

  // Toggles a like interaction (add or remove).
  const toggleLike = async (params: { postId: string; userId?: string; action: 'add' | 'remove' }) => {
    return await httpAxiosLoading.post(`${API_PATH}/like`, params)
  }

  // Records a share interaction.
  const addShare = async (params: { postId: string; userId?: string }) => {
    return await httpAxiosLoading.post(`${API_PATH}/share`, params)
  }

  // Records a comment interaction.
  const addComment = async (params: { postId: string; userId?: string; comment: string }) => {
    return await httpAxiosLoading.post(`${API_PATH}/comment`, params)
  }

  // Records a rating interaction.
  const addRate = async (params: { postId: string; userId?: string; rating: number }) => {
    return await httpAxiosLoading.post(`${API_PATH}/rate`, params)
  }

  // =========================================
  // ⚙️ Utilities & Reset
  // =========================================

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IPostInteraction) => {
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
    getAll,
    findById,
    exist,
    create,
    update,
    updateFlag,
    // interaction actions
    addView,
    toggleLike,
    addShare,
    addComment,
    addRate,
    // utilities
    setItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency
  }
}, { persist: false }) // Set persist to false as in the original store