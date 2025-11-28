// src/stores/menuStore.ts
import type { Menu } from './types'
import { demoMenus } from './demo-menus'

export const useMenuStore = defineStore('menu', () => {
  const items = ref<Menu[]>([...demoMenus])


  function getById(id: string) {
    return items.value.find(i => i.id === id) ?? null
  }


  function listRoot() {
    return items.value.filter(i => !i.pid).sort((a, b) => a.sort - b.sort)
  }


  function listChildren(pid: string) {
    return items.value.filter(i => i.pid === pid).sort((a, b) => a.sort - b.sort)
  }


  function create(menu: Menu) {
    items.value.push(menu)
  }


  function update(id: string, patch: Partial<Menu>) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return false
    items.value[idx] = { ...items.value[idx], ...patch, updated: { by: 'me', at: new Date().toISOString() } }
    return true
  }


  function remove(id: string) {
    // remove item and its descendants
    const toRemove = new Set<string>([id])
    for (let i = 0; i < items.value.length; i++) {
      if (toRemove.has(items.value[i].pid || '')) {
        toRemove.add(items.value[i].id)
      }
    }
    items.value = items.value.filter(i => !toRemove.has(i.id))
  }


  const tree = computed(() => {
    const map = new Map<string, Menu & { children?: Menu[] }>()
    items.value.forEach(m => map.set(m.id, { ...m }))
    const root: Array<Menu & { children?: Menu[] }> = []
    map.forEach((node) => {
      if (node.pid) {
        const parent = map.get(node.pid)
        if (parent) {
          parent.children ??= []
          parent.children.push(node)
        } else {
          root.push(node)
        }
      } else {
        root.push(node)
      }
    })
    // sort children
    function sortNodes(nodes?: (Menu & { children?: Menu[] })[]) {
      nodes?.sort((a, b) => a.sort - b.sort)
      nodes?.forEach(n => sortNodes(n.children))
    }
    sortNodes(root)
    return root
  })


  return { items, getById, listRoot, listChildren, create, update, remove, tree }
})