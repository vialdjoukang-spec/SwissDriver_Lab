"""Actual scene geometry, paused decisions, camera layout and gesture checks.
These checks do not certify every trajectory or the entire driving curriculum.
"""
from pathlib import Path
from functools import partial
import http.server,threading,json,os,traceback
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
def save():
    (OUT/'scene-coherence-results.json').write_text(json.dumps({'checks':checks,'errors':errors,'scope':'Geometry, selected camera views and gesture; not exhaustive legal/trajectory validation'},ensure_ascii=False,indent=2))
def check(name,passed,details=None):
    checks.append({'test':name,'passed':bool(passed),'details':details});save();print(name,passed,flush=True);assert passed,name
with sync_playwright() as p:
    launch={'headless':True,'args':['--no-sandbox','--enable-unsafe-swiftshader']}
    if os.getenv('CHROMIUM_EXECUTABLE'):launch['executable_path']=os.environ['CHROMIUM_EXECUTABLE']
    browser=p.chromium.launch(**launch)
    page=browser.new_page(viewport={'width':1440,'height':960});page.set_default_timeout(45000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script('window.__SWISSDRIVER_TEST__=true;window.__NORENDER=true;')
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/dist/SwissDriver_Lab.html',wait_until='domcontentloaded',timeout=120000)
        page.wait_for_function('window.SwissDriverScene && window.__G',timeout=120000)
        page.locator('#startBtn').click()
        rows=page.evaluate('SwissDriverScene.test.inspectAll()')
        check('all_25_scenes_build_with_inspection',len(rows)==25 and all(r['pathLength']>0 for r in rows),rows)
        p4=next(r for r in rows if r['scenarioId']=='p4')
        check('p4_secondary_approach_uses_yield',any(s['type']=='yield' for s in p4['signs']) and not any(s['type']=='main' for s in p4['signs']),p4)
        check('p4_direction_plate_is_present',any(s['type']=='plateLeft' for s in p4['signs']))
        for id in ['h2','h3','p3','p4']:
            r=next(r for r in rows if r['scenarioId']==id);m=r['markingBounds']
            check(id+'_line_stays_in_approach_lane',m and m['minX']>=0 and m['maxX']<=3.5,m)
            check(id+'_yield_faces_driver',any(s['type']=='yield' and s['facingApproach'] for s in r['signs']))
        page.evaluate("SwissDriverScene.test.prepare('h1')")
        page.wait_for_function('SwissDriverScene.test.gestureState()!==null',timeout=90000)
        q1=page.evaluate('SwissDriverScene.test.gestureState()');page.wait_for_timeout(600);q2=page.evaluate('SwissDriverScene.test.gestureState()')
        check('agent_has_live_skeletal_gesture',q1!=q2,{'before':q1,'after':q2})
        before=page.evaluate('({x:__G.P.x,z:__G.P.z,t:SwissDriverLab.snapshot().simulationSeconds,actors:__G.SIT.actors.map(a=>a.s)})');page.wait_for_timeout(800)
        after=page.evaluate('({x:__G.P.x,z:__G.P.z,t:SwissDriverLab.snapshot().simulationSeconds,actors:__G.SIT.actors.map(a=>a.s)})')
        check('question_pauses_player_actors_and_clock',before==after,{'before':before,'after':after})
        page.evaluate('SwissDriverScene.test.refresh()');page.screenshot(path=str(OUT/'scene-h1-overview.png'),timeout=90000)
        rects=page.evaluate("({canvas:document.querySelector('#stage canvas').getBoundingClientRect().toJSON(),question:document.querySelector('#decide').getBoundingClientRect().toJSON()})")
        check('desktop_question_does_not_cover_canvas',rects['canvas']['right']<=rects['question']['left'],rects)
        check('stale_objective_hidden',not page.locator('#obj').is_visible())
        check('overview_camera_above_avenue',page.evaluate('Math.abs(SwissDriverLab.test.camera.position.x)<3.5'))
        check('actual_traffic_light_can_be_inspected',page.locator('[data-landmark="traffic-light"]').count()==1)
        page.locator('[data-landmark="agent"]').click();page.screenshot(path=str(OUT/'scene-agent-closeup.png'),timeout=90000)
        check('agent_focus_caption',page.locator('#labSceneCaption').inner_text()=='Agent de police')
        page.locator('#labDriverView').click();check('driver_view_hides_car_body',page.evaluate('SwissDriverLab.test.player.visible') is False)
        # Run a correct decision without changing scores by hand. Test only the
        # transition to resolve here; full-success paths have separate scope.
        page.evaluate("(()=>{const d=__G.DEC();__G.choose(d.order.indexOf(d.S.sc.ok));})()")
        check('choice_resumes_resolution',page.evaluate("__G.mode==='resolve'"))
        for id in ['h2','h3','h4','p4']:
            page.evaluate(f"SwissDriverScene.test.prepare('{id}')")
            page.evaluate('SwissDriverScene.test.refresh()');page.screenshot(path=str(OUT/f'scene-{id}.png'),timeout=90000)
        page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(300)
        page.evaluate('SwissDriverScene.test.refresh()')
        rects=page.evaluate("({canvas:document.querySelector('#stage canvas').getBoundingClientRect().toJSON(),question:document.querySelector('#decide').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth})")
        check('mobile_question_below_canvas',rects['canvas']['bottom']<=rects['question']['top'],rects)
        check('mobile_no_horizontal_overflow',not rects['overflow'])
        check('mobile_canvas_at_least_40pct_height',rects['canvas']['height']>=844*.4)
        page.screenshot(path=str(OUT/'scene-mobile.png'),timeout=90000)
        check('no_javascript_errors',not errors,errors)
    except Exception:
        print(traceback.format_exc(),flush=True)
        try:page.screenshot(path=str(OUT/'scene-failure.png'),timeout=15000)
        except Exception:pass
        raise
    finally:save();browser.close();server.shutdown()
