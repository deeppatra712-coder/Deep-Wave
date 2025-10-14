/* Ultra Premium script:
 - soft particles on canvas
 - reveal animations for plan-cards
 - audio play/pause with fade-in/out
 - smooth nav scrolling
*/

// ---------- Canvas particles ----------
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

function rand(min,max){ return Math.random()*(max-min)+min; }

function initParticles(count = Math.round(Math.max(25, Math.min(90, (window.innerWidth*window.innerHeight)/140000)))) {
  particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6,2.4),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.12, 0.12),
      alpha: rand(0.03, 0.18)
    });
  }
}
initParticles();

function drawParticles(){
  if(!ctx) return;
  ctx.clearRect(0,0,w,h);
  for(const p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x < -20) p.x = w + 20;
    if(p.x > w + 20) p.x = -20;
    if(p.y < -20) p.y = h + 20;
    if(p.y > h + 20) p.y = -20;

    ctx.beginPath();
    ctx.fillStyle = rgba(0,200,255,${p.alpha});
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,150,255,0.06)';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

window.addEventListener('resize', ()=> {
  const count = Math.round(Math.max(20, Math.min(100, (window.innerWidth*window.innerHeight)/140000)));
  initParticles(count);
});

// ---------- Reveal on scroll ----------
const revealElems = Array.from(document.querySelectorAll('.plan-card, .section-title'));
function revealOnScroll(){
  const trigger = window.innerHeight * 0.82;
  revealElems.forEach((el,idx) => {
    const r = el.getBoundingClientRect();
    if(r.top < trigger){
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.transitionDelay = ${idx*70}ms;
      el.style.transitionDuration = '600ms';
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', ()=> setTimeout(revealOnScroll, 220));

// ---------- Smooth nav ----------
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---------- Audio with fade in/out ----------
const soundBtn = document.getElementById('soundBtn');
const audio = document.getElementById('waveSound');
let playing = false;

function fadeIn(audioEl, ms = 1800){
  if(!audioEl) return;
  audioEl.volume = 0;
  audioEl.play().catch(()=>{ /* play may be blocked until user interacts */ });
  const step = 0.02;
  const interval = setInterval(()=> {
    audioEl.volume = Math.min(1, audioEl.volume + step);
    if(audioEl.volume >= 1) clearInterval(interval);
  }, ms * step);
}

function fadeOut(audioEl, ms = 1400){
  if(!audioEl) return;
  const step = 0.02;
  const interval = setInterval(()=> {
    audioEl.volume = Math.max(0, audioEl.volume - step);
    if(audioEl.volume <= 0){
      audioEl.pause();
      audioEl.currentTime = 0;
      clearInterval(interval);
    }
  }, ms * step);
}

if(soundBtn){
  soundBtn.addEventListener('click', async ()=>{
    // toggle
    if(!playing){
      try {
        fadeIn(audio, 1800);
        playing = true;
        soundBtn.classList.add('playing');
        soundBtn.setAttribute('aria-pressed','true');
        soundBtn.textContent = '🔇 Stop the Wave';
      } catch(e){
        alert('Please allow audio playback or click again.');
      }
    } else {
      fadeOut(audio, 1200);
      playing = false;
      soundBtn.classList.remove('playing');
      soundBtn.setAttribute('aria-pressed','false');
      soundBtn.textContent = '🌊 Feel the Wave';
    }
  });
}

// ---------- lightweight form handling (no backend) ----------
const form = document.getElementById('signup-form');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value || 'User';
    alert(Thanks ${name}! Deep Wave will call you soon.);
    form.reset();
  });
}