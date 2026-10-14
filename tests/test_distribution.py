"""Six checks for the downloadable edition, independent of the 3D test count."""
from pathlib import Path
import hashlib, json, unittest, zipfile
ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'SwissDriver_Lab_Edition/'
class DistributionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.archive = zipfile.ZipFile(ROOT / 'release/SwissDriver_Lab_Edition.zip')
        cls.names = cls.archive.namelist()
        cls.manifest = json.loads(cls.archive.read(PREFIX + 'edition-manifest.json'))
    @classmethod
    def tearDownClass(cls):
        cls.archive.close()
    def test_01_every_manifest_file_matches(self):
        for name, expected in self.manifest['files'].items():
            self.assertEqual(hashlib.sha256(self.archive.read(PREFIX + name)).hexdigest(), expected, name)
        self.assertEqual(len(self.names), len(self.manifest['files']) + 1)
    def test_02_complete_runtime_and_editing_tools(self):
        for name in ['dist/SwissDriver_Lab.html', 'index.html', 'src/launcher.js', 'src/transform.js',
                     'src/engine-bridge.js', 'src/scene-coherence.js', 'src/scene-coherence.css',
                     'src/sedan.js', 'swissdriver-modern.css', 'Permis_GT_Rossa.html',
                     'scripts/build.cjs', 'scripts/serve.cjs', 'scripts/package.py',
                     'tests/browser_smoke.py', 'tests/scene_coherence.py',
                     'tests/decision_paths.py', 'tests/test_evidence_gate.py', 'tests/test_coherence_matrix.py',
                     'scripts/evidence.py', 'src/learning.js', 'src/learning.css', 'src/signs.js', 'src/gestures.js', 'tests/test_programme.py', 'src/curriculum.js', 'content/index.json', 'tests/learning_flow.py', 'scripts/coherence_matrix.py', 'src/decision-safety.js',
                     'docs/COHERENCE_PRIORITES.json', 'docs/DECISIONS_75.md', '.github/workflows/pages.yml', 'START_HERE.md',
                     'docs/EDITER.md', 'docs/ETAT_ET_RESTE.md', 'AGENTS.md',
                     '.github/workflows/swissdriver-quality.yml']:
            self.assertIn(PREFIX + name, self.names)
    def test_03_safe_archive_paths_and_no_font_files(self):
        self.assertEqual(len(self.names), len(set(self.names)))
        for name in self.names:
            self.assertTrue(name.startswith(PREFIX))
            self.assertNotIn('..', Path(name).parts)
            self.assertNotIn('.git', Path(name).parts)
            self.assertNotIn('__pycache__', Path(name).parts)
            self.assertNotIn(Path(name).suffix.lower(), {'.woff', '.woff2', '.ttf', '.otf', '.pyc', '.pem', '.key'})
            self.assertNotIn(Path(name).name, {'.env', 'credentials.json'})
    def test_04_coverage_and_original_are_truthful(self):
        c = self.manifest['coverage']
        self.assertEqual((c['chapters'],c['sections'],c['simulatedChapters'],c['simulatedSections'],c['scenarios']), (19,120,1,7,25))
        self.assertEqual(self.manifest['originalSha256'], '58ec2197dd14b8e8895cb83d134a2b598213b7f3d03b221fbf39f8e74258335a')
    def test_05_html_matches_the_build(self):
        actual = self.archive.read(PREFIX + 'dist/SwissDriver_Lab.html')
        self.assertEqual(actual, (ROOT / 'dist/SwissDriver_Lab.html').read_bytes())
        self.assertEqual(actual, (ROOT / 'release/SwissDriver_Lab.html').read_bytes())
        self.assertIn(b'SwissDriverScene', actual)
    def test_06_release_checksums(self):
        for line in (ROOT / 'release/SHA256SUMS.txt').read_text().splitlines():
            expected, name = line.split('  ',1)
            self.assertEqual(hashlib.sha256((ROOT / 'release' / name).read_bytes()).hexdigest(), expected)
if __name__ == '__main__':
    unittest.main(verbosity=2)
