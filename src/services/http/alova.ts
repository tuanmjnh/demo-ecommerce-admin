import { localStorage } from 'tm-libs/storage'
import { createAlova } from 'alova'
import { createServerTokenAuthentication } from 'alova/client'
import adapterFetch from 'alova/fetch'
import VueHook from 'alova/vue'
import type { VueHookType } from 'alova/vue'
import {
  DEFAULT_ALOVA_OPTIONS,
  DEFAULT_BACKEND_OPTIONS,
} from './config'
import {
  handleBusinessError,
  handleRefreshToken,
  handleResponseError,
  handleServiceResult,
} from './handle'

const { onAuthRequired, onResponseRefreshToken } = createServerTokenAuthentication<VueHookType>({
  // The server determines that the token has expired
  refreshTokenOnSuccess: {
    // When the server returns 401, it means the token has expired.
    isExpired: (response, method) => {
      const isExpired = method.meta && method.meta.isExpired
      return response.status === 401 && !isExpired
    },

    // Triggered when the token expires, trigger the refresh token in this function
    handler: async (_response, method) => {
      // Limitations are imposed here to prevent expired requests from being resent in an infinite loop
      if (!method.meta)
        method.meta = { isExpired: true }
      else
        method.meta.isExpired = true

      await handleRefreshToken()
    },
  },
  // Add token to request header
  assignToken: (method) => {
    method.config.headers.Authorization = `Bearer ${localStorage.get('accessToken')}`
  },
})

// docs path of alova.js https://alova.js.org/
export function createAlovaInstance(
  alovaConfig: Service.AlovaConfig,
  backendConfig?: Service.BackendConfig,
) {
  const _backendConfig = { ...DEFAULT_BACKEND_OPTIONS, ...backendConfig }
  const _alovaConfig = { ...DEFAULT_ALOVA_OPTIONS, ...alovaConfig }

  return createAlova({
    statesHook: VueHook,
    requestAdapter: adapterFetch(),
    cacheFor: null,
    baseURL: _alovaConfig.baseURL,
    timeout: _alovaConfig.timeout,

    beforeRequest: onAuthRequired((method) => {
      if (method.meta?.isFormPost) {
        method.config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        method.data = new URLSearchParams(method.data as URLSearchParams).toString()
      }
      alovaConfig.beforeRequest?.(method)
    }),
    responded: onResponseRefreshToken({
      // Request success interceptor
      onSuccess: async (response, method) => {
        const { status } = response

        if (status === 200) {
          // Return blob data
          if (method.meta?.isBlob)
            return response.blob()

          // Return json data
          const apiData = await response.json()
          // Request Success
          if (apiData[_backendConfig.codeKey] === _backendConfig.successCode)
            return handleServiceResult(apiData)

          // Business request failed
          const errorResult = handleBusinessError(apiData, _backendConfig)
          return handleServiceResult(errorResult, false)
        }
        // Interface request failed
        const errorResult = handleResponseError(response)
        return handleServiceResult(errorResult, false)
      },
      onError: (error, method) => {
        const tip = `[${method.type}] - [${method.url}] - ${error.message}`
        window.$message?.warning(tip)
      },

      onComplete: async (_method) => {
        // Handling request completion logic
      },
    }),
  })
}
