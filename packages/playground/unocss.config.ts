import { defineConfig, presetWind3, transformerVariantGroup } from '@subf/unocss'

export default defineConfig({
  presets: [presetWind3()],
  transformers: [transformerVariantGroup()],
})
