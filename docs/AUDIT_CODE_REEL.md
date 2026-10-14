# Audit technique SwissDriver Lab — 14.10.2026
Le HTML source a été récupéré à partir du blob GitHub `40892cb1d804a419e74be92c548f8914356f5d18` : environ 5,46 Mo / 4021 lignes. Application monolithique avec Three.js, données cours/scénarios dans window.DATA, scènes et géométries Three.js, sauvegarde localStorage sous clé permisGT.v1.

## Intégration livrée
`index.html` sert de lanceur sans altérer `Permis_GT_Rossa.html`. Une CSS externe est injectée dans l'iframe à l'événement load. Cette solution nécessite le même domaine (compatible GitHub Pages) et un serveur HTTP pour fetch ; son efficacité doit être vérifiée dans le navigateur. Atkinson Hyperlegible Next est chargée via Google Fonts avec repli système ; connexion nécessaire pour cette police précise.

## Limites explicitement non résolues
- La berline actuelle est une géométrie primitive d'environ 4,3 m (carBody Yt(1.8,.66,4.3,4,.22), toit/cabine et quatre roues). Véhicule joueur et circulation doivent être différenciés avant modification ciblée. Aucune conversion « Tesla-shape » effectuée dans cette PR.
- L'association de chacun des cours, décisions, évaluations et situations affichées reste à auditer avec des tests instrumentés.
- L'environnement 3D n'a pas été testé en navigateur.
- Aucune affirmation de conformité intégrale au droit routier suisse sans vérification documentaire.

## Critères d'acceptation
1. Simulateur initial se charge sans erreur console, avec navigation/clavier fonctionnels.
2. Police Atkinson, texte minimum 16px et fenêtres de premier plan opaques dans tous les modules.
3. Chaque exercice renvoie au même identifiant de règle et événement que son cours et sa scène.
4. Télémétrie des comportements mesurés et restitution des erreurs fondées sur ces événements.
5. Modèle du joueur : berline aérodynamique non pickup, roues et collisions cohérentes.
6. Régression mobile/desktop et test du parcours complet avant fusion.

## Usage
Ouvrir `index.html` sous GitHub Pages ou serveur local. Conserver `Permis_GT_Rossa.html` comme version témoin. Ne pas fusionner sans contrôle du lanceur et du jeu.
