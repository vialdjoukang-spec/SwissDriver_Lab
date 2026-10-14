# État actuel et travaux restants — 14 octobre 2026

## Disponible
Le moteur, ses ressources embarquées, la berline, les cours consultables, le programme compact, l'interface exclusivement claire, les commandes tactiles et le mode observation sont dans main après les PR #2 et #3. L'édition de livraison ajoute un HTML autonome, les sources modifiables, les tests et preuves, les scripts de construction/publication, un inventaire calculé et un manifeste SHA-256.

## Couverture réelle
6 parties ; 19 chapitres ; 120 sous-chapitres ; 1 220 questions stockées. Un chapitre simulé : O11, 7 sous-chapitres, 25 situations. **18 chapitres et 113 sous-chapitres n'ont pas de scènes dédiées.** La présence d'un texte ou d'une question ne signifie pas sa validation éditoriale ni une simulation achevée.

| Code | Chapitre | Sous-chapitres | Simulation dédiée |
|---|---|---:|---|
| O11 | Priorités | 7 | 25 situations |
| O12 | Interdictions | 5 | À développer |
| O13 | Obligations et indications | 5 | À développer |
| O14 | Gestion du trafic | 8 | À développer |
| O21 | Conduite et dangers | 8 | À développer |
| O22 | Changement de direction | 6 | À développer |
| O23 | Avec les autres usagers de la route | 7 | À développer |
| O31 | Infrastructure | 6 | À développer |
| O32 | Conditions variables | 6 | À développer |
| O41 | Responsabilité | 6 | À développer |
| O42 | Usagers de la route plus vulnérables | 6 | À développer |
| O43 | Aspects administratifs du conducteur | 6 | À développer |
| O44 | Dispositions pénales | 5 | À développer |
| O45 | Assurances | 5 | À développer |
| O51 | Mesures de sécurité du véhicule | 10 | À développer |
| O52 | Passagers | 5 | À développer |
| O53 | Équipements, accessoires et chargement | 7 | À développer |
| O54 | Aspects administratifs du véhicule | 5 | À développer |
| U25 | Systèmes d’aide à la conduite et automatisation | 7 | À développer |

## Travaux, dans l'ordre de priorité
| Priorité | Travail restant | Critère d'achèvement |
|---|---|---|
| P0 | Vérifier toutes les décisions et trajectoires de Priorités | 25 situations × 3 choix = 75 branches testées jusqu'au résultat, avec objets, positions et explications cohérents ; pas seulement la construction des scènes. |
| P0 | Vérifier le contenu routier suisse | Chaque règle rattachée à une source officielle datée, contradictions corrigées, validation par une personne compétente. |
| P1 | Créer les exercices des 18 autres chapitres | Matrice cours → règle → exercice approprié → environnement → évaluation complète ; scènes 3D quand pertinentes, autres exercices interactifs sinon. |
| P1 | Évaluer la conduite réellement effectuée | Événements mesurés : arrêt, priorité, vitesse, trajectoire, collision et clignotant ; séparer trajectoires assistées et actions manuelles. |
| P1 | Renforcer réalisme et fluidité | Panneaux/marquages contrôlés, comportements crédibles, collisions testées ; mesures en rendu continu sur appareils cibles. |
| P1 | Extraire le contenu éditorial du monolithe | Chapitres, règles, vocabulaire et scénarios en fichiers séparés avec schémas et tests ; interfaces d'édition documentées. |
| P2 | Sauvegarde portable et accessibilité | Export/import validé, migration, contrôle clavier/focus/contraste et tests Firefox/Safari/Chrome sur ordinateur et mobile. |
| P2 | Documenter les actifs et déployer le site | Provenance des modèles/médias, licences vérifiées ; activation Pages et contrôle de l'URL réellement publiée. |

## Ce que les tests prouvent — et ne prouvent pas
Les lots fusionnés totalisent 8 tests structurels, 20 contrôles navigateur et 24 contrôles des scènes, réussis lors de leur vérification. La livraison relance ces suites et ajoute 6 contrôles de distribution. Les résultats effectifs et captures de chaque édition sont joints à sa release ; un résultat de test concerne le commit indiqué, pas toute modification future.

Les tests instrumentés utilisent des rendus ponctuels. Ils ne constituent pas un benchmark de fluidité. La construction des 25 scènes ne prouve pas l'exactitude de leurs 75 branches. L'agent et la ville restent pédagogiques, non des reproductions réglementaires ou géographiques certifiées. Le projet n'est ni une auto-école homologuée ni un certificat de capacité à conduire.
