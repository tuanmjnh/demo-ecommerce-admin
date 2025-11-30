import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig, CancelTokenSource } from 'axios'
import { $t } from '@/utils/i18n'
import { localStorageNormal } from 'tm-libs/storage'

export enum ContentTypeEnum {
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
  JSON = 'application/json;charset=UTF-8'
}

export enum ResultEnum {
  SUCCESS = 0,
  ERROR = 1
}

const defaultConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': ContentTypeEnum.JSON
  }
}

export class HttpAxios {
  private axiosInstance: AxiosInstance
  private cancelSource?: CancelTokenSource

  constructor(config: AxiosRequestConfig = defaultConfig) {
    this.axiosInstance = axios.create(config)
    this.setupInterceptors()
  }

  /** Setup Interceptors */
  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      config => {
        // useAppStore().setLoading(config.method)
        const accessToken = localStorageNormal.get('authStore.accessToken')
        if (accessToken) config.headers['x-access-token'] = `Bearer ${accessToken}`
        return config
      },
      (error: AxiosError) => {
        // useAppStore().setLoading()
        // showFailToast(error.message)
        window.$message.error(error.message)
        return Promise.reject(error)
      }
    )

    this.axiosInstance.interceptors.response.use(
      (res: AxiosResponse) => {
        // useAppStore().setLoading()
        return res.data
      },
      (error: AxiosError) => {
        // useAppStore().setLoading()
        this.handleError(error)
        return Promise.reject(error.response)
      }
    )
  }

  /** Handle common error messages */
  private handleError(error: AxiosError) {
    const status = error.response?.status
    let message = ''

    switch (status) {
      //   case 400: message = $t('http.400', 'Request error'); break
      case 401:
        if (error.config?.url?.includes('/login')) break
        message = $t('http.401', 'Unauthorized, please log in')
        localStorageNormal.remove('authStore.accessToken')
        location.reload()
        break
      //   case 403: message = $t('http.403', 'Access denied'); break
      //   case 404: message = $t('http.404', `Not found: ${error.config?.url}`); break
      //   case 408: message = $t('http.408', 'Request timeout'); break
      //   case 500: message = $t('http.500', 'Internal Server Error'); break
      //   default: message = $t('http.default', 'Network connection failure')
    }
    // const data = error.response?.data as any
    // console.log(data.message)
    // if (status !== 409) {
    //   if (data?.message) window.$message.error($t(`message.error.${data?.statusMessage || 'error'}`))
    //   else window.$message.error(error.response?.statusText || $t(`message.error.error`))
    // }
  }

  /** Common request */
  public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.request<any>(config)
    return res as T
  }

  /** Debounce request (cancel previous) */
  public debounce<T = any>(config: AxiosRequestConfig): Promise<T> {
    if (this.cancelSource) this.cancelSource.cancel('Request canceled by debounce.')
    this.cancelSource = axios.CancelToken.source()
    config.cancelToken = this.cancelSource.token
    return this.request<T>(config)
  }

  /** Helper for GET */
  public get<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url, method: 'GET', params, ...config })
  }

  /** Helper for POST */
  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url, method: 'POST', data, ...config })
  }

  /** Helper for PUT */
  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url, method: 'PUT', data, ...config })
  }

  /** Helper for PATCH */
  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url, method: 'PATCH', data, ...config })
  }

  /** Helper for DELETE */
  public delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url, method: 'DELETE', params, ...config })
  }
}

// ✅ Export global instance
export const httpAxios = new HttpAxios(defaultConfig)
