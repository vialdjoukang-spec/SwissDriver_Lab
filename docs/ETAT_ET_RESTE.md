# État actuel et travaux restants — 14 octobre 2026

## Disponible (édition 0.5.0-preview.1)
- **Programme aligné sur le catalogue asa de juillet 2026** (en vigueur au 1er janvier 2027) : 6 parties, 27 chapitres. Les 8 chapitres ajoutés sont N24, N25, N26, N33, N43, N46, N47 et N48 ; 13 sous-chapitres complètent les chapitres existants. Chacun des 161 contenus d'examen est relié à au moins un cours (`content/programme-asa-2027.json`), ce que `tests/test_programme.py` vérifie.
- **Exercices style examen** pour chaque sous-chapitre : QCM à 3 ou 4 propositions, une ou plusieurs bonnes réponses, avec explication (vrai, pourquoi, piège, action, mémo) et lien vers le cours. L'examen asa officiel en compte 3 ; la 4e proposition sert d'entraînement plus exigeant.
- **Reconnaître les signaux** : 27 signaux suisses courants (dessins simplifiés, non officiels) présentés au bord d'une route, 4 significations proposées, retour sur la famille de forme et de couleur, lien vers le cours.
- **Aller-retour partout** : « Cours vus » (touche J) rouvre chaque fragment à la page quittée. Les boutons sous-chapitre précédent et suivant traversent tout le programme. « Retour » (Échap) ramène exactement à l'endroit précédent : route, programme, explication, exercice ou cours.
- **Schémas** des sous-chapitres affichés dans les cours (113 schémas embarqués).
- **Priorités (O11)** : 25 situations 3D. Le geste annoncé par une mauvaise réponse devient visible (klaxon, appel de phares, signe, décalage, recul, accélération) ; sinon la limite est signalée dans `docs/COHERENCE_PRIORITES.json`.

## Couverture réelle
Seul O11 possède des scènes 3D. Les 26 autres chapitres offrent cours, schémas éventuels et QCM, **sans simulation de conduite**. La couverture du programme est rédactionnelle : elle n'a été validée ni par l'asa ni par une personne compétente.

## Travaux restants
La feuille de route canonique est **docs/ROADMAP.json** (mise à jour du 16 octobre 2026, lisible par IA : tâches, dépendances, critères d'achèvement, statut). Elle remplace l'ancien tableau de cette section.

Objectif : parcourir les 27 chapitres et s'exercer sur chacun, par cinq mécanismes génériques branchés sur l'existant — M1 faute → conséquence (sanction encourue sourcée), M2 observer et désigner, M3 variable d'état, M4 inspection 2D, M5 examen blanc. La relecture experte (T01) et les sources officielles datées (T02) restent P0 et ne sont pas simplifiées. Décors 3D N26/O31, issue #6, autres navigateurs et Pages sont reportés (T95).

## Ce que les tests prouvent — et ne prouvent pas
Les suites structurelles, navigateur, scènes, parcours d'apprentissage, 75 branches, programme et distribution sont exigées avant chaque archive ; chaque rapport porte l'empreinte du HTML testé. Ces tests ne prouvent ni l'exactitude juridique, ni la fluidité, ni une compétence de conduite. Le projet n'est ni une auto-école homologuée ni un certificat de capacité.
