import type { App } from 'vue'
import { installRouter } from '@/router'
import { installPinia, useAuthStore } from '@/stores'
import AppVue from './App.vue'
import AppLoading from './components/common/AppLoading.vue'
// import VueDraggableResizable from 'vue-draggable-resizable'

async function setupApp() {
  // Load global loading status
  const appLoading = createApp(AppLoading)
  appLoading.mount('#appLoading')

  // Create a vue instance
  const app = createApp(AppVue)

  // Register module Pinia
  await installPinia(app)

  // Register module Vue-router
  await installRouter(app)

  /* Register module directive/static resource */
  Object.values(import.meta.glob<{ install: (app: App) => void }>('./modules/*.ts', { eager: true, })).map(i => app.use(i))

  //
  await useAuthStore().verify()
  // Unmount loading animation
  setTimeout(() => { appLoading.unmount() }, 600)
  // Unmount loading animation
  // appLoading.unmount()

  // Mount
  // app.component('vue-draggable-resizable', VueDraggableResizable)
  // app.mount('#app').$nextTick(() => {
  //   useAuthStore().verify()
  // })
  app.mount('#app')
}

setupApp()
