// script.js — DEEP WAVE OMNI GODMODE (module)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';

// DOM
const canvas = document.getElementById('gl');
const micBtn = document.getElementById('micBtn');
const musicBtn = document.getElementById('musicBtn');
const warpBtn = document.getElementById('warpBtn');
const xrBtn = document.getElementById('xrBtn');
const themeSelect = document.getElementById('themeSelect');
const speedVal = document.getElementById('speedVal');
const pingVal = document.getElementById('pingVal');
const trailContainer = document.getElementById('trail');
const adminPanel = document.getElementById('adminPanel');
const particleCountInput = document.getElementById('particleCount');
const audioGainInput = document.getElementById('audioGain') || { value: 1 };

// Simulated network metrics
let simSpeed = 1200, simPing = 9;
setInterval(()=> {
  simSpeed += (Math.random()-0.5)*30; simSpeed = Math.max(50, Math.min(50000, simSpeed));
  simPing += (Math.random()-0.5)*2; simPing = Math.max(1, Math.min(999, simPing));
  speedVal.textContent = Math.round(simSpeed); pingVal.textContent = Math.round(simPing);
}, 1200);

// THREE.js scene
let renderer, scene, camera, composer;
let uniforms;
let particleSystem;
let clock = new THREE.Clock();
let mouse = new THREE.Vector2(0.5,0.5);
let audioCtx, analyser, analyserData, micStream;
let isMusicOn = false;

init();
animate();

// ---------- init ----------
function init(){
  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Scene + camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0,0,6);

  // Fullscreen shader quad (nebula)
  const quadGeo = new THREE.PlaneGeometry(2,2);
  uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0.5,0.5) },
    u_audio: { value: 0.0 },
    u_warp: { value: 0.0 },
    u_theme: { value: 0 }
  };

  const fragment = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_audio;
    uniform float u_warp;
    uniform float u_theme;

    #define ITER 6

    float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
    float noise(vec3 p){
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f*f*(3.0-2.0*f);
      float n = mix(
        mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
        f.z);
      return n;
    }

    float fbm(vec3 p){
      float v=0.0; float a=0.6; float f=1.0;
      for(int i=0;i<ITER;i++){
        v += a*noise(p*f);
        f *= 2.0; a *= 0.55;
      }
      return v;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = uv - 0.5;
      p.x *= u_resolution.x / u_resolution.y;
      vec3 coord = vec3(p*3.0, u_time*0.08 + u_warp*0.5);
      float n = fbm(coord);
      float intensity = smoothstep(0.25, 0.9, n*1.1);
      float pulse = 1.0 + u_audio * 2.0;
      vec3 col = vec3(0.02,0.04,0.08);
      // theme driven palettes
      if(u_theme < 0.5){
        col += vec3(0.0, 0.6, 0.95) * pow(intensity,1.6) * pulse;
        col += vec3(0.8,0.35,1.0) * pow(n*0.5,2.0) * (0.2 + u_mouse.x*0.8);
      } else if(u_theme < 1.5){
        col += vec3(0.9,0.4,0.1) * pow(intensity,1.4) * pulse;
        col += vec3(1.0,0.6,0.2) * pow(n*0.5,1.8) * (0.2 + u_mouse.x*0.6);
      } else {
        col += vec3(0.4,0.1,0.9) * pow(intensity,1.6) * pulse;
        col += vec3(0.6,0.3,0.9) * pow(n*0.5,2.0) * (0.2 + u_mouse.x*0.7);
      }

      // small stars
      float s = fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
      float star = smoothstep(0.9996, 1.0, s + pow(n,3.0)*0.0008);

      vec3 final = col + vec3(star);

      float vig = smoothstep(0.8,0.2, length(p)*1.2);
      final *= vig;
      final = 1.0 - exp(-final * 1.5);
      final = pow(final, vec3(0.85));
      gl_FragColor = vec4(final, 1.0);
    }
  `;
  const mat = new THREE.ShaderMaterial({
    fragmentShader: fragment,
    vertexShader: 'void main(){ gl_Position = vec4(position,1.0); }',
    uniforms, depthTest:false, depthWrite:false
  });
  const quad = new THREE.Mesh(quadGeo, mat);
  scene.add(quad);

  // particle system (foreground)
  const initialCount = parseInt(particleCountInput?.value || 600);
  createParticleSystem(initialCount);

  // pointer events
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('resize', onResize);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('dblclick', onDoubleClick);
  window.addEventListener('keydown', onKeyDown);

  // UI events
  micBtn.addEventListener('click', startMic);
  musicBtn.addEventListener('click', toggleMusic);
  warpBtn.addEventListener('click', warpPulse);
  xrBtn.addEventListener('click', startXRPlaceholder);
  themeSelect.addEventListener('change', e=> {
    const val = e.target.value;
    uniforms.u_theme.value = (val === 'galaxy')?0:(val==='dawn'?1:2);
  });

  particleCountInput?.addEventListener('input', (e)=> {
    recreateParticles(parseInt(e.target.value));
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    recreateParticles(parseInt(particleCountInput?.value || 600));
    uniforms.u_warp.value = 0;
  });

  // audio setup (fallback oscillator)
  setupAudio();
}

// ---------- particle system ----------
function createParticleSystem(count){
  if(particleSystem){
    scene.remove(particleSystem);
    particleSystem.geometry.dispose();
    particleSystem.material.dispose();
  }
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count*3);
  const vel = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    pos[i*3] = (Math.random()-0.5)*8;
    pos[i*3+1] = (Math.random()-0.5)*6;
    pos[i*3+2] = (Math.random()-0.5)*4;
    vel[i*3] = (Math.random()-0.5)*0.01;
    vel[i*3+1] = (Math.random()-0.5)*0.01;
    vel[i*3+2] = (Math.random()-0.5)*0.01;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('vel', new THREE.BufferAttribute(vel,3));
  const mat = new THREE.PointsMaterial({ color:0x66ffff, size:0.03, transparent:true, opacity:0.95 });
  particleSystem = new THREE.Points(geo, mat);
  scene.add(particleSystem);
}

function recreateParticles(n){
  createParticleSystem(n);
  console.log('particles recreated:', n);
}

// ---------- audio ----------
async function setupAudio(){
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.85;
    analyserData = new Uint8Array(analyser.frequencyBinCount);

    // tiny inaudible oscillator as fallback driver so visuals animate even without mic/music
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain(); g.gain.value = 0.00008;
    osc.type = 'sine'; osc.frequency.value = 40;
    osc.connect(g); g.connect(analyser); analyser.connect(audioCtx.destination);
    osc.start();
    // store source node for music toggle
    window.__deepwave_osc = { osc, gain: g };
  } catch (e){
    console.warn('Audio init failed', e);
  }
}

async function startMic(){
  if(!audioCtx) await setupAudio();
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { alert('Mic not supported'); return; }
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:false });
    const src = audioCtx.createMediaStreamSource(micStream);
    src.connect(analyser);
    // optional: set user gain from UI
    alert('Microphone enabled for audio-reactive visuals.');
  } catch (e){
    console.warn('Mic denied', e); alert('Microphone access denied.');
  }
}

function toggleMusic(){
  if(!audioCtx) { setupAudio(); return; }
  const oscObj = window.__deepwave_osc;
  if(!oscObj) return;
  isMusicOn = !isMusicOn;
  if(isMusicOn){ oscObj.osc.frequency.value = 120; musicBtn.textContent = '🔇 Music'; }
  else { oscObj.osc.frequency.value = 40; musicBtn.textContent = '🔊 Music'; }
}

// ---------- interactions ----------
let pointerX = 0, pointerY = 0;
function onPointerMove(e){
  const x = e.clientX / window.innerWidth;
  const y = 1 - (e.clientY / window.innerHeight);
  mouse.set(x,y);
  uniforms.u_mouse.value.set(x,y);
  pointerX = e.clientX; pointerY = e.clientY;
  spawnTrailDot(e.clientX, e.clientY);
}

function spawnTrailDot(x,y){
  const el = document.createElement('div');
  el.style.position='fixed'; el.style.left=(x-8)+'px'; el.style.top=(y-8)+'px';
  el.style.width='16px'; el.style.height='16px'; el.style.borderRadius='50%';
  el.style.background='radial-gradient(circle, rgba(0,240,255,0.95), rgba(180,107,255,0.6))';
  el.style.pointerEvents='none'; el.style.zIndex=70; el.style.mixBlendMode='screen';
  trailContainer.appendChild(el);
  el.animate([{transform:'scale(1)',opacity:1},{transform:'scale(0.2)',opacity:0}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)'});
  setTimeout(()=> el.remove(),760);
}

function onClick(e){
  // supernova: push particle velocities outward from click
  const rect = canvas.getBoundingClientRect();
  const nx = ((e.clientX - rect.left)/rect.width)*2 - 1;
  const ny = -((e.clientY - rect.top)/rect.height)*2 + 1;
  explodeParticles(nx*4, ny*3);
}

function onDoubleClick(){
  reformToLogo('DEEP WAVE');
}

function onKeyDown(e){
  if(e.key === 'p' || e.key === 'P') {
    alert('Plans: Wave Nano (100 Mbps), Wave Titan (500 Mbps), Wave Infinity (1 Gbps)');
  }
  if(e.key === '`') adminPanel.classList.toggle('hidden');
}

// particle helpers
function explodeParticles(cx, cy){
  const pos = particleSystem.geometry.attributes.position.array;
  const vel = particleSystem.geometry.attributes.vel.array;
  for(let i=0;i<pos.length;i+=3){
    const dx = pos[i] - cx;
    const dy = pos[i+1] - cy;
    const dz = pos[i+2];
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;
    const power = 0.6 + Math.random()*1.3;
    vel[i] = dx/dist * power;
    vel[i+1] = dy/dist * power;
    vel[i+2] = dz/dist * power;
  }
}

// reform to text: map image pixels to particle targets
function reformToLogo(text){
  const c = document.createElement('canvas'); c.width=800; c.height=200;
  const ctx = c.getContext('2d');
  ctx.fillStyle='black'; ctx.fillRect(0,0,c.width,c.height);
  ctx.font = 'bold 110px Orbitron, sans-serif';
  ctx.textAlign='center'; ctx.fillStyle='white'; ctx.fillText(text, c.width/2, c.height/1.35);
  const data = ctx.getImageData(0,0,c.width,c.height).data;
  const points = [];
  for(let y=0;y<c.height;y+=6){
    for(let x=0;x<c.width;x+=6){
      const idx = (y*c.width + x)*4;
      if(data[idx] > 200){
        const nx = (x - c.width/2)/120;
        const ny = (c.height/2 - y)/120;
        points.push([nx, ny, (Math.random()-0.5)*0.2]);
        if(points.length >= particleSystem.geometry.attributes.position.count) break;
      }
    }
    if(points.length >= particleSystem.geometry.attributes.position.count) break;
  }
  // animate to points
  const pos = particleSystem.geometry.attributes.position.array;
  let step=0; const max = 90;
  const intv = setInterval(()=> {
    step++;
    for(let i=0;i<points.length;i++){
      const pi = i*3;
      pos[pi] += (points[i][0] - pos[pi]) * 0.12;
      pos[pi+1] += (points[i][1] - pos[pi+1]) * 0.12;
      pos[pi+2] += (points[i][2] - pos[pi+2]) * 0.12;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    if(step > max) clearInterval(intv);
  }, 30);
}

// ---------- XR placeholder ----------
function startXRPlaceholder(){
  if(!navigator.xr){ alert('WebXR not supported in this browser/device.'); return; }
  // In production: initialize THREE.WebXRManager or R3F; this is a placeholder to request session
  navigator.xr.isSessionSupported('immersive-ar').then(supported => {
    if(!supported) { alert('XR supported but immersive-ar not available.'); return; }
    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] }).then(session => {
      alert('XR session started (placeholder). For full XR integrate THREE.WebXRManager in production.');
      session.end();
    }).catch(()=> alert('XR session failed.'));
  });
}

// ---------- resize ----------
function onResize(){
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
}

// ---------- animate ----------
function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  uniforms.u_time.value = t;

  // audio analysis
  if(analyser && analyserData){
    analyser.getByteFrequencyData(analyserData);
    let sum=0;
    for(let i=0;i<32;i++) sum += analyserData[i];
    let avg = sum / (32*255);
    avg *= (parseFloat(audioGainInput.value) || 1.0);
    uniforms.u_audio.value = avg;
    // small automatic warp on heavy bass
    if(avg > 0.18) uniforms.u_warp.value = Math.min(1.2, uniforms.u_warp.value + avg*0.03);
    else uniforms.u_warp.value = Math.max(0, uniforms.u_warp.value * 0.98);
  }

  // particle physics simple integrator
  const pos = particleSystem.geometry.attributes.position.array;
  const vel = particleSystem.geometry.attributes.vel.array;
  for(let i=0;i<pos.length;i+=3){
    vel[i] *= 0.992; vel[i+1] *= 0.992; vel[i+2] *= 0.992;
    pos[i] += vel[i]; pos[i+1] += vel[i+1]; pos[i+2] += vel[i+2];
    // gentle pull-to-center
    pos[i] += -pos[i]*0.0006; pos[i+1] += -pos[i+1]*0.0006;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;

  // subtle camera parallax based on mouse
  const cx = (mouse.x - 0.5) * 2.0, cy = (mouse.y - 0.5) * 2.0;
  camera.position.x += (cx*0.6 - camera.position.x) * 0.02;
  camera.position.y += (cy*0.35 - camera.position.y) * 0.02;

  renderer.render(scene, camera);
}

// ---------- finalize: create particle system in scene  ----------
function createParticleSystem(count){
  // called from init; ensures particleSystem exists
  if(particleSystem){ scene.remove(particleSystem); }
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  const velocities = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    positions[i*3] = (Math.random()-0.5)*8;
    positions[i*3+1] = (Math.random()-0.5)*6;
    positions[i*3+2] = (Math.random()-0.5)*4;
    velocities[i*3] = (Math.random()-0.5)*0.01;
    velocities[i*3+1] = (Math.random()-0.5)*0.01;
    velocities[i*3+2] = (Math.random()-0.5)*0.01;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('vel', new THREE.BufferAttribute(velocities,3));
  const material = new THREE.PointsMaterial({ size:0.03, color:0x66ffff, transparent:true, opacity:0.95 });
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

// create with default count
createParticleSystem(parseInt(particleCountInput?.value || 600));

// ---------- small service-worker hint (register) ----------
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW reg failed', e));
}

// END OF FILE