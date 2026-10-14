# SwissDriver Lab — règles de contribution

Lire dans cet ordre : START_HERE.md, docs/ETAT_ET_RESTE.md, docs/EDITER.md.

## Source canonique
- `main` est la source publiée. Travailler sur une branche dédiée et ouvrir une PR. Ne pas fusionner sans autorisation du propriétaire.
- Ne pas écraser `Permis_GT_Rossa.html` : son SHA-256 est contrôlé. Les modules de `src/` sont les points d'extension.
- `dist/` et `release/` sont générés. Ne pas les modifier à la main.
- Ne pas réinjecter un ancien ZIP ou une ancienne version dans le moteur actuel.

## Interface et pédagogie
Thèmes clairs uniquement, texte sombre contrasté, Atkinson avec repli système. Fenêtres opaques. Alertes rouges grasses italiques. Pas de page unique interminable : une partie à la fois, chapitres dépliables. Conserver la berline, sans pickup. Une question ne masque jamais la scène utile.

Chaque ajout suit cours → règle identifiée → objets réels du terrain → décision → conséquence → explication → rejeu. Les cours et scènes doivent partager leurs identifiants. Signaler explicitement les chapitres sans simulation et les trajectoires assistées. Ne pas transformer un QCM en certificat de conduite manuelle.

## Validation minimale
```sh
python3 tests/test_swissdriver.py
python3 tests/test_evidence_gate.py
python3 tests/test_coherence_matrix.py
python3 -m pip install -r requirements-dev.txt
python3 -m playwright install chromium
python3 tests/browser_smoke.py
python3 tests/scene_coherence.py
python3 tests/decision_paths.py
python3 scripts/coherence_matrix.py   # après decision_paths ; committer docs/COHERENCE_PRIORITES.json si modifié
python3 scripts/package.py --require-browser-evidence
python3 tests/test_distribution.py
```
Le packaging strict refuse tout rapport navigateur, scène ou 75 branches absent, incomplet, en échec ou lié à un autre HTML (`scripts/evidence.py`). Ne pas retirer un test qui échoue pour obtenir un résultat vert. Conserver preuves et limites. Le rendu instrumenté ne remplace pas un benchmark en rendu continu ni le test de toutes les trajectoires.

## Publication
Incrémenter `package.json` avant une nouvelle release. Le workflow publie seulement depuis `main`, après tous les contrôles. Une release existante n'est pas écrasée. Aucun secret, sauvegarde personnelle ou fichier de police dans les archives. Ne pas inventer de licence pour les actifs historiques. Pages ne reconstruit rien : il déploie seulement l'édition d'un run qualité réussi sur le même commit de `main`. L'activation initiale de Pages relève des paramètres du dépôt ; ne pas annoncer un site en ligne sans l'avoir vérifié.
