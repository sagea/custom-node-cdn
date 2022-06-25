import { walk } from "https://deno.land/std/fs/mod.ts";
import { Shell } from './shell.ts';

const htmlStart = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
`;
const htmlEnd = `
</body>
</html>
`;
const links = [];
for await (const u of walk('./docs', { includeDirs: false })) {
  console.log(u);
  links.push(`<a href="/${u.path}">${u.path}</a>`);
}

const finalHTML = htmlStart + links.join('\n') + htmlEnd;
const s = new Shell();
console.log('Writing index file');
await s.cd('./docs');
await s.writeFile('index.html', finalHTML);
console.log('file written');
