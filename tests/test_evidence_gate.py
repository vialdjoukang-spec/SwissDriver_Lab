"""Negative and positive checks of the evidence gate on temporary copies only.
Delivery reports in test-results/ are never modified by this file.
"""
from pathlib import Path
import copy, hashlib, json, sys, tempfile, unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import evidence  # noqa: E402

HTML = b'<!doctype html><title>build</title>'
SHA = hashlib.sha256(HTML).hexdigest()
LESSONS = evidence.road_lesson_branches()


def good_reports():
    checks = lambda n: [{'test': f'c{i}', 'passed': True} for i in range(n)]
    branches = [{'scenarioId': f's{i // 3}', 'choiceIndex': i % 3, 'passed': True} for i in range(75)]
    return {
        'browser-results.json': {'tests': checks(20), 'javascriptErrors': [], 'scope': 's', 'htmlSha256': SHA, 'completed': True},
        'scene-coherence-results.json': {'checks': checks(24), 'errors': [], 'scope': 's', 'htmlSha256': SHA, 'completed': True},
        'learning-results.json': {'checks': checks(33), 'errors': [], 'scope': 's', 'htmlSha256': SHA, 'completed': True},
        'decision-paths-results.json': {'branches': branches, 'errors': [], 'fatal': None, 'scope': 's', 'htmlSha256': SHA,
                                        'expectedBranches': 75, 'attemptedBranches': 75, 'passedBranches': 75,
                                        'allPassed': True, 'fixedFrameMs': 50},
        'road-lessons-results.json': {'branches': [{'scenarioId': f'l{i // 3}', 'choiceIndex': i % 3, 'passed': True} for i in range(LESSONS)],
                                      'errors': [], 'fatal': None, 'scope': 's', 'htmlSha256': SHA,
                                      'expectedBranches': LESSONS, 'attemptedBranches': LESSONS, 'passedBranches': LESSONS,
                                      'allPassed': True, 'fixedFrameMs': 50},
    }


class EvidenceGateTests(unittest.TestCase):
    def run_gate(self, reports, html=HTML):
        with tempfile.TemporaryDirectory() as tmp:
            for name, report in reports.items():
                (Path(tmp) / name).write_text(report if isinstance(report, str) else json.dumps(report))
            return evidence.validate(tmp, html, require=True)

    def assertRefused(self, reports, fragment, html=HTML):
        with self.assertRaises(evidence.EvidenceError) as ctx:
            self.run_gate(reports, html)
        self.assertIn(fragment, str(ctx.exception))

    def test_01_complete_reports_are_accepted_and_summarised(self):
        summary = self.run_gate(good_reports())
        self.assertEqual([e['file'] for e in summary], evidence.REQUIRED_FILES)
        decision = summary[3]
        self.assertEqual((decision['branches'], decision['passedBranches'], decision['allPassed']), (75, 75, True))
        self.assertTrue(all(e['htmlMatchesBuild'] and len(e['sha256']) == 64 for e in summary))

    def test_02_each_missing_report_is_refused(self):
        for name in good_reports():
            reports = good_reports(); del reports[name]
            self.assertRefused(reports, name + ' : absent')

    def test_03_report_bound_to_another_html_is_refused(self):
        for name in good_reports():
            self.assertRefused(good_reports(), name + ' : htmlSha256', html=HTML + b' ')
            reports = good_reports(); del reports[name]['htmlSha256']
            self.assertRefused(reports, name + ' : htmlSha256')

    def test_04_incomplete_decision_report_is_refused(self):
        reports = good_reports(); d = reports['decision-paths-results.json']
        d['branches'] = d['branches'][:74]; d['attemptedBranches'] = d['passedBranches'] = 74
        self.assertRefused(reports, 'minimum 75')
        reports = good_reports(); reports['decision-paths-results.json']['branches'][5] = dict(reports['decision-paths-results.json']['branches'][4])
        self.assertRefused(reports, 'dupliquees')

    def test_05_failed_decision_report_is_refused(self):
        for mutate, fragment in [(lambda d: d['branches'][10].update(passed=False), 'entree en echec'),
                                 (lambda d: d.update(allPassed=False), 'allPassed'),
                                 (lambda d: d.update(passedBranches=74), 'reussies'),
                                 (lambda d: d.update(fatal='Traceback'), 'fatale'),
                                 (lambda d: d.update(errors=['TypeError']), 'JavaScript')]:
            reports = good_reports(); mutate(reports['decision-paths-results.json'])
            self.assertRefused(reports, fragment)

    def test_06_unfinished_or_failed_check_suites_are_refused(self):
        for name in ['browser-results.json', 'scene-coherence-results.json', 'learning-results.json']:
            reports = good_reports(); reports[name]['completed'] = False
            self.assertRefused(reports, 'non terminee')
            reports = good_reports(); key = 'tests' if name.startswith('browser') else 'checks'
            reports[name][key][-1]['passed'] = False
            self.assertRefused(reports, 'entree en echec')
            reports = good_reports(); reports[name][key].pop()
            self.assertRefused(reports, 'minimum')
        reports = good_reports(); reports['browser-results.json'] = '{'
        self.assertRefused(reports, 'illisible')

    def test_07_non_strict_mode_reports_without_raising(self):
        reports = good_reports(); reports['decision-paths-results.json']['allPassed'] = False
        with tempfile.TemporaryDirectory() as tmp:
            for name, report in reports.items():
                (Path(tmp) / name).write_text(json.dumps(report))
            summary = evidence.validate(tmp, HTML, require=False)
        self.assertFalse(summary[3]['allPassed'])

    def make_release(self, tmp, commit='abc', mutate=None):
        manifest = {'sourceCommit': commit, 'autonomousHtmlSha256': SHA,
                    'browserEvidence': [{'file': f, 'allPassed': True, 'htmlSha256': SHA} for f in evidence.REQUIRED_FILES]}
        if mutate: mutate(manifest)
        (tmp / 'SwissDriver_Lab.html').write_bytes(HTML)
        (tmp / 'edition-manifest.json').write_text(json.dumps(manifest))
        (tmp / 'SHA256SUMS.txt').write_text(''.join(hashlib.sha256((tmp / n).read_bytes()).hexdigest() + '  ' + n + '\n'
                                                    for n in ['SwissDriver_Lab.html', 'edition-manifest.json']))

    def test_08_pages_gate_requires_same_commit_and_positive_evidence(self):
        cases = [(None, 'abc', None), (None, 'other', 'commit'),
                 (lambda m: m['browserEvidence'].pop(3), 'abc', 'decision-paths'),
                 (lambda m: m['browserEvidence'].pop(4), 'abc', 'road-lessons'),
                 (lambda m: m['browserEvidence'][3].update(allPassed=False), 'abc', 'decision-paths'),
                 (lambda m: m.update(autonomousHtmlSha256='0' * 64), 'abc', 'HTML different')]
        for mutate, commit, fragment in cases:
            with tempfile.TemporaryDirectory() as tmp:
                self.make_release(Path(tmp), mutate=mutate)
                if fragment is None:
                    self.assertEqual(evidence.verify_release(tmp, commit)['sourceCommit'], 'abc')
                else:
                    with self.assertRaises(evidence.EvidenceError) as ctx:
                        evidence.verify_release(tmp, commit)
                    self.assertIn(fragment, str(ctx.exception))
        with tempfile.TemporaryDirectory() as tmp:
            self.make_release(Path(tmp)); (Path(tmp) / 'SwissDriver_Lab.html').write_bytes(HTML + b'x')
            with self.assertRaises(evidence.EvidenceError):
                evidence.verify_release(tmp, 'abc')

    def test_09_real_reports_if_present_match_the_built_html(self):
        results, html = ROOT / 'test-results', ROOT / 'dist/SwissDriver_Lab.html'
        if not all((results / Path(f).name).exists() for f in evidence.REQUIRED_FILES) or not html.exists():
            self.skipTest('browser reports not generated in this working copy')
        snapshot = {f: (results / Path(f).name).read_bytes() for f in evidence.REQUIRED_FILES}
        evidence.validate(results, html.read_bytes(), require=True)
        self.assertEqual(snapshot, {f: (results / Path(f).name).read_bytes() for f in evidence.REQUIRED_FILES})


if __name__ == '__main__':
    unittest.main(verbosity=2)
