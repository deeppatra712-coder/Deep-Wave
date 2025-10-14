/* script.js
   Deep Wave — Viral-ready logic:
   - preloader
   - canvas particles
   - referral link generator (localStorage)
   - share buttons (FB/Twitter/WhatsApp)
   - share/register contest (localStorage)
   - modal buy flow + contact form handling
   - audio toggle (touch + click) with fade
   - reviews slider
   - magnetic cursor + mobile gyroscope
   Save as: my-website/script.js
*/

///// PRELOADER /////
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => {
    pre.style.opacity = '0';
    pre.style.pointerEvents = 'none';
    pre.setAttribute('aria-hidden','true');
  }, 700);
});

///// CANVAS PARTICLES /////
const canvas = document.getElementById('bg-canvas');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
let W = 0, H = 0, parts = [];
function resizeCanvas(){
  if(!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  initParticles();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(min,max){ return Math.random()*(max-min)+min; }
function initParticles(){
  const count = Math.round(Math.max(18, Math.min(120, (W*H)/160000)));
  parts = [];
  for(let i=0;i<count;i++){
    parts.push({
      x: rand(0,W),
      y: rand(H*0.3, H),
      r: rand(0.6,3.6),
      vx: rand(-0.3,0.3),
      vy: rand(-0.05,-0.45),
      a: rand(0.02,0.18)
    });
  }
}
function drawParticles(){
  if(!ctx) return;
  ctx.clearRect(0,0,W,H);
  for(const p of parts){
    p.x += p.vx; p.y += p.vy;
    if(p.x < -20) p.x = W + 20;
    if(p.x > W + 20) p.x = -20;
    if(p.y < -40) p.y = H + 40;
    ctx.beginPath();
    ctx.fillStyle = rgba(0,220,255,${p.a});
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,150,255,0.06)';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

///// REFERRAL CODE (client-side) /////
function makeCode(len=6){
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s='';
  for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}
let ref = localStorage.getItem('dw_ref');
if(!ref){
  ref = makeCode(6);
  localStorage.setItem('dw_ref', ref);
}
const link = ${location.origin}${location.pathname}?ref=${ref};
const refLinkEl = document.getElementById('refLink');
if(refLinkEl){
  refLinkEl.href = link;
  refLinkEl.textContent = link;
}
const copyBtn = document.getElementById('copyRef');
copyBtn && copyBtn.addEventListener('click', ()=> {
  navigator.clipboard.writeText(link).then(()=> { alert('Referral link copied!'); });
});

///// SHARE BUTTONS (FB/TW/WA) /////
const pageUrl = encodeURIComponent(location.href);
const shareText = encodeURIComponent("Join Deep Wave — Ultra Pro Max. Limited launch offers! " + link);

document.getElementById('shareFb')?.addEventListener('click', ()=>{
  window.open(https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}, '_blank');
  registerShare();
});
document.getElementById('shareTw')?.addEventListener('click', ()=>{
  window.open(https://twitter.com/intent/tweet?text=${shareText}, '_blank');
  registerShare();
});
document.getElementById('shareWa')?.addEventListener('click', ()=>{
  const wa = https://wa.me/?text=${encodeURIComponent("Join Deep Wave — Ultra Pro Max: " + link)};
  window.open(wa, '_blank');
  registerShare();
});

///// CONTEST: register share count (client-side) /////
function registerShare(){
  const key = dw_shares_${ref};
  const cur = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, cur);
  // every 3 shares => 1 entry (example)
  const entries = Math.floor(cur / 3);
  alert(Thanks for sharing! You've shared ${cur} times — contest entries: ${entries});
  // For production: POST this event to your backend to track & verify
}

///// CONTEST MODAL /////
const enterContestBtn = document.getElementById('enterContest');
const contestModal = document.getElementById('contestModal');
const cClose = document.getElementById('cClose');
enterContestBtn && enterContestBtn.addEventListener('click', ()=> { contestModal.style.display = 'flex'; contestModal.setAttribute('aria-hidden','false'); });
cClose && cClose.addEventListener('click', ()=> { contestModal.style.display = 'none'; contestModal.setAttribute('aria-hidden','true'); });

document.getElementById('cShareFb')?.addEventListener('click', ()=>{
  window.open(https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}, '_blank');
  registerShare();
});
document.getElementById('cShareWa')?.addEventListener('click', ()=>{
  window.open(https://wa.me/?text=${encodeURIComponent("Join Deep Wave — " + link)}, '_blank');
  registerShare();
});

///// BUY MODAL FLOW /////
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalForm = document.getElementById('modal-form');
const mplan = document.getElementById('mplan');
document.querySelectorAll('.buy-btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const plan = btn.dataset.plan || 'Selected Plan';
    if(mplan) mplan.value = plan;
    if(modal){ modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }
  });
});
modalClose?.addEventListener('click', ()=> { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });
modal?.addEventListener('click', (e)=> { if(e.target === modal){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }});
modalForm?.addEventListener('submit', (e)=> {
  e.preventDefault();
  alert(Thanks ${modalForm.mname.value || 'User'}! Request received for: ${modalForm.mplan.value});
  modal.classList.remove('show'); modalForm.reset();
});

///// CONTACT FORM /////
const form = document.getElementById('signup-form');
form && form.addEventListener('submit', (e)=> {
  e.preventDefault();
  // capture referral if present in URL param
  const urlParams = new URLSearchParams(location.search);
  const refParam = urlParams.get('ref') || localStorage.getItem('dw_ref');
  // For production: send to server via fetch()
  alert(Thanks ${form.name.value || 'User'}! Deep Wave will call you soon. Your referral: ${refParam || '—'});
  form.reset();
});

///// AUDIO (fade in/out) /////
const soundBtn = document.getElementById('soundBtn');
const audio = document.getElementById('waveSound');
let playing = false;
function fadeIn(audioEl, ms=1400){
  if(!audioEl) return;
  audioEl.volume = 0;
  const p = audioEl.play();
  if(p && p.catch) p.catch(()=>{});
  const step = 0.02;
  const iv = setInterval(()=> {
    audioEl.volume = Math.min(1, +(audioEl.volume + step).toFixed(3));
    if(audioEl.volume >= 1) clearInterval(iv);
  }, ms*step);
}
function fadeOut(audioEl, ms=1000){
  if(!audioEl) return;
  const step = 0.02;
  const iv = setInterval(()=> {
    audioEl.volume = Math.max(0, +(audioEl.volume - step).toFixed(3));
    if(audioEl.volume <= 0){ audioEl.pause(); audioEl.currentTime = 0; clearInterval(iv); }
  }, ms*step);
}
function triggerRipple(el){
  const r = el.parentElement.querySelector('.ripple'); if(!r) return;
  r.style.opacity = '0.95'; r.style.width = '220px'; r.style.height = '220px'; r.style.transform = 'translate(-50%,-50%) scale(1)';
  setTimeout(()=> { r.style.opacity='0'; r.style.width='0'; r.style.height='0'; r.style.transform='translate(-50%,-50%) scale(0)'; },700);
}
if(soundBtn){
  const handler = ()=>{
    if(!playing){
      fadeIn(audio,1400);
      playing = true;
      soundBtn.classList.add('playing');
      soundBtn.setAttribute('aria-pressed','true');
      soundBtn.querySelector('.btn-text') && (soundBtn.querySelector('.btn-text').textContent = 'Stop the Wave');
      triggerRipple(soundBtn);
    } else {
      fadeOut(audio,1100);
      playing = false;
      soundBtn.classList.remove('playing');
      soundBtn.setAttribute('aria-pressed','false');
      soundBtn.querySelector('.btn-text') && (soundBtn.querySelector('.btn-text').textContent = 'Feel the Wave');
      triggerRipple(soundBtn);
    }
  };
  soundBtn.addEventListener('touchstart', handler, {passive:true});
  soundBtn.addEventListener('click', handler);
}

///// REVIEWS SLIDER /////
const slides = Array.from(document.querySelectorAll('.review-slide'));
let cur = 0;
const prevBtn = document.querySelector('.rev-nav.prev');
const nextBtn = document.querySelector('.rev-nav.next');
function showSlide(i){
  if(!slides.length) return;
  slides.forEach(s=>s.classList.remove('active'));
  slides[i].classList.add('active');
}
if(slides.length){
  showSlide(0);
  prevBtn?.addEventListener('click', ()=>{ cur=(cur-1+slides.length)%slides.length; showSlide(cur); });
  nextBtn?.addEventListener('click', ()=>{ cur=(cur+1)%slides.length; showSlide(cur); });
  setInterval(()=>{ cur=(cur+1)%slides.length; showSlide(cur); },6000);
}

///// MAGNETIC CURSOR & HOVER /////
const fcursor = document.getElementById('fcursor');
document.addEventListener('mousemove', (e)=>{ if(!fcursor) return; fcursor.style.left = e.clientX + 'px'; fcursor.style.top = e.clientY + 'px'; });
document.querySelectorAll('a, button, .btn').forEach(el=>{
  el.addEventListener('mouseenter', ()=>{ if(fcursor){ fcursor.style.transform = 'translate(-50%,-50%) scale(1.8)'; fcursor.style.width='34px'; fcursor.style.height='34px'; }});
  el.addEventListener('mouseleave', ()=>{ if(fcursor){ fcursor.style.transform = 'translate(-50%,-50%) scale(1)'; fcursor.style.width='18px'; fcursor.style.height='18px'; }});
});

///// GYROSCOPE PARALLAX (mobile) /////
if(window.DeviceOrientationEvent){
  window.addEventListener('deviceorientation', (e)=>{
    const gx = e.gamma || 0; const gy = e.beta || 0;
    const hero = document.querySelector('.hero-inner');
    if(hero) hero.style.transform = translate3d(${gx/30}vw, ${gy/80}vh, 0);
  }, true);
}

///// NAV SMOOTH SCROLL /////
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if(t) t.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

// LIGHT initial reveal after load
setTimeout(()=> {
  document.querySelectorAll('.plan-card').forEach((el,i)=>{ el.style.opacity=1; el.style.transform='translateY(0)'; el.style.transitionDelay = ${i*70}ms; });
}, 400);