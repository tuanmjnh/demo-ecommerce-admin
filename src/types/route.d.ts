declare namespace AppRoute {

  type MenuType = 'dir' | 'page'
  /** Meta identifier carried by a single route */
  interface RouteMeta {
    /* Page title, usually required. */
    title: string
    /* Icon, usually used with menu */
    icon?: string
    /* Whether login permission is required. */
    requiresAuth?: boolean
    /* Accessible roles */
    roles?: Entity.RoleType[]
    /* Whether to enable page cache */
    keepAlive?: boolean
    /* Some routes we don't want to display in the menu, such as some edit pages. */
    hide?: boolean
    /* Menu sorting. */
    order?: number
    /* Nested external links */
    href?: string
    /** The current route is not displayed in the left menu, but a menu needs to be highlighted */
    activeMenu?: string
    /** Will the current route be added to the Tab */
    withoutTab?: boolean
    /** Will the current route be fixed in the Tab for some permanent pages */
    pinTab?: boolean
    /** Is the current route a directory or a page in the left menu? If not set, the default is page */
    menuType?: MenuType
  }

  type MetaKeys = keyof RouteMeta

  interface baseRoute {
    /** Route name (route unique identifier) ​​ */
    name: string
    /** Route path */
    path: string
    /** Route redirection */
    redirect?: string
    /* Page component address */
    componentPath?: string | null
    /* Route id */
    id: number | string
    /* Parent route id, null for top-level page */
    pid: number | string | null
  }

  /** The type structure of a single route (dynamic routing mode: the backend returns a route of this type of structure) */
  type RowRoute = RouteMeta & baseRoute

  /** The actual routing structure mounted on the project */
  interface Route extends baseRoute {
    /** Subrouting */
    children?: Route[]
    /* Page Components */
    component: any
    /** Route Description */
    meta: RouteMeta
  }

}
