import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'
import { viToSlug } from 'tm-libs/string'

const API_PATH = '/posts'

// Default model for post item creation/reset
const defaultModel: Models.IPost = {
  _id: '',
  key: 'post',
  code: '',
  type: 'post', // IMPORTANT: Post type (Post, Page, Product...)
  format: 'standard',
  groups: [],
  title: '',
  slug: '',
  slugFull: null,
  desc: '',
  content: '',
  bottomContent: '',
  relatedLinks: null,
  image: null,
  images: null,
  attaches: null,
  author: 'Admin',
  authorId: '',
  editorId: '',
  date: null,
  publishedAt: Date.now(),
  expiredAt: null,
  time: null,
  attributes: null,
  meta: null,
  seo: { title: '', desc: '', tags: null },
  pins: null,
  tags: null,
  lang: 'vi',
  translations: null,
  sort: 1,
  flag: 1,
  status: 'PUBLISHED',
  isHighlight: false,
  stats: { views: 0, likes: 0, shares: 0, comments: 0, ratingCount: 0, ratingAverage: 0 },
  // created: { at: Date.now(), by: '', ip: '' }
  history: null, // Log edit history
  createdAt: null,
  updatedAt: null
}

export const usePostStore = defineStore('postStore', () => {
  /** ------------------ STATE ------------------ **/
  // State for all Post items (non-paginated, used for local lookup/filtering)
  const all = ref<Models.IPost[]>([])
  // State for the currently displayed news items (e.g., in a list/table after fetching)
  const items = ref<Models.IPost[]>([])
  // State for a single selected/edited news item
  const item = ref<Models.IPost>(JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ GETTERS ------------------ **/

  // Returns a fresh clone of the default model for safe manipulation
  const getDefaultModel = computed<Models.IPost>(() => JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ ACTIONS ------------------ **/

  // Fetches ALL post items from the API (non-paginated) and updates the 'all' state.
  const getAll = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to format query parameters, including groups
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, getRequestItems(args, { key: args.key, groups: args.groups }))
      all.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  // Fetches a paginated list of items from the API and updates the 'items' state. (GET method)
  const get = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to format query parameters, including groups
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, getRequestItems(args, { key: args.key, groups: args.groups }))
      items.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  // Fetches a paginated list of items from the API and updates the 'items' state. (POST method - likely for complex filtering)
  const getItems = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      // Use getRequestItems to format query parameters (sent in body for POST)
      const rs = await httpAxiosLoading.post<Common.IResponseItems>(`${API_PATH}/items`, getRequestItems(args, { key: args.key, groups: args.groups }))
      items.value = rs.data.items
      // Update the pagination metadata in the arguments/params object
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  // Fetches distinct values (not modifying state).
  const getDistinct = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/distinct`, args)
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  // Fetches items filtered by 'key' (not modifying state, returns response).
  const getByKey = async (args?: string): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, { key: args })
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  // Finds an item by ID and updates the 'item' state.
  const findById = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${args}`)
      item.value = rs.data
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItem }
  }

  // Finds an item by slug/code using the /find endpoint (not modifying state, returns response).
  /** 🔍 Find by slug/code/other unique identifier */
  const find = async (args: Record<string, any>): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find`, args)
      return rs
    } catch (e) {
      return { status: false, message: 'error', data: null } as Common.IResponseItem
    }
  }

  const findByKey = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/findByKey`, { key: args })
      return rs
    } catch (e) {
      console.log(e)
      return { status: false, message: 'error', data: null } as Common.IResponseItem
    }
  }

  // Finds items by code (not modifying state, returns response). (Redundant with 'find' but kept for consistency)
  const findByCode = async (args?: string): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find`, { code: args })
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItem }
  }

  // Checks for the existence of an item based on a filter and optional ID (Added for consistency)
  const exist = async (args: { filter: object, id?: string }): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { return false }
  }

  // Creates a new item, adds it to 'items' and 'all' states upon success.
  const create = async (args?: Models.IPost) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) {
      return { status: false, message: 'error', data: null } as Common.IResponseItem
    }
  }

  // Updates an existing item, updates it in 'items' and 'all' states upon success.
  const update = async (args?: Models.IPost) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${args._id}`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) {
      return { status: false, message: 'error', data: null } as Common.IResponseItem
    }
  }

  // Updates the flag property for multiple items (e.g., soft delete/archive).
  const updateFlag = async (ids: (string | number)[], flag: number) => {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseArray>(API_PATH, { items: ids, flag })
      if (rs.status) {
        // Remove from 'items' (assuming it's the view list)
        items.value = removeItems(items.value, ids, '_id')
        // NOTE: The original store did not update 'all' flag here.
        // If 'all' is meant to reflect the flag change, you should add:
        // all.value = updatePropsByCondition(all.value, { _id: ids }, { flag: flag })
      }
      return rs
    } catch (e) {
      return { status: false, message: 'error', data: null } as Common.IResponseItem
    }
  }

  // Sets the current 'item' state, cloning the provided item or setting the default model.
  const setItem = async (args?: Models.IPost) => {
    item.value = args ? JSON.parse(JSON.stringify(args)) : JSON.parse(JSON.stringify(defaultModel))
    // item.value = args ? JSON.parse(JSON.stringify : JSON.parse(JSON.stringify(defaultModel)
  }
  const copyItem = async (args?: Models.IPost) => {
    item.value = args ?
      { ...args, _id: null, code: null, title: `${args.title} - copy`, slug: viToSlug(`${args.title} - copy`), flag: 0 } :
      { ...item.value, _id: null, code: null, title: `${item.value.title} - copy`, slug: viToSlug(`${item.value.title} - copy`), flag: 0 }
    // item.value = args ? JSON.parse(JSON.stringify : JSON.parse(JSON.stringify(defaultModel)
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
    get,
    getItems,
    getDistinct,
    getByKey,
    findById,
    find,
    findByCode,
    findByKey,
    exist,
    create,
    update,
    updateFlag,
    setItem,
    copyItem,
    resetStore, // Renamed 'clear' to 'resetStore' for consistency
  }
}, { persist: true }) // Set persist to true as in the original store