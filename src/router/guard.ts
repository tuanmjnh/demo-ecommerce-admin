import type { Router } from 'vue-router'
import { useAuthStore, useAppStore, useRouteStore, useTabStore } from '@/stores'
import { $t } from '@/utils'
const title = import.meta.env.VITE_APP_NAME

export function setupRouterGuard(router: Router) {
  const authStore = useAuthStore()
  const appStore = useAppStore()
  const routeStore = useRouteStore()
  const tabStore = useTabStore()

  router.beforeEach(async (to, from, next) => {
    // console.log(useRouter().getRoutes())
    // Determine whether it is an external link. If it is, open the web page directly and intercept the jump
    if (to.meta.href) {
      window.open(to.meta.href)
      return false
    }
    // Start loadingBar
    appStore.showProgress && window.$loadingBar?.start()

    // Determine whether there is a TOKEN and log in for authentication
    // const authStore = local.get('authStore')
    if (!authStore.isAuthenticated) {
      if (to.name === 'login') next()

      if (to.name !== 'login') {
        const redirect = to.name === '404' ? undefined : to.fullPath
        next({ path: '/login', query: { redirect } })
      }
      return false
    }

    // Logged in → Checking token
    // try {
    //   const verifyRes = await authStore.verify()
    //   if (!verifyRes) {
    //     const refreshRes = await authStore.verifyRefresh()
    //     if (!refreshRes) {
    //       // Refresh token has expired → forced logout.
    //       await authStore.logout()
    //       return next({ name: 'login' })
    //     }
    //   }
    // } catch {
    //   await authStore.logout()
    //   return next({ name: 'login' })
    // }

    // If the route hasn't been initialized yet, reload the page.
    if (!routeStore.isInitAuthRoute) {
      await routeStore.initAuthRoute()
      // After dynamic routing is loaded, return to the root routing
      if (to.name === '404') {
        // Wait for the permission routing to be loaded, return to the previous routing, otherwise 404
        next({
          path: to.fullPath,
          replace: true,
          query: to.query,
          hash: to.hash,
        })
        return false
      }
    }

    // Do not allow access to the login page after already being logged in.
    if (to.name === 'login') {
      return next({ path: '/' })
      // return false
    }
    next()
    return true
  })
  router.beforeResolve((to) => {
    // Set menu highlight
    routeStore.setActiveMenu(to.meta.active ?? to.fullPath)
    // Add tabs
    tabStore.addTab(to)
    // Set highlight tag;
    tabStore.setCurrentTab(to.fullPath as string)
  })

  router.afterEach((to) => {
    // Modify the page title
    document.title = `${$t(`route.${String(to.name)}`, to.meta.title)} - ${title}`
    // End loadingBar
    appStore.showProgress && window.$loadingBar?.finish()
  })
}
