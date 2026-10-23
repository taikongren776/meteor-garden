import * as THREE from 'three';
import { Architect } from './assets.js';
import { collides, surfaceAt } from './physics.js';

export class Explorer {
  constructor(camera,canvas,world,scene,state,onAction){
    Object.assign(this,{camera,canvas,world,scene,state,onAction});this.position=new THREE.Vector3(3,0,45);this.yaw=-.06;this.pitch=-.12;this.velocityY=0;this.keys=new Set();this.grounded=true;this.walkTime=0;this.dragging=false;this.dragDistance=0;this.cameraReady=false;
    this.avatar=this.makeAvatar();scene.add(this.avatar);this.forward=new THREE.Vector3();this.lookTarget=new THREE.Vector3();this.desired=new THREE.Vector3();this.lastSafe=this.position.clone();this.tour=false;
    this.bind();
  }
  makeAvatar(){
    const root=new THREE.Group(),a=new Architect(root,this.world.m);const coat=new THREE.MeshStandardMaterial({color:0x283f78,roughness:.6});const skin=new THREE.MeshStandardMaterial({color:0xf0c7b1,roughness:.6});
    a.cylinder(0,.95,0,.25,.35,.85,coat,root,12);a.sphere(0,1.58,0,.23,skin,root);a.sphere(0,1.72,-.04,.23,'darkWood',root).scale.multiply(new THREE.Vector3(1,.6,1));a.ring(0,1.4,0,.27,.055,'gold',root);a.sphere(0,1.22,.25,.075,'cyan',root);
    const cape=a.mesh(new THREE.ConeGeometry(.5,1.15,16,1,true,Math.PI*.45,Math.PI*1.1),coat,0,.85,-.05,root);cape.rotation.x=-.12;this.cape=cape;
    const legs=[];for(const x of [-.14,.14]){const pivot=new THREE.Group();pivot.position.set(x,.6,0);root.add(pivot);a.cylinder(0,-.22,0,.09,.075,.5,'slate',pivot,8);a.box(0,-.48,.06,.18,.16,.32,'darkGold',pivot,.04);legs.push(pivot);a.cylinder(x*2.4,1.02,0,.08,.07,.6,coat,root,8);}this.legs=legs;
    a.ring(0,.04,0,.45,.025,'cyan',root);return root;
  }
  bind(){
    window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['Space','ControlLeft','ControlRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code))e.preventDefault();this.keys.add(e.code);if(e.repeat)return;
      if(e.code==='KeyV')this.onAction('view');if(e.code==='KeyF')this.onAction('fly');if(e.code==='KeyE')this.onAction('interact');if(e.code==='KeyR')this.onAction('reset');if(e.code==='KeyH')this.onAction('hide');
      if(e.code==='Space'&&!this.state.flying&&this.grounded){this.velocityY=6;this.grounded=false;}
    });
    window.addEventListener('keyup',e=>this.keys.delete(e.code));window.addEventListener('blur',()=>this.clear());document.addEventListener('visibilitychange',()=>this.clear());
    this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.dragging=true;this.dragDistance=0;this.canvas.setPointerCapture(e.pointerId);});
    this.canvas.addEventListener('pointerup',()=>{const click=this.dragging&&this.dragDistance<5;this.dragging=false;if(click&&!document.pointerLockElement){const promise=this.canvas.requestPointerLock?.();promise?.catch?.(()=>this.onAction('lockUnavailable'));}});
    document.addEventListener('pointermove',e=>{if(document.pointerLockElement===this.canvas||this.dragging){this.dragDistance+=Math.abs(e.movementX)+Math.abs(e.movementY);this.yaw+=e.movementX*.0025;this.pitch=THREE.MathUtils.clamp(this.pitch-e.movementY*.002,-1.15,.95);if(this.tour)this.exitTour();}});
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.distance=THREE.MathUtils.clamp((this.distance||15)+e.deltaY*.012,4,24);},{passive:false});
  }
  clear(){this.keys.clear();this.dragging=false;}
  teleport(region){this.position.set(...region.spawn);this.velocityY=0;this.yaw=Math.atan2(region.x-this.position.x,-(region.z-this.position.z));this.pitch=-.18;this.state.flying=false;this.tour=false;this.lastSafe.copy(this.position);this.cameraReady=false;this.clear();}
  toggleView(){this.state.firstPerson=!this.state.firstPerson;this.cameraReady=false;this.exitTour();}
  toggleFly(){this.state.flying=!this.state.flying;this.velocityY=0;this.exitTour();if(this.state.flying)this.position.y+=.5;else {const ground=surfaceAt(this.position.x,this.position.z,this.world.surfaces,this.position.y+.5);if(!Number.isFinite(ground)){this.position.copy(this.lastSafe);this.cameraReady=false;}}}
  exitTour(){this.tour=false;}
  update(dt,t){
    const state=this.state,old=this.position.clone();const f=Number(this.keys.has('KeyW'))-Number(this.keys.has('KeyS')),s=Number(this.keys.has('KeyD'))-Number(this.keys.has('KeyA'));const moving=!!(f||s);const fast=this.keys.has('ShiftLeft')||this.keys.has('ShiftRight');
    if(moving||this.keys.has('Space'))this.exitTour();
    const speed=state.flying?(fast?27:13):(fast?10:5.5);const norm=Math.max(1,Math.hypot(f,s));const dx=(Math.sin(this.yaw)*f+Math.cos(this.yaw)*s)*speed*dt/norm,dz=(-Math.cos(this.yaw)*f+Math.sin(this.yaw)*s)*speed*dt/norm;
    const up=Number(this.keys.has('Space'))-Number(this.keys.has('ControlLeft')||this.keys.has('ControlRight'));const dy=state.flying?up*speed*dt:0;
    const steps=Math.max(1,Math.ceil(Math.max(Math.hypot(dx,dz),Math.abs(dy))/.25));
    for(let i=0;i<steps;i++){
      for(const axis of ['x','z']){const next=this.position.clone();next[axis]+=(axis==='x'?dx:dz)/steps;if(Math.hypot(next.x,next.z)>142)continue;
        const ground=surfaceAt(next.x,next.z,this.world.surfaces,this.position.y+.52);let y=this.position.y;
        if(!state.flying){if(!Number.isFinite(ground))continue;if(ground>y&&this.grounded)y=ground;}
        if(!collides(next.x,y,next.z,this.world.obstacles)){this.position[axis]=next[axis];this.position.y=y;}
      }
      if(state.flying){const y=THREE.MathUtils.clamp(this.position.y+dy/steps,.4,105);const floor=surfaceAt(this.position.x,this.position.z,this.world.surfaces,this.position.y+.25);if(y>=floor&&!collides(this.position.x,y,this.position.z,this.world.obstacles))this.position.y=y;}
    }
    if(!state.flying){const floor=surfaceAt(this.position.x,this.position.z,this.world.surfaces,this.position.y+.52);this.velocityY-=18*dt;const y=this.position.y+this.velocityY*dt;if(y<=floor){this.position.y=floor;this.velocityY=0;this.grounded=true;this.lastSafe.copy(this.position);}else{this.position.y=y;this.grounded=false;}}
    if(this.position.y < -5||!Number.isFinite(this.position.y)){this.position.copy(this.lastSafe);this.velocityY=0;}
    this.avatar.position.copy(this.position);this.avatar.visible=!state.firstPerson&&!this.tour;if(moving){this.avatar.rotation.y=Math.atan2(this.position.x-old.x,this.position.z-old.z);this.walkTime+=dt*(fast?13:9);}this.legs.forEach((leg,i)=>leg.rotation.x=moving&&!state.flying?Math.sin(this.walkTime+i*Math.PI)*.48:0);this.cape.rotation.x=-.1+(state.flying?-.45:Math.sin(t*2)*.035);
    if(this.tour){const a=t*.025;this.desired.set(Math.sin(a)*145,105,Math.cos(a)*145);this.lookTarget.set(0,8,-12);this.camera.position.lerp(this.desired,1-Math.exp(-dt*2));this.camera.lookAt(this.lookTarget);return;}
    this.forward.set(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch));this.lookTarget.copy(this.position).add(new THREE.Vector3(0,1.65,0));
    if(state.firstPerson){this.camera.position.copy(this.lookTarget);this.camera.lookAt(this.lookTarget.clone().add(this.forward));}
    else{
      let distance=this.distance||15;for(let dist=.5;dist<distance;dist+=.4){const p=this.lookTarget.clone().addScaledVector(this.forward,-dist);const floor=surfaceAt(p.x,p.z,this.world.surfaces,this.position.y+2);if(p.y<floor+.3||collides(p.x,p.y,p.z,this.world.obstacles,.2,.2)){distance=Math.max(.6,dist-.5);break;}}
      this.desired.copy(this.lookTarget).addScaledVector(this.forward,-distance);
      if(!this.cameraReady)this.camera.position.copy(this.desired);else this.camera.position.lerp(this.desired,1-Math.exp(-dt*10));
      this.camera.lookAt(this.lookTarget.clone().addScaledVector(this.forward,3));
    }
    this.cameraReady=true;
  }
}
