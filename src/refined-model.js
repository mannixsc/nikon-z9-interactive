// Exterior study from Nikon's Z9 body diagrams and first-generation 24–70/2.8 S photos.
// Scale: 0.03 scene units/mm. Major dimensions are anchored; unmeasured curves are visual estimates.
export function buildRefinedCamera(T, model, partsData) {
  const groups = [], hardware = [];
  const material = (color, roughness=.55, metalness=.12) => new T.MeshStandardMaterial({color, roughness, metalness});
  const shell=material(0x1b1c1f,.63,.06), rubber=material(0x151619,.86,.01), satin=material(0x17191b,.53,.12), black=material(0x050607,.5,.1), steel=material(0x9ca1a4,.24,.93), darkMetal=material(0x363b40,.32,.7), gold=material(0xc7a65c,.27,.84), white=material(0xe0e1de,.56,.08);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');let seed=21924;const pixels=ctx.createImageData(512,512);
  for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=100+(seed%105);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);
  // Deterministic, softly rounded pebble pattern instead of uniform horizontal ridges.
  for(let i=0;i<6200;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%512;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%512,r=1+(seed%30)/10;ctx.fillStyle=`rgb(${130+seed%80},${130+seed%80},${130+seed%80})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.7,seed%6,0,Math.PI*2);ctx.fill();}
  const grain=new T.CanvasTexture(canvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(2,2);
  rubber.bumpMap=grain;rubber.bumpScale=.034;shell.bumpMap=grain;shell.bumpScale=.007;
  const lensGrain=grain.clone();lensGrain.repeat.set(2,1);satin.bumpMap=lensGrain;satin.bumpScale=.003;
  const glass=new T.MeshPhysicalMaterial({color:0x123233,roughness:.055,metalness:.25,clearcoat:1,clearcoatRoughness:.025,iridescence:.6,iridescenceIOR:1.34});
  function add(geo,mat,p,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);hardware.push(m);return m;}
  function group(i){const g=new T.Group();g.position.fromArray(partsData[i].pos);g.userData.part=i;model.add(g);groups[i]=g;return g;}
  function shape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function extrude(s,d,mat,p,x=0,y=0,z=0,bevel=.025){const geo=new T.ExtrudeGeometry(s,{depth:d-2*bevel,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:4,curveSegments:20,steps:1});geo.translate(0,0,-(d-2*bevel)/2);return add(geo,mat,p,x,y,z);}
  function rounded(w,h,d,r,mat,p,x=0,y=0,z=0){const b=Math.min(.035,d/5,r/3);return extrude(shape(w-b*2,h-b*2,r),d,mat,p,x,y,z,b);}
  const box=(w,h,d,mat,p,x=0,y=0,z=0)=>add(new T.BoxGeometry(w,h,d),mat,p,x,y,z);
  function softbox(w,h,d,r,mat,p,x=0,y=0,z=0){const geo=new T.BoxGeometry(w,h,d,12,8,12);const a=geo.attributes.position;const v=new T.Vector3(),core=new T.Vector3(),n=new T.Vector3();for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);core.set(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));n.copy(v).sub(core).normalize();v.copy(core).addScaledVector(n,r);a.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();return add(geo,mat,p,x,y,z);}
  function cyl(r,d,mat,p,x=0,y=0,z=0,r2=r){const m=add(new T.CylinderGeometry(r,r2,d,96),mat,p,x,y,z);m.rotation.x=Math.PI/2;return m;}
  const torus=(r,t,mat,p,x=0,y=0,z=0)=>add(new T.TorusGeometry(r,t,8,96),mat,p,x,y,z);
  function annulus(outer,inner,d,mat,p,x=0,y=0,z=0){const s=new T.Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new T.Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return extrude(s,d,mat,p,x,y,z,.004);}
  function label(text,w,h,p,x,y,z,{rear=false,top=false,side=0,size=62,color='#deded9',bg=null,italic=false}={}){const c=document.createElement('canvas');c.width=768;c.height=Math.max(96,Math.round(768*h/w));const cx=c.getContext('2d');if(bg){cx.fillStyle=bg;cx.fillRect(0,0,c.width,c.height);}cx.fillStyle=color;const fontSize=Math.min(c.height*.72,c.width*.88/Math.max(1,text.length*.6));cx.font=`${italic?'italic bold ':''}${fontSize}px Arial`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,c.width/2,c.height/2);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;const m=add(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),p,x,y,z);if(rear)m.rotation.y=Math.PI;if(top)m.rotation.x=-Math.PI/2;if(side)m.rotation.y=side*Math.PI/2;return m;}
  function line(points,p,mat=black,r=.007){const path=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a)));return add(new T.TubeGeometry(path,Math.max(16,points.length*8),r,5,false),mat,p);}
  function screw(p,x,y,z,r=.036,rear=false){cyl(r,.014,steel,p,x,y,z);const a=box(r*1.22,.009,.018,black,p,x,y,z+(rear?-.01:.01));a.rotation.z=.5;box(.009,r*1.22,.018,black,p,x,y,z+(rear?-.011:.011));}
  function button(p,x,y,z,text,r=.1,rear=false){cyl(r+.016,.025,satin,p,x,y,z);const cap=cyl(r,.04,rubber,p,x,y,z+(rear?-.017:.017));if(text)label(text,r*2.4,r*1.8,p,x,y,z+(rear?-.042:.042),{rear,size:64});return cap;}
  function topButton(p,x,y,z,text,r=.09,rec=false){const a=cyl(r,.048,rubber,p,x,y,z);a.rotation.x=0;if(rec){const b=cyl(.035,.006,material(0xb93d1b,.6),p,x,y+.026,z);b.rotation.x=0;}else label(text,r*2.4,r*1.8,p,x,y+.027,z,{top:true,size:62});return a;}
  function ribbed(r,z,len,p,count=144){cyl(r,len,rubber,p,0,0,z);const geo=new T.BoxGeometry(.012,.018,len*.97);const im=new T.InstancedMesh(geo,satin,count);const dummy=new T.Object3D();for(let i=0;i<count;i++){const a=i/count*Math.PI*2;dummy.position.set(Math.cos(a)*(r+.002),Math.sin(a)*(r+.002),z);dummy.rotation.z=a-Math.PI/2;dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);}im.castShadow=true;im.receiveShadow=true;p.add(im);hardware.push(im);return im;}
  function dial(p,x,y,z,r=.26,vertical=false){const d=cyl(r,.16,rubber,p,x,y,z);if(vertical)d.rotation.set(0,0,Math.PI/2);for(let i=0;i<44;i++){const a=i/44*Math.PI*2;if(!vertical){const t=box(.018,.035,.17,darkMetal,p,x+Math.cos(a)*r,y+Math.sin(a)*r,z);t.rotation.z=a;}else{const t=box(.17,.018,.035,darkMetal,p,x,y+Math.sin(a)*r,z+Math.cos(a)*r);t.rotation.x=-a;}}return d;}
  // A hollow frame remains an explanatory layer, not an undocumented factory CAD claim.
  const chassis=group(0);[-1.9,1.9].forEach(x=>rounded(.13,3.65,1.16,.05,darkMetal,chassis,x,-.16,0));[-1.85,1.38].forEach(y=>rounded(3.8,.12,1.16,.04,darkMetal,chassis,0,y,0));rounded(3.6,.1,.4,.04,darkMetal,chassis,0,-.9,0);
  // Main shell: correct near-square integrated-grip silhouette and real open mount aperture.
  const front=group(1);const outline=shape(4.31,3.64,.32);const aperture=new T.Path();aperture.absarc(.32,.57,.95,0,Math.PI*2,true);outline.holes.push(aperture);extrude(outline,1.43,shell,front,0,-.23,-.1,.045);
  // Sculpted grip: elliptical loft with differing cross sections and a concave finger transition.
  function loftGrip(p){const sections=[[-1.52,-1.66,.35,.77,.36],[-1.33,-1.72,.45,.77,.54],[-.85,-1.76,.43,.78,.62],[.05,-1.77,.43,.8,.65],[.86,-1.73,.46,.76,.64],[1.13,-1.7,.48,.72,.56],[1.37,-1.68,.43,.67,.48]];const verts=[],uv=[],indices=[],N=72;sections.forEach(([y,x,rx,z,rz],j)=>{for(let k=0;k<=N;k++){const a=k/N*Math.PI*2;verts.push(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz);uv.push(k/N,j/(sections.length-1));}});for(let j=0;j<sections.length-1;j++)for(let k=0;k<N;k++){const a=j*(N+1)+k,b=a+N+1;indices.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();add(g,rubber,p);}
  loftGrip(front);
  const lower=softbox(4.1,1.0,.6,.24,rubber,front,-.03,-1.53,.71);lower.rotation.x=.035;
  // Front textured lands, sculpted around the circular mount instead of covering it.
  const land=new T.Shape();land.moveTo(-1.42,1.12);land.lineTo(-.72,1.08);land.quadraticCurveTo(-1.17,.35,-.72,-.47);land.lineTo(-.49,-.79);land.lineTo(-1.4,-.8);land.closePath();extrude(land,.035,rubber,front,0,0,.645,.006);
  const rightLand=new T.Shape();rightLand.moveTo(1.38,1.16);rightLand.lineTo(2.09,1.13);rightLand.lineTo(2.09,-.87);rightLand.lineTo(1.45,-.92);rightLand.quadraticCurveTo(1.12,-.64,1.33,-.22);rightLand.quadraticCurveTo(1.56,.42,1.3,1.02);rightLand.closePath();extrude(rightLand,.04,rubber,front,0,0,.65,.006);
  line([[-1.35,-.91,.78],[-.8,-.95,.81],[.2,-1.03,.88],[1.4,-1.08,.85],[1.94,-.94,.73]],front,black,.008);
  // Three function buttons are beside the primary grip, as on Z9, not the opposite side.
  [.65,.07,-.47].forEach((y,i)=>button(front,-.99,y,.724,`Fn${i+1}`,.116));
  label('Z',.35,.28,front,-1.03,1.14,.73,{size:140,italic:true});
  button(front,-1.06,1.53,.78,'',.085); // AF-assist lamp.
  // Lens-release button and covered sync / ten-pin terminals on the connector side.
  rounded(.22,.4,.08,.07,black,front,1.53,.35,.72);rounded(.17,.31,.035,.055,rubber,front,1.53,.35,.772);
  [.99,1.46].forEach(y=>{rounded(.42,.43,.14,.13,satin,front,1.81,y,.69);cyl(.14,.04,rubber,front,1.81,y,.78);});
  const focusMode=button(front,1.94,-.54,.7,'',.12);focusMode.rotation.y=.3;label('AF',.13,.1,front,1.94,-.54,.75,{size:70});
  // Genuine red accent follows the grip shoulder and bends down at its outer edge.
  line([[-2.09,1.1,1.11],[-2.02,.98,1.21],[-1.8,.95,1.3],[-1.55,.96,1.27],[-1.4,1.0,1.17]],front,material(0xa31120,.34,.3),.019);
  // Strap lugs with separate triangular metal loops.
  [-2.13,2.13].forEach(x=>{rounded(.13,.21,.22,.04,satin,front,x,1.41,-.01);const t=torus(.106,.023,steel,front,x+(x<0?-.06:.06),1.41,.065);t.rotation.y=x<0?-.6:.6;t.scale.y=1.2;});
  // Port covers and battery latch on camera's left (front-view right).
  const sideCover=rounded(.9,1.52,.06,.08,rubber,front,2.17,.28,-.14);sideCover.rotation.y=Math.PI/2;
  line([[2.21,.32,-.54],[2.21,.32,.24]],front,black,.009);
  label('MIC  ♧  LAN',.75,.14,front,2.209,.68,-.12,{side:1,size:67});label('HDMI',.62,.14,front,2.21,.03,-.12,{side:1,size:67});label('USB',.42,.14,front,2.21,-.34,-.12,{side:1,size:65});
  const door=rounded(1.03,.9,.09,.22,satin,front,2.16,-1.56,-.04);door.rotation.y=Math.PI/2;const latch=cyl(.18,.04,black,front,2.235,-1.53,-.02);latch.rotation.y=Math.PI/2;const latchBar=rounded(.29,.07,.03,.025,darkMetal,front,2.26,-1.53,-.02);latchBar.rotation.y=Math.PI/2;
  // Vertical front controls and sub-command wheel.
  button(front,-1.76,-1.55,1.05,'',.14);label('L',.12,.12,front,-1.77,-1.28,1.065,{size:80});button(front,-1.99,-1.44,1.01,'ISO',.07);button(front,-1.97,-1.82,1,'',.068);
  dial(front,-1.31,-1.58,1.0,.23,true);rounded(.1,.52,.1,.03,satin,front,-1.29,-1.58,1.015);
  // First-generation NIKKOR Z 24–70/2.8 S, at its compact 24 mm position, without hood.
  const lens=group(2);cyl(.985,.09,steel,lens,0,0,.045);cyl(1.04,.5,satin,lens,0,0,.32);torus(1.043,.018,black,lens,0,0,.12);
  ribbed(1.08,.73,.29,lens,132);cyl(1.145,.26,satin,lens,0,0,.98,1.075);cyl(1.267,.65,satin,lens,0,0,1.4,1.145);
  const zoomBarrel=new T.Group();lens.add(zoomBarrel);
  cyl(1.29,.26,satin,zoomBarrel,0,0,1.87,1.26);ribbed(1.30,2.21,.67,zoomBarrel,180);cyl(1.297,.36,satin,zoomBarrel,0,0,2.73);ribbed(1.315,3.1,.4,zoomBarrel,180);cyl(1.31,.23,satin,zoomBarrel,0,0,3.425);annulus(1.335,1.18,.12,satin,zoomBarrel,0,0,3.59);
  [2.58,2.86,3.32,3.53].forEach(z=>torus(z===3.53?1.32:1.301,.008,black,zoomBarrel,0,0,z));
  annulus(1.335,1.23,.1,black,zoomBarrel,0,0,3.72);[1.24,1.21,1.18].forEach(r=>torus(r,.008,darkMetal,zoomBarrel,0,0,3.755));
  // Recessed concave element and nested optical surfaces, no invented optical prescription.
  const opticsCanvas=document.createElement('canvas');opticsCanvas.width=opticsCanvas.height=1024;const oc=opticsCanvas.getContext('2d');
  const coating=oc.createRadialGradient(500,490,0,512,512,510);[[0,'#020607'],[.12,'#06120f'],[.2,'#1c3430'],[.25,'#080f10'],[.34,'#102326'],[.4,'#37524a'],[.44,'#0a1214'],[.57,'#182e2b'],[.66,'#2c4146'],[.74,'#111e22'],[.91,'#080f13'],[1,'#020508']].forEach(([at,c])=>coating.addColorStop(at,c));oc.fillStyle=coating;oc.fillRect(0,0,1024,1024);
  const sheen=oc.createRadialGradient(300,280,0,300,280,480);sheen.addColorStop(0,'#addad439');sheen.addColorStop(.45,'#80b5bc1f');sheen.addColorStop(1,'#00000000');oc.fillStyle=sheen;oc.fillRect(0,0,1024,1024);
  [.2,.25,.4,.44,.66,.74].forEach((r,i)=>{oc.beginPath();oc.arc(512,512,r*510,0,Math.PI*2);oc.strokeStyle=i%2?'#9ba89130':'#93b5ad20';oc.lineWidth=2;oc.stroke();});
  const opticalMap=new T.CanvasTexture(opticsCanvas);opticalMap.colorSpace=T.SRGBColorSpace;
  const frontGlass=new T.MeshBasicMaterial({map:opticalMap,color:0xd1e3db});
  const profile=[];for(let i=0;i<=32;i++){const r=i/32*1.165;profile.push(new T.Vector2(r,3.56+.14*(r/1.165)**2));}const lensGeometry=new T.LatheGeometry(profile.reverse(),128);const lensPositions=lensGeometry.attributes.position,uvs=[];for(let i=0;i<lensPositions.count;i++)uvs.push(.5+lensPositions.getX(i)/2.33,.5-lensPositions.getZ(i)/2.33);lensGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));const surface=add(lensGeometry,frontGlass,zoomBarrel);surface.rotation.x=Math.PI/2;
  const optical=material(0x03090b,.11,.4);cyl(.81,.015,optical,zoomBarrel,0,0,3.545);torus(.7,.024,material(0x365447,.18,.6),zoomBarrel,0,0,3.56);cyl(.45,.013,material(0x071413,.12,.6),zoomBarrel,0,0,3.57);torus(.27,.012,glass,zoomBarrel,0,0,3.582);
  function arcText(text,r,z,start=0,span=2,p=zoomBarrel){const chars=[...text];chars.forEach((char,i)=>{if(char===' ')return;const a=start+(i/(chars.length-1)-.5)*span;const m=label(char,.12,.12,p,Math.sin(a)*r,Math.cos(a)*r,z,{size:180,color:'#b6b8b9'});m.rotation.z=-a;});}
  arcText('NIKKOR',1.275,3.779,0,.48);arcText('Z 24-70mm 1:2.8 S  Ø82',1.275,3.779,Math.PI,1.65);
  // Top OLED lens information panel, DISP, left-side L-Fn, focus-mode switch.
  const info=rounded(.54,.8,.04,.065,black,lens,0,1.272,1.4);info.rotation.x=-Math.PI/2;
  label('24mm',.44,.44,lens,0,1.298,1.42,{top:true,size:110,color:'#d8e6dd',bg:'#070b0e'});
  topButton(lens,.53,1.18,1.38,'DISP',.095);const fn=button(lens,.99,.65,1.39,'',.12);fn.rotation.set(0,0,Math.PI/2);label('L-Fn',.25,.13,lens,1.15,.66,1.43,{side:1,size:100});
  const am=rounded(.11,.3,.28,.025,black,lens,1.065,-.05,.34);label('A   M',.38,.13,lens,1.127,.16,.35,{side:1,size:90});const sw=rounded(.05,.1,.09,.015,darkMetal,lens,1.13,-.05,.29);
  label('24-70/2.8 S',1.28,.22,lens,0,1.045,.32,{top:true,size:115});label('S',.3,.23,lens,1.1,-.28,.43,{side:1,size:160});
  [24,28,35,50,70].forEach((n,i)=>{const a=(i-1.3)*.24;const l=label(String(n),.22,.16,lens,Math.sin(a)*1.305,Math.cos(a)*1.305,1.81,{size:105});l.rotation.set(-Math.PI/2,0,-a);});topButton(lens,0,1.28,1.69,'•',.025);cyl(.04,.016,white,lens,0,1.041,.13);
  // Mount: open bore, four primary screws, bayonet lands, contacts above the sensor.
  const mount=group(3);annulus(1.012,.825,.09,steel,mount);torus(1.047,.034,black,mount,0,0,-.035);annulus(.83,.79,.055,darkMetal,mount,0,0,-.025);
  [Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach(a=>screw(mount,Math.cos(a)*.936,Math.sin(a)*.936,.054,.038));screw(mount,.95,0,.054,.026);
  for(let i=0;i<11;i++){const a=.96+i*.122;cyl(.021,.018,gold,mount,Math.cos(a)*.785,Math.sin(a)*.785,-.015);}
  for(let i=0;i<3;i++){const s=new T.Shape();const a=i*Math.PI*2/3+.05;s.absarc(0,0,.84,a,a+.54,false);s.absarc(0,0,.785,a+.54,a,true);s.closePath();extrude(s,.035,darkMetal,mount,0,0,-.065,.003);}cyl(.028,.02,white,mount,.75,.75,.063);
  const sensor=group(4);rounded(1.66,1.29,.14,.09,darkMetal,sensor);rounded(1.3,.91,.05,.04,steel,sensor,0,0,.09);rounded(1.077,.717,.02,.012,glass,sensor,0,0,.125);[-.72,.72].forEach(x=>[-.52,.52].forEach(y=>screw(sensor,x,y,.09)));
  const board=group(5);rounded(3.0,2.62,.055,.09,material(0x203d2d,.65,.2),board);rounded(.77,.77,.09,.02,black,board,-.12,.3,-.07);label('EXPEED 7',.69,.2,board,-.12,.3,-.12,{rear:true,size:105});for(let i=0;i<32;i++){const x=-1.3+i%8*.36,y=-1+Math.floor(i/8)*.56;if(Math.abs(x)<.57&&Math.abs(y-.3)<.6)continue;box(.23,.16,.05,i%4?black:darkMetal,board,x,y,-.055);}
  // Rear shell: seen from behind, the primary grip and all selectors are on the right.
  const rear=group(6);rounded(4.29,3.58,.17,.26,shell,rear,0,-.25,0);softbox(.44,1.78,.3,.13,rubber,rear,-1.95,.17,-.16);rounded(3.99,.65,.18,.15,rubber,rear,0,-1.62,-.11);
  button(rear,1.65,1.12,-.13,'▱',.095,true);button(rear,1.25,1.12,-.13,'Fn4',.095,true);
  button(rear,-.88,1.12,-.17,'DISP',.116,true);torus(.16,.019,darkMetal,rear,-.88,1.12,-.19);line([[-.98,1.26,-.21],[-.9,1.31,-.21],[-.84,1.3,-.21]],rear,darkMetal,.024);
  button(rear,-1.46,1.24,-.24,'AF-ON',.13,true);const rearWheel=cyl(.15,.47,rubber,rear,-1.94,1.28,-.18);rearWheel.rotation.set(0,0,Math.PI/2);for(let i=0;i<36;i++){const a=i/36*Math.PI*2;box(.45,.012,.016,darkMetal,rear,-1.94,1.28+Math.sin(a)*.154,-.18+Math.cos(a)*.154);}
  function joystick(p,x,y,z){cyl(.13,.055,satin,p,x,y,z);cyl(.098,.04,rubber,p,x,y,z-.045);for(let i=-2;i<=2;i++){const l=box(.14,.008,.01,darkMetal,p,x,y+i*.026,z-.071);l.rotation.z=.65;const l2=box(.14,.008,.01,darkMetal,p,x,y+i*.026,z-.073);l2.rotation.z=-.65;}}
  joystick(rear,-1.18,.76,-.2);button(rear,-1.18,.35,-.18,'i',.11,true);
  cyl(.265,.055,rubber,rear,-1.37,-.09,-.15);torus(.218,.015,darkMetal,rear,-1.37,-.09,-.192);button(rear,-1.37,-.09,-.213,'OK',.13,true);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const m=box(.055,.016,.015,darkMetal,rear,-1.37+Math.cos(a)*.218,-.09+Math.sin(a)*.218,-.205);m.rotation.z=a;}
  [[-1.17,-.51,'+'],[-1.65,-.51,'MENU'],[-1.17,-.84,'−'],[-1.65,-.84,'▶']].forEach(([x,y,t])=>button(rear,x,y,-.18,t,.105,true));
  joystick(rear,-1.25,-1.27,-.2);button(rear,-1.84,-1.32,-.19,'AF-ON',.112,true);button(rear,-.64,-1.73,-.19,'Fn',.1,true);button(rear,-1.67,-1.7,-.19,'i',.08,true);
  [[.14,'WB'],[.61,'QUAL'],[1.08,'MIC']].forEach(([x,t])=>button(rear,x,-1.73,-.19,t,.097,true));label('LAN',.24,.11,rear,1.58,-1.65,-.22,{rear:true,size:100});const led=cyl(.018,.012,material(0x72ae4b,.4),rear,1.58,-1.51,-.22);
  for(let i=0;i<7;i++)cyl(.012,.02,black,rear,-.22+(i%3)*.045,-1.75+Math.floor(i/3)*.052,-.22);
  // Rectangular display inside a four-axis hinge frame. Display image is a generated camera UI.
  const screen=group(7);rounded(2.72,1.97,.18,.11,black,screen);rounded(2.8,2.06,.08,.1,darkMetal,screen,0,0,.115);[-1.13,1.13].forEach(x=>{rounded(.13,.43,.09,.035,steel,screen,x,-.74,.17);});
  const sc=document.createElement('canvas');sc.width=960;sc.height=640;const dc=sc.getContext('2d');const sky=dc.createLinearGradient(0,0,0,640);sky.addColorStop(0,'#153448');sky.addColorStop(.55,'#9cafa6');sky.addColorStop(1,'#12334b');dc.fillStyle=sky;dc.fillRect(0,0,960,640);function mountains(coords,color){dc.fillStyle=color;dc.beginPath();dc.moveTo(0,640);coords.forEach(a=>dc.lineTo(...a));dc.lineTo(960,640);dc.fill();}mountains([[0,370],[180,300],[340,370],[520,150],[720,340],[960,300]],'#3e5d66');mountains([[0,450],[240,360],[450,470],[660,350],[960,470]],'#1b3948');dc.fillStyle='#e0e2d1';dc.beginPath();dc.moveTo(453,230);dc.lineTo(520,150);dc.lineTo(585,224);dc.lineTo(526,203);dc.fill();dc.strokeStyle='#ffffff30';dc.lineWidth=1;[320,640].forEach(x=>{dc.beginPath();dc.moveTo(x,45);dc.lineTo(x,590);dc.stroke();});[220,420].forEach(y=>{dc.beginPath();dc.moveTo(0,y);dc.lineTo(960,y);dc.stroke();});dc.strokeStyle='#c8ed95';dc.strokeRect(420,250,120,100);dc.fillStyle='#060909bf';dc.fillRect(0,0,960,45);dc.fillRect(0,580,960,60);dc.fillStyle='#e9eee5';dc.font='25px monospace';dc.fillText('M   1/2000   F2.8   ISO 400',30,620);dc.font='23px monospace';dc.fillText('FX  RAW  AF-C  24mm',25,32);dc.fillText('Z 9',866,32);const texture=new T.CanvasTexture(sc);texture.colorSpace=T.SRGBColorSpace;const display=add(new T.PlaneGeometry(2.51,1.674),new T.MeshBasicMaterial({map:texture}),screen,0,.025,-.096);display.rotation.y=Math.PI;label('Nikon',.43,.16,screen,0,-.9,-.102,{rear:true,italic:true,size:150});
  // EVF: sloping prism-like housing, circular rubber eyecup and rectangular viewing aperture.
  const evf=group(8);const hump=new T.Shape();hump.moveTo(-.91,-.41);hump.lineTo(-.62,.57);hump.quadraticCurveTo(-.58,.64,-.47,.64);hump.lineTo(.47,.64);hump.quadraticCurveTo(.58,.64,.62,.57);hump.lineTo(.91,-.41);hump.closePath();const housing=extrude(hump,1.35,shell,evf,0,0,-.05,.04);housing.rotation.x=-.18;
  const logo=label('Nikon',1.17,.39,evf,0,.18,.66,{size:160,italic:true});logo.rotation.x=-.18;
  cyl(.49,.16,black,evf,0,.05,-.86);torus(.425,.1,rubber,evf,0,.05,-.98);torus(.335,.038,satin,evf,0,.05,-1.04);rounded(.49,.31,.025,.06,black,evf,0,.05,-1.055);rounded(.4,.24,.02,.045,glass,evf,0,.05,-1.071);cyl(.048,.025,black,evf,0,.57,-.88);
  const diopter=cyl(.14,.13,rubber,evf,-.77,.06,-.59);diopter.rotation.set(0,0,Math.PI/2);button(evf,.79,.11,-.58,'M',.062,true);
  box(.67,.035,.73,darkMetal,evf,0,.68,-.12);[-.27,.27].forEach(x=>{box(.065,.06,.69,steel,evf,x,.721,-.12);box(.055,.025,.66,darkMetal,evf,x,.764,-.12);});box(.41,.026,.4,black,evf,0,.715,-.05);for(let i=0;i<4;i++){const c=cyl(.021,.006,gold,evf,-.12+i*.08,.735,.12);c.rotation.x=0;}
  // Top plate and shoulder controls. LCD above primary grip; four-button crown opposite.
  const top=group(9);rounded(4.26,.21,1.45,.18,shell,top,0,0,-.1);const gripShoulder=softbox(1.12,.42,1.23,.18,shell,top,-1.65,.09,.65);gripShoulder.rotation.x=-.14;
  const lcd=rounded(1.13,.048,.65,.055,black,top,-1.15,.15,-.3);label('M  1/2000  F2.8',1.02,.29,top,-1.15,.178,-.3,{top:true,size:79,color:'#a3b9a8',bg:'#131c19'});label('RAW   ISO 400   [126]',1.02,.2,top,-1.15,.179,-.51,{top:true,size:63,color:'#82998a'});label('Z 9',.36,.2,top,-1.94,.12,-.46,{top:true,size:120,italic:true});
  const shutter=cyl(.22,.07,satin,top,-1.65,.34,.7);shutter.rotation.x=0;const shutterCap=cyl(.145,.065,black,top,-1.65,.39,.7);shutterCap.rotation.x=0;const power=torus(.196,.018,darkMetal,top,-1.65,.379,.7);power.rotation.x=-Math.PI/2;label('OFF • ON',.6,.15,top,-1.65,.347,.97,{top:true,size:95});
  topButton(top,-1.18,.33,.67,'',.085,true);topButton(top,-1.61,.33,.3,'ISO',.084);topButton(top,-1.97,.33,.4,'±',.084);
  const frontDial=cyl(.14,.59,rubber,top,-1.64,.01,1.18);frontDial.rotation.set(0,0,Math.PI/2);for(let i=0;i<36;i++){const a=i/36*Math.PI*2;box(.57,.012,.018,darkMetal,top,-1.64,.01+Math.sin(a)*.143,1.18+Math.cos(a)*.143);}
  const crown=cyl(.438,.19,rubber,top,1.44,.23,-.01);crown.rotation.x=0;for(let i=0;i<64;i++){const a=i/64*Math.PI*2;const t=box(.014,.15,.027,darkMetal,top,1.44+Math.cos(a)*.44,.23,Math.sin(a)*.44-.01);t.rotation.y=-a;}
  const crownTop=cyl(.412,.034,satin,top,1.44,.344,-.01);crownTop.rotation.x=0;
  [[0,-.24,'BKT'],[.24,0,'▣'],[-.24,0,'ϟ'],[0,.24,'MODE']].forEach(([x,z,t])=>topButton(top,1.44+x,.372,-.01+z,t,.114));topButton(top,1.94,.18,.35,'',.047);
  // Battery and card cage remain schematic internal exhibits. Exterior door belongs to card group.
  const battery=group(10);rounded(1.58,.67,.97,.1,satin,battery);rounded(1.73,.82,.1,.07,shell,battery,0,0,-.51);label('EN-EL18d',1.2,.22,battery,0,.08,.495,{size:105});label('Li-ion 10.8 V  3300 mAh',1.3,.14,battery,0,-.17,.495,{size:64});for(let i=0;i<6;i++)box(.07,.1,.025,gold,battery,-.4+i*.16,.32,.21);
  const cards=group(11);rounded(.4,1.5,.83,.06,darkMetal,cards);for(let j=0;j<2;j++){rounded(.07,1.1,.61,.02,black,cards,-.1+j*.2,0,0);box(.018,.68,.4,gold,cards,-.06+j*.2,0,0);}
  const cardDoor=rounded(.11,2.12,1.28,.07,rubber,cards,-.28,.05,0);line([[-.34,-.96,-.51],[-.34,.88,-.51]],cards,black,.008);
  return {partGroups:groups, pickable:hardware};
}



