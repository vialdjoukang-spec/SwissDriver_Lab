'use strict';
// Validates scene files (content/road-lessons/*.json) against the merge contract and the drawings,
// including files not yet listed in content/index.json. Usage: node scripts/check_scenes.cjs <file>...
const fs=require('fs'),path=require('path'),c=require('../src/curriculum.js'),signs=require('../src/signs.js');
const root=path.resolve(__dirname,'..');
const s=fs.readFileSync(path.join(root,'Permis_GT_Rossa.html'),'utf8');
const data=JSON.parse(s.split('window.DATA=')[1].split(';\n')[0]);
const ext=c.loadExtension(root);const listed=new Set(JSON.parse(fs.readFileSync(path.join(root,'content/index.json'),'utf8')).roadLessons);
const problems=[];
for(const file of process.argv.slice(2)){
  const rel=path.relative(root,path.resolve(file));const scenes=JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
  if(!listed.has(rel))ext.roadLessons.push(...scenes);
  for(const l of scenes){
    for(const p of l.props||[]){
      if(p.kind==='sign'&&!signs.drawing(p.id))problems.push(l.id+' : dessin absent '+p.id);
      const z=p.dz??p.from;if(typeof z==='number'&&(z>38||z<-38))problems.push(l.id+' : objet hors du pâté de maisons ('+p.kind+')');
    }
    if((l.endDz??-30)<-38)problems.push(l.id+' : endDz au-delà de -38');
  }
}
try{const m=c.merge(data,ext);console.log(m.roadLessons.length+' scènes valides au total');}catch(e){problems.push(e.message);}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
