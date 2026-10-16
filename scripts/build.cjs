'use strict';
const fs=require('node:fs');const path=require('node:path');const {assemble}=require('../src/transform.js');
const {merge,loadExtension}=require('../src/curriculum.js');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const extension=loadExtension(root);
// Validate the merge in Node before shipping it to the browser.
const source=read('Permis_GT_Rossa.html');
merge(JSON.parse(source.split('window.DATA=')[1].split(';\n')[0]),extension);
const curriculum=read('src/curriculum.js')+'\nwindow.__SD_EXTENSION='+JSON.stringify(extension).replace(/</g,'\\u003c')+';';
const html=assemble(source,read('swissdriver-modern.css')+'\n'+read('src/scene-coherence.css')+'\n'+read('src/learning.css'),read('src/sedan.js'),read('src/engine-bridge.js')+'\n'+read('src/scene-coherence.js')+'\n'+read('src/decision-safety.js')+'\n'+read('src/gestures.js')+'\n'+read('src/signs.js')+'\n'+read('src/learning.js')+'\n'+read('src/road-lessons.js'),curriculum);
const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'SwissDriver_Lab.html'),html);
console.log('Built dist/SwissDriver_Lab.html ('+Buffer.byteLength(html)+' bytes)');
