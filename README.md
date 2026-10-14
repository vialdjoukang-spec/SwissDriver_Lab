# SwissDriver Lab

Prototype de cours et de conduite, interface exclusivement claire. La version modernisée est développée dans la PR #2, sans modification du HTML d'origine.

## Utilisation

```sh
node scripts/build.cjs
```

Ouvrir `dist/SwissDriver_Lab.html` dans un navigateur compatible WebGL. Ce fichier autonome ne nécessite pas de serveur ; la police Atkinson est chargée à distance lorsque la connexion est disponible, avec repli Arial hors ligne.

Pour le lanceur modulaire : `python3 -m http.server 8000`, puis ouvrir `index.html` via ce serveur.

## Périmètre actuel

6 parties, 19 chapitres théoriques consultables. Le chapitre **Priorités** possède actuellement les scènes de conduite : 7 sous-chapitres et 25 situations décisionnelles. Les autres chapitres ne sont pas présentés comme jouables. Après un choix, certaines trajectoires sont assistées : le résultat n'est pas une certification de conduite manuelle.

## Tests

`python3 tests/test_swissdriver.py` vérifie l'intégrité du fichier original, construit le fichier autonome et contrôle les références entre cours, réponses et constructeurs de scènes. GitHub Actions exécute ensuite Chromium et conserve les résultats et captures dans l'artefact `swissdriver-build-and-evidence`.

Lire `docs/CONTINUATION_2026-10-14.md` pour les changements et limites. Les règles routières héritées restent à auditer auprès des sources suisses officielles. Ce prototype ne remplace ni un cours homologué ni l'apprentissage encadré sur route.
