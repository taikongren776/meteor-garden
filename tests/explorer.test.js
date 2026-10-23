import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createWorld, REGIONS } from '../src/world.js';
import { Explorer } from '../src/controls.js';
import { surfaceAt, collides } from '../src/physics.js';

// Run actual movement against the actual world, without requiring a WebGL context.
globalThis.window={addEventListener(){}};
globalThis.document={addEventListener(){},querySelector(){return null;}};
const scene=new THREE.Scene();
const world=createWorld(scene);
function player(){return new Explorer(new THREE.PerspectiveCamera(),{addEventListener(){}},world,new THREE.Scene(),{firstPerson:false,flying:false},()=>{});}
function advance(p,seconds){for(let i=0;i<Math.round(seconds*60);i++)p.update(1/60,i/60);}

test('all six region destinations have supported collision-free spawn positions',()=>{
  for(const region of REGIONS){const p=player();p.teleport(region);advance(p,.5);assert.ok(Number.isFinite(p.position.y),region.id);assert.ok(!collides(p.position.x,p.position.y,p.position.z,world.obstacles),region.id);assert.equal(p.position.y,surfaceAt(p.position.x,p.position.z,world.surfaces,p.position.y+.52),region.id);assert.ok(p.camera.position.toArray().every(Number.isFinite));}
});
test('W moves forward at the intended walk speed, without frame-rate dependence',()=>{const p=player();p.position.set(0,0,90);p.yaw=0;p.keys.add('KeyW');advance(p,1);assert.ok(Math.abs(p.position.z-84.5)<.01);assert.equal(p.position.y,0);});
test('view switching retains player location, hides the avatar only in first person',()=>{const p=player(),before=p.position.clone();p.toggleView();advance(p,.1);assert.equal(p.state.firstPerson,true);assert.equal(p.avatar.visible,false);assert.ok(p.position.distanceTo(before)<.01);p.toggleView();advance(p,.1);assert.equal(p.avatar.visible,true);});
test('flight ascends and descends in either view; toggling walk lands safely',()=>{const p=player();p.position.set(0,0,90);p.toggleFly();p.keys.add('Space');advance(p,2);assert.ok(p.position.y>25);p.keys.clear();p.toggleView();p.keys.add('ControlLeft');advance(p,.5);assert.ok(p.position.y<22);p.keys.clear();p.toggleFly();advance(p,3);assert.equal(p.position.y,0);assert.equal(p.state.firstPerson,true);});
test('flight above lake with no landing surface returns to last safe point',()=>{const p=player();p.position.set(0,0,90);advance(p,.1);const safe=p.position.clone();p.toggleFly();p.position.set(70,20,7);p.toggleFly();assert.ok(p.position.distanceTo(safe)<.01);});
test('walking cannot enter the lake outside its boardwalk',()=>{const p=player();p.position.set(40,0,7);p.yaw=Math.PI/2;p.keys.add('KeyW');advance(p,4);assert.ok(p.position.x<=45.1);assert.ok(p.position.y>=0);});
test('player is blocked by the windmill wall and world border',()=>{const p=player();p.position.set(-68,.4,-56);p.yaw=0;p.keys.add('KeyW');advance(p,3);assert.ok(p.position.z>=-60.6);p.position.set(0,0,141);p.yaw=Math.PI;advance(p,3);assert.ok(Math.hypot(p.position.x,p.position.z)<=142);});
test('moon palace stair run reaches the upper balcony by walking',()=>{const p=player();p.position.set(-59,.3,24);p.yaw=0;p.keys.add('KeyW');advance(p,4.2);assert.ok(p.position.y>10,'upper balcony height: '+p.position.y);});
test('observatory stair run reaches the terrace by walking',()=>{const p=player();p.teleport(REGIONS[3]);p.yaw=0;p.keys.add('KeyW');advance(p,3);assert.ok(p.position.y>=4,'terrace height: '+p.position.y);});
test('nearby columns retract the third-person camera',()=>{const p=player();p.position.set(33,4,-64);p.yaw=Math.PI;p.pitch=0;advance(p,.2);assert.ok(p.camera.position.distanceTo(p.position)<10);});
test('flight cannot pass through the solid underside of a floating island',()=>{const p=player();p.position.set(8,20,-23);p.toggleFly();p.keys.add('Space');advance(p,4);assert.ok(p.position.y<28);assert.ok(!collides(p.position.x,p.position.y,p.position.z,world.obstacles));});
test('moon upper balcony is not obstructed by the lower roof collision',()=>{assert.equal(collides(-72,10.575,9,world.obstacles),false);});
test('arched moon bridge is walkable across its reflecting pool',()=>{const p=player();p.position.set(-36,0,2.1);p.yaw=Math.atan2(-47,-9);p.keys.add('KeyW');advance(p,3.5);assert.ok(p.position.x<-52,'bridge exit x='+p.position.x);assert.ok(p.position.y>=0);});
