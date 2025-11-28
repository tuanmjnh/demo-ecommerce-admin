import { AxiosRequestConfig } from 'axios'
import { httpAxios } from './httpAxios'
import { useLoadingStore, RequestType } from '@/stores/loading'

export class HttpAxiosLoading {
  // Main wrapper — automatically enable/disable loading by method
  public async requestWithLoading<T = any>(config: AxiosRequestConfig): Promise<T> {
    const loadingStore = useLoadingStore()
    const method = (config.method?.toLowerCase() || 'get') as RequestType

    try {
      loadingStore.setLoading(method, true)
      const res = await httpAxios.request<T>(config)
      return res
    } catch (error) {
      throw error
    } finally {
      loadingStore.setLoading(method, false)
    }
  }

  /** Shortcut methods */
  public get<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
    return this.requestWithLoading<T>({ url, method: 'GET', params, ...config })
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.requestWithLoading<T>({ url, method: 'POST', data, ...config })
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.requestWithLoading<T>({ url, method: 'PUT', data, ...config })
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.requestWithLoading<T>({ url, method: 'PATCH', data, ...config })
  }

  public delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
    return this.requestWithLoading<T>({ url, method: 'DELETE', params, ...config })
  }
}

/** ✅ Export instance for use across the app */
export const httpAxiosLoading = new HttpAxiosLoading()
