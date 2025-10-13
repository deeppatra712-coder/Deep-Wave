// Wave animation background
const canvas = document.getElementById('wave');
const ctx = canvas.getContext('2d');
let width, height, waveHeight = 50, speed = 0.015, increment = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function drawWave() {
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    let y = height/2 + Math.sin(x * 0.01 + increment) * waveHeight * Math.sin(increment);
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(56,189,248,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  increment += speed;
  requestAnimationFrame(drawWave);
}

window.addEventListener('resize', resize);
resize();
drawWave();