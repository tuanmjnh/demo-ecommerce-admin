/// <reference path="../global.d.ts"/>

/* Role database table fields */
namespace Entity {
  type RoleType = 'super' | 'admin' | 'user'

  interface Role {
    /** User ID */
    id?: number
    /** Role type */
    role?: RoleType
  }
}
