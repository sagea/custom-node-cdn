import { Shell } from './shell.ts';

const [packageName, version] = Deno.args;

if (!packageName) {
  throw new Error('Package name required');
}
if (!version) {
  throw new Error('Package version is required');
}

const s = new Shell()
await s.esafe('test', 'echo "hello!";')
await s.esafe('Removing', `rm -rf builder`)
await s.cd('./docs')
await s.mkdir(packageName)
await s.cd(`./${packageName}`)
await s.mkdir(version)
await s.cd('../../');
await s.mkdir('builder');
await s.cd('./builder')
await s.e('Initialize pnpm', 'pnpm init')
await s.e('Install deps', `pnpm add ${packageName}@${version} esbuild @esbuild-plugins/node-modules-polyfill`)

const r = await s.e('Get deps', `node -e "console.log(JSON.stringify(Object.keys(require('${packageName}'))))"`)

const exports = JSON.parse(r) as string[];
const hasDefault = exports.includes('default');
const exp = exports.filter(i => i !== 'default');
const file = [`import ${hasDefault ? 'def' : ''} * as __ from '${packageName}';`];
if (hasDefault) {
  file.push(`export default def`);
}
for (const exported of exp) {
  file.push(`export const ${exported} = __.${exported}`);
}

const content = file.join('\n');

await s.writeFile('entry.mjs', content);
await s.cp('../build.mjs', './build.mjs');
await s.e(`Building`, `node build.mjs`);
await s.cp('mod.js', `../m/${packageName}/${version}/mod.js`);
