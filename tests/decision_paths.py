"""Run all 25 x 3 decision branches with Chromium and the real animation loop.
The oracle freezes the existing answer/action contract, not legal correctness.
Playwright Clock runs every animation callback; no position or result is forced
once a decision is made. Rendering is disabled between observation frames.
"""
from pathlib import Path
from functools import partial
import http.server, threading, json, os, traceback, hashlib, time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'; OUT.mkdir(exist_ok=True)
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
# Independently stored integration expectations for the inherited 25 scenarios.
ORACLE={
 'h1':('agent','go'),'h2':('lightsOffYield','wait'),'h3':('yieldLeft','wait'),'h4':('blockedGreen','wait'),
 'i1':('rightCar','wait'),'i2':('rightCarLate','wait'),'i3':('leftTurn','wait'),'i4':('blockedQueue','wait'),
 'g1':('roundEntry','wait'),'g2':('roundSignal','go'),'g3':('roundExitPed','wait'),
 'e1':('drivewayLeft','wait'),'e2':('drivewayPed','wait'),'e3':('drivewayHedge','creep'),
 'r1':('narrowSign','wait'),'r2':('narrowMine','wait'),'r3':('narrowTheirs','go'),'r4':('narrowTruck','go'),
 'p1':('mainGo','go'),'p2':('mainEnd','wait'),'p3':('sideYield','wait'),'p4':('mainTurns','wait'),
 't1':('ambulance','pull'),'t2':('tramLeft','wait'),'t3':('ambulanceRed','pull')}
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
rows=[]; errors=[]; fatal=None
scope=('Real decision -> simulated trajectory -> terminal outcome -> wrong-answer replay. '
       'Starts at the existing decision fixture, not a full manual approach. '
       'Existing answer contract, not Swiss-law, collision-clearance or performance certification.')
def save():
 payload={'scope':scope,'htmlSha256':hashlib.sha256((ROOT/'dist/SwissDriver_Lab.html').read_bytes()).hexdigest(),
          'expectedBranches':75,'attemptedBranches':len(rows),'passedBranches':sum(r['passed'] for r in rows),
          'allPassed':len(rows)==75 and all(r['passed'] for r in rows) and not errors and not fatal,
          'errors':errors,'fatal':fatal,'branches':rows}
 (OUT/'decision-paths-results.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2))
 return payload
SAMPLE="""(()=>{const s=__G.SIT,p=__G.P;return {
 mode:__G.mode,scenario:s?.sc.id,phase:s?.phase,good:s?.good,waiting:!!s?.waiting,
 t:s?.rt,x:p.x,z:p.z,v:p.v,s:p.auto?.s,endS:s?.endS,target:p.auto?.target,
 stopAt:p.auto?.stopAt,lat:p.auto?.lat,pulling:!!s?.pulling,returning:!!s?.returning,
 queueGone:s?.queueGone,actors:s?.actors.map(a=>({kind:a.kind,x:a.mesh.position.x,z:a.mesh.position.z,
 s:a.s,v:a.v,hold:a.hold,clear:a.clear,released:a.released,prio:a.prio,queue:a.queue})),
 finite:[p.x,p.z,p.v,p.h,...(s?.actors||[]).flatMap(a=>[a.mesh.position.x,a.mesh.position.z,a.s,a.v])].every(Number.isFinite),
 terminal:window.__pathEvents.find(e=>['scenario-complete','scenario-feedback'].includes(e.type))||null};})()"""
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox','--enable-unsafe-swiftshader']}
 if os.getenv('CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 page=browser.new_page(viewport={'width':960,'height':720})
 page.set_default_timeout(30000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('window.__SWISSDRIVER_TEST__=true;window.__NORENDER=true;')
 # Clock is installed before the application creates any timers/RAF callbacks.
 page.clock.install()
 started=time.monotonic()
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/SwissDriver_Lab.html',wait_until='domcontentloaded',timeout=120000)
  page.wait_for_function('window.SwissDriverScene && window.__G && __G.frames()>2',timeout=120000)
  page.clock.pause_at((page.evaluate('Date.now()')+100)/1000)
  page.evaluate("document.querySelector('#startBtn').click()")
  page.evaluate("""window.__pathEvents=[];window.addEventListener('swissdriver:event',e=>{
    const s=__G.SIT;window.__pathEvents.push({...e.detail,
     geometry:{s:__G.P.auto?.s,endS:s?.endS,x:__G.P.x,z:__G.P.z}});
  });""")
  actual=page.evaluate("__G.ITEMS.filter(i=>i.type==='sit').map(i=>({id:i.sc.id,kind:i.sc.kind,ok:i.sc.ok,act:i.sc.choices[i.sc.ok].act}))")
  assert len(actual)==25 and {r['id'] for r in actual}==set(ORACLE),'Scenario catalogue changed'
  for r in actual:assert r['ok']==1 and (r['kind'],r['act'])==ORACLE[r['id']],r
  for scenario_id in ORACLE:
   # Incorrect alternatives first; then the successful branch, in the same app.
   for choice in (0,2,1):
    row={'scenarioId':scenario_id,'choiceIndex':choice,'expectedCorrect':choice==1,'passed':False}
    try:
     page.evaluate('window.__pathEvents=[]')
     inspected=page.evaluate('(id)=>SwissDriverScene.test.prepare(id)',scenario_id)
     before=page.evaluate('({xp:__G.ST.xp,errors:__G.ST.errors,done:[...__G.ST.done],idx:__G.ST.idx})')
     initial=page.evaluate(SAMPLE)
     row['ruleId']=inspected['ruleId'];row['scene']=inspected
     chosen=page.evaluate("""(choice)=>{
       const d=__G.DEC(),index=d.order.indexOf(choice),answer=d.S.sc.choices[choice];
       if(index<0)throw Error('Missing answer button');
       const button=document.querySelector('.dchoices button[data-k="'+index+'"]');
       const label=button.innerText;button.click();
       return {label,act:answer.act,did:answer.did,should:d.S.sc.should,why:d.S.sc.why};
     }""",choice)
     row['answer']=chosen;trail=[];terminal=None
     for step in range(90):
      page.clock.run_for(1000)
      state=page.evaluate(SAMPLE);trail.append(state)
      if not state['finite']:raise AssertionError('Non-finite position or speed')
      if state['terminal']:
       terminal=state['terminal'];break
     row['simulationSecondsAdvanced']=len(trail);row['trail']=trail
     if not terminal:raise AssertionError('No terminal outcome after 90 simulated seconds')
     row['terminal']=terminal
     decision=page.evaluate("window.__pathEvents.find(e=>e.type==='decision')")
     assert decision and decision['scenarioId']==scenario_id and decision['choiceIndex']==choice,'Mismatched decision event'
     assert decision['ruleId']==row['ruleId'] and decision['correct']==(choice==1),'Mismatched lesson/correctness'
     assert terminal['scenarioId']==scenario_id and terminal['ruleId']==row['ruleId'],'Mismatched outcome event'
     after=page.evaluate('({xp:__G.ST.xp,errors:__G.ST.errors,done:[...__G.ST.done],idx:__G.ST.idx})')
     row['progressBefore']=before;row['progressAfter']=after
     if choice==1:
      assert terminal['type']=='scenario-complete','Correct answer did not complete'
      assert terminal['geometry']['s']>=terminal['geometry']['endS'],'Completed before path end'
      assert terminal['geometry']['s']>initial['s'],'Completed without moving'
      assert scenario_id in after['done'] and after['done'].count(scenario_id)==1,'Missing or duplicated completion'
      assert after['errors']==before['errors'],'Correct decision counted as error'
      assert after['idx']>before['idx'],'Progression did not advance'
     else:
      assert terminal['type']=='scenario-feedback' and page.evaluate('__G.mode')=='explain','Wrong answer lacked feedback'
      assert after['xp']==before['xp'] and after['done']==before['done'],'Wrong answer rewarded'
      assert after['errors']==before['errors']+1 and after['idx']==before['idx'],'Wrong error/progression count'
      feedback=page.locator('#explain .ebody').inner_text();row['feedback']=feedback
      clean=lambda s:' '.join((s or '').replace('**','').split())
      assert clean(chosen['should']) in clean(feedback),'Expected-action explanation missing'
      assert clean(chosen['why']) in clean(feedback),'Causal explanation missing'
      page.evaluate("document.querySelector('.ereplay').click()")
      page.clock.run_for(250)
      replay=page.evaluate("({mode:__G.mode,idx:__G.ST.idx,scenario:__G.SIT?.sc.id,shown:!document.querySelector('#explain').hidden})")
      row['replay']=replay
      assert replay['mode']=='drive' and replay['idx']==before['idx'] and not replay['shown'],'Replay failed'
      assert replay.get('scenario') in (None,scenario_id),'Replay entered a different scenario'
     row['passed']=True
    except Exception as exc:
     row['failure']=str(exc);row['diagnostic']=page.evaluate(SAMPLE)
    rows.append(row);save()
    print(f"{scenario_id}/{choice}: {'PASS' if row['passed'] else 'FAIL '+row['failure']} ({row.get('simulationSecondsAdvanced','?')} simulated s)",flush=True)
  print('Wall seconds:',round(time.monotonic()-started,2),flush=True)
 except Exception:
  fatal=traceback.format_exc();print(fatal,flush=True)
 finally:
  report=save();browser.close();server.shutdown()
if not report['allPassed']:
 raise SystemExit('Decision-path audit failed: '+str(report['passedBranches'])+'/75 passed')
