import fs from 'node:fs';
import path from 'node:path';
const source=path.resolve(process.argv[2]||'../website/dist/client');
const publicDir=path.resolve('public');
const assetBase='/campasun/restaurant-assets';
const target=path.join(publicDir,assetBase);
const designs=['braise','terrasse','feu-de-joie','les-beaux-jours','le-grand-tour'];
const directories=['_next','images','video','fonts','font-licenses'];
const files=['carte-la-savane-2025.pdf','favicon.svg','vinext-client-entry-manifest.json'];
fs.mkdirSync(target,{recursive:true});
const replace=(text)=>{
 for(const dir of directories)text=text.replaceAll('/'+dir+'/',assetBase+'/'+dir+'/');
 for(const file of files)text=text.replaceAll('/'+file,assetBase+'/'+file);
 text=text.replaceAll('https://la-savane-deux-experiences.edd-guest.chatgpt.site','https://www.jengu.ai');
 // Native home links return to the presentation, keeping Jengu's homepage separate.
 text=text.replace(/(href["']?\s*[:=]\s*["'])\/(?:acces)?(["'])/g,'$1/campasun/$2');
 return text;
};
function rewriteTree(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())rewriteTree(file);else if(/\.(html|rsc|js|css|json|svg)$/.test(entry.name))fs.writeFileSync(file,replace(fs.readFileSync(file,'utf8')));}}
for(const name of [...directories,...files]){const from=path.join(source,name);if(fs.existsSync(from))fs.cpSync(from,path.join(target,name),{recursive:true});}
rewriteTree(target);
for(const slug of designs){
 fs.writeFileSync(path.join(publicDir,slug+'.html'),replace(fs.readFileSync(path.join(source,slug+'.html'),'utf8')));
 fs.writeFileSync(path.join(publicDir,slug+'.rsc'),replace(fs.readFileSync(path.join(source,slug+'.rsc'),'utf8')));
}
console.log('Imported the five latest La Savane builds with assets hosted on Jengu.');
