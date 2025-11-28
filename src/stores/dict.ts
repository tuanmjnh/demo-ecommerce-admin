import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchDictList } from '@/services'
import type { DictMap } from '@/types/global'
import { sessionStorage } from 'tm-libs/storage'

export const useDictStore = defineStore('dictStore', () => {
  /** ------------------ STATE (ref) ------------------ **/
  // Declare state by ref, assign initial type
  const dictMap = ref<DictMap>({} as DictMap)
  const isInitDict = ref(false)

  /** ------------------ ACTIONS ------------------ **/

  // Helper function to load data from the network
  const getDictByNet = async (code: string) => {
    const { data, isSuccess } = await fetchDictList(code)
    if (isSuccess) {
      // Update dictMap.value
      Reflect.set(dictMap.value, code, data)
      // Sync to session storage
      sessionStorage.set('dict', dictMap.value)
      return data
    } else {
      throw new Error(`Failed to get ${code} dictionary from network, check ${code} field or network`)
    }
  }

  // Function to check and get data (from cache or network)
  const getDict = async (code: string) => {
    const isExist = Reflect.has(dictMap.value, code)

    if (isExist) {
      return dictMap.value[code]
    } else {
      return await getDictByNet(code)
    }
  }

  // Initialize dictMap from sessionStorage
  const initDict = () => {
    const dict = sessionStorage.get('dict')
    if (dict) {
      Object.assign(dictMap.value, dict)
    }
    isInitDict.value = true
  }

  const dict = async (code: string) => {
    // Initialize before calling
    if (!dictMap.value || Object.keys(dictMap.value).length === 0) {
      initDict()
    }

    const targetDict = await getDict(code)

    return {
      data: () => targetDict,
      enum: () => Object.fromEntries(targetDict.map(({ value, label }) => [value, label])),
      valueMap: () => Object.fromEntries(targetDict.map(({ value, ...data }) => [value, data])),
      labelMap: () => Object.fromEntries(targetDict.map(({ label, ...data }) => [label, data])),
    }
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // state
    dictMap,
    isInitDict,
    // actions
    dict,
    getDict,
    getDictByNet,
    initDict,
  }
}, { persist: false })
