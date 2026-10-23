/* ============================== PAGE LOGIC ===================================*/
// skills data -> html, edit the array to change your skills.
const skills = [['HTML', 95], ['CSS', 90], ['JavaScript', 85], ['React', 70], ['Three.js', 60], ['Git & GitHub', 80]];
document.getElementById('skillGrid').innerHTML = skills.map(([n, v]) =>
    `<div class="card skill"><div class="row"><span>${n}</span><span>${v}%</span></div><div class="bar"><i data-w="${v}"></i></div></div>`).join('');

// mobile menu
const burger = document.getElementById('burger'), menu = document.getElementById('menu');
burger.onclick = () => {
    const o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
};
menu.onclick = e => {
    if (e.target.tagName === 'A') menu.classList.remove('open');
};

// Reveal on scroll + fill skill bars
const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('show');
    e.target.querySelectorAll('.bar i').forEach(b => b.style.width = b.dataset.w + '%');
    io.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Highlight the nav link of the section currently on screen
const links = [...document.querySelectorAll('nav a')];
const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === "#" + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section').forEach(s => spy.observe(s));

// contact form -> opens the visitor's email app (no backend needed)
document.getElementById('form').onsubmit = e => {
    e.preventDefault();
    const body = `${fm.value}\n\nFrom: ${fn.value} (${fe.value})`;
    location.href = `mailto:you@example.com?subject=${encodeURIComponent('Portfolio message from ' + fn.value)}&body=${encodeURIComponent(body)}`;
};

/* ========================== 3D GLASS CUBE ==================== */

const box = document.getElementById('cube');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 8;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
box.appendChild(renderer.domElement);

// a helper that draws a label on a 2d canvas and returns it as a texture
function iconTexture(label) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = `800 ${label.length > 3 ? 70 : 100}px Poppins, Arial, sans-serif`;
    x.fillText(label, 128, 134);
    return new THREE.CanvasTexture(c);
}

const pivot = new THREE.Group();
scene.add(pivot);
const cube = new THREE.Group();
const SIZE = 2.6;

// Glass body + glowing edges
cube.add(new THREE.Mesh(
    new THREE.BoxGeometry(SIZE, SIZE, SIZE),
    new THREE.MeshPhysicalMaterial({ color: 0x3a1fa8, transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.2, clearcoat: 1, side: THREE.DoubleSide })
));
const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, SIZE, SIZE)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
);
cube.add(edges);

// Inner shape: gives the "inside the glass" feeling from the design
const inner = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.5)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
);
cube.add(inner);

// One icon on each of the 6 faces
const labels = ['</>', 'HTML', 'CSS', 'JS', 'React', 'Git'];
const faces = [
    [1, 0, 0, 0, Math.PI / 2],
    [-1, 0, 0, 0, -Math.PI / 2],
    [0, 1, 0, -Math.PI / 2, 0],
    [0, -1, 0, Math.PI / 2, 0],
    [0, 0, 1, 0, 0],
    [0, 0, -1, 0, Math.PI]
];
faces.forEach(([x, y, z, rx, ry], i) => {
    const p = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({ map: iconTexture(labels[i]), transparent: true, side: THREE.DoubleSide })
    );
    p.position.set(x, y, z).multiplyScalar(SIZE / 2 + 0.02);
    p.rotation.set(rx, ry, 0);
    cube.add(p);
});
cube.rotation.set(0.5, 0.7, 0);
pivot.add(cube);

// Two thin orbit rings around the cube
const rings = [0, 1].map(i => {
    const r = new THREE.Mesh(
        new THREE.TorusGeometry(3.3, 0.012, 8, 220),
        new THREE.MeshBasicMaterial({ color: 0x1fb6e6, transparent: true, opacity: 0.4 })
    );
    r.rotation.set(i ? 1.2 : 0.4, i ? 0.3 : 1.3, 0);
    pivot.add(r);
    return r;
});

// lights: purple from the left, cyan from the right
const amb = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(amb);
const light1 = new THREE.PointLight(0x7c4dff, 2, 20); light1.position.set(-5, 3, 5); scene.add(light1);
const light2 = new THREE.PointLight(0x1fb6e6, 2, 20); light2.position.set(5, -2, 5); scene.add(light2);

// Mouse parallax + resize
const mouse = { x: 0, y: 0 };
addEventListener('mousemove', e => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
});
function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(box);
resize();

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Floating dust fills the whole page with depth
const D = 500, dp = new Float32Array(D * 3);
for (let i = 0; i < D; i++) dp.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, -10 + Math.random() * 12], i * 3);
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.04, color: 0x9fb4ff, transparent: true, opacity: 0.55 }));
scene.add(dust);

/* The cube travels with you. For each section we define where it should sit:
   [x as fraction of half screen width, y as fraction of half height, scale, opacity]
   While scrolling we blend between two neighbouring sections. */
const secs = [...document.querySelectorAll('main section')];
const stops = [[0.45, 0, 0.62, 1], [0.85, 0.12, 0.38, 0.4], [-0.85, -0.1, 0.38, 0.4], [0.85, 0.1, 0.38, 0.4], [-0.85, -0.1, 0.38, 0.4], [0.8, 0, 0.42, 0.5]];
const cur = { x: 0.45, y: 0, s: 0.62, o: 1 };
const lerp = (a, b, f) => a + (b - a) * f;

function target() {
    const mid = scrollY + innerHeight / 2;
    const c = secs.map(s => s.offsetTop + s.offsetHeight / 2);
    let i = 0;
    while (i < c.length - 1 && c[i + 1] <= mid) i++;
    if (i === c.length - 1 || mid <= c[0]) return stops[Math.min(i, stops.length - 1)];
    let f = (mid - c[i]) / (c[i + 1] - c[i]);
    f = f * f * (3 - 2 * f);
    return stops[i].map((v, k) => lerp(v, stops[i + 1][k], f));
}

// Scroll progress bar under the navbar
const bar = document.getElementById('progress');
addEventListener('scroll', () => {
    bar.style.width = scrollY / (document.documentElement.scrollHeight - innerHeight) * 100 + '%';
});

// The role line types and deletes itself
const roleEl = document.getElementById('role');
const roles = ['Frontend Developer', 'Web Designer', '3D Web Enthusiast'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
    if (reduce) return;
    let i = 0;
    for (;;) {
        await sleep(2400);
        for (let k = roles[i].length; k >= 0; k--) { roleEl.textContent = roles[i].slice(0, k); await sleep(40); }
        i = (i + 1) % roles.length;
        for (let k = 1; k <= roles[i].length; k++) { roleEl.textContent = roles[i].slice(0, k); await sleep(70); }
    }
})();

/* THEMES: one object per theme holds every 3D color. Switching just copies these values into the scene. */
const THREE_THEMES = {
    midnight: { glass: 0x3a1fa0, glassOp: 0.55, edge: 0x38bdf8, ring: 0x1fb6e6, l1: 0x7c4dff, l2: 0x1fb6e6, dust: 0x9fb4ff, amb: 0.7 },
    eclipse: { glass: 0x050505, glassOp: 0.8, edge: 0xffd9a0, ring: 0xff9a45, l1: 0xff9a45, l2: 0xffd9a0, dust: 0xffe2b8, amb: 0.35 }
};
const themeBtns = [...document.querySelectorAll('.themes button')];
function applyTheme(name) {
    const t = THREE_THEMES[name] || THREE_THEMES.midnight;
    document.documentElement.dataset.theme = name;
    const glass = cube.children[0].material;
    glass.color.setHex(t.glass);
    glass.opacity = t.glassOp;
    edges.material.color.setHex(t.edge);
    inner.material.color.setHex(t.edge);
    rings.forEach(r => r.material.color.setHex(t.ring));
    light1.color.setHex(t.l1);
    light2.color.setHex(t.l2);
    amb.intensity = t.amb;
    dust.material.color.setHex(t.dust);
    themeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.t === name));
    try { localStorage.setItem('theme', name); } catch (e) { }
}
themeBtns.forEach(b => b.onclick = () => applyTheme(b.dataset.t));
let saved = 'midnight';
try { saved = localStorage.getItem('theme') || 'midnight'; } catch (e) { }
applyTheme(saved);

const clock = new THREE.Clock();
const halfH = Math.tan(22.5 * Math.PI / 180) * 8;
(function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const narrow = innerWidth < 900;
    const [tx, ty, ts, to] = target();
    const k = reduce ? 1 : 0.07;
    cur.x = lerp(cur.x, narrow ? tx * 0.6 : tx, k);
    cur.y = lerp(cur.y, ty, k);
    cur.s = lerp(cur.s, narrow ? ts * 0.7 : ts, k);
    cur.o = lerp(cur.o, narrow ? to * 0.55 : to, k);

    pivot.position.set(cur.x * halfH * camera.aspect, cur.y * halfH, 0);
    pivot.scale.setScalar(cur.s);
    box.style.opacity = cur.o;

    if (!reduce) {
        cube.rotation.y = 0.7 + t * 0.35 + mouse.x * 0.8 + scrollY * 0.003;
        cube.rotation.x = 0.5 + mouse.y * 0.5;
        cube.position.y = Math.sin(t * 1.2) * 0.12;
        inner.rotation.y = -t * 0.5;
        rings[0].rotation.z = t * 0.15;
        rings[1].rotation.z = -t * 0.12;
        dust.rotation.y = t * 0.02 + scrollY * 0.0006;
    }
    renderer.render(scene, camera);
})();