// Assumed imports from VueUse for environment context
import { useFullscreen, useColorMode } from '@vueuse/core'
import type { GlobalThemeOverrides } from 'naive-ui'
import { setLocale } from '@/utils'
import { colord } from 'colord'
import { set } from 'radash'
import themeConfig from './theme.json'
import moment from 'moment'

// --- TYPES AND CONSTANTS (Retained) ---
export type TransitionAnimation = '' | 'fade-slide' | 'fade-bottom' | 'fade-scale' | 'zoom-fade' | 'zoom-out'
export type LayoutMode = 'leftMenu' | 'topMenu' | 'mixMenu'

const { VITE_DEFAULT_LANG, VITE_COPYRIGHT_INFO } = import.meta.env

const docEle = ref(document.documentElement)

// Composables must be initialized outside or at the top level of the store creator function
const { isFullscreen, toggle } = useFullscreen(docEle)
const { system, store } = useColorMode({
  emitAuto: true,
})

const CONSTANT = {
  darkMode: false,
  language: 'vi-VN',//'en-US',
  unitPrice: 'vnd',
  font: {
    size: 14,
    family: '"Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#6b6b6b',
    lineHeight: '1.5'
  },
  format: {
    date: 'DD/MM/YYYY',
    time: 'hh:mm:ss A',
    dateTime: {
      date: 'DD/MM/YYYY',
      time: 'hh:mm:ss A'
    }
  },
  dialog: {
    add: true,
    edit: true,
    import: true
  },
  dense: {
    form: true,
    button: true,
    input: true,
    table: true,
    menu: false
  },
  shadow: {
    table: false
  }
}

interface AppState {
  appTitle: string
  footerText: string
  lang: LanguageType
  theme: GlobalThemeOverrides
  primaryColor: string
  collapsed: boolean
  grayMode: boolean
  colorWeak: boolean
  loadFlag: boolean
  showLogo: boolean
  showTabs: boolean
  showFooter: boolean
  showProgress: boolean
  showBreadcrumb: boolean
  showBreadcrumbIcon: boolean
  showWatermark: boolean
  showSetting: boolean
  transitionAnimation: TransitionAnimation
  layoutMode: LayoutMode
  contentFullScreen: boolean
  maxThread: number
  unitPrice: string
  font: {
    size: number
    family: string
    color: string
    lineHeight: string
  }
  format: {
    date: string
    time: string
    dateTime: {
      date: string
      time: string
    }
  }
  dialog: {
    add: boolean
    edit: boolean
    import: boolean
  }
  dense: {
    form: boolean
    button: boolean
    input: boolean
    table: boolean
    menu: boolean
  }
  shadow: {
    table: boolean
  }
}

const defaultState: AppState = {
  appTitle: import.meta.env.VITE_APP_NAME,
  footerText: VITE_COPYRIGHT_INFO,
  lang: (VITE_DEFAULT_LANG?.toString() as LanguageType) ?? 'enUS',
  theme: themeConfig as GlobalThemeOverrides,
  primaryColor: themeConfig.common.primaryColor,
  collapsed: false,
  grayMode: false,
  colorWeak: false,
  loadFlag: true,
  showLogo: true,
  showTabs: true,
  showFooter: true,
  showProgress: true,
  showBreadcrumb: true,
  showBreadcrumbIcon: true,
  showWatermark: false,
  showSetting: false,
  transitionAnimation: 'fade-slide',
  layoutMode: 'leftMenu',
  contentFullScreen: false,
  maxThread: 11,
  unitPrice: 'vnd',
  font: {
    size: 14,
    family: '"Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#6b6b6b',
    lineHeight: '1.5'
  },
  format: {
    date: 'DD/MM/YYYY',
    time: 'hh:mm:ss A',
    dateTime: { date: 'DD/MM/YYYY', time: 'hh:mm:ss A' }
  },
  dialog: { add: true, edit: true, import: true },
  dense: { form: true, button: true, input: true, table: true, menu: false },
  shadow: { table: false }
}
// ----------------------------------------------------

export const useAppStore = defineStore('appStore', () => {
  /** ------------------ STATE (ref) ------------------ **/
  const appTitle = ref(defaultState.appTitle)
  const footerText = ref(defaultState.footerText)
  const lang = ref(defaultState.lang)
  const theme = ref<GlobalThemeOverrides>(JSON.parse(JSON.stringify(defaultState.theme)))
  const primaryColor = ref(defaultState.primaryColor)
  const collapsed = ref(defaultState.collapsed)
  const grayMode = ref(defaultState.grayMode)
  const colorWeak = ref(defaultState.colorWeak)
  const loadFlag = ref(defaultState.loadFlag)
  const showLogo = ref(defaultState.showLogo)
  const showTabs = ref(defaultState.showTabs)
  const showFooter = ref(defaultState.showFooter)
  const showProgress = ref(defaultState.showProgress)
  const showBreadcrumb = ref(defaultState.showBreadcrumb)
  const showBreadcrumbIcon = ref(defaultState.showBreadcrumbIcon)
  const showWatermark = ref(defaultState.showWatermark)
  const showSetting = ref(defaultState.showSetting)
  const transitionAnimation = ref(defaultState.transitionAnimation)
  const layoutMode = ref(defaultState.layoutMode)
  const contentFullScreen = ref(defaultState.contentFullScreen)
  const maxThread = ref(defaultState.maxThread)
  const unitPrice = ref(defaultState.unitPrice)
  const font = ref(defaultState.font)
  const format = ref(defaultState.format)
  const dialog = ref(defaultState.dialog)
  const dense = ref(defaultState.dense)
  const shadow = ref(defaultState.shadow)


  /** ------------------ GETTERS (computed) ------------------ **/
  const storeColorMode = computed(() => store.value)
  const colorMode = computed(() => store.value === 'auto' ? system.value : store.value)
  const fullScreen = computed(() => isFullscreen.value)
  const threads = computed(() => { return [...Array(maxThread.value).keys()].slice(1).map(x => { return { label: String(x), value: x } }) })
  const colors = computed(() => { return theme.value.common })
  const colorSwatches = computed(() => { return ['#FFFFFF', '#18A058', '#2080F0', '#F0A020', '#D03050'] })
  const extensions = computed(() => { return { images: ['jpg', 'jpeg', 'png', 'gif'], videos: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm'] } })
  const pageSizes = computed(() => { return [10, 20, 30, 50, 100] })
  // Getters that return functions
  const minDate = computed(() => {
    return (val?: number | number): Date => {
      const now = new Date()
      now.setFullYear(now.getFullYear() - (val || 100))
      return now
    }
  })

  const maxDate = computed(() => {
    return (val?: number | number): Date => {
      const now = new Date()
      now.setFullYear(now.getFullYear() + (val || 0))
      return now
    }
  })

  const formatDate = computed(() => {
    return (val?: string | Date | number): string => {
      if (val) return moment(val).format(format.value.date)
      else return ''
    }
  })

  const formatTime = computed(() => {
    return (val?: string | Date | number): string => {
      if (val) return moment(val).format(format.value.time)
      else return ''
    }
  })

  const formatDateTime = computed(() => {
    return (val?: string | Date | number): string => {
      if (val) return moment(val).format(`${format.value.date} ${format.value.time}`)
      else return ''
    }
  })

  const formatDateDefault = computed(() => {
    return (val?: string | Date | number): string => {
      if (val) return moment(val).format(CONSTANT.format.date)
      else return ''
    }
  })

  const formatTimeDefault = computed(() => {
    return (val?: string | Date | number): string => {
      if (val) return moment(val).format(CONSTANT.format.time)
      else return ''
    }
  })

  const formatDateToArray = computed(() => {
    return (val?: string | Date | number): Array<string> => {
      if (val) return moment(val).format(CONSTANT.format.date).split('-')
      else return []
    }
  })

  /** ------------------ ACTIONS (Functions) ------------------ **/

  // Reset All Settings
  const resetAlltheme = () => {
    // Reset all refs to their default values
    appTitle.value = defaultState.appTitle
    footerText.value = defaultState.footerText
    lang.value = defaultState.lang
    theme.value = JSON.parse(JSON.stringify(defaultState.theme))
    primaryColor.value = defaultState.primaryColor
    collapsed.value = defaultState.collapsed
    grayMode.value = defaultState.grayMode
    colorWeak.value = defaultState.colorWeak
    loadFlag.value = defaultState.loadFlag
    showLogo.value = defaultState.showLogo
    showTabs.value = defaultState.showTabs
    showFooter.value = defaultState.showFooter
    showProgress.value = defaultState.showProgress
    showBreadcrumb.value = defaultState.showBreadcrumb
    showBreadcrumbIcon.value = defaultState.showBreadcrumbIcon
    showWatermark.value = defaultState.showWatermark
    showSetting.value = defaultState.showSetting
    transitionAnimation.value = defaultState.transitionAnimation
    layoutMode.value = defaultState.layoutMode
    contentFullScreen.value = defaultState.contentFullScreen
    maxThread.value = defaultState.maxThread
    unitPrice.value = defaultState.unitPrice
    font.value = defaultState.font
    format.value = defaultState.format
    dialog.value = defaultState.dialog
    dense.value = defaultState.dense
    shadow.value = defaultState.shadow

    // Reset all colors
    setPrimaryColor(primaryColor.value)
  }

  const setAppLang = (newLang: LanguageType) => {
    setLocale(newLang)
    lang.value = newLang
  }

  // Set theme color
  const setPrimaryColor = (color: string) => {
    const brightenColor = colord(color).lighten(0.05).toHex()
    const darkenColor = colord(color).darken(0.05).toHex()

    primaryColor.value = color

    // Clone the theme object to ensure reactivity update after using radash/set
    const newTheme = JSON.parse(JSON.stringify(theme.value))
    set(newTheme, 'common.primaryColor', color)
    set(newTheme, 'common.primaryColorHover', brightenColor)
    set(newTheme, 'common.primaryColorPressed', darkenColor)
    set(newTheme, 'common.primaryColorSuppl', brightenColor)
    theme.value = newTheme
  }

  const setColorMode = (mode: 'light' | 'dark' | 'auto') => {
    store.value = mode
  }

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    collapsed.value = !collapsed.value
  }

  // Toggle full screen
  const toggleFullScreen = () => {
    toggle()
  }

  /**
   * @description: Page content reload
   * @param {number} delay - delay in milliseconds
   */
  const reloadPage = async (delay = 600) => {
    loadFlag.value = false
    await nextTick()
    if (delay) {
      setTimeout(() => {
        loadFlag.value = true
      }, delay)
    }
    else {
      loadFlag.value = true
    }
  }

  // Switch to color blindness mode
  const toggleColorWeak = () => {
    docEle.value.classList.toggle('color-weak')
    colorWeak.value = docEle.value.classList.contains('color-weak')
  }

  // Toggle Gray Mode
  const toggleGrayMode = () => {
    docEle.value.classList.toggle('gray-mode')
    grayMode.value = docEle.value.classList.contains('gray-mode')
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // State
    appTitle,
    footerText,
    lang,
    theme,
    primaryColor,
    collapsed,
    grayMode,
    colorWeak,
    loadFlag,
    showLogo,
    showTabs,
    showFooter,
    showProgress,
    showBreadcrumb,
    showBreadcrumbIcon,
    showWatermark,
    showSetting,
    transitionAnimation,
    layoutMode,
    contentFullScreen,
    maxThread,
    unitPrice,
    font,
    format,
    dialog,
    dense,
    shadow,

    // Getters
    storeColorMode,
    colorMode,
    fullScreen,
    threads,
    colors,
    colorSwatches,
    extensions,
    pageSizes,
    minDate,
    maxDate,
    formatDate,
    formatTime,
    formatDateTime,
    formatDateDefault,
    formatTimeDefault,
    formatDateToArray,

    // Actions
    resetAlltheme,
    setAppLang,
    setPrimaryColor,
    setColorMode,
    toggleCollapse,
    toggleFullScreen,
    reloadPage,
    toggleColorWeak,
    toggleGrayMode,
  }
}, { persist: true })
