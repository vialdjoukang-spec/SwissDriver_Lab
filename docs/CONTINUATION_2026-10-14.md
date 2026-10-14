# SwissDriver Lab — continuation du 14 octobre 2026

## Périmètre réel
Le fichier source contient 6 parties, 19 chapitres et 1 220 questions. Le moteur de conduite n'active que O11 (Priorités) : 7 sous-chapitres et 25 situations. Les questions de la banque ne sont pas toutes des exercices jouables. Aucune certification juridique, géographique ou pédagogique intégrale n'est revendiquée.

## Livraison
- Berline aérodynamique dédiée au joueur, sans benne, échappements ni emblème de constructeur. Quatre roues animées, deux roues directrices, quatre clignotants et empattement cohérent avec la cinématique (2,8 m de conception).
- Thème exclusivement clair, panneaux opaques, Atkinson Hyperlegible Next, alertes rouges grasses italiques, commandes tactiles et navigation compacte.
- Programme par partie et chapitres dépliables. Les 19 chapitres sont consultables en lecture ; les scènes indisponibles restent clairement signalées, sans déverrouillage fictif.
- Entrée avance d'une page, puis ferme le cours à la dernière page.
- Retour cours → explication → rejeu restauré, y compris après un feu rouge hors scénario.
- Horloge et déplacements de simulation suspendus pendant le cours et le programme.
- Contrat cours/scénarios tiré des objets du moteur. Journal borné à 200 événements de décision et de résultat, consultable par `SwissDriverLab.events()`. Il ne présente pas une trajectoire assistée comme une évaluation de conduite manuelle.

## Architecture
`Permis_GT_Rossa.html` reste strictement inchangé, SHA-256 `58ec2197dd14b8e8895cb83d134a2b598213b7f3d03b221fbf39f8e74258335a`.
`src/transform.js` applique des transformations dont les ancrages sont vérifiés ; il refuse une source incompatible ou une double application. `src/sedan.js` et `src/engine-bridge.js` restent lisibles et séparés. Le remplacement ciblé du code minifié est une étape de migration, pas une architecture définitive.

## Ouvrir et tester
```sh
node scripts/build.cjs
python3 tests/test_swissdriver.py
python3 -m http.server 8000
```
Ouvrir `index.html` par HTTP ou le fichier autonome `dist/SwissDriver_Lab.html`. Les styles sont intégrés avant le démarrage, sans flash de l'ancienne interface. Le fichier autonome embarque le moteur et les ressources d'origine ; Atkinson est demandée à Google Fonts et nécessite une connexion. Un repli Arial reste disponible hors ligne. Aucun fichier de police n'est distribué.

Les tests Chromium sont exécutés dans GitHub Actions, avec captures bureau/mobile et résultats JSON. Les 8 tests structurels ont réussi localement avant publication. Se référer au résultat effectif du workflow pour les tests navigateur : une compilation réussie ne constitue pas une validation visuelle ou dynamique.

## Limites restantes
- 18 chapitres sans scènes 3D ; ne pas les annoncer comme jouables.
- Vérification juridique détaillée des cours à mener à partir des sources suisses officielles.
- Les tests de construction des 25 scènes ne remplacent pas le contrôle de chaque trajectoire complète, de chaque option et du placement de chaque panneau.
- Personnages, trafic ambiant, collisions et géographie restent en partie ceux du moteur historique.
- Pas de fusion de cette branche vers main et pas d'activation de GitHub Pages dans ce lot.
