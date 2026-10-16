'use strict';
// Prints the merged course text of the given sections (chapter/section ...), for writing scenes and reviews.
const fs=require('fs'),path=require('path'),c=require('../src/curriculum.js');
const root=path.resolve(__dirname,'..');
const s=fs.readFileSync(path.join(root,'Permis_GT_Rossa.html'),'utf8');
const m=c.merge(JSON.parse(s.split('window.DATA=')[1].split(';\n')[0]),c.loadExtension(root));
for(const key of process.argv.slice(2)){
  const [cid,sid]=key.split('/');const ch=m.chapters.find(x=>x.id===cid);const x=ch&&ch.sections.find(y=>y.id===sid);
  if(!x){console.log('## '+key+' : absent');continue;}
  console.log('\n## '+key+' — '+x.otitle+'\nObjectif : '+x.ogoal);
  for(const p of x.parts||[])console.log('- '+p.title+' : '+p.body.join(' '));
  if(x.method)console.log('Méthode : '+x.method.join(' / '));
  if(x.example)console.log('Exemple : '+x.example.title+' — '+x.example.scene+' → '+x.example.answer);
  console.log('Piège : '+x.trap+'\nÀ retenir : '+x.remember+'\nBase : '+x.law);
}
