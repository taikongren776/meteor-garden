import * as THREE from 'three';
import { Architect, materials, rng, makeInstanced } from './assets.js';

export const REGIONS = [
  {id:'heart',name:'星愿花庭',subtitle:'把愿望交给星辰，让美好在此发生。',tag:'✦ 星核喷泉',x:0,z:0,spawn:[0,.3,30],map:[50,54],action:'向星核许愿 · 唤醒流星雨',target:[0,1,10]},
  {id:'moon',name:'绯樱月宫',subtitle:'穿过樱花的风，抵达月亮的庭院。',tag:'❀ 樱花与月台',x:-72,z:9,spawn:[-72,0,29],map:[16,57],action:'唤醒月之花 · 樱雨绽放',target:[-72,1,19]},
  {id:'lake',name:'翡翠星湖',subtitle:'星光沉入湖底，晚风奏响涟漪。',tag:'◈ 琉璃温室',x:70,z:7,spawn:[52,1.1,18],map:[83,61],action:'拨动星湖琴弦 · 泛起光波',target:[62,1.1,18]},
  {id:'observatory',name:'紫晶观星台',subtitle:'沿着星辰的轨迹，读懂夜空的秘密。',tag:'✧ 机械星轨仪',x:33,z:-76,spawn:[33,.15,-48],map:[56,20],action:'展开星图 · 连接天际星座',target:[33,4.2,-69]},
  {id:'valley',name:'琥珀风铃谷',subtitle:'风经过花田，带来金色的回响。',tag:'♧ 风车与花坊',x:-68,z:-66,spawn:[-62,0,-45],map:[24,25],action:'轻触风铃 · 让光穿过花谷',target:[-57,0,-60]},
  {id:'island',name:'云端流星岛',subtitle:'越过云海，把世界轻轻留在脚下。',tag:'◎ 云端星门',x:8,z:-23,spawn:[8,49.1,-14],map:[75,15],action:'点亮星门 · 星光共鸣',target:[8,49.1,-24]},
];

export function createWorld(scene) {
  const m=materials(),staticRoot=new THREE.Group(),dynamic=new THREE.Group();scene.add(staticRoot,dynamic);
  const b=new Architect(staticRoot,m),d=new Architect(dynamic,m),random=rng(52719);
  const surfaces=[{type:'circle',x:0,z:0,r:144,y:0,holes:[{x:70,z:7,r:25}]}],obstacles=[],animations=[],flowers=[],trees=[],emitters=[];
  const circleSurface=(x,z,r,y)=>surfaces.push({type:'circle',x,z,r,y});
  const boxSurface=(x,z,w,depth,y)=>surfaces.push({type:'box',x,z,w,d:depth,y});
  const obstacle=(x,z,r,bottom,top)=>obstacles.push({type:'circle',x,z,r,bottom,top});
  const wall=(x,z,w,depth,bottom,top)=>obstacles.push({type:'box',x,z,w,d:depth,bottom,top});
  const plantBed=(x,z,rx,rz,count,pal='pink',y=0)=>{
    for(let i=0;i<count;i++){const a=random()*Math.PI*2,r=Math.sqrt(random());flowers.push({x:x+Math.cos(a)*rx*r,z:z+Math.sin(a)*rz*r,y,s:.65+random()*.8,pal});}
  };
  const tree=(x,z,size=1,pink=true,y=0)=>trees.push({x,z,size,pink,y});
  function route(ax,az,bx,bz,width=5){
    const len=Math.hypot(bx-ax,bz-az),angle=Math.atan2(bx-ax,bz-az),cx=(ax+bx)/2,cz=(az+bz)/2;
    b.box(cx,.055,cz,width,.11,len,'stone').rotation.y=angle;
    for(let side of [-1,1]){const offset=width/2+.15;b.box(cx+Math.cos(angle)*offset,.13,cz-Math.sin(angle)*offset,.16,.12,len,'gold').rotation.y=angle;}
    for(let i=3;i<len-2;i+=5){const x=ax+(bx-ax)*i/len,z=az+(bz-az)*i/len;b.box(x,.12,z,width-.35,.025,.055,'darkGold').rotation.y=angle;}
    for(let i=8;i<len-4;i+=13){for(const side of [-1,1]){const x=ax+(bx-ax)*i/len+Math.cos(angle)*(width/2+1.6)*side,z=az+(bz-az)*i/len-Math.sin(angle)*(width/2+1.6)*side;b.lamp(x,0,z,.83);}}
  }
  function stairs(x,startZ,width,count,rise,depth,base=0){
    for(let i=0;i<count;i++){const z=startZ-i*depth,y=base+(i+1)*rise;b.box(x,y/2,z,width,y,depth+.04,'stone');b.box(x,y+.015,z+depth*.43,width,.045,.09,'gold');boxSurface(x,z,width,depth+.06,y);}
  }
  function circularRail(x,y,z,r,start=0,end=Math.PI*2){const pts=[];for(let a=start;a<=end+.01;a+=.13)pts.push([x+Math.sin(a)*r,z+Math.cos(a)*r]);b.railing(pts,y);}
  function pavilion(x,y,z,r=7,roof='roof',h=7){
    b.cylinder(x,y+.15,z,r+1,r+1.3,.3,'stone');circleSurface(x,z,r+1,y+.3);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,cx=x+Math.sin(a)*r,cz=z+Math.cos(a)*r;b.column(cx,y+.3,cz,h);obstacle(cx,cz,.6,y,y+h+.5);}
    b.cylinder(x,y+h+.45,z,r+.8,r+.8,.35,'gold',staticRoot,8);
    obstacle(x,z,r+.8,y+h+.3,y+h+3.8);
    for(let k=0;k<3;k++)b.cylinder(x,y+h+.8+k*.6,z,r*.55-k*.9,r+1.6-k*1.1,.8,roof,staticRoot,8);
    b.cylinder(x,y+h+2.9,z,0,r*.25,1.8,roof,staticRoot,8);b.sphere(x,y+h+4,z,.35,'gold');
    for(let i=0;i<8;i++){const a=i*Math.PI/4;b.curve([[x+Math.sin(a)*(r+1.5),y+h+.45,z+Math.cos(a)*(r+1.5)],[x+Math.sin(a)*r*.75,y+h+1.3,z+Math.cos(a)*r*.75],[x,y+h+3.7,z]],.07,'gold');}
  }
  function arch(x,y,z,w,h,rotation=0,flowered=false){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;staticRoot.add(g);
    b.column(-w/2,0,0,h-w/2,g);b.column(w/2,0,0,h-w/2,g);
    const ps=[];for(let i=0;i<=20;i++){const a=Math.PI*i/20;ps.push([Math.cos(a)*w/2,h-w/2+Math.sin(a)*w/2,0]);}b.curve(ps,.28,'stone',g);b.curve(ps.map(p=>[p[0]*1.05,p[1]+.12,p[2]]),.055,'gold',g);
    if(flowered)for(let i=0;i<28;i++){const a=Math.PI*i/27;b.sphere(Math.cos(a)*(w/2+.1),h-w/2+Math.sin(a)*(w/2+.1),.12,.38,i%3?'pinkFlower':'purpleFlower',g);}
  }

  // A continuous garden plateau with a scalloped rocky perimeter.
  b.cylinder(0,-2.8,0,144,132,5.6,'grass',staticRoot,128);
  b.cylinder(0,-9,0,132,112,10,'rock',staticRoot,96);
  for(let i=0;i<110;i++){const a=i/110*Math.PI*2,r=138+random()*5;const rock=b.mesh(new THREE.DodecahedronGeometry(3+random()*5,0),'rock',Math.cos(a)*r,-3-random()*5,Math.sin(a)*r);rock.rotation.set(random(),random(),random());rock.scale.y=1.8;}
  for(let i=0;i<35;i++){const a=i/35*Math.PI*2,r=195+random()*70;const mount=b.mesh(new THREE.ConeGeometry(18+random()*20,30+random()*60,5),'purple',Math.cos(a)*r,-10,Math.sin(a)*r);mount.rotation.y=random()*6;}
  route(0,135,0,26,8);route(-25,0,-72,9,6);route(25,8,44,18,6);route(0,-24,33,-53,6);route(-16,-20,-62,-45,5);
  route(-72,-15,-68,-44,5);route(-48,-68,13,-76,5);route(49,-65,72,-22,5);route(-72,30,-35,66,5);route(-35,66,0,76,5);route(0,76,74,36,5);
  // A gently arched, fully walkable bridge over the moon garden's reflecting pool.
  {
    const cx=-45,cz=3.83,angle=Math.atan2(-47,9),r=6;
    surfaces[0].holes.push({x:cx,z:cz,r});
    b.cylinder(cx,.12,cz,6.3,6.3,.12,'slate',staticRoot,48);b.cylinder(cx,.2,cz,6.1,6.1,.025,'water',staticRoot,48);b.ring(cx,.25,cz,6.3,.16,'stone');
    const point=(x,z)=>[cx+Math.cos(angle)*x+Math.sin(angle)*z,cz-Math.sin(angle)*x+Math.cos(angle)*z];
    const rails=[[],[]];
    for(let i=0;i<13;i++){const z=-7.2+i*1.2,h=.16+1.2*Math.sin(i/12*Math.PI),[xw,zw]=point(0,z);b.box(xw,h-.14,zw,5.8,.28,1.23,'stone').rotation.y=angle;surfaces.push({type:'box',x:xw,z:zw,w:5.8,d:1.25,y:h,rotation:angle});
      for(let j=0;j<2;j++){const [rx,rz]=point(j?2.8:-2.8,z);b.beam([rx,h,rz],[rx,h+1.25,rz],.07,'gold');b.sphere(rx,h+1.3,rz,.12,'gold');rails[j].push([rx,h+1.2,rz]);}}
    rails.forEach(ps=>b.curve(ps,.09,'gold'));for(const dz of [-5.2,5.2])for(const dx of [-3.9,3.9]){const [x,z]=point(dx,dz);b.pot(x,0,z);}
  }

  // 01. Star fountain, twelve fluted columns, gilded orbital sculpture.
  b.cylinder(0,.15,0,27,27,.3,'stone',staticRoot,96);circleSurface(0,0,27,.3);
  for(const r of [9,19,25.7,26.5])b.ring(0,.32,0,r,.055,'gold');
  for(let i=0;i<24;i++){const a=i*Math.PI/12;b.box(Math.sin(a)*22,.34,Math.cos(a)*22,.12,.04,5.4,'darkGold').rotation.y=a;}
  for(let i=0;i<14;i++){const a=(i/16+1/16)*Math.PI*2,x=Math.sin(a)*18,z=Math.cos(a)*18;b.column(x,.3,z,9);obstacle(x,z,.7,.3,10);}
  const topArc=new THREE.TorusGeometry(18,.52,8,100,Math.PI*1.75);const beam=b.mesh(topArc,'stone',0,9.4,0);beam.rotation.x=Math.PI/2;beam.rotation.z=Math.PI/8;
  const goldArc=b.mesh(new THREE.TorusGeometry(18,.085,6,100,Math.PI*1.75),'gold',0,9.97,0);goldArc.rotation.copy(beam.rotation);
  for(let i=0;i<14;i++){const a=(i/16+1/16)*Math.PI*2;b.pot(Math.sin(a)*18,10,Math.cos(a)*18);}
  b.cylinder(0,.6,0,8,8.3,.6,'stone');b.ring(0,.93,0,7.8,.22,'gold');b.cylinder(0,.97,0,7.55,7.55,.05,'water');obstacle(0,0,7.9,.3,1.2);
  for(let k=0;k<3;k++){const y=1.3+k*1.85,r=5.1-k*1.45;b.cylinder(0,y+.75,0,.55,.85,1.5,'stone');b.cylinder(0,y+1.4,0,r,r*.7,.4,'stone');b.ring(0,y+1.65,0,r,.13,'gold');b.cylinder(0,y+1.67,0,r-.15,r-.15,.035,'water');
    for(let j=0;j<20;j++){const a=j/20*Math.PI*2;b.curve([[Math.sin(a)*(r-.1),y+1.62,Math.cos(a)*(r-.1)],[Math.sin(a)*(r+.18),y+.65,Math.cos(a)*(r+.18)],[Math.sin(a)*(r+.5),y-.15,Math.cos(a)*(r+.5)]],.035,'stream');}}
  const heart=new THREE.Group();heart.position.set(0,12,0);dynamic.add(heart);
  d.mesh(new THREE.IcosahedronGeometry(1.6,1),'star',0,0,0,heart);for(let i=0;i<3;i++){const ring=d.ring(0,0,0,3.1+i*.5,.095,'gold',heart,true);ring.rotation.set(i*.8,.4+i*.8,i*.5);}animations.push(t=>{heart.rotation.y=t*.16;heart.position.y=12+Math.sin(t*.7)*.3;});
  for(let i=0;i<16;i++){const a=i*Math.PI/8;const x=Math.sin(a)*32,z=Math.cos(a)*32;plantBed(x,z,4,3.4,75,i%3?'pink':'purple');b.cylinder(x,.12,z,4.2,4.4,.24,'stone');b.cylinder(x,.26,z,3.9,3.9,.04,'soil');if(i%2===0){b.lamp(Math.sin(a)*28.5,.3,Math.cos(a)*28.5,1);b.bench(Math.sin(a)*24,.3,Math.cos(a)*24,a+Math.PI);}}
  arch(0,.1,39,9,9,0,true);arch(0,0,104,10,10,0,true);
  for(const x of [-6,6])for(let z=48;z<132;z+=12){plantBed(x,z,1.5,4.6,45,z%24?'pink':'purple');b.box(x,.2,z,3.4,.4,9.6,'stone',staticRoot,.12);b.box(x,.42,z,3,.05,9.2,'soil');}
  for(let z=48;z<133;z+=18){tree(-13,z,1.05,true);tree(13,z,1.05,true);b.bench(-8,0,z,Math.PI/2);b.bench(8,0,z,-Math.PI/2);}
  emitters.push({x:0,y:3,z:0,r:7,type:'fountain'});

  // 02. Cherry palace, open balconies and crescent moon terrace.
  const mx=-72,mz=9;
  b.cylinder(mx,.15,mz,23,24,.3,'stone',staticRoot,64);circleSurface(mx,mz,23,.3);b.ring(mx,.32,mz,22,.08,'gold');
  pavilion(mx,.3,mz,9,'roof',6);
  pavilion(mx,10.4,mz,5.4,'roof',4.7); // upper decorative pavilion; accessible by the exterior staircase
  b.cylinder(mx,10.4,mz,6.6,6.6,.35,'stone');circleSurface(mx,mz,6.6,10.57);
  // Wide ramped walkway follows stairs, so the upper terrace is genuinely reachable.
  for(let i=0;i<28;i++){const x=mx+13,z=mz+14-i*.8,y=.3+(i+1)*.367;b.box(x,y/2,z,3.5,y,.82,'stone');boxSurface(x,z,3.5,.86,y);b.box(x,y+.02,z+.34,3.5,.05,.07,'gold');}
  b.box(mx+7.3,10.45,mz-8.2,12,.25,3,'stone');boxSurface(mx+7.3,mz-8.2,12,3,10.575);b.box(mx,10.45,mz-5,3,.25,6.5,'stone');boxSurface(mx,mz-5,3,6.5,10.575);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;b.sphere(mx+Math.sin(a)*8.5,6,mz+Math.cos(a)*8.5,.45,'lamp');}
  for(let i=0;i<5;i++){arch(mx-16,0,mz+14-i*7,5,6,Math.PI/2,true);for(let s of [-1,1])b.beam([mx-18.5,5,mz+14],[mx-18.5,5,mz-14],.1,'darkGold');}
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=27+random()*8;tree(mx+Math.cos(a)*r,mz+Math.sin(a)*r,.85+random()*.5,true);}
  for(let i=0;i<6;i++){const a=i*Math.PI/3;plantBed(mx+Math.sin(a)*18,mz+Math.cos(a)*18,3,3,65,'pink',.3);b.pot(mx+Math.sin(a)*13,.3,mz+Math.cos(a)*13);}
  const moonG=new THREE.Group();moonG.position.set(mx-12,7,mz+17);dynamic.add(moonG);
  const crescent=new THREE.Shape();crescent.absarc(0,0,2.2,Math.PI*.3,Math.PI*1.7,false);crescent.quadraticCurveTo(-.7,0,Math.cos(Math.PI*.3)*2.2,Math.sin(Math.PI*.3)*2.2);
  d.mesh(new THREE.ExtrudeGeometry(crescent,{depth:.3,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:3,steps:1,curveSegments:36}),'star',0,0,0,moonG);
  animations.push(t=>{moonG.rotation.y=Math.sin(t*.3)*.3;moonG.position.y=7+Math.sin(t*.8)*.25;});
  b.cylinder(mx-12,.5,mz+17,4.4,4.7,1,'stone');circleSurface(mx-12,mz+17,4.4,1);
  emitters.push({x:mx,y:9,z:mz,r:28,type:'petals'});

  // 03. Emerald lake, transparent ribbed conservatory and music deck.
  const lx=70,lz=7;
  b.cylinder(lx,.06,lz,25.8,25.8,.1,'slate',staticRoot,96);const lake=d.cylinder(lx,.32,lz,25.5,25.5,.035,'water',dynamic,96);
  for(let i=0;i<64;i++){const a=i/64*Math.PI*2;b.mesh(new THREE.DodecahedronGeometry(.7+random()*.9),'stone',lx+Math.sin(a)*26,-.05,lz+Math.cos(a)*26).scale.y=.5;}
  b.box(62,.75,18,39,.7,5,'wood');boxSurface(62,18,39,5,1.1);
  for(let x=43;x<82;x+=1)b.box(x,1.12,18,.06,.03,4.8,'gold');
  for(const z of [15.5,20.5]){const pts=[];for(let x=44;x<83;x+=2)pts.push([x,z]);b.railing(pts,1.1);}
  b.cylinder(78,.2,-1,11,11.5,1.8,'stone');circleSurface(78,-1,11,1.1);
  b.box(78,.78,10,5,.65,17,'wood');boxSurface(78,10,5,17,1.105);
  const dome=b.mesh(new THREE.SphereGeometry(9,32,20,0,Math.PI*2,0,Math.PI/2),'glass',78,5,-1);dome.scale.y=1.15;
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const pts=[];for(let j=0;j<=18;j++){const t=j/18*Math.PI/2;pts.push([78+Math.cos(a)*Math.cos(t)*9,5+Math.sin(t)*10.35,-1+Math.sin(a)*Math.cos(t)*9]);}b.curve(pts,.085,'gold');const x=78+Math.cos(a)*9,z=-1+Math.sin(a)*9;b.column(x,1.1,z,3.9);obstacle(x,z,.45,1.1,5.3);}
  for(let j=0;j<5;j++){const a=j/5*Math.PI/2;b.ring(78,5+Math.sin(a)*10.35,-1,Math.cos(a)*9,.09,'gold');}
  b.ring(78,15.5,-1,1.8,.12,'gold');b.cylinder(78,16,-1,0,1.9,.9,'tealRoof');
  for(const dx of [-5,5])for(const dz of [-4,4]){tree(78+dx,-1+dz,.48,false,1.1);b.pot(78+dx,1.1,-1+dz);}
  pavilion(58,1.1,18,4,'tealRoof',4.5);b.cylinder(58,1.65,18,.9,1.2,1.1,'darkGold');
  for(let i=0;i<9;i++)b.box(58+(i-4)*.18,2.3,18,.11,.13,1.1,'gold');
  for(let i=0;i<64;i++){const a=random()*Math.PI*2,r=11+random()*13,x=lx+Math.cos(a)*r,z=lz+Math.sin(a)*r;if(Math.abs(z-18)<3||Math.hypot(x-78,z+1)<11)continue;
    b.cylinder(x,.37,z,.65,.65,.045,'leaf',staticRoot,12);for(let j=0;j<5;j++){const p=j*Math.PI*2/5;const pet=b.sphere(x+Math.cos(p)*.28,.45,z+Math.sin(p)*.28,.25,'petal');pet.scale.multiply(new THREE.Vector3(1,.5,1.6));pet.rotation.y=-p;}b.sphere(x,.55,z,.13,'lamp');}
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2,x=lx+Math.cos(a)*27.6,z=lz+Math.sin(a)*27.6;for(let j=0;j<4;j++){const h=1.2+random()*1.4;b.beam([x+j*.18,0,z],[x+j*.18+.2,h,z],.045,'leaf');b.sphere(x+j*.18+.2,h,z,.12,'cyan');}if(i%4===0)b.lamp(x,0,z,.8);}
  const waves=[];for(let i=0;i<4;i++){const mat=new THREE.MeshBasicMaterial({color:0x8affde,transparent:true,opacity:0,depthWrite:false});const o=d.ring(lx,.37,lz,1,.035,mat);waves.push(o);}
  let lakePulse=-100;animations.push(t=>{lake.material.color.setHSL(.48+Math.sin(t*.23)*.015,.78,.39);waves.forEach((o,i)=>{const age=(effectTime-lakePulse-i*.6);o.visible=age>=0&&age<4;o.scale.setScalar(1+Math.max(age,0)*5);o.material.opacity=Math.max(0,.8-age*.2);});});
  for(let i=0;i<12;i++){const fish=new THREE.Group();dynamic.add(fish);d.sphere(0,0,0,.35,'amber',fish).scale.multiply(new THREE.Vector3(1.7,.5,.6));const tail=d.mesh(new THREE.ConeGeometry(.22,.4,3),'gold',-.65,0,0,fish);tail.rotation.z=Math.PI/2;animations.push(t=>{const a=t*.16+i*.52;fish.position.set(lx+Math.cos(a)*(10+i*.7),.18+Math.sin(t+i)*.04,lz+Math.sin(a)*(10+i*.7));fish.rotation.y=-a-Math.PI/2;});}

  // 04. Observatory, stepped platform, telescope and moving armillary.
  const ox=33,oz=-76;
  for(let i=0;i<4;i++){b.cylinder(ox,.5+i,oz,18-i*1.5,18.3-i*1.5,1,'purple',staticRoot,12);circleSurface(ox,oz,18-i*1.5,1+i);b.ring(ox,1.02+i,oz,18-i*1.5,.08,'gold');}
  stairs(ox,-52,6,12,.34,.8);boxSurface(ox,-63.6,6,6,4.08);b.box(ox,2.04,-63.6,6,4.08,6,'stone');
  b.cylinder(ox,9.5,oz,7,8,11,'purple',staticRoot,12);obstacle(ox,oz,7.7,4,15);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b.column(ox+Math.sin(a)*7.8,4,oz+Math.cos(a)*7.8,11);const g=new THREE.Group();g.position.set(ox+Math.sin(a)*7.08,10.5,oz+Math.cos(a)*7.08);g.rotation.y=a;staticRoot.add(g);b.box(0,0,0,1.55,5,.12,'gold',g,.12);b.box(0,0,.09,1.25,4.65,.08,'cyan',g,.09);b.box(0,0,.17,.08,4.7,.05,'gold',g);b.box(0,.3,.17,1.3,.08,.05,'gold',g);}
  b.cylinder(ox,15.2,oz,9,9,.6,'stone',staticRoot,12);b.ring(ox,15.55,oz,8.9,.15,'gold');b.cylinder(ox,16.2,oz,6,7,1.4,'slate');
  const armillary=new THREE.Group();armillary.position.set(ox,22,oz);dynamic.add(armillary);d.sphere(0,0,0,1.25,'star',armillary);
  const orbitals=[];for(let i=0;i<4;i++){const r=d.ring(0,0,0,4+i*.75,.12,'gold',armillary,true);r.rotation.set(i*.7,i*.5,0);orbitals.push(r);d.sphere(4+i*.75,0,0,.35,'lamp',r);}
  animations.push(t=>{orbitals.forEach((o,i)=>{o.rotation.y=t*(.1+i*.025)+i;o.rotation.z=t*.06+i*.7;});});
  const telescope=new THREE.Group();telescope.position.set(ox-10,6.5,oz+5);dynamic.add(telescope);const barrel=d.cylinder(0,1,0,.6,.75,3.8,'gold',telescope);barrel.rotation.z=-Math.PI*.32;d.cylinder(0,-1,0,.12,.25,3,'darkGold',telescope);animations.push(t=>{telescope.rotation.y=Math.sin(t*.12)*.7;});
  for(let i=0;i<28;i++){const a=random()*Math.PI*2,r=19+random()*6,x=ox+Math.cos(a)*r,z=oz+Math.sin(a)*r;if(z>oz+12&&Math.abs(x-ox)<5)continue;const h=1.3+random()*4;const c=b.mesh(new THREE.ConeGeometry(.5+random()*.7,h,5),'crystal',x,h/2,z);c.rotation.z=(random()-.5)*.4;b.cylinder(x,.15,z,1,1.3,.3,'rock',staticRoot,6);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;b.lamp(ox+Math.cos(a)*15,4,oz+Math.sin(a)*15,.9);}
  plantBed(ox-23,oz+10,4,8,150,'purple');plantBed(ox+23,oz+10,4,8,150,'purple');
  const constellation=new THREE.Group();dynamic.add(constellation);const starPositions=[[10,72,-100],[20,78,-104],[28,70,-107],[40,77,-108],[49,70,-104],[42,62,-105],[28,70,-107]];
  starPositions.forEach((p,i)=>{d.sphere(...p,.35,'star',constellation);if(i)d.beam(starPositions[i-1],p,.06,'cyan',constellation);});constellation.visible=false;

  // 05. Amber windmill village and flower terraces.
  const vx=-68,vz=-66;
  b.cylinder(vx,.2,vz,20,20.5,.4,'stone',staticRoot,64);circleSurface(vx,vz,20,.4);
  b.box(vx,4.7,vz,12,8.6,10,'ivory',staticRoot,.25);wall(vx,vz,12,10,.4,9);
  const roofGeo=new THREE.ConeGeometry(10,5,4);const roof=b.mesh(roofGeo,'amber',vx,10.8,vz);roof.rotation.y=Math.PI/4;
  for(const x of [-4,0,4]){b.box(vx+x,5.5,vz+5.08,2.1,3.4,.18,'gold',staticRoot,.13);b.box(vx+x,5.5,vz+5.2,1.7,3,.08,'lamp',staticRoot,.1);b.box(vx+x,5.5,vz+5.3,.1,3,.06,'wood');}
  b.cylinder(vx-4,12,vz-2,2.8,3.8,10,'ivory');b.cylinder(vx-4,18.3,vz-2,0,3.8,4,'amber');
  const blades=new THREE.Group();blades.position.set(vx-4,12.8,vz+1.8);dynamic.add(blades);d.sphere(0,0,0,.7,'gold',blades);
  for(let i=0;i<4;i++){const g=new THREE.Group();g.rotation.z=i*Math.PI/2;blades.add(g);d.box(0,4,0,.2,8,.22,'darkGold',g);d.box(.65,4.7,0,1.3,5.2,.12,'ivory',g);for(let j=0;j<8;j++)d.box(.65,2.3+j*.65,.1,1.5,.09,.1,'gold',g);d.box(1.3,4.8,.1,.1,5.3,.1,'gold',g);}
  animations.push(t=>{blades.rotation.z=-t*.25;});
  b.box(vx+13,1,vz+2,7,2,13,'stone');boxSurface(vx+13,vz+2,7,13,2);
  const greenhouse=b.mesh(new THREE.CylinderGeometry(3.3,3.3,10,16,1,true,0,Math.PI),'glass',vx+13,3,vz+2);greenhouse.rotation.x=Math.PI/2;greenhouse.rotation.z=Math.PI/2;
  for(let z=vz-3;z<=vz+7;z+=2){const ps=[];for(let j=0;j<=16;j++){const a=j*Math.PI/16;ps.push([vx+13+Math.cos(a)*3.3,2+Math.sin(a)*3.3,z]);}b.curve(ps,.07,'gold');}
  for(let i=0;i<7;i++){plantBed(vx-15+i*5,vz+21,1.7,7,80,'yellow');b.box(vx-15+i*5,.1,vz+21,3.8,.2,14.5,'soil');}
  const wheel=new THREE.Group();wheel.position.set(vx-10,3,vz+5);dynamic.add(wheel);
  for(const dz of [-.7,.7]){d.ring(0,0,dz,2.7,.16,'wood',wheel,true);for(let i=0;i<12;i++){const a=i*Math.PI/6;d.beam([0,0,dz],[Math.cos(a)*2.7,Math.sin(a)*2.7,dz],.09,'wood',wheel);}}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const p=d.box(Math.cos(a)*2.6,Math.sin(a)*2.6,0,.7,.15,1.6,'wood',wheel);p.rotation.z=a;}
  animations.push(t=>{wheel.rotation.z=t*.32;});b.box(vx-10,.08,vz+15,2.8,.15,20,'water');
  // Flower cart, barrels, wind chimes and bunting.
  b.box(vx+6,1.1,vz+12,3,.3,1.5,'wood');for(const x of [vx+4.8,vx+7.2])for(const z of [vz+11.2,vz+12.8])b.ring(x,.65,z,.55,.1,'darkGold',staticRoot,true);for(let i=0;i<4;i++)b.pot(vx+5+i*.7,1.3,vz+12);
  for(let i=0;i<4;i++){const x=vx-3+i*1.3,z=vz+8;b.cylinder(x,.7,z,.55,.5,1.4,'wood',staticRoot,12);b.ring(x,.3,z,.54,.055,'darkGold');b.ring(x,1.1,z,.54,.055,'darkGold');}
  for(const x of [-59,-55])b.beam([x,0,-60],[x,5,-60],.12,'wood');b.beam([-59,5,-60],[-55,5,-60],.12,'gold');
  const chimes=new THREE.Group();chimes.position.set(-57,4.9,-60);dynamic.add(chimes);for(let i=0;i<7;i++){const h=1+(i%3)*.3;d.beam([-1.5+i*.5,0,0],[-1.5+i*.5,-.5,0],.012,'gold',chimes);d.cylinder(-1.5+i*.5,-.5-h/2,0,.055,.055,h,'gold',chimes,8);}animations.push(t=>{chimes.rotation.z=Math.sin(t*1.6)*.07;});
  for(let i=0;i<13;i++){const x=vx-18+i*3,y=5-Math.sin(i/12*Math.PI)*1.4;b.beam([x,y,vz+16],[x+3,5-Math.sin((i+1)/12*Math.PI)*1.4,vz+16],.025,'gold');const flag=b.mesh(new THREE.ConeGeometry(.5,1.2,3),i%2?'amber':'pinkFlower',x,y-.6,vz+16);flag.rotation.z=Math.PI;}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;tree(vx+Math.cos(a)*26,vz+Math.sin(a)*27,.8,false);}

  // 06. Three floating gardens, cascading water and an interactive stargate.
  const ix=8,iz=-23,iy=49;
  function floatingIsland(x,y,z,r){
    b.cylinder(x,y-.7,z,r,r*.95,1.4,'grass',staticRoot,32);circleSurface(x,z,r,y);
    obstacles.push({type:'cone',x,z,r,bottom:y-r*1.7,top:y});
    b.mesh(new THREE.ConeGeometry(r*.95,r*1.7,9),'rock',x,y-r*.88,z).rotation.z=Math.PI;
    for(let i=0;i<15;i++){const a=i/15*Math.PI*2,px=x+Math.sin(a)*r*.93,pz=z+Math.cos(a)*r*.93;b.mesh(new THREE.DodecahedronGeometry(1.3+random()*1.6),'rock',px,y-1.6,pz);b.curve([[px,y,pz],[px+.5,y-3,pz],[px-.5,y-5-random()*5,pz]],.08,'leaf');}
    for(let i=0;i<5;i++){const a=i*1.3;tree(x+Math.sin(a)*r*.73,z+Math.cos(a)*r*.73,.48,true,y);}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;b.pot(x+Math.sin(a)*(r-1),y,z+Math.cos(a)*(r-1));}
    const water=d.cylinder(x+r*.72,y-9,z,.48,.32,18,'stream');animations.push(t=>{water.scale.x=1+Math.sin(t*2+x)*.13;});
  }
  floatingIsland(ix,iy,iz,13);floatingIsland(ix-26,iy+7,iz-8,7);floatingIsland(ix+25,iy+3,iz-5,7);
  b.cylinder(ix,iy+.13,iz,8,8,.26,'stone',staticRoot,64);circleSurface(ix,iz,8,iy+.26);b.ring(ix,iy+.28,iz,7.6,.09,'gold');
  for(let i=0;i<8;i++){const a=(i+1)/10*Math.PI*2;const x=ix+Math.sin(a)*10,z=iz+Math.cos(a)*10;b.column(x,iy,z,7);obstacle(x,z,.6,iy,iy+7);b.sphere(x,iy+7.5,z,.35,'lamp');}
  const portal=new THREE.Group();portal.position.set(ix,iy+5.7,iz-2);dynamic.add(portal);
  d.ring(0,0,0,4.7,.24,'gold',portal,true);const portalInner=d.ring(0,0,0,4.35,.07,'cyan',portal,true);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;d.mesh(new THREE.OctahedronGeometry(.32),'star',Math.cos(a)*4.75,Math.sin(a)*4.75,0,portal);}
  const veil=new THREE.Mesh(new THREE.CircleGeometry(4.25,64),new THREE.MeshBasicMaterial({color:0x877aff,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));portal.add(veil);
  animations.push(t=>{portalInner.rotation.z=t*.13;veil.material.opacity=.12+Math.sin(t*1.4)*.06;});
  for(let i=1;i<8;i++){const x=ix+i*2.7,z=iz-3;const y=iy+i*.4;b.cylinder(x,y-.25,z,1.5,1.15,.5,'stone',staticRoot,8);circleSurface(x,z,1.5,y);}
  for(let i=0;i<14;i++){const a=i*2.4,r=15+random()*14,y=iy-7+random()*14;const pebble=d.mesh(new THREE.DodecahedronGeometry(.45+random()*.6),'rock',ix+Math.cos(a)*r,y,iz+Math.sin(a)*r);animations.push(t=>{pebble.position.y=y+Math.sin(t*.65+i)*.65;pebble.rotation.y=t*.08+i;});}
  b.cylinder(10,.15,-38,2.3,2.5,.3,'slate');b.ring(10,.34,-38,2,.1,'cyan');
  const groundGate={id:'lift',name:'云端传送阵',target:[10,.3,-38],action:'穿过星光 · 前往云端流星岛'};

  // Border gardens, cypress groves and sculpted hedges balance the architectural density.
  for(let i=0;i<95;i++){const a=random()*Math.PI*2,r=103+random()*32,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<10&&z>0)continue;tree(x,z,.7+random()*.65,random()>.53);if(i%3===0)plantBed(x,z,4,4,35,i%2?'purple':'pink');}
  for(const [x,z] of [[-36,28],[36,32],[-40,-25],[9,-49],[-102,3],[104,-17],[-90,-95],[52,-111]]){
    for(let i=0;i<4;i++){const dx=x+i*2.5;b.cylinder(dx,2.4,z,.8,1.4,4.8,'hedge',staticRoot,12);b.cylinder(dx,5.2,z,.05,1.1,2.3,'leaf',staticRoot,12);}plantBed(x+3,z+4,6,2,100,'purple');
  }
  // Curved parterres and ornamental garden islands fill the spaces between paths.
  for(const [x,z,theme] of [[-36,40,'pink'],[34,45,'purple'],[-38,-38,'purple'],[10,-54,'purple'],[-99,42,'pink'],[101,44,'purple'],[-92,-38,'yellow'],[-27,-82,'yellow']]){
    b.cylinder(x,.12,z,7.8,8,.24,'stone',staticRoot,48);b.cylinder(x,.26,z,7.5,7.5,.04,'soil',staticRoot,48);plantBed(x,z,7.3,7.3,180,theme,.27);
    for(let i=0;i<22;i++){const a=i/22*Math.PI*2;b.sphere(x+Math.cos(a)*8,.65,z+Math.sin(a)*8,.65,'hedge').scale.y*=1.2;}
    b.cylinder(x,.65,z,1.7,2,1.3,'stone');b.ring(x,1.3,z,1.65,.1,'gold');b.mesh(new THREE.OctahedronGeometry(.85),'crystal',x,2.15,z);b.lamp(x-9,0,z,.9);b.lamp(x+9,0,z,.9);
  }
  for(let i=0;i<9;i++){const z=-36-i*9;for(const side of [-1,1]){const x=side*(110+Math.sin(i*.7)*7);tree(x,z,1.1,i%2===0);plantBed(x,z+3,5,3,55,i%2?'purple':'pink');}}

  // Tree branches are modeled; hundreds of blossom clusters are instanced.
  const blossoms=[],foliage=[];
  for(const t of trees){const {x,z,size:s,y}=t;b.cylinder(x,y+2.1*s,z,.23*s,.52*s,4.2*s,'wood',staticRoot,8);if(s>.7)obstacle(x,z,.36*s,y,y+3*s);
    for(let j=0;j<5;j++){const a=j*2.4;const bx=x+Math.cos(a)*2*s,bz=z+Math.sin(a)*2*s,by=y+(3.7+random())*s;b.beam([x,y+2*s,z],[bx,by,bz],.13*s,'wood');
      for(let k=0;k<7;k++){const tr={p:[bx+(random()-.5)*2.2*s,by+random()*1.8*s,bz+(random()-.5)*2.2*s],s:[(.65+random()*.65)*s,(.5+random()*.55)*s,(.6+random()*.7)*s],r:[random(),random(),random()],color:t.pink?[0xff9fd8,0xe663c0,0xffc5e1,0xdf78c9][Math.floor(random()*4)]:[0x2d9569,0x55af78,0x72bd78][Math.floor(random()*3)]};(t.pink?blossoms:foliage).push(tr);}}
  }
  makeInstanced(new THREE.IcosahedronGeometry(1,1),m.petal,blossoms,dynamic);makeInstanced(new THREE.IcosahedronGeometry(1,1),m.leaf,foliage,dynamic);
  // Flowers have stems, leaves, raised centers and five individually shaped petals.
  const stems=[],leaves=[],centers=[],petals={pink:[],purple:[],yellow:[]};
  for(const f of flowers){const h=f.s*.65,y=f.y;stems.push({p:[f.x,y+h/2,f.z],s:[.035,h,.035]});leaves.push({p:[f.x+.11,y+h*.55,f.z],s:[.24,.07,.1],r:[0,random()*6,.5]});centers.push({p:[f.x,y+h,f.z],s:[.11,.09,.11]});
    for(let j=0;j<5;j++){const a=j*Math.PI*2/5+f.x;petals[f.pal].push({p:[f.x+Math.cos(a)*.15*f.s,y+h,f.z+Math.sin(a)*.15*f.s],s:[.23*f.s,.07*f.s,.12*f.s],r:[0,-a,.1],color:f.pal==='pink'?(random()>.5?0xff6caf:0xffbcdf):f.pal==='purple'?(random()>.5?0xa16bfa:0xe3baff):(random()>.5?0xffbf36:0xffec83)});}
  }
  const wind={value:0};const flowerMat=m.petal.clone();flowerMat.color.set(0xffffff);flowerMat.onBeforeCompile=shader=>{shader.uniforms.uWind=wind;shader.vertexShader='uniform float uWind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed.x += sin(uWind * 1.2 + instanceMatrix[3].x * .6 + instanceMatrix[3].z * .4) * .065;\n#endif');};
  const petalGeometry=new THREE.BufferGeometry(),pv=[],pn=[],pu=[];for(let i=0;i<10;i++){const a=i*Math.PI/5,c=(i+1)*Math.PI/5;pv.push(0,.35,0,Math.cos(c),0,Math.sin(c),Math.cos(a),0,Math.sin(a));pn.push(0,1,0,0,1,0,0,1,0);pu.push(.5,.5,(Math.cos(c)+1)/2,(Math.sin(c)+1)/2,(Math.cos(a)+1)/2,(Math.sin(a)+1)/2);}petalGeometry.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));petalGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(pn,3));petalGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(pu,2));flowerMat.side=THREE.DoubleSide;
  makeInstanced(new THREE.CylinderGeometry(1,1,1,5,1,true),m.leaf,stems,dynamic);makeInstanced(petalGeometry,m.leaf,leaves,dynamic);makeInstanced(new THREE.IcosahedronGeometry(1,0),m.yellowFlower,centers,dynamic);
  const flowerMeshes=[];for(const list of Object.values(petals))flowerMeshes.push(makeInstanced(petalGeometry,flowerMat,list,dynamic));animations.push(t=>wind.value=t);
  scene.add(b.compile());scene.remove(staticRoot);
  const interactions=[...REGIONS,groundGate];
  let constellationUntil=0,moonUntil=0,valleyUntil=0,portalUntil=0,effectTime=0;
  animations.push(t=>{constellation.visible=effectTime<constellationUntil;moonG.rotation.z=effectTime<moonUntil?Math.sin(t)*.15:0;portal.scale.setScalar(effectTime<portalUntil?1+Math.sin(t*3)*.035:1);chimes.rotation.x=effectTime<valleyUntil?Math.sin(t*5)*.25:0;});
  return {m,surfaces,obstacles,dynamic,emitters,flowerMeshes,regions:REGIONS,interactions,stats:{flowers:flowers.length,trees:trees.length},
    update(t,elapsed=t){effectTime=elapsed;animations.forEach(fn=>fn(t));},
    activate(id,t){if(id==='lake')lakePulse=t;if(id==='observatory')constellationUntil=t+18;if(id==='moon')moonUntil=t+15;if(id==='valley')valleyUntil=t+15;if(id==='island')portalUntil=t+15;},
    effects:{get moonActive(){return moonUntil;},get valleyActive(){return valleyUntil;}}
  };
}
