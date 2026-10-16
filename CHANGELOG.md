# Historique

## Non publié — route simplifiée du programme et scènes de cours
- **14 scènes de cours simplifiées sur la route** (`content/road-lessons/`, `src/road-lessons.js`) pour les panneaux et marquages : O12 (5 sous-chapitres), O13 (direction, indications, familles de signaux, stationnement, combinaisons), O14 (marquages, passages piétons, bandes cyclables, zones). Chaque scène suit cours → règle → objets réels (panneau, plaque, ligne, case, passage, cônes, îlot, piéton, cycliste, voiture lente) → décision en 3 choix → conséquence assistée → explication → rejeu. Identifiants partagés avec les cours ; fusion validée et fermée sur erreur par `src/curriculum.js`.
- Les scènes ne touchent ni aux 25 situations Priorités, ni à l’XP, ni aux erreurs de `permisGT.v1` ; leurs résultats vont dans `swissdriver.roadLessons.v1`. Elles sont signalées « Scène simplifiée · trajectoire assistée ».
- Tests : `tests/test_road_lessons.py` (structure, dessins, refus des données invalides) et `tests/road_lessons.py` (42 branches : issue, rejeu, piéton protégé, distance au véhicule lent et à la cycliste). Le packaging strict exige désormais ce rapport.
- Les 27 chapitres se suivent sur la route : chaque chapitre et sous-chapitre possède son portique de cours, dans l'ordre du programme. Les chapitres sans scène 3D ne reçoivent ni situation, ni fin de sous-chapitre, ni XP : rien n'est validé en passant un portique.
- HUD et message « Cours seul · simulation non disponible » ; programme : badge « Portiques de cours · sans simulation » et bouton « Aller au portique » (libre accès, aucune situation O11 n'est validée par le saut).
- Moteur : trois ancrages vérifiés dans `src/transform.js` (3.1.0) ; O11 conserve exactement ses positions et ses 25 situations. Sauvegarde `permisGT.v1` inchangée.

## 0.5.0-preview.1 — 14 octobre 2026
- Programme aligné sur le catalogue asa de juillet 2026 (en vigueur au 1er janvier 2027) : 8 chapitres nouveaux (N24, N25, N26, N33, N43, N46, N47, N48) et 13 sous-chapitres complémentaires ; les 161 contenus d'examen sont reliés à un cours (`content/programme-asa-2027.json`, `tests/test_programme.py`).
- Exercices style examen pour chaque sous-chapitre : 1 543 QCM, dont 928 à 4 propositions ; reconnaissance de 27 signaux avec 4 significations proposées.
- Navigation : « Cours vus » (J), sous-chapitre précédent et suivant, retour exact (Échap) ; schémas des sous-chapitres affichés.
- Priorités : geste annoncé rendu visible pour les mauvaises réponses (klaxon, appel de phares, décalage, recul, accélération), légende « Votre action ».
- Contenu versionné dans `content/`, fusionné par `src/curriculum.js` dans le HTML autonome et le lanceur HTTP ; inventaire calculé sur les données réellement utilisées.

## 0.4.0-preview.1 — 14 octobre 2026
Inclut la PR #5 (75 branches de Priorités, arrêt t3 au rouge) et la PR #7 ci-dessous.

### PR #7 — relais (issue #6)
Verrou des preuves : le packaging strict et Pages exigent les rapports navigateur, scène et 75 branches complets, réussis et liés à l'empreinte du HTML livré. Pages déploie seulement l'édition d'un run qualité réussi du même commit. Matrice `docs/COHERENCE_PRIORITES.json` initialisée (75 lignes, aucune déclarée cohérente). Aucun changement du simulateur ; HTML autonome identique (`b72d5d25…`).

## 0.3.0-preview.1 — 14 octobre 2026
Édition reproductible et modifiable : fichier autonome, ZIP avec sources et preuves, manifeste SHA-256, inventaire calculé des chapitres, serveur local, guide d'édition et consignes de reprise. Publication de release conditionnée aux tests. Workflow Pages prêt à déclencher après configuration. Aucune nouvelle scène ni nouvelle règle routière ajoutée dans ce lot.

## PR #3 — fusion fd1d9a2
Mode observation, séparation canvas/question, agent animé, corrections de signalisation p4 et caméra. 52 contrôles réussis sur le code de ce lot.

## PR #2 — fusion 1690cc9
Berline, thème clair Atkinson, programme compact, retours cours/explication/rejeu et commandes tactiles. 28 contrôles réussis sur le code de ce lot.
