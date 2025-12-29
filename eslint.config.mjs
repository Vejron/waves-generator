// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  // vue/no-multiple-template-root: 'off',
  {
    rules: {
      'vue/no-multiple-template-root': 'off',
      'no-console': 'off',
    },
  }
)
