// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
  ],

  css: ["~/assets/css/main.css"],

  fonts: {
    families: [
      {
        name: "Public Sans",
        weights: ["100 900"],
        styles: ["normal", "italic"],
        subsets: ["latin"],
      },
      {
        name: "Science Gothic",
        weights: ["400 700"],
        styles: ["normal"],
        subsets: ["latin"],
      },
    ],
  },

  nitro: {
    preset: "cloudflare-pages",
    prerender: {
      autoSubfolderIndex: false,
      routes: ["/"],
      crawlLinks: true,
    },
  },
});
