/* DEEP WAVE — AI Hyper System JS
   Features:
   - auto tagline swap (two lines)
   - starfield background
   - orb particle visuals
   - simulated speed + ping chart
   - voice intro & mic input (SpeechRecognition if available)
   - theme toggle (dark / light quick)
*/

// ---------- basic text taglines -------------
const lines = [
  "Beyond World, Beyond Logic — The Internet of the Future.",
  "Connecting Galaxies at the Speed of Thought — Deep Wave."
];
let li = 0;
const headlineEl = document.getElementById('headlineLine');
setInterval(()=> {
  li = (li+1) % lines.length;
  headlineEl.textContent = lines[li];
}, 4200);

// ---------- set year -------------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- starfield background ----------
const starCanvas = document.getElementById('starfield');
const starCtx = starCanvas.getContext('2d');
function resizeStar() {
  starCanvas.width = innerWidth;
  starCanvas.height = innerHeight;
}
window.addEventListener('resize', resizeStar);
resizeStar();

const stars = [];
for(let i=0;i<250;i++){
  stars.push({
    x: Math.random()*starCanvas.width,
    y: Math.random()*starCanvas.height,
    r: Math.random()*1.3,
    v: 0.1 + Math.random()*0.6
  });
}
function drawStars(){
  starCtx.clearRect(0,0,starCanvas.width,starCanvas.height);
  for(const s of stars){
    starCtx.beginPath();
    starCtx.fillStyle = rgba(255,255,255,${0.08 + s.r*0.6});
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    starCtx.fill();
    s.x -= s.v;
    if(s.x < -10){ s.x = starCanvas.width + 10; s.y = Math.random()*starCanvas.height }
  }
  requestAnimationFrame(drawStars);
}
drawStars();

// ---------- AI orb canvas visual ----------
const orbCanvas = document.getElementById('orbCanvas');
const orbCtx = orbCanvas.getContext('2d');
function resizeOrb(){ orbCanvas.width = orbCanvas.clientWidth; orbCanvas.height = orbCanvas.clientHeight; }
resizeOrb(); window.addEventListener('resize', resizeOrb);

let orbAngle = 0;
function drawOrb(){
  orbCtx.clearRect(0,0,orbCanvas.width,orbCanvas.height);
  const cx = orbCanvas.width/2, cy = orbCanvas.height/2;
  // rotating glow rings
  for(let i=0;i<5;i++){
    orbCtx.beginPath();
    orbCtx.strokeStyle = rgba(${i*40+20},${150+i*20},255,${0.06 + i*0.02});
    orbCtx.lineWidth = 2 + i*1;
    orbCtx.arc(cx, cy, 30 + i*12, orbAngle*0.2 + i, orbAngle*0.2 + i + 1.8);
    orbCtx.stroke();
  }
  // particles
  for(let p=0;p<10;p++){
    const angle = orbAngle*0.1 + p;
    const x = cx + Math.cos(angle*1.7+p)* (36 + p*2);
    const y = cy + Math.sin(angle*1.3+p)* (30 + p*2);
    orbCtx.beginPath();
    orbCtx.fillStyle = rgba(0,240,255,${0.06 + p*0.03});
    orbCtx.arc(x,y,2 + p*0.6,0,Math.PI*2);
    orbCtx.fill();
  }
  orbAngle += 0.06;
  requestAnimationFrame(drawOrb);
}
drawOrb();

// ---------- speed simulation & chart ----------
const speedVal = document.getElementById('speedValue');
const pingVal = document.getElementById('pingValue');
const chartCanvas = document.getElementById('speedChart');
const chartCtx = chartCanvas.getContext('2d');
let speed = 100, ping = 24; let chartData = new Array(30).fill(speed);

function updateSim(){
  // gentle random walk
  speed += (Math.random()-0.5) * 40;
  speed = Math.max(50, Math.min(1200, speed));
  ping += (Math.random()-0.5)*6; ping = Math.max(6, Math.min(200,ping));
  speedVal.textContent = Math.round(speed);
  pingVal.textContent = Math.round(ping);
  chartData.push(speed); if(chartData.length>60) chartData.shift();
  drawChart();
}
setInterval(updateSim, 900);

// draw small line chart
function drawChart(){
  const w = chartCanvas.width, h = chartCanvas.height;
  chartCtx.clearRect(0,0,w,h);
  // gradient fill
  const grad = chartCtx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'rgba(155,107,255,0.28)');
  grad.addColorStop(1,'rgba(0,240,255,0.04)');
  chartCtx.fillStyle = grad;
  chartCtx.strokeStyle = 'rgba(255,255,255,0.85)';
  chartCtx.lineWidth = 2;
  chartCtx.beginPath();
  for(let i=0;i<chartData.length;i++){
    const x = (i/(chartData.length-1))*w;
    const y = h - ((chartData[i]-50)/1150)*h;
    if(i===0) chartCtx.moveTo(x,y); else chartCtx.lineTo(x,y);
  }
  chartCtx.stroke();
  // fill under
  chartCtx.lineTo(w,h); chartCtx.lineTo(0,h); chartCtx.closePath();
  chartCtx.globalAlpha = 0.16; chartCtx.fill(); chartCtx.globalAlpha = 1;
}

// turbo boost spike
function simulateSpike(){
  speed += 400; ping = Math.max(4, ping-10);
  document.getElementById('aiStatus').textContent = 'DeepMind: Turbo Activated';
  setTimeout(()=> document.getElementById('aiStatus').textContent = 'DeepMind: Optimal', 3000);
}

// ---------- voice intro & speech -------------
const voiceToggle = document.getElementById('voiceToggle');
let voiceOn = false;
voiceToggle.addEventListener('click', ()=> {
  voiceOn = !voiceOn;
  voiceToggle.textContent = voiceOn ? '🔊 Voice On' : '🔈 Voice';
  if(voiceOn) voiceIntro();
});

// voice intro
function voiceIntro(){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance("Good day. Deep Wave Artificial Intelligence online. Your network is optimal.");
  u.pitch = 1; u.rate = 1; u.lang = 'en-US';
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ---------- basic interactions ----------
function startLaunch(){
  // quick UI pulse + message
  document.querySelector('.headline').classList.add('pulse');
  voiceIntro();
  setTimeout(()=> alert("🚀 Deep Wave Launched — Simulated experience active."), 600);
}
function openPlans(){ location.href = '#plans' }
function enquire(plan){ alert(Thank you — enquiry for: ${plan}. DeepWave team will contact you.) }

// ---------- AI ask (text & mic) ----------
const aiReply = document.getElementById('aiReply');
function processQuery(){
  const q = document.getElementById('aiInput').value.trim();
  if(!q) { aiReply.textContent = "Try typing: 'Check my speed' or 'Recommend a plan'"; return; }
  aiReply.textContent = "DeepMind is analyzing…";
  setTimeout(()=> {
    // simple rules
    if(/speed/i.test(q)) {
      aiReply.innerHTML = Current simulated speed: <strong>${Math.round(speed)} Mbps</strong> with ping ${Math.round(ping)} ms.;
    } else if(/recommend|best|plan/i.test(q)) {
      const rec = speed < 300 ? 'Wave Titan (500 Mbps) is recommended' : 'Wave Infinity (1 Gbps) is recommended';
      aiReply.innerHTML = Recommendation: <strong>${rec}</strong>;
    } else {
      aiReply.textContent = "DeepMind: I can check speed, recommend plans, or check coverage.";
    }
  }, 900);
}

// speech recognition if available
const micBtn = document.getElementById('micBtn');
if(window.webkitSpeechRecognition || window.SpeechRecognition){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SR(); recog.lang = 'en-US'; recog.interimResults = false;
  micBtn.style.display = 'inline-block';
  micBtn.addEventListener('click', ()=> {
    recog.start();
    aiReply.textContent = 'Listening…';
  });
  recog.onresult = (ev)=> {
    const t = ev.results[0][0].transcript;
    document.getElementById('aiInput').value = t;
    processQuery();
  };
  recog.onerror = ()=> { aiReply.textContent = 'Microphone not accessible.' }
} else {
  micBtn.style.display = 'none';
}

// ---------- theme toggle (dark <-> light quick) ----------
let dark = true;
function toggleTheme(){
  if(dark){
    document.documentElement.style.setProperty('--bg1','#f6f8ff');
    document.documentElement.style.setProperty('--bg2','#e9eefb');
    document.documentElement.style.setProperty('--accent1','#005bff');
    document.documentElement.style.setProperty('--accent2','#7a3bff');
    document.body.style.color = '#041027';
    dark = false;
  } else {
    document.documentElement.style.setProperty('--bg1','#030218');
    document.documentElement.style.setProperty('--bg2','#08102a');
    document.documentElement.style.setProperty('--accent1','#00f0ff');
    document.documentElement.style.setProperty('--accent2','#9b6bff');
    document.body.style.color = '#eaf6ff';
    dark = true;
  }
}

// ---------- simple star-meteor occasional -----------
setInterval(()=> {
  // create meteor streak (visual only)
  const m = document.createElement('div');
  m.style.position='fixed'; m.style.zIndex=50; m.style.pointerEvents='none';
  m.style.width='2px'; m.style.height='80px'; m.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(0,240,255,0.0))';
  m.style.left = Math.random()*100 + '%'; m.style.top = '-10%';
  m.style.transform = rotate(${20 + Math.random()*60}deg);
  m.style.opacity = 0.9;
  document.body.appendChild(m);
  const dur = 1000 + Math.random()*1400;
  m.animate([{transform: m.style.transform, top: '-10%'},{transform: m.style.transform, top: '110%'}], {duration:dur, easing:'linear'});
  setTimeout(()=> m.remove(), dur+50);
}, 4000);