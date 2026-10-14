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


def motion(branch):
    trail = [t for t in branch.get('trail', []) if isinstance(t.get('s'), (int, float))]
    if not trail:
        return None
    xs = [t['x'] for t in trail]
    return {'sampling': '1 echantillon par seconde simulee, le premier 1 s apres le choix',
            'firstS': round(trail[0]['s'], 2), 'lastS': round(trail[-1]['s'], 2),
            'maxSpeedMs': round(max(t['v'] for t in trail), 2),
            'lateralRangeM': round(max(xs) - min(xs), 2),
            'pullManoeuvre': any(t.get('pulling') for t in trail)}


def build():
    data, scenarios = load_source()
    report = json.loads(REPORT.read_text()) if REPORT.exists() else None
    branches = {(b['scenarioId'], b['choiceIndex']): b for b in (report or {}).get('branches', [])}
    titles = {(c['id'], s['id']): s['otitle'] for c in data['chapters'] for s in c['sections']}
    rows = []
    for chapter, sections in scenarios.items():
        for section, items in sections.items():
            for sc in items:
                acts = [c['act'] for c in sc['choices']]
                for index, choice in enumerate(sc['choices']):
                    correct = index == sc['ok']
                    branch = branches.get((sc['id'], index))
                    observed = bool(branch and branch.get('passed'))
                    scene = (branch or {}).get('scene') or {}
                    rows.append({
                        'ruleId': f'{chapter}/{section}', 'ruleTitle': titles[(chapter, section)],
                        'scenarioId': sc['id'], 'scenarioTitle': sc['title'], 'sceneKind': sc['kind'],
                        'choiceIndex': index, 'expectedCorrect': correct,
                        'announcedAction': choice['t'].translate(PLAIN),
                        'engineAct': choice['act'],
                        'engineActSharedInScenario': acts.count(choice['act']) > 1,
                        'observedAction': None,
                        'observedMotion': motion(branch) if branch else None,
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
                        'status': 'issue_terminale_verifiee' if observed else 'non_audite',
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
