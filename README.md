# SwissDriver Lab

**Édition modifiable 0.4.0-preview.1** — interface claire, berline et observation 3D. Prototype pédagogique en développement, non certifié.

## Ouvrir la version actuelle
[Édition et téléchargements](https://github.com/vialdjoukang-spec/SwissDriver_Lab/releases/tag/v0.4.0-preview.1) · [Guide de démarrage](START_HERE.md) · [Ce qui reste](docs/ETAT_ET_RESTE.md) · [Modifier les sources](docs/EDITER.md)

Dans la release, télécharger **SwissDriver_Lab_Edition.zip**, l'extraire puis ouvrir **dist/SwissDriver_Lab.html**. Le ZIP comprend le jeu prêt à ouvrir, les sources, les tests et les preuves. Le HTML seul est également fourni. Les archives automatiques « Source code » de GitHub contiennent les sources mais pas le fichier construit : exécuter alors `npm run build`.

## Éditer
```sh
npm run build
npm start
```
Node.js >=20 suffit pour ces deux commandes, sans dépendances npm à installer. Python et Playwright servent aux tests, non à l'utilisation du jeu. Lire [AGENTS.md](AGENTS.md) pour une reprise dans Codex ou Claude.

## Périmètre exact
6 parties, 19 chapitres, 120 sous-chapitres et 1 220 questions dans les données historiques. **Priorités** est le seul chapitre équipé de scènes de conduite : 7 sous-chapitres, 25 situations. Les 18 autres chapitres sont consultables, sans simulation dédiée. La banque de questions n'est pas présentée comme 1 220 exercices 3D.

Les données détaillées, leurs décomptes et les contrôles d'intégrité sont recalculés dans `curriculum-status.json` et `edition-manifest.json` à chaque livraison. La réussite des tests ne garantit ni toutes les trajectoires ni la conformité juridique intégrale.

## Publication et traçabilité
Le workflow **SwissDriver quality** vérifie la structure, Chromium, les scènes et l'archive. Depuis main seulement, il publie une release de la version déclarée dans `package.json`. Une release existante n'est pas écrasée. Les preuves sont aussi archivées dans GitHub Actions.

Le workflow **SwissDriver Pages** est prêt ; son activation initiale reste un réglage séparé dans Settings → Pages → GitHub Actions. Une release disponible n'implique pas que Pages soit activé.

`Permis_GT_Rossa.html` reste la référence historique, SHA-256 `58ec2197dd14b8e8895cb83d134a2b598213b7f3d03b221fbf39f8e74258335a`. Ne pas le remplacer par un ancien ZIP. Les documents d'audit antérieurs décrivent leur étape de développement ; [ETAT_ET_RESTE.md](docs/ETAT_ET_RESTE.md) est le point d'entrée de l'état actuel.

[Historique](CHANGELOG.md) · [Composants et provenance](THIRD_PARTY_NOTICES.md)
