import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  ignoreAll: './node-taglib-sharp-memory',
  ignoreRuleOnFile: {
    rules: 'ts/explicit-function-return-type',
    files: ['./playground/**'],
  },
})
