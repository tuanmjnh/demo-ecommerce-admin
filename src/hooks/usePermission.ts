import { useAuthStore } from '@/stores'
import { isArray, isString } from 'radash'

/** Permission judgment */
export function usePermission() {
  const authStore = useAuthStore()

  function hasPermission(
    permission?: Entity.RoleType | Entity.RoleType[],
  ) {
    if (!permission)
      return true

    if (!authStore.user)
      return false
    const { roles } = authStore.user

    // If the role is super, it can be passed directly
    let has = roles.includes('super')
    if (!has) {
      if (isArray(permission))
        // Role is an array, determine whether there is an intersection
        has = permission.some(i => roles.includes(i))

      if (isString(permission))
        // Role is a string, check whether it contains
        has = roles.includes(permission)
    }
    return has
  }

  return {
    hasPermission,
  }
}
