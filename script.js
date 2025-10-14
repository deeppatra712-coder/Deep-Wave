/* DEEP WAVE — Multiverse ULTRA WLORD Infinity 11D+ JS
   - 11D visual (Three.js layered nebula + energy core)
   - starfield + meteors + visitors globe
   - DeepMind mock AI (voice + text)
   - AR mock (camera overlay)
   - Spin-to-win, onboarding, theme presets
*/

/* ---------- basic UI helpers ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
function $(s){return document.querySelector(s)}
function $all(s){return document.querySelectorAll(s)}

/* ---------- Onboard ---------- */
const onboard = $('#onboard');
if(onboard){ onboard.classList.remove('hidden'); }
$('#startTour')?.addEventListener('click', ()=> { onboard.classList.add('hidden'); startTour(); });
$('#skipTour')?.addEventListener('click', ()=> onboard.classList.add('hidden'));

/* ---------- Title rotation ---------- */
const titleLines = [
  "Not just a Network — A Multiverse.",
  "Where Reality Ends — Deep Wave Begins.",
  "Beyond Dimensions, Beyond Limits."
];
let tI = 0;
setInterval(()=> { tI=(tI+1)%titleLines.length; $('#titleLine').textContent = titleLines[tI]; }, 4200);

/* ---------- 11D Universe (Three.js multi-layer) ---------- */
(function initUniverse(){
  const container = document.getElementById('hero-3d');
  if(!container || typeof THREE === 'undefined') return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth/container.clientHeight, 0.1, 1000);
  camera.position.set(0,0,6);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // layered nebula planes (11D illusion: multiple subtly moving layers)
  const nebGroup = new THREE.Group();
  for(let i=0;i<8;i++){
    const g = new THREE.PlaneGeometry(16,9,1,1);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hsl(${200+i*10},100%,${12+i*3}%)), transparent:true, opacity:0.06 + i*0.02, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const m = new THREE.Mesh(g, mat);
    m.position.z = -i*0.6 - 1;
    m.rotation.z = Math.PI*0.02*i;
    nebGroup.add(m);
  }
  scene.add(nebGroup);

  // central energy core (glowing sphere with wobble)
  const coreGeo = new THREE.SphereGeometry(1.1, 64, 64);
  const coreMat = new THREE.MeshStandardMaterial({ color:0x00e8ff, emissive:0x003355, emissiveIntensity:2.8, metalness:0.3, roughness:0.2, transparent:true });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // holographic shell
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.4,32,32), new THREE.MeshBasicMaterial({ color:0xb46bff, wireframe:true, opacity:0.18, transparent:true }));
  scene.add(shell);

  // star cloud (points)
  const starCount = 2500;
  const pos = new Float32Array(starCount*3);
  for(let i=0;i<pos.length;i++){ pos[i] = (Math.random()-0.5)*80 }
  const starsGeo = new THREE.BufferGeometry(); starsGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const starsMat = new THREE.PointsMaterial({ color:0x00f0ff, size:0.02, transparent:true, opacity:0.85 });
  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // lights
  const p1 = new THREE.PointLight(0x00f0ff, 1.8, 200); p1.position.set(6,3,6); scene.add(p1);
  const p2 = new THREE.PointLight(0xb46bff, 1.2, 120); p2.position.set(-4,-3,6); scene.add(p2);

  // mouse parallax
  let mx=0,my=0;
  document.addEventListener('mousemove', (e)=>{ mx = (e.clientX/window.innerWidth)*2-1; my = (e.clientY/window.innerHeight)*2-1; });

  // resize
  window.addEventListener('resize', ()=>{ renderer.setSize(container.clientWidth, container.clientHeight); camera.aspect = container.clientWidth/container.clientHeight; camera.updateProjectionMatrix(); });

  // animate
  let time = 0;
  function animate(){
    requestAnimationFrame(animate);
    time += 0.005;
    core.rotation.y += 0.01; core.scale.setScalar(1 + Math.sin(time*2)*0.03);
    shell.rotation.x += 0.003; shell.rotation.y += 0.004;
    stars.rotation.y += 0.0008;
    nebGroup.children.forEach((ch, idx)=>{ ch.rotation.z += 0.0005 * (idx+1); ch.position.x = Math.sin(time*0.05*(idx+1))*0.3; });
    camera.position.x += (mx*0.6 - camera.position.x)*0.04;
    camera.position.y += (-my*0.35 - camera.position.y)*0.04;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Starfield + occasional meteors (DOM) ---------- */
(function starfield(){
  const canvas = document.createElement('canvas'); canvas.id='sf'; canvas.style.position='absolute'; canvas.style.inset='0'; canvas.style.zIndex='2'; canvas.style.pointerEvents='none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  window.addEventListener('resize', resize); resize();
  const stars = [];
  for(let i=0;i<300;i++){ stars.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r: Math.random()*1.2, v:0.1+Math.random()*0.6}) }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const s of stars){ ctx.beginPath(); ctx.fillStyle = rgba(255,255,255,${0.06 + s.r*0.5}); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); s.x -= s.v; if(s.x < -10) { s.x = canvas.width + 10; s.y = Math.random()*canvas.height } }
    requestAnimationFrame(draw);
  }
  draw();
  // meteors
  setInterval(()=> {
    const m = document.createElement('div'); m.className='meteor'; m.style.position='fixed'; m.style.zIndex=999; m.style.pointerEvents='none';
    const left = Math.random()*90 + '%'; m.style.left = left; m.style.top = '-10%'; m.style.width='2px'; m.style.height='100px';
    m.style.background='linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,240,255,0.0))'; m.style.transform = rotate(${25+Math.random()*60}deg);
    document.body.appendChild(m);
    const dur = 1000 + Math.random()*1400;
    m.animate([{transform: m.style.transform, top:'-10%'},{transform: m.style.transform, top:'110%'}], {duration:dur, easing:'linear'});
    setTimeout(()=> m.remove(), dur+50);
  }, 3500);
})();

/* ---------- Visitors Globe (mini simulated) ---------- */
(function visitorsMini(){
  const vwrap = document.createElement('div'); vwrap.style.position='fixed'; vwrap.style.right='20px'; vwrap.style.bottom='120px'; vwrap.style.zIndex=60; vwrap.style.pointerEvents='none';
  vwrap.innerHTML = <canvas id="visCanvas" width="160" height="120" style="width:160px;height:120px;border-radius:8px;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.6));"></canvas>;
  document.body.appendChild(vwrap);
  const c = document.getElementById('visCanvas'), ctx = c.getContext('2d');
  function draw(){ ctx.clearRect(0,0,c.width,c.height); ctx.beginPath(); ctx.arc(80,60,38,0,Math.PI*2); ctx.fillStyle='rgba(0,240,255,0.03)'; ctx.fill();
    const now = Date.now(); for(let i=0;i<6;i++){ const a = (now/1000 + i) * (0.6 + i*0.2); const x = 80 + Math.cos(a)(28 - i*3); const y = 60 + Math.sin(a)(16 + i*2); ctx.beginPath(); ctx.fillStyle = rgba(0,240,255,${0.22 + (i%2)*0.24}); ctx.arc(x,y,2.8,0,Math.PI*2); ctx.fill(); } requestAnimationFrame(draw); }
  draw();
})();

/* ---------- DeepMind AI mock (voice + text) ---------- */
const aiReply = $('#aiReply'); const aiInput = $('#aiInput'); const aiStatus = $('#aiStatus');
$('#askBtn')?.addEventListener('click', processQuery);
document.getElementById('micBtn')?.addEventListener('click', startVoiceRecognition);

function processQuery(){
  const q = aiInput.value.trim();
  if(!q){ aiReply.textContent = "Try: 'Check my speed' or 'Recommend a plan'."; return; }
  aiReply.textContent = "DeepMind analyzing…";
  aiStatus.textContent = "DeepMind: processing";
  setTimeout(()=> {
    if(/speed|ping/i.test(q)){
      aiReply.innerHTML = Simulated Speed: <strong>${Math.round(window.simSpeed||350)} Mbps</strong> • Ping: <strong>${Math.round(window.simPing||22)} ms</strong>;
    } else if(/recommend|best|plan/i.test(q)){
      const rec = (window.simSpeed||350) < 500 ? 'Wave Titan (500 Mbps)' : 'Wave Infinity (1 Gbps)';
      aiReply.innerHTML = Recommendation: <strong>${rec}</strong> — AI Boost available;
    } else if(/ar/i.test(q)){
      aiReply.textContent = "AR Mock: open camera & follow on-screen guide.";
    } else {
      aiReply.textContent = "DeepMind: I can check speed, recommend plans, or open AR mock.";
    }
    aiStatus.textContent = "DeepMind: ready";
  }, 900);
}

/* speech recognition (if available) */
function startVoiceRecognition(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ aiReply.textContent='Voice not supported in this browser.'; return; }
  const r = new SpeechRecognition(); r.lang = 'en-US'; r.interimResults=false;
  aiReply.textContent = 'Listening…';
  r.start();
  r.onresult = (e)=>{ const t = e.results[0][0].transcript; aiInput.value = t; processQuery(); }
  r.onerror = ()=> { aiReply.textContent = 'Microphone not accessible.' }
}

/* voice intro toggle */
let voiceOn=false;
$('#voiceToggle')?.addEventListener('click', ()=>{
  voiceOn = !voiceOn; $('#voiceToggle').textContent = voiceOn? '🔊 Voice On' : '🔈 Voice';
  if(voiceOn) speakText("Welcome to Deep Wave Multiverse. DeepMind online.");
});
function speakText(txt){ if(!('speechSynthesis' in window)) return; const u = new SpeechSynthesisUtterance(txt); u.lang='en-US'; u.rate=1; u.pitch=1; speechSynthesis.speak(u); }

/* ---------- Simulated speed & ping engine ---------- */
window.simSpeed = 400; window.simPing = 18;
setInterval(()=> {
  window.simSpeed += (Math.random()-0.5)*60; window.simSpeed = Math.max(80, Math.min(2000, window.simSpeed));
  window.simPing += (Math.random()-0.5)*4; window.simPing = Math.max(4, Math.min(240, window.simPing));
  $('#speedVal').textContent = Math.round(window.simSpeed); $('#pingVal').textContent = Math.round(window.simPing);
}, 900);

/* ---------- Theme presets (galaxy/dawn/nebula) ---------- */
const themeBtn = $('#themeBtn');
const themes = ['galaxy','dawn','nebula']; let th = 0;
themeBtn?.addEventListener('click', ()=> {
  th = (th+1)%themes.length; document.documentElement.setAttribute('data-theme', themes[th]);
  // quick palette tweak (simple)
  if(themes[th]==='dawn'){ document.body.style.background = 'linear-gradient(180deg,#fff9f0,#e9eefb)'; document.body.style.color='#041027'; } else { document.body.style.background='linear-gradient(180deg,var(--bg1),var(--bg2))'; document.body.style.color=''; }
});

/* ---------- AR Mock (camera overlay) ---------- */
$('#arBtn')?.addEventListener('click', async ()=>{
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ alert('Camera not supported'); return; }
  const vwrap = document.createElement('div'); vwrap.className='overlay'; document.body.appendChild(vwrap);
  vwrap.innerHTML = <video id="camvid" autoplay playsinline style="width:100%;height:100%;object-fit:cover;border-radius:12px"></video><button class="btn outline" id="closeCam" style="position:absolute;top:18px;right:18px;z-index:999">Close AR</button>;
  const vid = document.getElementById('camvid');
  try{ const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); vid.srcObject = stream; }
  catch(e){ alert('Camera access denied'); vwrap.remove(); return; }
  // overlay hologram
  const holo = document.createElement('div'); holo.style.position='absolute'; holo.style.left='50%'; holo.style.top='30%'; holo.style.transform='translateX(-50%)'; holo.style.zIndex=999; holo.innerHTML = <div style="padding:12px 18px;background:rgba(0,0,0,0.3);border-radius:12px;border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(8px)">🔮 Deep Wave Hologram (Mock)</div>; vwrap.appendChild(holo);
  $('#closeCam')?.addEventListener('click', ()=>{ const tracks = vid.srcObject?.getTracks()||[]; tracks.forEach(t=>t.stop()); vwrap.remove(); });
});

/* ---------- Spin & Win ---------- */
function startSpin(){ $('#spinModal').classList.remove('hidden'); drawSpinWheel(); }
function closeSpin(){ $('#spinModal').classList.add('hidden'); $('#spinResult').textContent=''; }
function drawSpinWheel(){
  const canvas = document.getElementById('spinCanvas'); if(!canvas) return; const ctx = canvas.getContext('2d');
  const prizes = ['₹100 OFF','Extra 50GB','Free Router','AI Boost','10% OFF','Free Install','₹50 OFF','Surprise'];
  const len = prizes.length; const cx=160,cy=160,r=140;
  // draw slices
  for(let i=0;i<len;i++){
    const a0 = (i/len)*Math.PI*2; const a1 = ((i+1)/len)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,a0,a1); ctx.closePath();
    ctx.fillStyle = i%2? 'rgba(0,240,255,0.08)' : 'rgba(155,107,255,0.06)'; ctx.fill();
    ctx.save(); ctx.translate(cx,cy); ctx.rotate((a0+a1)/2); ctx.fillStyle='#fff'; ctx.fillText(prizes[i], r*0.6, 6); ctx.restore();
  }
  // spin logic
  $('#spinBtn').onclick = ()=> {
    $('#spinResult').textContent = 'Spinning…';
    let rot = 0; const target = Math.random()*Math.PI*2 + 6*Math.PI;
    const start = performance.now();
    function anim(now){
      const t = (now-start)/2000; const ease = (--t)*t*t+1; const cur = ease*target;
      canvas.style.transform = rotate(${cur}rad);
      if(now-start < 2200) requestAnimationFrame(anim); else {
        const final = (target%(Math.PI*2)); const idx = Math.floor((len - (final/(Math.PI*2))*len)%len); $('#spinResult').textContent = You won: ${prizes[idx]}; 
      }
    }
    requestAnimationFrame(anim);
  };
}

/* ---------- Speed Test simulator (fake but smooth) ---------- */
$('#runSpeed')?.addEventListener('click', ()=> {
  $('#aiReply').textContent = 'Running simulated speed test…';
  const res = {down:0, up:0, ping:0}; let step=0;
  const iv = setInterval(()=> {
    step++; res.down = Math.round(Math.min(2000, step*(30+Math.random()80))); res.up = Math.round(res.down(0.2+Math.random()*0.6)); res.ping = Math.round(Math.max(3, 60 - step*1.5 + Math.random()*8));
    $('#aiReply').innerHTML = Speed: <strong>${res.down} Mbps</strong> • Ping: <strong>${res.ping} ms</strong>;
    if(step>25){ clearInterval(iv); $('#aiReply').innerHTML += '<br><em>Test complete — results are simulated.</em>'; }
  }, 180);
});

/* ---------- Globe show (full-screen simulation) ---------- */
$('#globeBtn')?.addEventListener('click', ()=> {
  alert('Visitors Globe simulated in the hero corner. Full globe requires advanced Three.js setup; contact for pro integration.');
});

/* ---------- Portal entrance (visual) ---------- */
function openPortal(){
  speakText('Opening DeepVerse portal'); document.body.classList.add('portal');
  setTimeout(()=> { alert('Welcome to DeepVerse — simulated portal entrance.'); document.body.classList.remove('portal'); }, 900);
}

/* ---------- Enquiry & contact ---------- */
function enquire(plan){ alert(Thanks! Enquiry received for ${plan}. We will contact you.); }
function submitContact(e){ e.preventDefault(); alert('Thank you — message received.'); e.target.reset(); }

/* ---------- Tour (simple) ---------- */
function startTour(){
  const steps = [
    'This is the 11D holographic hero.',
    'AI Hub: Ask DeepMind for recommendations.',
    'Tools: Try AR Mock and Speed Test.',
    'Spin the Galaxy Wheel for rewards.'
  ];
  let s=0; (function step(){ if(s>=steps.length) { alert('Tour finished — enjoy Deep Wave!'); return; } alert(steps[s]); s++; setTimeout(step,400); })();
}

/* ---------- simple keyboard voice nav ---------- */
document.addEventListener('keydown', (e)=> {
  if(e.key === 'p') location.href='#plans';
  if(e.key === 'v') { voiceOn = !voiceOn; if(voiceOn) speakText('Voice enabled'); }
});

/* ---------- End of script ---------- */