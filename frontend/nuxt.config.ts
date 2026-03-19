import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,
  pages: true,
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode', '@nuxt/icon'],
  css: ['~/assets/css/base.css', '~/assets/css/tailwind.css'],
  runtimeConfig: {
    BACKEND_API_URL: process.env.BACKEND_API_URL || "http://localhost:8080",
    public: {
      NUXT_API_URL: process.env.NUXT_API_URL || "http://localhost:3000"
    }
  },
  components: [
    {
      path: '~/components/custom',
      pathPrefix: false
    }
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: '~/components/ui',
    alias: {
      link: 'nuxt-link'
    }
  },
  colorMode: {
    preference: 'dark', // default value of $colorMode.preference
    fallback: 'dark', // fallback value if not system preference found
    storage: 'localStorage', // or 'sessionStorage' or 'cookie'
    storageKey: 'color-mode',
    classSuffix: '' // Important to make prefix the same as tailwind classes (dark:)
  }
})