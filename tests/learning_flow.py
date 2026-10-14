"""Course history, back/forward navigation, exercises and diagrams in Chromium.
Checks real buttons and keys; the progress key permisGT.v1 must stay untouched.
"""
from pathlib import Path
from functools import partial
import http.server,threading,json,os,traceback,hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[];completed=False
def html_sha256():
    return hashlib.sha256((ROOT/'dist/SwissDriver_Lab.html').read_bytes()).hexdigest()
def save():
    (OUT/'learning-results.json').write_text(json.dumps({'checks':checks,'errors':errors,'completed':completed,'htmlSha256':html_sha256(),
     'scope':'Course history, back/forward stack, section exercises and diagrams through real UI; not a pedagogical or legal validation'},ensure_ascii=False,indent=2))
def check(name,passed,details=None):
    checks.append({'test':name,'passed':bool(passed),'details':details});save();print(name,passed,flush=True);assert passed,name
STATE="""(()=>({mode:__G.mode,course:!document.querySelector('#course').hidden,
 page:document.querySelector('#course .cpage')?.textContent,title:document.querySelector('#course .cbody h2')?.textContent,
 history:!document.querySelector('#labHistory').hidden,quiz:!document.querySelector('#labQuiz').hidden,
 plan:!document.querySelector('#plan').hidden,depth:SwissDriverLearning.stackDepth()}))()"""
with sync_playwright() as p:
    launch={'headless':True,'args':['--no-sandbox','--enable-unsafe-swiftshader']}
    if os.getenv('CHROMIUM_EXECUTABLE'):launch['executable_path']=os.environ['CHROMIUM_EXECUTABLE']
    browser=p.chromium.launch(**launch)
    page=browser.new_page(viewport={'width':1280,'height':900});page.set_default_timeout(45000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script('window.__SWISSDRIVER_TEST__=true;window.__NORENDER=true;')
    state=lambda:page.evaluate(STATE)
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/dist/SwissDriver_Lab.html',wait_until='domcontentloaded',timeout=120000)
        page.wait_for_function('window.SwissDriverLearning && window.__G',timeout=120000)
        page.locator('#startBtn').click()
        progress=page.evaluate("localStorage.getItem('permisGT.v1')")
        expected=page.evaluate('window.DATA.chapters.length+window.DATA.chapters.reduce((n,c)=>n+c.sections.length,0)')
        check('every_chapter_and_section_is_navigable',len(page.evaluate('SwissDriverLearning.sections()'))==expected and expected>=139,expected)
        page.evaluate("SwissDriverLab.test.openLesson('O12','circuler')");page.locator('#course .cnext').click()
        s=state();check('course_opens_and_turns_page',s['course'] and s['page'].startswith('Page 2'),s)
        check('history_records_page',page.evaluate("SwissDriverLearning.history()[0]")['key']=='O12/circuler' and page.evaluate("SwissDriverLearning.history()[0].page")==1)
        page.locator('.lab-course-nav .lab-next').click();s=state()
        check('next_section_opens_on_first_page',s['course'] and s['page'].startswith('Page 1') and s['depth']==1,s)
        check('next_section_is_the_following_one',page.evaluate("SwissDriverLearning.history()[0].key")=='O12/gabarit')
        page.locator('.lab-course-nav .lab-back').click();s=state()
        check('back_returns_to_previous_section_same_page',s['course'] and s['page'].startswith('Page 2') and s['depth']==0 and page.evaluate("SwissDriverLearning.history()[0].key")=='O12/circuler',s)
        page.locator('.lab-course-nav .lab-prev').click();page.locator('.lab-course-nav .lab-prev').click();s=state()
        check('previous_crosses_into_previous_chapter',page.evaluate("SwissDriverLearning.history()[0].key").startswith('O11/') and s['depth']==2,s)
        page.keyboard.press('Escape');page.keyboard.press('Escape');s=state()
        check('escape_unwinds_stack_to_origin',s['course'] and s['page'].startswith('Page 2') and s['depth']==0,s)
        page.keyboard.press('j');s=state()
        check('history_panel_opens_with_J',s['history'] and not s['course'],s)
        page.screenshot(path=str(OUT/'learning-history.png'))
        n=page.locator('#labHistory [data-open]').count()
        check('history_lists_visited_fragments',n>=4,n)
        page.locator('#labHistory [data-open]').nth(1).click();s=state()
        check('history_reopens_fragment',s['course'] and not s['history'],s)
        page.locator('.lab-course-nav .lab-back').click();s=state();check('back_from_fragment_returns_to_history',s['history'],s)
        page.locator('#labHistory .lab-back').click();s=state()
        check('back_from_history_returns_to_course_page',s['course'] and s['page'].startswith('Page 2') and page.evaluate("SwissDriverLearning.history()[0].key")=='O12/circuler',s)
        page.evaluate("SwissDriverLearning.open('O11/hierarchie',0)")
        has_diagram=False
        for _ in range(12):
            if page.locator('#course .cbody .lab-diagram svg').count():has_diagram=True;break
            page.locator('#course .cnext').click()
            if not state()['course']:break
        check('section_diagram_is_displayed',has_diagram)
        page.screenshot(path=str(OUT/'learning-diagram.png'))
        page.evaluate("SwissDriverLearning.closeAll()");page.evaluate("SwissDriverLearning.closeAll()");s=state()
        check('close_all_resumes_drive',s['mode']=='drive' and not s['course'] and not s['history'],s)
        # Exercises in the true/false format of the official theory exam.
        page.evaluate("SwissDriverLab.test.openLesson('O13','direction')");page.locator('.lab-course-nav .lab-train').click();s=state()
        check('exercise_opens_from_course',s['quiz'] and not s['course'],s)
        stem=page.locator('#labQuiz .lab-body .q').get_attribute('data-qid')
        q=page.evaluate("id=>window.DATA.questions.find(q=>q.id===id&&q.chapter==='O13'&&q.section==='direction')",stem)
        check('exercise_question_belongs_to_section',q is not None,stem)
        check('validate_disabled_until_a_choice',page.locator('#labQuiz .lab-check').is_disabled())
        for i in q['answers']:page.locator(f'#labQuiz [data-i="{i}"]').click()
        page.locator('#labQuiz .lab-check').click()
        check('correct_answers_marked_right',page.locator('#labQuiz .lab-ok').count()==len(q['options']) and page.locator('#labQuiz .box.ok').count()==1)
        check('feedback_explains_truth',q['truth'].replace('**','')[:25] in page.locator('#labQuiz .box').inner_text())
        page.screenshot(path=str(OUT/'learning-quiz.png'))
        page.locator('#labQuiz .lab-course').click();s=state()
        check('quiz_links_back_to_course',s['course'] and not s['quiz'],s)
        page.locator('.lab-course-nav .lab-back').click();s=state()
        check('back_returns_to_same_question_with_feedback',s['quiz'] and page.locator('#labQuiz .lab-body .q').get_attribute('data-qid')==stem and page.locator('#labQuiz .box.ok').count()==1,s)
        page.locator('#labQuiz .lab-qnext').click();stem2=page.locator('#labQuiz .lab-body .q').get_attribute('data-qid')
        q2=page.evaluate("id=>window.DATA.questions.find(q=>q.id===id)",stem2)
        for i in range(len(q2['options'])):
            if i not in q2['answers']:page.locator(f'#labQuiz [data-i="{i}"]').click()
        page.locator('#labQuiz .lab-check').click()
        check('wrong_answers_flagged_in_bold_italic_red',page.locator('#labQuiz .lab-bad').count()==len(q2['options']) and page.evaluate("getComputedStyle(document.querySelector('#labQuiz .lab-bad')).fontStyle")=='italic')
        r=page.evaluate("JSON.parse(localStorage.getItem('swissdriver.exercises.v1'))['sections']['O13/direction']")
        check('exercise_results_persisted_separately',len(r['seen'])==2 and len(r['correct'])==1,r)
        page.keyboard.press('Escape');s=state();check('escape_from_quiz_returns_to_course',s['course'],s)
        page.keyboard.press('Escape');s=state();check('escape_from_course_resumes_drive',s['mode']=='drive' and not s['course'],s)
        # Plan: every section offers exercises; closing returns to the plan, then to the road.
        page.evaluate('SwissDriverLab.test.openPlan()')
        rows=page.locator('#planList .lab-train-row').count()
        check('plan_offers_exercises',rows>=19,rows)
        page.locator('#planList section:not([hidden]) .lab-train-row').first.click();s=state()
        check('plan_exercise_opens',s['quiz'] and not s['plan'],s)
        page.locator('#labQuiz .lab-back').click();s=state()
        check('back_from_plan_exercise_reopens_plan',s['plan'] and s['mode']=='plan',s)
        page.keyboard.press('m');s=state();check('plan_closes_to_drive',s['mode']=='drive' and not s['plan'],s)
        check('progress_key_untouched',page.evaluate("localStorage.getItem('permisGT.v1')")==progress)
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate("SwissDriverLearning.showQuiz('O21/vitesse')")
        overflow=page.evaluate("document.documentElement.scrollWidth>innerWidth")
        page.screenshot(path=str(OUT/'learning-quiz-mobile.png'))
        check('mobile_quiz_no_horizontal_overflow',not overflow)
        page.evaluate("SwissDriverLearning.closeAll()");page.set_viewport_size({'width':1280,'height':900})
        # Signal recognition: four meanings, one right; the linked course is reachable and back returns.
        page.evaluate("SwissDriverLearning.showSigns()")
        check('signs_quiz_shows_scene_and_four_choices',page.locator('#labSigns .lab-sign-scene > svg').count()==1 and page.locator('#labSigns .lab-choice').count()==4)
        sign=page.locator('#labSigns .lab-sign-scene').get_attribute('data-sign')
        idx=[page.locator('#labSigns .lab-choice').nth(i).get_attribute('data-sign') for i in range(4)].index(sign)
        page.keyboard.press(str(idx+1))
        check('signs_right_answer_marked',page.locator('#labSigns .lab-right').count()==1 and page.locator('#labSigns .box.ok').count()==1)
        page.screenshot(path=str(OUT/'learning-signs.png'))
        page.locator('#labSigns .lab-course').click();s=state();check('signs_link_to_course',s['course'],s)
        page.locator('.lab-course-nav .lab-back').click()
        check('back_returns_to_same_signal',page.locator('#labSigns .lab-sign-scene').get_attribute('data-sign')==sign)
        page.locator('#labSigns .lab-snext').click()
        page.locator('#labSigns .lab-choice').nth(0).click()
        check('signs_score_counts_two_rounds',page.locator('#labSigns footer .cpage').inner_text().endswith('sur 2'))
        page.keyboard.press('Escape');s=state();check('escape_from_signs_resumes_drive',s['mode']=='drive',s)
        check('no_javascript_errors',not errors,errors)
        completed=True
    except Exception:
        print(traceback.format_exc(),flush=True)
        try:page.screenshot(path=str(OUT/'learning-failure.png'))
        except Exception:pass
        raise
    finally:save();browser.close();server.shutdown()
