import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems, updatePropsByCondition, filterItems } from 'tm-libs/array'
import { getResponseItems } from '@/utils/helper.store'
import { toUpperCaseFirst } from 'tm-libs/string'
const API_PATH = '/config'
const defaultModel: Models.IConfig = {
  _id: '',
  key: 'system',
  code: '',
  value: '',
  type: 'string',
  title: '',
  desc: '',
  level: 1,
  sort: 1,
  flag: 1,
  version: 1,
  created: { at: Date.now(), by: '', ip: '' }
}

const configType = ['string', 'number', 'boolean']
export const useConfigStore = defineStore('configStore', () => {
  /** ------------------ STATE ------------------ **/
  const all = ref<Models.IConfig[]>([])
  const items = ref<Models.IConfig[]>([])
  const item = ref<Models.IConfig>(JSON.parse(JSON.stringify(defaultModel)))
  /** ------------------ GETTERS ------------------ **/
  const getDefaultModel = computed<Models.IConfig>(() => JSON.parse(JSON.stringify(defaultModel)))
  const getConfigType = computed<string[]>(() => configType)
  const getConfigTypeOptions = computed<{ label: string, value: string }[]>(() => configType.map(x => { return { label: toUpperCaseFirst(x), value: x } }))
  const getFilterByKey = (args?) => { // (state) => {
    const query = {
      text: args.text,
      textKeys: ['key', 'code', 'value', 'title'],
      keys: { key: args.key, flag: args.flag },
      sort: { key: args.sortBy, value: args.sortType },
      page: args.page,
      limit: args.limit
    }
    const { items } = filterItems(all.value, query)
    return items
  }
  /** ------------------ ACTIONS ------------------ **/
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
    args.total = result.total
    args.pages = result.pages
    return { items, total: result.total, pages: result.pages, page: result.page, limit: result.limit }
  }
  const get = async (args?: any): Promise<Models.IConfig[]> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, args)
      items.value = rs.data.items
      return items.value
    } catch (e) { throw e }
  }
  const getAll = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, args)
      all.value = rs.data.items
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { throw e }
  }
  const getDistinct = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/distinct`, args)
      return rs
    } catch (e) { throw e }
  }
  const findById = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${args}`)
      item.value = rs.data
      return rs
    } catch (e) { throw e }
  }
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
  const create = async (args?: Models.IConfig) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) { throw e }
  }
  const update = async (args?: Models.IConfig) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${args._id}`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) { throw e }
  }
  const updateFlag = async (ids: (string | number)[], flag: number) => {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseArray>(API_PATH, { items: ids, flag })
      if (rs.status) {
        items.value = removeItems(items.value, ids, '_id')
        all.value = updatePropsByCondition(all.value, { _id: ids }, { flag: flag })
        // this.all = removeItems(this.all, items, '_id')
      }
      return rs
    } catch (e) { throw e }
  }
  const setItem = async (args?: Models.IConfig) => {
    item.value = args ? JSON.parse(JSON.stringify(args)) : JSON.parse(JSON.stringify(defaultModel))
  }
  // RESET STORE
  function resetStore() {
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
    getConfigType,
    getConfigTypeOptions,
    getFilterByKey,
    // actions
    filter,
    get,
    getAll,
    getDistinct,
    findById,
    findByCode,
    exist,
    create,
    update,
    updateFlag,
    setItem,
    resetStore,
  }
}, { persist: false })
