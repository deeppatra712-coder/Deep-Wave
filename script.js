let scene, camera, renderer, sun, planets = [];

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({canvas: document.getElementById("universe")});
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Light
  const light = new THREE.PointLight(0xffffff, 3, 500);
  light.position.set(0, 0, 0);
  scene.add(light);
  
  // Sun
  const sunGeo = new THREE.SphereGeometry(5, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);
  
  // Planets (8)
  const colors = [0x4287f5, 0x8a4fff, 0x00ffcc, 0xff884d, 0xdddddd, 0xffc107, 0x33cc33, 0x9999ff];
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.SphereGeometry(0.7 + i * 0.2, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.3 });
    const planet = new THREE.Mesh(geo, mat);
    planet.userData = { radius: 10 + i * 4, speed: 0.005 + i * 0.001 };
    scene.add(planet);
    planets.push(planet);
  }

  camera.position.z = 25;
}

function animate() {
  requestAnimationFrame(animate);
  sun.rotation.y += 0.002;
  planets.forEach((p, i) => {
    const t = Date.now() * p.userData.speed * 0.1;
    p.position.x = Math.cos(t) * p.userData.radius;
    p.position.z = Math.sin(t) * p.userData.radius;
    p.rotation.y += 0.02;
  });
  renderer.render(scene, camera);
}

document.getElementById("enterBtn").addEventListener("click", () => {
  document.querySelector(".overlay").style.opacity = "0";
  document.getElementById("bgm").play();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();