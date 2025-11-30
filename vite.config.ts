import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { createVitePlugins } from './vite-plugins'
// import { createViteProxy } from './src/configs/proxy'
// import { serviceConfig } from './src/configs/service.config'
import type { ServiceEnvType } from './src/types/env'
import PACKAGE from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file based on `mode` in current working directory
  const env = loadEnv(mode, __dirname, '') as ImportMetaEnv
  // const envConfig = serviceConfig[mode as ServiceEnvType]
  return {
    base: env.VITE_BASE_URL,
    plugins: createVitePlugins(env),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
        // '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        // '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        // "@layouts": fileURLToPath(new URL('./src/layouts', import.meta.url)),
        // '@locales': fileURLToPath(new URL('./src/locales', import.meta.url)),
        // '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
        // '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
        // '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        // "@stores": fileURLToPath(new URL('./src/stores', import.meta.url)),
        // "@utils": fileURLToPath(new URL('./src/utils', import.meta.url)),
        // "@views": fileURLToPath(new URL('./src/views', import.meta.url))
      },
    },
    // server: {
    //   host: '0.0.0.0',
    //   proxy:  env.VITE_HTTP_PROXY === 'Y' ? createViteProxy(envConfig) : undefined,
    // },
    build: {
      target: 'esnext',
      reportCompressedSize: false, // Enable/disable gzip compressed size reporting
    },
    server: {
      historyApiFallback: true
    }
    optimizeDeps: {
      include: ['echarts', 'md-editor-v3', 'quill'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    define: {
      'import.meta.env.PACKAGE': JSON.stringify(PACKAGE),
    }
  }
})
