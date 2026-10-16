"""Build a complete, deterministic source/runtime/evidence archive. No fonts/secrets."""
from pathlib import Path
import argparse, hashlib, json, subprocess, sys, zipfile
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from evidence import validate as validate_evidence  # noqa: E402
EXPECTED = '58ec2197dd14b8e8895cb83d134a2b598213b7f3d03b221fbf39f8e74258335a'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')

def package(require_evidence=False):
    original = (ROOT / 'Permis_GT_Rossa.html').read_bytes()
    if sha(original) != EXPECTED:
        raise ValueError('Le fichier historique a change ; publication refusee.')
    subprocess.run(['node', str(ROOT / 'scripts/build.cjs')], check=True, cwd=ROOT)
    source = original.decode('utf-8')
    # Inventory from the data the engine really uses: historical DATA merged with content/.
    merged = ("const fs=require('fs');const c=require('./src/curriculum.js');const s=fs.readFileSync('Permis_GT_Rossa.html','utf8');"
              "const d=JSON.parse(s.split('window.DATA=')[1].split(';\\n')[0]);process.stdout.write(JSON.stringify(c.merge(d,c.loadExtension('.'))));")
    data = json.loads(subprocess.check_output(['node', '-e', merged], cwd=ROOT, text=True))
    start = source.index('var Uu=') + 7
    end = source.index(',Nu=[', start)
    # Evaluate only the trusted source object in an isolated VM with a time limit.
    code = "const fs=require('fs'),vm=require('vm');const s=fs.readFileSync(0,'utf8');process.stdout.write(JSON.stringify(vm.runInNewContext('('+s+')',{}, {timeout:2000})));"
    scenarios = json.loads(subprocess.check_output(['node', '-e', code], input=source[start:end], text=True))
    lessons = {}
    for lesson in data.get('roadLessons', []):
        lessons.setdefault(lesson['rule'], []).append(lesson['id'])
    catalogue = []
    by_id = {c['id']: c for c in data['chapters']}
    for chapter in [by_id[i] for g in data['groups'] for i in g['chapters']]:
        sections = []
        for section in chapter['sections']:
            ids = [s['id'] for s in scenarios.get(chapter['id'], {}).get(section['id'], [])]
            sections.append({'id': section['id'], 'title': section['otitle'], 'scenarioIds': ids,
                             'courseSceneIds': lessons.get(chapter['id'] + '/' + section['id'], [])})
        catalogue.append({'id': chapter['id'], 'official': chapter.get('official'), 'title': chapter['otitle'], 'sections': sections,
                          'simulationAvailable': any(s['scenarioIds'] for s in sections)})
    totals = {'parts': len(data['groups']), 'chapters': len(catalogue),
              'sections': sum(len(c['sections']) for c in catalogue), 'storedQuestions': len(data['questions']),
              'simulatedChapters': sum(c['simulationAvailable'] for c in catalogue),
              'simulatedSections': sum(bool(s['scenarioIds']) for c in catalogue for s in c['sections']),
              'scenarios': sum(len(s['scenarioIds']) for c in catalogue for s in c['sections']),
              # Simplified course scenes: real object, decision, assisted consequence (content/road-lessons).
              'courseScenes': sum(len(s['courseSceneIds']) for c in catalogue for s in c['sections']),
              'sectionsWithCourseScene': sum(bool(s['courseSceneIds']) for c in catalogue for s in c['sections']),
              'chaptersWithCourseScene': sum(any(s['courseSceneIds'] for s in c['sections']) for c in catalogue)}
    files = {}
    root_files = ['Permis_GT_Rossa.html', 'index.html', 'swissdriver-modern.css', 'package.json',
                  'requirements-dev.txt', '.gitignore', '.gitattributes', '.editorconfig', 'README.md',
                  'START_HERE.md', 'AGENTS.md', 'CHANGELOG.md', 'THIRD_PARTY_NOTICES.md', 'LANCER_WINDOWS.cmd']
    for name in root_files:
        files[name] = (ROOT / name).read_bytes()
    for folder, suffixes in [('src', {'.js', '.css'}), ('scripts', {'.py', '.cjs'}),
                             ('tests', {'.py'}), ('docs', {'.md', '.json'}), ('content', {'.json'}),
                             ('.github/workflows', {'.yml'}), ('test-results', {'.json', '.png', '.txt'})]:
        for p in sorted((ROOT / folder).glob('**/*')):
            if p.is_file() and p.suffix in suffixes and '__pycache__' not in p.parts:
                files[p.relative_to(ROOT).as_posix()] = p.read_bytes()
    html = (ROOT / 'dist/SwissDriver_Lab.html').read_bytes()
    # Every report, including the 75 decision branches, must name this exact HTML.
    evidence = validate_evidence(ROOT / 'test-results', html, require=require_evidence)
    files['dist/SwissDriver_Lab.html'] = html
    inventory = {'totals': totals, 'chapters': catalogue, 'scope': 'Stored content and scene availability, not legal certification.'}
    files['curriculum-status.json'] = json_bytes(inventory)
    version = json.loads((ROOT / 'package.json').read_text())['version']
    try:
        revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, stderr=subprocess.DEVNULL, text=True).strip()
    except (OSError, subprocess.CalledProcessError):
        revision = 'working-copy-unversioned'
    manifest = {'version': version, 'sourceCommit': revision, 'originalSha256': EXPECTED,
                'autonomousHtmlSha256': sha(files['dist/SwissDriver_Lab.html']),
                'coverage': totals, 'browserEvidence': evidence,
                'scope': 'Editable prototype; not a complete driving curriculum or a legal/road certification.',
                'files': {name: sha(content) for name, content in sorted(files.items())}}
    files['edition-manifest.json'] = json_bytes(manifest)
    output = ROOT / 'release'
    output.mkdir(exist_ok=True)
    archive = output / 'SwissDriver_Lab_Edition.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for name, content in sorted(files.items()):
            info = zipfile.ZipInfo('SwissDriver_Lab_Edition/' + name, (2026, 10, 14, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, content)
    (output / 'SwissDriver_Lab.html').write_bytes(files['dist/SwissDriver_Lab.html'])
    (output / 'edition-manifest.json').write_bytes(files['edition-manifest.json'])
    (output / 'curriculum-status.json').write_bytes(files['curriculum-status.json'])
    assets = ['SwissDriver_Lab_Edition.zip', 'SwissDriver_Lab.html', 'edition-manifest.json', 'curriculum-status.json']
    (output / 'SHA256SUMS.txt').write_text(''.join(sha((output / n).read_bytes()) + '  ' + n + '\n' for n in assets))
    notes = f'''# SwissDriver Lab — edition modifiable {version}

Sources et programme executables du commit `{revision}`. Extraire **SwissDriver_Lab_Edition.zip**, puis ouvrir **dist/SwissDriver_Lab.html** ; le HTML seul est aussi fourni.

Le ZIP comprend les modules, le moteur historique avec ses ressources, les scripts, les guides, les tests, les captures et un manifeste d'integrite. Aucun fichier de police n'est distribue. La police Atkinson est externe ; repli Arial hors ligne.

Perimetre : {totals['chapters']} chapitres et {totals['sections']} sous-chapitres stockes ; {totals['simulatedChapters']} chapitre simule, {totals['simulatedSections']} sous-chapitres et {totals['scenarios']} situations. En outre, {totals['courseScenes']} scenes de cours simplifiees (trajectoire assistee) couvrent {totals['sectionsWithCourseScene']} sous-chapitres de {totals['chaptersWithCourseScene']} chapitres ; les autres sous-chapitres sont des cours seuls. Voir **docs/ETAT_ET_RESTE.md**.

Rapports navigateur : {sum(e.get('checks', 0) for e in evidence)} controles et {sum(e.get('branches', 0) for e in evidence)} branches decisionnelles, lies a l'empreinte du HTML livre. La publication est conditionnee aux tests de structure, navigateur, scene, des 75 branches et de distribution. Les tests instrumentes ne certifient pas toutes les trajectoires, la fluidite ni le droit routier suisse.

La release n'active pas GitHub Pages. Workflow de deploiement manuel fourni apres activation dans les parametres du depot.
'''
    (output / 'RELEASE_NOTES.md').write_text(notes, encoding='utf-8')
    print(json.dumps({'version': version, 'files': len(files), 'coverage': totals, 'archiveBytes': archive.stat().st_size}))
    return archive

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--require-browser-evidence', action='store_true')
    args = parser.parse_args()
    package(args.require_browser_evidence)
