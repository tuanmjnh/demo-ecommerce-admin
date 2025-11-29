import type { App } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export * from './config'
export * from './app/index'
export * from './loading'
export * from './route'
export * from './auth'
// export * from './dict'
// export * from './router'
export * from './tab'
export * from './options'
export * from './group'
export * from './role'
export * from './user'
export * from './posts'
export * from './product'
export * from './cloudinary'
export * from './menu'
export * from './company'
export * from './billing'

// Install the pinia global state library
export function installPinia(app: App) {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
}
