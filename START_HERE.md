# Commencer ici — SwissDriver Lab

## Utiliser le jeu sans installer d'outil
Télécharger **SwissDriver_Lab_Edition.zip** dans la release `v0.5.0-preview.1`, extraire le ZIP, puis ouvrir **dist/SwissDriver_Lab.html**. Sous Windows, **LANCER_WINDOWS.cmd** ouvre ce même fichier. Le fichier HTML seul est également joint à la release.

Ne pas ouvrir `index.html` en double-cliquant : c'est le lanceur des sources, prévu pour HTTP. La version autonome fonctionne hors ligne avec une police de repli ; Atkinson est demandée à Google Fonts lorsqu'une connexion est disponible.

## Modifier le projet
Node.js 20 ou supérieur permet de construire et de lancer les sources, sans `npm install` :
```sh
npm run build
npm start
```
Ouvrir l'adresse locale affichée par le serveur. Après une modification, recharger le navigateur ; reconstruire le fichier autonome avec `npm run build`.

Voir **docs/EDITER.md** pour les fichiers à modifier et **docs/ETAT_ET_RESTE.md** pour le périmètre et les travaux restants. **AGENTS.md** fixe les règles de reprise pour Codex et Claude.

## Ce que contient cette édition
Le moteur 3D et les ressources embarquées, les modules modifiables, l'interface claire, la berline, le mode observation, les tests, les captures, un inventaire du programme et un manifeste de contrôle. Les deux anciens ZIP Rossa restent dans l'historique du dépôt ; ils ne sont pas nécessaires au fonctionnement de cette édition.

**Édition complète à reprendre et à exécuter ne signifie pas programme de conduite achevé.** Priorités dispose de 25 situations. Les 26 autres chapitres apparaissent sur la route comme portiques de cours seuls (sans simulation) et restent à relier à des scènes.
