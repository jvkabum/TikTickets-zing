module.exports = {
  root: true,
  parser: 'espree',

  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },

  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: 'espree',
        sourceType: 'module'
      }
    }
  ],

  env: {
    browser: true,
    es2021: true,
    node: true
  },

  extends: [
    'plugin:vue/vue3-essential',
    'standard',
    'prettier'
  ],

  plugins: [
    'vue'
  ],

  globals: {
    ga: true,
    cordova: true,
    __statics: true,
    process: true,
    Capacitor: true,
    chrome: true
  },

  rules: {
    // ⭐⭐ CORREÇÃO AQUI: 'always' para TODOS ⭐⭐
    'space-before-function-paren': ['error', 'always'],

    'generator-star-spacing': 'off',
    'arrow-parens': 'off',
    'one-var': 'off',
    eqeqeq: 0,
    camelcase: 'off',
    'import/first': 'off',
    'import/named': 'off',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-use-v-if-with-v-for': 0,
    'vue/no-use-v-if-with-v-for': [
      'error',
      {
        allowUsingIterationVar: true
      }
    ],

    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'warn',
    'vue/no-v-text-v-html-on-component': 'warn',
    'vue/no-deprecated-v-on-native-modifier': 'warn',
    'vue/no-deprecated-slot-attribute': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    'no-new': 'off',
    'no-empty': 'warn',
    'no-use-before-define': 'off',
    'array-callback-return': 'warn',
    'n/no-callback-literal': 'off',
    'standard/no-callback-literal': 'off'
  }
}