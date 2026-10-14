# Lot 2 — observer la vraie scène avant de décider

Base : fusion de la PR #2, commit 1690cc95eb532921af6ffab57372c60ab3c4dd04.

## Corrections implémentées

| Défaut observé dans le code | Correction | Vérification |
|---|---|---|
| `wave=true` sur l'agent, mais aucune lecture de ce drapeau | Animation des os du bras droit du personnage existant ; bras gauche au repos, orientation vers le conducteur | Variation réelle du quaternion et capture rapprochée |
| Décision à vitesse 0,06 : acteurs et voiture avançaient pendant la lecture | Horloge et déplacements à zéro pendant la question, geste de l'agent conservé comme animation visuelle | Comparaison position/horloge/abscisses des acteurs |
| Panneau de route principale sur une approche explicitement décrite comme secondaire dans p4 | Cédez le passage + plaque de direction ; libellé aligné, réponse et trajectoire inchangées | Inspection des objets effectivement instanciés |
| Ligne de 5 m décalée de 1 m vers le bord | Recentrage et largeur nominale 3 m | Boîtes géométriques complètes transformées en coordonnées du monde |
| Question recouvrant le terrain | Canvas réservé à gauche sur bureau, au-dessus sur mobile | Rectangles réels du canvas et de la question |
| Caméra latérale placée dans un bâtiment lors du premier essai | Vue d'ensemble centrée au-dessus de l'avenue | Position et captures |
| Visibilité carrosserie réinitialisée à chaque frame | État de la vue conducteur raccordé à la règle centrale de visibilité | Contrôle après plusieurs frames |

Les boutons pointent vers les véritables objets Three.js, y compris le feu de la voie. Aucune scène illustrative parallèle. Les identifiants, choix, scores et sauvegardes restent ceux du moteur.

## Validation

8 tests structurels réussis localement. Sur le premier essai GitHub, les 20 contrôles navigateur hérités ont réussi ; les nouveaux tests ont détecté un défaut de visibilité de la carrosserie. L'examen de la capture d'ensemble a également montré une caméra dans un bâtiment. Ces défauts ont été corrigés ; consulter le résultat du dernier workflow et ses captures avant de considérer le lot validé. Le navigateur local refuse les navigations, donc aucune validation visuelle locale n'est revendiquée.

## Limites

Geste et tenue pédagogiques, non reproductions certifiées de la police suisse. p4 corrige une contradiction interne, sans constituer un audit juridique du programme. Marques réglementaires exactes, collisions, trajectoires complètes, giratoires et accès privés restent à vérifier. Les autres 18 chapitres restent sans scènes 3D.

Références officielles pour l'audit réglementaire :
- OFROU : https://www.astra.admin.ch/fr/signaux (page consultée le 14.10.2026).
- OSR, notamment articles 36 et 65 : https://www.fedlex.admin.ch/eli/cc/1979/1961_1961_1961/fr (contenu complet non récupéré pendant ce lot ; pas de validation juridique revendiquée).
