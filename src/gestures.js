/* Makes the gesture announced by a wrong answer visible in the scene instead
 * of a generic animation: horn, headlight flash, hand sign, lateral shift,
 * reversing, harder acceleration. Correct trajectories are never altered. */
var SwissDriverGestureRules=(function(){
  'use strict';
  const RULES=[
    {id:'horn',label:'Klaxon',test:/klaxon/i},
    {id:'flash',label:'Appel de phares',test:/appel de phares/i},
    {id:'hand',label:'Signe de la main',test:/faire signe|fasse signe/i},
    {id:'left',label:'Décalage vers la gauche',test:/décale à gauche|me décale/i},
    {id:'reverse',label:'Marche arrière',test:/\brecule/i},
    {id:'half',label:'Engagement partiel',test:/à moitié|au milieu du carrefour/i},
    {id:'blink-left',label:'Clignotant gauche',test:/clignotant gauche/i},
    {id:'blink-right',label:'Clignotant droit',test:/clignotant droit dès/i},
    {id:'hard',label:'Forte accélération',test:/accél[èé]r|passe vite|sors vite|frôlant/i},
    {id:'stop-lane',label:'Arrêt sur la voie',test:/m’arrête au milieu|m’arrête dans|freine fort/i},
  ];
  function classify(text){const r=RULES.find(rule=>rule.test.test(text||''));return r?{id:r.id,label:r.label}:null;}
  if(typeof module==='object'&&module.exports)module.exports={RULES,classify};
  return {RULES,classify};
})();
if(typeof MM==='function'&&typeof EM==='function')(function(){
  'use strict';
  const caption=document.createElement('div');caption.id='labAction';caption.setAttribute('role','status');caption.hidden=true;
  document.body.append(caption);
  let flash=null;
  const originalMM=MM;
  MM=function(scene){
    originalMM(scene);
    const choice=scene.sc.choices[scene.choice];
    const gesture=scene.good?null:SwissDriverGestureRules.classify(choice.t);
    scene.labGesture=gesture;scene.labGestureT=0;
    caption.innerHTML='<b>Votre action</b> '+Be(choice.t)+(gesture?' <span>· '+Be(gesture.label)+'</span>':'');caption.hidden=false;
    if(gesture&&O.auto){
      if(gesture.id==='horn')di.horn();
      if(gesture.id==='hard')O.auto.target=Math.max(O.auto.target,12);
      if(gesture.id==='half'&&!scene.blockFail)O.auto.stopAt=Math.max(O.sAlong+2,scene.stopS+3.5);
      if(gesture.id==='stop-lane'||gesture.id==='hand'||gesture.id==='reverse'){O.auto.target=0;O.auto.stopAt=O.sAlong+1;}
      if(gesture.id==='blink-left')O.blink=-1;
      if(gesture.id==='blink-right')O.blink=1;
      if(gesture.id==='flash'){flash=Date.now();document.body.classList.add('lab-flash');}
    }
    window.dispatchEvent(new CustomEvent('swissdriver:event',{detail:{type:'gesture',scenarioId:scene.sc.id,choiceIndex:scene.choice,gesture:gesture?gesture.id:null}}));
  };
  const originalEM=EM;
  EM=function(scene,dt){
    originalEM(scene,dt);
    const g=scene.labGesture,a=O.auto;
    if(!g||scene.phase!=='resolve'||!a)return;
    scene.labGestureT+=dt;
    if(g.id==='left')a.lat=Math.max(-1.6,(a.lat||0)-dt*1.2);
    if(g.id==='reverse'&&scene.labGestureT>.6&&scene.labGestureT<2.4){a.target=0;a.stopAt=null;a.s=Math.max(0,a.s-dt*1.1);}
    if(g.id==='hand'&&scene.labGestureT>.3&&scene.labGestureT<1.6&&!scene.labHandShown){scene.labHandShown=true;us('<b>Signe de la main</b> · un geste ne donne et ne retire aucune priorité','info');}
  };
  setInterval(()=>{
    if(flash&&Date.now()-flash>900){flash=null;document.body.classList.remove('lab-flash');}
    if(!['resolve'].includes(At))caption.hidden=true;
  },150);
})();
