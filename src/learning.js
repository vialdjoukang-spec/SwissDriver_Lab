/* Learning layer inside the engine closure: course history, back/forward
 * navigation everywhere, section exercises from the stored questions and the
 * stored section diagrams. Progress key permisGT.v1 is never written here. */
(function(){
  'use strict';
  const HISTORY_KEY='swissdriver.history.v1',EXERCISE_KEY='swissdriver.exercises.v1';
  const esc=value=>Be(value);
  const load=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&v.v===1?v:fallback;}catch{return fallback;}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  const keyOf=item=>item?.s?item.c.id+'/'+item.s.id:item?.c?.id||null;

  // Program order: every chapter introduction and section, including chapters without a 3D scene.
  const ALL=[];const byKey=new Map();
  for(const g of Yo.groups)for(const id of g.chapters){
    const c=Mp[id];if(!c)continue;
    const chapGate=Hn.find(h=>h.type==='chapGate'&&h.c===c)||{type:'chapGate',c,g};
    ALL.push(chapGate);byKey.set(c.id,chapGate);
    for(const s of c.sections){const gate=Yu.find(h=>h.s===s)||{type:'secGate',c,g,s};ALL.push(gate);byKey.set(c.id+'/'+s.id,gate);}
  }
  const questionsBySection=new Map();
  for(const q of Yo.questions||[]){const k=q.chapter+'/'+q.section;if(!questionsBySection.has(k))questionsBySection.set(k,[]);questionsBySection.get(k).push(q);}

  let history=load(HISTORY_KEY,{v:1,items:[]});
  let results=load(EXERCISE_KEY,{v:1,sections:{}});
  function remember(item,page,pages){
    const key=keyOf(item);if(!key)return;
    const rest=history.items.filter(h=>h.key!==key);
    rest.unshift({key,page,pages,at:new Date().toISOString()});
    history={v:1,items:rest.slice(0,300)};save(HISTORY_KEY,history);
  }

  // Diagrams stored with each section are shown on the page that explains the method.
  const originalXM=xM;
  xM=function(item){
    const pages=originalXM(item);
    const svg=item?.s?.diagram&&Yo.diagrams?.[item.s.diagram];
    if(svg){
      let index=pages.findIndex(p=>p.includes('Comment faire'));if(index<0)index=Math.min(1,pages.length-1);
      pages[index]+='<figure class="lab-diagram">'+svg+'<figcaption>Schéma du sous-chapitre « '+esc(item.s.otitle)+' »</figcaption></figure>';
    }
    return pages;
  };

  // A single return stack makes every "Retour" go back exactly where the reader came from.
  const stack=[];let origin=null;
  function captureOrigin(){
    if(origin)return;
    origin={mode:At,timeScale:Bi,plan:!st('#plan').hidden,explain:!ut.explain.hidden};
    // The plan keeps its own return state (engine-bridge); it is only hidden, never closed.
    if(origin.plan){st('#plan').hidden=true;}
    if(origin.explain){ut.explain.hidden=true;}
    At='lab';Bi=0;SwissDriverLab.clearKeys();
  }
  function restoreOrigin(){
    const o=origin;origin=null;SwissDriverLab.clearKeys();
    if(!o){At='drive';Bi=1;return;}
    if(o.plan){At='plan';Bi=0;st('#plan').hidden=false;return;}
    if(o.explain){At='explain';Bi=0;ut.explain.hidden=false;return;}
    At=o.mode==='lab'?'drive':o.mode;Bi=o.timeScale;
  }
  function courseEntry(){return Jt?{kind:'course',it:Jt.it,i:Jt.i,fromKey:Jt.fromKey,after:Jt.after}:null;}
  function hideCourse(){ut.course.hidden=true;Jt=null;}
  function openCourse(item,page,after){
    ia(item,true);Jt.after=after||'lab';
    if(Number.isInteger(page)){Jt.i=Math.max(0,Math.min(page,Jt.pages.length-1));aa();}
  }
  function restore(entry){
    if(!entry){closeAll();return;}
    if(entry.kind==='course'){
      // Back at a course that owns its exit (road gate, plan, feedback): this layer steps aside.
      if(entry.after!=='lab'&&!stack.length)origin=null;
      ia(entry.it,entry.fromKey);Jt.after=entry.after;Jt.i=Math.max(0,Math.min(entry.i,Jt.pages.length-1));aa();
    }else if(entry.kind==='history')showHistory();
    else if(entry.kind==='quiz')showQuiz(entry.key,entry.state);
    else if(entry.kind==='signs')showSigns(entry.key,entry.state);
  }
  function back(){
    hidePanels();
    if(Jt){hideCourse();}
    const entry=stack.pop();
    if(entry)restore(entry);else closeAll();
  }
  function closeAll(){
    hidePanels();
    // A course opened by a gate on the road still advances the drive normally.
    // "Fermer" returns to the first place: a road gate or a course with its own exit is reopened.
    const first=stack[0];stack.length=0;
    if(Jt){hideCourse();}
    if(first&&first.kind==='course'&&first.after!=='lab'){origin=null;restore(first);return;}
    restoreOrigin();
  }
  // Courses opened from this layer return to it instead of resuming the drive.
  const bridgedXo=Xo;
  Xo=function(){
    if(Jt&&Jt.after==='lab'){hideCourse();const entry=stack.pop();if(entry)restore(entry);else closeAll();return;}
    bridgedXo();
  };
  const bridgedIa=ia;
  ia=function(item,fromKey){bridgedIa(item,fromKey);if(Jt)remember(Jt.it,Jt.i,Jt.pages.length);updateCourseNav();};
  const bridgedAa=aa;
  aa=function(){bridgedAa();if(Jt)remember(Jt.it,Jt.i,Jt.pages.length);updateCourseNav();};

  // Course navigation bar: back, previous/next section, history, exercises.
  const nav=document.createElement('nav');nav.className='lab-course-nav';nav.setAttribute('aria-label','Navigation dans les cours');
  nav.innerHTML='<button type="button" class="ghost lab-back">← Retour (Échap)</button>'+
    '<button type="button" class="ghost lab-prev">◀ Sous-chapitre précédent</button>'+
    '<button type="button" class="ghost lab-history-open">Cours vus (J)</button>'+
    '<button type="button" class="ghost lab-train">S’exercer</button>'+
    '<button type="button" class="ghost lab-signs">Reconnaître les signaux</button>'+
    '<button type="button" class="ghost lab-next">Sous-chapitre suivant ▶</button>';
  ut.course.querySelector('header').after(nav);
  function neighbour(step){if(!Jt)return null;const k=keyOf(Jt.it);const i=ALL.findIndex(x=>keyOf(x)===k);return i<0?null:ALL[i+step]||null;}
  function updateCourseNav(){
    if(!Jt)return;
    nav.querySelector('.lab-prev').disabled=!neighbour(-1);
    nav.querySelector('.lab-next').disabled=!neighbour(1);
    const q=questionsBySection.get(keyOf(Jt.it))||[];const train=nav.querySelector('.lab-train');
    train.disabled=!q.length;train.textContent=q.length?'S’exercer ('+q.length+')':'Pas d’exercice ici';
    nav.querySelector('.lab-signs').hidden=!signChapter(Jt.it.c.id);
  }
  function goSection(step){const target=neighbour(step);if(!target)return;captureOrigin();const entry=courseEntry();hideCourse();if(entry)stack.push(entry);openCourse(target,0,'lab');}
  nav.querySelector('.lab-back').onclick=()=>{if(!Jt)return;if(Jt.after==='lab'||stack.length)back();else Xo();};
  nav.querySelector('.lab-prev').onclick=()=>goSection(-1);
  nav.querySelector('.lab-next').onclick=()=>goSection(1);
  nav.querySelector('.lab-history-open').onclick=()=>{captureOrigin();const entry=courseEntry();hideCourse();if(entry)stack.push(entry);showHistory();};
  nav.querySelector('.lab-signs').onclick=()=>{if(!Jt)return;const key=keyOf(Jt.it);captureOrigin();const entry=courseEntry();hideCourse();if(entry)stack.push(entry);showSigns(Jt?keyOf(Jt.it):key);};
  nav.querySelector('.lab-train').onclick=()=>{if(!Jt)return;const key=keyOf(Jt.it);captureOrigin();const entry=courseEntry();hideCourse();if(entry)stack.push(entry);showQuiz(key);};

  // Overlay panels share the course look: opaque, one task at a time.
  function panel(id,label){
    const root=document.createElement('div');root.id=id;root.className='lab-overlay';root.hidden=true;
    root.setAttribute('role','dialog');root.setAttribute('aria-label',label);
    root.innerHTML='<div class="panel"><header></header><div class="lab-body"></div><footer></footer></div>';
    document.body.append(root);return root;
  }
  const historyPanel=panel('labHistory','Cours déjà vus');
  const quizPanel=panel('labQuiz','Exercices du sous-chapitre');
  const signsPanel=panel('labSigns','Reconnaître les signaux');
  function hidePanels(){historyPanel.hidden=true;quizPanel.hidden=true;signsPanel.hidden=true;}
  const titleOf=key=>{const item=byKey.get(key);if(!item)return key;return item.s?item.c.otitle+' › '+item.s.otitle:item.c.otitle+' · présentation';};

  function showHistory(){
    hidePanels();
    historyPanel.querySelector('header').innerHTML='<p class="kick">Mon parcours</p><b>Cours déjà vus</b><p class="lab-note">Rouvrez n’importe quel fragment à la page où vous l’avez quitté. « Retour » vous ramène exactement à l’endroit précédent.</p>';
    const items=history.items.filter(h=>byKey.has(h.key));
    historyPanel.querySelector('.lab-body').innerHTML=items.length?'<ol class="lab-history">'+items.map((h,n)=>{
      const q=(questionsBySection.get(h.key)||[]).length,r=results.sections[h.key];
      return '<li><div><strong>'+esc(titleOf(h.key))+'</strong><small>Page '+(h.page+1)+' / '+h.pages+' · '+new Date(h.at).toLocaleString('fr-CH')+(r?' · exercices : '+r.correct.length+' / '+q+' réussis':'')+'</small></div>'+
        '<div class="lab-row-actions"><button type="button" class="ghost" data-open="'+n+'">Reprendre p. '+(h.page+1)+'</button>'+
        '<button type="button" class="ghost" data-start="'+n+'">Début</button>'+
        (q?'<button type="button" class="ghost" data-train="'+n+'">S’exercer ('+q+')</button>':'')+'</div></li>';
    }).join('')+'</ol>':'<p>Aucun cours ouvert pour l’instant. Les cours lus en conduite ou depuis le programme apparaîtront ici.</p>';
    historyPanel.querySelector('.lab-body').onclick=event=>{
      const b=event.target.closest('button');if(!b)return;const h=items[+(b.dataset.open??b.dataset.start??b.dataset.train)];if(!h)return;
      stack.push({kind:'history'});historyPanel.hidden=true;
      if(b.dataset.train!==undefined)showQuiz(h.key);else openCourse(byKey.get(h.key),b.dataset.open!==undefined?h.page:0,'lab');
    };
    historyPanel.querySelector('footer').innerHTML='<button type="button" class="ghost lab-back">← Retour (Échap)</button><button type="button" class="primary lab-close">Fermer</button>';
    historyPanel.querySelector('.lab-back').onclick=back;historyPanel.querySelector('.lab-close').onclick=closeAll;
    historyPanel.hidden=false;historyPanel.querySelector('button')?.focus();
  }

  // Exercises use the stored questions in the official format: each statement is judged true or false.
  function showQuiz(key,state){
    hidePanels();
    const questions=questionsBySection.get(key)||[];if(!questions.length){back();return;}
    const st8=state||{order:questions.map((_,i)=>i).sort(()=>Math.random()-.5),idx:0,marks:{},checked:{}};
    const render=()=>{
      const q=questions[st8.order[st8.idx]],marks=st8.marks[q.id]||[],checked=st8.checked[q.id];
      quizPanel.querySelector('header').innerHTML='<p class="kick">Exercice style examen · '+esc(titleOf(key))+'</p><b>Question '+(st8.idx+1)+' / '+questions.length+'</b><p class="lab-note">Cochez la ou les bonnes réponses ('+q.options.length+' propositions), puis validez.</p>';
      const rows=q.options.map((option,i)=>{
        const truth=q.answers.includes(i),picked=marks[i]===true;
        const verdict=checked?(picked===truth?'<em class="lab-ok">'+(truth?'Bonne réponse':'Correctement écartée')+'</em>':'<em class="lab-bad">'+(truth?'Bonne réponse oubliée':'Cette proposition est fausse')+'</em>'):'';
        const extra=checked&&i===3&&q.extraWhy?'<small class="lab-why">'+esc(q.extraWhy)+'</small>':'';
        return '<li class="lab-statement"><button type="button" class="lab-pick" data-i="'+i+'" role="checkbox" aria-checked="'+picked+'"'+(checked?' disabled':'')+'><kbd>'+'ABCD'[i]+'</kbd><span>'+esc(option)+'</span></button>'+verdict+extra+'</li>';
      }).join('');
      const feedback=checked?'<div class="box '+(checked.ok?'ok':'warn')+'"><b>'+(checked.ok?'Réponse juste':'Pas tout à fait')+'</b><p>'+esc(q.truth)+'</p><p><b>Pourquoi :</b> '+esc(q.why)+'</p>'+
        (q.trap?'<p><b>Piège :</b> '+esc(q.trap)+'</p>':'')+(q.action?'<p><b>Action :</b> '+esc(q.action)+'</p>':'')+(q.memory?'<p><b>Mémo :</b> '+esc(q.memory)+'</p>':'')+'</div>':'';
      quizPanel.querySelector('.lab-body').innerHTML='<p class="q" data-qid="'+esc(q.id)+'">'+esc(q.stem)+'</p><ol class="lab-statements lab-qcm">'+rows+'</ol>'+feedback;
      const done=Object.keys(st8.checked).length,correct=Object.values(st8.checked).filter(c=>c.ok).length;
      quizPanel.querySelector('footer').innerHTML='<button type="button" class="ghost lab-back">← Retour</button>'+
        '<button type="button" class="ghost lab-qprev"'+(st8.idx?'':' disabled')+'>◀ Précédente</button>'+
        '<span class="cpage">'+correct+' juste(s) sur '+done+' corrigée(s)</span>'+
        '<button type="button" class="ghost lab-course">Revoir le cours</button>'+
        (checked?'<button type="button" class="primary lab-qnext">'+(st8.idx<questions.length-1?'Suivante ▶':'Recommencer les erreurs')+'</button>':
          '<button type="button" class="primary lab-check"'+(marks.some(m=>m===true)?'':' disabled')+'>Valider</button>');
      quizPanel.querySelector('.lab-back').onclick=back;
      quizPanel.querySelector('.lab-qprev').onclick=()=>{st8.idx--;render();};
      quizPanel.querySelector('.lab-course').onclick=()=>{stack.push({kind:'quiz',key,state:st8});quizPanel.hidden=true;openCourse(byKey.get(key),0,'lab');};
      const check=quizPanel.querySelector('.lab-check');
      if(check)check.onclick=()=>{
        const ok=q.options.every((_,i)=>(marks[i]===true)===q.answers.includes(i));st8.checked[q.id]={ok};
        const r=results.sections[key]||{seen:[],correct:[]};if(!r.seen.includes(q.id))r.seen.push(q.id);
        r.correct=r.correct.filter(id=>id!==q.id);if(ok)r.correct.push(q.id);results.sections[key]=r;save(EXERCISE_KEY,results);
        window.dispatchEvent(new CustomEvent('swissdriver:event',{detail:{type:'exercise-check',ruleId:key,questionId:q.id,correct:ok}}));
        render();
      };
      const next=quizPanel.querySelector('.lab-qnext');
      if(next)next.onclick=()=>{
        if(st8.idx<questions.length-1){st8.idx++;render();return;}
        const wrong=st8.order.filter(i=>!st8.checked[questions[i].id]?.ok);
        st8.order=wrong.length?wrong:questions.map((_,i)=>i).sort(()=>Math.random()-.5);st8.idx=0;st8.checked={};st8.marks={};render();
      };
      quizPanel.querySelector('.lab-body').onclick=event=>{
        const b=event.target.closest('[data-i]');if(!b||b.disabled)return;
        const m=st8.marks[q.id]||(st8.marks[q.id]=[]);m[+b.dataset.i]=!m[+b.dataset.i];render();
      };
    };
    quizPanel.hidden=false;render();quizPanel.querySelector('button')?.focus();
  }

  // Signal recognition: a random signal at the roadside, four meanings, one is right.
  const SIGNS=window.SwissDriverSigns;
  const signChapter=id=>['O11','O12','O13','O14'].includes(id);
  function shuffle(list){return list.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);}
  function newSignRound(previous){
    const pool=SIGNS.SIGNS.filter(sg=>sg.id!==previous);const sign=pool[Math.floor(Math.random()*pool.length)];
    const same=shuffle(SIGNS.SIGNS.filter(o=>o.id!==sign.id&&o.family===sign.family)).slice(0,2);
    const other=shuffle(SIGNS.SIGNS.filter(o=>o.id!==sign.id&&!same.includes(o))).slice(0,3-same.length);
    return {sign:sign.id,options:shuffle([sign,...same,...other]).map(o=>o.id),answer:null};
  }
  function showSigns(fromKey,state){
    hidePanels();
    const st8=state||{round:newSignRound(),score:0,done:0};
    const render=()=>{
      const r=st8.round,sign=SIGNS.byId[r.sign];
      signsPanel.querySelector('header').innerHTML='<p class="kick">Exercice · Signaux routiers</p><b>Que signifie ce signal ?</b><p class="lab-note">Une seule signification est juste. Représentation simplifiée, non officielle.</p>';
      const options=r.options.map((id,i)=>{
        const o=SIGNS.byId[id];let cls='';
        if(r.answer!==null){if(id===r.sign)cls=' lab-right';else if(i===r.answer)cls=' lab-wrong';}
        return '<button type="button" class="lab-choice'+cls+'" data-c="'+i+'" data-sign="'+id+'"'+(r.answer!==null?' disabled':'')+'><kbd>'+(i+1)+'</kbd>'+esc(o.meaning)+'</button>';
      }).join('');
      let feedback='';
      if(r.answer!==null){
        const ok=r.options[r.answer]===r.sign;
        feedback='<div class="box '+(ok?'ok':'warn')+'"><b>'+(ok?'Juste':'<span class="lab-bad">Faux</span>')+' · '+esc(sign.name)+'</b><p>'+esc(sign.meaning)+'.</p><p><b>Indice de forme :</b> '+esc(SIGNS.FAMILIES[sign.family])+'.</p></div>';
      }
      signsPanel.querySelector('.lab-body').innerHTML='<figure class="lab-sign-scene" data-sign="'+r.sign+'">'+SIGNS.scene(r.sign)+'</figure><div class="lab-choices">'+options+'</div>'+feedback;
      const course=byKey.get(sign.rule);
      signsPanel.querySelector('footer').innerHTML='<button type="button" class="ghost lab-back">← Retour</button>'+
        '<span class="cpage">'+st8.score+' juste(s) sur '+st8.done+'</span>'+
        (r.answer!==null&&course?'<button type="button" class="ghost lab-course">Revoir le cours lié</button>':'')+
        (r.answer!==null?'<button type="button" class="primary lab-snext">Signal suivant ▶</button>':'');
      signsPanel.querySelector('.lab-back').onclick=back;
      const c=signsPanel.querySelector('.lab-course');
      if(c)c.onclick=()=>{stack.push({kind:'signs',key:fromKey,state:st8});signsPanel.hidden=true;openCourse(course,0,'lab');};
      const n=signsPanel.querySelector('.lab-snext');if(n)n.onclick=()=>{st8.round=newSignRound(r.sign);render();};
      signsPanel.querySelector('.lab-choices').onclick=event=>{
        const b=event.target.closest('[data-c]');if(!b||b.disabled)return;
        r.answer=+b.dataset.c;st8.done++;const ok=r.options[r.answer]===r.sign;if(ok)st8.score++;
        const res=results.signs||{seen:[],correct:[]};if(!res.seen.includes(r.sign))res.seen.push(r.sign);
        res.correct=res.correct.filter(id=>id!==r.sign);if(ok)res.correct.push(r.sign);results.signs=res;save(EXERCISE_KEY,results);
        window.dispatchEvent(new CustomEvent('swissdriver:event',{detail:{type:'sign-check',signId:r.sign,correct:ok}}));
        render();
      };
    };
    signsPanel.hidden=false;render();signsPanel.querySelector('button')?.focus();
  }

  // Entry points: tools bar, programme rows and keyboard.
  const tools=st('#labControls')||st('#tools');
  const historyButton=document.createElement('button');historyButton.type='button';historyButton.className='glass';historyButton.textContent='Cours vus';
  historyButton.onclick=()=>{if(['drive','explain','plan'].includes(At)||!st('#plan').hidden){captureOrigin();showHistory();}};
  tools.append(historyButton);
  const bridgedCr=cr;
  cr=function(open){
    bridgedCr(open);if(!open)return;
    const header=st('#plan header');
    if(!header.querySelector('.lab-history-plan')){
      const b=document.createElement('button');b.type='button';b.className='ghost lab-history-plan';b.textContent='Cours vus';b.onclick=()=>{captureOrigin();showHistory();};
      const g=document.createElement('button');g.type='button';g.className='ghost lab-history-plan lab-signs-plan';g.textContent='Reconnaître les signaux';g.onclick=()=>{captureOrigin();showSigns(null);};
      header.append(b,g);
    }
    document.querySelectorAll('#planList .lab-lesson-row[data-rule]').forEach(row=>{
      const key=row.dataset.rule,q=(questionsBySection.get(key)||[]).length;
      if(!q||row.querySelector('.lab-train-row'))return;
      const b=document.createElement('button');b.type='button';b.className='ghost lab-train-row';b.textContent='S’exercer ('+q+')';
      b.setAttribute('aria-label','S’exercer : '+titleOf(key));b.onclick=()=>{captureOrigin();showQuiz(key);};
      row.querySelector('.lab-lesson-actions').append(b);
    });
  };
  window.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    const overlay=!historyPanel.hidden||!quizPanel.hidden||!signsPanel.hidden;
    if(overlay){
      if(key==='escape'){event.preventDefault();back();}
      else if(!signsPanel.hidden&&['1','2','3','4'].includes(key)){event.preventDefault();signsPanel.querySelector('[data-c="'+(+key-1)+'"]')?.click();}
      else if(!quizPanel.hidden&&['a','b','c','d'].includes(key)){event.preventDefault();quizPanel.querySelector('[data-i="'+'abcd'.indexOf(key)+'"]')?.click();}
      else if(!quizPanel.hidden&&key==='enter'){event.preventDefault();(quizPanel.querySelector('.lab-check:not(:disabled)')||quizPanel.querySelector('.lab-qnext'))?.click();}
      event.stopImmediatePropagation();return;
    }
    if(At==='course'&&key==='escape'){event.preventDefault();event.stopImmediatePropagation();nav.querySelector('.lab-back').click();return;}
    if(key==='j'&&!event.target?.closest?.('input,textarea,select')&&st('#start').hidden&&['drive','explain','course'].includes(At)){
      event.preventDefault();event.stopImmediatePropagation();
      if(At==='course')nav.querySelector('.lab-history-open').click();else{captureOrigin();showHistory();}
    }
  },true);
  const keys=st('#keys');if(keys){keys.insertAdjacentHTML('beforeend','<kbd>J</kbd><span>Cours vus</span>');}

  window.SwissDriverLearning=Object.freeze({version:'1.0.0',
    sections:()=>ALL.map(keyOf),history:()=>history.items.map(h=>({...h})),
    questionCount:key=>(questionsBySection.get(key)||[]).length,stackDepth:()=>stack.length,
    open:(key,page)=>{const item=byKey.get(key);if(!item)return false;captureOrigin();openCourse(item,page,'lab');return true;},
    showHistory:()=>{captureOrigin();showHistory();},showQuiz:key=>{captureOrigin();showQuiz(key);},
    showSigns:key=>{captureOrigin();showSigns(key||null);},back,closeAll});
})();
