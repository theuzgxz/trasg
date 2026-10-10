/* ==========================================================================
   XYZARCRAFT &mdash; Interactive 3D Monolith & UI Micro-interactions
   Built with Three.js (Procedural Voxel Relic + Embers Particle Field)
   ========================================================================== */

// --- Estado Global e Interação 3D ---
let scene, camera, renderer;
let relicGroup, coreMesh, outerFragments = [];
let particles, particleGeo;

let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let isDragging = false;
let previousPointerX = 0, previousPointerY = 0;
let clock = new THREE.Clock();

function initThreeJS() {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Cena
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08080a, 0.04);

  // Câmera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 16);

  // Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Iluminação Cinemática
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffd580, 2.5); // Luz dourada principal
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x7050ff, 1.2); // Rim light místico roxo/azul
  fillLight.position.set(-6, -4, -4);
  scene.add(fillLight);

  const corePointLight = new THREE.PointLight(0xe5a93c, 3.0, 12);
  corePointLight.position.set(0, 0, 0);
  scene.add(corePointLight);

  // Criar o Monólito / Relíquia RPG Voxel 3D
  createRelic();

  // Criar Campo de Partículas de Brasas (Embers)
  createParticles();

  // Event Listeners para Mouse, Touch e Resize
  setupInteractionEvents(container);

  // Loop de Animação
  animate();
}

/**
 * Cria o Monólito Rúnico com fragmentos flutuantes estilo RPG Voxel
 */
function createRelic() {
  relicGroup = new THREE.Group();
  scene.add(relicGroup);

  // 1. Núcleo Rúnico de Cristal (Octaedro lapidado)
  const coreGeo = new THREE.OctahedronGeometry(1.6, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x111116,
    emissive: 0xd98e27,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.85,
    wireframe: false
  });
  coreMesh = new THREE.Mesh(coreGeo, coreMat);
  relicGroup.add(coreMesh);

  // 2. Anéis Rúnicos Orbitais (Wireframe minimalista)
  const ringGeo = new THREE.TorusGeometry(2.4, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe5a93c,
    transparent: true,
    opacity: 0.35
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2.3;
  relicGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(3.1, 0.015, 16, 64);
  const ring2 = new THREE.Mesh(ringGeo2, ringMat.clone());
  ring2.rotation.y = Math.PI / 3;
  relicGroup.add(ring2);

  // 3. Fragmentos Voxel Flutuantes ao redor (Estilo Minecraft RPG Shards)
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0x181822,
    roughness: 0.35,
    metalness: 0.8,
    flatShading: true
  });

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xe5a93c,
    transparent: true,
    opacity: 0.4
  });

  const numShards = 18;
  for (let i = 0; i < numShards; i++) {
    // Tamanho do voxel variado
    const size = 0.25 + Math.random() * 0.45;
    const shardGeo = new THREE.BoxGeometry(size, size * (1 + Math.random() * 2), size);
    const shard = new THREE.Mesh(shardGeo, shardMat);

    // Borda luminosa discreta
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(shardGeo), edgeMat);
    shard.add(wire);

    // Posicionamento esférico em órbita
    const radius = 2.2 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;

    shard.position.set(
      radius * Math.cos(theta) * Math.cos(phi),
      radius * Math.sin(phi),
      radius * Math.sin(theta) * Math.cos(phi)
    );

    shard.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // Dados para flutuação independente
    shard.userData = {
      initialY: shard.position.y,
      orbitSpeed: (0.15 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1),
      bobSpeed: 1 + Math.random() * 2,
      bobAmp: 0.15 + Math.random() * 0.2,
      radius: radius,
      theta: theta
    };

    relicGroup.add(shard);
    outerFragments.push(shard);
  }

  // Deslocamento inicial da relíquia para encaixar elegantemente atrás do texto hero
  relicGroup.position.set(0, 0.4, 0);
}

/**
 * Cria o sistema de partículas de brasas e poeira rúnica flutuante
 */
function createParticles() {
  const particleCount = 700;
  particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0xe5a93c); // Dourado
  const color2 = new THREE.Color(0xff4500); // Brasa alaranjada
  const color3 = new THREE.Color(0x8a70d6); // Místico

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Distribuição espacial
    positions[i] = (Math.random() - 0.5) * 35;
    positions[i + 1] = (Math.random() - 0.5) * 30;
    positions[i + 2] = (Math.random() - 0.5) * 25;

    // Gradiente sutil entre as partículas
    const rand = Math.random();
    const c = rand < 0.6 ? color1 : (rand < 0.85 ? color2 : color3);
    colors[i] = c.r;
    colors[i + 1] = c.g;
    colors[i + 2] = c.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Material com aspecto de faísca suave
  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);
}

/**
 * Configuração de Interação por Mouse, Arraste e Scroll
 */
function setupInteractionEvents(container) {
  // Movimento do mouse (Parallax suave)
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;
      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    }
  });

  // Arraste manual para girar a relíquia
  window.addEventListener('mousedown', (e) => {
    // Não ativa arrasto se clicou em botões ou links
    if (e.target.closest('a, button, .server-pill, .interactive-hint')) return;
    isDragging = true;
    previousPointerX = e.clientX;
    previousPointerY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support para Mobile
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('a, button, .server-pill')) return;
      isDragging = true;
      previousPointerX = e.touches[0].clientX;
      previousPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousPointerX;
      const deltaY = e.touches[0].clientY - previousPointerY;
      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;
      previousPointerX = e.touches[0].clientX;
      previousPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Redimensionamento de janela
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/**
 * Loop principal de Renderização
 */
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Rotação suave constante + interpolação de arraste do usuário
  if (!isDragging) {
    targetRotationY += 0.0025;
  }

  // Interpolação suave (Lerp)
  relicGroup.rotation.y += (targetRotationY - relicGroup.rotation.y) * 0.08;
  relicGroup.rotation.x += (targetRotationX - relicGroup.rotation.x) * 0.08;

  // Levitação senoidal mística do conjunto
  relicGroup.position.y = 0.4 + Math.sin(elapsedTime * 1.4) * 0.18;

  // Pulsação suave do núcleo rúnico
  if (coreMesh) {
    const pulse = 1 + Math.sin(elapsedTime * 3) * 0.06;
    coreMesh.scale.set(pulse, pulse, pulse);
    coreMesh.material.emissiveIntensity = 0.75 + Math.sin(elapsedTime * 2.5) * 0.25;
  }

  // Fragmentos orbitando
  outerFragments.forEach((shard) => {
    const u = shard.userData;
    u.theta += u.orbitSpeed * 0.02;
    shard.position.x = u.radius * Math.cos(u.theta);
    shard.position.z = u.radius * Math.sin(u.theta);
    shard.position.y = u.initialY + Math.sin(elapsedTime * u.bobSpeed) * u.bobAmp;
    shard.rotation.x += 0.008;
    shard.rotation.y += 0.01;
  });

  // Movimento contínuo das brasas/partículas
  if (particles) {
    particles.rotation.y = elapsedTime * 0.02;
    particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
  }

  // Efeito Parallax sutil da câmera guiado pelo mouse e pelo scroll
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollOffset = scrollY * 0.004;

  camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
  camera.position.y += (-mouseY * 1.2 - scrollOffset - camera.position.y) * 0.04;
  camera.lookAt(0, -scrollOffset * 0.5, 0);

  renderer.render(scene, camera);
}

// ==========================================================================
// Micro-Interações da Interface (UI)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa 3D se suportado
  try {
    initThreeJS();
  } catch (err) {
    console.warn("WebGL não inicializado:", err);
  }

  // Copiar IP do Servidor
  const copyIpBtn = document.getElementById('copyIpBtn');
  if (copyIpBtn) {
    copyIpBtn.addEventListener('click', () => {
      const serverIP = "jogar.xyzarcraft.net";
      navigator.clipboard.writeText(serverIP).then(() => {
        showToast("IP copiado! Cole na lista de servidores do Minecraft.");
      }).catch(() => {
        showToast("IP: " + serverIP);
      });
    });
  }
});

/**
 * Exibe notificação toast elegante e temporizada
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('visible');

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3800);
}

/**
 * Triggers de Download com feedback instantâneo e amigável
 */
function triggerDownload(type) {
  if (type === 'modpack') {
    showToast("Baixando 'XyzarCraft-Modpack.zip' (Compatível com TLauncher)...");
  } else if (type === 'launcher') {
    showToast("Baixando launcher direto 'XyzarCraft.exe.zip'...");
  }
}

/**
 * Disparo real de download de arquivo no navegador
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Garante disponibilidade global para atributos onclick no HTML
window.triggerDownload = triggerDownload;
window.showToast = showToast;

