const soundBtn = document.getElementById('soundBtn');
const waveSound = document.getElementById('waveSound');
let playing = false;

function fadeIn(audio, duration = 2000) {
  audio.volume = 0;
  audio.play();
  const step = 0.02;
  const interval = setInterval(() => {
    if (audio.volume < 1) {
      audio.volume = Math.min(audio.volume + step, 1);
    } else {
      clearInterval(interval);
    }
  }, duration * step);
}

function fadeOut(audio, duration = 2000) {
  const step = 0.02;
  const interval = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume = Math.max(audio.volume - step, 0);
    } else {
      clearInterval(interval);
      audio.pause();
    }
  }, duration * step);
}

soundBtn.addEventListener('click', () => {
  if (!playing) {
    fadeIn(waveSound, 2000);
    soundBtn.innerText = "🔇 Stop the Wave";
    playing = true;
  } else {
    fadeOut(waveSound, 2000);
    soundBtn.innerText = "🌊 Feel the Wave";
    playing = false;
  }
});