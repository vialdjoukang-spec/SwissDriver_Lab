/* Simplified course scenes on the road (content/road-lessons): a real sign or
 * marking, one decision, an assisted consequence, an explanation and a replay.
 * They exist only for sections without engine scenarios and are never counted
 * among the 25 Priorités situations. Progress key permisGT.v1 only advances its
 * route index, exactly as a course gate does. */
(function(){
  'use strict';
  const RESULT_KEY='swissdriver.roadLessons.v1';
  const ITEMS=Hn.filter(item=>item.type==='lesson');
  const SIGNS=window.SwissDriverSigns;
  const COLORS={white:'#f4f4ef',yellow:'#f2c230',orange:'#f08a1c',blue:'#2d6fd1'};
  const SPEED={go:25,stop:25,park:20,detour:15,overtake:32,honk:25};
  const LAT={park:2.4,detour:-2.1,overtake:-3};
  const DECIDE_DZ=18,START_DZ=40;
  const ruleOf=item=>item.c.id+'/'+item.s.id;
  const emit=detail=>window.dispatchEvent(new CustomEvent('swissdriver:event',{detail}));
  let results=(()=>{try{const v=JSON.parse(localStorage.getItem(RESULT_KEY)||'null');if(v&&v.v===1)return v;}catch{}return {v:1,done:[],errors:0};})();
  const saveResults=()=>{try{localStorage.setItem(RESULT_KEY,JSON.stringify(results));}catch{}};

  // Textures: the SVG drawings of signs.js rasterised once, plates and ground symbols drawn directly.
  const textures={};
  function canvasTexture(key,w,h,draw){
    if(textures[key])return textures[key];
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);
    const tex=new Bn(canvas);tex.colorSpace=at;return textures[key]=tex;
  }
  function signTexture(id){
    if(textures['sign:'+id])return textures['sign:'+id];
    const svg=SIGNS.drawing(id);if(!svg)throw new Error('Signal absent : '+id);
    const tex=canvasTexture('sign:'+id,256,256,()=>{});
    const img=new Image();
    img.onload=()=>{tex.image.getContext('2d').drawImage(img,0,0,256,256);tex.needsUpdate=true;};
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">'+svg+'</svg>');
    return tex;
  }
  const plateTexture=text=>canvasTexture('plate:'+text,256,96,(g,w,h)=>{
    g.fillStyle='#fff';g.fillRect(0,0,w,h);g.strokeStyle='#111';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6);
    g.fillStyle='#111';g.font='700 48px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+2);
  });
  const symbolTexture=id=>canvasTexture('symbol:'+id,128,128,(g,w)=>{
    g.strokeStyle=g.fillStyle=id==='bike'?COLORS.yellow:COLORS.white;g.lineWidth=7;
    if(id==='bike'){[[34,84],[94,84]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,20,0,7);g.stroke();});g.beginPath();g.moveTo(34,84);g.lineTo(56,50);g.lineTo(84,50);g.lineTo(94,84);g.moveTo(56,50);g.lineTo(66,84);g.lineTo(84,50);g.stroke();}
    else{g.beginPath();g.moveTo(74,8);g.lineTo(34,70);g.lineTo(62,70);g.lineTo(50,120);g.lineTo(96,52);g.lineTo(68,52);g.closePath();g.fill();}
  });

  // Scene objects. x is the lateral position, dz the distance before the scene point L (the car comes from +z).
  function flat(w,l,color,x,z,y=.03){const m=new se(new Gt(w,l),new rt({color}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);return m;}
  function segment(group,x1,z1,x2,z2,width,color){
    const len=Math.hypot(x2-x1,z2-z1),holder=new ot;holder.position.set((x1+x2)/2,0,(z1+z2)/2);holder.rotation.y=Math.atan2(x2-x1,z2-z1);
    holder.add(flat(width,len,color,0,0));group.add(holder);
  }
  function sign(group,p,L){
    const plates=p.plates||[],size=.95,base=(p.height||2.1)+plates.length*.32,g=new ot;
    const pole=new se(new It(.04,.04,base+size,10),new xe({color:'#8e979f',metalness:.7,roughness:.4}));pole.position.y=(base+size)/2;pole.castShadow=true;g.add(pole);
    const face=new se(new Gt(size,size),new rt({map:signTexture(p.id),transparent:true,toneMapped:false}));face.position.set(0,base+size/2,.05);g.add(face);
    const back=new se(new Gt(size*.95,size*.95),new xe({color:'#9aa2a9',metalness:.6}));back.position.set(0,base+size/2,.04);back.rotation.y=Math.PI;g.add(back);
    plates.forEach((text,i)=>{const m=new se(new Gt(.72,.27),new rt({map:plateTexture(text),toneMapped:false}));m.position.set(0,base-.18-i*.32,.05);g.add(m);});
    g.position.set(p.x,0,L+p.dz);g.userData.labSign=p.id;group.add(g);
  }
  function build(item){
    const L=item.z,group=new ot,actors=[];group.userData.labLesson=item.ls.id;
    const mover=(mesh,p,kind,vmax)=>{
      const path=new yt(bt([p.x,L+p.dz],[p.toX??p.x,L+(p.toDz??p.dz-200)]));
      const a=fn(mesh,path,{kind,vmax,hold:p.start==='always'?null:.2,released:p.start==='always',prio:false,rad:1.4});
      a.labStart=p.start||'resolve';actors.push(a);return a;
    };
    for(const p of item.ls.props){
      const color=COLORS[p.color]||COLORS.white;
      if(p.kind==='sign')sign(group,p,L);
      else if(p.kind==='line'){
        const x2=p.x2??p.x,from=L+p.from,to=L+p.to,w=.15;
        if(p.style!=='dashed'){segment(group,p.x,from,x2,to,w,color);continue;}
        const len=Math.abs(from-to);for(let d=0;d+3<=len;d+=6){const a=d/len,b=(d+3)/len;segment(group,p.x+(x2-p.x)*a,from+(to-from)*a,p.x+(x2-p.x)*b,from+(to-from)*b,w,color);}
      }
      else if(p.kind==='crosswalk')for(let x=p.from;x<=p.to;x+=1)group.add(flat(.5,4,COLORS.yellow,x,L+p.dz,.032));
      else if(p.kind==='bay'){
        const z=L+p.dz,w=p.w||2,l=p.len||5.5;
        [[0,l/2],[0,-l/2]].forEach(([,dz])=>group.add(flat(w,.12,color,p.x,z+dz)));[[-w/2],[w/2]].forEach(([dx])=>group.add(flat(.12,l,color,p.x+dx,z)));
        if(p.symbol){const m=new se(new Gt(1.2,1.2),new rt({map:symbolTexture(p.symbol),transparent:true}));m.rotation.x=-Math.PI/2;m.position.set(p.x,.034,z);group.add(m);}
      }
      else if(p.kind==='symbol'){const m=new se(new Gt(1.3,1.3),new rt({map:symbolTexture(p.id),transparent:true}));m.rotation.x=-Math.PI/2;m.position.set(p.x,.034,L+p.dz);group.add(m);}
      else if(p.kind==='cones'){const mat=new xe({color:'#f07a14',roughness:.5});for(let d=p.from;d>=p.to;d-=p.step||4){const c=new se(new It(.03,.18,.55,10),mat);c.position.set(p.x,.275,L+d);c.castShadow=true;group.add(c);}}
      else if(p.kind==='barrier'){
        const w=p.w||2.4,red=new xe({color:'#c8102e'}),white=new xe({color:'#f4f4ef'});
        for(let i=0;i<6;i++){const b=new se(new Lt(w/6,.32,.12),i%2?white:red);b.position.set(p.x-w/2+w/12+i*w/6,.75,L+p.dz);group.add(b);}
        [-w/2+.1,w/2-.1].forEach(dx=>{const leg=new se(new Lt(.08,.75,.08),white);leg.position.set(p.x+dx,.37,L+p.dz);group.add(leg);});
      }
      else if(p.kind==='island'){const top=L+p.from,bottom=L+p.to,m=new se(new Lt(p.w||1.2,.16,top-bottom),new xe({color:'#c9c9c4',roughness:.8}));m.position.set(p.x,.08,(top+bottom)/2);m.receiveShadow=true;group.add(m);}
      else if(p.kind==='car'){const c=In(Ot,jt,p.paint||0);c.position.set(p.x,0,L+p.dz);group.add(c);}
      else if(p.kind==='ped'){const m=Wo(p.child?['#f2a516','#2b4a7a']:['#d9435a','#2b2f36']);if(p.child)m.scale.setScalar(.72);mover(m,p,'ped',(p.kmh||4.7)/3.6);}
      else if(p.kind==='bike')mover(_M(),p,'bike',(p.kmh||12)/3.6);
      else if(p.kind==='leadCar')mover(In(Ot,jt,p.paint||0),{...p,toDz:p.dz-260},'car',(p.kmh||10)/3.6);
    }
    Ut.add(group);
    const scene={group,actors};resetActors(scene);return scene;
  }
  function resetActors(built){for(const a of built.actors){a.s=0;a.v=0;a.released=a.labStart==='always';th(a);}}
  function dispose(item){const b=built.get(item);if(!b)return;Ut.remove(b.group);b.actors.forEach(gM);built.delete(item);}
  const built=new Map();

  // Lesson state: approach -> decide -> resolve -> (complete | explain -> replay).
  let active=null;
  const resultOf=item=>results.done.includes(item.ls.id);
  function begin(item){
    const lesson=item.ls,L=item.z;if(!built.has(item))built.set(item,build(item));
    const b=built.get(item);resetActors(b);
    Ie&&($o(Ie),Ie=null);
    O.x=He;O.z=L+DECIDE_DZ;O.h=0;O.v=0;O.auto=null;O.blink=0;Vn=true;
    const path=new yt(bt([He,L+START_DZ+20],[He,L-80]));
    active={item,lesson,b,path,phase:'decide',order:[0,1,2].sort(()=>Math.random()-.5),t:0,held:0};
    ut.decide.querySelector('.dtitle').innerHTML='<span>Scène de cours · '+Be(item.s.otitle)+'</span>'+Be(lesson.title);
    ut.decide.querySelector('.dscene').innerHTML=Be(lesson.scene)+'<p class="lab-scope">Scène simplifiée : après votre choix, la trajectoire est assistée.</p>';
    ut.decide.querySelector('.dchoices').innerHTML=active.order.map((n,k)=>'<button data-k="'+k+'"><kbd>'+(k+1)+'</kbd><span>'+Be(lesson.choices[n].t)+'</span></button>').join('');
    ut.decide.hidden=false;At='decide';Bi=0;SwissDriverLab.clearKeys();
    emit({type:'road-lesson-open',lessonId:lesson.id,ruleId:ruleOf(item)});
  }
  function choose(k){
    if(!Number.isInteger(k)||k<0||k>2)return;
    const lesson=active.lesson,choice=active.order[k],c=lesson.choices[choice],L=active.item.z,path=active.path;
    ut.decide.hidden=true;At='resolve';Bi=1;
    Object.assign(active,{phase:'resolve',choice,good:choice===lesson.ok,t:0,held:0,returning:false,
      lat:c.lat??LAT[c.act]??0,endS:path.sAtZ(L+(lesson.endDz??-30)),backS:path.sAtZ(L+(lesson.endDz??-30)+10)});
    O.auto={path,s:path.sAtZ(O.z),target:(c.kmh||SPEED[c.act])/3.6,stopAt:null,lat:0};
    if(c.act==='stop'||c.act==='park'||c.stopDz!==undefined)O.auto.stopAt=path.sAtZ(L+(c.stopDz??(c.act==='stop'?8:0)));
    if(c.act==='honk')di.horn();
    for(const a of active.b.actors)if(a.labStart==='resolve'||(a.labStart==='good'&&active.good))a.released=true;
    if(active.good){di.good();us('<b>Bonne décision</b> · '+Be(lesson.should),'ok');}
    emit({type:'road-lesson-decision',lessonId:lesson.id,ruleId:ruleOf(active.item),choiceIndex:choice,correct:active.good});
  }
  function step(dt){
    const a=O.auto;if(!a)return abort();
    active.t+=dt;
    if(a.s>=active.backS&&active.good)active.lat=0;
    const lat=a.lat||0,want=active.lat;a.lat=lat+Math.sign(want-lat)*Math.min(Math.abs(want-lat),dt*1.6);
    const stopped=a.stopAt!==null&&a.s>a.stopAt-.5&&O.v<.3;if(stopped)active.held+=dt;
    // A wrong stop or parking is shown until the car is immobilised; a wrong movement for 3.4 s.
    if(!active.good){if(active.held>1.2||active.t>(a.stopAt!==null?9:3.4))fail();return;}
    // A good stop is held, then the car leaves once the released actors (a pedestrian) are clear.
    if(stopped&&active.held>1.6&&active.b.actors.every(x=>!x.released||x.labStart!=='good'||x.s>=x.path.len-.6)){a.stopAt=null;a.target=7;active.lat=0;}
    if(a.s>=active.endS)complete();
  }
  function complete(){
    const {item,lesson}=active;
    if(!results.done.includes(lesson.id))results.done.push(lesson.id);saveResults();
    // Movers leave the lane quickly so that the route is free again.
    active.b.actors.forEach(x=>{x.released=true;if(x.kind!=='ped')x.vmax=Math.max(x.vmax,12);});
    O.auto=null;At='drive';Bi=1;active=null;
    if(Hn[Rt.idx]===item)ih();
    us('<b>Scène réussie</b> · '+Be(lesson.title),'ok');
    emit({type:'road-lesson-complete',lessonId:lesson.id,ruleId:ruleOf(item)});
  }
  function fail(){
    const {item,lesson}=active,c=lesson.choices[active.choice];
    active.phase='explain';O.auto=null;O.v=0;At='explain';Bi=0;di.bad();results.errors++;saveResults();
    ut.explain.querySelector('.ebody').innerHTML='<p class="ekick">'+Be(item.s.otitle)+' · '+Be(lesson.title)+'</p><h2>Ce n’était pas la bonne décision</h2>'+
      '<div class="erow bad"><b>Ce que vous avez fait</b><p>'+Be(c.did)+'</p></div>'+
      '<div class="erow ok"><b>Ce qu’il fallait faire</b><p>'+Be(lesson.should)+'</p></div>'+
      '<div class="erow why"><b>Pourquoi</b><p>'+Be(lesson.why)+'</p></div>'+
      '<div class="memo"><span>Mnémo</span><p>'+Be(lesson.memo)+'</p></div>'+
      '<p class="lab-scope">Scène simplifiée : objets réels du terrain, trajectoire assistée. Elle évalue la décision, pas la conduite manuelle.</p>';
    ut.explain.hidden=false;
    emit({type:'road-lesson-feedback',lessonId:lesson.id,ruleId:ruleOf(item),choiceIndex:active.choice});
  }
  function replay(){
    const item=active.item;active.phase='replaying';ut.explain.hidden=true;At='drive';Bi=1;
    Sp(()=>{resetActors(built.get(item)||{actors:[]});O.x=He;O.z=item.z+START_DZ;O.h=0;O.v=0;O.auto=null;Vn=true;active=null;});
  }
  function abort(){if(!active)return;if(active.phase==='decide')ut.decide.hidden=true;if(active.phase==='explain')ut.explain.hidden=true;active=null;}

  // Engine hooks: the decision keys, the replay key and the return to the route.
  const previousNh=nh;
  nh=function(index){if(active&&active.phase==='decide'){choose(index);return;}previousNh(index);};
  const previousHr=hr;
  hr=function(){if(active&&active.phase==='explain'){replay();return;}previousHr();};
  const previousWm=wM;
  wM=function(){if(active)return;previousWm();};
  const previousKo=Ko;
  Ko=function(){
    previousKo();const item=dr();if(!item?.s)return;
    const own=ITEMS.filter(x=>x.s===item.s);if(!own.length)return;
    st('#hZone').textContent='Scène de cours : '+own.filter(resultOf).length+' / '+own.length+' · simplifiée';
  };

  let lastSim=sdSimTime;
  function frame(){
    requestAnimationFrame(frame);
    const dt=Math.min(.1,Math.max(0,sdSimTime-lastSim));lastSim=sdSimTime;
    for(const item of ITEMS){
      const near=Math.abs(O.z-item.z)<170;
      if(near&&!built.has(item))built.set(item,build(item));
      else if(!near&&built.has(item)&&active?.item!==item)dispose(item);
    }
    for(const b of built.values())for(const a of b.actors)mM(a,dt);
    if(active){
      if(active.phase==='replaying')return;
      if(dr()!==active.item)return abort();
      if(active.phase==='resolve')step(dt);
      return;
    }
    const item=dr();
    if(item?.type==='lesson'&&At==='drive'&&!Ie&&st('#start').hidden&&O.z<item.z+DECIDE_DZ+.5&&O.z>item.z-30)begin(item);
  }
  requestAnimationFrame(frame);

  const api={version:'1.0.0',count:ITEMS.length,
    list:()=>ITEMS.map(item=>({id:item.ls.id,ruleId:ruleOf(item),z:item.z,index:Hn.indexOf(item),done:resultOf(item)})),
    state:()=>active?{id:active.lesson.id,phase:active.phase,order:[...active.order],good:active.good??null}:null,
    results:()=>({...results,done:[...results.done]})};
  if(window.__SWISSDRIVER_TEST__)api.test={
    // Places the car just before the decision point of a scene, as the route would.
    approach:id=>{const item=ITEMS.find(x=>x.ls.id===id);if(!item)throw new Error('Scène absente');abort();
      Ie&&($o(Ie),Ie=null);ut.course.hidden=true;ut.explain.hidden=true;ut.decide.hidden=true;st('#plan').hidden=true;Jt=null;
      Rt.idx=Hn.indexOf(item);At='drive';Bi=1;O.x=He;O.z=item.z+DECIDE_DZ+.2;O.h=0;O.v=0;O.auto=null;Vn=true;Ko();return Rt.idx;},
    sample:()=>{const item=active?.item||dr();const b=item&&built.get(item);
      return {phase:active?.phase||null,L:item?.z??null,mode:At,car:{x:O.x,z:O.z,v:O.v,s:O.auto?.s??null,lat:O.auto?.lat??null},
        actors:(b?.actors||[]).map(a=>({kind:a.kind,x:a.mesh.position.x,z:a.mesh.position.z,s:a.s,len:a.path.len,released:a.released}))};},
    inspect:id=>{const item=ITEMS.find(x=>x.ls.id===id);const b=built.get(item)||build(item);built.set(item,b);
      const signs=[];b.group.traverse(o=>{if(o.userData.labSign)signs.push(o.userData.labSign);});
      return {id,objects:b.group.children.length,actors:b.actors.length,signs,z:item.z};}
  };
  window.SwissDriverRoadLessons=Object.freeze(api);
})();
