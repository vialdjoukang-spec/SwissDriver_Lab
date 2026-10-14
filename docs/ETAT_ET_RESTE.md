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

## Travaux restants, par priorité
| Priorité | Travail | Critère d'achèvement |
|---|---|---|
| P0 | Relecture experte des contenus ajoutés | Faits juridiques signalés par les rédacteurs (gestes de police, plaques, retraits, montagne, recours) confirmés sur Fedlex ; corrections tracées. |
| P0 | Sources officielles datées par règle | Champ `regulatorySource` rempli dans la matrice O11, puis par sous-chapitre. |
| P1 | Scènes 3D au-delà d'O11 | Commencer par O12–O14 (signaux réels sur la route), puis O21–O23, O31–O32. |
| P1 | Approches manuelles mesurées (issue #6) | STOP, sortie de cour, ambulance au rouge depuis l'amont, contacts tracés. |
| P2 | Rendu continu, autres navigateurs, appareils réels | Mesures nommées ; Firefox/WebKit. |
| P2 | Pages | Activation par le propriétaire, puis déploiement d'un run vérifié et contrôle de l'URL. |

## Ce que les tests prouvent — et ne prouvent pas
Les suites structurelles, navigateur, scènes, parcours d'apprentissage, 75 branches, programme et distribution sont exigées avant chaque archive ; chaque rapport porte l'empreinte du HTML testé. Ces tests ne prouvent ni l'exactitude juridique, ni la fluidité, ni une compétence de conduite. Le projet n'est ni une auto-école homologuée ni un certificat de capacité.
