/* Local-only server for the editable launcher; no external dependencies. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const port=Number(process.env.PORT||8000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT invalide');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.md':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  try{
    const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';
    if(rel.split(/[\\/]/).some(s=>s.startsWith('.'))){res.writeHead(403);res.end();return;}
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const real=fs.realpathSync(file);
    if(!real.startsWith(root+path.sep)||!fs.statSync(real).isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(real)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD'){res.end();return;}
    const stream=fs.createReadStream(real);stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:400);res.end('Ressource indisponible');}
});
server.on('error',e=>{console.error('Serveur : '+e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('SwissDriver : http://127.0.0.1:'+port+' — Ctrl+C pour quitter.'));
