# Lot 2 — observer la vraie scène avant de décider

Base : fusion de la PR #2, commit 1690cc95eb532921af6ffab57372c60ab3c4dd04.

## Corrections implémentées

| Défaut observé dans le code | Correction | Vérification prévue |
|---|---|---|
| `wave=true` sur l'agent, mais aucune lecture de ce drapeau | Animation des os du bras droit du personnage existant ; attente du modèle embarqué s'il n'est pas encore chargé | Variation réelle du quaternion et capture rapprochée |
| Décision à vitesse 0,06 : acteurs et voiture avançaient pendant la lecture | Horloge et déplacements à zéro pendant la question, geste de l'agent conservé comme animation visuelle | Comparaison position/horloge/abscisses des acteurs |
| Panneau de route principale sur une approche explicitement décrite comme secondaire dans p4 | Cédez le passage + plaque de direction ; libellé de la question aligné, réponse et trajectoire inchangées | Inspection des objets effectivement instanciés |
| Ligne de 5 m décalée de 1 m vers le bord | Recentrage et largeur 3,2 m dans la voie d'approche | Bornes des centres des éléments du marquage ; non une mesure des bords géométriques |
| Fenêtre de question recouvrant le terrain | Zone de rendu réservée à gauche sur bureau, au-dessus sur mobile | Mesure des rectangles réels du canvas et de la question |
| Cadrage pouvant conserver une ancienne position | Caméra calculée à partir des objets de la scène active | Captures de cinq situations |

Vue d'ensemble, vue conducteur et boutons de rapprochement pointent vers les véritables objets Three.js. Aucune scène illustrative parallèle n'est utilisée. Les identifiants, choix, scores et sauvegardes du moteur restent les mêmes.

## Validation

8 tests structurels exécutés localement avec succès avant publication. Le navigateur local refuse les navigations ; les contrôles Chromium sont donc confiés au workflow GitHub Actions. Consulter le résultat effectif et les captures de ce lot avant toute fusion. Ne pas reprendre le nombre de tests du lot précédent comme preuve de celui-ci.

## Limites

Le geste est une animation pédagogique, non une reproduction certifiée des gestes réglementaires. Le changement p4 corrige une contradiction interne ; il ne vaut pas audit juridique de tous les cours. Les marques, collisions, trajectoires complètes, giratoires et accès privés nécessitent encore des vérifications détaillées. Les autres 18 chapitres restent sans scènes 3D.

Références officielles à utiliser pour l'audit réglementaire :
- OFROU, inventaire des signaux : https://www.astra.admin.ch/fr/signaux (page consultée le 14.10.2026).
- OSR, notamment articles 36 et 65 : https://www.fedlex.admin.ch/eli/cc/1979/1961_1961_1961/fr (contenu complet non récupéré pendant ce lot ; ne pas qualifier ce lot de validation juridique).
