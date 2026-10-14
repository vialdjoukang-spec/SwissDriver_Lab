'use strict';
const fs=require('node:fs');const path=require('node:path');const {assemble}=require('../src/transform.js');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=assemble(read('Permis_GT_Rossa.html'),read('swissdriver-modern.css'),read('src/sedan.js'),read('src/engine-bridge.js'));
const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'SwissDriver_Lab.html'),html);
console.log('Built dist/SwissDriver_Lab.html ('+Buffer.byteLength(html)+' bytes)');
