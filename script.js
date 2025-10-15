const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let particles = [];
for (let i = 0; i < 600; i++) {
  particles.push({
    angle: Math.random() * 360,
    radius: Math.random() * 600,
    speed: 0.02 + Math.random() * 0.02,
    size: Math.random() * 1.8,
    color: hsl(${Math.random()*360},100%,70%)
  });
}

function animate() {
  ctx.fillStyle = "rgba(0,0,20,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // black hole core
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.fill();

  // orbiting particles
  for (let p of particles) {
    p.angle += p.speed;
    let x = cx + Math.cos(p.angle) * p.radius;
    let y = cy + Math.sin(p.angle) * p.radius;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  requestAnimationFrame(animate);
}
animate();

// --- Interactions ---
const btn = document.getElementById("enterBtn");
const bgm = document.getElementById("bgm");

btn.addEventListener("click", () => {
  bgm.play();
  alert("🌌 Deep Wave Universe XR 200.0 Activated — Enjoy the Black Hole Experience!");
});