// src/types.ts
export namespace Common {
  export type MenuType = 'CATEGORY' | 'CONTENT' | 'EXTERNAL' | 'GROUP'


  export interface IChangeData {
    by: string
    at: string // ISO date string
  }
}


export interface Menu {
  id: string
  title: string
  icon: string
  pid?: string | null
  type: Common.MenuType
  // Navigation type
  refId?: string | null // categoryId or contentId (optional for EXTERNAL)
  url?: string | null // if it is an external link
  sort: number
  flag: number
  created: Common.IChangeData | null
  updated?: Common.IChangeData | null
}