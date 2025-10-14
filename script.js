/* Deep Wave Pro Edition JS
 - canvas particles (bubbles/plankton)
 - reveal on scroll for cards
 - review slider (auto + nav)
 - modal for Buy buttons
 - audio toggle (touchstart + click) with fade
 - smooth nav
*/

// ---------- Canvas particles / floating bubbles ----------
const canvas = document.getElementById('bg-canvas');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
let W=0,H=0, bubbles=[];

function resizeCanvas(){ if(!canvas) return; W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
window.addEventListener('resize', ()=>{ resizeCanvas(); initBubbles(); });
resizeCanvas();

function rand(min,max){ return Math.random()*(max-min)+min; }

function initBubbles(){
  const count = Math.round(Math.max(14, Math.min(80, (window.innerWidth*window.innerHeight)/180000)));
  bubbles = [];
  for(let i=0;i<count;i++){
    bubbles.push({
      x: rand(0,W),
      y: rand(H*0.2, H),
      r: rand(0.6,3.2),
      vx: rand(-0.2,0.2),
      vy: rand(-0.05,-0.4),
      alpha: rand(0.02,0.18)
    });
  }
}
initBubbles();

function drawBubbles(){
  if(!ctx) return;
  ctx.clearRect(0,0,W,H);
  for(const b of bubbles){
    b.x += b.vx; b.y += b.vy;
    if(b.x < -20) b.x = W + 20;
    if(b.x > W + 20) b.x = -20;
    if(b.y < -40) b.y = H + 40;

    ctx.beginPath();
    ctx.fillStyle = rgba(0,220,255,${b.alpha});
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,150,255,0.06)';
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(drawBubbles);
}
drawBubbles();

// ---------- Reveal on scroll ----------
const revealElems = Array.from(document.querySelectorAll('.plan-card, .section-title'));
function revealOnScroll(){
  const trigger = window.innerHeight * 0.82;
  revealElems.forEach((el, idx) => {
    const r = el.getBoundingClientRect();
    if(r.top < trigger){
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.transitionDelay = ${idx * 80}ms;
      el.style.transitionDuration = '600ms';
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', ()=> setTimeout(revealOnScroll, 220));

// ---------- Smooth nav links ----------
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if(t) t.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

// ---------- Review slider ----------
const slides = Array.from(document.querySelectorAll('.review-slide'));
let current = 0;
const prevBtn = document.querySelector('.rev-nav.prev');
const nextBtn = document.querySelector('.rev-nav.next');

function showSlide(idx){
  slides.forEach(s => s.classList.remove('active'));
  slides[idx].classList.add('active');
}
showSlide(0);

prevBtn.addEventListener('click', ()=> {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
});
nextBtn.addEventListener('click', ()=> {
  current = (current + 1) % slides.length;
  showSlide(current);
});
// auto-play
setInterval(()=> { current = (current + 1) % slides.length; showSlide(current); }, 6000);

// ---------- Modal (Buy flow) ----------
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalForm = document.getElementById('modal-form');
const mplan = document.getElementById('mplan');
document.querySelectorAll('.buy-btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const plan = btn.dataset.plan || 'Selected Plan';
    mplan.value = plan;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  });
});
modalClose.addEventListener('click', ()=> { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });
modalForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = modalForm.mname.value || 'User';
  alert(Thanks ${name}! We got your request for: ${modalForm.mplan.value}. Deep Wave will call you soon.);
  modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); modalForm.reset();
});

// close modal on backdrop click
modal.addEventListener('click', (e)=> { if(e.target === modal){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });

// ---------- Audio toggle (touch + click) with fade ----------
const soundBtn = document.getElementById('soundBtn');
const audio = document.getElementById('waveSound');
let playing = false;

function fadeIn(audioEl, ms = 1400){
  if(!audioEl) return;
  audioEl.volume = 0;
  audioEl.play().catch(()=>{ /* blocked until user gesture */ });
  const step = 0.02;
  const interval = setInterval(()=> {
    audioEl.volume = Math.min(1, +(audioEl.volume + step).toFixed(3));
    if(audioEl.volume >= 1) clearInterval(interval);
  }, ms * step);
}
function fadeOut(audioEl, ms = 1000){
  if(!audioEl) return;
  const step = 0.02;
  const interval = setInterval(()=> {
    audioEl.volume = Math.max(0, +(audioEl.volume - step).toFixed(3));
    if(audioEl.volume <= 0){
      audioEl.pause(); audioEl.currentTime = 0; clearInterval(interval);
    }
  }, ms * step);
}

// ripple trigger
function triggerRipple(el){
  const ripple = el.parentElement.querySelector('.ripple');
  if(!ripple) return;
  ripple.style.opacity = '0.95';
  ripple.style.width = '220px'; ripple.style.height = '220px'; ripple.style.transform = 'translate(-50%,-50%) scale(1)';
  setTimeout(()=> { ripple.style.opacity = '0'; ripple.style.width='0'; ripple.style.height='0'; ripple.style.transform='translate(-50%,-50%) scale(0)'; }, 700);
}

if(soundBtn){
  const handler = async ()=>{
    if(!playing){
      try{
        fadeIn(audio, 1400);
        playing = true;
        soundBtn.classList.add('playing');
        soundBtn.setAttribute('aria-pressed','true');
        soundBtn.querySelector('.btn-text').textContent = 'Stop the Wave';
        triggerRipple(soundBtn);
      }catch(e){
        console.log('play blocked', e);
      }
    } else {
      fadeOut(audio, 1100);
      playing = false;
      soundBtn.classList.remove('playing');
      soundBtn.setAttribute('aria-pressed','false');
      soundBtn.querySelector('.btn-text').textContent = 'Feel the Wave';
      triggerRipple(soundBtn);
    }
  };
  soundBtn.addEventListener('touchstart', handler, {passive:true});
  soundBtn.addEventListener('click', handler);
}

// ---------- lightweight contact form handling ----------
const form = document.getElementById('signup-form');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value || 'User';
    alert(Thanks ${name}! Deep Wave will call you soon.);
    form.reset();
  });
}

// ---------- Mobile menu toggle ----------
const menuToggle = document.getElementById('menu-toggle');
menuToggle && menuToggle.addEventListener('click', ()=> {
  const nav = document.querySelector('.nav-links');
  if(nav.style.display === 'flex'){ nav.style.display = 'none'; } else { nav.style.display = 'flex'; nav.style.flexDirection = 'column'; nav.style.gap = '12px'; nav.style.paddingRight = '20px'; }
});

// initial reveal run
setTimeout(revealOnScroll, 300);