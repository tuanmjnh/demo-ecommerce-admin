import type { RouteLocationNormalized } from 'vue-router'
import { router } from '@/router'

// @ts-ignore
export const useTabStore = defineStore('tabStore', () => {
  /** ------------------ STATE (ref) ------------------ **/

  // Tabs that are permanently pinned and cannot be closed dynamically
  const pinTabs = ref<RouteLocationNormalized[]>([])
  // Dynamic tabs that can be opened and closed
  const tabs = ref<RouteLocationNormalized[]>([])
  // The fullPath of the currently active tab
  const currentTabPath = ref<string>('')

  /** ------------------ GETTERS (computed) ------------------ **/

  // Combines pinTabs and dynamic tabs into a single list
  const getAllTabs = computed(() => [...pinTabs.value, ...tabs.value])

  /** ------------------ HELPER FUNCTIONS ------------------ **/

  /**
   * Checks if a tab with the given fullPath already exists in either pinTabs or tabs.
   * @param fullPath - The full path of the route.
   */
  const hasExistTab = (fullPath: string) => {
    const _tabs = [...pinTabs.value, ...tabs.value]
    return _tabs.some((item) => item.fullPath === fullPath)
  }

  /**
   * Gets the index of a dynamic tab based on its fullPath.
   * @param fullPath - The full path of the route.
   * @returns The index in the `tabs` array, or -1 if not found.
   */
  const getTabIndex = (fullPath: string) => {
    return tabs.value.findIndex((item) => item.fullPath === fullPath)
  }

  /** ------------------ ACTIONS (Functions) ------------------ **/

  /**
   * Adds a new tab if it meets the criteria (meta.tab is true and not existing).
   * @param route - The route object to add.
   */
  const addTab = (route: RouteLocationNormalized) => {
    // Determine whether to add based on meta
    if (!route.meta.tab) return

    // Do not add if the tag name already exists
    if (hasExistTab(route.fullPath as string)) return

    // Pass to different groups based on meta.pin
    if (route.meta.pin) {
      pinTabs.value.push(route)
    } else {
      tabs.value.push(route)
    }
  }

  /**
   * Closes a tab and handles navigation logic.
   * @param fullPath - The full path of the tab to close.
   */
  const closeTab = async (fullPath: string) => {
    const tabsLength = tabs.value.length
    const index = getTabIndex(fullPath)

    // Check if the tab being closed is the current active tab
    if (currentTabPath.value === fullPath) {
      // Determine next navigation target
      if (tabsLength > 1) {
        // If it's not the last one, jump to the next tab
        if (index + 1 < tabsLength) {
          await router.push(tabs.value[index + 1].fullPath)
        }
        // If it is the last one, jump to the previous one
        else if (index > 0) {
          await router.push(tabs.value[index - 1].fullPath)
        }
      }
    }

    // Delete tab
    tabs.value = tabs.value.filter((item) => item.fullPath !== fullPath)

    // If all dynamic tabs are cleared after deletion, jump to the default homepage
    if (tabsLength - 1 === 0 && pinTabs.value.length === 0) {
      await router.push('/')
    }
  }

  /**
   * Closes all tabs except the one specified.
   * @param fullPath - The full path of the tab to keep.
   */
  const closeOtherTabs = (fullPath: string) => {
    const index = getTabIndex(fullPath)
    if (index !== -1) {
      tabs.value = [tabs.value[index]]
    }
  }

  /**
   * Closes all tabs to the left of the specified tab (inclusive of the current tab).
   * @param fullPath - The full path of the tab to keep and everything to its right.
   */
  const closeLeftTabs = (fullPath: string) => {
    const index = getTabIndex(fullPath)
    if (index !== -1) {
      tabs.value = tabs.value.filter((_item, i) => i >= index)
    }
  }

  /**
   * Closes all tabs to the right of the specified tab (inclusive of the current tab).
   * @param fullPath - The full path of the tab to keep and everything to its left.
   */
  const closeRightTabs = (fullPath: string) => {
    const index = getTabIndex(fullPath)
    if (index !== -1) {
      tabs.value = tabs.value.filter((_item, i) => i <= index)
    }
  }

  /**
   * Clears all dynamic and pinned tabs.
   */
  const clearAllTabs = () => {
    tabs.value = []
    pinTabs.value = []
  }

  /**
   * Closes all dynamic tabs and navigates to the homepage.
   */
  const closeAllTabs = async () => {
    tabs.value = []
    await router.push('/')
  }

  /**
   * Sets the currently active tab path.
   * @param fullPath - The full path of the active tab.
   */
  const setCurrentTab = (fullPath: string) => {
    currentTabPath.value = fullPath
  }

  /**
   * Allows modification of a specific tab's route object (e.g., updating meta data).
   * @param fullPath - The full path of the tab to modify.
   * @param modifyFn - A function to apply changes to the route object.
   */
  const modifyTab = (fullPath: string, modifyFn: (route: RouteLocationNormalized) => void) => {
    const index = getTabIndex(fullPath)
    if (index !== -1) {
      modifyFn((tabs.value[index] as RouteLocationNormalized))
    }
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // State
    pinTabs,
    tabs,
    currentTabPath,

    // Getters
    getAllTabs,

    // Actions
    addTab,
    closeTab,
    closeOtherTabs,
    closeLeftTabs,
    closeRightTabs,
    clearAllTabs,
    closeAllTabs,
    hasExistTab,
    setCurrentTab,
    getTabIndex,
    modifyTab,
  }
}, { persist: true }) // Persistence enabled, matching original config
