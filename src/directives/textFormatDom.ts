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
  const textFormatDom: Directive<HTMLInputElement | HTMLElement, void> = {
    mounted(el, binding) {
      const mode = binding.arg || 'first' // default: uppercase first letter

      // Hàm xử lý format theo mode
      const transform = (value: string): string => {
        switch (mode) {
          case 'upper':
            return value.toUpperCase()
          case 'lower':
            return value.toLowerCase()
          case 'words':
            return value
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())
          case 'first':
          default:
            return value.length > 0
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : value
        }
      }

      // Lấy & đặt giá trị
      const getValue = (): string => {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          return el.value
        }
        return el.textContent || ''
      }

      const setValue = (value: string) => {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.value = value
          el.dispatchEvent(new Event('input')) // cập nhật v-model
        } else {
          el.textContent = value
        }
      }

      // Khi người dùng nhập
      const handleInput = () => {
        const value = getValue()
        const formatted = transform(value)
        setValue(formatted)
      }

      // Khi blur -> trim tự động
      const handleBlur = () => {
        const value = getValue().trim()
        setValue(value)
      }

      // Gắn sự kiện
      el.addEventListener('input', handleInput)
      el.addEventListener('blur', handleBlur)
    },
  }
  app.directive('text-format-dom', textFormatDom)
}
