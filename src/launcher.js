(async function(){
  'use strict';
  const frame=document.getElementById('game'),notice=document.getElementById('notice');
  const message=document.getElementById('message');
  function fail(error){notice.hidden=false;message.textContent='Chargement interrompu : '+error.message;document.getElementById('original').hidden=false;document.getElementById('retry').hidden=false;}
  document.getElementById('retry').onclick=()=>location.reload();
  if(location.protocol==='file:'){fail(new Error('Ce lanceur nécessite un serveur HTTP. Le fichier autonome produit par scripts/build.cjs fonctionne sans serveur.'));return;}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
  try{
    const paths=['./Permis_GT_Rossa.html','./swissdriver-modern.css','./src/sedan.js','./src/engine-bridge.js','./src/scene-coherence.js','./src/scene-coherence.css','./src/decision-safety.js'];
    const sources=await Promise.all(paths.map(async path=>{const response=await fetch(path,{signal:controller.signal,cache:'no-cache'});if(!response.ok)throw new Error(path+' ('+response.status+')');return response.text();}));
    frame.addEventListener('load',()=>{
      try{if(!frame.contentWindow.SwissDriverLab||!frame.contentWindow.SwissDriverSafety)throw new Error('Le moteur 3D n’a pas terminé son initialisation. Vérifiez WebGL et la console.');notice.hidden=true;frame.focus();}
      catch(error){fail(error);}
    },{once:true});
    frame.srcdoc=SwissDriverTransform.assemble(sources[0],sources[1]+"\n"+sources[5],sources[2],sources[3]+"\n"+sources[4]+"\n"+sources[6]);
  }catch(error){fail(error);}finally{clearTimeout(timer);}
})();
