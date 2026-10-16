# État de relais — 16.10.2026

| Élément | État vérifié |
|---|---|
| `main` | PR #8 fusionnée ; release publique `v0.5.0-preview.1` |
| Ce lot | branche `claude/funny-newton-h8dodp`, version `0.6.0-preview.1` ; PR vers `main`, fusion soumise au propriétaire |
| Pages | non activé par le propriétaire ; aucun déploiement |

## Contenu du lot 0.6.0
- Route du programme : les 27 chapitres se suivent sur la route par portiques de cours (`src/transform.js`, `src/engine-bridge.js`).
- 80 scènes de cours simplifiées : données `content/road-lessons/`, moteur `src/road-lessons.js`, dessins `src/signs.js`, format `docs/SCENES_COURS.md`, outils `scripts/check_scenes.cjs` et `scripts/course_text.cjs`.
- Tests : `tests/test_road_lessons.py`, `tests/road_lessons.py` (240 branches, collisions) ; preuve exigée par `scripts/evidence.py`, dimensionnée sur le nombre de scènes.

## Points à faire relire par une personne compétente
Ceux du lot 0.5.0 (gestes de la police, indicateurs de direction, plaques, retraits, montagne, recours, fourche analytique, alcool des nouveaux conducteurs, N46-FOR-05), plus les 80 scènes : chaque bonne réponse reprend le texte du cours, mais aucune n’a été confrontée à Fedlex. Dessins simplifiés non officiels : place d’évitement, parcage avec disque, hauteur maximale, indicateurs de direction, tunnel, croix de Saint-André.

## Limites
Trajectoires assistées : les scènes évaluent la décision, pas la conduite manuelle. Décor : route droite, plate, de jour ; pas de virage, de pente, de nuit, de marche arrière ni de moto. La circulation ambiante du moteur peut croiser une scène. Pas de Firefox/WebKit, pas de mesure en rendu continu.

## Prochaine commande
Après fusion par le propriétaire : le workflow qualité publie `v0.6.0-preview.1` depuis `main`. Pages : activation dans Settings → Pages, puis déploiement d’un run vérifié.
