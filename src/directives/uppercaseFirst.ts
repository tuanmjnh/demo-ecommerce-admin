import type { App, Directive } from 'vue'

export function install(app: App) {
  const uppercaseFirst: Directive<HTMLInputElement | HTMLElement, void> = {
    mounted(el) {
      const formatValue = (value: string) => {
        if (!value) return ''
        return value.charAt(0).toUpperCase() + value.slice(1)
      }

      // Apply immediately when mounted
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = formatValue(el.value)
        el.addEventListener('input', () => {
          const newValue = formatValue(el.value)
          if (newValue !== el.value) el.value = newValue
        })
      } else {
        el.textContent = formatValue(el.textContent || '')
        const observer = new MutationObserver(() => {
          el.textContent = formatValue(el.textContent || '')
        })
        observer.observe(el, { childList: true, characterData: true, subtree: true })
      }
    }
  }
  app.directive('uppercase-first', uppercaseFirst)
}
