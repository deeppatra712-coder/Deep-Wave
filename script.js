// ===== SETUP =====
const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');
let w, h, stars = [], warpSpeed = 0.03;
const audio = document.getElementById('bg-music');

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ===== CREATE STARS =====
function createStars(num = 800) {
  stars = [];
  for (let i = 0; i < num; i++) {
    stars.push({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w
    });
  }
}
createStars();

// ===== DRAW ANIMATION =====
function draw() {
  ctx.fillStyle = "rgba(0, 0, 10, 0.4)";
  ctx.fillRect(0, 0, w, h);

  for (let s of stars) {
    s.z -= warpSpeed * w * 0.1;
    if (s.z <= 0) s.z = w;
    const k = 128 / s.z;
    const px = s.x * k + w / 2;
    const py = s.y * k + h / 2;

    const size = (1 - s.z / w) * 2;
    const hue = (s.z / w) * 360;
    ctx.fillStyle = hsl(${hue}, 100%, 70%);
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();

// ===== CURSOR TRAIL =====
document.addEventListener('mousemove', (e) => {
  const t = document.createElement('div');
  t.className = 'trail';
  t.style.left = e.pageX + 'px';
  t.style.top = e.pageY + 'px';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 600);
});

// ===== AUDIO + AI VOICE =====
window.addEventListener('click', () => {
  if (audio.paused) audio.play();

  const voice = new SpeechSynthesisUtterance("Welcome to Deep Wave — The Universe of Connectivity");
  voice.pitch = 1.1;
  voice.rate = 0.9;
  voice.volume = 1;
  voice.lang = 'en-US';
  speechSynthesis.speak(voice);
});