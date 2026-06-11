import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { rmSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import electron from 'vite-plugin-electron'
import { notBundle } from 'vite-plugin-electron/plugin'

import pkg from './package.json'

const aliasPath = {
  '@': fileURLToPath(new URL('./renderer', import.meta.url)),
}

const external = [
  ...Object.keys(pkg.dependencies),
  'electron',
  'node:path',
  'node:fs',
  'node:url',
  'node:crypto',
]

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'
  rmSync('dist-electron', { recursive: true, force: true })

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        dirs: [],
        resolvers: [ElementPlusResolver()],
      }),
      electron([
        {
          vite: {
            resolve: {
              alias: aliasPath,
            },
            build: {
              rollupOptions: {
                input: {
                  index: path.resolve(__dirname, 'electron/preload/index.ts'),
                },
                output: {
                  format: 'cjs',
                  dir: 'dist-electron/preload',
                  entryFileNames: '[name].js',
                  chunkFileNames: '[name].js',
                },
                external,
              },
            },
          },
        },
        {
          vite: {
            resolve: {
              alias: aliasPath,
            },
            plugins: [!isProduction && notBundle()],
            build: {
              rollupOptions: {
                input: {
                  index: path.resolve(__dirname, 'electron/main/index.ts'),
                },
                output: {
                  format: 'cjs',
                  dir: 'dist-electron/main',
                  entryFileNames: '[name].js',
                  chunkFileNames: '[name].js',
                },
                external,
              },
            },
          },
        },
      ]),
    ],
    resolve: {
      alias: aliasPath,
    },
    server: {
      port: 8800,
    },
  }
})
