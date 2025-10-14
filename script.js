/* script.js
  - particles (subtle floating dots)
  - scroll reveal for plan cards
  - hero wave audio play/stop (click-to-play)
  - smooth nav links
*/

/* ---------------- Canvas Particles ---------------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
let w = 0, h = 0, particles = [];

function resizeCanvas(){
  if(!canvas) return;
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(min,max){ return Math.random() * (max - min) + min; }

function initParticles(count = Math.round(Math.max(30, Math.min(100, (window.innerWidth*window.innerHeight)/120000)))) {
  particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.5, 2.5),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.12, 0.12),
      alpha: rand(0.04, 0.18)
    });
  }
}
initParticles();

function drawParticles(){
  if(!ctx) return;
  ctx.clearRect(0,0,w,h);
  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.x < -20) p.x = w + 20;
    if(p.x > w + 20) p.x = -20;
    if(p.y < -20) p.y = h + 20;
    if(p.y > h + 20) p.y = -20;

    ctx.beginPath();
    ctx.fillStyle = rgba(0,220,255,${p.alpha});
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,160,255,0.06)';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ---------------- Scroll reveal ---------------- */
const revealElems = Array.from(document.querySelectorAll('.plan-card, .section-title'));
function revealOnScroll(){
  const trigger = window.innerHeight * 0.84;
  revealElems.forEach((el, idx) => {
    const r = el.getBoundingClientRect();
    if(r.top < trigger){
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.transitionDelay = ${idx * 70}ms;
      el.style.transitionDuration = '600ms';
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', ()=> setTimeout(revealOnScroll, 220));

/* ---------------- Smooth nav links ---------------- */
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* ---------------- Audio: soft ocean sound (click-to-play) ---------------- */
/* NOTE: Browsers block autoplay. We use user-click toggle.
   Replace the audio source if you have a local .mp3 file.
   For demonstration we try an embedded short base64 beep (placeholder).
   It's recommended to replace audio.src with your real ocean.mp3 file hosted in same repo.
*/

const soundBtn = document.getElementById('sound-toggle');
let audio = null;
let audioPlaying = false;

// create audio element (use your own file for best quality)
function setupAudio(){
  audio = new Audio();
  // === REPLACE THIS with your own file path if you have ocean.mp3 ===
  // Example: audio.src = 'assets/sounds/ocean-loop.mp3';
  // Below we intentionally set a short silent loop as placeholder so no external fetch occurs.
  // Replace with real file for production.
  audio.src = 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAA...'; // intentionally short placeholder (not audible)
  audio.loop = true;
  audio.volume = 0.45;
}

setupAudio();

if(soundBtn){
  soundBtn.addEventListener('click', async () => {
    // If real audio file is available, replace audio.src above.
    if(!audio) setupAudio();
    try {
      if(!audioPlaying){
        // ATTEMPT to play
        await audio.play();
        audioPlaying = true;
        soundBtn.classList.add('playing');
        soundBtn.setAttribute('aria-pressed','true');
        soundBtn.textContent = '🔈 Wave On';
      } else {
        audio.pause();
        audio.currentTime = 0;
        audioPlaying = false;
        soundBtn.classList.remove('playing');
        soundBtn.setAttribute('aria-pressed','false');
        soundBtn.textContent = '🌊 Feel the Wave';
      }
    } catch (err){
      // If browser blocks, show small friendly notice
      alert('Tap once more or allow sound in your browser to play audio.');
    }
  });
}

/* ------------- lightweight contact form handling (no backend) ------------- */
const form = document.getElementById('signup-form');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value || 'User';
    alert(Thanks ${name}! Deep Wave will call you soon on the provided number.);
    form.reset();
  });
}

/* ------------- optional: reduce particle count on mobile for perf ------------- */
window.addEventListener('resize', ()=> {
  const count = Math.round(Math.max(20, Math.min(100, (window.innerWidth*window.innerHeight)/120000)));
  initParticles(count);
});