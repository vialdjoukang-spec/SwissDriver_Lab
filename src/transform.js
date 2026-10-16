/* The original 5 MB HTML stays immutable. Every structural patch fails closed.
 * The same transform powers the browser launcher and the standalone build. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SwissDriverTransform=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function once(source,needle,replacement){
    const first=source.indexOf(needle);
    if(first<0||source.indexOf(needle,first+needle.length)!==-1) throw new Error('Source incompatible : ancrage absent ou ambigu ('+needle.slice(0,55)+').');
    return source.slice(0,first)+replacement+source.slice(first+needle.length);
  }
  function assemble(source,css,sedan,bridge,curriculum){
    if([source,css,sedan,bridge,curriculum].some(v=>typeof v!=='string'||!v.trim()))throw new TypeError('Cinq sources texte non vides sont nécessaires.');
    if(source.includes('data-swissdriver-modern'))throw new Error('Ce document est déjà modernisé.');
    const start=source.indexOf('function Kf(){'),end=source.indexOf('function jf(){',start);
    if(start<0||end<=start||!source.slice(start,end).includes('i.userData.front'))throw new Error('Le contrat du véhicule source a changé.');
    let html=source.slice(0,start)+sedan+'\n'+source.slice(end);
    const entry='fp(O.x,O.z,30);Ko();st("#loading").hidden=!0;';
    html=once(html,entry,'\n'+bridge+'\n'+entry);
    html=once(html,'e=i*Bi,t=hp.elapsedTime','e=i*(st("#start").hidden?Bi:0),t=(sdSimTime+=e)');
    html=once(html,'n&&At==="drive"&&!Ie&&','bp&&n&&At==="drive"&&!Ie&&');
    html=once(html,'Ie&&EM(Ie,e)','Ie&&(At==="drive"||At==="resolve")&&EM(Ie,e)');
    html=once(html,'O.v/2.7*Math.tan(O.steer)','O.v/2.8*Math.tan(O.steer)');
    html=once(html,'Gn.setPixelRatio(Math.min(devicePixelRatio,2))','Gn.setPixelRatio(Math.min(devicePixelRatio,1.5))');
    html=once(html,'fi.shadow.mapSize.set(3072,3072)','fi.shadow.mapSize.set(innerWidth<700?1024:2048,innerWidth<700?1024:2048)');
    html=once(html,'window.__NORENDER||Gn.render(Ut,na)','Dt.visible=!(($u===1&&At==="drive"&&!Ie)||(window.SwissDriverScene&&window.SwissDriverScene.isDriverView()));window.__NORENDER||Gn.render(Ut,na)');
    // Simplified road: every chapter gets course gates; only chapters with scenes
    // (Nu) get situations and a section end. Course-only gates award nothing.
    html=once(html,'if(!Nu.includes(r)){i.push({type:"locked",c:a,g:s,z:null});continue}','');
    html=once(html,'l=t(e-25),i.push({type:"secEnd",c:a,g:s,s:u,z:l}),e=l','c.length&&(l=t(e-25),i.push({type:"secEnd",c:a,g:s,s:u,z:l}),e=l)');
    html=once(html,'Hn[Rt.idx]===i&&(ih(),i.type==="secGate")','Hn[Rt.idx]===i&&(ih(),i.type==="secGate"&&yM(i.s))');
    // Simplified course scenes (content/road-lessons) take a mid-block slot after their gate.
    html=once(html,'let c=Uu[r]&&Uu[r][u.id]||[];','let c=Uu[r]&&Uu[r][u.id]||[];for(let h of (Yo.roadLessons||[]).filter(q=>q.rule===r+"/"+u.id)){let d=Math.floor((e-26+40)/Oe)*Oe-40;i.push({type:"lesson",ls:h,c:a,g:s,s:u,z:d}),e=d-30}');
    html=once(html,'label:i.type==="sit"?"Situation":','label:i.type==="sit"?"Situation":i.type==="lesson"?"Scène de cours":');
    // The versioned curriculum is merged where the engine first reads the data.
    html=once(html,'var Yo=window.DATA,','var Yo=(window.DATA=SwissDriverCurriculum.merge(window.DATA,window.__SD_EXTENSION)),');
    html=once(html,'</head>','<script data-swissdriver-curriculum="1">\n'+curriculum.replace(/<\/script/gi,'<\\/script')+'\n</script>\n</head>');
    html=once(html,'</head>','<style data-swissdriver-modern="2">\n'+css+'\n</style>\n</head>');
    html=once(html,'<title>Permis B · Rossa GT</title>','<title>SwissDriver Lab · Cours et conduite</title>');
    return html;
  }
  return Object.freeze({assemble,once,version:'3.1.0'});
});
