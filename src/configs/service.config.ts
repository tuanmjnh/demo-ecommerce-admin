/** Environment configuration for different request services */
export const serviceConfig: Record<ServiceEnvType, Record<string, string>> = {
  dev: {
    url: 'https://mock.apifox.cn/m1/4071143-0-default',
  },
  prod: {
    url: 'https://mock.apifox.cn/m1/4071143-0-default',
  },
  development: {
    url: 'https://mock.apifox.cn/m1/4071143-0-default',
  },
  production: {
    url: 'https://mock.apifox.cn/m1/4071143-0-default',
  },
  test: {
    url: 'https://mock.apifox.cn/m1/4071143-0-default',
  },
}
