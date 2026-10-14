"""Fail-closed validation of the browser evidence bound to one standalone HTML.

Used by scripts/package.py (before assembling an edition) and by the Pages
workflow (before deploying a downloaded edition). A report is accepted only if
it exists, is complete, passed every check, has no JavaScript/fatal error and
names the exact SHA-256 of the HTML being shipped.
"""
from pathlib import Path
import hashlib, json, sys

# Minimum counts are the contract recorded on PR #5; a test that legitimately
# changes them must update this table with replacement coverage, never lower it silently.
REPORTS = [
    {'file': 'browser-results.json', 'kind': 'checks', 'key': 'tests', 'errors': 'javascriptErrors', 'minimum': 20},
    {'file': 'scene-coherence-results.json', 'kind': 'checks', 'key': 'checks', 'errors': 'errors', 'minimum': 24},
    {'file': 'learning-results.json', 'kind': 'checks', 'key': 'checks', 'errors': 'errors', 'minimum': 33},
    {'file': 'decision-paths-results.json', 'kind': 'branches', 'key': 'branches', 'errors': 'errors', 'minimum': 75},
]
REQUIRED_FILES = ['test-results/' + spec['file'] for spec in REPORTS]


class EvidenceError(ValueError):
    pass


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def _problems(spec, report, html_sha):
    problems = []
    items = report.get(spec['key'])
    if not isinstance(items, list) or len(items) < spec['minimum']:
        problems.append(f"{len(items) if isinstance(items, list) else 0} entrees, minimum {spec['minimum']}")
        items = items if isinstance(items, list) else []
    if not all(isinstance(i, dict) and i.get('passed') is True for i in items):
        problems.append('entree en echec')
    if report.get(spec['errors']):
        problems.append('erreurs JavaScript consignees')
    if report.get('htmlSha256') != html_sha:
        problems.append('htmlSha256 different du HTML livre')
    if spec['kind'] == 'checks':
        if report.get('completed') is not True:
            problems.append('suite non terminee (completed != true)')
    else:
        expected = spec['minimum']
        counts = (report.get('expectedBranches'), report.get('attemptedBranches'), report.get('passedBranches'))
        if counts != (expected, expected, expected) or len(items) != expected:
            problems.append(f'branches attendues/tentees/reussies {counts}, rapport {len(items)}')
        if report.get('allPassed') is not True:
            problems.append('allPassed != true')
        if report.get('fatal'):
            problems.append('erreur fatale consignee')
        ids = [(i.get('scenarioId'), i.get('choiceIndex')) for i in items if isinstance(i, dict)]
        if len(set(ids)) != len(ids):
            problems.append('branches dupliquees')
    return problems


def validate(results_dir, html_bytes, require=True):
    """Return the manifest summary; raise EvidenceError when require is set and anything is missing or wrong."""
    html_sha = sha256(html_bytes)
    summary, failures = [], []
    for spec in REPORTS:
        path = Path(results_dir) / spec['file']
        if not path.exists():
            failures.append(spec['file'] + ' : absent')
            continue
        raw = path.read_bytes()
        try:
            report = json.loads(raw)
        except ValueError:
            failures.append(spec['file'] + ' : JSON illisible')
            continue
        if not isinstance(report, dict):
            failures.append(spec['file'] + ' : structure invalide')
            continue
        problems = _problems(spec, report, html_sha)
        failures += [spec['file'] + ' : ' + p for p in problems]
        items = report.get(spec['key']) if isinstance(report.get(spec['key']), list) else []
        entry = {'file': 'test-results/' + spec['file'], spec['kind']: len(items), 'allPassed': not problems,
                 'scope': report.get('scope'), 'htmlSha256': report.get('htmlSha256'),
                 'htmlMatchesBuild': report.get('htmlSha256') == html_sha, 'sha256': sha256(raw)}
        if spec['kind'] == 'branches':
            entry.update({'passedBranches': report.get('passedBranches'), 'fixedFrameMs': report.get('fixedFrameMs')})
        summary.append(entry)
    if require and failures:
        raise EvidenceError('Preuves navigateur refusees :\n- ' + '\n- '.join(failures))
    return summary


def verify_release(release_dir, commit):
    """Check a downloaded release/ directory before deployment: same commit, same HTML, all evidence passed."""
    release_dir = Path(release_dir)
    manifest = json.loads((release_dir / 'edition-manifest.json').read_text())
    html = (release_dir / 'SwissDriver_Lab.html').read_bytes()
    failures = []
    if manifest.get('sourceCommit') != commit:
        failures.append(f"manifeste {manifest.get('sourceCommit')} != commit {commit}")
    if manifest.get('autonomousHtmlSha256') != sha256(html):
        failures.append('HTML different de celui du manifeste')
    for line in (release_dir / 'SHA256SUMS.txt').read_text().splitlines():
        expected, name = line.split('  ', 1)
        if sha256((release_dir / name).read_bytes()) != expected:
            failures.append('empreinte invalide : ' + name)
    evidence = {e.get('file'): e for e in manifest.get('browserEvidence', [])}
    for name in REQUIRED_FILES:
        e = evidence.get(name)
        if not e or e.get('allPassed') is not True or e.get('htmlSha256') != sha256(html):
            failures.append('preuve absente ou negative : ' + name)
    if failures:
        raise EvidenceError('Edition refusee :\n- ' + '\n- '.join(failures))
    return manifest


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: evidence.py RELEASE_DIR COMMIT_SHA')
    try:
        m = verify_release(sys.argv[1], sys.argv[2])
    except (EvidenceError, OSError, ValueError) as exc:
        raise SystemExit(str(exc))
    print(json.dumps({'sourceCommit': m['sourceCommit'], 'autonomousHtmlSha256': m['autonomousHtmlSha256'],
                      'evidence': [e['file'] for e in m['browserEvidence']]}))
