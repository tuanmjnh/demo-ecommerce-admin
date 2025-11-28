import { blankInstance, request } from '../http'

/* get method test */
export function fetchGet(params?: any) {
  return request.Get('/getAPI', { params })
}

/* post method test */
export function fetchPost(data: any) {
  return request.Post('/postAPI', data)
}
/* formPost method test */
export function fetchFormPost(data: any) {
  const methodInstance = request.Post('/postFormAPI', data)
  methodInstance.meta = {
    isFormPost: true,
  }
  return methodInstance
}
/* delete method test */
export function fetchDelete() {
  return request.Delete('/deleteAPI')
}
/* put method test */
export function fetchPut(data: any) {
  return request.Put('/putAPI', data)
}
/* interface without token */
export function withoutToken() {
  const methodInstance = request.Get('/getAPI')
  methodInstance.meta = {
    authRole: null,
  }
  return methodInstance
}
/* Interface data conversion */
export function dictData() {
  return request.Get('/getDictData', {
    transform(rawData, _headers) {
      const response = rawData as any
      return {
        ...response,
        data: {
          ...response.data,
          gender: response.data.gender === 0 ? 'Male' : 'Female',
          status: `status is ${response.data.status}`,
        },
      }
    },
  })
}
/* Simulate getting binary files */
export function getBlob(url: string) {
  const methodInstance = blankInstance.Get<Blob>(url)
  methodInstance.meta = {
    // Marked as blob data
    isBlob: true,
  }
  return methodInstance
}

/* Download file with progress */
export function downloadFile(url: string) {
  const methodInstance = blankInstance.Get<Blob>(url)
  methodInstance.meta = {
    // Mark as blob data
    isBlob: true,
  }
  return methodInstance
}
/* Test status code 500 failed */
export function FailedRequest() {
  return request.Get('/serverError')
}

/* Test business code 500 failed */
export function FailedResponse() {
  return request.Post('/businessError')
}
/* Test business code 10000 failed, no prompt */
export function FailedResponseWithoutTip() {
  return request.Post('/businessErrorWithoutTip')
}
/* Token invalidation interface */
export function expiredTokenRequest() {
  return request.Get('/expiredToken')
}
/* Test token refresh interface */
export function refreshToken() {
  return request.Get('/updataToken')
}
