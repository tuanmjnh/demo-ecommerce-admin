import { NTooltip, NButton, NSpace, NPopconfirm, NPopselect, NTag } from 'naive-ui'
import NovaIcon from '@/components/common/NovaIcon.vue'
import { h } from 'vue'

type typeButton = 'default' | 'primary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error'
type typeTag = 'default' | 'success' | 'info' | 'warning' | 'error'

export const renderLabelCell = (option: any, colorMode: string) => {
  const colorStyle = option.color ? (colorMode === 'dark' ? 'inherit' : `color: ${option.color};`) : ''
  return h(
    'div', { class: 'inline-flex items-center align-middle', style: `vertical-align: middle;${colorStyle}` },
    [option.icon ? h(NovaIcon, { icon: option.icon, class: 'align-middle items-center mr-2' }) : '', h('span', { class: 'leading-none' }, option.title)]
  )
}

export const renderLabelSelect = (option: any, colorMode: string) => {
  const colorStyle = option.color ? (colorMode === 'dark' ? 'inherit' : `color: ${option.color};`) : ''
  return h(
    'div', { class: 'flex items-center', style: colorStyle },
    [option.icon ? h(NovaIcon, { icon: option.icon, class: 'mr-2' }) : '', h('span', { class: 'leading-none' }, option.title)]
  )
}

export const renderLabelIcon = (option: any, colorMode: string, callBackTitle?: any) => {
  const colorStyle = option.color ? (colorMode === 'dark' ? 'inherit' : `color: ${option.color};`) : ''
  return h(
    'div', { class: 'flex items-center', style: colorStyle },
    [option.icon ? h(NovaIcon, { icon: option.icon, class: 'mr-2' }) : '', h('span', { class: 'leading-none' }, callBackTitle ? callBackTitle(option) : option.title)]
  )
}

export function renderTooltipCell(text: any) {
  return h(NTooltip,
    { scrollable: true, 'content-class': 'text-wrap', style: 'max-height: 260px; max-width: 600px;' },
    {
      trigger: () => h('span', { class: 'block truncate', innerHTML: text }),
      default: () => h('span', { innerHTML: text })
    }
  )
}

export function renderTagsCell(tags: { title: string, type?: typeTag, color?: string }[], colorMode: string) {
  const renderTags = (g) => h(NTag,
    { type: g.type, bordered: false, style: g.color ? (colorMode === 'dark' ? 'inherit' : `color: ${g.color};`) : '' },
    { default: () => g.title })
  return h(NSpace, { size: 'small' }, { default: () => tags.map(renderTags) })
}

export interface RenderTagsOptions {
  tags: { title: string; type?: typeTag; color?: string }[]
  bordered?: boolean
  customText?: string
  maxWidth?: string
  maxHeight?: string
}

export function renderTagsPreviewTooltip({ tags, bordered = true, customText, maxWidth = '600px', maxHeight = '260px' }: RenderTagsOptions) {
  if (!tags || tags.length === 0) return h('span', { innerHTML: '-' })

  // Initial display text
  const previewText = customText || tags[0].title

  // Function to render each tag
  // const colorStype = (tag) => tag.color ? colorMode === 'dark' ? 'inherit' : `color: ${tag.color};` : ''
  // const bgColorStyle = colorMode !== 'dark' ? 'background: initial;' : ''
  const renderTag = (tag: any) =>
    h(NTag,
      { type: tag.type, bordered: true },
      { default: () => tag.title }
    )

  // Tooltip content: display the entire tag list
  const tooltipContent = h(NSpace, { size: 'small', wrap: true }, { default: () => tags.map(renderTag) })

  // Tooltip + trigger text
  return h(NTooltip,
    { scrollable: true, 'content-class': 'text-wrap', style: `max-height: ${maxHeight}; max-width: ${maxWidth};` },
    {
      trigger: () => h('span', { class: 'truncate block' }, previewText),
      default: () => tooltipContent
    }
  )
}

export interface ActionButtonOption {
  label: string
  value: string | number
  icon?: string
  color?: string
}

export interface ActionButtonConfig {
  /** tooltip text or i18n key */
  text?: string
  /** button icon, e.g. 'icon-park-outline:edit' */
  icon?: string
  iconClass?: string
  /** button color (success | info | error | warning...) */
  type?: typeButton,
  quaternary?: boolean,
  circle?: boolean,
  /** when button is clicked */
  onClick?: (row: any) => void
  /** whether to popconfirm or not */
  confirm?: {
    /** text or i18n key to display in popup */
    title: string
    onConfirm: (row: any) => void
    positiveText?: string
    negativeText?: string
  }
  options?: ActionButtonOption[]
  onSelect?: (row: any, val: string) => void
  /** whether to show this button or not */
  visible?: boolean | ((row: any) => boolean)
}

// Function to render custom action button group
export function renderActionButtons(row: any, buttons: ActionButtonConfig[]) {
  // Filter out invisible buttons
  const visibleButtons = buttons.filter(btn => {
    if (typeof btn.visible === 'function') return btn.visible(row)
    if (typeof btn.visible === 'boolean') return btn.visible
    return true
  })

  // Render each node
  const renderButton = (btn: ActionButtonConfig) => {
    const iconNode = h(NovaIcon, { icon: btn.icon, class: btn.iconClass })
    const text = btn.text || 'Button'
    // If confirmed
    if (btn.confirm) {
      return h(NTooltip, null, {
        trigger: () =>
          h(NPopconfirm,
            {
              'positive-text': btn.confirm?.positiveText || 'Confirm',
              'negative-text': btn.confirm?.negativeText || 'Cancel',
              onPositiveClick: () => btn.confirm?.onConfirm(row)
            },
            {
              trigger: () =>
                h(NButton,
                  { type: btn.type || 'default', quaternary: btn.quaternary || true, circle: btn.circle || true },
                  { default: () => btn.icon ? iconNode : text }
                ),
              default: () => btn.confirm?.title || 'confirmation of implementation'
            }
          ),
        default: () => text
      })
    }

    // If Button Dropdown
    if (btn.options && btn.onSelect) {
      return h(NPopselect,
        {
          options: btn.options as any,
          'on-update:value': (val: any) => btn.onSelect?.(row, val),
          'render-label': (option: ActionButtonOption) => h('div', { class: 'flex items-center gap-2' }, [
            option.icon && h(NovaIcon, { icon: option.icon, style: { color: option.color || 'inherit' } }),
            h('span', option.label)
          ])
        },
        {
          default: () =>
            h(NButton,
              { type: btn.type || 'default', quaternary: btn.quaternary ?? true, circle: btn.circle ?? true },
              { default: () => iconNode || text }
            )
        }
      )
    }

    // If there is no confirm → just button + tooltip
    return h(NTooltip, null, {
      trigger: () =>
        h(NButton,
          { type: btn.type || 'default', quaternary: btn.quaternary || true, circle: btn.circle || true, onClick: () => btn.onClick?.(row) },
          { default: () => btn.icon ? iconNode : text }
        ),
      default: () => text
    })
  }

  return h(NSpace, { size: 'small' }, { default: () => visibleButtons.map(renderButton) })
}
