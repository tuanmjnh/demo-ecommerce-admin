import type { App, Directive } from 'vue'

export function install(app: App) {
  /**
* Directive: v-text-format:[mode]
* mode: 'first' | 'words' | 'upper' | 'lower'
*
* ✅ Capitalize the first letter: v-text-format:first
* ✅ Capitalize the first letter of each word: v-text-format:words
* ✅ All uppercase: v-text-format:upper
* ✅ All lowercase: v-text-format:lower
* ✅ Auto trim when blur (default on)
*/
  const textFormatWrapper: Directive = {
    mounted(el, binding) {
      const mode = binding.arg || 'first'

      // Hàm định dạng
      const transform = (value: string): string => {
        switch (mode) {
          case 'upper':
            return value.toUpperCase()
          case 'lower':
            return value.toLowerCase()
          case 'words':
            return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
          case 'first':
          default:
            return value.length > 0
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : value
        }
      }

      // Đợi DOM input thật sự sẵn sàng (Naive UI render async)
      const setupInputListener = () => {
        const inputEl =
          el.querySelector('input') || el.querySelector('textarea') || el

        if (!inputEl) return

        const handleInput = () => {
          const value = (inputEl as HTMLInputElement).value
          const formatted = transform(value)
          if (value !== formatted) {
            ; (inputEl as HTMLInputElement).value = formatted
            inputEl.dispatchEvent(new Event('input'))
          }
        }

        const handleBlur = () => {
          const value = (inputEl as HTMLInputElement).value.trim()
            ; (inputEl as HTMLInputElement).value = value
          inputEl.dispatchEvent(new Event('input'))
        }

        inputEl.addEventListener('input', handleInput)
        inputEl.addEventListener('blur', handleBlur)
      }

      // Chờ Naive UI render xong
      setTimeout(setupInputListener, 0)
    }
  }
  app.directive('text-format-wrapper', textFormatWrapper)
}
