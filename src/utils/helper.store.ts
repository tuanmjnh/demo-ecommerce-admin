import debounce from 'lodash/debounce'
import { NewGuid } from 'tm-libs/crypto'
export const generateCode = () => {
  return NewGuid().split('-')[0].toUpperCase()
}
export const getRequestItems = (params?: any, extras?: any) => {
  if (!params) return null
  const rs = {
    text: params.text || null,
    sortBy: params.sortBy || null,
    sortType: params.sortType || null, //1 ASC, -1 DESC
    flag: params.flag !== undefined ? params.flag : 1,
    groups: params.groups || 1,
    page: params.page || null,
    limit: params.limit || null,
  }
  return extras ? { ...rs, ...extras } : rs
}

export const getResponseItems = (params: any, result: any) => {
  if (params && result && result.total) {
    params.total = result.total
    params.pages = result.limit ? Math.ceil(result.total / result.limit) : params.pages
  }
  return params
}

export function useExistValidator(delay = 400) {
  let resolver: (value: boolean) => void

  const debouncedFn = debounce(async (checkFn: () => Promise<boolean>) => {
    const result = await checkFn()
    resolver(result)
  }, delay)

  function validate(checkFn: () => Promise<boolean>) {
    return new Promise<boolean>(resolve => {
      resolver = resolve
      debouncedFn(checkFn)
    })
  }

  return { validate }
}
