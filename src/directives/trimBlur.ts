import type { App, Directive } from 'vue'

export function install(app: App) {
  const trimOnBlur: Directive<HTMLElement, boolean | undefined> = {
    mounted(el: HTMLElement, binding) {
      // Chỉ áp dụng cho các phần tử input, textarea
      const input = el instanceof HTMLInputElement
        ? el
        : (el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null);
      if (!input) return;

      const handleBlur = () => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          const trimmed = input.value.trim();
          if (input.value !== trimmed) {
            input.value = trimmed;
            // Trigger input event để cập nhật v-model
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      };

      // Lưu handler để có thể remove sau
      (el as any)._trimOnBlurHandler = handleBlur;
      input.addEventListener('blur', handleBlur);

      // Nếu directive có giá trị (ví dụ: v-trim-on-blur="true"), có thể bật/tắt
      if (binding.value === false) {
        input.removeEventListener('blur', handleBlur);
      }
    },

    updated(el: HTMLElement, binding) {
      const input = el instanceof HTMLInputElement
        ? el
        : (el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null);
      if (!input || !(el as any)._trimOnBlurHandler) return;

      const handler = (el as any)._trimOnBlurHandler;

      if (binding.value === false) {
        input.removeEventListener('blur', handler);
      } else if (binding.oldValue === false) {
        input.addEventListener('blur', handler);
      }
    },

    unmounted(el: HTMLElement) {
      const input = el instanceof HTMLInputElement
        ? el
        : (el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null);
      const handler = (el as any)._trimOnBlurHandler;
      if (input && handler) {
        input.removeEventListener('blur', handler);
        delete (el as any)._trimOnBlurHandler;
      }
    },
  }
  app.directive('trim-blur', trimOnBlur)
}
