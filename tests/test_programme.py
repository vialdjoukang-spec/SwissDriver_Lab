"""Official programme coverage and exercise contract on the data the engine really uses.
Coverage is editorial (asa catalogue, July 2026); it is not an asa validation.
"""
from pathlib import Path
import json, subprocess, unittest
ROOT = Path(__file__).resolve().parents[1]
MERGE = ("const fs=require('fs');const c=require('./src/curriculum.js');const s=fs.readFileSync('Permis_GT_Rossa.html','utf8');"
         "const d=JSON.parse(s.split('window.DATA=')[1].split(';\\n')[0]);process.stdout.write(JSON.stringify(c.merge(d,c.loadExtension('.'))));")
DATA = json.loads(subprocess.check_output(['node', '-e', MERGE], cwd=ROOT, text=True))
PROGRAMME = json.loads((ROOT / 'content/programme-asa-2027.json').read_text(encoding='utf-8'))
CHAPTERS = {c['id']: c for c in DATA['chapters']}
RULES = {c['id'] + '/' + s['id'] for c in DATA['chapters'] for s in c['sections']}
SIGNS = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/signs.js').SIGNS.map(s=>({id:s.id,rule:s.rule,family:s.family}))))"], cwd=ROOT, text=True))

class ProgrammeTests(unittest.TestCase):
    def test_01_every_official_content_is_covered_by_existing_lessons(self):
        self.assertEqual(len(PROGRAMME['items']), 161)
        for item in PROGRAMME['items']:
            self.assertTrue(item['coverage'], item['id'])
            for ref in item['coverage']:
                self.assertTrue(ref in RULES or ref in CHAPTERS, (item['id'], ref))

    def test_02_every_official_sector_has_a_chapter(self):
        codes = {c.get('official') for c in DATA['chapters']}
        for sector in PROGRAMME['sectors']:
            self.assertTrue(sector in codes or sector.split('.')[0] in codes, sector)
        self.assertTrue(all(c.get('official') for c in DATA['chapters']))

    def test_03_new_lessons_are_tied_to_the_programme(self):
        cited = {ref for item in PROGRAMME['items'] for ref in item['coverage']}
        for cid, c in CHAPTERS.items():
            if cid.startswith('N'):
                for s in c['sections']:
                    self.assertIn(cid + '/' + s['id'], cited)

    def test_04_every_section_has_exam_style_questions(self):
        per = {}
        for q in DATA['questions']:
            per.setdefault(q['chapter'] + '/' + q['section'], []).append(q)
        for rule in RULES:
            self.assertGreaterEqual(len(per.get(rule, [])), 5, rule)
        for q in DATA['questions']:
            self.assertIn(len(q['options']), (3, 4), q['id'])
            self.assertTrue(q['answers'] and len(q['answers']) < len(q['options']), q['id'])

    def test_05_signal_exercise_links_to_real_lessons(self):
        self.assertGreaterEqual(len(SIGNS), 25)
        self.assertEqual(len({s['id'] for s in SIGNS}), len(SIGNS))
        for s in SIGNS:
            self.assertIn(s['rule'], RULES, s['id'])

    def test_06_progress_identifiers_are_preserved(self):
        source = (ROOT / 'Permis_GT_Rossa.html').read_text(encoding='utf-8')
        original = json.JSONDecoder().raw_decode(source.split('window.DATA=', 1)[1])[0]
        for c in original['chapters']:
            self.assertEqual([s['id'] for s in c['sections']],
                             [s['id'] for s in CHAPTERS[c['id']]['sections'] if s['id'] in {x['id'] for x in c['sections']}])
        self.assertEqual([s['id'] for s in CHAPTERS['O11']['sections']], [s['id'] for s in original['chapters'][0]['sections']])

if __name__ == '__main__':
    unittest.main(verbosity=2)
