"""Dependency-free checks for the immutable source and course/scene contract."""
from pathlib import Path
import hashlib,json,re,subprocess,unittest
ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'Permis_GT_Rossa.html').read_text()
DATA=json.JSONDecoder().raw_decode(SOURCE.split('window.DATA=',1)[1])[0]
start=SOURCE.index('var Uu=')+7
end=SOURCE.index(',Nu=[',start)
SCENARIOS=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+SOURCE[start:end]+'))'],text=True))
class SwissDriverTests(unittest.TestCase):
    def test_01_original_source_is_unchanged(self):
        self.assertEqual(hashlib.sha256((ROOT/'Permis_GT_Rossa.html').read_bytes()).hexdigest(),'58ec2197dd14b8e8895cb83d134a2b598213b7f3d03b221fbf39f8e74258335a')
    def test_02_build_and_all_scripts_compile(self):
        subprocess.run(['node',str(ROOT/'scripts/build.cjs')],check=True)
        code="const fs=require('fs'),vm=require('vm');const s=fs.readFileSync(process.argv[1],'utf8');for(const m of s.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi))new vm.Script(m[1]);"
        subprocess.run(['node','-e',code,str(ROOT/'dist/SwissDriver_Lab.html')],check=True)
    def test_03_every_scenario_has_a_real_lesson(self):
        chapters={c['id']:c for c in DATA['chapters']}
        for chapter,sections in SCENARIOS.items():
            self.assertIn(chapter,chapters)
            lesson_ids={s['id'] for s in chapters[chapter]['sections']}
            self.assertEqual(set(sections),lesson_ids)
    def test_04_ids_and_answers_are_unambiguous(self):
        seen=set()
        for sections in SCENARIOS.values():
            for scenarios in sections.values():
                self.assertTrue(scenarios)
                for s in scenarios:
                    self.assertNotIn(s['id'],seen);seen.add(s['id'])
                    self.assertEqual(len(s['choices']),3);self.assertIn(s['ok'],range(3))
                    for field in ['scene','should','why','memo']:self.assertTrue(s[field].strip())
        self.assertEqual(len(seen),25)
    def test_05_every_scenario_has_a_scene_constructor(self):
        factory=SOURCE[SOURCE.index('function vM(i)'):SOURCE.index('function $o(i)')]
        kinds=set(re.findall(r'case"([^"]+)"',factory))
        rows=[]
        for chapter,sections in SCENARIOS.items():
            for section,scenarios in sections.items():
                for s in scenarios:
                    self.assertIn(s['kind'],kinds)
                    rows.append({'ruleId':chapter+'/'+section,'scenarioId':s['id'],'kind':s['kind'],'constructorPresent':True})
        out=ROOT/'test-results';out.mkdir(exist_ok=True)
        (out/'course-scene-contract.json').write_text(json.dumps({'scope':'structural, not a legal or driving-skill certification','parts':len(DATA['groups']),'chapters':len(DATA['chapters']),'rows':rows},ensure_ascii=False,indent=2))
    def test_06_transform_fails_closed(self):
        code="const fs=require('fs'),assert=require('assert'),m=require('./src/transform.js');const r=p=>fs.readFileSync(p,'utf8');const a=[r('Permis_GT_Rossa.html'),r('swissdriver-modern.css'),r('src/sedan.js'),r('src/engine-bridge.js')];assert.throws(()=>m.assemble(a[0].replace('function Kf(){','function missing(){'),...a.slice(1)));const html=m.assemble(...a);assert.throws(()=>m.assemble(html,...a.slice(1)));assert.throws(()=>m.once('aa','a','b'));"
        subprocess.run(['node','-e',code],cwd=ROOT,check=True)
    def test_07_vehicle_contract_and_light_theme(self):
        sedan=(ROOT/'src/sedan.js').read_text();css=(ROOT/'swissdriver-modern.css').read_text()
        for field in ['userData.front','userData.wheels','userData.blink','wheelbaseM:2.8']:self.assertIn(field,sedan)
        self.assertIn('color-scheme:light',css);self.assertIn('Atkinson Hyperlegible Next',css)
        self.assertIn('font-style:italic',css);self.assertIn('prefers-reduced-motion',css)
    def test_08_all_program_chapters_resolve(self):
        chapters={c['id'] for c in DATA['chapters']}
        self.assertEqual(chapters,{cid for g in DATA['groups'] for cid in g['chapters']})
        self.assertEqual(len(chapters),19)
if __name__=='__main__':unittest.main(verbosity=2)
