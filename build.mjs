import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// console.log(NodeModulesPolyfills);


esbuild.build({
  entryPoints: ['./entry.mjs'],
  bundle: true,
  // minify: true,
  outfile: './mod.js',
  target: 'es2022',
  format: 'esm',

  plugins: [ NodeModulesPolyfillPlugin() ],
  // target: ['browser']
})