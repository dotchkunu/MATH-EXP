import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Setup Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.002);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 25);
camera.lookAt(0, 0, 0);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.rotateSpeed = 1.0;
controls.panSpeed = 0.8;
controls.target.set(0, 0, 0);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x4466cc, 0.3);
fillLight.position.set(-2, 3, -4);
scene.add(fillLight);

const backLight = new THREE.PointLight(0xffaa66, 0.2);
backLight.position.set(0, 2, -5);
scene.add(backLight);

// --- Helpers ---
const gridHelper = new THREE.GridHelper(50, 20, 0x88aaff, 0x335588);
gridHelper.position.y = -1.5;
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(10);
axesHelper.material.transparent = true;
axesHelper.material.opacity = 0.15;
scene.add(axesHelper);

// Starfield
const starGeometry = new THREE.BufferGeometry();
const starCount = 1500;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    starPositions[i*3] = (Math.random() - 0.5) * 300;
    starPositions[i*3+1] = (Math.random() - 0.5) * 150;
    starPositions[i*3+2] = (Math.random() - 0.5) * 100 - 50;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.6 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- Turtle State ---
const drawingGroup = new THREE.Group();
scene.add(drawingGroup);

let turtlePos = new THREE.Vector3(0, 0, 0);
let turtleQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0, 'YXZ'));
let penDown = true;
let currentLinePoints = [];
let currentLineObj = null;

// Turtle 3D Model
const turtleGeometry = new THREE.ConeGeometry(0.4, 0.8, 8);
const turtleMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa55, emissive: 0x442200, metalness: 0.6 });
const turtleMarker = new THREE.Mesh(turtleGeometry, turtleMaterial);
scene.add(turtleMarker);

// Update UI
function updateUI() {
    document.getElementById('pos-display').innerText = `(${turtlePos.x.toFixed(2)}, ${turtlePos.y.toFixed(2)}, ${turtlePos.z.toFixed(2)})`;
    const penStatusSpan = document.getElementById('pen-status');
    if (penDown) {
        penStatusSpan.innerText = 'DOWN';
        penStatusSpan.className = 'pen-down';
    } else {
        penStatusSpan.innerText = 'UP';
        penStatusSpan.className = 'pen-up';
    }
}

// Update current line geometry
function updateCurrentLine() {
    if (currentLinePoints.length < 2) return;
    if (currentLineObj) drawingGroup.remove(currentLineObj);
    
    const points = currentLinePoints.map(p => p.clone());
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffaa44, linewidth: 2 });
    currentLineObj = new THREE.Line(geometry, material);
    drawingGroup.add(currentLineObj);
}

// Turtle movement functions
function forward(distance) {
    const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(turtleQuat);
    const newPos = turtlePos.clone().add(forwardDir.multiplyScalar(distance));
    
    if (penDown) {
        if (currentLinePoints.length === 0) {
            currentLinePoints.push(turtlePos.clone());
        }
        currentLinePoints.push(newPos.clone());
        updateCurrentLine();
    }
    turtlePos = newPos;
    updateUI();
}

function penUp() {
    if (penDown) {
        penDown = false;
        currentLinePoints = [];
        currentLineObj = null;
        updateUI();
    }
}

function penDownCmd() {
    if (!penDown) {
        penDown = true;
        currentLinePoints = [turtlePos.clone()];
        updateUI();
    }
}

function rotateYaw(degrees) {
    const rad = degrees * Math.PI / 180;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rad, 0, 'YXZ'));
    turtleQuat.premultiply(q);
}

function rotatePitch(degrees) {
    const rad = degrees * Math.PI / 180;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad, 0, 0, 'YXZ'));
    turtleQuat.premultiply(q);
}

function moveTo(x, y, z) {
    if (penDown) {
        penUp();
        penDownCmd();
        currentLinePoints = [];
    }
    turtlePos.set(x, y, z);
    if (penDown) {
        currentLinePoints.push(turtlePos.clone());
    }
    updateUI();
}

function resetTurtle() {
    while(drawingGroup.children.length > 0) {
        drawingGroup.remove(drawingGroup.children[0]);
    }
    turtlePos.set(0, 0, 0);
    turtleQuat.setFromEuler(new THREE.Euler(0, 0, 0, 'YXZ'));
    penDown = true;
    currentLinePoints = [turtlePos.clone()];
    currentLineObj = null;
    updateUI();
}

// --- Mathematical Drawing Functions ---
function drawParametricCurve(func, rangeStart, rangeEnd, steps, color, lineWidth = 2) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = rangeStart + (rangeEnd - rangeStart) * (i / steps);
        const p = func(t);
        points.push(new THREE.Vector3(p.x, p.y, p.z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: lineWidth });
    const curveObj = new THREE.Line(geometry, material);
    drawingGroup.add(curveObj);
    turtlePos.copy(points[points.length-1]);
    updateUI();
}

// Mathematical functions
function helix3D(t) {
    const radius = 5;
    const x = radius * Math.cos(t * Math.PI * 2);
    const z = radius * Math.sin(t * Math.PI * 2);
    const y = (t - 0.5) * 8;
    return new THREE.Vector3(x, y, z);
}

function toroidalSpiral(t) {
    const R = 5;
    const r = 2;
    const turns = 6;
    const angle = t * Math.PI * 2 * turns;
    const x = (R + r * Math.cos(angle * 2)) * Math.cos(angle);
    const z = (R + r * Math.cos(angle * 2)) * Math.sin(angle);
    const y = r * Math.sin(angle * 2) * 1.2;
    return new THREE.Vector3(x, y, z);
}

function roseCurve3D(t) {
    const k = 5;
    const r = 6 * Math.cos(k * t);
    const x = r * Math.cos(t);
    const z = r * Math.sin(t);
    const y = 3 * Math.sin(t * 3);
    return new THREE.Vector3(x, y, z);
}

function doubleHelix(t) {
    const radius = 4;
    const angle = t * Math.PI * 2 * 3;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = (t - 0.5) * 8;
    
    // Second helix strand
    const angle2 = angle + Math.PI;
    const x2 = radius * Math.cos(angle2);
    const z2 = radius * Math.sin(angle2);
    
    if (Math.random() < 0.02) {
        const points1 = [];
        const points2 = [];
        for (let i = 0; i <= 100; i++) {
            const t2 = i / 100;
            const a = t2 * Math.PI * 2 * 3;
            points1.push(new THREE.Vector3(radius * Math.cos(a), (t2 - 0.5) * 8, radius * Math.sin(a)));
            points2.push(new THREE.Vector3(radius * Math.cos(a + Math.PI), (t2 - 0.5) * 8, radius * Math.sin(a + Math.PI)));
        }
        const geom1 = new THREE.BufferGeometry().setFromPoints(points1);
        const geom2 = new THREE.BufferGeometry().setFromPoints(points2);
        const material = new THREE.LineBasicMaterial({ color: 0x33ccff });
        drawingGroup.add(new THREE.Line(geom1, material));
        drawingGroup.add(new THREE.Line(geom2, material));
        
        // Add connecting rungs
        for (let i = 0; i <= 20; i++) {
            const t3 = i / 20;
            const a3 = t3 * Math.PI * 2 * 3;
            const p1 = new THREE.Vector3(radius * Math.cos(a3), (t3 - 0.5) * 8, radius * Math.sin(a3));
            const p2 = new THREE.Vector3(radius * Math.cos(a3 + Math.PI), (t3 - 0.5) * 8, radius * Math.sin(a3 + Math.PI));
            const rungPoints = [p1, p2];
            const rungGeom = new THREE.BufferGeometry().setFromPoints(rungPoints);
            const rungMat = new THREE.LineBasicMaterial({ color: 0xffaa66 });
            drawingGroup.add(new THREE.Line(rungGeom, rungMat));
        }
    }
    return new THREE.Vector3(x, y, z);
}

function drawWireframeCube() {
    resetTurtle();
    penDownCmd();
    const size = 4;
    const corners = [
        [-size, -size, -size], [ size, -size, -size], [ size, -size,  size], [-size, -size,  size],
        [-size,  size, -size], [ size,  size, -size], [ size,  size,  size], [-size,  size,  size]
    ];
    
    // Bottom square
    penUp(); moveTo(corners[0][0], corners[0][1], corners[0][2]); penDownCmd();
    for (let i = 1; i < 4; i++) moveTo(corners[i][0], corners[i][1], corners[i][2]);
    moveTo(corners[0][0], corners[0][1], corners[0][2]);
    
    // Top square
    penUp(); moveTo(corners[4][0], corners[4][1], corners[4][2]); penDownCmd();
    for (let i = 5; i < 8; i++) moveTo(corners[i][0], corners[i][1], corners[i][2]);
    moveTo(corners[4][0], corners[4][1], corners[4][2]);
    
    // Vertical edges
    for (let i = 0; i < 4; i++) {
        penUp(); moveTo(corners[i][0], corners[i][1], corners[i][2]); penDownCmd();
        moveTo(corners[i+4][0], corners[i+4][1], corners[i+4][2]);
    }
}

function drawFlower() {
    resetTurtle();
    const petals = 12;
    for (let i = 0; i < petals; i++) {
        const angleOffset = (i / petals) * Math.PI * 2;
        const points = [];
        for (let t = 0; t <= 1; t += 0.02) {
            const r = 4 * Math.sin(Math.PI * t);
            const theta = angleOffset + t * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = Math.sin(theta * 3) * 1.5;
            points.push(new THREE.Vector3(x, y, z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const hue = (i / petals) * 0.8 + 0.3;
        const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
        const material = new THREE.LineBasicMaterial({ color: color });
        const petalLine = new THREE.Line(geometry, material);
        drawingGroup.add(petalLine);
    }
    
    // Center sphere
    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0x442200 });
    const centerSphere = new THREE.Mesh(sphereGeo, sphereMat);
    centerSphere.position.set(0, 0, 0);
    drawingGroup.add(centerSphere);
}

// --- Event Listeners ---
document.getElementById('btn-spiral').onclick = () => {
    resetTurtle();
    drawParametricCurve(helix3D, 0, 1, 300, 0x66ccff);
};

document.getElementById('btn-cube').onclick = () => {
    drawWireframeCube();
};

document.getElementById('btn-parametric').onclick = () => {
    resetTurtle();
    drawParametricCurve(toroidalSpiral, 0, 1, 500, 0xff66aa);
};

document.getElementById('btn-rose').onclick = () => {
    resetTurtle();
    drawParametricCurve(roseCurve3D, 0, Math.PI * 2, 400, 0xff3366);
};

document.getElementById('btn-helix').onclick = () => {
    resetTurtle();
    doubleHelix(0.5);
    drawParametricCurve((t) => {
        const radius = 4;
        const angle = t * Math.PI * 2 * 3;
        return new THREE.Vector3(radius * Math.cos(angle), (t - 0.5) * 8, radius * Math.sin(angle));
    }, 0, 1, 400, 0x33ccff);
    
    drawParametricCurve((t) => {
        const radius = 4;
        const angle = t * Math.PI * 2 * 3 + Math.PI;
        return new THREE.Vector3(radius * Math.cos(angle), (t - 0.5) * 8, radius * Math.sin(angle));
    }, 0, 1, 400, 0xffaa44);
};

document.getElementById('btn-flower').onclick = () => {
    drawFlower();
};

document.getElementById('btn-clear').onclick = () => {
    resetTurtle();
    penDownCmd();
};

// --- FPS Counter ---
let fps = 0;
let lastTime = performance.now();
let frames = 0;

function updateFPS() {
    frames++;
    const now = performance.now();
    const delta = now - lastTime;
    if (delta >= 1000) {
        fps = frames;
        document.getElementById('fps').innerText = fps;
        frames = 0;
        lastTime = now;
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Update turtle marker position and rotation
    turtleMarker.position.copy(turtlePos);
    turtleMarker.quaternion.copy(turtleQuat);
    
    // Update FPS
    updateFPS();
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize
resetTurtle();
penDownCmd();
console.log('3D Turtle initialized!');