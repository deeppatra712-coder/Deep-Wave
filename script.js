/* Deep Wave — Enhanced Hybrid (Top12 features) */
/* Uses: canvas starfield, mouse warp, click-enter cinematic, particle burst, preloader,
   sound, perf toggle, screenshot/share, accessibility keys, mobile fallback video,
   localStorage prefs, dev FPS HUD. */

(() => {
  // ----- elements -----
  const preloader = document.getElementById('preloader');
  const prepercent = document.getElementById('prepercent');
  const portal = document.getElementById('portal');
  const starCanvas = document.getElementById('starfield');
  const blackhole = document.getElementById('blackhole');
  const warpMask = document.getElementById('warpMask');
  const whoosh = document.getElementById('whoosh');
  const fpsEl = document.getElementById('fps');
  const perfBtn = document.getElementById('perfBtn');
  const shareBtn = document.getElementById('shareBtn');
  const screenshotBtn = document.getElementById('screenshotBtn');
  const vol = document.getElementById('vol');
  const fallbackVideo = document.getElementById('fallbackVideo');

  // prefs
  const prefs = {
    perfMode: localStorage.getItem('dw_perf') === '1',
    detail: parseFloat(localStorage.getItem('dw_detail') || '1'),
    vol: parseFloat(localStorage.getItem('dw_vol') || '0.9')
  };

  vol.value = prefs.vol;
  whoosh.volume = prefs.vol;

  // ----- preloader (simulate asset load) -----
  let loadProgress = 0;
  const loadSim = setInterval(() => {
    loadProgress += Math.random() * 12;
    if (loadProgress >= 100) loadProgress = 100;
    prepercent.innerText = `${Math.floor(loadProgress)}%`;
    if (loadProgress >= 100) {
      clearInterval(loadSim);
      setTimeout(() => { preloader.style.display = 'none'; preloader.setAttribute('aria-hidden','true'); }, 400);
    }
  }, 110);

  // ----- canvas starfield (multi-layer, performant) -----
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const cw = () => Math.floor(window.innerWidth * DPR);
  const ch = () => Math.floor(window.innerHeight * DPR);
  starCanvas.width = cw();
  starCanvas.height = ch();
  starCanvas.style.width = `${window.innerWidth}px`;
  starCanvas.style.height = `${window.innerHeight}px`;
  const sctx = starCanvas.getContext('2d', { alpha: true });

  // star layers
  const layers = [
    {count: 120, size:[0.8,1.6], speed:0.02, hue:220, alpha:0.9},
    {count: 60, size:[1.6,2.8], speed:0.06, hue:200, alpha:0.65},
    {count: 36, size:[2.8,4.5], speed:0.12, hue:180, alpha:0.45}
  ];
  let stars = [];
  function initStars(){
    stars = [];
    layers.forEach((L, li) => {
      for (let i=0;i<L.count;i++){
        stars.push({
          x: Math.random()*starCanvas.width,
          y: Math.random()*starCanvas.height,
          z: li+1,
          r: L.size[0] + Math.random()*(L.size[1]-L.size[0]),
          speed: L.speed * (0.5 + Math.random()*1.2),
          hue: L.hue + (Math.random()*20-10),
          alpha: L.alpha * (0.6 + Math.random()*0.4),
          layer: li
        });
      }
    });
  }
  initStars();

  // resize
  window.addEventListener('resize', () => {
    starCanvas.width = cw();
    starCanvas.height = ch();
    starCanvas.style.width = `${window.innerWidth}px`;
    starCanvas.style.height = `${window.innerHeight}px`;
    initStars();
  });

  // mouse warp params
  let mouse = {x:0,y:0,nx:0,ny:0};
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  });

  // performance mode
  function setPerfMode(on){
    prefs.perfMode = on;
    localStorage.setItem('dw_perf', on ? '1' : '0');
    perfBtn.style.opacity = on ? '0.6' : '1';
    // reduce stars
    if (on) {
      layers.forEach(l => l.count = Math.max(20, Math.floor(l.count * 0.35)));
    } else {
      layers[0].count = 120; layers[1].count = 60; layers[2].count = 36;
    }
    initStars();
  }
  setPerfMode(prefs.perfMode);
  perfBtn.onclick = () => setPerfMode(!prefs.perfMode);

  // FPS meter & animation loop
  let last = performance.now(), frames = 0, fps = 0;
  function draw(time){
    const dt = Math.min((time - last)/1000, 0.1);
    last = time; frames++;
    if (time % 1000 < 60) { fps = frames; frames = 0; }
    fpsEl.innerText = `FPS: ${fps}`;

    // clear
    sctx.clearRect(0,0,starCanvas.width,starCanvas.height);

    // update mouse nudge
    mouse.nx += (mouse.x - (mouse.nx || window.innerWidth/2)) * 0.06;
    mouse.ny += (mouse.y - (mouse.ny || window.innerHeight/2)) * 0.06;
    const mx = (mouse.nx - window.innerWidth/2) * 0.002;
    const my = (mouse.ny - window.innerHeight/2) * 0.002;

    // draw stars
    for (let s of stars){
      s.y += s.speed * (1 + mx * s.layer * 2) * (prefs.perfMode ? 0.6 : 1);
      s.x += Math.sin((s.y + s.x) * 0.0003 + s.layer) * 0.2 * (my*20);
      if (s.y > starCanvas.height + 50) { s.y = -50; s.x = Math.random()*starCanvas.width; }
      sctx.beginPath();
      const g = sctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*DPR*1.8);
      g.addColorStop(0, `hsla(${s.hue},95%,88%,${s.alpha})`);
      g.addColorStop(0.6, `hsla(${s.hue},85%,60%,${s.alpha*0.25})`);
      g.addColorStop(1, `rgba(0,0,0,0)`);
      sctx.fillStyle = g;
      sctx.fillRect(s.x - s.r*2, s.y - s.r*2, s.r*4, s.r*4);
    }

    // small warp displacement overlay (cheap)
    // we simulate warp by drawing radial gradient centered on mouse and blending
    const mxposX = mouse.nx * DPR;
    const mxposY = mouse.ny * DPR;
    const grad = sctx.createRadialGradient(mxposX, mxposY, 0, mxposX, mxposY, Math.max(window.innerWidth, window.innerHeight)*0.6);
    grad.addColorStop(0, 'rgba(120,160,255,0.04)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0,0,starCanvas.width,starCanvas.height);

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // ----- particle burst canvas -----
  let pCanvas = document.createElement('canvas');
  pCanvas.id = 'particleLayer';
  pCanvas.width = window.innerWidth * DPR;
  pCanvas.height = window.innerHeight * DPR;
  pCanvas.style.width = `${window.innerWidth}px`;
  pCanvas.style.height = `${window.innerHeight}px`;
  document.body.appendChild(pCanvas);
  const pctx = pCanvas.getContext('2d');
  let particles = [];

  window.addEventListener('resize', () => {
    pCanvas.width = window.innerWidth * DPR;
    pCanvas.height = window.innerHeight * DPR;
    pCanvas.style.width = `${window.innerWidth}px`;
    pCanvas.style.height = `${window.innerHeight}px`;
  });

  function spawnParticles(x,y,count = 60){
    for (let i=0;i<count;i++){
      particles.push({
        x: x * DPR, y: y * DPR,
        vx: (Math.random()-0.5) * 8 * (prefs.perfMode ? 0.6 : 1),
        vy: (Math.random()-0.5) * 8 * (prefs.perfMode ? 0.6 : 1),
        life: 0, ttl: 40 + Math.random()*40,
        r: 1 + Math.random()*3,
        hue: 200 + Math.random()*80
      });
    }
  }

  function drawParticles(){
    pctx.clearRect(0,0,pCanvas.width,pCanvas.height);
    for (let i = particles.length -1; i>=0; i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life++;
      const t = p.life / p.ttl;
      pctx.beginPath();
      pctx.fillStyle = `hsla(${p.hue},95%,60%,${1 - t})`;
      pctx.arc(p.x, p.y, Math.max(0.2, p.r*(1-t))*DPR, 0, Math.PI*2);
      pctx.fill();
      if (p.life >= p.ttl) particles.splice(i,1);
    }
    requestAnimationFrame(drawParticles);
  }
  requestAnimationFrame(drawParticles);

  // ----- entry animation (click) -----
  function enterSequence(clientX, clientY){
    // spawn particles at click, play whoosh, warp UI
    spawnParticles(clientX, clientY, prefs.perfMode ? 30 : 120);
    try { whoosh.currentTime = 0; whoosh.volume = prefs.vol; whoosh.play(); } catch(e){}
    portal.classList.add('warping');
    setTimeout(() => {
      portal.classList.add('warp-complete');
      // after final, show a message or navigate
      setTimeout(() => {
        // show a simple secret overlay (demo)
        alert("You have entered the Deep Wave Universe 🌌 — demo complete.");
        portal.classList.remove('warp-complete','warping');
      }, 1100);
    }, 700);
  }

  // click / keyboard handlers
  warpMask.addEventListener('click', (ev) => {
    const cx = ev.clientX || window.innerWidth/2;
    const cy = ev.clientY || window.innerHeight/2;
    enterSequence(cx, cy);
  });
  // keyboard: 'E' to enter
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e') {
      const cx = window.innerWidth/2, cy = window.innerHeight/2;
      enterSequence(cx, cy);
    }
    if (e.key === 'p') { setPerfMode(!prefs.perfMode); } // quick perf toggle
  });

  // ----- share & screenshot -----
  shareBtn.onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Deep Wave — Portal', text: 'Enter the Deep Wave Universe', url: location.href });
      } catch (err) { console.log('share cancelled'); }
    } else {
      alert('Share not supported on this browser. Use screenshot to share.');
    }
  };

  screenshotBtn.onclick = () => {
    // combine starCanvas + particle canvas into single image
    const out = document.createElement('canvas');
    out.width = starCanvas.width; out.height = starCanvas.height;
    const outCtx = out.getContext('2d');
    outCtx.drawImage(starCanvas, 0, 0);
    outCtx.drawImage(pCanvas, 0, 0);
    out.toBlob((b) => {
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url; a.download = `deepwave-${Date.now()}.png`; document.body.appendChild(a); a.click();
      setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 3000);
    }, 'image/png');
  };

  // ----- volume control -----
  vol.addEventListener('input', (e) => {
    prefs.vol = parseFloat(e.target.value); whoosh.volume = prefs.vol;
    localStorage.setItem('dw_vol', prefs.vol.toString());
  });

  // ----- mobile fallback detection -----
  function supportsCanvas() {
    try { const c = document.createElement('canvas'); return !!(c.getContext && c.getContext('2d')); } catch (e) { return false; }
  }
  if (!supportsCanvas() || /iPhone|iPad|Android/i.test(navigator.userAgent) && /Chrome\/[0-5][0-9]/.test(navigator.userAgent)) {
    // show fallback video for very weak devices
    fallbackVideo.style.display = 'block';
    fallbackVideo.play().catch(()=>{});
    starCanvas.style.display = 'none';
  }

  // ----- accessibility ARIA toggle hints -----
  warpMask.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); warpMask.click(); }
  });

  // ----- init done ----  (expose setPerfMode to global for quick manual)
  window.setPerfMode = (on) => {
    prefs.perfMode = !!on;
    localStorage.setItem('dw_perf', prefs.perfMode ? '1' : '0');
    perfBtn.style.opacity = prefs.perfMode ? '0.6' : '1';
    // tweak global behavior
    if (prefs.perfMode) {
      // reduce star counts & particle cap
      layers[0].count = Math.max(20, Math.floor(layers[0].count * 0.35));
      layers[1].count = Math.max(10, Math.floor(layers[1].count * 0.35));
      layers[2].count = Math.max(6, Math.floor(layers[2].count * 0.35));
    } else {
      layers[0].count = 120; layers[1].count = 60; layers[2].count = 36;
    }
    initStars();
  };
  perfBtn.onclick = () => window.setPerfMode(!prefs.perfMode);

  // expose a small debug HUD toggle
  window.toggleFPS = () => { fpsEl.style.display = fpsEl.style.display === 'none' ? 'block' : 'none'; };
})();
