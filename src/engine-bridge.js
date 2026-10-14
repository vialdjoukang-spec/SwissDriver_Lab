/* Runs within the existing engine closure: lessons, choices and scenes share
 * the original object identities; no parallel curriculum or invented scores. */
var sdSimTime=0;
(function(){
  'use strict';
  const events=[];
  const text=(node,value)=>{if(node)node.textContent=value;};
  const activeItem=()=>Ie?.it||Jt?.it||dr();
  const ruleId=item=>item?.s?item.c.id+'/'+item.s.id:null;
  function snapshot(){
    const item=activeItem();
    return {version:2,mode:At,ruleId:ruleId(item),chapterId:item?.c.id||null,sectionId:item?.s?.id||null,
      scenarioId:Ie?.sc.id||null,scenarioKind:Ie?.sc.kind||null,
      lessonTitle:item?.s?.otitle||item?.c.otitle||null,speedKmh:Math.round(Math.abs(O.v)*36)/10,
      assistedTrajectory:!!O.auto,assessment:'decision-and-simulated-consequence',simulationSeconds:sdSimTime};
  }
  function emit(type,details={}){
    const entry={type,...snapshot(),...details};events.push(entry);if(events.length>200)events.shift();
    window.dispatchEvent(new CustomEvent('swissdriver:event',{detail:entry}));
    return entry;
  }
  function clearKeys(){for(const key of Object.keys(xn))delete xn[key];}
  let planReturn=null;
  const originalCr=cr;
  cr=function(open){
    if(open&&st('#plan').hidden){planReturn={mode:At,timeScale:Bi};At='plan';Bi=0;clearKeys();}
    originalCr(open);
    if(open)buildPlan();
    else if(planReturn){if(At==='plan'){At=planReturn.mode;Bi=planReturn.timeScale;}planReturn=null;clearKeys();}
  };
  const originalIa=ia;
  ia=function(item,fromKey){
    if(!item)return;
    originalIa(item,fromKey);Bi=0;clearKeys();st('.cnext').focus();emit('lesson-open',{ruleId:ruleId(item)});
  };
  const originalXo=Xo;
  Xo=function(){
    if(!Jt)return;
    const after=Jt.after;
    if(after==='explain'){
      Jt=null;ut.course.hidden=true;At='explain';Bi=0;ut.explain.hidden=false;clearKeys();emit('lesson-return-to-feedback');return;
    }
    originalXo();Bi=1;clearKeys();
    if(after==='plan')cr(true);
    emit('lesson-close');
  };
  const originalAa=aa;
  aa=function(){originalAa();st('.cprev').disabled=Jt.i===0;};
  function reviewFeedback(){
    const item=Ie?.it||dr();
    const gate=(item?.s&&Yu.find(g=>g.s===item.s))||Yu.find(g=>g.c.id==='O11'&&g.s.id==='hierarchie');
    if(!gate)return;
    ut.explain.hidden=true;ia(gate,true);Jt.after='explain';
  }
  st('.ecourse').onclick=reviewFeedback;
  window.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if(event.target?.closest?.('input,textarea,select,summary,[contenteditable="true"]')){event.stopImmediatePropagation();return;}
    if(At==='course'&&key==='enter'){
      event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)st('.cnext').click();return;
    }
    if(At==='explain'&&key==='c'){
      event.preventDefault();event.stopImmediatePropagation();reviewFeedback();return;
    }
  },true);
  window.addEventListener('blur',clearKeys);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearKeys();});
  const originalNh=nh;
  nh=function(index){
    if(!lr||!Number.isInteger(index)||index<0||index>=lr.order.length)return;
    const scene=lr.S,choice=lr.order[index];
    emit('decision',{ruleId:ruleId(scene.it),scenarioId:scene.sc.id,choiceIndex:choice,correct:choice===scene.sc.ok});
    originalNh(index);
  };
  const originalSm=SM;
  SM=function(scene){emit('scenario-complete',{ruleId:ruleId(scene.it),scenarioId:scene.sc.id});originalSm(scene);};
  const originalBu=Bu;
  Bu=function(scene){emit('scenario-feedback',{ruleId:ruleId(scene.it),scenarioId:scene.sc.id});originalBu(scene);};

  const scen=Hn.filter(item=>item.type==='sit');
  const ruleIds=new Set(Yo.chapters.flatMap(ch=>ch.sections.map(sec=>ch.id+'/'+sec.id)));
  const scenarioIds=new Set();const contractErrors=[];
  for(const item of scen){
    if(!ruleIds.has(ruleId(item)))contractErrors.push('Cours absent : '+ruleId(item));
    if(scenarioIds.has(item.sc.id))contractErrors.push('Scénario dupliqué : '+item.sc.id);
    scenarioIds.add(item.sc.id);
    if(!Array.isArray(item.sc.choices)||item.sc.choices.length!==3||!item.sc.choices[item.sc.ok])contractErrors.push('Choix invalides : '+item.sc.id);
  }
  const coverage={parts:Yo.groups.length,chapters:Yo.chapters.length,sections:ruleIds.size,playableChapters:Nu.length,playableSections:Yu.length,scenarios:scen.length,contractErrors};
  if(contractErrors.length)throw new Error('Contrat cours–scènes invalide : '+contractErrors.join('; '));

  let selectedPart=0;
  function buildPlan(){
    const list=st('#planList');const sections=[...list.children];
    let nav=st('#labProgramNav');if(nav)nav.remove();
    nav=document.createElement('nav');nav.id='labProgramNav';nav.setAttribute('aria-label','Parties du programme');
    list.before(nav);
    function selectPart(index){
      selectedPart=index;
      sections.forEach((section,i)=>{section.hidden=i!==index;});
      [...nav.children].forEach((button,i)=>button.setAttribute('aria-current',i===index?'page':'false'));
      list.scrollTop=0;
    }
    Yo.groups.forEach((group,index)=>{
      const button=document.createElement('button');button.type='button';button.className='lab-part';
      button.textContent=(index+1)+'. '+group.title;button.onclick=()=>selectPart(index);nav.append(button);
      const section=sections[index];if(!section)return;
      [...section.querySelectorAll('.pc')].forEach((card,chapterIndex)=>{
        const chapter=Mp[group.chapters[chapterIndex]];if(!chapter)return;
        const details=document.createElement('details');details.className='lab-chapter';
        const summary=document.createElement('summary');summary.textContent=chapter.otitle;
        const badge=document.createElement('span');badge.className='lab-badge';
        badge.textContent=Nu.includes(chapter.id)?'Cours + conduite':'Cours · 3D non disponible';summary.append(badge);details.append(summary);
        const driveButtons=[...card.querySelectorAll('[data-gi]')];
        chapter.sections.forEach((sectionData,sectionIndex)=>{
          const row=document.createElement('div');row.className='lab-lesson-row';
          const title=document.createElement('strong');title.textContent=sectionData.otitle;row.append(title);
          const actions=document.createElement('div');actions.className='lab-lesson-actions';
          const read=document.createElement('button');read.type='button';read.className='ghost lab-read';read.textContent='Lire le cours';
          read.setAttribute('aria-label','Lire : '+sectionData.otitle);
          read.onclick=()=>{cr(false);ia({type:'secGate',c:chapter,g:group,s:sectionData},true);Jt.after='plan';};
          actions.append(read);
          const drive=driveButtons[sectionIndex];
          if(drive){drive.textContent=drive.disabled?'Conduite verrouillée':'Conduire';drive.classList.add('lab-drive');drive.setAttribute('aria-label','Conduire : '+sectionData.otitle);actions.append(drive);}
          row.append(actions);details.append(row);
        });
        details.addEventListener('toggle',()=>{if(details.open)[...section.querySelectorAll('details')].forEach(other=>{if(other!==details)other.open=false;});});
        card.replaceWith(details);if(Nu.includes(chapter.id))details.open=true;
      });
    });
    selectPart(Math.min(selectedPart,sections.length-1));
    text(st('#plan header .kick'),'Programme & terrain');
    text(st('#plan header b'),coverage.parts+' parties · '+coverage.chapters+' chapitres · '+coverage.playableChapters+' chapitre simulé');
  }

  text(st('#start h1'),'SwissDriver Lab');
  text(st('#start .kick'),'Cours · décision · conduite');
  text(st('#start .lead'),'Une berline, un cours, puis la situation correspondante. Le chapitre Priorités propose '+coverage.playableSections+' sous-chapitres et '+coverage.scenarios+' situations décisionnelles. Les autres cours sont consultables dans le programme ; leurs scènes 3D ne sont pas encore disponibles.');
  text(st('#start .steps li'),'Passez le portique vert, lisez chaque page avec Entrée, puis reprenez la route à la dernière page.');
  text(st('#startBtn'),'Commencer la conduite');
  const note=document.createElement('p');note.className='lab-scope';note.textContent='Environnement urbain simulé, non certifié comme reproduction géographique. Après votre choix, la trajectoire est assistée : le résultat évalue la décision, pas une conduite manuelle complète.';st('#start .card').insertBefore(note,st('#startBtn'));
  const controls=document.createElement('div');controls.id='labControls';
  const help=document.createElement('button');help.type='button';help.className='glass';help.textContent='Touches';help.onclick=()=>st('#keys').classList.toggle('hide');
  const course=document.createElement('button');course.type='button';course.className='glass';course.textContent='Cours';course.onclick=()=>{if(At==='explain')reviewFeedback();else if(At==='drive'){const item=dr(),gate=item?.s?Yu.find(g=>g.s===item.s):item;if(gate)ia(gate,true);}};
  controls.append(course,help);st('#tools').prepend(controls);
  const coherence=document.createElement('div');coherence.id='labContext';coherence.setAttribute('aria-label','Lien entre le cours et la situation');st('#hud').append(coherence);
  let lastContext='';
  setInterval(()=>{
    const state=snapshot();const label=state.scenarioId?state.ruleId+' · '+state.scenarioId+(state.assistedTrajectory?' · Trajectoire assistée':' · Décision'):state.ruleId||'Parcours Priorités';
    if(label!==lastContext){coherence.textContent=label;lastContext=label;}
    course.disabled=!['drive','explain'].includes(At);
    document.body.classList.toggle('lab-reading',['course','plan','explain'].includes(At));
  },200);
  document.querySelectorAll('#course,#plan,#explain').forEach(panel=>{panel.setAttribute('role','dialog');panel.setAttribute('aria-label',panel.id==='course'?'Cours':panel.id==='plan'?'Programme':'Explication de la décision');});
  const touch=document.createElement('div');touch.id='labTouch';touch.setAttribute('aria-label','Commandes tactiles');
  [['q','◀','Clignotant gauche'],['a','←','Tourner à gauche'],['s','−','Freiner'],['w','+','Accélérer'],['d','→','Tourner à droite'],['e','▶','Clignotant droit']].forEach(([key,label,title])=>{
    const button=document.createElement('button');button.type='button';button.className='lab-touch';button.textContent=label;button.setAttribute('aria-label',title);
    const release=()=>{delete xn[key];};
    button.onpointerdown=event=>{event.preventDefault();if(At!=='drive')return;button.setPointerCapture(event.pointerId);if(key==='q')O.blink=O.blink===-1?0:-1;else if(key==='e')O.blink=O.blink===1?0:1;else xn[key]=true;};
    button.onpointerup=release;button.onpointercancel=release;button.onlostpointercapture=release;touch.append(button);
  });
  document.body.append(touch);
  const api={version:'2.0.0',coverage,snapshot,events:()=>events.map(e=>({...e})),vehicle:()=>({...Dt.userData.model}),clearKeys};
  if(window.__SWISSDRIVER_TEST__)api.test={
    player:Dt,scene:Ut,camera:na,render:()=>Gn.render(Ut,na),
    openLesson:(chapterId,sectionId)=>{const c=Mp[chapterId],s=c.sections.find(x=>x.id===sectionId);ia({type:'secGate',c,s,g:iE[chapterId]},true);},
    showRedLightFeedback:()=>RM(),
    prepareDecision:id=>{if(Ie)$o(Ie);const item=scen.find(x=>x.sc.id===id);Rt.idx=Hn.indexOf(item);Ie=vM(item);O.x=He;O.z=item.z+17;O.v=0;O.auto=null;Ie.phase='decide';Fu(Ie);Ko();return snapshot();},
    vehiclePreview:()=>{window.__NORENDER=true;na.position.copy(Dt.position).add(dt(5,3,-6));na.lookAt(Dt.position.clone().add(dt(0,.8,0)));Gn.render(Ut,na);},
    openPlan:()=>cr(true),closePlan:()=>cr(false),
    inspectScene:id=>{const item=scen.find(x=>x.sc.id===id);if(!item)throw new Error('Scénario absent');const scene=vM(item);const value={id,ruleId:ruleId(item),actors:scene.actors.length,props:scene.props.children.length,light:scene.light,pathLength:scene.pPath.len};$o(scene);return value;}
  };
  window.SwissDriverLab=Object.freeze(api);emit('ready');
})();
