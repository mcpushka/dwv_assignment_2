let scene, camera, renderer, globe;
const points = [];
const locationsMap = {};

init();
animate();
setInterval(fetchData, 2000);

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 0.75 * window.innerHeight / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.75, window.innerHeight);
  document.getElementById('globe-container').appendChild(renderer.domElement);

  // Globe
  const sphere = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
  globe = new THREE.Mesh(sphere, material);
  scene.add(globe);
}

function animate() {
  requestAnimationFrame(animate);
  globe.rotation.y += 0.001;
  renderer.render(scene, camera);
}

function fetchData() {
  fetch('http://localhost:5000/data')
    .then(res => res.json())
    .then(data => {
      data.forEach(pkg => {
        const lat = pkg.latitude;
        const lon = pkg.longitude;
        const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;

        // Add a point if new
        if (!locationsMap[key]) {
          const point = createPoint(lat, lon);
          scene.add(point);
          points.push(point);
          locationsMap[key] = 1;
        } else {
          locationsMap[key]++;
        }
      });
      updateSidebar();
    });
}

function createPoint(lat, lon) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const radius = 1.01;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  const geom = new THREE.SphereGeometry(0.01, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function updateSidebar() {
  const list = document.getElementById('location-list');
  list.innerHTML = '';

  const sorted = Object.entries(locationsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([loc, count]) => {
    const item = document.createElement('li');
    item.textContent = `${loc} — ${count} hits`;
    list.appendChild(item);
  });
}
