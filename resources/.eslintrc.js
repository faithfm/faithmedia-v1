module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:vuetify/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: [
    'vue',
    'vuetify',
    '@typescript-eslint'
  ],
  rules: {
    'vue/script-setup-uses-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
