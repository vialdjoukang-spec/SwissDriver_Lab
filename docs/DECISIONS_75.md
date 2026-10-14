# Audit des 75 branches de Priorités

Base : édition publique `029b5d5`, maintenue intacte pendant les essais.

## Méthode
25 situations, chacune exécutée avec ses 3 choix dans Chromium. Le test prépare le point de décision, puis laisse le moteur effectuer la trajectoire jusqu'à la réussite ou à l'explication d'erreur. Aucune position, réponse terminale ou progression n'est imposée après le choix. Les erreurs sont suivies d'un rejeu via le bouton réel.

L'horloge de Playwright déclenche chaque callback à une cadence de test de 50 ms, dans la limite de 50 ms déjà utilisée par le moteur. `DECISION_FRAME_MS=16` permet une seconde résolution temporelle. Il ne s'agit pas d'une mesure de fluidité. Le rapport est écrit après chaque branche, y compris en cas d'échec.

## Correction ciblée t3
Le moteur historique réaccélérait après le passage de l'ambulance même lorsque le feu de la scène restait rouge. Le module `src/decision-safety.js` réserve un arrêt en tenant compte de l'avant de la berline, maintient l'arrêt au rouge et ne reprend qu'après le dégagement de l'ambulance, du carrefour et le passage au vert. L'intervalle tous-rouges est un choix de simulation, non un minutage réglementaire. L'objectif de fin de trajectoire n'est pas raccourci.

Le test vérifie aussi la marge devant la ligne rouge et l'absence de verts simultanés sur les deux directions conflictuelles.

## Statut
En validation sur la PR #5. Ne pas annoncer 75 réussites avant lecture du rapport effectif `test-results/decision-paths-results.json`.

## Limites
Le test vérifie le contrat de réponses déjà stocké, pas son exactitude juridique. Il ne couvre pas l'approche manuelle complète, la fidélité de chaque animation de mauvaise réponse, tous les espaces de collision, l'exactitude visuelle exhaustive ni les appareils/navigateurs autres que Chromium. Certaines alternatives utilisent encore une animation générique : ce point reste distinct des issues terminales testées.
