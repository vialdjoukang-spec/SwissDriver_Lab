"""14 x 3 simplified road scenes (content/road-lessons): real sign or marking,
decision, assisted consequence, terminal outcome and wrong-answer replay.
Answers freeze the course text of each section, not a legal certification.
The native loop runs with a fixed 50 ms animation interval, as decision_paths.py.
"""
from pathlib import Path
from functools import partial
import http.server, threading, json, os, traceback, hashlib, time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
EXPECTED=sorted(l['id'] for f in json.loads((ROOT/'content/index.json').read_text())['roadLessons'] for l in json.loads((ROOT/f).read_text()))
BRANCHES=3*len(EXPECTED)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
rows=[];errors=[];fatal=None
scope=('Simplified course scenes: decision -> assisted trajectory -> terminal outcome -> wrong-answer replay. '
 'Starts at the decision point. Answers follow the course text; not a Swiss-law or manual-driving certification.')
def save():
 result={'scope':scope,'htmlSha256':hashlib.sha256((ROOT/'dist/SwissDriver_Lab.html').read_bytes()).hexdigest(),
 'fixedFrameMs':50,'expectedBranches':BRANCHES,'attemptedBranches':len(rows),
 'passedBranches':sum(r['passed'] for r in rows),
 'allPassed':len(rows)==BRANCHES and all(r['passed'] for r in rows) and not errors and not fatal,
 'errors':errors,'fatal':fatal,'branches':rows}
 (OUT/'road-lessons-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 return result
PROGRESS='({xp:__G.ST.xp,errors:__G.ST.errors,idx:__G.ST.idx,done:SwissDriverRoadLessons.results().done})'
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox','--enable-unsafe-swiftshader']}
 if os.getenv('CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 page=browser.new_page(viewport={'width':960,'height':720});page.set_default_timeout(30000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('window.__SWISSDRIVER_TEST__=true;window.__NORENDER=true;')
 page.clock.install();started=time.monotonic()
 try:
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/SwissDriver_Lab.html',wait_until='domcontentloaded',timeout=120000)
  page.wait_for_function('window.SwissDriverRoadLessons && window.__G && __G.frames()>2',timeout=120000)
  page.clock.pause_at((page.evaluate('Date.now()')+100)/1000)
  page.evaluate("""step=>{window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),step);
   window.cancelAnimationFrame=id=>clearTimeout(id);}""",50)
  page.evaluate("document.querySelector('#startBtn').click()")
  page.evaluate("window.__lessonEvents=[];addEventListener('swissdriver:event',e=>{if(String(e.detail.type).startsWith('road-lesson'))__lessonEvents.push(e.detail);});")
  catalogue=page.evaluate("__G.ITEMS.filter(i=>i.type==='lesson').map(i=>({id:i.ls.id,rule:i.c.id+'/'+i.s.id,ok:i.ls.ok,z:i.z,index:__G.ITEMS.indexOf(i),props:i.ls.props,choices:i.ls.choices,should:i.ls.should,why:i.ls.why,endDz:i.ls.endDz??-30}))")
  assert sorted(c['id'] for c in catalogue)==EXPECTED,'Scene catalogue differs from content/road-lessons'
  for lesson in catalogue:
   wanted=sorted({p['id'] for p in lesson['props'] if p['kind']=='sign'})
   inspected=page.evaluate('id=>SwissDriverRoadLessons.test.inspect(id)',lesson['id'])
   assert sorted(set(inspected['signs']))==wanted and inspected['objects']>0,('Scene objects',lesson['id'],inspected)
   for choice in [i for i in range(3) if i!=lesson['ok']]+[lesson['ok']]:
    good=choice==lesson['ok'];L=lesson['z']
    row={'scenarioId':lesson['id'],'ruleId':lesson['rule'],'choiceIndex':choice,'expectedCorrect':good,'passed':False}
    try:
     page.evaluate('window.__lessonEvents=[]')
     page.evaluate('id=>SwissDriverRoadLessons.test.approach(id)',lesson['id']);page.clock.run_for(200)
     state=page.evaluate('SwissDriverRoadLessons.state()')
     assert state and state['phase']=='decide' and state['id']==lesson['id'],('Decision not offered',state)
     assert page.locator('#decide').is_visible() and page.evaluate('__G.mode')=='decide','Decision panel hidden'
     before=page.evaluate(PROGRESS)
     index=state['order'].index(choice)
     label=page.locator(f'.dchoices button[data-k="{index}"]').inner_text()
     assert lesson['choices'][choice]['t'].replace('**','').split()[0] in label,'Button does not show the chosen answer'
     page.keyboard.press(str(index+1))
     trail=[];terminal=None
     for _ in range(240):
      page.clock.run_for(250);s=page.evaluate('SwissDriverRoadLessons.test.sample()');trail.append(s)
      car=s['car']
      if not all(isinstance(v,(int,float)) for v in (car['x'],car['z'],car['v'])):raise AssertionError('Non-finite car state')
      if good and lesson['id']=='s14-pietons':
       for a in s['actors']:
        if a['kind']=='ped' and -5<a['x']<5 and car['z']<=L+2:raise AssertionError('Car entered the crossing while the pedestrian was on the road')
      if good and lesson['id']=='s14-marquages':
       for a in s['actors']:
        if a['kind']=='car' and abs(a['x']-car['x'])<2 and 0<car['z']-a['z']<6:raise AssertionError('Car closed in on the slow vehicle')
      if good and lesson['id']=='s14-cycles':
       for a in s['actors']:
        if a['kind']=='bike' and abs(a['z']-car['z'])<3 and abs(a['x']-car['x'])<2.2:raise AssertionError('Insufficient lateral distance to the cyclist')
      ev=page.evaluate("__lessonEvents.find(e=>e.type==='road-lesson-complete'||e.type==='road-lesson-feedback')||null")
      if ev:terminal=ev;break
     row['simulationSecondsAdvanced']=len(trail)/4;row['trail']=trail[::4]
     if not terminal:raise AssertionError('No terminal outcome after 60 simulated seconds')
     decision=page.evaluate("__lessonEvents.find(e=>e.type==='road-lesson-decision')")
     assert decision and decision['lessonId']==lesson['id'] and decision['choiceIndex']==choice and decision['correct']==good,'Mismatched decision event'
     assert decision['ruleId']==lesson['rule'] and terminal['ruleId']==lesson['rule'],'Scene and course identifiers differ'
     after=page.evaluate(PROGRESS);row['progressBefore']=before;row['progressAfter']=after
     assert after['xp']==before['xp'] and after['errors']==before['errors'],'Priorités score changed by a simplified scene'
     if good:
      assert terminal['type']=='road-lesson-complete','Correct answer did not complete'
      assert after['idx']==lesson['index']+1,'Route did not advance to the next item'
      assert lesson['id'] in after['done'],'Completion not stored'
      assert page.evaluate('__G.P.z')<=L+lesson['endDz']+.6,'Completed before the end of the scene'
      assert page.evaluate('__G.mode')=='drive','Control not returned to the driver'
     else:
      assert terminal['type']=='road-lesson-feedback' and page.evaluate('__G.mode')=='explain','Wrong answer lacked feedback'
      assert after['idx']==before['idx'],'Wrong answer advanced the route'
      feedback=' '.join(page.locator('#explain .ebody').inner_text().split());row['feedback']=feedback
      clean=lambda t:' '.join((t or '').replace('**','').split())
      for part in (lesson['choices'][choice]['did'],lesson['should'],lesson['why']):
       assert clean(part) in feedback,('Explanation incomplete',part)
      page.keyboard.press('Enter');page.clock.run_for(700)
      replay=page.evaluate("({mode:__G.mode,state:SwissDriverRoadLessons.state(),z:__G.P.z,shown:!document.querySelector('#explain').hidden,idx:__G.ST.idx})")
      row['replay']=replay
      assert replay['mode']=='drive' and not replay['shown'] and replay['state'] is None,'Replay failed'
      assert abs(replay['z']-(L+40))<.5 and replay['idx']==before['idx'],'Replay did not return before the scene'
     row['passed']=True
    except Exception as exc:
     row['failure']=str(exc)
     try:row['diagnostic']=page.evaluate('SwissDriverRoadLessons.test.sample()')
     except Exception:pass
    rows.append(row);save()
    print(f"{lesson['id']}/{choice}: {'PASS' if row['passed'] else 'FAIL '+row['failure']} ({row.get('simulationSecondsAdvanced','?')} simulated s)",flush=True)
 except Exception:
  fatal=traceback.format_exc();print(fatal,flush=True)
 finally:
  result=save();print('Wall seconds:',round(time.monotonic()-started,2),flush=True)
  browser.close();server.shutdown()
if not result['allPassed']:raise SystemExit(1)
