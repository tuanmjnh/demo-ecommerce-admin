import type { App, Directive } from 'vue'

export function install(app: App) {
  /** Helpers */
  function getValue(el: HTMLElement): string {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return el.value
    }
    return el.textContent || ''
  }

  function setValue(el: HTMLElement, value: string) {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.value = value
      el.dispatchEvent(new Event('input'))
    } else {
      el.textContent = value
    }
  }
  const uppercaseFirst: Directive<HTMLInputElement | HTMLElement, void> = {
    mounted(el) {
      const handleInput = () => {
        const value = getValue(el)
        const transformed = value
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
        setValue(el, transformed)
      }
      el.addEventListener('input', handleInput)
    }
  }
  app.directive('uppercase-words', uppercaseFirst)
}
