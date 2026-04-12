import uno from '@subf/unocss/vite'
import { taglib } from 'node-taglib-sharp-extend/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solid(),
    uno(),
    taglib({
      //polyfill: true,
      codeSplitting: true,
    }),
  ],
})
