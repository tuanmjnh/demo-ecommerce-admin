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
import Layout from '@/layouts/index.vue'
const API_PATH = '/route'

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
      item.component = modules[`/src/views${item.component}`]

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
      //  Sort the menu according to the order size
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

export const useRouteStore = defineStore('routeStore', {
  persist: false,
  state: (): {
    all: Models.RouteItem[]
    items: Models.RouteItem[]
    item: Models.RouteItem
    isInitAuthRoute: boolean
    menus: MenuOption[]
    rowRoutes: Models.RouteItem[]
    activeMenu: string | null
    cacheRoutes: string[]
  } => ({
    all: [],
    items: [],
    item: JSON.parse(JSON.stringify(defaultModel)),
    isInitAuthRoute: false,
    activeMenu: null,
    menus: [],
    rowRoutes: [],
    cacheRoutes: [],
  }),
  getters: {
    defaultModel: () => JSON.parse(JSON.stringify(defaultModel)),
    getRoutes: (state) => {
      if (import.meta.env.VITE_ROUTE_LOAD_MODE === 'dynamic') return state.all
      else return staticRoutes
    },
    getRoutesTree: (state) => {
      if (import.meta.env.VITE_ROUTE_LOAD_MODE === 'dynamic') return arrayToTree(state.all)
      else return arrayToTree(staticRoutes)
    },
    getRoutesTreeDisable: (state) => {
      if (import.meta.env.VITE_ROUTE_LOAD_MODE === 'dynamic') {
        return arrayToTree(state.all)
      }
      else {
        const routesTree = staticRoutes.map(x => ({ ...x, ...{ checkboxDisabled: x.access } }))
        return arrayToTree(routesTree)
      }
    },
    staticRoutes: () => staticRoutes,
    staticRoutesTree: () => arrayToTree(staticRoutes)
  },
  actions: {
    async getAll(params?: any): Promise<Common.IResponseItems> {
      try {
        if (import.meta.env.VITE_ROUTE_LOAD_MODE === 'dynamic') {
          params = params ? JSON.parse(JSON.stringify(params)) : {}
          const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/all`, params)
          this.all = rs.data.items as Models.RouteItem[]
          return rs
        }
        return null
      } catch (e) { throw e }
    },
    async get(params?: any): Promise<Common.IResponseItems> {
      try {
        const rs = await httpAxiosLoading.get<Common.IResponseItems>(API_PATH, params)
        this.items = rs.data.items as Models.RouteItem[]
        return rs
      } catch (e) { throw e }
    },
    async getPid(params?: any): Promise<Common.IResponseItems> {
      try {
        const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/pid`, params)
        return rs
      } catch (e) { throw e }
    },
    async getDistinct(params?: any): Promise<Common.IResponseItems> {
      try {
        const rs = await httpAxiosLoading.get<Common.IResponseItems>(`${API_PATH}/distinct`, params)
        return rs
      } catch (e) { throw e }
    },
    async findById(params?: string): Promise<Common.IResponseItem> {
      try {
        const rs = await httpAxiosLoading.get<Common.IResponseItem>(`${API_PATH}/${params}`)
        this.item = rs.data
        return rs
      } catch (e) { throw e }
    },
    async create(params?: any) {
      try {
        const rs = await httpAxiosLoading.post<Common.IResponseItem>(API_PATH, params)
        if (rs.status) {
          this.items = addItems(this.items, rs.data)
          this.all = addItems(this.all, rs.data)
        }
        return rs
      } catch (e) { throw e }
    },
    async update(params?: any) {
      try {
        const rs = await httpAxiosLoading.put<Common.IResponseItem>(`${API_PATH}/${params._id}`, params)
        if (rs.status) {
          this.items = updateItems(this.items, rs.data, '_id')
          this.all = updateItems(this.all, rs.data, '_id')
        }
        return rs
      } catch (e) { throw e }
    },
    async updateFlag(items: (string | number)[], flag: number) {
      try {
        const rs = await httpAxiosLoading.patch<Common.IResponseArray>(API_PATH, { items, flag })
        if (rs.status) {
          this.items = removeItems(this.items, items, '_id')
          // this.all = removeItems(this.all, items, '_id')
        }
        return rs
      } catch (e) { throw e }
    },
    async setItem(params?: any) {
      this.item = params ? JSON.parse(JSON.stringify(params)) : JSON.parse(JSON.stringify(defaultModel))
    },
    changeIDRoutes() {
      const routes = [...this.staticRoutes]
      for (let index = 0; index < routes.length; index++) {
        routes[index].id = index + 1
      }
      for (const e of routes) {
        const find = routes.find(x => x._id === e.pid)
        if (find) e.pid = find.id

      }
      // for (const e of routes) {
      //   delete e._id
      // }
      return routes
    },
    resetRouteStore() {
      this.resetRoutes()
      this.$reset()
    },
    resetRoutes() {
      if (router.hasRoute('appRoot'))
        router.removeRoute('appRoot')
    },
    // set the currently highlighted menu key
    setActiveMenu(key: string) {
      this.activeMenu = key
    },

    async initRouteInfo(authStore: any) {
      if (import.meta.env.VITE_ROUTE_LOAD_MODE === 'dynamic') {
        // const userInfo = local.get('userInfo')
        if (!authStore.user || !authStore.user?._id) {
          authStore.logout()
          return null
        }

        // Get user's route
        // const { data } = await fetchUserRoutes({
        //   id: authStore.user._id,
        // })
        const data = [] as any
        if (!data)
          return null

        return data
      }
      else {
        this.rowRoutes = staticRoutes
        return staticRoutes
      }
    },
    async initAuthRoute() {
      this.isInitAuthRoute = false
      const authStore = useAuthStore()

      // Initialize route information
      let rowRoutes = await this.initRouteInfo(authStore)
      // console.log(rowRoutes)
      if (!rowRoutes) {
        window.$message.error($t(`app.getRouteError`))
        return null
      }

      //Check exist in Auth routes
      rowRoutes = existAuthRoutes(rowRoutes, authStore.routes)
      this.rowRoutes = rowRoutes

      // Generate actual route and insert
      const routes = createRoutes(rowRoutes)

      router.addRoute(routes)
      // console.log(routes)
      // Generate side menu
      this.menus = createMenus(rowRoutes)

      // Generate the route cache
      this.cacheRoutes = generateCacheRoutes(rowRoutes)

      this.isInitAuthRoute = true
    },
    // easily reset state using `$reset`
    clear() {
      this.$reset()
    }
  }
})
