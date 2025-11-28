import { httpAxiosLoading } from '@/services'
import { addItems, updateItems } from 'tm-libs/array'
import { getRequestItems, getResponseItems } from '@/utils/helper.store'
const API_PATH = '/billing'
// Define the default model for initialization
const defaultModel: Models.IBilling = {
  key: 'billing',
  code: '',
  groupId: null,
  items: [],
  customer: 'Khách bán lẻ',
  note: '',
  total: 0,
  status: 'serving',//'empty' | 'serving' | 'paid' | 'cancelled',
  history: null,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' }
}

export const useBillingStore = defineStore('billingStore', () => {
  /** ------------------ STATE (ref) ------------------ **/
  // Convert state properties to reactive references using ref()
  const items = ref<Models.IBilling[]>([])
  const item = ref<Models.IBilling>(JSON.parse(JSON.stringify(defaultModel)))
  const tables = ref<Models.BillingTable[]>([])

  /** ------------------ GETTERS (computed) ------------------ **/

  /**
   * Provides a fresh clone of the default model.
   * Equivalent to the original Options API getter.
   */
  const getDefaultModel = computed<Models.IBilling>(() => JSON.parse(JSON.stringify(defaultModel)))

  /** ------------------ ACTIONS ------------------ **/

  /**
   * Retrieves a list of billing records based on provided arguments (date range, group, status, pagination).
   */
  const get = async (args?: {
    dateStart?: number,
    dateEnd?: number,
    groupId?: string,
    status?: string,
    flag?: number,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortType?: number
  }): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, getRequestItems(args, {
        dateStart: args?.dateStart,
        dateEnd: args?.dateEnd,
        groupId: args?.groupId,
        status: args?.status
      }))
      items.value = rs.data.items // Access state via .value
      args = getResponseItems(args, rs.data)
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Retrieves a report based on type and date range.
   */
  const getReport = async (args?: { type: Common.ReportType, dateStart?: number, dateEnd?: number, groupId?: string, flag?: number, status?: Common.BillingStatusType }): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/report`, getRequestItems(args))
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Loads and associates billing data with a list of group/table items.
   * @param groups - The list of groups (tables) to check for active billings.
   */
  const loadTables = async (groups: Models.IGroup[]): Promise<Models.BillingTable[]> => {
    try {
      tables.value = [] // Access state via .value
      // Call local action 'get'
      await get({})

      const tableData = [] as Models.BillingTable[]

      groups.map(group => {
        // Use items.value for searching the state array
        const billing = items.value.find(b => b.groupId === group._id && b.status == 'serving') as Models.IBilling

        if (!billing) {
          group.status = 'empty'
        } else {
          group.status = billing.status
        }

        tableData.push({ group: group, billing: billing || null })
      })

      tables.value = tableData // Access state via .value
      return tableData
    } catch (e) { return null }
  }

  /**
   * Gets distinct values for specific fields.
   */
  const getDistinct = async (args?: any): Promise<Common.IResponseItems> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/distinct`, args)
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Finds a billing record by its ID.
   * @param args - The ID of the billing record.
   */
  const findById = async (args?: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${args}`)
      item.value = rs.data // Access state via .value
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Finds a billing record by its code.
   * @param args - The code of the billing record.
   */
  const findByCode = async (args: string): Promise<Common.IResponseItem> => {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find`, { code: args })
      return rs
    } catch (e) {
      return { status: false, message: 'error', data: null } as Common.IResponseItems
    }
  }

  // Checks for the existence of an item based on a filter and optional ID (not modifying state).
  const exist = async (args: { filter: object, id?: string }): Promise<boolean> => {
    try {
      // The original config store had this, but the group store didn't. Adding it for consistency.
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { false }
  }

  /**
   * Creates a new order/billing record.
   */
  const createOrder = async (args: { group: Models.IGroup, billing: Models.IBilling }) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, args)
      if (rs.status) {
        items.value = addItems(items.value, rs.data) // Update state array
        args.group.status = 'serving'

        // Update the tables state item
        const index = tables.value.findIndex((t: any) => t.group._id === args.group._id)
        if (index > -1) tables.value[index].billing = rs.data
      }
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Updates an existing order's items.
   */
  const updateOrder = async (args: { table: Models.BillingTable, items: Models.OrderItem[], reason: string }) => {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}`, args)
      if (rs.status) {
        // This seems incorrect as it uses addItems. If it's an update, it should use updateItems.
        // Keeping original logic structure but replacing 'this.items' with 'items.value'
        items.value = addItems(items.value, rs.data)

        // Update the tables state item
        const index = tables.value.findIndex((t: any) => t.group._id === args.table.group._id)
        if (index > -1) tables.value[index].billing = rs.data
      }
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Adds a single item to an existing billing record. (Currently commented out in original)
   */
  const addItem = async (args: { id: string, item: Models.OrderItem }) => {
    try {
      // const rs = await httpAxiosLoading.patch<Common.IResponseItem>(API_PATH, { items: ids, flag })
      console.log(args)
      // await api.addItemToOrder(JSON.parse(JSON.stringify(args)))
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Updates a single item within an existing billing record. (Currently commented out in original)
   */
  const updateItem = async (args: { table: Models.BillingTable, reason: string }) => {
    try {
      console.log(args)
      // await api.updateItemInOrder(JSON.parse(JSON.stringify(args)))
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Removes a single item from an existing billing record. (Currently commented out in original)
   */
  const removeItem = async (args: { id: string, productId: string, reason?: string }) => {
    try {
      console.log(args)
      // await api.removeItemFromOrder(JSON.parse(JSON.stringify(args)))
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Marks a billing record as paid and updates table status.
   */
  const payOrder = async (args: Models.BillingTable) => {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseItem>(`/${API_PATH}/pay`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id') // Update state array

        // Update local table status
        if (args.billing) args.billing.status = 'paid'
        if (args.group) args.group.status = 'empty'
        args.billing = null
      }
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Marks a billing record as cancelled and updates table status.
   */
  const cancelOrder = async (args: { table: Models.BillingTable, reason: string }) => {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseItem>(`/${API_PATH}/cancel`, args)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id') // Update state array

        // Update local table status
        if (args.table.billing) args.table.billing.status = 'cancelled'
        if (args.table.group) args.table.group.status = 'empty'
        args.table.billing = null
      }
      return rs
    } catch (e) { return { status: false, message: 'error', data: null } as Common.IResponseItems }
  }

  /**
   * Sets the current editable item, or resets it to the default model.
   */
  const setItem = (args?: Models.IBilling) => {
    item.value = args ? JSON.parse(JSON.stringify(args)) : JSON.parse(JSON.stringify(defaultModel))
  }

  /**
   * Manually resets the store state (equivalent to $reset).
   */
  const clear = () => {
    items.value = []
    item.value = JSON.parse(JSON.stringify(defaultModel))
    tables.value = []
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // state
    items,
    item,
    tables,
    // getters
    getDefaultModel,
    // actions
    get,
    getReport,
    loadTables,
    getDistinct,
    findById,
    findByCode,
    exist,
    createOrder,
    updateOrder,
    addItem,
    updateItem,
    removeItem,
    payOrder,
    cancelOrder,
    setItem,
    clear,
  }
}, { persist: true }) // Keep the persist option
