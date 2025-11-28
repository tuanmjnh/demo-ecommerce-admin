import { useAuthStore, useOptionsStore, useGroupStore } from '@/stores'
export const loadBaseData = () => {
  try {
    const authStore = useAuthStore()
    const optionsStore = useOptionsStore()
    const groupStore = useGroupStore()
    if (authStore.accessToken) {
      // if (!optionsStore.all.length)
      optionsStore.getAll()
      // if (!groupStore.all.length)
      groupStore.getAll()
    }
  } catch (error) {
    window.$message.error(String(error))
  }
}
