// Custom Interactive JS - Tithy Koley Portfolio

document.addEventListener('DOMContentLoaded', () => {
  initThreeBG();
  initCustomCursor();
  initTiltCards();
  initScrollReveal();
  initMobileMenu();
});

// WebGL 3D Particles Background
function initThreeBG() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create particles
  const particleCount = 180;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Curated theme colors (glowing purple and cyan accent shades)
  const color1 = new THREE.Color('#7c5cff');
  const color2 = new THREE.Color('#00c8ff');

  for (let i = 0; i < particleCount; i++) {
    // Random distribution in a spherical bounds
    const r = 2.5 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    // Lerp colors between purple and blue
    const mixedColor = color1.clone().lerp(color2, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Generate glowing circular particle texture
  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 16;
  canvasTexture.height = 16;
  const ctx = canvasTexture.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvasTexture);

  const material = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    map: texture,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Mouse interactivity variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 120;
    mouseY = (e.clientY - window.innerHeight / 2) / 120;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Subtle automatic rotation
    particleSystem.rotation.y = elapsedTime * 0.04;
    particleSystem.rotation.x = elapsedTime * 0.015;

    // Smooth transition camera displacement (parallax)
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX * 0.6;
    camera.position.y = -targetY * 0.6;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Custom Cursor Interaction
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tick() {
    cursorX += (mouseX - cursorX) * 0.16;
    cursorY += (mouseY - cursorY) * 0.16;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(tick);
  }
  tick();

  // Expansion and highlight on hover
  const interactives = document.querySelectorAll('a, button, .group, .p-5, .p-6, [role="button"]');
  interactives.forEach(item => {
    item.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    item.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
}

// Interactive 3D Card Tilt
function initTiltCards() {
  // Only apply tilt on devices with a mouse/precise pointer to prevent sticky states on touch screens
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const cards = document.querySelectorAll('.tilt-card-hover');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate relative rotation (capped at 10deg)
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.boxShadow = '0 30px 60px -15px rgba(124, 92, 255, 0.4)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow = '';
    });
  });
}

// Scroll Reveal Observer
function initScrollReveal() {
  const elements = document.querySelectorAll('section, article, header, dl');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        entry.target.classList.add('opacity-100', 'translate-y-0');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => {
    el.classList.add('transition-all', 'duration-[1000ms]', 'ease-out', 'opacity-0', 'translate-y-10');
    observer.observe(el);
  });
}

// Mobile Navigation Menu Toggle
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('opacity-100');
    if (isOpen) {
      mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      // Hamburger icon path
      menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    } else {
      mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      // Close icon path (X)
      menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    }
  });

  // Close overlay on clicking links
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    });
  });
}
