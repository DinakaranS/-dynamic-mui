import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
      // Don't emit .d.ts for playground / tests / theme / entry — they're not
      // part of the published API and would otherwise leak into the tarball.
      exclude: [
        'src/playground/**',
        'src/theme/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.test.*',
        'src/test/**',
      ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DynamicMui',
      // `.mjs`/`.cjs` so the format is unambiguous to Node (a `.js` ESM file in a
      // package with no "type":"module" triggers a reparse warning / fails on old Node).
      fileName: (format) => `dynamic-mui.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Everything below is a peer or optional dependency the consuming app
      // already provides — so keep it OUT of our bundle (regexes also catch
      // deep imports like `@mui/material/styles`). This is what keeps the
      // published package small; heavy libs are never compiled in.
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@mui\/material($|\/)/,
        /^@mui\/icons-material($|\/)/,
        /^@mui\/x-charts($|\/)/,
        /^@mui\/x-data-grid($|\/)/,
        /^@mui\/x-date-pickers($|\/)/,
        /^@emotion\/react($|\/)/,
        /^@emotion\/styled($|\/)/,
        // `dayjs` must be shared with the consumer's `@mui/x-date-pickers` so the
        // picker adapter's utc/timezone plugins apply to the same instance
        // (bundling a 2nd copy causes "value.isUTC is not a function").
        /^dayjs($|\/)/,
        // Optional peers, lazy-loaded only when their feature is used.
        /^@aws-sdk\//,
        /^pdfmake($|\/)/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true
  },
});
