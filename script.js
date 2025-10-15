const enterBtn = document.getElementById('enterBtn');
const bgm = document.getElementById('bgm');
const warp = document.querySelector('.warp');
const stars = document.querySelector('.stars');

enterBtn.addEventListener('click', () => {
  bgm.volume = 0.6;
  bgm.play();

  warp.classList.add('warp-active');
  stars.style.animation = 'drift 3s linear infinite';
  document.body.style.transition = 'background 3s ease-in-out';
  document.body.style.background = 'radial-gradient(circle at center, #000000 0%, #050010 100%)';

  setTimeout(() => {
    document.querySelector('.center').innerHTML = `
      <h1 style="font-size:3em;color:#fff;animation:fadeIn 3s;">
        🌌 You’ve Entered Deep Wave Universe 🌌
      </h1>
      <p style="font-size:1.2em;opacity:0.8;">Reality has bent for <b>Deep Patra</b>.</p>
    `;
  }, 5500);
});