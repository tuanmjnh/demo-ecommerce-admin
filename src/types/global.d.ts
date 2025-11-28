import type moment from 'moment'
import type { $t, $tm } from '../renderer/utils/i18n'
import { IConfig } from './system/config'
/* Stores the database entity table type, the specific content is in ./entities */
declare namespace Entity {
}

/* The data type returned by various interfaces, the specific content is in ./api */
declare namespace Api {

}

declare global {
  interface Window {
    $loadingBar: import('naive-ui').LoadingBarApi
    $dialog: import('naive-ui').DialogApi
    $message: import('naive-ui').MessageApi
    $notification: import('naive-ui').NotificationApi
  }

  interface DictType {
    label: string
    value: string | number
    key?: string | number
  }

  interface Config {
    rootPath: string
    downloadPath: string
    resourcesPath: string
    resourcesUnpackedPath: string
    splitChart?: string
    passwordResetDefault?: string
    secretKey: string
    deviceId: string
    deviceType: DeviceType
    maxDevices: {
      PC: number,
      mobile: number,
      tablet: number,
    }
    routeLoadMode: RouteLoadMode
    expireAuth: number
    localIP: string
    publicIP?: string | null
    syncFFmpegConfiguration: boolean
  }

  export interface FileManagerType {
    files: string[];
    folders: string[];
  }
  export interface FileStat {
    name: string;
    fullPath: string;
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
  }
  export interface FileNode extends FileStat {
    type: "file" | "folder";
    children?: FileNode[];
  }
  export interface FileOptions {
    extensions?: string[];
    exclude?: string[];
    depth?: number; // 0 = unlimited
    isSlashPath?: boolean
  }

  type LanguageType = 'enUS' | 'viVN' | 'zhCN' | 'jaJP' | 'koKR'
  type RequestType = 'get' | 'post' | 'put' | 'patch' | 'delete'
  type DeviceType = 'PC' | 'mobile' | 'tablet'
  type RouteLoadMode = 'static' | 'dynamic'
  type ViewType = 1 | 0
  type ModalType = 'add' | 'edit' | 'view' | 'copy'
  type selectFolder = 'input' | 'output'
  type selectFile = 'main' | 'sub'
  type Message = 'success' | 'error'
}

declare const AMap: any
declare const BMap: any

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof $t
    $tm: typeof $tm
    $moment: typeof moment
    $router: Router
  }
}

declare namespace NaiveUI {
  type ThemeColor = 'default' | 'error' | 'primary' | 'info' | 'success' | 'warning'
}

// Fix the slots type of the TabPane component of naive-ui https://github.com/tusen-ai/naive-ui/issues/6779 , but this will cause more types of errors and you will not be able to view the source code of naive-ui
// declare module 'naive-ui' {
//   interface TabPaneSlots {
//     tab?: () => VNode[]
//   }
// }
declare namespace Storage {
  interface Session {
    dict: DictMap
  }

  interface Local {
    /* Store Application Settings */
    appStore: any
    /* Store user information */
    authStore: Models.ILoginStore
    /* Store access token */
    accessToken: string
    /* Store refresh token */
    refreshToken: string
    /* Store login account */
    loginAccount: any
    /* Store current language */
    lang: App.lang
  }
}
interface DictMap {
  [key: string]: Entity.Dict[]
}
