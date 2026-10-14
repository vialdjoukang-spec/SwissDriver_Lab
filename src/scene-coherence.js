/* Scene observation layer. This runs in the legacy engine closure, after the
 * bridge. No duplicate scene, curriculum, score or localStorage key is created.
 * Geometry inspection is not an exhaustive Swiss-law/trajectory certification. */
(function(){
  'use strict';
  const VERSION='2.1.0';
  const byId=new Map(Hn.filter(i=>i.type==='sit').map(i=>[i.sc.id,i]));
  const labels={yield:'Cédez le passage',main:'Route principale',mainEnd:'Fin de route principale',round:'Sens giratoire',narrowPrio:'Passage étroit',plateLeft:'Tracé de la route principale'};
  const nativeSign=ip;
  ip=function(kind,...args){const mesh=nativeSign(kind,...args);mesh.userData.labSign=kind;mesh.name='signal-'+kind;return mesh;};
  const nativePlate=sp;
  sp=function(kind,...args){const mesh=nativePlate(kind,...args);mesh.userData.labSign=kind;mesh.name='plaque-'+kind;return mesh;};
  const nativeMark=rp;
  rp=function(x,z,width){
    // The legacy caller used a 5 m line offset 1 m into the kerb. Keep it in
    // the player's lane. This does not certify the exact official road marking.
    const mesh=nativeMark(Math.abs(x-(He+1))<.01?He:x,z,width??3.2);
    mesh.userData.labMark='yield-line';return mesh;
  };
  // The approach is explicitly the THIN branch in this scenario. A priority
  // diamond on that approach contradicts its own question and feedback.
  const p4=byId.get('p4');
  if(!p4||!p4.sc.scene.includes('Le losange jaune porte'))throw Error('Scénario p4 incompatible.');
  p4.sc.scene='Votre approche porte un panneau **« Cédez le passage »** et une **plaque de direction**. Sur la plaque, le **trait épais** vient de votre **gauche** et repart devant vous. Votre approche correspond au **trait fin** du bas. Une voiture arrive de gauche et suit la route principale.';

  function point(mesh,dy=0){return mesh.getWorldPosition(dt(0,0,0)).add(dt(0,dy,0));}
  function aim(bone,next,target){
    if(!bone||!next)return;
    const localDirection=target.clone().sub(point(bone)).applyQuaternion(bone.parent.getWorldQuaternion(bone.quaternion.clone()).invert()).normalize();
    bone.quaternion.setFromUnitVectors(next.position.clone().normalize(),localDirection);bone.updateMatrixWorld(true);
  }
  function gesture(mesh,time){
    let rig=mesh.userData.labRig;
    if(!rig){
      rig={};mesh.traverse(n=>{if(n.isBone&&['RightArm','RightForeArm','RightHand'].includes(n.name))rig[n.name]=n;});
      mesh.userData.labRig=rig;
    }
    if(!rig.RightArm||!rig.RightForeArm||!rig.RightHand)return false;
    mesh.updateMatrixWorld(true);
    const elbow=mesh.localToWorld(dt(-.40,1.30,.35));
    const hand=mesh.localToWorld(dt(-.28,1.35+.08*Math.sin(time*3.2),.68+.16*Math.cos(time*3.2)));
    aim(rig.RightArm,rig.RightForeArm,elbow);aim(rig.RightForeArm,rig.RightHand,hand);
    mesh.userData.labGesture='beckon';return true;
  }
  const nativePose=gp;
  gp=function(mesh,speed,dtSeconds){nativePose(mesh,speed,dtSeconds);if(mesh.userData.wave)gesture(mesh,performance.now()/1000);};

  const nativeScene=vM;
  vM=function(item){
    const scene=nativeScene(item);
    scene.labVersion=VERSION;
    if(item.sc.id==='p4'){
      for(const object of [...scene.props.children])if(object.userData.labSign==='main')scene.props.remove(object);
      const sign=ip('yield');sign.position.set(5.6,ce,item.z+8.6);
      sign.add(sp('plateLeft',1.84));scene.props.add(sign,rp(He,item.z+8.2));
    }
    const agent=scene.actors.find(a=>a.kind==='agent');
    if(agent){
      agent.vmax=0;agent.v=0;
      const equip=()=>{
        if(!agent.mesh.parent)return;
        if(!agent.mesh.userData.mixer&&Gu){
          const old=agent.mesh;const replacement=Wo(['#d9ed51','#20364a']);
          replacement.position.copy(old.position);replacement.rotation.copy(old.rotation);
          Ut.remove(old);Ut.add(replacement);agent.mesh=replacement;
        }
        agent.mesh.userData.wave=true;gesture(agent.mesh,performance.now()/1000);
      };
      equip();oM.then(equip);
    }
    return scene;
  };

  let focusKey='overview';
  const toolbar=document.createElement('section');toolbar.id='labObserve';toolbar.hidden=true;toolbar.setAttribute('aria-label','Observation de la scène');
  const heading=document.createElement('strong');heading.textContent='Observer avant de décider';
  const note=document.createElement('span');note.className='lab-observe-note';note.textContent='Situation figée · le temps de lire ne compte pas';
  const overview=document.createElement('button');overview.type='button';overview.id='labOverview';overview.textContent='Vue d’ensemble';
  const driver=document.createElement('button');driver.type='button';driver.id='labDriverView';driver.textContent='Vue conducteur';
  const actions=document.createElement('div');actions.className='lab-view-actions';actions.append(overview,driver);
  const targets=document.createElement('div');targets.id='labObserveTargets';
  toolbar.append(heading,note,actions,targets);document.body.append(toolbar);
  const caption=document.createElement('div');caption.id='labSceneCaption';caption.hidden=true;document.body.append(caption);
  const nativeRender=Gn.render.bind(Gn);let lastSize='';
  function landmarks(scene){
    if(!scene)return [];
    const result=[];
    const agent=scene.actors.find(a=>a.kind==='agent');
    if(agent)result.push({key:'agent',label:'Agent de police',mesh:agent.mesh,dy:1.25});
    scene.props.traverse(mesh=>{
      const kind=mesh.userData.labSign;
      if(kind&&kind!=='stopText'&&kind!=='plateLeft')result.push({key:'sign-'+mesh.uuid,label:labels[kind]||kind,mesh,dy:(mesh.userData.top||2.8)-.4});
    });
    for(const [i,a] of scene.actors.entries()){
      if(a===agent)continue;
      result.push({key:'actor-'+i,label:a.kind==='ped'?'Piéton':a.kind==='bike'?'Cycliste':a.kind==='amb'?'Ambulance':a.kind==='tram'?'Tramway':a.queue?'File arrêtée':'Véhicule à observer',mesh:a.mesh,dy:a.kind==='ped'?1: .8});
    }
    return result;
  }
  function rebuildTargets(){
    targets.replaceChildren();
    for(const target of landmarks(Ie).slice(0,5)){
      const button=document.createElement('button');button.type='button';button.textContent=target.label;button.dataset.landmark=target.key;
      button.onclick=()=>select(target.key);targets.append(button);
    }
  }
  function select(key){
    focusKey=key;
    for(const button of toolbar.querySelectorAll('button'))button.setAttribute('aria-pressed',String((button===overview&&key==='overview')||(button===driver&&key==='driver')||button.dataset.landmark===key));
    renderView();
  }
  overview.onclick=()=>select('overview');driver.onclick=()=>select('driver');
  function fit(){
    const active=At==='decide'&&!!Ie;
    document.body.classList.toggle('lab-observing',active);toolbar.hidden=!active;
    let width=innerWidth,height=innerHeight;
    if(active){
      if(innerWidth>760)width=Math.max(320,innerWidth-Math.min(430,innerWidth*.39)-24);
      else height=Math.round(innerHeight*.46);
    }
    const key=width+'x'+height;
    if(key!==lastSize){Gn.setSize(width,height);na.aspect=width/height;na.updateProjectionMatrix();lastSize=key;}
    return {width,height};
  }
  function applyCamera(){
    if(At!=='decide'||!Ie){caption.hidden=true;return;}
    const rows=landmarks(Ie);let target=rows.find(r=>r.key===focusKey);
    if(focusKey==='driver'){
      const forward=dt(-Math.sin(O.h),0,-Math.cos(O.h));
      na.position.set(O.x,1.35,O.z);na.position.addScaledVector(forward,.15);
      na.lookAt(dt(O.x,1.2,O.z).addScaledVector(forward,28));caption.textContent='Vue depuis le siège conducteur';Dt.visible=false;
    }else if(target){
      const look=point(target.mesh,target.dy);
      const side=target.key.startsWith('sign-')?0:2;
      const distance=target.key==='agent'?4.3:target.key.startsWith('sign-')?3.7:8;
      na.position.copy(look).add(dt(side,1.0,distance));na.lookAt(look);Dt.visible=true;caption.textContent=target.label;
    }else{
      // All coordinates come from this actual scene. Do not aim at an old
      // player mesh/camera left over from the previous exercise.
      const points=[dt(O.x,0,O.z),Ie.focus.clone(),...rows.map(r=>point(r.mesh)).filter(p=>p.distanceTo(Ie.focus)<48)];
      const min=dt(Infinity,0,Infinity),max=dt(-Infinity,0,-Infinity);
      points.forEach(p=>{min.x=Math.min(min.x,p.x);min.z=Math.min(min.z,p.z);max.x=Math.max(max.x,p.x);max.z=Math.max(max.z,p.z);});
      const look=dt((min.x+max.x)/2,.4,(min.z+max.z)/2);
      const radius=Math.max(17,(max.x-min.x)*.7,(max.z-min.z)*.65)*Math.max(1,1/na.aspect);
      na.position.copy(look).add(dt(radius*.45,radius*.65,radius));na.lookAt(look);Dt.visible=true;caption.textContent='Vue d’ensemble de la situation';
    }
    na.updateMatrixWorld(true);caption.hidden=false;
  }
  Gn.render=function(scene,camera){fit();applyCamera();nativeRender(scene,camera);};
  function renderView(){Gn.render(Ut,na);}
  const nativeDecision=Fu;
  Fu=function(scene){
    nativeDecision(scene);Bi=0;SwissDriverLab.clearKeys();focusKey='overview';
    Dt.position.set(O.x,0,O.z);Dt.rotation.y=O.h;fp(O.x,O.z,30);aM(sdSimTime);
    rebuildTargets();fit();select('overview');
  };
  const nativeChoose=nh;
  nh=function(index){const active=!!lr;nativeChoose(index);if(active){SwissDriverLab.clearKeys();fit();caption.hidden=true;}};
  addEventListener('resize',()=>{lastSize='';fit();});
  setInterval(fit,200);

  function inspect(scene){
    Ut.updateMatrixWorld(true);
    const signs=[];let markingBounds=null;
    scene.props.traverse(mesh=>{
      if(mesh.userData.labSign){
        const pos=point(mesh);const approach=dt(He,1.4,scene.it.z+20).sub(pos);
        const facing=dt(0,0,1).applyQuaternion(mesh.getWorldQuaternion(mesh.quaternion.clone()));
        signs.push({type:mesh.userData.labSign,x:pos.x,y:pos.y,z:pos.z,facingApproach:facing.dot(approach)>0});
      }
      if(mesh.userData.labMark){const xs=[];mesh.children.forEach(n=>xs.push(n.position.x));markingBounds={minCenterX:Math.min(...xs),maxCenterX:Math.max(...xs)};}
    });
    return {scenarioId:scene.sc.id,ruleId:scene.it.c.id+'/'+scene.it.s.id,kind:scene.sc.kind,light:scene.light,
      signs,markingBounds,actors:scene.actors.map(a=>({kind:a.kind,queue:!!a.queue,x:a.mesh.position.x,z:a.mesh.position.z,gesture:a.mesh.userData.labGesture||null})),pathLength:scene.pPath.len};
  }
  const api={version:VERSION,inspectCurrent:()=>Ie?inspect(Ie):null,focus:select};
  if(window.__SWISSDRIVER_TEST__)api.test={
    prepare:id=>{
      const item=byId.get(id);if(!item)throw Error('Scénario absent : '+id);
      if(Ie)$o(Ie);Ie=null;ut.course.hidden=true;ut.explain.hidden=true;st('#plan').hidden=true;Jt=null;
      Rt.idx=Hn.indexOf(item);At='drive';Bi=1;Ie=vM(item);
      for(const a of Ie.actors){if(a.hold!==null&&!a.queue)a.s=a.hold;th(a);}
      const s=Ie.decS;const pos=Ie.pPath.at(s);O.x=pos.x;O.z=pos.z;O.h=Ie.pPath.yaw(s);O.sAlong=s;O.v=0;
      O.auto={path:Ie.pPath,s,target:7,stopAt:null};Ie.phase='decide';Fu(Ie);return inspect(Ie);
    },
    inspectAll:()=>[...byId.values()].map(item=>{const scene=vM(item);const result=inspect(scene);$o(scene);return result;}),
    gestureState:()=>{const a=Ie?.actors.find(x=>x.kind==='agent');const b=a?.mesh.userData.labRig?.RightForeArm;return b?b.quaternion.toArray():null;},
    refresh:()=>{aM(sdSimTime);renderView();},
    viewport:()=>({width:Gn.domElement.clientWidth,height:Gn.domElement.clientHeight,aspect:na.aspect})
  };
  window.SwissDriverScene=Object.freeze(api);
})();
