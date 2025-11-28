import { router } from '@/router'
import { useRouteStore } from './route'
import { useTabStore } from './tab'
import { $t, getDeviceId, getDeviceType } from '@/utils'
import { httpAxiosLoading } from '@/services'

const defaultModel: Models.ILogin = {
  username: '',
  password: '',
  remember: true
}

const API_PATH = '/auth'

export const useAuthStore = defineStore('authStore', () => {
  /** ------------------ STATE ------------------ **/
  const user = ref<Models.IUser | null>(null)
  const routes = ref<string[]>([])
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const deviceId = ref<string | null>()
  const deviceType = ref<Common.DeviceType | null>('web')
  const deviceName = ref<string | null>(null)
  /** ------------------ GETTERS ------------------ **/
  const defaultModelGetter = computed(() => structuredClone(defaultModel))
  const getUserId = computed(() => String(user.value?._id))
  const getAvatar = computed(() => user.value?.avatar?.url || null)
  /** ------------------ ACTIONS ------------------ **/
  async function loadDevice(): Promise<{ deviceId: string, deviceType: string }> {
    try {
      deviceId.value = await getDeviceId()
      deviceType.value = getDeviceType()
      return { deviceId: deviceId.value, deviceType: deviceType.value }
    } catch (e: any) {
      return null
    }
  }
  async function login(params?: Models.ILogin): Promise<Common.IResponseAuth> {
    try {
      const res = await httpAxiosLoading.post<Common.IResponseAuth>(API_PATH, { ...params, deviceId: deviceId.value, deviceType: deviceType.value })
      user.value = res.user || null
      routes.value = res.routes || []
      accessToken.value = res.accessToken || null
      refreshToken.value = res.refreshToken || null

      const routeStore = useRouteStore()
      await routeStore.initAuthRoute()

      const { query } = unref(router.currentRoute)
      router.push({ path: (query as any)?.redirect || '/' })
      return res
    } catch (e) {
      return { status: false, message: null } as Common.IResponseAuth
    }
  }

  async function getDevices(): Promise<Common.IResponseItem> {
    try {
      const res = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/devices`)
      return res
    } catch (e: any) {
      return { status: false, message: null } as Common.IResponseAuth
    }
  }

  async function verifyRefresh(): Promise<Common.IResponseItem> {
    try {
      await loadDevice()
      if (!refreshToken.value) {
        await logout()
        return { status: false, message: 'noRefreshToken' } as Common.IResponseItem
      }
      const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/refresh`, {
        refreshToken: refreshToken.value,
        deviceId: deviceId.value
      })
      if (!res.status) {
        await logout()
        window.$message.error($t(`message.error.${res.message}`))
        router.push({ path: '/login' })
      }
      return null
    } catch (e: any) {
      return { status: false, message: null } as Common.IResponseItem
    }
  }

  async function verify(): Promise<Common.IResponseItem> {
    try {
      await loadDevice()

      if (!accessToken.value) {
        await logout()
        return { status: false, message: 'noToken' } as Common.IResponseItem
      }
      const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/verify`, {
        accessToken: accessToken.value
      })
      if (!res.status) {
        await logout()
        window.$message.error($t(`message.error.${res.message}`))
        router.push({ path: '/login' })
      }
      return res
    } catch (e: any) {
      return { status: false, message: null } as Common.IResponseItem
    }
  }

  async function revoke(params: any): Promise<Common.IResponseItem> {
    try {
      const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/revoke`, {
        deviceId: params.deviceId
      })
      if (res.status && params.deviceId === deviceId.value) logout(true)
      return res
    } catch (e: any) {
      return { status: false, message: null } as Common.IResponseItem
    }
  }

  async function logout(isRevoke?: boolean): Promise<boolean> {
    try {
      if (!isRevoke) {
        const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/logout`, {
          deviceId: deviceId.value
        })
      }
      const route = unref(router.currentRoute)

      resetStore()

      const routeStore = useRouteStore()
      routeStore.resetRouteStore()

      const tabStore = useTabStore()
      tabStore.clearAllTabs()

      if (route.meta.require)
        router.push({ name: 'login', query: { redirect: route.fullPath } })
      return true
    } catch (e) {
      throw e
    }
  }

  async function updateProfile(params?: Models.IUser): Promise<Common.IResponseItem> {
    const rs = { data: null, status: false, type: 'update-profile', message: 'error' } as Common.IResponseItem
    try {
      user.value = { ...user.value, ...params }
      rs.data = user.value
      rs.status = true
      rs.message = 'success'
      return rs
    } catch (e) {
      return rs
    }
  }

  // 🧹 RESET STORE (replace this.$reset())
  function resetStore() {
    user.value = null
    routes.value = []
    accessToken.value = null
    refreshToken.value = null
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // state
    user,
    routes,
    accessToken,
    refreshToken,
    deviceId,
    deviceType,
    // getters
    defaultModel: defaultModelGetter,
    getUserId,
    getAvatar,
    // actions
    loadDevice,
    getDevices,
    login,
    verify,
    verifyRefresh,
    revoke,
    logout,
    resetStore,
    updateProfile
  }
}, { persist: true })
