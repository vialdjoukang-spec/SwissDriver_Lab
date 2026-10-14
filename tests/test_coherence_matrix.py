"""Contract of docs/COHERENCE_PRIORITES.json against the stored O11 scenarios.
A row may be declared coherent only with an observed action and an official source.
"""
from pathlib import Path
import json, sys, unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import coherence_matrix  # noqa: E402
MATRIX = json.loads((ROOT / 'docs/COHERENCE_PRIORITES.json').read_text(encoding='utf-8'))
FIELDS = ['ruleId', 'ruleTitle', 'scenarioId', 'choiceIndex', 'announcedAction', 'engineAct', 'observedAction',
          'objects', 'expectedOutcome', 'evidence', 'regulatorySource', 'status']
class CoherenceMatrixTests(unittest.TestCase):
    def test_01_75_unique_rows_matching_the_stored_scenarios(self):
        _, scenarios = coherence_matrix.load_source()
        expected = {(s['id'], i, c['act'], i == s['ok']) for secs in scenarios.values() for items in secs.values()
                    for s in items for i, c in enumerate(s['choices'])}
        rows = MATRIX['rows']
        self.assertEqual(len(rows), 75)
        self.assertEqual({(r['scenarioId'], r['choiceIndex'], r['engineAct'], r['expectedCorrect']) for r in rows}, expected)
        self.assertEqual(MATRIX['totals']['rows'], 75)
    def test_02_every_row_has_the_required_fields(self):
        for r in MATRIX['rows']:
            for f in FIELDS:
                self.assertIn(f, r, (r['scenarioId'], f))
            self.assertIn(r['status'], MATRIX['statuses'])
            self.assertTrue(r['announcedAction'].strip())
    def test_03_no_row_is_ticked_without_observation_and_source(self):
        for r in MATRIX['rows']:
            if r['status'] == 'coherent_observe':
                self.assertTrue(r['observedAction'] and r['regulatorySource'] and r['evidence'], r['scenarioId'])
            if r['status'] != 'non_audite':
                self.assertTrue(r['evidence'], r['scenarioId'])
            if r['regulatorySource'] is not None:
                self.assertTrue(str(r['regulatorySource'].get('url', '')).startswith('https://'), r['scenarioId'])
    def test_04_evidence_is_bound_to_one_html(self):
        shas = {r['evidence']['htmlSha256'] for r in MATRIX['rows'] if r['evidence']}
        self.assertLessEqual(len(shas), 1)
        if shas:
            self.assertEqual(shas, {MATRIX['decisionReportHtmlSha256']})
if __name__ == '__main__':
    unittest.main(verbosity=2)
