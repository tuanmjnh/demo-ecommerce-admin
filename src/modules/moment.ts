import type { App } from 'vue'
import moment from 'moment'

export function install(app: App) {
  // app.provide('$moment', moment)
  app.config.globalProperties.$moment = moment
}
