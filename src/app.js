import * as THREE from '../dist/vendor/three.module.js';
import { OrbitControls } from '../dist/vendor/OrbitControls.js';

const $ = id => document.getElementById(id);
const partsData = [
  {name:'镁合金机身骨架',en:'MAGNESIUM ALLOY CHASSIS',desc:'承载镜头卡口、感光组件和操作模块。这里以框架形式展示结构层次；支撑筋和连接位置为示意。',facts:[['机身结构','镁合金'],['结构职责','承载 / 保护'],['模型表示','骨架示意']],pos:[0,0,0],offset:[-3.2,-.1,-.8]},
  {name:'前盖与握柄',en:'FRONT SHELL & HANDGRIP',desc:'一体式竖拍机身提供横、竖构图的握持区域。前盖以卡口开孔、红色饰条及握柄纹理呈现 Z9 的外观特征。',facts:[['机身设计','一体式竖拍握柄'],['外观细节','红色握柄饰条'],['建模方式','程序化几何']],pos:[0,0,.64],offset:[-2.5,.2,1.6]},
  {name:'可拆卸镜头',en:'INTERCHANGEABLE Z-MOUNT LENS',desc:'通过 Z 卡口连接机身的镜头外观示意。对焦环、变焦环与镜片反光由代码构建，不对应某一款 NIKKOR 镜头的真实光学结构。',facts:[['连接标准','尼康 Z 卡口'],['镜头造型','通用外观示意'],['外部模型文件','无']],pos:[.25,.38,1.95],offset:[1.4,.35,3.5]},
  {name:'Z 卡口连接环',en:'Z-MOUNT INTERFACE',desc:'镜头与机身之间的机械和电子接口。展示金属连接环与触点的概念外观，连接件数量和排列不作为真实结构依据。',facts:[['卡口类型','尼康 Z 卡口'],['功能','连接镜头与机身'],['触点排列','交互示意']],pos:[.25,.38,.91],offset:[.7,1.2,1.7]},
  {name:'全画幅感光组件',en:'45.7 MP STACKED CMOS',desc:'Z9 使用约 4571 万有效像素的全画幅堆栈式 CMOS 影像传感器。这里以感光面及周围承载框表示，不展示真实电路或防抖机构细节。',facts:[['有效像素','45.7 MP'],['感光元件','35.9 × 23.9 mm'],['传感器形式','堆栈式 CMOS']],pos:[.25,.38,.13],offset:[.4,2.4,2.2]},
  {name:'影像处理主板',en:'EXPEED 7 / MAIN BOARD',desc:'EXPEED 7 是 Z9 的影像处理引擎。此处使用电路板、芯片与走线表达处理模块，电路布局为演示设计，并非真实主板复刻。',facts:[['影像处理引擎','EXPEED 7'],['展示内容','芯片 / 走线示意'],['电路精度','非工程图']],pos:[0,.2,-.3],offset:[2.8,.25,-1.35]},
  {name:'后盖与操作区',en:'REAR SHELL & CONTROLS',desc:'背面布置方向选择器、功能按键与握持区域。旋转模型可查看后部；按键位置与外壳轮廓经过简化。',facts:[['主要功能','取景 / 参数控制'],['交互方式','旋转查看背部'],['外壳细节','简化示意']],pos:[0,0,-.72],offset:[-1.4,.1,-2.25]},
  {name:'多向翻折显示屏',en:'FOUR-AXIS TILTING MONITOR',desc:'约 3.2 英寸、约 210 万画点的可翻折触摸显示屏。画面由 Canvas 绘制；拆解动画演示的是组件分离，不是实际铰链运动。',facts:[['屏幕尺寸','3.2 英寸'],['显示画点','约 210 万'],['显示形式','可翻折触摸屏']],pos:[-.1,.35,-.91],offset:[.2,.5,-3.5]},
  {name:'电子取景器',en:'REAL-LIVE ELECTRONIC VIEWFINDER',desc:'约 369 万画点的 OLED 电子取景器用于实时构图。展示取景器外罩、眼罩及光学窗口的简化层次。',facts:[['显示类型','OLED'],['取景器画点','约 369 万'],['构图方式','电子实时取景']],pos:[.25,1.94,-.25],offset:[0,2.5,-.8]},
  {name:'顶部控制模块',en:'TOP CONTROLS & STATUS DISPLAY',desc:'顶部将快门、拨轮和状态显示组织在双手可达的位置。这里将控制区作为独立模块展开，以便查看上表面。',facts:[['操作组件','快门 / 拨轮'],['辅助显示','顶部状态屏'],['结构表示','合并模块示意']],pos:[0,1.75,0],offset:[-1.7,2.5,.2]},
  {name:'EN-EL18d 电池',en:'RECHARGEABLE LI-ION BATTERY',desc:'Z9 使用 EN-EL18d 锂离子电池。动画从一体式握柄的下部抽出电池，以演示供电组件在机身中的位置关系。',facts:[['电池型号','EN-EL18d'],['额定电压','10.8 V'],['额定容量','3300 mAh']],pos:[-.72,-1.13,-.05],offset:[-.5,-2.15,.5]},
  {name:'双卡槽模块',en:'DUAL MEMORY CARD SLOTS',desc:'双卡槽支持 CFexpress Type B 和 XQD 存储卡。卡片及插槽用于说明存储模块，示意模型不用于指导插拔或维修。',facts:[['卡槽数量','2'],['支持存储卡','CFexpress B / XQD'],['槽位排列','示意']],pos:[1.55,.25,-.05],offset:[2.6,.2,-.35]}
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
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;viewport.append(renderer.domElement);scene.environmentIntensity=.78;
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);const defaultPosition=new THREE.Vector3(6.5,3.9,10.3);camera.position.copy(defaultPosition);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=7;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.86;controls.enablePan=true;controls.target.set(0,.15,.65);controls.autoRotateSpeed=.7;
  const lookTarget=new THREE.Vector3(0,.15,.65);let resetAnimation=0;
  $('reset-view').onclick=()=>{stopTour();state.auto=false;$('auto-rotate').setAttribute('aria-pressed','false');resetAnimation=1;controls.target.copy(lookTarget);};
  scene.add(new THREE.HemisphereLight(0xf8f4e8,0x252319,1.8));
  function light(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l);return l;}
  const key=light(0xfffae8,4.2,[5,8,7]);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;key.shadow.normalBias=.04;
  light(0xffdd65,3.2,[-6,3,-5]);light(0xffffff,1.6,[-5,1,8]);light(0xffed9b,3.6,[3,2,-7]);
  const environmentCanvas=document.createElement('canvas');environmentCanvas.width=1024;environmentCanvas.height=512;
  const ec=environmentCanvas.getContext('2d');ec.fillStyle='#25241f';ec.fillRect(0,0,1024,512);const eg=ec.createLinearGradient(0,0,0,512);eg.addColorStop(0,'#77766b');eg.addColorStop(.5,'#35342c');eg.addColorStop(1,'#080806');ec.fillStyle=eg;ec.fillRect(0,0,1024,512);ec.fillStyle='#fffbed';ec.fillRect(220,50,130,200);ec.fillStyle='#fff4cc';ec.fillRect(610,60,80,300);ec.fillStyle='#e7c544';ec.fillRect(850,150,100,40);
  const envTexture=new THREE.CanvasTexture(environmentCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(envTexture);scene.environment=env.texture;pmrem.dispose();envTexture.dispose();
  const mat=(c,metal=.2,rough=.5)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
  const graphite=mat(0x131313,.32,.49),rubber=mat(0x090908,.06,.82),edge=mat(0x35352f,.7,.35),black=mat(0x080907,.35,.35),silver=mat(0xa9a99b,.95,.23),gold=mat(0xc5a75e,.8,.3),pcb=mat(0x233822,.4,.5),chip=mat(0x191a15,.3,.5);
  const model=new THREE.Group();scene.add(model);const partGroups=[];const pickable=[];
  function group(i){const g=new THREE.Group();g.position.fromArray(partsData[i].pos);g.userData.part=i;model.add(g);partGroups[i]=g;return g;}
  function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);pickable.push(m);return m;}
  function roundShape(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function rounded(w,h,d,r,m,parent,x=0,y=0,z=0){const s=roundShape(w-r*.5,h-r*.5,r);const geo=new THREE.ExtrudeGeometry(s,{depth:d-r*.5,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.25,bevelThickness:r*.25,curveSegments:6});geo.center();return mesh(geo,m,parent,x,y,z);}
  function box(w,h,d,m,p,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);}
  function cylinder(r,len,m,p,x=0,y=0,z=0,r2=r){const a=mesh(new THREE.CylinderGeometry(r,r2,len,64),m,p,x,y,z);a.rotation.x=Math.PI/2;return a;}
  function ring(r,t,m,p,x=0,y=0,z=0){return mesh(new THREE.TorusGeometry(r,t,10,80),m,p,x,y,z);}
  function textTexture(text,{color='#e6e8e6',bg=null,size=52,width=512,height=128,font='Arial',bold=false}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);}ctx.fillStyle=color;ctx.font=`${bold?'bold ':''}${size}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,height/2);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
  function label(text,w,h,p,x,y,z,options={}){const texture=textTexture(text,options);const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});return mesh(new THREE.PlaneGeometry(w,h),m,p,x,y,z);}
  function screw(p,x,y,z,r=.045){cylinder(r,.014,silver,p,x,y,z);box(r*1.2,.012,.018,black,p,x,y,z+.012);}
  // A fine procedural bump texture, shared by both horizontal and vertical grips.
  const noiseCanvas=document.createElement('canvas');noiseCanvas.width=noiseCanvas.height=128;const nc=noiseCanvas.getContext('2d');const ni=nc.createImageData(128,128);let seed=8301;for(let i=0;i<ni.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=90+(seed%110);ni.data[i]=ni.data[i+1]=ni.data[i+2]=v;ni.data[i+3]=255;}nc.putImageData(ni,0,0);const noise=new THREE.CanvasTexture(noiseCanvas);noise.wrapS=noise.wrapT=THREE.RepeatWrapping;noise.repeat.set(3,3);rubber.bumpMap=noise;rubber.bumpScale=.023;
  // 01. Skeleton: an open frame so exploded components remain legible.
  const chassis=group(0);box(.14,3.42,1.17,edge,chassis,-1.82,0,0);box(.14,3.42,1.17,edge,chassis,1.82,0,0);box(3.6,.15,1.15,edge,chassis,0,1.6,0);box(3.6,.15,1.15,edge,chassis,0,-1.6,0);box(3.5,.1,.25,edge,chassis,0,-.65,0);box(.12,3.1,.3,edge,chassis,-.95,0,-.3);box(.13,3.1,.2,edge,chassis,.98,0,-.3);
  [-1.65,1.65].forEach(x=>[-1.42,1.42].forEach(y=>screw(chassis,x,y,.6)));
  // 02. Front shell with a genuine open mount aperture.
  const front=group(1);const fs=roundShape(3.87,3.47,.22);const hole=new THREE.Path();hole.absarc(.25,.38,.97,0,Math.PI*2,true);fs.holes.push(hole);const fg=new THREE.ExtrudeGeometry(fs,{depth:.15,bevelEnabled:true,bevelSize:.055,bevelThickness:.04,bevelSegments:3,curveSegments:30});fg.translate(0,0,-.075);mesh(fg,graphite,front);
  rounded(.83,2.85,.87,.25,rubber,front,-1.51,.12,.17);rounded(3.74,.74,.37,.14,rubber,front,0,-1.33,.12);rounded(.67,.17,.1,.08,mat(0x9b1721,.3,.3),front,-1.48,1.24,.58);
  label('Z 9',.58,.25,front,1.36,1.15,.17,{size:65,bold:false});label('FX',.22,.11,front,1.54,-1.29,.33,{size:52});
  const humpShape=new THREE.Shape();humpShape.moveTo(-.9,1.5);humpShape.lineTo(-.57,2.05);humpShape.quadraticCurveTo(-.5,2.15,-.35,2.15);humpShape.lineTo(.95,2.15);humpShape.quadraticCurveTo(1.06,2.15,1.15,2.02);humpShape.lineTo(1.45,1.5);humpShape.closePath();const humpGeo=new THREE.ExtrudeGeometry(humpShape,{depth:.64,bevelEnabled:true,bevelSize:.055,bevelThickness:.05,bevelSegments:3});mesh(humpGeo,graphite,front,0,0,-.36);label('Nikon',1.14,.36,front,.25,1.84,.365,{size:80,bold:true,font:'Arial'});
  [1.1,.5,-.1].forEach((y,i)=>{cylinder(.1,.08,rubber,front,1.48,y,.2);label(['Fn1','Fn2','Fn3'][i],.19,.09,front,1.48,y,.252,{size:48});});
  [-1.73,1.73].forEach(x=>{const lug=ring(.105,.035,silver,front,x,1.45,.03);lug.rotation.y=Math.PI/2;});
  // 03. Interchangeable lens. Geometry is illustrative, not an optical prescription.
  const lens=group(2);cylinder(.96,.37,edge,lens,0,0,-.89);cylinder(1.03,1.94,graphite,lens,0,0,.1);cylinder(1.09,.3,rubber,lens,0,0,.88);cylinder(1.045,.42,rubber,lens,0,0,-.36);
  [-.84,-.6,-.13,.43,.74,1.06].forEach((z,i)=>ring(i===5?1.055:1.04,i===5?.025:.012,i===1?gold:black,lens,0,0,z));
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2;const rib=box(.023,.027,.4,edge,lens,Math.cos(a)*1.054,Math.sin(a)*1.054,-.36);rib.rotation.z=a;const r=box(.022,.027,.28,edge,lens,Math.cos(a)*1.098,Math.sin(a)*1.098,.88);r.rotation.z=a;}
  cylinder(.98,.05,black,lens,0,0,1.055);ring(.94,.026,silver,lens,0,0,1.09);ring(.81,.018,edge,lens,0,0,1.10);cylinder(.77,.055,black,lens,0,0,1.078);ring(.68,.025,mat(0x234657,.8,.18),lens,0,0,1.12);
  const glass=new THREE.MeshPhysicalMaterial({color:0x23251a,metalness:.35,roughness:.08,clearcoat:1,clearcoatRoughness:.05,iridescence:.42,iridescenceIOR:1.35});cylinder(.65,.027,glass,lens,0,0,1.13);ring(.46,.009,mat(0x5c5a36,.7,.2),lens,0,0,1.15);cylinder(.39,.008,mat(0x11150d,.5,.09),lens,0,0,1.151);ring(.23,.012,mat(0x3c4324,.8,.22),lens,0,0,1.158);
  const glintMat=new THREE.MeshBasicMaterial({color:0xc5ebf0,transparent:true,opacity:.23,depthWrite:false});const glint=mesh(new THREE.CircleGeometry(.14,32),glintMat,lens,-.22,.28,1.164);glint.scale.set(1.4,.45,1);glint.rotation.z=-.6;
  label('NIKKOR Z',1.13,.16,lens,0,.65,1.175,{size:48,color:'#c7c3b6'});label('LENS · CONCEPT',.93,.1,lens,0,-.77,1.175,{size:44,color:'#8f9eaa'});
  rounded(.42,.14,.04,.03,black,lens,.57,-.05,1.04);label('S',.16,.13,lens,.55,-.05,1.067,{size:70,color:'#dadcdd'});
  // 04. Mount ring, open in the centre.
  const mount=group(3);ring(.93,.072,silver,mount);ring(.83,.032,edge,mount,0,0,.04);ring(1.01,.014,black,mount,0,0,-.055);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.6;screw(mount,Math.cos(a)*.93,Math.sin(a)*.93,.085,.034);}for(let i=0;i<11;i++){const a=3.95+i*.07;cylinder(.025,.022,gold,mount,Math.cos(a)*.77,Math.sin(a)*.77,.09);}cylinder(.038,.035,mat(0xf2f1df,.2,.3),mount,.02,.98,.01);
  // 05. Sensor face with interference colour and carrier.
  const sensor=group(4);rounded(1.89,1.55,.2,.1,edge,sensor);rounded(1.44,1.02,.075,.025,silver,sensor,0,0,.12);const sensorTex=document.createElement('canvas');sensorTex.width=512;sensorTex.height=340;const sc=sensorTex.getContext('2d');const sg=sc.createLinearGradient(0,0,512,340);sg.addColorStop(0,'#1a5b69');sg.addColorStop(.35,'#6a4374');sg.addColorStop(.6,'#336d86');sg.addColorStop(1,'#2e4c61');sc.fillStyle=sg;sc.fillRect(0,0,512,340);sc.fillStyle='#ffffff0d';for(let x=0;x<512;x+=3)sc.fillRect(x,0,1,340);const st=new THREE.CanvasTexture(sensorTex);st.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(1.33,.89),new THREE.MeshStandardMaterial({map:st,metalness:.6,roughness:.22}),sensor,0,0,.166);[-.82,.82].forEach(x=>[-.65,.65].forEach(y=>screw(sensor,x,y,.135)));
  // 06. Mainboard: deterministic chip and trace layout.
  const board=group(5);rounded(2.55,2.4,.07,.08,pcb,board);box(.83,.83,.15,chip,board,-.15,.2,-.11);label('EXPEED 7',.68,.14,board,-.15,.2,-.192,{size:52,color:'#cbd9df'}).rotation.y=Math.PI;box(1.12,.07,.03,gold,board,-.65,-.98,-.06);
  for(let i=0;i<28;i++){const x=-1.1+(i%7)*.35,y=-.8+Math.floor(i/7)*.52;if(Math.abs(x+.15)<.6&&Math.abs(y-.2)<.6)continue;box(.21,.13,.065,i%3===0?edge:chip,board,x,y,-.08);}
  const traceMat=new THREE.LineBasicMaterial({color:0x679a76,transparent:true,opacity:.65});for(let i=0;i<26;i++){const x=-1.1+(i%13)*.18;const points=[new THREE.Vector3(x,-1.1,-.045),new THREE.Vector3(x,-.7+(i%3)*.1,-.045),new THREE.Vector3(x+.1,-.5+(i%3)*.1,-.045)];board.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),traceMat));}
  // 07. Rear shell, selector and simplified buttons.
  const rear=group(6);rounded(3.88,3.46,.2,.2,graphite,rear);rounded(.83,2.1,.25,.16,rubber,rear,-1.48,.4,-.18);rounded(3.7,.6,.23,.1,rubber,rear,0,-1.35,-.1);cylinder(.3,.08,rubber,rear,1.3,-.16,-.17);ring(.18,.018,edge,rear,1.3,-.16,-.225);cylinder(.075,.025,edge,rear,1.3,-.16,-.24);
  [[1.3,.75],[1.3,.39],[1.3,-.72],[1.6,-.98],[-1.55,1.14],[-1.2,1.14],[-.85,1.14],[.8,1.15]].forEach(([x,y],i)=>{cylinder(.073,.055,rubber,rear,x,y,-.16);const l=label(['AF','i','MENU','▶','＋','−','DISP','●'][i],.12,.07,rear,x,y,-.2,{size:45});l.rotation.y=Math.PI;});
  // 08. Rear display with generated scene and camera UI.
  const screen=group(7);rounded(2.4,1.72,.15,.13,black,screen);const screenCanvas=document.createElement('canvas');screenCanvas.width=800;screenCanvas.height=520;const dc=screenCanvas.getContext('2d');const sky=dc.createLinearGradient(0,0,0,520);sky.addColorStop(0,'#102739');sky.addColorStop(.5,'#879b9e');sky.addColorStop(.73,'#d4be92');sky.addColorStop(1,'#162f42');dc.fillStyle=sky;dc.fillRect(0,0,800,520);
  function mountain(coords,color){dc.beginPath();dc.moveTo(0,520);coords.forEach(([x,y])=>dc.lineTo(x,y));dc.lineTo(800,520);dc.fillStyle=color;dc.fill();}mountain([[0,290],[80,260],[180,315],[370,155],[490,274],[615,230],[800,325]],'#335265');mountain([[0,370],[170,310],[320,390],[510,290],[680,350],[800,305]],'#183b50');mountain([[0,450],[150,410],[410,475],[680,399],[800,425]],'#0b273b');dc.fillStyle='#cbd3cc';dc.beginPath();dc.moveTo(322,209);dc.lineTo(370,155);dc.lineTo(412,202);dc.lineTo(374,188);dc.lineTo(360,207);dc.fill();
  dc.strokeStyle='#ffffff30';dc.lineWidth=1;[800/3,1600/3].forEach(x=>{dc.beginPath();dc.moveTo(x,40);dc.lineTo(x,480);dc.stroke();});[520/3,1040/3].forEach(y=>{dc.beginPath();dc.moveTo(0,y);dc.lineTo(800,y);dc.stroke();});dc.strokeStyle='#d9e8bf';dc.lineWidth=2;dc.strokeRect(340,214,120,90);dc.fillStyle='#0008';dc.fillRect(0,0,800,44);dc.fillRect(0,470,800,50);dc.font='23px monospace';dc.fillStyle='#e4efef';dc.fillText('M    1/2000    F2.8    ISO 400',22,503);dc.font='18px monospace';dc.fillText('FX   RAW    AF-C',20,29);dc.fillText('Z 9',722,29);dc.strokeStyle='#c5eaa0';dc.strokeRect(727,51,46,20);dc.fillStyle='#c5eaa0';dc.fillRect(730,54,35,14);
  const screenTexture=new THREE.CanvasTexture(screenCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;const display=mesh(new THREE.PlaneGeometry(2.23,1.45),new THREE.MeshBasicMaterial({map:screenTexture}),screen,0,.025,-.085);display.rotation.y=Math.PI;const sl=label('Nikon',.46,.13,screen,0,-.77,-.085,{size:65,bold:true});sl.rotation.y=Math.PI;box(1.3,.12,.14,edge,screen,0,-.87,.04);
  // 09. Viewfinder housing, eyecup and OLED window.
  const evf=group(8);rounded(1.35,.66,1.15,.16,graphite,evf);rounded(1.36,.82,.22,.18,rubber,evf,0,0,-.66);rounded(.82,.47,.08,.1,black,evf,0,0,-.79);rounded(.55,.31,.025,.05,glass,evf,0,0,-.842);box(.67,.04,.32,silver,evf,0,.37,.12);box(.52,.025,.25,black,evf,0,.394,.12);
  // 10. Top plate, shutter and status display.
  const top=group(9);rounded(3.7,.22,1.35,.12,graphite,top);const leftDial=cylinder(.49,.22,rubber,top,-1.19,.23,.02);leftDial.rotation.x=0;const leftTop=label('WB  ·  QUAL',.67,.13,top,-1.19,.35,.04,{size:48});leftTop.rotation.x=-Math.PI/2;
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2;const tick=box(.025,.19,.045,edge,top,-1.19+Math.cos(a)*.494,.23,Math.sin(a)*.494+.02);tick.rotation.y=-a;}
  const lcd=rounded(.89,.04,.51,.04,black,top,.94,.17,-.17);const topLabel=label('1/2000   F2.8',.77,.32,top,.94,.198,-.17,{size:46,color:'#c4d6c4',bg:'#20302a'});topLabel.rotation.x=-Math.PI/2;
  const shutter=cylinder(.18,.1,edge,top,-1.48,.29,.56);shutter.rotation.x=0;[-.8,.8,1.3].forEach(x=>{const b=cylinder(.075,.06,rubber,top,x,.2,.43);b.rotation.x=0;});
  // 11. Battery emerging through the lower grip area.
  const battery=group(10);rounded(1.64,.75,.95,.13,mat(0x20272b,.1,.6),battery);rounded(1.76,.87,.12,.06,graphite,battery,-.02,0,-.49);box(1.08,.32,.018,black,battery,0,.02,.49);label('EN-EL18d',1.05,.22,battery,0,.08,.505,{size:52,color:'#b8c4ca'});label('Li-ion 10.8V',.82,.13,battery,0,-.17,.505,{size:44,color:'#798b97'});for(let i=0;i<6;i++)box(.07,.1,.02,gold,battery,-.4+i*.16,.38,.24);
  // 12. Card cage, with two schematic CFexpress cards.
  const cards=group(11);rounded(.5,1.64,.8,.06,edge,cards);for(let j=0;j<2;j++){rounded(.08,1.21,.61,.025,black,cards,.32+j*.16,0,-.02);box(.012,.72,.43,gold,cards,.365+j*.16,.1,-.02);for(let i=0;i<8;i++)box(.02,.04,.025,silver,cards,.37+j*.16,-.5,-.24+i*.06);}rounded(.14,1.86,1.12,.08,rubber,cards,.59,0,0);const cl=label('CARD',.65,.16,cards,.674,.05,0,{size:48,color:'#788692'});cl.rotation.y=Math.PI/2;
  // Structural scan: cloned translucent surfaces and genuine geometry edges.
  const scanObjects=[],scanWires=[];
  partGroups.forEach((g,i)=>{const wire=new THREE.Group();const surfaces=[];g.traverse(m=>{if(m.isMesh)surfaces.push(m);});for(const m of surfaces){
    const original=m.material;const ghost=original.clone();ghost.transparent=true;ghost.opacity=[4,5,10].includes(i)?.78:.065;ghost.depthWrite=false;if(ghost.color)ghost.color.set([4,5,10].includes(i)?0xb1a156:0x8e7d3b);if(ghost.emissive){ghost.emissive.set(0x655019);ghost.emissiveIntensity=.18;}scanObjects.push({mesh:m,original,ghost});
    m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new THREE.Vector3());if(m.geometry.type!=='PlaneGeometry'&&Math.max(size.x,size.y,size.z)>.45){const line=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,40),new THREE.LineBasicMaterial({color:i===4?0xffe000:0xd9c06a,transparent:true,opacity:i===4?.85:.38}));line.position.copy(m.position);line.rotation.copy(m.rotation);line.scale.copy(m.scale);wire.add(line);}
  }wire.visible=false;g.add(wire);scanWires.push(wire);});
  let scanApplied=false;
  // Stage floor and concentric guide rings.
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.2}),scene,0,-2.02,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const floorLines=new THREE.Group();scene.add(floorLines);for(const radius of [2.9,3.1,4.3,5.4]){const pts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,-2.05,Math.sin(a)*radius));}floorLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x796a35,transparent:true,opacity:radius<3.2?.25:.07})));}
  const grid=new THREE.GridHelper(28,28,0x4a4023,0x28251a);grid.position.y=-2.08;grid.material.transparent=true;grid.material.opacity=.14;scene.add(grid);
  // Precision turntable: segmented arcs and radial reference marks.
  const dial=new THREE.Group();dial.position.y=-2.01;scene.add(dial);
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2,major=i%8===0;const r=3.22;const len=major?.18:.055;const points=[new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r),new THREE.Vector3(Math.cos(a)*(r+len),0,Math.sin(a)*(r+len))];dial.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:major?0xcabb52:0x7b6f3c,transparent:true,opacity:major?.6:.25})));}
  const orbital=new THREE.Group();orbital.position.y=-1.99;scene.add(orbital);
  [0,Math.PI,Math.PI*1.38].forEach((start,i)=>{const pts=[];for(let t=0;t<=40;t++){const a=start+t/40*(i===2?.3:.8);pts.push(new THREE.Vector3(Math.cos(a)*3.05,0,Math.sin(a)*3.05));}orbital.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:i===0?0xffe000:0xb19b4b,transparent:true,opacity:.7})));});
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gc=glowCanvas.getContext('2d');const gg=gc.createRadialGradient(64,64,4,64,64,64);gg.addColorStop(0,'#d9ac2740');gg.addColorStop(.6,'#8f6f1412');gg.addColorStop(1,'#00000000');gc.fillStyle=gg;gc.fillRect(0,0,128,128);const glowMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const glowPlane=new THREE.Mesh(new THREE.PlaneGeometry(10,10),glowMat);glowPlane.rotation.x=-Math.PI/2;glowPlane.position.y=-2.035;scene.add(glowPlane);
  const scanBeam=new THREE.Mesh(new THREE.PlaneGeometry(6.4,5.8),new THREE.MeshBasicMaterial({color:0xffe000,transparent:true,opacity:.025,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));scanBeam.rotation.x=-Math.PI/2;scanBeam.visible=false;scene.add(scanBeam);
  let tourStarted=0,tourChapter=-1;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  stopTour=()=>{if(!state.tour)return;state.tour=false;controls.enabled=true;controls.enableDamping=true;$('tour-overlay').hidden=true;document.querySelector('.app').classList.remove('tour-playing');$('film-tour').setAttribute('aria-pressed','false');$('film-tour-text').textContent='播放产品演绎';};
  $('stop-tour').onclick=stopTour;
  $('film-tour').onclick=()=>{if(state.tour){stopTour();return;}state.tour=true;state.auto=false;state.labels=false;state.selected=-1;state.targets.fill(0);setScan(false);resetAnimation=0;tourStarted=performance.now();tourChapter=-1;controls.enabled=false;controls.enableDamping=false;$('auto-rotate').setAttribute('aria-pressed','false');$('labels-toggle').setAttribute('aria-pressed','false');$('film-tour').setAttribute('aria-pressed','true');$('film-tour-text').textContent='停止产品演绎';$('tour-overlay').hidden=false;document.querySelector('.app').classList.add('tour-playing');$('experience').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});renderUI();};
  // Connection lines are a visual cue only, displayed when a part is expanded.
  const links=partGroups.map(()=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0x79969d,dashSize:.055,gapSize:.09,transparent:true,opacity:.35}));l.visible=false;scene.add(l);return l;});
  let pointerStart=null;
  renderer.domElement.addEventListener('pointerdown',e=>{stopTour();pointerStart={x:e.clientX,y:e.clientY,time:performance.now()};resetAnimation=0;});
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
    if(!pointerStart&&!resetAnimation&&!state.tour){const targetDistance=(mean>.01?18.5:13.3)*Math.max(1,(mean>.01?1.3:1.0)/camera.aspect);const delta=Math.max(...state.targets.map((t,i)=>Math.abs(t-state.progress[i])));if(delta>.005){const dir=camera.position.clone().sub(controls.target);dir.setLength(THREE.MathUtils.lerp(dir.length(),targetDistance,ease*.4));camera.position.copy(controls.target).add(dir);}}
    if(resetAnimation){camera.position.lerp(defaultPosition,1-Math.exp(-dt*5));controls.target.lerp(lookTarget,ease);if(camera.position.distanceTo(defaultPosition)<.01)resetAnimation=0;}
    controls.autoRotate=state.auto&&!resetAnimation;controls.update();renderer.render(scene,camera);
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
