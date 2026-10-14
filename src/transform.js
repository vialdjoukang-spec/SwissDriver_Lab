/* The original 5 MB HTML stays immutable. Every structural patch fails closed.
 * The same transform powers the browser launcher and the standalone build. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SwissDriverTransform=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function once(source,needle,replacement){
    const first=source.indexOf(needle);
    if(first<0||source.indexOf(needle,first+needle.length)!==-1) throw new Error('Source incompatible : ancrage absent ou ambigu ('+needle.slice(0,55)+').');
    return source.slice(0,first)+replacement+source.slice(first+needle.length);
  }
  function assemble(source,css,sedan,bridge){
    if([source,css,sedan,bridge].some(v=>typeof v!=='string'||!v.trim()))throw new TypeError('Quatre sources texte non vides sont nécessaires.');
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
    html=once(html,'</head>','<style data-swissdriver-modern="2">\n'+css+'\n</style>\n</head>');
    html=once(html,'<title>Permis B · Rossa GT</title>','<title>SwissDriver Lab · Cours et conduite</title>');
    return html;
  }
  return Object.freeze({assemble,once,version:'2.0.0'});
});
