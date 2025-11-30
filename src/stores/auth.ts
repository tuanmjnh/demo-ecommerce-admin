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
  const deviceId = ref<string | null>(null)
  const deviceType = ref<Common.DeviceType>('web')
  const deviceName = ref<string | null>(null)

  /** ------------------ GETTERS ------------------ **/
  const getDefaultModel = computed(() => JSON.parse(JSON.stringify(defaultModel)))
  const getUserId = computed(() => String(user.value?._id ?? ''))
  const getAvatar = computed(() => user.value?.avatar?.url ?? null)
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const modelAuth = ref<Models.ILogin>({
    username: '',
    password: '',
    remember: false
  })

  /** ------------------ DEVICE ------------------ **/
  async function loadDevice(): Promise<{ deviceId: string, deviceType: string }> {
    deviceId.value = await getDeviceId()
    deviceType.value = getDeviceType()
    return { deviceId: deviceId.value, deviceType: deviceType.value }
  }

  /** ------------------ AUTH ACTIONS ------------------ **/
  function routeRedirect() {
    const { query } = unref(router.currentRoute)
    router.push({ path: (query as any)?.redirect || '/' })
  }
  /** Login */
  async function login(params?: Models.ILogin): Promise<Common.IResponseAuth> {
    try {
      await loadDevice()
      const res = await httpAxiosLoading.post<Common.IResponseAuth>(`${API_PATH}/login`, {
        ...params,
        deviceId: deviceId.value,
        deviceType: deviceType.value
      })

      user.value = res.user
      routes.value = res.routes || []
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      // Initialize route after login
      const routeStore = useRouteStore()
      await routeStore.initAuthRoute()

      routeRedirect()

      return res
    } catch (error) {
      return { statusMessage: 'serverError', status: false, ...error?.data } as Common.IResponseAuth
    }
  }

  /** Refresh Token (when accessToken expires) */
  async function verifyRefresh(): Promise<boolean> {
    try {
      if (!refreshToken.value || !deviceId.value) return false

      const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/refresh`, {
        refreshToken: refreshToken.value,
        deviceId: deviceId.value
      })

      if (res.status && res.data?.accessToken) {
        accessToken.value = res.data.accessToken
        refreshToken.value = res.data.refreshToken ?? refreshToken.value
        routeRedirect()
        return true
      } else {
        await logout()
        return false
      }
    } catch {
      await logout()
      return false
    }
  }

  /** Verify Access Token (check when loading the app) */
  async function verify(): Promise<boolean> {
    try {
      if (!accessToken.value) return false
      const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/verify`, { accessToken: accessToken.value })
      if (res.status) return true
      // Token expired → try refreshing
      return await verifyRefresh()
    } catch {
      //return await verifyRefresh()
      await logout()
      return false
    }
  }

  /** Get the list of devices */
  async function getDevices(): Promise<Common.IResponseItem> {
    try {
      return await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/devices`)
    } catch {
      return { status: false, message: 'error' } as Common.IResponseItem
    }
  }

  /** Revoke the device */
  async function revoke(params: { deviceId: string }): Promise<Common.IResponseItem> {
    try {
      const res = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/revoke`, { deviceId: params.deviceId })
      if (res.status && params.deviceId === deviceId.value) await logout(true)
      return res
    } catch {
      return { status: false, message: 'error' } as Common.IResponseItem
    }
  }

  /** Logout */
  async function logout(isRevoke = false): Promise<boolean> {
    const route = unref(router.currentRoute)
    try {
      if (!isRevoke && deviceId.value)
        await httpAxiosLoading.post(`${API_PATH}/logout`, { deviceId: deviceId.value })

      resetStore()

      useRouteStore().resetRouteStore()
      useTabStore().clearAllTabs()

      if (route.meta.require) router.push({ name: 'login', query: { redirect: route.fullPath } })
      return true
    } catch (e) {
      // console.error(e)
      resetStore()
      router.push({ name: 'login', query: { redirect: route.fullPath } })
      return false
    }
  }

  /** Update local profile */
  async function updateProfile(params?: Models.IUser): Promise<Common.IResponseItem> {
    user.value = { ...user.value, ...params }
    return { status: true, message: 'success', data: user.value, type: 'update-profile' }
  }

  /** Reset Store */
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
    deviceName,
    modelAuth,
    // getters
    getDefaultModel,
    getUserId,
    getAvatar,
    isAuthenticated,
    // actions
    loadDevice,
    login,
    verifyRefresh,
    verify,
    getDevices,
    revoke,
    logout,
    updateProfile,
    resetStore
  }
}, { persist: true })
