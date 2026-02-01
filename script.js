import * as THREE from 'three';

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffaec9, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// --- Dynamic Background Logic ---

// Particle System
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Textures
function createShapeTexture(char, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

const textureHeart = createShapeTexture('♥', '#ff69b4');
const textureStar = createShapeTexture('✦', '#ffd700');
const textureCloud = createShapeTexture('☁', '#ffffff');
const textureOrb = createShapeTexture('•', '#ffae42');

// Initial Material (Hearts for Intro)
const material = new THREE.PointsMaterial({
    size: 0.2,
    map: textureHeart,
    transparent: true,
    opacity: 0.8,
    color: 0xffaaaa,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

camera.position.z = 5;

// Variables for transition
let targetColor = new THREE.Color(0xffaaaa);
let targetSize = 0.2;
let driftSpeedY = 0.05; // Vertical movement speed

// Sections & Themes
const themes = [
    {   // Intro
        color: 0xffaaaa,
        map: textureHeart,
        size: 0.2,
        drift: 0.2,
        rot: 0.0005
    },
    {   // Para 1: Dawn/Celestial (Stars, Gold)
        color: 0xffd700,
        map: textureStar,
        size: 0.15,
        drift: 0.02,
        rot: 0.0002
    },
    {   // Para 2: Clouds/Sky (White/Blue, Soft)
        color: 0xe0ffff,
        map: textureCloud,
        size: 0.3,
        drift: -0.05,
        rot: 0.0001
    },
    {   // Para 3: Memories (Warm Amber, Orbs)
        color: 0xffae42,
        map: textureOrb,
        size: 0.1,
        drift: 0,
        rot: 0.001
    },
    {   // Proposal: Intense Red Hearts
        color: 0xff0000,
        map: textureHeart,
        size: 0.3,
        drift: 0.5,
        rot: 0.002
    }
];

// Observer for Theme Switching
const sections = document.querySelectorAll('.page');
const observerOptions = { threshold: 0.5 };

let currentThemeIndex = 0;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Determine active section index
            const index = Array.from(sections).indexOf(entry.target);
            if (index !== -1 && index < themes.length) {
                currentThemeIndex = index;
                const theme = themes[index];

                // Update Target Props
                targetColor.setHex(theme.color);
                targetSize = theme.size;
                driftSpeedY = theme.drift;

                // Update Texture
                material.map = theme.map;
                material.needsUpdate = true;
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Custom Cursor Logic
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    const cursor = document.getElementById('cursor-follower');
    if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    }

    // Parallax
    particlesMesh.rotation.x = mouseY * 0.00005;
    particlesMesh.rotation.y = mouseX * 0.00005;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Transition for Color
    material.color.lerp(targetColor, 0.05);

    // Smooth Transition for Size
    material.size += (targetSize - material.size) * 0.05;

    // Movement Logic based on Theme
    particlesMesh.rotation.y += themes[currentThemeIndex].rot;

    // Vertical Drift
    particlesMesh.position.y += Math.sin(elapsedTime) * 0.001 * driftSpeedY;

    // Gentle Wave for specific themes
    if (currentThemeIndex === 2) { // Clouds
        particlesMesh.position.x = Math.sin(elapsedTime * 0.5) * 0.2;
    }

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Button Logic ---
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const celebrationOverlay = document.getElementById('celebration-overlay');

// No button runs away
noBtn.addEventListener('mouseover', (e) => {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

    noBtn.style.position = 'fixed';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

// Touch support for no button (tap to move)
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

    noBtn.style.position = 'fixed';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

yesBtn.addEventListener('click', () => {
    celebrationOverlay.classList.add('active');

    // Explosion of hearts
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 300);
    }
});

function createConfetti() {
    // Simple DOM confetti for the celebration
    const emojis = ['❤️', '💖', '🥰', '💕', '🌹'];
    for (let i = 0; i < 50; i++) {
        const el = document.createElement('div');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.position = 'fixed';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-10vh';
        el.style.fontSize = Math.random() * 2 + 1 + 'rem';
        el.style.transition = 'transform 3s ease-in, opacity 3s ease-in';
        el.style.zIndex = 10001;
        document.body.appendChild(el);

        setTimeout(() => {
            el.style.transform = `translate(${Math.random() * 20 - 10}vw, 110vh) rotate(${Math.random() * 360}deg)`;
            el.style.opacity = 0;
        }, 100);

        setTimeout(() => {
            el.remove();
        }, 3000);
    }
}

// Music Logic
const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0.5;

let isPlaying = false;

// Try to auto-play on first interaction if not already playing
const tryAutoPlay = () => {
    if (!isPlaying) {
        bgMusic.play().then(() => {
            isPlaying = true;
            // Remove listeners once successful
            document.removeEventListener('click', tryAutoPlay);
            document.removeEventListener('touchstart', tryAutoPlay);
            document.removeEventListener('keydown', tryAutoPlay);
        }).catch(() => {
            // Failed (expected usually), wait for next interaction
        });
    }
};

document.addEventListener('click', tryAutoPlay);
document.addEventListener('touchstart', tryAutoPlay);
document.addEventListener('keydown', tryAutoPlay);
