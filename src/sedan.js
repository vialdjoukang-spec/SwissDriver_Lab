/* Injected inside the original Three.js closure. Dimensions are design targets,
 * not manufacturer specifications. Preserve the engine's wheel/blinker API. */
function Kf() {
  const car = new ot();
  car.name = 'SwissDriver aerodynamic sedan';
  const paint = new Xt({color:'#dcebf4',metalness:.35,roughness:.25,clearcoat:1,clearcoatRoughness:.12});
  const glass = new Xt({color:'#243b4b',metalness:.25,roughness:.12,clearcoat:1});
  const trim = new xe({color:'#25323b',roughness:.55});
  const tire = new xe({color:'#20252b',roughness:.92});
  const alloy = new xe({color:'#b9c9d5',metalness:.85,roughness:.24});
  const lamp = new xe({color:'#f4fbff',emissive:'#dcefff',emissiveIntensity:.6});
  const rear = new xe({color:'#ad1727',emissive:'#b31227',emissiveIntensity:.4});
  function add(geometry, material, x=0, y=0, z=0, name='') {
    const mesh = new se(geometry,material);
    mesh.position.set(x,y,z); mesh.name=name; mesh.castShadow=true; mesh.receiveShadow=true;
    car.add(mesh); return mesh;
  }
  // Continuous, rounded body with wheel arches: no pickup bed, exhaust or badge.
  const profile = $f([
    [-2.29,.38],[-2.34,.56],[-2.20,.78],[-1.55,.88],[-.85,.93],
    [.35,.99],[1.55,1.00],[2.20,.86],[2.32,.66],[2.27,.36],
    [1.93,.32],[1.89,.59],[1.72,.78],[1.43,.85],[1.13,.78],[.95,.59],[.91,.32],
    [-.95,.32],[-.99,.59],[-1.17,.78],[-1.47,.85],[-1.77,.78],[-1.95,.59],[-1.99,.33]
  ],5);
  add(Zf(profile,1.88,.065),paint,0,0,0,'rounded-sedan-body');
  const cabin = $f([[-1.06,.91],[-.54,1.31],[-.09,1.43],[.56,1.42],[1.08,1.27],[1.66,.97],[.85,.94],[-.55,.92]],6);
  add(Zf(cabin,1.53,.04),glass,0,0,0,'continuous-glass-cabin');
  // Painted roof rails outline a sedan roof instead of an angular wedge.
  [-1,1].forEach(side=>{
    const rail=$f([[-.77,1.10],[-.46,1.34],[.04,1.48],[.58,1.46],[1.06,1.29],[1.49,1.01],[1.36,1.05],[.97,1.32],[.52,1.42],[.02,1.44],[-.44,1.30]],4);
    add(Zf(rail,.045,.012),paint,side*.752,0,0,'roof-rail');
    add(new Yt(.055,.31,.065,3,.018),trim,side*.775,1.15,.20,'b-pillar');
    for(const z of [-.26,.82]) add(new Yt(.022,.035,.19,3,.008),alloy,side*.951,.87,z,'flush-door-handle');
    add(new Yt(.19,.105,.26,3,.025),paint,side*1.015,1.04,-.77,'mirror');
    add(new Yt(.54,.075,.055,3,.02),lamp,side*.61,.77,-2.25,'headlamp');
    add(new Yt(.58,.065,.055,3,.018),rear,side*.56,.83,2.23,'tail-lamp');
    add(new Yt(.045,.08,2.73,3,.015),trim,side*.914,.36,0,'sill');
  });
  add(new Yt(1.18,.085,.09,3,.025),trim,0,.39,-2.29,'lower-air-intake');
  add(new Yt(1.22,.075,.08,3,.02),trim,0,.37,2.28,'rear-lower-trim');
  car.userData.blink={L:[],R:[]};
  [-1,1].forEach(side=>{
    [[side*.84,.73,-2.23],[side*.84,.78,2.22]].forEach(pos=>{
      const light=add(new Yt(.17,.055,.065,2,.015),new rt({color:'#5a3a10'}),...pos,'indicator');
      car.userData.blink[side<0?'L':'R'].push(light);
    });
  });
  const plateMap=as(256,60,(ctx,w,h)=>{
    ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#213443';
    ctx.font='700 33px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SWISS LAB',w/2,h/2);
  });
  add(new Gt(.5,.115),new rt({map:plateMap}),0,.59,2.33,'training-plate');
  car.userData.wheels=[];car.userData.front=[];
  [[-.84,-1.43,true],[.84,-1.43,true],[-.84,1.37,false],[.84,1.37,false]].forEach(([x,z,front])=>{
    const axle=new ot();axle.position.set(x,.36,z);
    const wheel=tM(.36,.25,alloy,tire);axle.add(wheel);car.add(axle);
    car.userData.wheels.push(wheel);if(front) car.userData.front.push(axle);
  });
  car.userData.model={type:'aerodynamic-sedan',wheelbaseM:2.8,bodyWidthM:1.88,licensedManufacturerModel:false};
  return car;
}
