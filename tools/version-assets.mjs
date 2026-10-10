// Give every deployment a stable content-derived asset version.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const stripVersion=text=>text.replace(/(\.\/[\w.-]+\.(?:js|css))\?v=[\w-]+/g,'$1');
const files=fs.readdirSync(root).filter(name=>/\.(js|css|html)$/.test(name)).sort();
const sources=new Map(files.map(name=>[name,stripVersion(fs.readFileSync(path.join(root,name),'utf8'))]));
const hash=crypto.createHash('sha256');
for(const [name,text] of sources)hash.update(name+'\n'+text+'\n');
const version=hash.digest('hex').slice(0,12);
for(const [name,source] of sources){
 let output=source;
 if(name.endsWith('.js'))output=source.replace(/(from\s+['"])(\.\/[\w.-]+\.js)(['"])/g,`$1$2?v=${version}$3`);
 if(name==='index.html')output=source.replace(/((?:src|href)=['"])(\.\/[\w.-]+\.(?:js|css))(['"])/g,`$1$2?v=${version}$3`);
 if(output!==fs.readFileSync(path.join(root,name),'utf8'))fs.writeFileSync(path.join(root,name),output);
}
process.stdout.write(`Asset version: ${version}\n`);
