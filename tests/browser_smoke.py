"""Real Chromium/WebGL smoke tests; screenshots and metrics are retained in CI.
Scene construction checks do not certify every full trajectory or Swiss law.
"""
from pathlib import Path
from functools import partial
import http.server,threading,json,os,traceback,hashlib
from playwright.sync_api import sync_playwright
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
completed=False
def html_sha256():
    # Binds this report to the standalone HTML it exercised.
    return hashlib.sha256((ROOT/'dist/SwissDriver_Lab.html').read_bytes()).hexdigest()
results=[];errors=[]
def save_progress():
    (OUT/'browser-results.json').write_text(json.dumps({'tests':results,'javascriptErrors':errors,'scope':'Chromium/WebGL initialization, real scene construction, selected transitions and static render captures; not an exhaustive driving/legal audit','htmlSha256':html_sha256(),'completed':completed},ensure_ascii=False,indent=2))
def check(name,condition,details=None):
    results.append({'test':name,'passed':bool(condition),'details':details});print(name,condition,flush=True)
    save_progress();assert condition,name
with sync_playwright() as p:
    args={'headless':True,'args':['--no-sandbox','--enable-unsafe-swiftshader']}
    if os.getenv('CHROMIUM_EXECUTABLE'):args['executable_path']=os.environ['CHROMIUM_EXECUTABLE']
    browser=p.chromium.launch(**args)
    page=browser.new_page(viewport={'width':1440,'height':960})
    page.set_default_timeout(30000)
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.add_init_script('window.__SWISSDRIVER_TEST__=true;')
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/dist/SwissDriver_Lab.html',wait_until='domcontentloaded',timeout=120000)
        page.wait_for_function('window.SwissDriverLab && window.__G && window.__G.frames()>2',timeout=120000)
        check('engine_boot',not errors,errors)
        page.evaluate('window.__NORENDER=true')
        coverage=page.evaluate('SwissDriverLab.coverage')
        check('coverage_25_scenes',coverage['scenarios']==25 and coverage['playableSections']==7 and not coverage['contractErrors'],coverage)
        check('every_chapter_on_road',coverage['roadChapters']==coverage['chapters']==27 and coverage['roadSections']==coverage['sections'],coverage)
        page.screenshot(path=str(OUT/'desktop-start.png'),timeout=60000)
        page.locator('#startBtn').click()
        model=page.evaluate('({meta:SwissDriverLab.vehicle(),wheels:SwissDriverLab.test.player.userData.wheels.length,front:SwissDriverLab.test.player.userData.front.length})')
        check('sedan_engine_contract',model['wheels']==4 and model['front']==2 and model['meta']['wheelbaseM']==2.8,model)
        page.evaluate('SwissDriverLab.test.vehiclePreview()')
        page.screenshot(path=str(OUT/'desktop-sedan.png'),timeout=60000)
        scenes=page.evaluate("__G.ITEMS.filter(x=>x.type==='sit').map(x=>SwissDriverLab.test.inspectScene(x.sc.id))")
        check('25_real_scene_constructors',len(scenes)==25 and all(x['pathLength']>0 for x in scenes),scenes)
        page.evaluate("SwissDriverLab.test.openLesson('O11','hierarchie')")
        first=page.locator('.cpage').inner_text();page.keyboard.press('Enter');second=page.locator('.cpage').inner_text()
        check('enter_advances_one_page',first!=second and page.locator('#course').is_visible(),{'before':first,'after':second})
        before=page.evaluate('({z:__G.P.z,t:SwissDriverLab.snapshot().simulationSeconds})');page.wait_for_timeout(900)
        after=page.evaluate('({z:__G.P.z,t:SwissDriverLab.snapshot().simulationSeconds})')
        check('course_pauses_simulation',before==after,{'before':before,'after':after})
        page.screenshot(path=str(OUT/'desktop-course.png'))
        for _ in range(50):
            if not page.locator('#course').is_visible():break
            page.locator('.cnext').click()
        page.evaluate('SwissDriverLab.test.showRedLightFeedback()');page.keyboard.press('c')
        check('red_light_review_without_scene',page.locator('#course').is_visible())
        for _ in range(50):
            if not page.locator('#course').is_visible():break
            page.locator('.cnext').click()
        check('return_to_feedback',page.locator('#explain').is_visible() and page.evaluate('__G.mode')=='explain')
        page.locator('.ereplay').click()
        page.evaluate('SwissDriverLab.test.openPlan()')
        check('one_program_page',page.locator('#labProgramNav button').count()==6 and page.locator('#planList>section:visible').count()==1)
        page.locator('#labProgramNav button').nth(1).click()
        page.locator('#planList>section:visible summary').first.click()
        page.locator('#planList>section:visible .lab-read').first.click()
        check('inactive_chapter_theory_readable',page.locator('#course').is_visible() and page.evaluate('SwissDriverLab.snapshot().chapterId')!='O11')
        for _ in range(50):
            if not page.locator('#course').is_visible():break
            page.locator('.cnext').click()
        check('theory_returns_to_program',page.locator('#plan').is_visible() and page.evaluate('__G.mode')=='plan')
        before=page.evaluate('({z:__G.P.z,t:SwissDriverLab.snapshot().simulationSeconds})');page.wait_for_timeout(700)
        check('program_pauses_simulation',before==page.evaluate('({z:__G.P.z,t:SwissDriverLab.snapshot().simulationSeconds})'))
        page.screenshot(path=str(OUT/'desktop-program.png'))
        # Simplified road: a course-only chapter is reached by its gate, opens on the road, and is labelled without simulation.
        page.locator('#planList>section:visible summary').first.click()
        gate=page.locator('#planList>section:visible .lab-gate').first
        gi=int(gate.get_attribute('data-gi'));xp=page.evaluate('__G.ST.xp');gate.click()
        road=page.evaluate("(()=>{const it=__G.ITEMS[__G.ST.idx];return {mode:__G.mode,idx:__G.ST.idx,type:it.type,chapter:it.c.id,zone:document.querySelector('#hZone').textContent}})()")
        check('course_only_gate_reachable',road['mode']=='drive' and road['idx']==gi and road['type']=='secGate' and road['chapter']!='O11' and 'Cours seul' in road['zone'],road)
        page.evaluate("__G.P.z=__G.ITEMS[__G.ST.idx].z+1")
        page.wait_for_function("!document.querySelector('#course').hidden",timeout=20000)
        check('course_only_gate_opens_on_road',page.evaluate('SwissDriverLab.snapshot().ruleId')==page.evaluate("(()=>{const it=__G.ITEMS[__G.ST.idx];return it.c.id+'/'+it.s.id})()"))
        for _ in range(50):
            if not page.locator('#course').is_visible():break
            page.locator('.cnext').click()
        after=page.evaluate("(()=>{const it=__G.ITEMS[__G.ST.idx];return {idx:__G.ST.idx,type:it&&it.type,xp:__G.ST.xp,toast:document.querySelector('#toast').textContent}})()")
        check('course_only_gate_advances_without_score',after['idx']==gi+1 and after['xp']==xp and after['type'] in ('secGate','chapGate') and 'Cours seul' in after['toast'],after)
        page.evaluate('SwissDriverLab.test.openPlan()')
        page.evaluate('SwissDriverLab.test.closePlan()')
        page.evaluate("SwissDriverLab.test.prepareDecision('h1')")
        check('scene_lesson_identity',page.evaluate("SwissDriverLab.snapshot().ruleId==='O11/hierarchie' && SwissDriverLab.snapshot().scenarioId==='h1'"))
        page.evaluate('SwissDriverLab.test.render()')
        page.screenshot(path=str(OUT/'desktop-decision.png'),timeout=60000)
        page.evaluate('(()=>{const d=__G.DEC();__G.choose(d.order.findIndex(i=>i!==d.S.sc.ok));})()')
        decision=page.evaluate("SwissDriverLab.events().filter(e=>e.type==='decision').at(-1)")
        check('decision_event_matches_scene',decision['scenarioId']=='h1' and decision['ruleId']=='O11/hierarchie' and decision['correct'] is False,decision)
        page.wait_for_function("__G.mode==='explain'",timeout=45000)
        page.locator('.ereplay').click()
        page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(700)
        check('mobile_no_horizontal_overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        check('mobile_touch_controls',page.locator('#labTouch button:visible').count()==6)
        page.evaluate('SwissDriverLab.test.render()')
        page.screenshot(path=str(OUT/'mobile-drive.png'),timeout=60000)
        page.evaluate('SwissDriverLab.test.openPlan()');page.wait_for_timeout(250)
        check('mobile_single_program_page',page.locator('#planList>section:visible').count()==1)
        page.screenshot(path=str(OUT/'mobile-program.png'))
        check('no_javascript_errors',not errors,errors)
        page.close()
        page=browser.new_page(viewport={'width':900,'height':700})
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='domcontentloaded',timeout=120000)
        page.wait_for_function("document.querySelector('#notice').hidden",timeout=120000)
        frame=page.frame_locator('#game')
        check('http_launcher_boot',frame.locator('#startBtn').is_visible() and not errors,errors)
        page.close()
        offline=browser.new_context(offline=True)
        page=offline.new_page()
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.goto((ROOT/'dist/SwissDriver_Lab.html').as_uri(),wait_until='domcontentloaded',timeout=120000)
        page.wait_for_function('window.SwissDriverLab && window.__G',timeout=120000)
        check('standalone_offline_boot',page.locator('#startBtn').is_visible() and not errors,errors)
        completed=True
    except Exception:
        print(traceback.format_exc(),flush=True)
        try:page.screenshot(path=str(OUT/'failure.png'),timeout=10000)
        except Exception:pass
        raise
    finally:
        save_progress()
        browser.close();server.shutdown()
