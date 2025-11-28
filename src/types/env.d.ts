/// <reference types="vite/client" />
/**
 *Environment type of backend service
 * - dev: backend development environment
 * - test: backend test environment
 * - prod: backend production environment
 */
export type ServiceEnvType = 'dev' | 'prod' | 'development' | 'production' | 'test'

export interface ImportMetaEnv {
  /** Project base address */
  readonly VITE_BASE_URL: string
  /** Project title */
  readonly VITE_APP_NAME: string
  /** Enable request proxy */
  readonly VITE_HTTP_PROXY?: 'Y' | 'N'
  /** Whether to enable package compression */
  readonly VITE_BUILD_COMPRESS?: 'Y' | 'N'
  /** Compression algorithm type */
  readonly VITE_COMPRESS_TYPE?: 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw'
  /** Routing mode */
  readonly VITE_ROUTE_MODE?: 'hash' | 'web'
  /** Route loading mode */
  readonly VITE_ROUTE_LOAD_MODE: 'static' | 'dynamic'
  /** First page loading */
  readonly VITE_HOME_PATH: string
  /** Copyright information */
  readonly VITE_COPYRIGHT_INFO: string
  /** Whether to automatically refresh token */
  readonly VITE_AUTO_REFRESH_TOKEN: 'Y' | 'N'
  /** Default language */
  readonly VITE_DEFAULT_LANG: App.lang
  /** Backend service environment type */
  readonly MODE: ServiceEnvType
  /** package */
  readonly PACKAGE: any
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}
