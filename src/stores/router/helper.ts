import type { MenuOption } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'
import { usePermission } from '@/hooks'
import Layout from '@/layouts/index.vue'
import { $t, renderIcon } from '@/utils'
import { arrayToTree } from 'tm-libs/array'
import { clone, min, omit, pick } from 'radash'
import { RouterLink } from 'vue-router'

const metaFields: Models.MetaKeys[] = ['title', 'icon', 'require', 'keep', 'hide', 'sort', 'href', 'active', 'tab', 'pin', 'type']

function standardizedRoutes(route: Models.RouteItem[]) {
  return clone(route).map((i) => {
    const route = omit(i, metaFields)

    Reflect.set(route, 'meta', pick(i, metaFields))
    return route
  }) as Models.Route[]
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
      item.component = modules[`/views${item.component}`]
    return item
  })

  // Generate route tree
  resultRouter = arrayToTree(resultRouter) as Models.Route[]

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
        const visibleChilds = route.children.filter(child => !child.meta.hide)

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
  const visibleMenus = resultMenus.filter(route => !route.meta.hide)

  // generate side menu
  return arrayToTree(transformAuthRoutesToMenus(visibleMenus))
}

// render the returned routing table as a sidebar
function transformAuthRoutesToMenus(userRoutes: Models.Route[]) {
  const { hasPermission } = usePermission()
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
          id: item._id,
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
