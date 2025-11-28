import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'

// Define RequestType based on keys in state
export type RequestType = 'get' | 'post' | 'put' | 'patch' | 'delete'

export const useLoadingStore = defineStore('loadingStore', () => {
  /** ------------------ STATE (ref) ------------------ **/
  const get = ref(false)
  const post = ref(false)
  const put = ref(false)
  const patch = ref(false)
  const del = ref(false)// Rename 'delete' to 'del' to avoid JS keyword

  // Map refs for dynamic access (e.g. loadingRefs['get'].value)
  const loadingRefs: Record<RequestType, Ref<boolean>> = {
    get,
    post,
    put,
    patch,
    delete: del, // Map 'delete' RequestType tới ref 'del'
  }

  /** ------------------ GETTERS (computed) ------------------ **/
  const isLoading = computed(() => {
    return get.value || post.value || put.value || patch.value || del.value
  })

  /** ------------------ ACTIONS (Functions) ------------------ **/

  function setLoading(type: RequestType, value: boolean) {
    loadingRefs[type].value = value
  }

  /**
   * Wraps an asynchronous function (e.g., an API call) and automatically
   * manages the loading state for the specified request type.
   */
  async function withLoading<T>(type: RequestType, fn: () => Promise<T>): Promise<T> {
    setLoading(type, true)
    try {
      return await fn()
    } finally {
      // Ensure loading state is disabled whether there is an error or not
      setLoading(type, false)
    }
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // State (exposed for direct access if needed)
    get,
    post,
    put,
    patch,
    delete: del,

    // Getters
    isLoading,

    // Actions
    setLoading,
    withLoading,
  }
})