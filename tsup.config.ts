import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  outDir: 'dist',
  clean: true,
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
})
