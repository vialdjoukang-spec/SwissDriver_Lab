/* Versioned curriculum extension merged into window.DATA before the engine
 * reads it. Fails closed on duplicate or dangling identifiers; existing
 * chapter, section and scenario identifiers are never renamed. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SwissDriverCurriculum=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SECTION_FIELDS=['id','otitle','title','ogoal','question','parts','words','method','example','trap','remember','law'];
  const CHAPTER_FIELDS=['id','official','group','otitle','title','oscope','tagline','intro','keyIdea','memo','sections'];
  const QUESTION_FIELDS=['id','chapter','section','stem','options','answers','truth','why'];
  const LESSON_FIELDS=['id','rule','title','scene','props','choices','ok','should','why','memo'];
  const LESSON_ACTS=['go','stop','park','detour','overtake','honk'];
  const LESSON_PROPS=['sign','line','crosswalk','bay','cones','barrier','island','car','ped','bike','leadCar','symbol','vehicle','light','overhead','arrow','agent','rail'];
  // A simplified road scene: real objects, three decisions, one right answer and a consequence for each wrong one.
  function checkLesson(l,chapters){
    need(l,LESSON_FIELDS,'scène '+l.id);
    const [cid,sid]=String(l.rule).split('/');const c=chapters.get(cid);
    if(!c||!c.sections.some(s=>s.id===sid))fail('scène '+l.id+' sans sous-chapitre '+l.rule);
    if(!Array.isArray(l.choices)||l.choices.length!==3||l.choices.some(ch=>!ch||!ch.t||!LESSON_ACTS.includes(ch.act)))fail('scène '+l.id+' sans 3 choix valides');
    if(!Number.isInteger(l.ok)||l.ok<0||l.ok>2)fail('scène '+l.id+' sans bonne réponse');
    if(l.choices.some((ch,i)=>i!==l.ok&&!ch.did))fail('scène '+l.id+' : conséquence manquante pour un mauvais choix');
    if(!Array.isArray(l.props)||!l.props.length||l.props.some(p=>!p||!LESSON_PROPS.includes(p.kind)))fail('scène '+l.id+' aux objets invalides');
  }
  function fail(message){throw new Error('Extension du programme invalide : '+message);}
  function need(object,fields,label){for(const f of fields)if(object[f]===undefined||object[f]===null||object[f]==='')fail(label+' sans champ '+f);}
  function checkQuestion(q){
    need(q,QUESTION_FIELDS,'question '+q.id);
    if(!Array.isArray(q.options)||q.options.length<3||q.options.length>4)fail('question '+q.id+' sans 3 ou 4 propositions');
    if(!Array.isArray(q.answers)||!q.answers.length||q.answers.length>=q.options.length||q.answers.some(a=>!Number.isInteger(a)||a<0||a>=q.options.length)||new Set(q.answers).size!==q.answers.length)fail('question '+q.id+' aux réponses invalides');
  }
  function merge(data,ext){
    if(!ext)return data;
    const out={...data,groups:data.groups.map(g=>({...g,chapters:[...g.chapters]})),
      chapters:data.chapters.map(c=>({...c,sections:[...c.sections]})),questions:[...data.questions]};
    const chapters=new Map(out.chapters.map(c=>[c.id,c]));const groups=new Map(out.groups.map(g=>[g.id,g]));
    const questionIds=new Set(out.questions.map(q=>q.id));
    for(const [id,code] of Object.entries(ext.official||{})){const c=chapters.get(id);if(!c)fail('code officiel pour un chapitre absent '+id);c.official=code;}
    for(const [id,title] of Object.entries(ext.groupTitles||{})){const g=groups.get(id);if(!g)fail('groupe absent '+id);g.official=title;}
    for(const c of ext.chapters||[]){
      need(c,CHAPTER_FIELDS,'chapitre '+c.id);if(chapters.has(c.id))fail('chapitre dupliqué '+c.id);
      if(!groups.has(c.group))fail('groupe absent pour '+c.id);
      c.sections.forEach(s=>need(s,SECTION_FIELDS,'section '+c.id+'/'+s.id));
      const copy={color:'#125c79',...c,sections:[...c.sections]};out.chapters.push(copy);chapters.set(c.id,copy);
    }
    for(const add of ext.sections||[]){
      const c=chapters.get(add.chapterId);if(!c)fail('chapitre absent '+add.chapterId);
      need(add.section,SECTION_FIELDS,'section '+add.chapterId+'/'+add.section?.id);
      if(c.sections.some(s=>s.id===add.section.id))fail('section dupliquée '+add.chapterId+'/'+add.section.id);
      const at=c.sections.findIndex(s=>s.id===add.after);if(at<0)fail('ancrage absent '+add.chapterId+'/'+add.after);
      c.sections.splice(at+1,0,add.section);
    }
    for(const [groupId,order] of Object.entries(ext.groupOrder||{})){
      const g=groups.get(groupId);if(!g)fail('groupe absent '+groupId);
      const missing=g.chapters.filter(id=>!order.includes(id));if(missing.length)fail('ordre du groupe '+groupId+' sans '+missing.join(','));
      for(const id of order)if(!chapters.has(id))fail('ordre du groupe '+groupId+' : chapitre absent '+id);
      g.chapters=[...order];
    }
    const placed=new Set(out.groups.flatMap(g=>g.chapters));
    for(const c of out.chapters)if(!placed.has(c.id))fail('chapitre non placé dans un groupe '+c.id);
    for(const q of ext.questions||[]){
      checkQuestion(q);if(questionIds.has(q.id))fail('question dupliquée '+q.id);questionIds.add(q.id);
      const c=chapters.get(q.chapter);if(!c||!c.sections.some(s=>s.id===q.section))fail('question '+q.id+' sans sous-chapitre '+q.chapter+'/'+q.section);
      out.questions.push(q);
    }
    out.roadLessons=[];const lessonIds=new Set();
    for(const l of ext.roadLessons||[]){
      checkLesson(l,chapters);if(lessonIds.has(l.id))fail('scène dupliquée '+l.id);lessonIds.add(l.id);out.roadLessons.push(l);
    }
    // A fourth, false proposition turns a 3-proposition question into a 4-proposition QCM.
    const byId=new Map(out.questions.map((q,i)=>[q.id,i]));
    for(const [id,extra] of Object.entries(ext.extraOptions||{})){
      const i=byId.get(id);if(i===undefined)fail('proposition ajoutée pour une question absente '+id);
      const q=out.questions[i];if(q.options.length!==3)fail('question '+id+' a déjà 4 propositions');
      if(!extra||typeof extra.option!=='string'||!extra.option.trim()||typeof extra.why!=='string'||!extra.why.trim())fail('proposition ajoutée incomplète '+id);
      out.questions[i]={...q,options:[...q.options,extra.option],extraWhy:extra.why};
    }
    return out;
  }
  // Node only: read content/index.json and the files it lists.
  function loadExtension(rootDir){
    const fs=require('fs'),path=require('path');
    const read=file=>JSON.parse(fs.readFileSync(path.join(rootDir,file),'utf8'));
    return fromIndex(read('content/index.json'),read);
  }
  function fromIndex(index,read){
    const ext={official:index.official,groupTitles:index.groupTitles,groupOrder:index.groupOrder,chapters:[],sections:[],questions:[],extraOptions:{},roadLessons:[]};
    for(const file of index.roadLessons||[])ext.roadLessons.push(...read(file));
    for(const file of index.extraOptions||[])Object.assign(ext.extraOptions,read(file));
    for(const file of index.questions||[])ext.questions.push(...read(file));
    for(const file of index.chapters||[]){const v=read(file);ext.chapters.push(v.chapter);ext.questions.push(...(v.questions||[]));}
    for(const file of index.sections||[]){const v=read(file);ext.sections.push({chapterId:v.chapterId,after:v.after,section:v.section});ext.questions.push(...(v.questions||[]));}
    return ext;
  }
  return Object.freeze({merge,loadExtension,fromIndex,version:'1.1.0'});
});
