import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const palette = {
  stone: 0xe8ddd4, gold: 0xe4b862, darkGold: 0x947448, pink: 0xf486d0,
  purple: 0x9854cf, leaf: 0x237e65, grass: 0x245d53, navy: 0x23325a,
};
export function rng(seed = 2718) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function materials() {
  const standard = (color, roughness = .65, metalness = 0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
  const glow = (color, intensity = 1.5) => new THREE.MeshStandardMaterial({color, emissive:color, emissiveIntensity:intensity, roughness:.32});
  return {
    stone:standard(0xf0dfe2,.48), ivory:standard(0xffedce,.42), gold:standard(0xe9b95d,.25,.75), darkGold:standard(0x917041,.42,.65),
    slate:standard(0x3e3a70), pink:standard(0xe56fb1,.32,.2), roof:standard(0x971765,.34,.3), tealRoof:standard(0x167e8e,.3,.5),
    purple:standard(0x684295,.45,.15), amber:standard(0xe88b38,.4,.15), wood:standard(0x835b50), darkWood:standard(0x473f54),
    grass:standard(0x296950), hedge:standard(0x165e50), leaf:standard(0x299b78), rock:standard(0x494769), soil:standard(0x3b484b),
    glass:new THREE.MeshPhysicalMaterial({color:0x52e9cb,metalness:.24,roughness:.13,transparent:true,opacity:.31,side:THREE.DoubleSide,depthWrite:false}),
    crystal:new THREE.MeshPhysicalMaterial({color:0xb383ff,metalness:.35,roughness:.15,emissive:0x691fcf,emissiveIntensity:.55}),
    lamp:glow(0xffd692,2.1), cyan:glow(0x6affde,1.5), star:glow(0xffdf95,2.3), petal:standard(0xffa0de,.63),
    whiteFlower:standard(0xffecd2), purpleFlower:standard(0xaa76fc), pinkFlower:standard(0xff438e), yellowFlower:standard(0xffc857),
    water:new THREE.MeshStandardMaterial({color:0x13b8b0,metalness:.6,roughness:.19,transparent:true,opacity:.83}),
    stream:new THREE.MeshBasicMaterial({color:0x91efe6,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide}),
  };
}
export class Architect {
  constructor(root, mats) { this.root = root; this.m = mats; this.cache = new Map(); }
  geom(key, fn) { if(!this.cache.has(key)) this.cache.set(key,fn()); return this.cache.get(key); }
  mesh(geo, mat, x=0,y=0,z=0, parent=this.root) {
    const o=new THREE.Mesh(geo,typeof mat==='string'?this.m[mat]:mat);o.position.set(x,y,z);o.castShadow=!o.material.transparent;o.receiveShadow=true;parent.add(o);return o;
  }
  box(x,y,z,w,h,d,mat='stone',parent=this.root,round=0) {
    const geo=round ? this.geom(`round:${w}:${h}:${d}:${round}`,()=>new RoundedBoxGeometry(w,h,d,2,round)) : this.geom('box',()=>new THREE.BoxGeometry(1,1,1));
    const o=this.mesh(geo,mat,x,y,z,parent);if(!round)o.scale.set(w,h,d);return o;
  }
  cylinder(x,y,z,r1,r2,h,mat='stone',parent=this.root,n=24) {const geo=this.geom(`cy:${r1}:${r2}:${h}:${n}`,()=>new THREE.CylinderGeometry(r1,r2,h,n));return this.mesh(geo,mat,x,y,z,parent);}
  sphere(x,y,z,r,mat='stone',parent=this.root){const o=this.mesh(this.geom('sphere',()=>new THREE.SphereGeometry(1,14,10)),mat,x,y,z,parent);o.scale.setScalar(r);return o;}
  ring(x,y,z,r,t,mat='gold',parent=this.root,vertical=false) {const o=this.mesh(this.geom(`ring:${r}:${t}`,()=>new THREE.TorusGeometry(r,t,8,64)),mat,x,y,z,parent);if(!vertical)o.rotation.x=-Math.PI/2;return o;}
  beam(a,b,r,mat='gold',parent=this.root){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va);const o=this.cylinder(...va.clone().add(vb).multiplyScalar(.5).toArray(),r,r,v.length(),mat,parent,8);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  curve(points,r,mat='gold',parent=this.root){return this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,6,false),mat,0,0,0,parent);}
  column(x,y,z,h=8,parent=this.root){
    this.box(x,y+.18,z,1.65,.36,1.65,'stone',parent,.1);this.cylinder(x,y+.48,z,.78,.85,.25,'gold',parent);
    this.cylinder(x,y+h*.5,z,.43,.55,h-.9,'ivory',parent);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;this.beam([x+Math.sin(a)*.46,y+.8,z+Math.cos(a)*.46],[x+Math.sin(a)*.38,y+h-.8,z+Math.cos(a)*.38],.035,'gold',parent);}
    this.cylinder(x,y+h-.4,z,.73,.52,.4,'gold',parent);this.box(x,y+h-.1,z,1.4,.25,1.4,'stone',parent,.06);
  }
  lamp(x,y,z,scale=1,parent=this.root){
    this.cylinder(x,y+.17*scale,z,.45*scale,.6*scale,.34*scale,'stone',parent);
    this.cylinder(x,y+1.75*scale,z,.09*scale,.16*scale,3.1*scale,'darkGold',parent,10);
    this.cylinder(x,y+3.35*scale,z,.4*scale,.3*scale,.12*scale,'gold',parent,8);
    this.sphere(x,y+3.65*scale,z,.32*scale,'lamp',parent).scale.y*=1.35;
    this.cylinder(x,y+4.05*scale,z,0,.58*scale,.5*scale,'gold',parent,8);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;this.beam([x+Math.cos(a)*.29*scale,y+3.35*scale,z+Math.sin(a)*.29*scale],[x+Math.cos(a)*.29*scale,y+3.98*scale,z+Math.sin(a)*.29*scale],.035*scale,'gold',parent);}
  }
  pot(x,y,z,parent=this.root){this.cylinder(x,y+.55,z,.68,.38,1.1,'stone',parent,16);this.ring(x,y+1.1,z,.67,.08,'gold',parent);this.sphere(x,y+1.32,z,.71,'hedge',parent).scale.y*=.6;for(let i=0;i<6;i++){const a=i*2.4;this.sphere(x+Math.cos(a)*.45,y+1.55+(i%2)*.17,z+Math.sin(a)*.45,.25,i%2?'pinkFlower':'whiteFlower',parent);}}
  bench(x,y,z,rotation=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;this.root.add(g);for(let i=0;i<4;i++)this.box(0,.8,i*.19-.28,2.5,.13,.14,'wood',g,.035);for(let i=0;i<3;i++)this.box(0,1.15+i*.23,-.43,2.5,.15,.1,'wood',g,.035);for(const dx of [-.95,.95]){this.box(dx,.4,0,.13,.8,.8,'darkGold',g);this.box(dx,1,-.42,.1,1.2,.12,'darkGold',g);this.curve([[dx,1,.4],[dx,1.35,.2],[dx,1.35,-.4]],.045,'gold',g);}return g;}
  railing(points,y){for(let i=0;i<points.length;i++){const [x,z]=points[i];this.cylinder(x,y+.7,z,.07,.11,1.4,'gold',this.root,8);this.sphere(x,y+1.45,z,.12,'gold');if(i){const [px,pz]=points[i-1];this.beam([px,y+1.28,pz],[x,y+1.28,z],.075,'gold');this.beam([px,y+.38,pz],[x,y+.38,z],.04,'gold');}}}
  compile(){
    this.root.updateMatrixWorld(true);const groups=new Map();
    this.root.traverse(o=>{if(o.isMesh){const key=o.material.uuid;if(!groups.has(key))groups.set(key,{mat:o.material,geos:[]});let g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(!g.index){const old=g;g=mergeVertices(g);old.dispose();}groups.get(key).geos.push(g);}});
    const merged=new THREE.Group();merged.name='Batched architecture';
    for(const {mat,geos} of groups.values()){const geo=mergeGeometries(geos,false);const obj=new THREE.Mesh(geo,mat);obj.castShadow=!mat.transparent;obj.receiveShadow=true;merged.add(obj);geos.forEach(g=>g.dispose());}
    this.root.clear();return merged;
  }
}

export function makeInstanced(geometry, material, transforms, parent) {
  const mesh=new THREE.InstancedMesh(geometry,material,transforms.length);const dummy=new THREE.Object3D();
  transforms.forEach((t,i)=>{dummy.position.set(...t.p);dummy.rotation.set(...(t.r||[0,0,0]));dummy.scale.set(...(t.s||[1,1,1]));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(t.color)mesh.setColorAt(i,new THREE.Color(t.color));});
  mesh.receiveShadow=true;mesh.castShadow=false;mesh.computeBoundingSphere();parent.add(mesh);return mesh;
}
