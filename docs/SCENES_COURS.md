# Scènes de cours simplifiées — format et règles

Une scène de cours place sur la route l’objet réel d’un sous-chapitre (panneau, marquage, feu, usager), demande une décision en trois choix, déroule la conséquence par une **trajectoire assistée**, explique l’erreur et permet le rejeu. Elle ne remplace ni une situation Priorités (O11) ni une évaluation de conduite manuelle.

Données : `content/road-lessons/<chapitre>.json` (tableau de scènes), listées dans `content/index.json` → `roadLessons`. Moteur : `src/road-lessons.js`. Dessins de panneaux : `src/signs.js` (`SIGNS` et `EXTRA`). Texte des cours : `node scripts/course_text.cjs O14/feux O31/rail`.

## Champs d’une scène
| Champ | Rôle |
|---|---|
| `id` | identifiant unique, jamais renommé (`s<chapitre>-<sujet>`) |
| `rule` | `chapitre/sous-chapitre` exact du cours illustré |
| `title`, `scene` | titre court ; description de ce que voit le conducteur (`**gras**` permis) |
| `props` | objets placés sur la route (voir plus bas) |
| `choices` | exactement 3 : `t` (texte), `act`, `did` (obligatoire pour chaque mauvais choix), options `kmh`, `lat`, `stopDz`, `blink` (`L`/`R`), `then: "wait"` |
| `ok` | index (0 à 2) du bon choix ; varier sa position d’une scène à l’autre |
| `should`, `why`, `memo` | ce qu’il fallait faire, pourquoi (tiré du cours), mémo court |
| `endDz` | fin de la scène (défaut −30) |

## Repère
La scène est centrée sur un point L au milieu d’un pâté de maisons ; la voiture arrive depuis +z et roule vers −z. `dz` = distance **avant** L (positif = devant la voiture au moment de la décision, négatif = après L). La décision est prise à `dz = +18`. Les carrefours sont à `dz = ±40` : ne rien placer au-delà de +38 / −38.

Axe latéral `x` (mètres) : voie inverse −3,1 à 0 (centre −1,5) ; **notre voie 0 à 3,1 (centre 1,5)** ; bande 3,1 à 5 (stationnement, bande cyclable ou seconde voie dessinée) ; trottoir au-delà de 5 ; panneaux à `x = 5.6` (droite) ou `−5.6` (gauche).

## Objets (`props`)
| `kind` | Champs |
|---|---|
| `sign` | `id` (dessin de `signs.js`), `x`, `dz`, `plates` (textes), `height` |
| `line` | `style` `solid`/`dashed`, `color` `white`/`yellow`/`orange`/`blue`, `x`, `x2`, `from`, `to`, `width` (ligne d’arrêt : `from = to`, `width 0.5`) |
| `crosswalk` | `dz`, `from`, `to` (bandes jaunes) |
| `bay` | case : `x`, `dz`, `len`, `w`, `color`, `symbol` `bolt`/`bike` |
| `symbol` | `id` `bike`/`bolt` peint au sol |
| `arrow` | flèche au sol : `x`, `dz`, `dir` `straight`/`left`/`right`/`straight-left`/`straight-right` |
| `cones`, `barrier`, `island` | balisage, barrière de chantier, îlot |
| `car` | véhicule immobile : `x`, `dz`, `body` `car`/`van`/`truck`/`ambulance`, `paint`, `facing` `oncoming` |
| `vehicle` | véhicule en mouvement : `body`, `x`, `dz`, `toX`, `toDz`, `kmh`, `start` |
| `leadCar` | voiture lente devant soi (`kmh`) |
| `ped`, `bike` | piéton (`child`), cycliste : `x`, `dz`, `toX`, `toDz`, `kmh`, `start` |
| `light` | feu : `x`, `dz`, `state` `red`/`amber`/`green`/`flash`/`off` |
| `overhead` | portique de voies : `dz`, `x`, `width`, `lanes` [{`x`, `signal` `green`/`cross`/`yellowLeft`/`yellowRight`}] |
| `agent` | agent en gilet : `x`, `dz`, `facing` `front` (arrêt) / `side` (passage) |
| `rail` | passage à niveau : `dz`, `lights` (feux rouges clignotants) |

`start` d’un usager mobile : `always` (bouge dès le départ), `resolve` (après le choix), `good` (seulement après le bon choix, par exemple un piéton qui traverse).

## Actions (`act`)
`go` (continuer, 25 km/h par défaut), `stop` (s’arrêter à `stopDz`, défaut +8), `park` (se ranger à droite, `lat` 2,4), `detour` (décalage latéral `lat`, 15 km/h), `overtake` (dépasser à gauche, `lat` −3), `honk` (klaxon puis continuer). `kmh`, `lat`, `stopDz`, `blink` affinent le mouvement.

Un mauvais choix se déroule jusqu’à l’arrêt ou pendant 3,4 s, puis l’explication s’affiche. Un bon choix va jusqu’à `endDz` ; après un arrêt, la voiture repart quand le piéton libéré a traversé. Avec `then: "wait"` (bon choix = rester arrêté : sortie bloquée, agent, rails), la scène se termine à l’arrêt puis la voiture est replacée après la scène, en fondu.

## Règles de rédaction
1. Le bon choix, `should` et `why` viennent du texte du cours du sous-chapitre ; aucune règle absente du cours.
2. Chaque mauvais choix est plausible (erreur fréquente, piège du cours) et possède un `did` qui décrit le geste fait.
3. La trajectoire du bon choix ne traverse aucun objet ; un mauvais choix qui mènerait à un contact s’arrête avant (`stopDz`).
4. Une scène ne cache rien d’utile : panneau à droite entre `dz +2` et `+12`, usager visible depuis `dz +18`.
5. Typographie française : apostrophe `’`, guillemets « », espaces avant `: ; ? !` comme dans les cours.
6. Les sous-chapitres purement administratifs, juridiques ou statistiques restent des cours seuls : ne pas inventer de scène de route pour eux.
