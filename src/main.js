import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createWorld, REGIONS } from './world.js';
import { createEnvironment } from './environment.js';
import { Explorer } from './controls.js';
import { dressMaterials } from './textures.js';

const $=id=>document.getElementById(id);
const state={firstPerson:false,flying:false,time:.42,timeRunning:true,quality:'medium',reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,uiVisible:true};
let renderer,world,explorer,environment,nearby=null,time=0,toastTimer,activeRegion=REGIONS[0];
let fps=0,frameCount=0,fpsTime=0,lastUiUpdate=0;
let refreshHud=()=>{};

function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4200);}
function openDialog(id){document.exitPointerLock?.();explorer?.clear();const dialog=$(id);if(!dialog.open)dialog.showModal();}
function updateButtons(){
  $('view-button').querySelector('b').textContent=state.firstPerson?'第一人称':'第三人称';$('fly-button').querySelector('b').textContent=state.flying?'返回步行':'开启飞行';$('fly-button').classList.toggle('active',state.flying);$('tour-button').classList.toggle('active',!!explorer?.tour);$('mode-label').textContent=explorer?.tour?'全景观赏':state.flying?'自由飞行':'步行探索';$('crosshair').hidden=!state.firstPerson;
}
function setRegion(region){activeRegion=region;const i=REGIONS.indexOf(region);$('region-index').textContent=String(i+1).padStart(2,'0');$('region-title').textContent=region.name;$('region-description').textContent=region.subtitle;$('region-tag').textContent=region.tag;document.querySelectorAll('.map-point').forEach((p,index)=>p.classList.toggle('active',index===i));}
function teleport(region){explorer.teleport(region);nearby=null;setRegion(region);updateButtons();refreshHud();toast(`已抵达${region.name} · ${region.id==='island'?'沿星门前行，俯瞰整座花园':'沿步道寻找发光的互动地标'}`);}
function interact(force){const target=force||nearby;if(!target){toast('靠近各区的发光地标，按 E 与它互动');return;}if(target.id==='lift'){teleport(REGIONS[5]);return;}
  world.activate(target.id,time);if(target.id==='heart'){environment.shower(time);toast('愿望已寄往星空。抬头，流星正在回应你。');}else{const messages={moon:'月之花已苏醒，樱雨为你而落。',lake:'一圈涟漪，一声来自星湖的回响。',observatory:'星图已展开，抬头寻找连成一线的星辰。',valley:'风铃轻响，金色的光正穿过花谷。',island:'星门已点亮，愿每一段旅程都有星光相伴。'};toast(messages[target.id]);}}
function action(name){if(!explorer)return;
  if(name==='view')explorer.toggleView();
  if(name==='fly'){explorer.toggleFly();toast(state.flying?'飞行已开启 · Space 上升 · Ctrl 下降 · Shift 加速':'已切换步行 · 正在回到脚下的安全地面');}
  if(name==='interact')interact();
  if(name==='reset')teleport(REGIONS[0]);
  if(name==='hide'){state.uiVisible=!state.uiVisible;$('interface').hidden=!state.uiVisible;$('restore-ui').hidden=state.uiVisible;}
  if(name==='lockUnavailable')toast('浏览器未锁定鼠标；按住鼠标拖动，同样可以环顾场景。');
  updateButtons();refreshHud();
}

async function start(){
  // Let the loading screen paint before constructing the world.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,800);
  world=createWorld(scene);const updateTextures=dressMaterials(world.m);environment=createEnvironment(scene,renderer);explorer=new Explorer(camera,$('world'),world,scene,state,action);renderer.info.autoReset=false;
  const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');$('world').dataset.gpu=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.24,.45,1.25);composer.addPass(bloom);composer.addPass(new OutputPass());
  const applyQuality=q=>{state.quality=q;renderer.setPixelRatio(Math.min(devicePixelRatio,q==='high'?1.75:q==='low'?.8:1.15));renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);bloom.enabled=q!=='low';renderer.shadowMap.enabled=q!=='low';environment.setQuality(q);};applyQuality('medium');
  $('reduced-motion').checked=state.reducedMotion;
  REGIONS.forEach((r,i)=>{const button=document.createElement('button');button.className='map-point'+(i===0?' active':'');button.style.left=r.map[0]+'%';button.style.top=r.map[1]+'%';button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label',r.name);button.title=r.name;button.addEventListener('click',()=>teleport(r));$('map-points').append(button);});
  $('view-button').onclick=()=>action('view');$('fly-button').onclick=()=>action('fly');$('interact-button').onclick=()=>interact();$('restore-ui').onclick=()=>action('hide');$('hide-ui').onclick=()=>action('hide');$('meteor-button').onclick=()=>interact(REGIONS[0]);$('tour-button').onclick=()=>{explorer.tour=!explorer.tour;explorer.clear();updateButtons();toast(explorer.tour?'全景俯瞰 · 再次点击或移动，即可回到旅人视角':'已回到旅人视角');};
  document.querySelector('.brand').onclick=e=>{e.preventDefault();action('reset');};$('help-button').onclick=()=>openDialog('help-dialog');$('settings-button').onclick=()=>openDialog('settings-dialog');
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.querySelector('.dialog-close-action')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});dialog.addEventListener('close',()=>explorer.clear());});
  $('quality').onchange=e=>applyQuality(e.target.value);$('time-running').onchange=e=>state.timeRunning=e.target.checked;$('reduced-motion').onchange=e=>state.reducedMotion=e.target.checked;$('time-slider').oninput=e=>{state.time=Number(e.target.value);state.timeRunning=false;$('time-running').checked=false;};
  document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)explorer.clear();});
  document.addEventListener('keydown',e=>{if(e.code==='Escape'&&!document.querySelector('dialog[open]')){if(document.pointerLockElement)document.exitPointerLock();setTimeout(()=>openDialog('help-dialog'),0);}});
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
  $('world').addEventListener('webglcontextlost',e=>{e.preventDefault();toast('图形上下文暂时中断，请刷新页面重新进入花园。');});
  const clock=new THREE.Clock();let animTime=0;
  function frame(){requestAnimationFrame(frame);const elapsed=clock.getDelta();const dt=Math.min(elapsed,.04);if(document.hidden)return;time+=dt;animTime+=state.reducedMotion?dt*.15:dt;
    if(state.timeRunning)state.time=(state.time+dt/720)%1;
    if(!document.querySelector('dialog[open]'))explorer.update(dt,time);world.update(animTime,time);environment.update(time,dt,state,world);
    updateTextures(animTime);renderer.info.reset();const renderStart=performance.now();composer.render();$('world').dataset.renderMs=(performance.now()-renderStart).toFixed(1);frameCount++;fpsTime+=elapsed;if(fpsTime>1){fps=Math.round(frameCount/fpsTime);frameCount=0;fpsTime=0;}
    if(time-lastUiUpdate>.1){lastUiUpdate=time;updateHud();}
  }
  function updateHud(){
    const p=explorer.position;let region=REGIONS[0],best=Infinity;for(const r of REGIONS){if(r.id==='island'&&p.y<35)continue;const distance=Math.hypot(p.x-r.x,p.z-r.z)+(r.id==='island'?Math.abs(p.y-49):p.y>35?100:0);if(distance<best){region=r;best=distance;}}if(region!==activeRegion)setRegion(region);
    nearby=null;let min=10;for(const item of world.interactions){const distance=Math.hypot(p.x-item.target[0],(p.y-item.target[1])*.8,p.z-item.target[2]);if(distance<min){nearby=item;min=distance;}}
    $('interaction-prompt').hidden=!nearby||explorer.tour;if(nearby)$('interaction-label').textContent=nearby.action;
    $('map-player').style.left=THREE.MathUtils.clamp(50+p.x*.47,3,96)+'%';$('map-player').style.top=THREE.MathUtils.clamp(54+p.z*.44,8,95)+'%';$('coordinates').textContent=`${Math.abs(p.z).toFixed(0)}m ${p.z>0?'S':'N'} / ${Math.abs(p.x).toFixed(0)}m ${p.x>0?'E':'W'}`;
    const skyName=state.time<.22?'暮色花园':state.time<.66?'星夜漫游':'黎明将至';$('sky-label').textContent=skyName;$('time-value').textContent=skyName;const hour=(17+state.time*14)%24;$('clock-label').textContent=String(Math.floor(hour)).padStart(2,'0')+':'+String(Math.floor(hour%1*60)).padStart(2,'0');if(document.activeElement!==$('time-slider'))$('time-slider').value=state.time;
    $('fps').textContent=`${fps} FPS · ${innerWidth} × ${innerHeight}`;$('draw-calls').textContent=`${renderer.info.render.calls} draw calls`;updateButtons();
    // DOM diagnostic data is also useful for repeatable browser acceptance checks.
    $('world').dataset.ready='true';$('world').dataset.position=JSON.stringify(p.toArray().map(v=>+v.toFixed(2)));$('world').dataset.region=activeRegion.id;$('world').dataset.mode=`${state.firstPerson?'first':'third'}-${state.flying?'fly':'walk'}`;$('world').dataset.fps=String(fps);$('world').dataset.triangles=String(renderer.info.render.triangles);$('world').dataset.flowers=String(world.stats.flowers);$('world').dataset.trees=String(world.stats.trees);
  }
  refreshHud=updateHud;explorer.update(.016,0);updateHud();frame();$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),900);toast('欢迎来到流星花园 · 点击画面开始探索，或点击「全景俯瞰」');
}
start().catch(error=>{console.error(error);$('load-message').textContent=`场景加载失败：${error.message}。请使用启动脚本，通过本地网址打开。`;});
