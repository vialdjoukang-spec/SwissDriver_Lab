"""Generate docs/COHERENCE_PRIORITES.json: 75 situation/answer rows for issue #6.

Inputs: the stored scenarios of Permis_GT_Rossa.html and, when present, the
decision-path report bound to the built HTML. Only measured facts are filled
in; gesture identity and Swiss legal sources stay explicitly unaudited.
Usage: python3 scripts/coherence_matrix.py (after tests/decision_paths.py)
"""
from pathlib import Path
import hashlib, json, subprocess
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/COHERENCE_PRIORITES.json'
REPORT = ROOT / 'test-results/decision-paths-results.json'
STATUSES = {
    'non_audite': 'Aucune observation du geste ; seul le contrat stocke est connu.',
    'issue_terminale_verifiee': 'Issue terminale et rejeu observes ; geste, contacts et source non audites.',
    'limite_signalee': 'Ecart entre action annoncee et comportement simule, documente comme limite.',
    'coherent_observe': 'Geste observe identique a l’annonce, sans contact imprevu, source officielle datee.',
}
PLAIN = str.maketrans({'*': None})


def load_source():
    source = (ROOT / 'Permis_GT_Rossa.html').read_text(encoding='utf-8')
    data = json.JSONDecoder().raw_decode(source.split('window.DATA=', 1)[1])[0]
    start = source.index('var Uu=') + 7
    end = source.index(',Nu=[', start)
    code = ("const fs=require('fs'),vm=require('vm');const s=fs.readFileSync(0,'utf8');"
            "process.stdout.write(JSON.stringify(vm.runInNewContext('('+s+')',{}, {timeout:2000})));")
    scenarios = json.loads(subprocess.check_output(['node', '-e', code], input=source[start:end], text=True))
    return data, scenarios


def observed_ok(branch):
    return bool(branch and branch.get('passed'))


def motion(branch):
    trail = [t for t in branch.get('trail', []) if isinstance(t.get('s'), (int, float))]
    if not trail:
        return None
    xs = [t['x'] for t in trail]
    return {'sampling': '1 echantillon par seconde simulee, le premier 1 s apres le choix',
            'firstS': round(trail[0]['s'], 2), 'lastS': round(trail[-1]['s'], 2),
            'maxSpeedMs': round(max(t['v'] for t in trail), 2),
            'lateralRangeM': round(max(xs) - min(xs), 2),
            'maxLaneOffsetM': round(max(abs(t.get('lat') or 0) for t in trail), 2),
            'pullManoeuvre': any(t.get('pulling') for t in trail)}


def gestures(texts):
    code = ("const g=require('./src/gestures.js');const t=JSON.parse(require('fs').readFileSync(0,'utf8'));"
            "process.stdout.write(JSON.stringify(t.map(x=>g.classify(x))));")
    return json.loads(subprocess.check_output(['node', '-e', code], input=json.dumps(texts), cwd=ROOT, text=True))


def observed_action(gesture, m):
    # Only measured facts or explicitly limited representations; nothing is ticked as coherent here.
    if not gesture or not m:
        return None, None
    g = gesture['id']
    if g == 'left':
        return (f"décalage latéral mesuré {m['maxLaneOffsetM']} m hors de l’axe de la voie", 'observed') if m['maxLaneOffsetM'] >= 0.5 else (None, 'missing')
    if g == 'reverse':
        return (f"recul mesuré {round(m['firstS'] - m['lastS'], 2)} m", 'observed') if m['lastS'] < m['firstS'] - 0.3 else (None, 'missing')
    if g == 'hard':
        return f"vitesse maximale mesurée {m['maxSpeedMs']} m/s", 'observed'
    if g in ('blink-left', 'blink-right'):
        return 'clignotant du côté annoncé allumé au début de la trajectoire (non mesuré par le rapport)', 'limited'
    if g in ('stop-lane', 'hand', 'half'):
        return f"progression mesurée {round(m['lastS'] - m['firstS'], 2)} m", 'observed'
    return 'représenté par un son ou un signal visuel et une légende, sans animation du conducteur', 'limited'


def build():
    data, scenarios = load_source()
    report = json.loads(REPORT.read_text()) if REPORT.exists() else None
    branches = {(b['scenarioId'], b['choiceIndex']): b for b in (report or {}).get('branches', [])}
    titles = {(c['id'], s['id']): s['otitle'] for c in data['chapters'] for s in c['sections']}
    rows = []
    texts = [c['t'] for secs in scenarios.values() for items in secs.values() for sc in items for c in sc['choices']]
    gesture_list = iter(gestures(texts))
    for chapter, sections in scenarios.items():
        for section, items in sections.items():
            for sc in items:
                acts = [c['act'] for c in sc['choices']]
                for index, choice in enumerate(sc['choices']):
                    correct = index == sc['ok']
                    branch = branches.get((sc['id'], index))
                    observed = bool(branch and branch.get('passed'))
                    scene = (branch or {}).get('scene') or {}
                    gesture = next(gesture_list)
                    gesture = None if correct else gesture
                    measured = motion(branch) if branch else None
                    seen, kind = observed_action(gesture, measured) if observed_ok(branch) else (None, None)
                    rows.append({
                        'ruleId': f'{chapter}/{section}', 'ruleTitle': titles[(chapter, section)],
                        'scenarioId': sc['id'], 'scenarioTitle': sc['title'], 'sceneKind': sc['kind'],
                        'choiceIndex': index, 'expectedCorrect': correct,
                        'announcedAction': choice['t'].translate(PLAIN),
                        'engineAct': choice['act'],
                        'engineActSharedInScenario': acts.count(choice['act']) > 1,
                        'gesture': gesture['id'] if gesture else None,
                        'observedAction': seen,
                        'observedMotion': measured,
                        'objects': {'light': scene.get('light'), 'signs': scene.get('signs'),
                                    'actors': [a['kind'] + (':' + a['gesture'] if a.get('gesture') else '')
                                               for a in scene.get('actors', [])]} if scene else None,
                        'expectedOutcome': ('trajectoire menee a son terme, progression accordee' if correct else
                                            'explication (fait, attendu, raison), erreur comptee, rejeu de la meme situation'),
                        'expectedBehaviour': sc['should'].translate(PLAIN),
                        'evidence': ({'file': 'test-results/decision-paths-results.json',
                                      'htmlSha256': report.get('htmlSha256'), 'terminal': (branch.get('terminal') or {}).get('type'),
                                      'scope': 'issue terminale et rejeu ; ni geste, ni contacts, ni approche manuelle'}
                                     if observed else None),
                        'regulatorySource': None,
                        'regulatorySourceStatus': 'a sourcer sur Fedlex/OFROU ; aucun article retenu',
                        'status': ('limite_signalee' if kind in ('limited', 'missing') else 'issue_terminale_verifiee') if observed else 'non_audite',
                    })
    return {
        'schema': 'swissdriver.coherence-priorites/1',
        'scope': ('Matrice cours -> regle -> action annoncee -> action reelle -> consequence pour O11. '
                  'Initialisation : aucune ligne n’est declaree coherente ; observedAction et regulatorySource '
                  'restent vides tant qu’un audit visuel et une source officielle datee ne les justifient pas.'),
        'statuses': STATUSES,
        'sourceHtmlSha256': hashlib.sha256((ROOT / 'Permis_GT_Rossa.html').read_bytes()).hexdigest(),
        'decisionReportHtmlSha256': report.get('htmlSha256') if report else None,
        'totals': {'rows': len(rows),
                   'byStatus': {k: sum(r['status'] == k for r in rows) for k in STATUSES},
                   'rowsWithSharedEngineAct': sum(r['engineActSharedInScenario'] for r in rows)},
        'rows': rows,
    }


def render(matrix):
    return json.dumps(matrix, ensure_ascii=False, indent=1) + '\n'


if __name__ == '__main__':
    text = render(build())
    OUT.write_text(text, encoding='utf-8')
    print(json.dumps(json.loads(text)['totals']))
