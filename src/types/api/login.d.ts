/// <reference path="../global.d.ts"/>

namespace Api {
  namespace Login {
    /* User fields returned after login. This data is extended from the user table. Some fields may need to be overwritten, such as id */
    interface Info extends Entity.User {
      /** User ID */
      id: number
      /** User role types */
      role: Entity.RoleType[]
      /** Access Token */
      accessToken: string
      /** Refresh token */
      refreshToken: string
    }
  }
}
