import * as THREE from '../dist/vendor/three.module.js';
import { OrbitControls } from '../dist/vendor/OrbitControls.js';
import {buildRefinedCamera} from './refined-model.js';

const $ = id => document.getElementById(id);
const partsData = [
  {name:'镁合金机身骨架',en:'MAGNESIUM ALLOY CHASSIS',desc:'内部承载框架为结构讲解示意。外观以官方 149 × 149.5 × 90.5 mm 规格和多角度图片为比例参照；没有取得原厂 CAD，不能作为零件加工尺寸依据。',facts:[['机身结构','镁合金'],['结构职责','承载 / 保护'],['模型表示','骨架示意']],pos:[0,0,0],offset:[-3.2,-.1,-.8]},
  {name:'前盖与握柄',en:'FRONT SHELL & HANDGRIP',desc:'重建一体式竖拍轮廓、弧面握柄和红色肩部饰条。Fn1–Fn3 位于卡口靠握柄一侧；另一侧包含镜头释放键、同步/十针端子盖和接口盖。皮纹、接缝与小零件位置依据官方图片近似。',facts:[['机身设计','一体式竖拍握柄'],['外观细节','红色握柄饰条'],['外观依据','官方部件图 / 产品照']],pos:[0,0,0],offset:[-2.5,.2,1.6]},
  {name:'NIKKOR Z 24–70mm f/2.8 S',en:'FIRST-GENERATION S-LINE ZOOM',desc:'按第一代 24–70mm f/2.8 S 的公开外观重建。由前至后依次为对焦环、变焦环、信息窗及控制环；加入 DISP、L-Fn、A/M 开关与 82mm 前缘标识。当前为 24mm 收缩、未安装遮光罩的外观；镜片曲率为渲染近似。',facts:[['最大直径 × 长度','约 89 × 126 mm'],['滤镜尺寸','82 mm'],['光学设计规格','17 片 / 15 组']],pos:[0.32,0.34,0.92],offset:[1.4,.35,3.5]},
  {name:'Z 卡口连接环',en:'Z-MOUNT INTERFACE',desc:'重建金属卡口、内侧卡爪、主要固定螺钉与上方电子触点弧列。开孔按 Z 卡口 55mm 内径建立比例；触点与小零件的局部尺寸由公开图片估计。',facts:[['卡口类型','尼康 Z 卡口'],['功能','连接镜头与机身'],['卡口内径','55 mm']],pos:[0.32,0.34,0.87],offset:[.7,1.2,1.7]},
  {name:'全画幅感光组件',en:'45.7 MP STACKED CMOS',desc:'Z9 使用约 4571 万有效像素的全画幅堆栈式 CMOS 影像传感器。这里以感光面及周围承载框表示，不展示真实电路或防抖机构细节。',facts:[['有效像素','45.7 MP'],['感光元件','35.9 × 23.9 mm'],['传感器形式','堆栈式 CMOS']],pos:[0.32,0.34,0.38],offset:[.4,2.4,2.2]},
  {name:'影像处理主板',en:'EXPEED 7 / MAIN BOARD',desc:'EXPEED 7 是 Z9 的影像处理引擎。此处使用电路板、芯片与走线表达处理模块，电路布局为演示设计，并非真实主板复刻。',facts:[['影像处理引擎','EXPEED 7'],['展示内容','芯片 / 走线示意'],['电路精度','非工程图']],pos:[0,-0.15,-0.28],offset:[2.8,.25,-1.35]},
  {name:'后盖与操作区',en:'REAR SHELL & CONTROLS',desc:'按官方背面图重排横拍和竖拍 AF-ON、双摇杆、多重选择器、DISP 切换区、i/Menu/回放/缩放键，以及下部 WB、QUAL、语音备忘录区域。背面视角可直接检查布局；小尺寸外形仍为近似。',facts:[['主要功能','取景 / 参数控制'],['交互方式','旋转查看背部'],['布局依据','官方机背部件图']],pos:[0,0,-0.88],offset:[-1.4,.1,-2.25]},
  {name:'多向翻折显示屏',en:'FOUR-AXIS TILTING MONITOR',desc:'约 3.2 英寸、约 210 万画点的可翻折触摸显示屏。画面由 Canvas 绘制；拆解动画演示的是组件分离，不是实际铰链运动。',facts:[['屏幕尺寸','3.2 英寸'],['显示画点','约 210 万'],['显示形式','可翻折触摸屏']],pos:[0.48,-0.22,-1.1],offset:[.2,.5,-3.5]},
  {name:'电子取景器',en:'REAL-LIVE ELECTRONIC VIEWFINDER',desc:'修正中央凸起外形、倾斜 Nikon 标识面、圆形眼罩、矩形目镜窗口和屈光度控制区。顶部热靴以独立导轨和触点呈现。内部光学仍为外观讲解近似。',facts:[['显示类型','OLED'],['取景器画点','约 369 万'],['构图方式','电子实时取景']],pos:[0.32,1.65,-0.01],offset:[0,2.5,-.8]},
  {name:'顶部控制模块',en:'TOP CONTROLS & STATUS DISPLAY',desc:'按官方顶部图修正肩屏和四键控制盘的位置关系，补充快门电源环、录制、ISO、曝光补偿键及前后拨轮。四键冠部包括 BKT、闪光、MODE 和释放模式键。可使用顶部视角核对。',facts:[['操作组件','快门 / 拨轮'],['辅助显示','顶部状态屏'],['结构表示','合并模块示意']],pos:[0,1.58,0],offset:[-1.7,2.5,.2]},
  {name:'EN-EL18d 电池',en:'RECHARGEABLE LI-ION BATTERY',desc:'Z9 使用 EN-EL18d 锂离子电池。动画从一体式握柄的下部抽出电池，以演示供电组件在机身中的位置关系。',facts:[['电池型号','EN-EL18d'],['额定电压','10.8 V'],['额定容量','3300 mAh']],pos:[0.42,-1.55,-0.03],offset:[-.5,-2.15,.5]},
  {name:'双卡槽模块',en:'DUAL MEMORY CARD SLOTS',desc:'双卡槽支持 CFexpress Type B 和 XQD 存储卡。卡片及插槽用于说明存储模块，示意模型不用于指导插拔或维修。',facts:[['卡槽数量','2'],['支持存储卡','CFexpress B / XQD'],['槽位排列','示意']],pos:[-1.8,-0.05,-0.05],offset:[2.6,.2,-.35]}
];
const overviewFacts = [['有效像素','45.7 MP'],['影像处理','EXPEED 7'],['RAW 连拍','最高约 20 张/秒'],['镜头接口','尼康 Z 卡口']];
const state={selected:-1,auto:false,labels:false,scan:false,tour:false,global:0,targets:new Array(12).fill(0),progress:new Array(12).fill(0),focus:false};
let stopTour=()=>{};
const partButtons=[], labelEls=[];
const leaderSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');leaderSvg.classList.add('leader-lines');$('annotations').append(leaderSvg);
const leaderLines=[];
partsData.forEach((p,i)=>{
  const b=document.createElement('button');b.className='part-item';b.setAttribute('aria-label',`选择并拆解${p.name}`);b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="part-num">${String(i+1).padStart(2,'0')}</span><span class="part-name">${p.name}</span><span class="part-dot"></span>`;b.onclick=()=>selectPart(i,true);$('part-list').append(b);partButtons.push(b);
  const label=document.createElement('span');label.className='annotation';label.textContent=`${String(i+1).padStart(2,'0')} ${p.name}`;label.hidden=true;$('annotations').append(label);labelEls.push(label);
  const leader=document.createElementNS('http://www.w3.org/2000/svg','path');leader.setAttribute('fill','none');leader.setAttribute('stroke','#b09b55');leader.setAttribute('stroke-opacity','.35');leader.setAttribute('stroke-width','.7');leaderSvg.append(leader);leaderLines.push(leader);
});
function facts(rows){$('detail-facts').replaceChildren(...rows.map(([key,value])=>{const row=document.createElement('div');row.className='fact-row';const dt=document.createElement('dt');dt.textContent=key;const dd=document.createElement('dd');dd.textContent=value;row.append(dt,dd);return row;}));}
facts(overviewFacts);
const sourceLink=document.createElement('a');sourceLink.href='https://onlinemanual.nikonimglib.com/z9/en/specifications_348.html';sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';sourceLink.textContent='规格来源：尼康 Z9 官方参考指南 ↗';sourceLink.className='source-link';document.querySelector('.model-note').after(sourceLink);
const videoSource=document.createElement('a');videoSource.href='https://www.nikonusa.com/press-room/z-9-firmware';videoSource.target='_blank';videoSource.rel='noopener noreferrer';videoSource.className='source-link';videoSource.textContent='8.3K N-RAW：尼康固件 2.0 公告 ↗';sourceLink.after(videoSource);
const exteriorSource=document.createElement('a');exteriorSource.href='https://onlinemanual.nikonimglib.com/z9/en/parts_of_the_camera_7.html';exteriorSource.target='_blank';exteriorSource.rel='noopener noreferrer';exteriorSource.className='source-link';exteriorSource.textContent='外观布局：尼康官方部件图 ↗';videoSource.after(exteriorSource);
const lensSource=document.createElement('a');lensSource.href='https://nij.nikon.com/products/lineup/nikkor/zmount/nikkor_z_24-70mm_f28_s/';lensSource.target='_blank';lensSource.rel='noopener noreferrer';lensSource.className='source-link';lensSource.textContent='镜头参考：24–70mm f/2.8 S ↗';exteriorSource.after(lensSource);
function renderUI(){
  const n=state.targets.filter(t=>t>.02).length;
  $('split-count').textContent=`${n} / 12`;
  const mean=state.targets.reduce((a,b)=>a+b,0)/12;
  $('explode-range').value=Math.round(mean*100);$('explode-output').textContent=`${Math.round(mean*100)}%`;
  $('explode-all').querySelector('span').textContent=n?'全部收回':'全部拆解';
  $('mode-label').innerHTML=n?`部件展开 <span>EXPLODED / ${n} PARTS</span>`:'整机视图 <span>ASSEMBLED</span>';
  $('overview').classList.toggle('active',state.selected<0);$('overview').setAttribute('aria-pressed',String(state.selected<0));
  partButtons.forEach((b,i)=>{b.classList.toggle('active',i===state.selected);b.classList.toggle('split',state.targets[i]>.02);b.setAttribute('aria-pressed',String(i===state.selected));});
  const p=partsData[state.selected];
  $('detail-index').textContent=p?`${String(state.selected+1).padStart(2,'0')} / COMPONENT`:'00 / OVERVIEW';
  $('detail-title').textContent=p?p.name:'突破，始于内核。';$('detail-en').textContent=p?p.en:'BEYOND THE DECISIVE MOMENT';
  $('detail-description').textContent=p?p.desc:'告别机械快门，以全画幅堆栈式 CMOS 与 EXPEED 7 驱动高速影像。旋转、拆解、扫描，探索 Z9 内在的精密协作。';
  facts(p?p.facts:overviewFacts);$('part-action').hidden=!p;if(p)$('toggle-part').textContent=state.targets[state.selected]>.02?'收回此部件 ↙':'展开此部件 ↗';
  labelEls.forEach((l,i)=>l.classList.toggle('active',i===state.selected));
}
function selectPart(i,toggle=false){stopTour();if(toggle)state.targets[i]=state.selected===i?(state.targets[i]>.02?0:1):1;state.selected=i;renderUI();}
function explodeAll(){stopTour();const next=state.targets.some(t=>t>.02)?0:1;state.targets.fill(next);state.global=next;renderUI();}
$('overview').onclick=()=>{stopTour();state.selected=-1;renderUI();};$('explode-all').onclick=explodeAll;
$('toggle-part').onclick=()=>{stopTour();if(state.selected>=0){state.targets[state.selected]=state.targets[state.selected]>.02?0:1;renderUI();}};
$('explode-range').oninput=e=>{stopTour();state.global=Number(e.target.value)/100;state.targets.fill(state.global);renderUI();};
$('auto-rotate').onclick=()=>{stopTour();state.auto=!state.auto;$('auto-rotate').setAttribute('aria-pressed',String(state.auto));};
$('labels-toggle').onclick=()=>{state.labels=!state.labels;$('labels-toggle').setAttribute('aria-pressed',String(state.labels));};
function setScan(value){state.scan=value;document.querySelector('.app').classList.toggle('scan-active',value);$('scan-mode').classList.toggle('active',value);$('solid-mode').classList.toggle('active',!value);$('scan-mode').setAttribute('aria-pressed',String(value));$('solid-mode').setAttribute('aria-pressed',String(!value));$('scan-readout').textContent=value?'STRUCTURAL SCAN / SCHEMATIC':'SURFACE RENDERING';}
$('scan-mode').onclick=()=>{stopTour();setScan(!state.scan);};$('solid-mode').onclick=()=>{stopTour();setScan(false);};
document.querySelectorAll('[data-explore]').forEach(button=>{button.onclick=()=>{selectPart(Number(button.dataset.explore),true);$('experience').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();state.targets.fill(0);state.selected=-1;setScan(false);renderUI();$('reset-view').click();});
function focusMode(value=!state.focus){state.focus=value;document.querySelector('.app').classList.toggle('focus',value);$('focus-mode').setAttribute('aria-pressed',String(value));}
$('focus-mode').onclick=()=>focusMode();
$('help-button').onclick=()=>{stopTour();if(!$('help-dialog').open)$('help-dialog').showModal();};$('close-help').onclick=$('start-exploring').onclick=()=>$('help-dialog').close();
$('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){stopTour();focusMode(false);return;}if($('help-dialog').open||['INPUT','TEXTAREA'].includes(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(k==='e')explodeAll();if(k==='r')$('reset-view').click();if(k==='a')$('auto-rotate').click();if(k==='l')$('labels-toggle').click();if(k==='x'){stopTour();setScan(!state.scan);}if(k==='?')$('help-button').click();});

try { initializeScene(); } catch(error){console.error(error);$('loading').hidden=true;$('render-error').hidden=false;}
function initializeScene(){
  const viewport=$('viewport'),scene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;viewport.append(renderer.domElement);scene.environmentIntensity=.78;
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);const defaultPosition=new THREE.Vector3(-7.4,4.2,12.4);camera.position.copy(defaultPosition);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=5.5;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.86;controls.enablePan=true;controls.target.set(0,.15,1.25);controls.autoRotateSpeed=.7;
  const lookTarget=new THREE.Vector3(0,.15,1.25);let resetAnimation=0;
  let viewGoal=null;
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{stopTour();state.auto=false;$('auto-rotate').setAttribute('aria-pressed','false');resetAnimation=0;const view=b.dataset.view;const positions={front:[.32,.34,15.8],rear:[.2,.4,-13.5],top:[0,15.5,1.3],hero:[-7.4,4.2,12.4]};viewGoal={position:new THREE.Vector3(...positions[view]),target:new THREE.Vector3(0,.1,view==='rear'?-.2:1.2)};document.querySelectorAll('[data-view]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));});
  $('reset-view').onclick=()=>{stopTour();viewGoal=null;state.auto=false;$('auto-rotate').setAttribute('aria-pressed','false');resetAnimation=1;controls.target.copy(lookTarget);};
  scene.add(new THREE.HemisphereLight(0xf8f4e8,0x252319,1.8));
  function light(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l);return l;}
  const key=light(0xfffae8,3.5,[5,8,7]);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;key.shadow.normalBias=.04;
  light(0xe9eefc,1.8,[-6,3,-5]);light(0xffffff,1.6,[-5,1,8]);light(0xfff3da,2.2,[3,2,-7]);
  const environmentCanvas=document.createElement('canvas');environmentCanvas.width=1024;environmentCanvas.height=512;
  const ec=environmentCanvas.getContext('2d');ec.fillStyle='#25241f';ec.fillRect(0,0,1024,512);const eg=ec.createLinearGradient(0,0,0,512);eg.addColorStop(0,'#6b7079');eg.addColorStop(.5,'#30343b');eg.addColorStop(1,'#08090c');ec.fillStyle=eg;ec.fillRect(0,0,1024,512);ec.fillStyle='#eaf2ff';ec.fillRect(220,50,130,200);ec.fillStyle='#f7f9ff';ec.fillRect(610,60,80,300);ec.fillStyle='#6e7889';ec.fillRect(850,150,100,40);
  const envTexture=new THREE.CanvasTexture(environmentCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(envTexture);scene.environment=env.texture;pmrem.dispose();envTexture.dispose();
  const model=new THREE.Group();scene.add(model);
  const {partGroups}=buildRefinedCamera(THREE,model,partsData);
  function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  // Structural scan: cloned translucent surfaces and genuine geometry edges.
  const scanObjects=[],scanWires=[];
  partGroups.forEach((g,i)=>{const wire=new THREE.Group();const surfaces=[];g.traverse(m=>{if(m.isMesh)surfaces.push(m);});for(const m of surfaces){
    const original=m.material;const ghost=original.clone();ghost.transparent=true;ghost.opacity=[4,5,10].includes(i)?.78:.065;ghost.depthWrite=false;if(ghost.color)ghost.color.set([4,5,10].includes(i)?0xb1a156:0x8e7d3b);if(ghost.emissive){ghost.emissive.set(0x655019);ghost.emissiveIntensity=.18;}scanObjects.push({mesh:m,original,ghost});
    m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new THREE.Vector3());if(m.geometry.type!=='PlaneGeometry'&&Math.max(size.x,size.y,size.z)>.45){const line=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,40),new THREE.LineBasicMaterial({color:i===4?0xffe000:0xd9c06a,transparent:true,opacity:i===4?.85:.38}));line.position.copy(m.position);line.rotation.copy(m.rotation);line.scale.copy(m.scale);wire.add(line);}
  }wire.visible=false;g.add(wire);scanWires.push(wire);});
  let scanApplied=false;
  // Stage floor and concentric guide rings.
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.2}),scene,0,-2.21,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const floorLines=new THREE.Group();scene.add(floorLines);for(const radius of [2.9,3.1,4.3,5.4]){const pts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,-2.24,Math.sin(a)*radius));}floorLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x796a35,transparent:true,opacity:radius<3.2?.25:.07})));}
  const grid=new THREE.GridHelper(28,28,0x4a4023,0x28251a);grid.position.y=-2.27;grid.material.transparent=true;grid.material.opacity=.14;scene.add(grid);
  // Precision turntable: segmented arcs and radial reference marks.
  const dial=new THREE.Group();dial.position.y=-2.20;scene.add(dial);
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2,major=i%8===0;const r=3.22;const len=major?.18:.055;const points=[new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r),new THREE.Vector3(Math.cos(a)*(r+len),0,Math.sin(a)*(r+len))];dial.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:major?0xcabb52:0x7b6f3c,transparent:true,opacity:major?.6:.25})));}
  const orbital=new THREE.Group();orbital.position.y=-2.19;scene.add(orbital);
  [0,Math.PI,Math.PI*1.38].forEach((start,i)=>{const pts=[];for(let t=0;t<=40;t++){const a=start+t/40*(i===2?.3:.8);pts.push(new THREE.Vector3(Math.cos(a)*3.05,0,Math.sin(a)*3.05));}orbital.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:i===0?0xffe000:0xb19b4b,transparent:true,opacity:.7})));});
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gc=glowCanvas.getContext('2d');const gg=gc.createRadialGradient(64,64,4,64,64,64);gg.addColorStop(0,'#d9ac2740');gg.addColorStop(.6,'#8f6f1412');gg.addColorStop(1,'#00000000');gc.fillStyle=gg;gc.fillRect(0,0,128,128);const glowMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const glowPlane=new THREE.Mesh(new THREE.PlaneGeometry(10,10),glowMat);glowPlane.rotation.x=-Math.PI/2;glowPlane.position.y=-2.235;scene.add(glowPlane);
  const scanBeam=new THREE.Mesh(new THREE.PlaneGeometry(6.4,5.8),new THREE.MeshBasicMaterial({color:0xffe000,transparent:true,opacity:.025,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));scanBeam.rotation.x=-Math.PI/2;scanBeam.visible=false;scene.add(scanBeam);
  let tourStarted=0,tourChapter=-1;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  stopTour=()=>{if(!state.tour)return;state.tour=false;controls.enabled=true;controls.enableDamping=true;$('tour-overlay').hidden=true;document.querySelector('.app').classList.remove('tour-playing');$('film-tour').setAttribute('aria-pressed','false');$('film-tour-text').textContent='播放产品演绎';};
  $('stop-tour').onclick=stopTour;
  $('film-tour').onclick=()=>{if(state.tour){stopTour();return;}state.tour=true;state.auto=false;state.labels=false;state.selected=-1;state.targets.fill(0);setScan(false);resetAnimation=0;tourStarted=performance.now();tourChapter=-1;controls.enabled=false;controls.enableDamping=false;$('auto-rotate').setAttribute('aria-pressed','false');$('labels-toggle').setAttribute('aria-pressed','false');$('film-tour').setAttribute('aria-pressed','true');$('film-tour-text').textContent='停止产品演绎';$('tour-overlay').hidden=false;document.querySelector('.app').classList.add('tour-playing');$('experience').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});renderUI();};
  // Connection lines are a visual cue only, displayed when a part is expanded.
  const links=partGroups.map(()=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0x79969d,dashSize:.055,gapSize:.09,transparent:true,opacity:.35}));l.visible=false;scene.add(l);return l;});
  let pointerStart=null;
  renderer.domElement.addEventListener('pointerdown',e=>{stopTour();viewGoal=null;pointerStart={x:e.clientX,y:e.clientY,time:performance.now()};resetAnimation=0;});
  renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart)return;const dist=Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y);if(dist<6&&performance.now()-pointerStart.time<500){const r=renderer.domElement.getBoundingClientRect(),pointer=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(model.children,true).find(h=>h.object.isMesh);if(hit){let target=hit.object;while(target&&target.userData.part===undefined)target=target.parent;if(target)selectPart(target.userData.part,true);}else{state.selected=-1;renderUI();}}pointerStart=null;});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('render-error').hidden=false;$('render-error').querySelector('p').textContent='三维渲染暂时中断，请刷新页面重试。';});
  const resize=()=>{const r=viewport.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(viewport);resize();
  let last=performance.now(),frame=0;const v=new THREE.Vector3();const bounds=new THREE.Box3();const center=new THREE.Vector3();let fitted=0;
  function animate(now){const dt=Math.min((now-last)/1000,.05);last=now;frame++;
    if(state.tour){const seconds=(now-tourStarted)/1000;if(seconds>=20){stopTour();state.targets.fill(0);setScan(false);renderUI();resetAnimation=1;}else{const chapter=Math.floor(seconds/5),u=(seconds%5)/5;
      if(chapter!==tourChapter){tourChapter=chapter;state.targets.fill(chapter===2?1:0);if(chapter===1)state.targets[2]=1;setScan(chapter===2);renderUI();$('tour-chapter').textContent=['01 / FORM','02 / LIGHT','03 / ENGINEERING','04 / UNSTOPPABLE'][chapter];$('tour-caption').textContent=['旗舰，自有锋芒。','从光学，走进影像。','精密，层层展开。','为突破，再次出发。'][chapter];}
      $('tour-progress').style.width=(seconds*5).toFixed(1)+'%';let angle=[.58,.48,.9,.45][chapter]+(reducedMotion?0:Math.sin(u*Math.PI)*[.28,.3,-.35,.15][chapter]);let distance=[13,16,19,15-u*2][chapter]*Math.max(1,1.1/camera.aspect);const target=new THREE.Vector3(0,.2,chapter===1?1.25:.65);controls.target.copy(target);camera.position.set(Math.sin(angle)*distance,3.8+(chapter===2?1.2:0),Math.cos(angle)*distance).add(target);
    }}
    if(state.scan!==scanApplied){scanApplied=state.scan;scanObjects.forEach(({mesh,original,ghost})=>mesh.material=state.scan?ghost:original);scanWires.forEach(w=>w.visible=state.scan);scanBeam.visible=state.scan;}
    if(!reducedMotion)orbital.rotation.y=now*.000065;scanBeam.position.y=reducedMotion?.5:-1.8+(now*.00065%1)*5.5;
    const ease=1-Math.exp(-dt*6);
    partGroups.forEach((g,i)=>{state.progress[i]+=(state.targets[i]-state.progress[i])*ease;const t=state.progress[i];g.position.fromArray(partsData[i].pos);g.position.addScaledVector(v.fromArray(partsData[i].offset),t);g.rotation.set(0,0,0);if(i===2)g.rotation.y=t*-.1;if(i===10)g.rotation.z=t*-.1;if(i===8)g.rotation.x=t*-.06;
      links[i].visible=t>.08;if(t>.08){const points=[new THREE.Vector3().fromArray(partsData[i].pos),g.position.clone()];links[i].geometry.setFromPoints(points);links[i].computeLineDistances();}
    });
    // Shared material instances stay neutral; a separate edge overlay outlines selection.
    if(state.selected!==outlineIndex){updateOutline();}
    if(outline&&state.selected>=0){outline.position.copy(partGroups[state.selected].position);outline.rotation.copy(partGroups[state.selected].rotation);}
    const mean=state.progress.reduce((a,b)=>a+b,0)/12;
    if(!pointerStart&&!resetAnimation&&!state.tour){const targetDistance=(mean>.01?21:15)*Math.max(1,(mean>.01?1.3:1.0)/camera.aspect);const delta=Math.max(...state.targets.map((t,i)=>Math.abs(t-state.progress[i])));if(delta>.005){const dir=camera.position.clone().sub(controls.target);dir.setLength(THREE.MathUtils.lerp(dir.length(),targetDistance,ease*.4));camera.position.copy(controls.target).add(dir);}}
    if(resetAnimation){camera.position.lerp(defaultPosition,1-Math.exp(-dt*5));controls.target.lerp(lookTarget,ease);if(camera.position.distanceTo(defaultPosition)<.01)resetAnimation=0;}
    if(viewGoal){const t=1-Math.exp(-dt*7);camera.position.lerp(viewGoal.position,t);controls.target.lerp(viewGoal.target,t);if(camera.position.distanceTo(viewGoal.position)<.006){camera.position.copy(viewGoal.position);controls.target.copy(viewGoal.target);viewGoal=null;}}
    controls.autoRotate=state.auto&&!resetAnimation&&!viewGoal;controls.update();renderer.render(scene,camera);
    if(frame%2===0){const w=viewport.clientWidth,h=viewport.clientHeight;leaderSvg.setAttribute('viewBox',`0 0 ${w} ${h}`);const columns=[[9,1,3,4,0,10],[8,6,5,7,11,2]];
      partGroups.forEach((g,i)=>{const show=state.labels&&(state.progress[i]>.12||state.selected===i);const l=labelEls[i],line=leaderLines[i];l.hidden=!show;line.style.display=show?'':'none';if(show){g.getWorldPosition(v);if(i===2)v.z+=.8;v.project(camera);const x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h;const col=columns[0].includes(i)?0:1,row=columns[col].indexOf(i);const lx=col===0?Math.min(80,w*.2):w-Math.min(80,w*.2),ly=100+row*(h-175)/5;l.hidden=v.z>1||x<0||x>w||y<0||y>h;line.style.display=l.hidden?'none':'';l.style.left=lx+'px';l.style.top=ly+'px';const end=col===0?lx+30:lx-30;line.setAttribute('d',`M ${x.toFixed(1)} ${y.toFixed(1)} L ${(end+(col===0?25:-25)).toFixed(1)} ${ly.toFixed(1)} L ${end.toFixed(1)} ${ly.toFixed(1)}`);}});}
    if(frame%20===0){$('camera-readout').textContent=`AZ ${THREE.MathUtils.radToDeg(controls.getAzimuthalAngle()).toFixed(1)}° / EL ${(90-THREE.MathUtils.radToDeg(controls.getPolarAngle())).toFixed(1)}° / ${mean>.05?'EXPLODED':'ASSEMBLED'}`;}
    if(frame===3){$('loading').style.opacity='0';setTimeout(()=>$('loading').hidden=true,550);}
    requestAnimationFrame(animate);
  }
  let outline=null,outlineIndex=-2;
  function updateOutline(){if(outline){scene.remove(outline);outline.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});outline=null;}outlineIndex=state.selected;if(state.selected<0)return;outline=new THREE.Group();const source=partGroups[state.selected];source.traverse(m=>{if(m.isMesh&&m.geometry.type!=='PlaneGeometry'){const edges=new THREE.EdgesGeometry(m.geometry,40);const line=new THREE.LineSegments(edges,new THREE.LineBasicMaterial({color:0xe9d48d,transparent:true,opacity:.35,depthTest:true}));line.position.copy(m.position);line.rotation.copy(m.rotation);line.scale.copy(m.scale);outline.add(line);}});scene.add(outline);}
  renderUI();requestAnimationFrame(animate);
}





