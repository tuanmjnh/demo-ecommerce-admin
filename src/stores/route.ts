import type { MenuOption } from 'naive-ui'
import { router } from '@/router'
import { staticRoutes } from '@/router/routes.static'
import { useAuthStore } from '@/stores/auth'
import { $t, renderIcon } from '@/utils'
import { arrayToTree } from 'tm-libs/array'
import type { RouteRecordRaw } from 'vue-router'
// import { usePermission } from '@/hooks'
import { clone, min, omit, pick } from 'radash'
import { RouterLink } from 'vue-router'
import { httpAxiosLoading } from '@/services'
import { addItems, updateItems, removeItems } from 'tm-libs/array'
import { localStorageNormal } from 'tm-libs/storage'
import Layout from '@/layouts/index.vue'

const API_PATH = '/route'
const loadMode = localStorageNormal.get('AppConfig')?.route_load_mode || 'static'

// Default Model
const defaultModel: Models.RouteItem = {
  _id: '',
  id: null,
  pid: null,
  name: '',
  path: '',
  component: '',
  title: '',
  group: null,
  icon: 'icon-park-outline:link-one',
  require: true,
  keep: false,
  hide: false,
  redirect: '',
  href: '',
  active: '',
  tab: true,
  pin: false,
  type: 'page',
  sort: 1,
  flag: 1,
  created: { at: Date.now(), by: '', ip: '' },
  updated: null
}

const metaFields: Models.MetaKeys[] = ['title', 'icon', 'require', 'keep', 'hide', 'sort', 'href', 'active', 'tab', 'pin', 'type', 'group']

function standardizedRoutes(route: Models.RouteItem[]) {
  return clone(route).map((i) => {
    const route = omit(i, metaFields)

    Reflect.set(route, 'meta', pick(i, metaFields))
    return route
  }) as Models.Route[]
}

function existAuthRoutes(routes: Models.RouteItem[], authRoutes: string[] | null) {
  if (authRoutes && authRoutes.length)
    return routes.filter(x => authRoutes.includes(x.name))
  return routes.filter(x => x.access)
}

export function createRoutes(routes: Models.RouteItem[]) {
  // const { hasPermission } = usePermission()

  // Structure the meta field
  let resultRouter = standardizedRoutes(routes)

  // Route permission filtering
  // resultRouter = resultRouter.filter(i => hasPermission(i.meta.roles))

  // Generate routes, no need to import files for those with redirect
  const modules = import.meta.glob('@/views/**/*.vue')
  resultRouter = resultRouter.map((item: Models.Route) => {
    if (item.component && !item.redirect)
      item.component = modules[`/src/views${item.component}`] as any

    return item
  })

  // Generate route tree
  resultRouter = arrayToTree(resultRouter) as Models.Route[]
  // console.log(resultRouter)
  const appRootRoute: RouteRecordRaw = {
    path: '/appRoot',
    name: 'appRoot',
    redirect: import.meta.env.VITE_HOME_PATH,
    component: Layout,
    meta: {
      title: '',
      icon: 'icon-park-outline:home',
    },
    children: [],
  }

  // Set the correct redirect path for the route
  setRedirect(resultRouter)
  // Insert the processed route into the root route
  appRootRoute.children = resultRouter as unknown as RouteRecordRaw[]
  return appRootRoute
}

// Generate an array of route names that need to be kept alive
export function generateCacheRoutes(routes: Models.RouteItem[]) {
  return routes.filter(i => i.keep).map(i => i.name)
}

function setRedirect(routes: Models.Route[]) {
  routes.forEach((route) => {
    if (route.children) {
      if (!route.redirect) {
        // Filter out a collection of child elements that are not hidden
        const visibleChilds = route.children.filter(child => child.meta && !child.meta.hide)

        // Redirect page to the path of the first child element by default
        let target = visibleChilds[0]

        // Filter out pages with the order attribute
        const orderChilds = visibleChilds.filter(child => child.meta.sort)

        if (orderChilds.length > 0)
          target = min(orderChilds, i => i.meta.sort!) as Models.Route

        if (target)
          route.redirect = target.path
      }

      setRedirect(route.children)
    }
  })
}

/* Generate data for the side menu */
export function createMenus(userRoutes: Models.RouteItem[]) {
  const resultMenus = standardizedRoutes(userRoutes)

  // filter menus that do not need to be displayed
  const visibleMenus = resultMenus.filter(route => route.meta && !route.meta.hide)

  // generate side menu
  return arrayToTree(transformAuthRoutesToMenus(visibleMenus))
}

// render the returned routing table as a sidebar
function transformAuthRoutesToMenus(userRoutes: Models.Route[]) {
  // const { hasPermission } = usePermission()
  return (
    userRoutes
      // Filter out side menus without permission
      // .filter(i => hasPermission(i.meta.roles))
      //  Sort the menu according to the order size
      .sort((a, b) => {
        if (a.meta && a.meta.sort && b.meta && b.meta.sort)
          return a.meta.sort - b.meta.sort
        else if (a.meta && a.meta.sort)
          return -1
        else if (b.meta && b.meta.sort)
          return 1
        else return 0
      })
      // Convert to side menu data structure
      .map((item) => {
        const target: MenuOption = {
          id: item.id,
          pid: item.pid,
          label:
            !item.meta.type || item.meta.type === 'page'
              ? () =>
                h(
                  RouterLink,
                  {
                    to: {
                      path: item.path,
                    },
                  },
                  { default: () => $t(`route.${String(item.name)}`, item.meta.title) },
                )
              : () => $t(`route.${String(item.name)}`, item.meta.title),
          key: item.path,
          icon: item.meta.icon ? renderIcon(item.meta.icon) : undefined,
        }
        return target
      })
  )
}

export const useRouteStore = defineStore('routeStore', () => {
  // --- State (ref) ---
  const all = ref<Models.RouteItem[]>([])
  const items = ref<Models.RouteItem[]>([])
  const item = ref<Models.RouteItem>(JSON.parse(JSON.stringify(defaultModel)))
  const isInitAuthRoute = ref(false)
  const menus = ref<MenuOption[]>([])
  const rowRoutes = ref<Models.RouteItem[]>([])
  const activeMenu = ref<string | null>(null)
  const cacheRoutes = ref<string[]>([])

  // --- Getters (computed) ---
  const getDefaultModel = computed(() => JSON.parse(JSON.stringify(defaultModel)))

  const getRoutes = computed(() => {
    if (loadMode === 'dynamic') return all.value
    else return staticRoutes
  })

  const getRoutesTree = computed(() => {
    if (loadMode === 'dynamic') return arrayToTree(all.value)
    else return arrayToTree(staticRoutes)
  })

  const getRoutesTreeDisable = computed(() => {
    if (loadMode === 'dynamic') {
      return arrayToTree(all.value)
    }
    else {
      const routesTree = staticRoutes.map(x => ({ ...x, ...{ checkboxDisabled: x.access } }))
      return arrayToTree(routesTree)
    }
  })

  const getStaticRoutes = computed(() => staticRoutes)
  const getStaticRoutesTree = computed(() => arrayToTree(staticRoutes))


  // --- Actions (functions) ---

  async function getAll(params?: any): Promise<Common.IResponseItems> {
    try {
      if (loadMode === 'dynamic') {
        params = params ? JSON.parse(JSON.stringify(params)) : {}
        const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, params)
        all.value = rs.data.items as Models.RouteItem[]
        return rs
      }
      return null as any // Type assertion for compatibility
    } catch (e) { throw e }
  }

  async function get(params?: any): Promise<Common.IResponseItems> {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, params)
      items.value = rs.data.items as Models.RouteItem[]
      return rs
    } catch (e) { throw e }
  }

  async function getPid(params?: any): Promise<Common.IResponseItems> {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/pid`, params)
      return rs
    } catch (e) { throw e }
  }

  async function getDistinct(params?: any): Promise<Common.IResponseItems> {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/distinct`, params)
      return rs
    } catch (e) { throw e }
  }

  async function findById(params?: string): Promise<Common.IResponseItem> {
    try {
      const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${params}`)
      item.value = rs.data
      return rs
    } catch (e) { throw e }
  }

  const exist = async (args: { filter: object, id?: string | number }): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(`${API_PATH}/exist`, args)
      return rs.status
    } catch (e) { throw e }
  }

  async function create(params?: any) {
    try {
      const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, params)
      if (rs.status) {
        items.value = addItems(items.value, rs.data)
        all.value = addItems(all.value, rs.data)
      }
      return rs
    } catch (e) { throw e }
  }

  async function update(params?: any) {
    try {
      const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${params._id}`, params)
      if (rs.status) {
        items.value = updateItems(items.value, rs.data, '_id')
        all.value = updateItems(all.value, rs.data, '_id')
      }
      return rs
    } catch (e) { throw e }
  }

  async function updateFlag(ids: (string | number)[], flag: number) {
    try {
      const rs = await httpAxiosLoading.patch<Common.IResponseArray>(API_PATH, { items: ids, flag })
      if (rs.status) {
        items.value = removeItems(items.value, ids, '_id')
        // all.value = removeItems(all.value, ids, '_id') // Kept as commented out like original
      }
      return rs
    } catch (e) { throw e }
  }

  function setItem(params?: any) {
    item.value = params ? JSON.parse(JSON.stringify(params)) : JSON.parse(JSON.stringify(defaultModel))
  }

  function changeIDRoutes() {
    const routes = [...staticRoutes]
    for (let index = 0; index < routes.length; index++) {
      routes[index].id = index + 1
    }
    for (const e of routes) {
      const find = routes.find(x => x._id === e.pid)
      if (find) e.pid = find.id

    }
    return routes
  }

  // Reset routes from router
  function resetRoutes() {
    if (router.hasRoute('appRoot'))
      router.removeRoute('appRoot')
  }

  // Reset all state properties to their initial values
  function clear() {
    all.value = []
    items.value = []
    item.value = JSON.parse(JSON.stringify(defaultModel))
    isInitAuthRoute.value = false
    menus.value = []
    rowRoutes.value = []
    activeMenu.value = null
    cacheRoutes.value = []
  }

  // Reset state and router
  function resetRouteStore() {
    resetRoutes()
    clear()
  }

  // set the currently highlighted menu key
  function setActiveMenu(key: string) {
    activeMenu.value = key
  }

  async function initRouteInfo(authStore: any) {
    if (loadMode === 'dynamic') {
      if (!authStore.user || !authStore.user?._id) {
        authStore.logout()
        return null
      }

      // Simulate fetchUserRoutes call
      const data = [] as any
      if (!data)
        return null

      return data
    }
    else {
      rowRoutes.value = staticRoutes
      return staticRoutes
    }
  }

  async function initAuthRoute() {
    isInitAuthRoute.value = false
    const authStore = useAuthStore()

    // Initialize route information
    let newRowRoutes = await initRouteInfo(authStore)
    if (!newRowRoutes) {
      window.$message.error($t(`app.getRouteError`))
      return null
    }

    //Check exist in Auth routes
    newRowRoutes = existAuthRoutes(newRowRoutes, authStore.routes)
    rowRoutes.value = newRowRoutes

    // Generate actual route and insert
    const routes = createRoutes(newRowRoutes)
    router.addRoute(routes)
    // Generate side menu
    menus.value = createMenus(newRowRoutes)

    // Generate the route cache
    cacheRoutes.value = generateCacheRoutes(newRowRoutes)

    isInitAuthRoute.value = true
  }

  // Returns all state, getters, and actions for use in components
  return {
    // State
    all,
    items,
    item,
    isInitAuthRoute,
    menus,
    rowRoutes,
    activeMenu,
    cacheRoutes,

    // Getters
    getDefaultModel,
    getRoutes,
    getRoutesTree,
    getRoutesTreeDisable,
    getStaticRoutes,
    getStaticRoutesTree,

    // Actions
    getAll,
    get,
    getPid,
    getDistinct,
    findById,
    exist,
    create,
    update,
    updateFlag,
    setItem,
    changeIDRoutes,
    resetRouteStore,
    resetRoutes,
    setActiveMenu,
    initRouteInfo,
    initAuthRoute,
    clear,
  }
})