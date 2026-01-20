/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

/* eslint-env node */
import 'dotenv/config'
import path from 'path'
import { configure } from 'quasar/wrappers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default configure(function (ctx) {
  return {
    // https://quasar.dev/quasar-cli/supporting-ts
    // supportTS: false,

    // https://quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/boot-files
    boot: [
      'pinia',
      'vue-query',
      'vee-validate',
      'vuelidate',
      'ccComponents',
      'apex'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.sass'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      env: {
        VUE_URL_API: process.env.VUE_URL_API || 'http://localhost:8082',
        VUE_FACEBOOK_APP_ID: process.env.VUE_FACEBOOK_APP_ID
      },
      vueRouterMode: 'history', // available values: 'hash', 'history'

      // transpile: false,
      // publicPath: '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: false, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/handling-vite
      extendViteConf(viteConf) {
        // Auto-import de APIs (ref, computed, useRouter, storeToRefs, etc.)
        viteConf.plugins.push(
          AutoImport({
            imports: [
              // Vue APIs
              'vue',
              // Vue Router
              'vue-router',
              // Pinia
              'pinia',
              // VueUse (useDebounceFn, useDark, useLocalStorage, etc.)
              '@vueuse/core',
              // Quasar
              {
                quasar: [
                  'useQuasar',
                  'Notify',
                  'Dialog',
                  'LocalStorage',
                  'SessionStorage',
                  'Loading',
                  'QSpinnerGears'
                ]
              },
              {
                'vee-validate': [
                  'useForm',
                  'useField',
                  'defineRule'
                ]
              },
              {
                'yup': [
                  'object',
                  'string',
                  'number',
                  'boolean',
                  'array'
                ]
              }
            ],
            dirs: [
              // Seus stores customizados
              'src/stores',
              // Seus composables
              'src/composables'
            ],
            vueTemplate: true,
            dts: 'src/auto-imports.d.ts',
            eslintrc: {
              enabled: true,
              filepath: './.eslintrc-auto-import.json',
              globalsPropValue: true
            }
          })
        )

        // Auto-import de Componentes Vue
        viteConf.plugins.push(
          Components({
            dirs: [
              'src/components',
              'src/layouts',
              'src/pages/api',
              'src/pages/atendimento',
              'src/pages/campanhas',
              'src/pages/chatFlow',
              'src/pages/configuracoes',
              'src/pages/contatos',
              'src/pages/dashboard',
              'src/pages/empresassuper',
              'src/pages/etiquetas',
              'src/pages/filas',
              'src/pages/fluxoAutoResposta',
              'src/pages/horarioAtendimento',
              'src/pages/mensagensRapidas',
              'src/pages/relatorios',
              'src/pages/sessaoWhatsapp',
              'src/pages/sessaosuper',
              'src/pages/usuarios',
              'src/pages/usuariossuper'
            ],
            extensions: ['vue'],
            deep: true,
            dts: 'src/components.d.ts',
            resolvers: [
              QuasarResolver({
                importStyle: 'scss',
                autoImportIcons: true
              })
            ]
          })
        )
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = {
          ...viteConf.resolve.alias,
          src: path.resolve(__dirname, './src'),
          pages: path.resolve(__dirname, './src/pages'),
          layouts: path.resolve(__dirname, './src/layouts'),
          components: path.resolve(__dirname, './src/components'),
          boot: path.resolve(__dirname, './src/boot'),
          stores: path.resolve(__dirname, './src/stores'),
          assets: path.resolve(__dirname, './src/assets')
        }
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 9000,
      open: true // opens browser window automatically
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      config: {
        dark: false
      },

      lang: 'pt-br',
      iconSet: 'material-icons', // Quasar icon set

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'Notify',
        'Dialog',
        'LocalStorage'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser how long it can cache the build artifacts (in milliseconds)

      extendLibConf(cfg) {
        // do something with lib generated cfg
      },

      extendRootContext(/* ssrContext */) {
        // ssrContext.someProperty = 'someValue'
      },

      extractCSS: false,

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // or 'InjectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForProxySSR: false,

      manifest: {
        name: 'IZING',
        short_name: 'IZING',
        description: 'Bot Multi-atendimento para whatsapp',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noConfigHtmlSelection: true, // optionally disable the "No config.xml" error, if you know what you are doing
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'my-app://',

        // Windows / Linux
        // platform: 'win32' // 'win32', 'linux', 'darwin', 'all'
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'IZING'
      },

      // "chain" is a webpack-chain object for the main process
      extendMainConf(/* cfg */) {
        // do something with cfg
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: [
        'my-content-script'
      ]

      // extendBexScriptsConf (cfg) {}
      // extendBexManifestJson (json) {}
    }
  }
})
