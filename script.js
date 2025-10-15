const canvas = document.getElementById("universe");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
camera.position.z = 5;

// Tunnel particles
const starGeo = new THREE.BufferGeometry();
const count = 3000;
const pos = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 6 + 2;
  const z = Math.random() * -400;
  pos[i * 3] = Math.cos(angle) * radius;
  pos[i * 3 + 1] = Math.sin(angle) * radius;
  pos[i * 3 + 2] = z;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
const starMat = new THREE.PointsMaterial({ color: 0x99ccff, size: 0.6, transparent: true });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// black hole core
const coreGeo = new THREE.SphereGeometry(1.5, 64, 64);
const coreMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0x330066,
  emissiveIntensity: 2,
  metalness: 1,
  roughness: 0.3
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

// light glow
const light = new THREE.PointLight(0xaa00ff, 3);
scene.add(light);

const bgm = document.getElementById("bgm");
let warp = false;

function animate() {
  requestAnimationFrame(animate);
  stars.rotation.z += 0.0005;
  if (warp) {
    const positions = stars.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += 2.5;
      if (positions[i + 2] > 5) positions[i + 2] = -400;
    }
    stars.geometry.attributes.position.needsUpdate = true;
    camera.position.z -= 0.08;
    if (camera.position.z < 0.5) camera.position.z = 0.5;
  }
  renderer.render(scene, camera);
}
animate();

// Click to warp
const btn = document.getElementById("enterBtn");
const overlay = document.querySelector(".center");

btn.onclick = () => {
  overlay.classList.add("fadeOut");
  bgm.play();
  warp = true;
  gsap.to(camera.position, { z: 1, duration: 5, ease: "power3.inOut" });
  gsap.to(core.material, { emissiveIntensity: 5, duration: 3 });
};