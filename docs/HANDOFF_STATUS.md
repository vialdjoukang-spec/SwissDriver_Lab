# État de relais — 14.10.2026

| Élément | État vérifié |
|---|---|
| `main` | PR #5 et PR #7 fusionnées ; release publique `v0.4.0-preview.1` |
| Ce lot | branche `claude/bold-faraday-g18mc4`, version `0.5.0-preview.1` ; PR vers `main` |
| Pages | non activé par le propriétaire ; aucun déploiement |

## Contenu du lot 0.5.0
- `content/` : index, 8 chapitres, 13 sous-chapitres, questions et 4es propositions ; `content/programme-asa-2027.json` (161 contenus asa → cours).
- `src/curriculum.js` (fusion fermée sur erreur), `src/learning.js` + `src/learning.css` (cours vus, aller-retour, QCM, signaux, schémas), `src/signs.js` (27 signaux simplifiés), `src/gestures.js` (gestes visibles des mauvaises réponses O11).
- Tests : `tests/learning_flow.py` (navigateur), `tests/test_programme.py`, contrat de matrice étendu, preuves exigées par `scripts/evidence.py`.

## Points à faire relire par une personne compétente
Gestes de la police et police auxiliaire (O13), couleurs des indicateurs de direction (O14), plaques professionnelles (O54), retraits (O44), croisement en montagne et routes postales (N33), recours de l'assureur (O45), fourche analytique (N47/N48), règles d'alcool des nouveaux conducteurs (N47), N46-FOR-05. Aucune source Fedlex n'est encore rattachée par règle.

## Limites
Scènes 3D uniquement pour O11. Klaxon, appel de phares et signe de la main : son ou signal visuel et légende, sans animation du conducteur. Pas de Firefox/WebKit, pas de mesure en rendu continu, pas d'approche manuelle mesurée.

## Prochaine commande
`python3 tests/decision_paths.py && python3 scripts/coherence_matrix.py`, puis scènes 3D O12–O14 avec signaux réels sur la route.
