/* Simplified vector drawings of common Swiss road signals (OSR families) and
 * a roadside context. Pedagogical representations, not official artwork. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SwissDriverSigns=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const RED='#c8102e',BLUE='#0b4ea2',YEL='#f6c400',GREEN='#00764b',INK='#111';
  const tri=(inner)=>`<path d="M50 6 L95 88 H5 Z" fill="${RED}"/><path d="M50 22 L82 80 H18 Z" fill="#fff"/><g transform="translate(0 6)">${inner}</g>`;
  const ring=(inner,bg='#fff')=>`<circle cx="50" cy="50" r="46" fill="${RED}"/><circle cx="50" cy="50" r="36" fill="${bg}"/>${inner}`;
  const disc=(inner)=>`<circle cx="50" cy="50" r="46" fill="${BLUE}"/>${inner}`;
  const square=(inner,bg=BLUE)=>`<rect x="6" y="6" width="88" height="88" rx="8" fill="${bg}"/>${inner}`;
  const walker=(x,y,s,c=INK)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" stroke="${c}" stroke-width="3" stroke-linecap="round"><circle cx="0" cy="-14" r="4" stroke="none"/><path d="M0 -9 L-2 4 M-2 4 L-7 16 M-2 4 L5 15 M-1 -6 L-8 2 M-1 -6 L7 0" fill="none"/></g>`;
  const car=(x,y,c)=>`<g transform="translate(${x} ${y})"><rect x="-8" y="-16" width="16" height="30" rx="5" fill="${c}"/><rect x="-6" y="-11" width="12" height="7" rx="2" fill="#fff"/></g>`;
  const bike=(c)=>`<g fill="none" stroke="${c}" stroke-width="4"><circle cx="32" cy="60" r="11"/><circle cx="68" cy="60" r="11"/><path d="M32 60 L45 40 L60 40 L68 60 M45 40 L52 60 L60 40 M42 34 H50"/></g>`;
  const arrow=(d,c='#fff')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="9" stroke-linejoin="round"/>`;
  const SIGNS=[
    {id:'danger-pietons',family:'danger',name:'Passage pour piétons (annonce)',meaning:'Danger : un passage pour piétons se trouve plus loin',rule:'O13/familles-signaux',svg:tri(`<path d="M30 76 H70" stroke="${INK}" stroke-width="3"/>${walker(50,60,1.4)}`)},
    {id:'danger-enfants',family:'danger',name:'Enfants',meaning:'Danger : enfants pouvant surgir sur la chaussée',rule:'O42/enfants',svg:tri(`${walker(42,62,1.1)}${walker(58,64,.9)}`)},
    {id:'danger-glissant',family:'danger',name:'Chaussée glissante',meaning:'Danger : chaussée glissante, adhérence réduite',rule:'O32/chaussee',svg:tri(`${car(50,52,INK)}<path d="M36 74 q6 -8 12 0 M54 74 q6 -8 12 0" stroke="${INK}" stroke-width="3" fill="none"/>`)},
    {id:'danger-travaux',family:'danger',name:'Travaux',meaning:'Danger : chantier sur ou au bord de la chaussée',rule:'O32/chantiers',svg:tri(`<path d="M34 76 H66 M44 76 L50 60 M50 52 L58 62 L66 58" stroke="${INK}" stroke-width="4" fill="none"/><circle cx="48" cy="46" r="4" fill="${INK}"/>`)},
    {id:'danger-intersection',family:'danger',name:'Intersection (priorité de droite)',meaning:'Danger : intersection où la priorité de droite s’applique',rule:'O11/intersections',svg:tri(`<path d="M50 40 V80 M34 62 H66" stroke="${INK}" stroke-width="8"/>`)},
    {id:'danger-feux',family:'danger',name:'Signaux lumineux',meaning:'Danger : feux de circulation plus loin',rule:'O14/feux',svg:tri(`<rect x="42" y="38" width="16" height="40" rx="4" fill="${INK}"/><circle cx="50" cy="46" r="4" fill="${RED}"/><circle cx="50" cy="58" r="4" fill="${YEL}"/><circle cx="50" cy="70" r="4" fill="#2bb24c"/>`)},
    {id:'interdit-circulation',family:'prescription',name:'Circulation interdite',meaning:'Interdit à tous les véhicules, dans les deux sens',rule:'O12/circuler',svg:ring('')},
    {id:'interdit-acces',family:'prescription',name:'Accès interdit',meaning:'Interdit d’entrer pour les véhicules dans ce sens',rule:'O12/circuler',svg:`<circle cx="50" cy="50" r="46" fill="${RED}"/><rect x="18" y="42" width="64" height="16" fill="#fff"/>`},
    {id:'vitesse-50',family:'prescription',name:'Vitesse maximale 50',meaning:'Ne pas dépasser 50 km/h à partir de ce signal',rule:'O21/vitesse',svg:ring(`<text x="50" y="63" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="36" fill="${INK}">50</text>`)},
    {id:'interdit-depasser',family:'prescription',name:'Interdiction de dépasser',meaning:'Interdit de dépasser les véhicules automobiles (sauf deux-roues sans side-car)',rule:'O23/depasser',svg:ring(`${car(38,52,RED)}${car(62,52,INK)}`)},
    {id:'interdit-gauche',family:'prescription',name:'Interdiction de tourner à gauche',meaning:'Interdit de tourner à gauche à la prochaine intersection',rule:'O12/circuler',svg:ring(`${arrow('M58 74 V44 H38',INK)}<path d="M38 34 L26 44 L38 54 Z" fill="${INK}"/><path d="M26 26 L74 74" stroke="${RED}" stroke-width="7"/>`)},
    {id:'interdit-arret',family:'prescription',name:'Interdiction de s’arrêter',meaning:'Interdit de s’arrêter, même brièvement, du côté du signal',rule:'O12/arret',svg:ring(`<path d="M26 26 L74 74 M74 26 L26 74" stroke="${RED}" stroke-width="8"/>`,BLUE)},
    {id:'interdit-parquer',family:'prescription',name:'Interdiction de parquer',meaning:'Interdit de stationner ; l’arrêt bref pour charger ou débarquer reste possible',rule:'O12/stationner',svg:ring(`<path d="M26 26 L74 74" stroke="${RED}" stroke-width="8"/>`,BLUE)},
    {id:'fin-vitesse',family:'prescription',name:'Fin de la vitesse maximale 50',meaning:'La limitation à 50 km/h signalée prend fin',rule:'O21/vitesse',svg:`<circle cx="50" cy="50" r="46" fill="#fff" stroke="#777" stroke-width="3"/><text x="50" y="63" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="36" fill="#777">50</text><path d="M22 78 L78 22" stroke="${INK}" stroke-width="6"/>`},
    {id:'oblig-droite',family:'obligation',name:'Direction obligatoire à droite',meaning:'Obligation de tourner à droite',rule:'O13/direction',svg:disc(`${arrow('M40 76 V48 H64')}<path d="M62 36 L78 48 L62 60 Z" fill="#fff"/>`)},
    {id:'oblig-contourner',family:'obligation',name:'Obstacle à contourner par la droite',meaning:'Passer à droite de l’obstacle ou de l’îlot',rule:'O13/direction',svg:disc(`${arrow('M34 34 L62 62')}<path d="M70 70 L50 68 L68 50 Z" fill="#fff"/>`)},
    {id:'oblig-cycles',family:'obligation',name:'Piste cyclable',meaning:'Voie réservée aux cycles, que les cyclistes doivent emprunter',rule:'O14/cycles',svg:disc(bike('#fff'))},
    {id:'oblig-pietons',family:'obligation',name:'Chemin pour piétons',meaning:'Chemin réservé aux piétons',rule:'O14/zones',svg:disc(walker(50,58,1.9,'#fff'))},
    {id:'prio-stop',family:'priorite',name:'Stop',meaning:'Arrêt complet obligatoire à la ligne, puis céder le passage',rule:'O11/routes',svg:`<path d="M31 5 H69 L95 31 V69 L69 95 H31 L5 69 V31 Z" fill="${RED}" stroke="#fff" stroke-width="4"/><text x="50" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="28" fill="#fff">STOP</text>`},
    {id:'prio-ceder',family:'priorite',name:'Cédez le passage',meaning:'Céder le passage aux usagers de la route prioritaire',rule:'O11/routes',svg:`<path d="M5 10 H95 L50 92 Z" fill="${RED}"/><path d="M22 20 H78 L50 72 Z" fill="#fff"/>`},
    {id:'prio-principale',family:'priorite',name:'Route principale',meaning:'Vous circulez sur une route principale : priorité aux intersections',rule:'O11/routes',svg:`<path d="M50 4 L96 50 L50 96 L4 50 Z" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M50 18 L82 50 L50 82 L18 50 Z" fill="${YEL}"/>`},
    {id:'prio-fin-principale',family:'priorite',name:'Fin de la route principale',meaning:'La route principale prend fin : les règles générales s’appliquent à nouveau',rule:'O11/routes',svg:`<path d="M50 4 L96 50 L50 96 L4 50 Z" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M50 18 L82 50 L50 82 L18 50 Z" fill="${YEL}"/><path d="M28 72 L72 28" stroke="${INK}" stroke-width="7"/>`},
    {id:'ind-parking',family:'indication',name:'Parking',meaning:'Place de stationnement autorisée',rule:'O13/parking',svg:square(`<text x="50" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="64" fill="#fff">P</text>`)},
    {id:'ind-impasse',family:'indication',name:'Impasse',meaning:'Route sans issue pour les véhicules',rule:'O13/indications',svg:square(`<rect x="44" y="40" width="12" height="44" fill="#fff"/><rect x="26" y="20" width="48" height="16" fill="${RED}"/>`)},
    {id:'ind-pietons',family:'indication',name:'Emplacement d’un passage pour piétons',meaning:'Le passage pour piétons se trouve ici',rule:'O14/pietons',svg:square(`<path d="M50 16 L86 82 H14 Z" fill="#fff"/>${walker(50,66,1.4)}`)},
    {id:'ind-zone30',family:'prescription',name:'Zone 30',meaning:'Début d’une zone où la vitesse est limitée à 30 km/h',rule:'O14/zones',svg:`<rect x="10" y="4" width="80" height="92" rx="6" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="50" cy="40" r="26" fill="${RED}"/><circle cx="50" cy="40" r="19" fill="#fff"/><text x="50" y="49" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="24" fill="${INK}">30</text><text x="50" y="86" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="18" fill="${INK}">ZONE</text>`},
    {id:'ind-autoroute',family:'indication',name:'Autoroute',meaning:'Début de l’autoroute et de ses règles particulières',rule:'O31/autoroute',svg:square(`<path d="M30 86 L44 30 M70 86 L56 30 M50 86 V72 M50 62 V50 M50 40 V32" stroke="#fff" stroke-width="7" fill="none"/><path d="M30 26 H70" stroke="#fff" stroke-width="6"/>`,GREEN)},
  ];
  // Drawings used only by the road scenes (not part of the recognition exercise).
  const EXTRA={
    'interdit-camions':ring(`<g fill="${INK}"><rect x="26" y="38" width="30" height="22" rx="2"/><path d="M58 44 H68 L76 52 V60 H58 Z"/><circle cx="36" cy="64" r="5"/><circle cx="66" cy="64" r="5"/></g>`),
    'poids-max':ring(`<text x="50" y="60" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="25" fill="${INK}">3,5 t</text>`),
    'evitement':square(`<path d="M40 92 V8 M60 92 V64 Q60 58 70 56 V44 Q60 42 60 36 V8" stroke="#fff" stroke-width="6" fill="none"/><rect x="64" y="45" width="10" height="10" rx="2" fill="#fff"/>`),
    'croix-andre':`<g transform="rotate(35 50 50)"><rect x="8" y="42" width="84" height="16" fill="#fff" stroke="${RED}" stroke-width="4"/></g><g transform="rotate(-35 50 50)"><rect x="8" y="42" width="84" height="16" fill="#fff" stroke="${RED}" stroke-width="4"/></g>`,
    'vitesse-30':ring(`<text x="50" y="63" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="36" fill="${INK}">30</text>`),
    'vitesse-80':ring(`<text x="50" y="63" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="36" fill="${INK}">80</text>`),
    'vitesse-120':ring(`<text x="50" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="30" fill="${INK}">120</text>`),
    'tunnel':square(`<path d="M22 86 V54 Q22 26 50 26 Q78 26 78 54 V86 Z" fill="#fff"/><path d="M34 86 V58 Q34 40 50 40 Q66 40 66 58 V86 Z" fill="${INK}"/>`),
    'parking-disque':square(`<text x="50" y="60" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="54" fill="#fff">P</text><rect x="30" y="66" width="40" height="22" rx="3" fill="#fff"/><circle cx="50" cy="77" r="8" fill="${BLUE}"/>`),
  };
  const drawing=id=>(byId[id]&&byId[id].svg)||EXTRA[id]||null;
  const FAMILIES={danger:'Signal de danger : triangle à bord rouge',prescription:'Signal de prescription : disque (interdiction à bord rouge)',obligation:'Signal d’obligation : disque bleu',priorite:'Signal de priorité : forme propre (octogone, triangle renversé, losange)',indication:'Signal d’indication : rectangle ou carré'};
  const byId=Object.fromEntries(SIGNS.map(s=>[s.id,s]));
  const icon=(id,size=96)=>`<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${byId[id].name}">${byId[id].svg}</svg>`;
  // The signal stands at the right roadside, as seen by the driver, before a junction.
  function scene(id){
    return `<svg viewBox="0 0 640 300" role="img" aria-label="Route avec le signal ${byId[id].name}">`+
      `<rect width="640" height="300" fill="#dcefff"/><rect y="170" width="640" height="130" fill="#9ccf86"/>`+
      `<path d="M250 170 H390 L600 300 H40 Z" fill="#5b6670"/><path d="M320 176 V196 M320 210 V236 M320 252 V292" stroke="#fff" stroke-width="5"/>`+
      `<path d="M250 170 L40 300 M390 170 L600 300" stroke="#e6e6e6" stroke-width="4"/>`+
      `<rect x="471" y="104" width="6" height="120" fill="#7c8a96"/><g transform="translate(424 20)">${icon(id,100)}</g></svg>`;
  }
  return Object.freeze({SIGNS,FAMILIES,byId,icon,scene,drawing,EXTRA,version:'1.1.0'});
});
