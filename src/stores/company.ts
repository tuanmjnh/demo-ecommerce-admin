// stores/company.ts
import { httpAxiosLoading } from '@/services' // theo project của bạn
const API_PATH = '/company'

const defaultModel: Models.ICompany = {
  _id: null,
  name: '',
  shortName: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  hotline: '',
  taxCode: '',
  logo: null,
  banner: null,
  images: [],
  mapEmbed: '',
  social: {},
  openingHours: '',
  seo: { title: '', desc: '', tags: null },
  created: null,
  updated: null
}

export const useCompanyStore = defineStore('companyStore', () => {
  const item = ref<Models.ICompany>(JSON.parse(JSON.stringify(defaultModel)))
  const loaded = ref(false)

  const getDefault = computed(() => JSON.parse(JSON.stringify(defaultModel)))

  // load (GET /company) - expect server returns single company object
  const load = async (force = false) => {
    try {
      if (loaded.value && !force) return item.value
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/find-one`)
      if (rs.data && rs.data) {
        item.value = rs.data
      } else {
        item.value = { ...defaultModel }
      }
      loaded.value = true
      return item.value
    } catch (e) {
      throw e
    }
  }

  // create (POST /company)
  const create = async (payload: Models.ICompany) => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, payload)
      if (rs.data && rs.data) {
        item.value = rs.data
      }
      return rs.data
    } catch (e) { throw e }
  }

  // update (PUT /company/:id) or PUT /company if server uses single resource
  const update = async (payload: Models.ICompany) => {
    try {
      const id = payload._id
      // If your API expects PUT /company/:id use the first branch, otherwise call PUT /company
      const rs = id
        ? await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${id}`, payload)
        : await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, payload)
      if (rs.data && rs.data) {
        item.value = rs.data
      }
      return rs.data
    } catch (e) { throw e }
  }

  const reset = () => {
    item.value = { ...defaultModel }
    loaded.value = false
  }

  return {
    item,
    loaded,
    getDefault,
    load,
    create,
    update,
    reset
  }
})
