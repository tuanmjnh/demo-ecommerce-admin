import MobileDetect from 'mobile-detect'

export function getDeviceType(): 'pc' | 'mobile' | 'tablet' | 'web' {
  const md = new MobileDetect(window.navigator.userAgent)
  if (md.tablet()) return 'tablet'
  if (md.mobile()) return 'mobile'
  return 'web' // or 'PC' if you want to group desktop web together
}
