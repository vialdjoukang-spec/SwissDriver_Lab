# État de relais — 14.10.2026

| Élément | État vérifié |
|---|---|
| `main` | `029b5d5` ; release publique `v0.3.0-preview.1` (sans la PR #5) |
| PR #5 | ouverte, non fusionnée, tête `b5a07df` (`fix/priorities-75-decision-paths`) |
| Ce lot | branche `claude/bold-faraday-g18mc4`, fille de `b5a07df` ; PR ciblant `fix/priorities-75-decision-paths` ; lié à l'issue #6 |
| Release / Pages | aucune nouvelle release ; Pages non activé ni déployé par ce lot |

## Fichiers changés
- `scripts/evidence.py` (nouveau) : validation fermée des 3 rapports (présence, complétude, réussite, erreurs, `htmlSha256` = HTML reconstruit) et contrôle d'une édition téléchargée (commit, HTML, `SHA256SUMS`, preuves).
- `scripts/package.py` : utilise ce contrôle ; le manifeste résume les 75 branches (nombre, réussites, cadence, portée, empreintes).
- `tests/browser_smoke.py`, `tests/scene_coherence.py` : rapports liés à `htmlSha256` et marqués `completed`.
- `.github/workflows/pages.yml` : n'exécute plus de build ; exige l'ID d'un run qualité `push` réussi sur le même SHA de `main`, en télécharge l'édition et la vérifie.
- `scripts/coherence_matrix.py`, `docs/COHERENCE_PRIORITES.json` (nouveaux) : 75 lignes, statut `issue_terminale_verifiee`, aucune `coherent_observe`.
- Tests : `tests/test_evidence_gate.py` (9, dont négatifs sur copies temporaires), `tests/test_coherence_matrix.py` (4) ; ajout à la CI, à `npm test` ; `npm run test:browser` inclut `decision_paths.py`.
- Guides : `AGENTS.md`, `docs/EDITER.md`, `docs/ETAT_ET_RESTE.md`, `docs/DECISIONS_75.md`, `CHANGELOG.md`.

## Commandes exécutées localement (Chromium 1194, Playwright 1.56.0, Node 22, Python 3.13)
Ligne de base sur `b5a07df` : 8 + 20 + 24 + 75 + 6 réussis, HTML `b72d5d251728d391e1d99ad9fb3d6c385d914a0d8881d825c3d725dde5695d66` (identique à l'artefact de la PR #5).
Après modification : mêmes suites + 9 + 4 réussies ; HTML autonome inchangé (même empreinte) ; HTML historique `58ec2197…335a` inchangé ; packaging strict refusé quand le rapport des 75 branches est retiré ; `evidence.py` refuse un commit différent.
Les anciens rapports (sans `htmlSha256`/`completed`) sont désormais refusés : il faut relancer les suites.

## Constats ouverts pour l'issue #6 (mesurés, non corrigés)
- 40 des 75 lignes partagent leur `act` avec une autre réponse de la même situation (`go`, `info`).
- r3/2 « Je me décale à gauche » : écart latéral mesuré 0,0 m, trajectoire identique à « Je m'arrête ».
- t3/2 « Je recule » : la berline avance d'environ 2,2 m entre les échantillons ; aucun recul simulé.
Échantillonnage à 1 s, premier point 1 s après le choix : ces valeurs signalent, elles ne mesurent pas finement.

## Non exécuté / limites
Pas de test Firefox/WebKit, ni d'approche manuelle, ni de contacts, ni de rendu continu. Le workflow Pages n'a pas été exécuté (Pages non activé ; non autorisé). Aucune source Fedlex rattachée.

## Autorisations en attente
Fusion de la PR #5 puis de ce lot ; incrément de version et release ; activation de Pages.

## Prochaine commande
`python3 tests/decision_paths.py && python3 scripts/coherence_matrix.py`, puis écrire le premier test reproduisant r3/2 (déplacement latéral attendu) avant toute correction dans `src/`.
