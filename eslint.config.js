import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  ignoreAll: ['./node-taglib-sharp-memory', './polyfills'],
  ignoreRuleOnFile: [
    {
      rules: 'ts/explicit-function-return-type',
      files: ['./playground/**'],
    },
    {
      rules: 'antfu/no-import-dist',
      files: ['./tests/**'],
    },
  ],
})
