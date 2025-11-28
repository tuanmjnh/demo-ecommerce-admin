import { generateProxyPattern } from '@/configs/proxy'
import { serviceConfig } from '@/configs/service.config'
import { createAlovaInstance } from './alova'

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y'
const { url } = generateProxyPattern(serviceConfig[import.meta.env.MODE || 'test'])

export const request = createAlovaInstance({
  baseURL: isHttpProxy ? url.proxy : url.value,
})

export const blankInstance = createAlovaInstance({
  baseURL: '',
})
