import { request } from '../http'

// Get all route information
export function fetchAllRoutes() {
  return request.Get<Service.ResponseResult<AppRoute.RowRoute[]>>('/getUserRoutes')
}

// Get all user information
export function fetchUserPage() {
  return request.Get<Service.ResponseResult<Entity.User[]>>('/userPage')
}
// Get all role lists
export function fetchRoleList() {
  return request.Get<Service.ResponseResult<Entity.Role[]>>('/role/list')
}

/**
 * Request to get dictionary list
 *
 * @param code - dictionary code, used to filter specific dictionary list
 * @returns returned dictionary list data
 */
export function fetchDictList(code?: string) {
  const params = { code }
  return request.Get<Service.ResponseResult<Entity.Dict[]>>('/dict/list', { params })
}
