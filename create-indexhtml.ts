import { walk } from "https://deno.land/std/fs/mod.ts";
import { Shell } from './shell.ts';

const LINK_REPLACE_LABEL = `/* INSERT_LINKS_HERE */`
const htmlTemplate = await Deno.readTextFile('./template-index.html');
const links = [];
const walkIter = () => walk('./docs', { includeDirs: false, exts: ['.ts', '.js'] });
for await (const u of walkIter()) {
  const finalPath = u.path.replace(/^\/?docs/, '');
  links.push(finalPath);
}
const linksJson = JSON.stringify(links);
const finalHTML = htmlTemplate.replace(LINK_REPLACE_LABEL, linksJson);

const s = new Shell();
console.log('Writing index file');
await s.cd('./docs');
await s.writeFile('index.html', finalHTML);
console.log('file written');
