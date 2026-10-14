# SwissDriver Lab — Audit initial et plan d'intégration

Date : 2026-10-14. Base : main, commit 33a2c5d8e017cf166375689920af58a89699a473.

## Périmètre effectivement inspecté

README.md ne comporte que le titre. L'application actuelle est distribuée sous `PERMIS_GT_ROSSA_PACK.zip` (fichier binaire). Les fichiers HTML/CSS/JS, scènes 3D, modèles, exercices et données pédagogiques internes n'ont pas encore été inspectés : aucun constat sur leur conformité ou leur fonctionnalité ne serait fondé. Les fichiers proposés sur cette branche constituent une préparation **non encore intégrée** à l'application archivée.

## Actions prioritaires
1. Extraire l'archive en fichiers versionnés (conserver l'archive d'origine). Documenter point d'entrée, commande de lancement, licences et dépendances.
2. Identifier chaque leçon, exercice, scénario et règle simulée ; établir la traçabilité par identifiants communs.
3. Lier le cours, la préparation de l'exercice et les événements de la simulation à un unique contrat de scénario JSON validé.
4. Mettre en place l'évaluation objective à partir de télémétrie (vitesse, trajectoire, freinage, clignotants, priorité, distances, observations si simulées). Ne jamais prétendre mesurer une observation si aucune commande/capteur ne la capture.
5. Remplacer la silhouette du véhicule par une berline électrique de proportions réalistes (style Tesla Model 3, sans reproduction d'actifs propriétaires), et non un pickup/Cybertruck. Contrôler position du conducteur, pivot des roues, empattement et caméras.
6. Appliquer Atkinson Hyperlegible Next et un thème clair, contrasté ; accents rouge italique gras uniquement sur les alertes pédagogiques.
7. Tester sur ordinateur/mobile avec Playwright + axe-core ; vérifier accessibilité clavier et scénarios de conduite.
8. Ajouter CI GitHub Actions après identification de la stack réelle ; ne pas inventer de scripts `npm test` avant extraction.

## Matrice d'acceptation
| ID | Test | Critère objectif |
|---|---|---|
| COH-01 | Cours-exercice-jeu | 100% des scénarios actifs possèdent lessonId, exerciseId et sceneId valides |
| COH-02 | Évaluation | Toute erreur notée référence une règle, une trace de télémétrie et un instant |
| COH-03 | Répétabilité | Une trace identique donne un résultat identique |
| COH-04 | Immobilité réglementaire | Le moteur ne devine pas d'infraction sur donnée absente ; état « non mesuré » |
| VIS-01 | Typographie | Atkinson chargée et repli explicite, taille corps >= 16 px |
| VIS-02 | Contraste | Texte normal >= 4.5:1, texte large >= 3:1 |
| VIS-03 | Thème | Toutes les pages claires, aucun panneau transparent illisible |
| CAR-01 | Silhouette | Berline 4 roues, habitacle, portes, pare-brise, phares, proportions cohérentes |
| CAR-02 | Simulation | Roues, pivot, direction, caméra et collisions alignés au véhicule |
| QA-01 | Test de bout en bout | 1 leçon -> 1 exercice -> 1 trajet -> 1 correction vérifiable |
| QA-02 | Vérification suisse | Chaque règle citée renvoie à une référence réglementaire vérifiable |

## Schéma de dossier proposé
```
src/
  curriculum/lessons/
  scenarios/
  simulation/vehicles/
  simulation/telemetry/
  assessment/
  ui/
tests/e2e/
.github/workflows/
```

## Sécurité du changement
Ne pas modifier ni supprimer l'archive originale. Aucun changement direct de `main`. Intégrer le code après extraction et tests sur une branche dédiée. Éviter une imitation non autorisée de marques : « Tesla-shape » signifie uniquement berline électrique à forme aérodynamique conventionnelle.
