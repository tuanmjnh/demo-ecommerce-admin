import type { App } from 'vue'
import { localStorageNormal } from 'tm-libs/storage'
import { createI18n } from 'vue-i18n'
import enUS from '../locales/enUS.json'
import viVN from '../locales/viVN.json'
import zhCN from '../locales/zhCN.json'
import jaJP from '../locales/jaJP.json'
import koKR from '../locales/koKR.json'

const { VITE_DEFAULT_LANG } = import.meta.env
const appStore = localStorageNormal.get('appStore')
// console.log(appStore?.lang || VITE_DEFAULT_LANG)
export const i18n = createI18n({
  legacy: false,
  locale: appStore?.lang || VITE_DEFAULT_LANG, // Default display language
  fallbackLocale: VITE_DEFAULT_LANG,
  messages: {
    enUS,
    viVN,
    zhCN,
    jaJP,
    koKR,
  },
  // Missing internationalization key warning
  // missingWarn: false,

  // Missing fallback content warning
  fallbackWarn: false,
})

export function install(app: App) {
  app.use(i18n)
}
