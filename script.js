/* script.js — particles + scroll reveal + lightweight form handling */

/* ---------- Particle background on canvas (subtle dots/floaters) ---------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
let particles = [];
let w = 0, h = 0;

function resizeCanvas(){
  if(!canvas) return;
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(min,max){ return Math.random()*(max-min)+min }

function initParticles(count=60){
  particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0,w),
      y: rand(0,h),
      r: rand(0.6,2.6),
      vx: rand(-0.25,0.25),
      vy: rand(-0.15,0.15),
      alpha: rand(0.06,0.22)
    });
  }
}
initParticles(80);

function drawParticles(){
  if(!ctx) return;
  ctx.clearRect(0,0,w,h);
  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.x < -10) p.x = w + 10;
    if(p.x > w + 10) p.x = -10;
    if(p.y < -10) p.y = h + 10;
    if(p.y > h + 10) p.y = -10;

    ctx.beginPath();
    ctx.fillStyle = rgba(0,230,255,${p.alpha});
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,180,255,0.08)';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ---------- Scroll reveal for plan cards & other elements ---------- */
const revealElems = [...document.querySelectorAll('.plan-card'), ...document.querySelectorAll('.section-title')];
function revealOnScroll(){
  const trigger = window.innerHeight * 0.82;
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
window.addEventListener('load', () => {
  // small initial reveal after load
  setTimeout(()=> revealOnScroll(), 260);
});

/* ---------- Smooth nav links for single page experience ---------- */
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* ---------- lightweight form submit (no backend) ---------- */
const form = document.getElementById('signup-form');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    // just show a friendly confirmation (since no backend)
    const name = form.name.value || 'User';
    alert(Thanks ${name}! We received your request. Deep Wave will call you soon.);
    form.reset();
  });
}