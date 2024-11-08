import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  ignoreRuleOnFile: {
    rules: 'ts/explicit-function-return-type',
    files: ['./playground/**'],
  },
})
