import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surfaceAt,collides,validGround } from '../src/physics.js';

const surfaces=[{type:'circle',x:0,z:0,r:144,y:0,holes:[{x:70,z:7,r:25}]},{type:'box',x:62,z:18,w:39,d:5,y:1.1},{type:'circle',x:8,z:-23,r:13,y:49},{type:'box',x:-59,z:23,w:3.5,d:.85,y:.367}];
test('ground query distinguishes lake, boardwalk and outside world',()=>{assert.equal(surfaceAt(0,30,surfaces),0);assert.equal(validGround(70,5,surfaces),null);assert.equal(surfaceAt(62,18,surfaces),1.1);assert.equal(validGround(150,0,surfaces),null);});
test('height ceiling prevents snapping from ground to floating islands',()=>{assert.equal(surfaceAt(8,-23,surfaces,2),0);assert.equal(surfaceAt(8,-23,surfaces,50),49);assert.equal(surfaceAt(8,-23,surfaces,48),0);});
test('stairs within step allowance are traversable',()=>{assert.equal(surfaceAt(-59,23,surfaces,.52),.367);assert.equal(surfaceAt(-59,23,surfaces,.3),0);});
test('circular obstacles account for body radius and vertical separation',()=>{const o=[{type:'circle',x:0,z:0,r:1,bottom:0,top:9}];assert.equal(collides(1.3,0,0,o),true);assert.equal(collides(1.5,0,0,o),false);assert.equal(collides(0,10,0,o),false);assert.equal(collides(0,-2,0,o),false);});
test('box collisions block walls but allow clear air above roof',()=>{const o=[{type:'box',x:-68,z:-66,w:12,d:10,bottom:.4,top:9}];assert.equal(collides(-68,1,-66,o),true);assert.equal(collides(-60,1,-66,o),false);assert.equal(collides(-68,10,-66,o),false);});
test('rotated bridge surfaces use their local coordinate bounds',()=>{const s=[{type:'box',x:0,z:0,w:2,d:10,y:1,rotation:Math.PI/2}];assert.equal(surfaceAt(4,0,s),1);assert.equal(validGround(0,4,s),null);});
