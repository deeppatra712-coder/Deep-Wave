let scene, camera, renderer, blackHole, stars = [];
const canvas = document.getElementById('universe');
const bgm = document.getElementById('bgm');
const enterBtn = document.getElementById('enterBtn');
const overlay = document.querySelector('.center');

function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
  renderer = new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const geo = new THREE.SphereGeometry(5,64,64);
  const mat = new THREE.ShaderMaterial({
    uniforms:{
      time:{value:0.0},
      color1:{value:new THREE.Color(0x000000)},
      color2:{value:new THREE.Color(0x5500ff)}
    },
    vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }`,
    fragmentShader:`
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main(){
        float pulse = 0.5+0.5*sin(time*2.0);
        vec2 c = vUv-0.5;
        float r = length(c)*3.0;
        float intensity = smoothstep(1.0,0.0,r);
        vec3 color = mix(color1,color2,pulse);
        gl_FragColor = vec4(color*intensity,1.0);
      }`
  });
  blackHole = new THREE.Mesh(geo,mat);
  scene.add(blackHole);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    positions[i*3]   = (Math.random()-0.5)*2000;
    positions[i*3+1] = (Math.random()-0.5)*2000;
    positions[i*3+2] = (Math.random()-0.5)*2000;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const starMat = new THREE.PointsMaterial({color:0xffffff,size:1});
  const starMesh = new THREE.Points(starGeo,starMat);
  scene.add(starMesh);

  camera.position.z = 30;
  animate();
}

let t=0;
function animate(){
  requestAnimationFrame(animate);
  t += 0.01;
  blackHole.material.uniforms.time.value = t;
  blackHole.rotation.y += 0.005;
  renderer.render(scene,camera);
}

let entering=false;
enterBtn.addEventListener('click',()=>{
  if(entering) return;
  entering=true;
  bgm.play();
  overlay.classList.add('fade-out');
  let warp=0;
  const warpAnim = setInterval(()=>{
    camera.position.z -= 0.8;
    camera.rotation.z += 0.02;
    warp += 1;
    if(warp>100){
      clearInterval(warpAnim);
      createTunnel();
    }
  },30);
});

function createTunnel(){
  // replace scene with energy tunnel
  scene.clear();
  const tunnelGeo = new THREE.TorusKnotGeometry(20,6,300,32);
  const tunnelMat = new THREE.MeshStandardMaterial({
    color:0x5500ff, metalness:1, roughness:0.1, emissive:0x2200ff, emissiveIntensity:2
  });
  const tunnel = new THREE.Mesh(tunnelGeo,tunnelMat);
  scene.add(tunnel);
  const light = new THREE.PointLight(0x00ffff,2,200);
  scene.add(light);
  camera.position.z = 50;
  function spin(){
    requestAnimationFrame(spin);
    tunnel.rotation.x += 0.02;
    tunnel.rotation.y += 0.03;
    renderer.render(scene,camera);
  }
  spin();
}

window.addEventListener('resize',()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

init();