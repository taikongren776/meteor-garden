import * as THREE from 'three';
import { rng } from './assets.js';

export function createEnvironment(scene, renderer) {
  const random=rng(991),skyUniforms={uTop:{value:new THREE.Color('#11246a')},uHorizon:{value:new THREE.Color('#9472be')}};
  const sky=new THREE.Mesh(new THREE.SphereGeometry(430,40,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:skyUniforms,vertexShader:'varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vPosition;uniform vec3 uTop;uniform vec3 uHorizon;void main(){float h=normalize(vPosition).y;vec3 c=mix(uHorizon,uTop,smoothstep(-.08,.72,h));gl_FragColor=vec4(c,1.);}'}));scene.add(sky);
  scene.fog=new THREE.FogExp2(0x35477a,.0023);
  const ambient=new THREE.HemisphereLight(0xaabfff,0x655075,1.7);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffe3c4,3.1);sun.position.set(-45,95,55);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;sun.shadow.camera.far=260;sun.shadow.normalBias=.11;sun.shadow.bias=-.0002;scene.add(sun);
  const rim=new THREE.DirectionalLight(0x80aaff,1.5);rim.position.set(70,55,-80);scene.add(rim);
  const moon=new THREE.Group();moon.position.set(-107,126,-180);scene.add(moon);
  const moonMat=new THREE.MeshBasicMaterial({color:0xffe7ca});moon.add(new THREE.Mesh(new THREE.SphereGeometry(10,40,30),moonMat));
  for(let i=0;i<16;i++){const a=random()*Math.PI*2,r=random()*7.4;const spot=new THREE.Mesh(new THREE.CircleGeometry(.4+random()*1.3,16),new THREE.MeshBasicMaterial({color:0xbab2d8,transparent:true,opacity:.18}));spot.position.set(Math.cos(a)*r,Math.sin(a)*r,Math.sqrt(100-r*r)+.015);moon.add(spot);}
  const texture=makeGlowTexture();const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:0xffd9b3,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(48,48,1);moon.add(halo);
  const starPositions=[],starColors=[];for(let i=0;i<2100;i++){const y=.08+random()*.92,theta=random()*Math.PI*2,r=390;starPositions.push(Math.sqrt(1-y*y)*Math.sin(theta)*r,y*r,Math.sqrt(1-y*y)*Math.cos(theta)*r);const col=new THREE.Color().setHSL(.57+random()*.2,.2,.7+random()*.3);starColors.push(col.r,col.g,col.b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));const stars=new THREE.Points(geo,new THREE.PointsMaterial({size:1.6,map:texture,transparent:true,vertexColors:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));scene.add(stars);
  const meteorGroup=new THREE.Group();scene.add(meteorGroup);const meteorPool=[];
  for(let i=0;i<26;i++){const mat=new THREE.LineBasicMaterial({color:0xb9e8ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(14,8,-3)]);const line=new THREE.Line(g,mat);const head=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:0xd8f6ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));head.scale.set(1.3,1.3,1);line.add(head);line.visible=false;meteorGroup.add(line);meteorPool.push({line,age:10,duration:2,speed:30});}
  let nextMeteor=0,showerUntil=0,nextShower=90;
  function spawnMeteor(t){const item=meteorPool.find(o=>o.age>o.duration);if(!item)return;item.age=0;item.duration=1.3+random()*1.6;item.speed=25+random()*20;item.line.position.set((random()-.5)*240,85+random()*90,-100-random()*90);item.line.visible=true;}
  const fireflyGeo=new THREE.BufferGeometry(),count=450,positions=new Float32Array(count*3),bases=[];for(let i=0;i<count;i++){const a=random()*Math.PI*2,r=20+random()*115;bases.push([Math.cos(a)*r,.5+random()*4,Math.sin(a)*r,random()*6]);}
  fireflyGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const flies=new THREE.Points(fireflyGeo,new THREE.PointsMaterial({color:0xc4ff9d,size:.35,map:texture,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(flies);
  const petalCount=420,petalPos=new Float32Array(petalCount*3),petalSeeds=[];for(let i=0;i<petalCount;i++)petalSeeds.push([(random()-.5)*70,random()*14,(random()-.5)*65,random()*6]);
  const petalGeo=new THREE.BufferGeometry();petalGeo.setAttribute('position',new THREE.BufferAttribute(petalPos,3));const petals=new THREE.Points(petalGeo,new THREE.PointsMaterial({color:0xffb5db,size:.16,transparent:true,opacity:.85,depthWrite:false}));scene.add(petals);
  const fountainCount=250,waterPos=new Float32Array(fountainCount*3),waterGeo=new THREE.BufferGeometry();waterGeo.setAttribute('position',new THREE.BufferAttribute(waterPos,3));const spray=new THREE.Points(waterGeo,new THREE.PointsMaterial({color:0xc4fff0,size:.11,map:texture,transparent:true,depthWrite:false,opacity:.8,blending:THREE.AdditiveBlending}));scene.add(spray);
  const signalGeo=new THREE.BufferGeometry(),signalPos=new Float32Array(80*3);signalGeo.setAttribute('position',new THREE.BufferAttribute(signalPos,3));const signal=new THREE.Points(signalGeo,new THREE.PointsMaterial({color:0xffd36d,size:.4,map:texture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(signal);signal.visible=false;
  const colors={dusk:[new THREE.Color('#242d67'),new THREE.Color('#b27193')],night:[new THREE.Color('#050d32'),new THREE.Color('#203d78')],dawn:[new THREE.Color('#514080'),new THREE.Color('#d39ab0')]};
  let lastSky=-1;
  return {sun,ambient,stars,shower(t){showerUntil=t+13;nextMeteor=t;},setQuality(q){flies.geometry.setDrawRange(0,q==='low'?180:450);petals.geometry.setDrawRange(0,q==='low'?160:420);sun.castShadow=q!=='low';sun.shadow.mapSize.setScalar(q==='high'?2048:1024);sun.shadow.map?.dispose();sun.shadow.map=null;renderer.shadowMap.needsUpdate=true;},
    update(t,dt,state,world){
      const phase=state.time;
      if(Math.abs(phase-lastSky)>.001){lastSky=phase;let a,b,k;if(phase<.45){a=colors.dusk;b=colors.night;k=phase/.45;}else if(phase<.85){a=colors.night;b=colors.dawn;k=(phase-.45)/.4;}else{a=colors.dawn;b=colors.dusk;k=(phase-.85)/.15;}
        skyUniforms.uTop.value.copy(a[0]).lerp(b[0],k);skyUniforms.uHorizon.value.copy(a[1]).lerp(b[1],k);scene.fog.color.copy(skyUniforms.uHorizon.value).multiplyScalar(.8);ambient.intensity=1.6+Math.abs(phase-.45)*1.4;sun.intensity=1.7+Math.abs(phase-.45)*2;stars.material.opacity=.35+(1-Math.min(1,Math.abs(phase-.45)*2))*.65;
      }
      if(t>nextShower){this.shower(t);nextShower=t+90;}if(t>nextMeteor&&!state.reducedMotion){spawnMeteor(t);nextMeteor=t+(t<showerUntil?.15:2.5+random()*4);}
      for(const p of meteorPool){p.age+=dt;if(p.age>p.duration){p.line.visible=false;continue;}p.line.position.x-=dt*p.speed;p.line.position.y-=dt*p.speed*.55;p.line.position.z+=dt*p.speed*.2;p.line.material.opacity=Math.sin(p.age/p.duration*Math.PI);}
      const motion=state.reducedMotion?t*.12:t;
      bases.forEach((p,i)=>{positions[i*3]=p[0]+Math.sin(motion*.6+p[3])*1.3;positions[i*3+1]=p[1]+Math.sin(motion+p[3])*.7;positions[i*3+2]=p[2]+Math.cos(motion*.5+p[3])*1.3;});fireflyGeo.attributes.position.needsUpdate=true;
      petalSeeds.forEach((p,i)=>{petalPos[i*3]=-72+p[0]+Math.sin(motion*.3+p[3])*3;petalPos[i*3+1]=(p[1]-motion*.45%14+14)%14;petalPos[i*3+2]=9+p[2]+Math.cos(motion*.4+p[3])*2;});petalGeo.attributes.position.needsUpdate=true;petals.material.size=t<world.effects.moonActive?.28:.16;
      for(let i=0;i<fountainCount;i++){const a=i*2.39996,u=(t*.48+i/fountainCount)%1,r=2+u*5;waterPos[i*3]=Math.cos(a)*r;waterPos[i*3+1]=1+Math.sin(u*Math.PI)*5;waterPos[i*3+2]=Math.sin(a)*r;}waterGeo.attributes.position.needsUpdate=true;
      signal.visible=t<world.effects.valleyActive;for(let i=0;i<80;i++){const u=(t*.18+i/80)%1;signalPos[i*3]=-85+u*50;signalPos[i*3+1]=1+Math.sin(u*Math.PI)*3+Math.sin(i)*.6;signalPos[i*3+2]=-48+Math.sin(u*9)*4;}signalGeo.attributes.position.needsUpdate=true;
    }
  };
}
function makeGlowTexture(){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,31);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.18,'rgba(255,255,255,.95)');g.addColorStop(.45,'rgba(255,255,255,.2)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
