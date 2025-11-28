import type { NDateLocale, NLocale } from 'naive-ui'
import { i18n } from '../modules/i18n'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

export function setLocale(locale: LanguageType) {
  i18n.global.locale.value = locale
}

export const $t = i18n.global.t
export const $tm = (keys: string[], isLowerAfter = true) => {
  const result: string[] = []
  for (let i = 0; i < keys.length; i++)
    result.push(i > 0 ? (isLowerAfter ? String($t(keys[i])).toLowerCase() : $t(keys[i])) : $t(keys[i]))
  return result.join(' ')
}

export const naiveI18nOptions: Record<LanguageType, { locale: NLocale | null, dateLocale: NDateLocale | null }> = {
  zhCN: {
    locale: zhCN,
    dateLocale: dateZhCN,
  },
  enUS: {
    locale: enUS,
    dateLocale: dateEnUS,
  },
  viVN: {
    locale: enUS,
    dateLocale: dateEnUS,
  },
  jaJP: {
    locale: enUS,
    dateLocale: dateEnUS,
  },
  koKR: {
    locale: enUS,
    dateLocale: dateEnUS,
  },
}
