/* Deep Wave Ultra Premium v2.0 script
 - canvas particles
 - scroll reveal
 - smooth nav
 - audio toggle with fade in/out
 - button ripple
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

function initParticles(count = Math.round(Math.max(20, Math.min(90, (window.innerWidth*window.innerHeight)/140000)))) {
  particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6,2.6),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.12, 0.12),
      alpha: rand(0.03, 0.2)
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

// reduce particles on resize for perf
window.addEventListener('resize', ()=> {
  const count = Math.round(Math.max(16, Math.min(100, (window.innerWidth*window.innerHeight)/140000)));
  initParticles(count);
});

// ---------- Reveal on scroll ----------
const revealElems = Array.from(document.querySelectorAll('.plan-card, .section-title'));
function revealOnScroll(){
  const trigger = window.innerHeight * 0.82;
  revealElems.forEach((el, idx) => {
    const rect = el.getBoundingClientRect();
    if(rect.top < trigger){
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.transitionDelay = ${idx * 70}ms;
      el.style.transitionDuration = '600ms';
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', ()=> setTimeout(revealOnScroll, 200));

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

function fadeIn(audioEl, ms = 1600){
  if(!audioEl) return;
  audioEl.volume = 0;
  audioEl.play().catch(()=>{ /* blocked until user gesture; safe since called by click */ });
  const step = 0.02;
  const interval = setInterval(()=> {
    audioEl.volume = Math.min(1, +(audioEl.volume + step).toFixed(3));
    if(audioEl.volume >= 1) clearInterval(interval);
  }, ms * step);
}

function fadeOut(audioEl, ms = 1200){
  if(!audioEl) return;
  const step = 0.02;
  const interval = setInterval(()=> {
    audioEl.volume = Math.max(0, +(audioEl.volume - step).toFixed(3));
    if(audioEl.volume <= 0){
      audioEl.pause();
      audioEl.currentTime = 0;
      clearInterval(interval);
    }
  }, ms * step);
}

// ripple helper
function triggerRipple(el){
  const ripple = el.parentElement.querySelector('.ripple');
  if(!ripple) return;
  ripple.style.opacity = '0.9';
  ripple.style.width = '240px';
  ripple.style.height = '240px';
  ripple.style.transform = 'translate(-50%,-50%) scale(1)';
  ripple.style.transition = 'transform .8s ease, opacity .8s ease, width .8s ease, height .8s ease';
  setTimeout(()=> {
    ripple.style.opacity = '0';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.transform = 'translate(-50%,-50%) scale(0)';
  }, 700);
}

if(soundBtn){
  soundBtn.addEventListener('click', async ()=>{
    if(!playing){
      try {
        fadeIn(audio, 1600);
        playing = true;
        soundBtn.classList.add('playing');
        soundBtn.setAttribute('aria-pressed','true');
        soundBtn.querySelector('.btn-text').textContent = 'Stop the Wave';
        triggerRipple(soundBtn);
      } catch(e){
        alert('Please allow audio playback or click again.');
      }
    } else {
      fadeOut(audio, 1200);
      playing = false;
      soundBtn.classList.remove('playing');
      soundBtn.setAttribute('aria-pressed','false');
      soundBtn.querySelector('.btn-text').textContent = 'Feel the Wave';
      triggerRipple(soundBtn);
    }
  });
}

// ---------- Button subtle breathing animation while playing ----------
setInterval(()=> {
  if(soundBtn && soundBtn.classList.contains('playing')){
    soundBtn.style.transform = 'scale(1.02)';
    soundBtn.style.boxShadow = '0 30px 80px rgba(0,118,255,0.18)';
    setTimeout(()=> {
      soundBtn.style.transform = '';
      soundBtn.style.boxShadow = '';
    }, 900);
  }
}, 1800);

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