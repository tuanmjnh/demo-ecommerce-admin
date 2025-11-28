/** Request related type */
declare namespace Service {
  import type { Method } from 'alova'

  interface AlovaConfig {
    baseURL: string
    timeout?: number
    beforeRequest?: (method: Method<globalThis.Ref<unknown>>) => void
  }

  /** Data structure configuration returned by the backend interface */
  interface BackendConfig {
    /** Attribute field indicating the backend request status code */
    codeKey?: string
    /** Attribute field indicating the backend request data */
    dataKey?: string
    /** Attribute field indicating the backend message */
    msgKey?: string
    /** Status of successful request defined in the backend business */
    successCode?: number | string
  }
  type RequestErrorType = 'Response Error' | 'Business Error' | null
  type RequestCode = string | number

  interface RequestError {
    /** Error type of request service */
    errorType: RequestErrorType
    /** Error code */
    code: RequestCode
    /** Error message */
    message: string
    /** Returned data */
    data?: any
  }

  interface ResponseResult<T> extends RequestError {
    /** Whether the request service is successful */
    isSuccess: boolean
    /** The error type of the request service */
    errorType: RequestErrorType
    /** Error code */
    code: RequestCode
    /** Error message */
    message: string
    /** Returned data */
    data: T
  }
}
