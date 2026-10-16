"""Structure of the simplified road scenes (content/road-lessons).
Checks the merge contract, shared identifiers with the courses, drawings and
fail-closed validation. It does not certify Swiss law.
"""
from pathlib import Path
import json, subprocess, unittest
ROOT = Path(__file__).resolve().parents[1]


def node(code):
    return json.loads(subprocess.run(['node', '-e', code], cwd=ROOT, capture_output=True, text=True, check=True).stdout)


LOAD = ("const fs=require('fs'),c=require('./src/curriculum.js');const s=fs.readFileSync('Permis_GT_Rossa.html','utf8');"
        "const data=JSON.parse(s.split('window.DATA=')[1].split(';\\n')[0]);const ext=c.loadExtension('.');")


class RoadLessonTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = node(LOAD + "const m=c.merge(data,ext);const signs=require('./src/signs.js');"
                        "console.log(JSON.stringify({lessons:m.roadLessons,sections:m.chapters.flatMap(ch=>ch.sections.map(x=>ch.id+'/'+x.id)),"
                        "drawings:m.roadLessons.flatMap(l=>l.props.filter(p=>p.kind==='sign').map(p=>[p.id,!!signs.drawing(p.id)]))}))")
        source = (ROOT / 'Permis_GT_Rossa.html').read_text(encoding='utf8')
        cls.engine_scene_chapters = source[source.index('Uu={') : source.index('Uu={') + 8]

    def test_01_scenes_share_course_identifiers(self):
        lessons = self.data['lessons']
        self.assertGreaterEqual(len(lessons), 14)
        self.assertEqual(len({l['id'] for l in lessons}), len(lessons))
        for l in lessons:
            self.assertIn(l['rule'], self.data['sections'], l['id'])
            self.assertIn(l['rule'].split('/')[0], ('O12', 'O13', 'O14'), l['id'])

    def test_02_signs_and_markings_are_covered(self):
        rules = {l['rule'] for l in self.data['lessons']}
        for section in ('circuler', 'gabarit', 'arret', 'stationner', 'temporaire'):
            self.assertIn('O12/' + section, rules)
        for rule in ('O13/direction', 'O13/familles-signaux', 'O13/combinaisons', 'O14/marquages', 'O14/pietons'):
            self.assertIn(rule, rules)
        kinds = {p['kind'] for l in self.data['lessons'] for p in l['props']}
        self.assertTrue({'sign', 'line', 'crosswalk', 'bay'} <= kinds)

    def test_03_every_sign_has_a_drawing(self):
        missing = [i for i, ok in self.data['drawings'] if not ok]
        self.assertEqual(missing, [])

    def test_04_each_wrong_choice_has_a_consequence(self):
        for l in self.data['lessons']:
            self.assertEqual(len(l['choices']), 3, l['id'])
            for i, c in enumerate(l['choices']):
                if i != l['ok']:
                    self.assertTrue(c.get('did'), (l['id'], i))
            for field in ('should', 'why', 'memo', 'scene', 'title'):
                self.assertTrue(l[field].strip(), (l['id'], field))

    def test_05_scenes_only_where_the_engine_has_no_situation(self):
        self.assertTrue(self.engine_scene_chapters.startswith('Uu={O11'))
        self.assertTrue(all(not l['rule'].startswith('O11/') for l in self.data['lessons']))

    def test_06_merge_fails_closed(self):
        cases = {
            'unknown section': "ext.roadLessons[0]={...ext.roadLessons[0],rule:'O12/absent'};",
            'bad act': "ext.roadLessons[0]={...ext.roadLessons[0],choices:ext.roadLessons[0].choices.map(x=>({...x,act:'fly'}))};",
            'missing consequence': "const l=ext.roadLessons[0];ext.roadLessons[0]={...l,choices:l.choices.map(x=>({t:x.t,act:x.act}))};",
            'duplicate': "ext.roadLessons.push(ext.roadLessons[0]);",
            'bad prop': "ext.roadLessons[0]={...ext.roadLessons[0],props:[{kind:'tree'}]};",
        }
        for name, mutate in cases.items():
            result = node(LOAD + mutate + "let ok=false;try{c.merge(data,ext);}catch(e){ok=/scène/.test(e.message);}console.log(JSON.stringify(ok));")
            self.assertTrue(result, name)


if __name__ == '__main__':
    unittest.main(verbosity=2)
