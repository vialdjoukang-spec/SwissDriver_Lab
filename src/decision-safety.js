/* Match t3's consequence to its question: make room without crossing red.
 * Scripted training signal sequence, not a regulatory timing model. */
(function(){
  'use strict';
  const createScene=vM;
  vM=function(item){
    const scene=createScene(item);
    if(item.sc.id==='t3'){
      const lineZ=item.z+be+4.6;
      scene.stopS=scene.pPath.sAtZ(lineZ+2.55);
      scene.decS=scene.stopS;
      scene.labRed={phase:'red',lineZ,clearSeconds:0};
    }
    return scene;
  };
  const signal=sa;
  sa=function(axis,time,index){
    if(Ie?.labRed?.phase==='all-red'&&index===Math.round(Ie.it.z/Oe))return 'red';
    return signal(axis,time,index);
  };
  const resolve=MM;
  MM=function(scene){
    resolve(scene);
    if(scene.good&&scene.labRed&&O.auto){
      O.auto.target=0;O.auto.stopAt=scene.stopS;
      us('Gardez la ligne d’arrêt : l’ambulance passe, votre feu reste rouge.','info');
    }
  };
  const update=EM;
  EM=function(scene,seconds){
    update(scene,seconds);
    if(!scene.good||!scene.labRed||scene.phase!=='resolve'||!O.auto)return;
    const guard=scene.labRed;
    if(guard.phase==='green')return;
    // The legacy code accelerated as soon as the ambulance passed, even at red.
    O.auto.target=0;O.auto.stopAt=scene.stopS;scene.returning=false;O.blink=1;
    const ambulanceClear=scene.amb&&scene.amb.mesh.position.z<O.z-16;
    const junctionClear=scene.actors.filter(a=>a!==scene.amb)
      .every(a=>a.s>=a.clear+a.len/2||a.s>=a.path.len-.5);
    if(ambulanceClear&&junctionClear){
      guard.phase='all-red';guard.clearSeconds+=seconds;
      if(guard.clearSeconds>=1.5){
        guard.phase='green';scene.light='green';oa.set(Math.round(scene.it.z/Oe),'green');
        scene.pulling=false;scene.returning=true;O.auto.stopAt=null;O.auto.target=7;O.blink=-1;
        us('L’ambulance est passée. Votre feu passe au vert : reprise de la trajectoire assistée.','ok');
      }
    }else{guard.phase='red';guard.clearSeconds=0;}
  };
  window.SwissDriverSafety=Object.freeze({
    version:'1.0.0',
    snapshot:()=>{
      const scene=Ie,guard=scene?.labRed;
      return guard?{scenarioId:scene.sc.id,...guard,frontMarginM:O.z-2.45-guard.lineZ,
        signals:{avenue:sa('av',sdSimTime,Math.round(scene.it.z/Oe)),cross:sa('cr',sdSimTime,Math.round(scene.it.z/Oe))}}:null;
    }
  });
})();
