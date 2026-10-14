# Modifier et reconstruire l'édition

| Besoin | Fichier canonique |
|---|---|
| Police, couleurs, tailles, fenêtres et programme | `swissdriver-modern.css` |
| Répartition scène/question, interface d'observation | `src/scene-coherence.css` |
| Berline et raccord roues/direction/clignotants | `src/sedan.js` |
| Navigation des cours, progression et journal d'événements | `src/engine-bridge.js` |
| Caméras, gestes, panneaux et inspection des scènes | `src/scene-coherence.js` |
| Vérification des points d'insertion dans le moteur | `src/transform.js` |
| Chargement HTTP des modules | `src/launcher.js` et `index.html` |
| Construction du HTML autonome | `scripts/build.cjs` |
| Archive complète et inventaire calculé | `scripts/package.py` |
| Contrôle des preuves avant archive et Pages | `scripts/evidence.py` |
| Matrice de cohérence des 75 réponses | `scripts/coherence_matrix.py` → `docs/COHERENCE_PRIORITES.json` |
| Tests de structure, navigateur, scène, 75 branches, livraison | `tests/` |

## Boucle d'édition
1. Créer une branche depuis main.
2. Modifier le module concerné, puis `npm start` et recharger la page locale.
3. Exécuter `npm run build` pour reconstruire `dist/SwissDriver_Lab.html`.
4. Exécuter les tests (`npm test`, `npm run test:browser` qui inclut les 75 branches, puis `npm run coherence` et `npm run package`) et ouvrir une PR avec les résultats réels.

Le code du moteur, les cours historiques, les questions et les modèles embarqués sont encore dans `Permis_GT_Rossa.html`. Les données `window.DATA` et les scénarios `Uu` y sont empaquetés : **la séparation éditoriale de tous les cours en fichiers JSON indépendants n'est pas encore réalisée**. L'inventaire `release/curriculum-status.json` est généré à partir de cette source ; il ne la remplace pas. Ajouter un chapitre jouable exige un constructeur, les objets, les trajectoires, les décisions et des tests, pas seulement une ligne dans le programme.

## Outils nécessaires
Node.js >=20 pour construire/servir. Python >=3.10 pour les tests et le ZIP. Playwright est nécessaire uniquement aux tests navigateur ; installer `requirements-dev.txt`, puis `python3 -m playwright install chromium` (sur Linux, `--with-deps` peut être requis).
Sur Windows, `py -3 tests/test_swissdriver.py` peut remplacer `python3`.

## Sauvegarde
La progression utilise le stockage local du navigateur, clé historique `permisGT.v1`. Ne pas la publier dans le dépôt. Un changement d'origine (fichier local, serveur local, Pages) peut entraîner un espace de sauvegarde différent. Export/import de progression : à développer.

## GitHub Pages
Le workflow `SwissDriver Pages` est fourni avec déclenchement manuel. Dans Settings → Pages, choisir **GitHub Actions** comme source ; lancer ensuite ce workflow sur main en fournissant l'identifiant d'un run `SwissDriver quality` réussi (événement push) sur **le même commit**. Le workflow télécharge l'édition de ce run, vérifie commit, HTML, empreintes et les trois rapports, puis déploie ce HTML sans reconstruction ; il refuse tout autre run. Aucun token personnel n'est demandé. La première activation nécessite les droits de paramétrage du dépôt. Le téléchargement d'une release reste utilisable indépendamment de Pages.
Source officielle : https://docs.github.com/fr/enterprise-cloud@latest/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
