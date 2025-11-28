import { fetchUpdateToken } from '@/services'
import { useAuthStore } from '@/stores'
import { localStorage } from 'tm-libs/storage'
import {
  ERROR_NO_TIP_STATUS,
  ERROR_STATUS,
} from './config'

type ErrorStatus = keyof typeof ERROR_STATUS

/**
 * @description: The request is processed successfully, but the backend server reports an error
 * @param {Response} response
 * @return {*}
 */
export function handleResponseError(response: Response) {
  const error: Service.RequestError = {
    errorType: 'Response Error',
    code: 0,
    message: ERROR_STATUS.default,
    data: null,
  }
  const errorCode: ErrorStatus = response.status as ErrorStatus
  const message = ERROR_STATUS[errorCode] || ERROR_STATUS.default
  Object.assign(error, { code: errorCode, message })

  showError(error)

  return error
}

/**
 * @description:
 * @param {Record} data Background data returned by the interface
 * @param {Service} config Background field configuration
 * @return {*}
 */
export function handleBusinessError(data: Record<string, any>, config: Required<Service.BackendConfig>) {
  const { codeKey, msgKey } = config
  const error: Service.RequestError = {
    errorType: 'Business Error',
    code: data[codeKey],
    message: data[msgKey],
    data: data.data,
  }

  showError(error)

  return error
}

/**
 * @description: Unify success and failure return types
 * @param {any} data
 * @param {boolean} isSuccess
 * @return {*} result
 */
export function handleServiceResult(data: any, isSuccess: boolean = true) {
  const result = {
    isSuccess,
    errorType: null,
    ...data,
  }
  return result
}

/**
 * @description: Handle interface token refresh
 * @return {*}
 */
export async function handleRefreshToken() {
  const authStore = useAuthStore()
  const isAutoRefresh = import.meta.env.VITE_AUTO_REFRESH_TOKEN === 'Y'
  if (!isAutoRefresh) {
    await authStore.logout()
    return
  }

  // Refresh token
  const { data } = await fetchUpdateToken({ refreshToken: localStorage.get('refreshToken') })
  if (data) {
    localStorage.set('accessToken', data.accessToken)
    localStorage.set('refreshToken', data.refreshToken)
  }
  else {
    // Refresh failed, exit
    await authStore.logout()
  }
}

export function showError(error: Service.RequestError) {
  // If the error does not require a prompt, skip it
  const code = Number(error.code)
  if (ERROR_NO_TIP_STATUS.includes(code))
    return

  window.$message.error(error.message)
}
