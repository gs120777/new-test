import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ---------- State ----------
const state = {
  paint: { hex: 0xd5001c, finish: 'metallic', name: 'Guards Red' },
  wheel: 'silver',
  caliper: 0xffcc00,
  interior: 0x1a1a1a,
  wing: true,
  doors: false,
  hood: false,
  headlights: false,
  env: 'studio',
  autoRotate: false,
  cam: 'hero',
};

// ---------- Renderer ----------
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, powerPreference: 'high-performance', alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ---------- Scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0c);
scene.fog = new THREE.Fog(0x0a0a0c, 18, 55);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- Camera & Controls ----------
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(7.2, 2.4, 7.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 3.4;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 0.65, 0);
controls.update();

// ---------- Lights ----------
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(6, 8, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -8;
key.shadow.camera.right = 8;
key.shadow.camera.top = 8;
key.shadow.camera.bottom = -8;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0xff8866, 1.2);
rim.position.set(-6, 4, -5);
scene.add(rim);

const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
fill.position.set(-2, 3, 6);
scene.add(fill);

scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.25));

// ---------- Floor ----------
const floor = (() => {
  const geo = new THREE.CircleGeometry(40, 96);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x121216,
    roughness: 0.35,
    metalness: 0.6,
  });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
})();
scene.add(floor);

// Light grid pattern
(() => {
  const grid = new THREE.GridHelper(60, 60, 0x222230, 0x1a1a22);
  grid.material.opacity = 0.35;
  grid.material.transparent = true;
  grid.position.y = 0.001;
  scene.add(grid);
})();

// ---------- Materials ----------
const mats = {};

function makePaint(hex, finish) {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness: finish === 'metallic' ? 0.85 : 0.2,
    roughness: finish === 'matte' ? 0.6 : 0.18,
    clearcoat: finish === 'matte' ? 0.0 : 1.0,
    clearcoatRoughness: 0.06,
    sheen: 0.1,
    envMapIntensity: 1.2,
  });
}
mats.paint = makePaint(state.paint.hex, state.paint.finish);

mats.glass = new THREE.MeshPhysicalMaterial({
  color: 0x111418,
  metalness: 0.0,
  roughness: 0.05,
  transmission: 0.85,
  thickness: 0.4,
  ior: 1.45,
  transparent: true,
  opacity: 0.6,
  envMapIntensity: 1.3,
});

mats.chrome = new THREE.MeshStandardMaterial({
  color: 0xeaeaea, metalness: 1.0, roughness: 0.1, envMapIntensity: 1.5,
});
mats.darkChrome = new THREE.MeshStandardMaterial({
  color: 0x2b2d33, metalness: 0.95, roughness: 0.25,
});
mats.rubber = new THREE.MeshStandardMaterial({
  color: 0x0a0a0c, metalness: 0.0, roughness: 0.95,
});
mats.tireSide = new THREE.MeshStandardMaterial({
  color: 0x111114, metalness: 0.0, roughness: 0.85,
});
mats.carbon = new THREE.MeshStandardMaterial({
  color: 0x14141a, metalness: 0.4, roughness: 0.45,
});
mats.brake = new THREE.MeshStandardMaterial({
  color: state.caliper, metalness: 0.6, roughness: 0.35,
});
mats.rotor = new THREE.MeshStandardMaterial({
  color: 0x55585c, metalness: 1.0, roughness: 0.4,
});
mats.headlightLens = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0.0, roughness: 0.05,
  transmission: 0.9, thickness: 0.2, ior: 1.5,
  emissive: 0x000000, emissiveIntensity: 0,
});
mats.taillightLens = new THREE.MeshPhysicalMaterial({
  color: 0x550000, metalness: 0.0, roughness: 0.1,
  transmission: 0.6, thickness: 0.2,
  emissive: 0x440000, emissiveIntensity: 0.4,
});
mats.interior = new THREE.MeshStandardMaterial({
  color: state.interior, metalness: 0.05, roughness: 0.85,
});
mats.alcantara = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a, metalness: 0.0, roughness: 0.95,
});
mats.licensePlate = new THREE.MeshStandardMaterial({
  color: 0xeeeeee, metalness: 0.0, roughness: 0.6,
});

// Wheel finish presets
const wheelFinishes = {
  silver: { color: 0xb8b8be, metalness: 1.0, roughness: 0.25 },
  black:  { color: 0x18181c, metalness: 0.85, roughness: 0.4 },
  gold:   { color: 0xb89148, metalness: 1.0, roughness: 0.3 },
};
mats.wheel = new THREE.MeshStandardMaterial(wheelFinishes.silver);

// ---------- Car group ----------
const car = new THREE.Group();
scene.add(car);

// Helper: rounded box
function roundedBox(w, h, d, r = 0.15, segs = 4) {
  // Approximation via THREE.BoxGeometry with extra subdivisions, smoothed by displaced vertices.
  // For simplicity we use the engine BoxGeometry — visual smoothing comes from clearcoat & shape silhouette.
  return new THREE.BoxGeometry(w, h, d, segs, segs, segs);
}

// ---------- Build Body ----------
// We construct a 911-like silhouette using several extruded shapes: a side profile defines the lateral
// outline (low nose, peaked fenders, fastback rear, ducktail). Then we taper it horizontally with separate
// rounded fender forms.

const body = new THREE.Group();
car.add(body);

// Side profile (extruded along Z to give car width, then carved with fenders)
const profileShape = (() => {
  const s = new THREE.Shape();
  // Start at the front bumper bottom (front = +X)
  s.moveTo(2.15, 0.18);          // front bumper bottom
  s.lineTo(2.30, 0.30);          // front splitter tip (slight kick up)
  s.lineTo(2.32, 0.55);          // bumper face
  s.bezierCurveTo(2.30, 0.80, 2.20, 0.85, 2.05, 0.86); // hood lip
  s.bezierCurveTo(1.60, 0.92, 1.20, 0.96, 0.85, 1.12); // hood + base of windshield
  s.bezierCurveTo(0.55, 1.28, 0.30, 1.45, 0.05, 1.55); // windshield rake
  s.bezierCurveTo(-0.30, 1.62, -0.65, 1.62, -1.05, 1.50); // roof
  s.bezierCurveTo(-1.45, 1.36, -1.75, 1.18, -2.00, 0.95); // fastback rear glass
  s.bezierCurveTo(-2.15, 0.82, -2.25, 0.78, -2.32, 0.78); // ducktail base
  s.lineTo(-2.36, 0.78);         // ducktail outer
  s.lineTo(-2.40, 0.62);         // rear bumper top
  s.lineTo(-2.38, 0.35);         // rear bumper face
  s.lineTo(-2.30, 0.18);         // diffuser
  s.lineTo(2.15, 0.18);          // back to start
  return s;
})();

const profileExtrude = new THREE.ExtrudeGeometry(profileShape, {
  depth: 1.84, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06,
  bevelSegments: 4, curveSegments: 24,
});
profileExtrude.translate(0, 0, -0.92);
profileExtrude.computeVertexNormals();
const bodyMain = new THREE.Mesh(profileExtrude, mats.paint);
bodyMain.castShadow = true;
bodyMain.receiveShadow = true;
body.add(bodyMain);

// Fenders — bulging arches over each wheel.
function fender(x, z) {
  const g = new THREE.SphereGeometry(0.62, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
  g.scale(1.0, 1.05, 0.78);
  const m = new THREE.Mesh(g, mats.paint);
  m.position.set(x, 0.62, z);
  m.castShadow = true;
  return m;
}
body.add(fender( 1.45,  0.92));
body.add(fender( 1.45, -0.92));
body.add(fender(-1.45,  0.95));
body.add(fender(-1.45, -0.95));

// Side skirts
function skirt(z) {
  const g = new THREE.BoxGeometry(2.6, 0.10, 0.10);
  const m = new THREE.Mesh(g, mats.carbon);
  m.position.set(0, 0.30, z);
  m.castShadow = true;
  return m;
}
body.add(skirt( 0.95));
body.add(skirt(-0.95));

// Front splitter
const splitter = (() => {
  const g = new THREE.BoxGeometry(0.45, 0.04, 1.85);
  const m = new THREE.Mesh(g, mats.carbon);
  m.position.set(2.10, 0.20, 0);
  return m;
})();
body.add(splitter);

// Rear diffuser (with fins)
(() => {
  const g = new THREE.BoxGeometry(0.45, 0.04, 1.7);
  const m = new THREE.Mesh(g, mats.carbon);
  m.position.set(-2.20, 0.20, 0);
  body.add(m);
  for (let i = -3; i <= 3; i++) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.40, 0.10, 0.04),
      mats.carbon
    );
    fin.position.set(-2.20, 0.27, i * 0.22);
    body.add(fin);
  }
})();

// ---------- Greenhouse / glass ----------
const greenhouseShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.95, 1.10);
  s.bezierCurveTo(0.55, 1.30, 0.30, 1.45, 0.05, 1.52);
  s.bezierCurveTo(-0.30, 1.58, -0.65, 1.58, -1.05, 1.46);
  s.bezierCurveTo(-1.45, 1.32, -1.75, 1.14, -1.95, 0.92);
  s.lineTo(0.95, 1.10);
  return s;
})();
const greenhouseGeo = new THREE.ExtrudeGeometry(greenhouseShape, {
  depth: 1.62, bevelEnabled: false, curveSegments: 18,
});
greenhouseGeo.translate(0, -0.04, -0.81);
const greenhouse = new THREE.Mesh(greenhouseGeo, mats.glass);
body.add(greenhouse);

// Side window cutouts (thin glass strips on doors)
function sideGlass(z) {
  const s = new THREE.Shape();
  s.moveTo(0.88, 1.00);
  s.bezierCurveTo(0.55, 1.20, 0.30, 1.36, 0.05, 1.42);
  s.bezierCurveTo(-0.30, 1.48, -0.65, 1.48, -1.00, 1.36);
  s.bezierCurveTo(-1.30, 1.24, -1.55, 1.06, -1.70, 0.86);
  s.lineTo(-1.55, 0.86);
  s.bezierCurveTo(-1.40, 1.02, -1.15, 1.18, -0.85, 1.28);
  s.bezierCurveTo(-0.50, 1.36, -0.20, 1.36, 0.10, 1.30);
  s.bezierCurveTo(0.40, 1.22, 0.65, 1.10, 0.85, 0.96);
  s.lineTo(0.88, 1.00);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false, curveSegments: 18 });
  const m = new THREE.Mesh(g, mats.glass);
  m.position.z = z;
  body.add(m);
}
sideGlass( 0.91);
sideGlass(-0.93);

// ---------- Headlights ----------
function headlight(z) {
  const grp = new THREE.Group();
  // Outer round housing
  const housing = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    mats.darkChrome
  );
  housing.rotation.x = -Math.PI / 2;
  housing.rotation.z = Math.PI / 2;
  housing.scale.set(1.0, 1.0, 0.55);
  grp.add(housing);

  // Lens
  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    mats.headlightLens
  );
  lens.rotation.x = -Math.PI / 2;
  lens.rotation.z = Math.PI / 2;
  lens.scale.set(1.0, 1.0, 0.5);
  grp.add(lens);

  // Inner LED rings
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.012, 12, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.0 })
  );
  ring.rotation.y = Math.PI / 2;
  ring.position.x = 0.04;
  grp.add(ring);
  grp.userData.ring = ring;
  grp.userData.lens = lens;

  grp.position.set(2.05, 0.78, z);
  return grp;
}
const hlL = headlight( 0.65);
const hlR = headlight(-0.65);
body.add(hlL); body.add(hlR);

// ---------- Tail lights (full-width strip) ----------
(() => {
  const stripGeo = new THREE.BoxGeometry(0.04, 0.07, 1.50);
  const strip = new THREE.Mesh(stripGeo, mats.taillightLens);
  strip.position.set(-2.36, 0.78, 0);
  body.add(strip);

  // Smaller circular elements
  for (const z of [0.55, -0.55]) {
    const g = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24),
      mats.taillightLens
    );
    g.rotation.z = Math.PI / 2;
    g.position.set(-2.37, 0.78, z);
    body.add(g);
  }
})();

// ---------- Door panels (animated) ----------
function doorMesh(z) {
  const grp = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0.85, 0.20);
  s.lineTo(0.85, 1.05);
  s.bezierCurveTo(0.55, 1.20, 0.30, 1.32, 0.05, 1.36);
  s.bezierCurveTo(-0.20, 1.38, -0.40, 1.36, -0.55, 1.30);
  s.lineTo(-0.55, 0.20);
  s.lineTo(0.85, 0.20);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false, curveSegments: 12 });
  const door = new THREE.Mesh(g, mats.paint);
  door.castShadow = true;
  grp.add(door);
  grp.position.z = z;
  // Hinge axis is at the front of the door (~x = 0.85)
  grp.userData.hingeX = 0.85;
  return grp;
}
// We don't replace the body — these doors sit on top as a visible cut and animate open/close.
const doorL = doorMesh( 0.93);
const doorR = doorMesh(-0.95);
doorR.scale.z = -1;
body.add(doorL); body.add(doorR);

// ---------- Engine cover (animated) ----------
const engineCover = (() => {
  const g = new THREE.BoxGeometry(0.85, 0.04, 1.40);
  const m = new THREE.Mesh(g, mats.paint);
  m.position.set(-1.55, 0.96, 0);
  m.castShadow = true;
  return m;
})();
body.add(engineCover);

// Engine bay detail (revealed when cover opens)
(() => {
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.18, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x222229, metalness: 0.6, roughness: 0.5 })
  );
  block.position.set(-1.55, 0.78, 0);
  body.add(block);
  // Intake plenum
  const plenum = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xc0c4cc, metalness: 1.0, roughness: 0.3 })
  );
  plenum.position.set(-1.55, 0.86, 0);
  body.add(plenum);
})();

// ---------- Swan-neck rear wing ----------
const wing = new THREE.Group();
{
  // Wing element (flat blade with airfoil cross section approximated)
  const wingMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.05, 1.55),
    mats.carbon
  );
  wingMain.castShadow = true;
  wing.add(wingMain);

  // Endplates
  for (const z of [0.78, -0.78]) {
    const ep = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.20, 0.02),
      mats.carbon
    );
    ep.position.set(0, 0, z);
    wing.add(ep);
  }
  // Swan-neck mounts (top mounted, signature GT3 cue)
  for (const z of [0.42, -0.42]) {
    const mount = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.32, 0.06),
      mats.carbon
    );
    mount.position.set(0.02, -0.16, z);
    wing.add(mount);
  }
  wing.position.set(-2.05, 1.15, 0);
}
body.add(wing);

// Ducktail line on body just under wing (small lip)
(() => {
  const g = new THREE.BoxGeometry(0.40, 0.04, 1.50);
  const m = new THREE.Mesh(g, mats.paint);
  m.position.set(-2.18, 0.92, 0);
  body.add(m);
})();

// ---------- Side mirrors ----------
function mirror(z) {
  const grp = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.04, 0.06),
    mats.carbon
  );
  stem.position.set(0, 0, 0);
  grp.add(stem);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12),
    mats.paint
  );
  cap.scale.set(1.0, 0.6, 0.7);
  cap.position.set(0.08, 0.02, 0);
  grp.add(cap);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.10),
    mats.chrome
  );
  glass.rotation.y = Math.PI / 2;
  glass.position.set(0.18, 0.02, 0);
  grp.add(glass);
  grp.position.set(0.85, 1.10, z);
  return grp;
}
body.add(mirror( 0.95));
body.add(mirror(-0.95));

// ---------- Door handles ----------
function handle(z) {
  const g = new THREE.BoxGeometry(0.18, 0.03, 0.04);
  const m = new THREE.Mesh(g, mats.chrome);
  m.position.set(0.05, 0.92, z);
  return m;
}
body.add(handle( 0.96));
body.add(handle(-0.96));

// ---------- Wheels ----------
function buildWheel() {
  const grp = new THREE.Group();
  // Tire — sidewall + tread
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.34, 48, 1, false),
    mats.tireSide
  );
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  grp.add(tire);

  // Tread band (slightly larger radius for the tread surface)
  const tread = new THREE.Mesh(
    new THREE.CylinderGeometry(0.455, 0.455, 0.32, 48, 1, true),
    mats.rubber
  );
  tread.rotation.z = Math.PI / 2;
  grp.add(tread);

  // Brake rotor (drilled look via dark dots — but we just use a flat disc here)
  const rotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.06, 36),
    mats.rotor
  );
  rotor.rotation.z = Math.PI / 2;
  grp.add(rotor);

  // Brake caliper
  const caliper = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.18, 0.10),
    mats.brake
  );
  caliper.position.set(0, 0.22, 0.08);
  grp.add(caliper);
  grp.userData.caliper = caliper;

  // Wheel hub disc
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.40, 0.40, 0.06, 36),
    mats.wheel
  );
  hub.rotation.z = Math.PI / 2;
  hub.position.x = 0.10;
  grp.add(hub);

  // Spokes — twin 5-spoke center-lock pattern
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.72, 0.04),
      mats.wheel
    );
    s.rotation.x = (i / 10) * Math.PI * 2;
    s.position.x = 0.11;
    grp.add(s);
  }
  // Center-lock nut (Porsche signature)
  const lock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: 0xd5001c, metalness: 0.7, roughness: 0.4 })
  );
  lock.rotation.z = Math.PI / 2;
  lock.position.x = 0.14;
  grp.add(lock);

  // Outer rim lip
  const lip = new THREE.Mesh(
    new THREE.TorusGeometry(0.41, 0.025, 12, 36),
    mats.wheel
  );
  lip.position.x = 0.13;
  lip.rotation.y = Math.PI / 2;
  grp.add(lip);

  return grp;
}

const wheels = [];
const wheelPositions = [
  { x:  1.45, z:  0.92 },
  { x:  1.45, z: -0.92 },
  { x: -1.45, z:  0.95 },
  { x: -1.45, z: -0.95 },
];
wheelPositions.forEach((p, i) => {
  const w = buildWheel();
  w.position.set(p.x, 0.45, p.z);
  if (p.z < 0) w.rotation.y = Math.PI; // mirror caliper
  car.add(w);
  wheels.push(w);
});

// ---------- Interior ----------
const interior = new THREE.Group();
{
  // Cabin floor
  const cabinFloor = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.04, 1.5),
    mats.alcantara
  );
  cabinFloor.position.y = 0.55;
  interior.add(cabinFloor);

  // Dashboard
  const dash = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.30, 1.5),
    mats.interior
  );
  dash.position.set(0.5, 0.95, 0);
  interior.add(dash);

  // Steering wheel (left-hand drive)
  const wheelRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.022, 16, 36),
    mats.alcantara
  );
  wheelRim.rotation.y = Math.PI / 2;
  wheelRim.rotation.z = -Math.PI * 0.18;
  wheelRim.position.set(0.20, 1.05, 0.45);
  interior.add(wheelRim);

  // Steering column
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.30, 12),
    mats.darkChrome
  );
  col.rotation.z = Math.PI / 2.5;
  col.position.set(0.32, 1.00, 0.45);
  interior.add(col);

  // Center console
  const centerConsole = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.25, 0.18),
    mats.interior
  );
  centerConsole.position.set(0.0, 0.78, 0);
  interior.add(centerConsole);

  // Seats (bucket-style)
  function seat(z) {
    const grp = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.55),
      mats.alcantara
    );
    base.position.y = 0.65;
    grp.add(base);
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.85, 0.10),
      mats.alcantara
    );
    back.position.set(-0.22, 1.05, 0);
    back.rotation.z = -0.08;
    grp.add(back);
    // Bolsters
    for (const dz of [0.22, -0.22]) {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.85, 0.08),
        mats.alcantara
      );
      b.position.set(-0.18, 1.05, dz);
      b.rotation.z = -0.08;
      grp.add(b);
    }
    // Headrest with cutout look
    const hr = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.16, 0.32),
      mats.alcantara
    );
    hr.position.set(-0.30, 1.45, 0);
    grp.add(hr);
    grp.position.z = z;
    return grp;
  }
  interior.add(seat( 0.42));
  interior.add(seat(-0.42));
}
car.add(interior);

// ---------- Exhaust tips ----------
(() => {
  for (const z of [0.30, -0.30]) {
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16),
      mats.chrome
    );
    tip.rotation.z = Math.PI / 2;
    tip.position.set(-2.40, 0.30, z);
    body.add(tip);
  }
})();

// ---------- License plate ----------
(() => {
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.10, 0.40),
    mats.licensePlate
  );
  plate.position.set(-2.41, 0.45, 0);
  body.add(plate);
  const plateF = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.10, 0.40),
    mats.licensePlate
  );
  plateF.position.set(2.34, 0.45, 0);
  body.add(plateF);
})();

// ---------- Contact shadow ----------
(() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.7)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const sh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.0, 3.0),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.7, depthWrite: false })
  );
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = 0.005;
  scene.add(sh);
})();

// ---------- Camera presets ----------
const camPresets = {
  hero:    { pos: [ 7.2, 2.4,  7.2], target: [0, 0.65, 0] },
  front:   { pos: [ 8.5, 1.6,  0.0], target: [0, 0.7, 0] },
  side:    { pos: [ 0.0, 1.4,  9.0], target: [0, 0.7, 0] },
  rear:    { pos: [-7.5, 2.2, -3.0], target: [-1.0, 0.8, 0] },
  top:     { pos: [ 0.5, 9.0,  0.5], target: [0, 0.5, 0] },
  interior:{ pos: [-0.3, 1.18, 0.95], target: [1.6, 0.95, 0.0] },
  detail:  { pos: [ 1.6, 0.7,  3.2], target: [1.45, 0.45, 0.92] },
};

function flyTo(name) {
  const p = camPresets[name];
  if (!p) return;
  state.cam = name;
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(...p.pos);
  const startTgt = controls.target.clone();
  const endTgt = new THREE.Vector3(...p.target);
  const t0 = performance.now();
  const dur = 900;
  controls.enabled = false;
  function step() {
    const t = Math.min(1, (performance.now() - t0) / dur);
    const k = 1 - Math.pow(1 - t, 3); // easeOutCubic
    camera.position.lerpVectors(startPos, endPos, k);
    controls.target.lerpVectors(startTgt, endTgt, k);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
    else controls.enabled = true;
  }
  step();
}

// ---------- Apply state to model ----------
function applyPaint() {
  // Mutate the shared paint material in place so every paint mesh updates.
  mats.paint.color.setHex(state.paint.hex);
  if (state.paint.finish === 'metallic') {
    mats.paint.metalness = 0.85;
    mats.paint.roughness = 0.18;
    mats.paint.clearcoat = 1.0;
    mats.paint.clearcoatRoughness = 0.06;
  } else if (state.paint.finish === 'matte') {
    mats.paint.metalness = 0.2;
    mats.paint.roughness = 0.6;
    mats.paint.clearcoat = 0.0;
  } else { // gloss
    mats.paint.metalness = 0.5;
    mats.paint.roughness = 0.22;
    mats.paint.clearcoat = 1.0;
    mats.paint.clearcoatRoughness = 0.04;
  }
  mats.paint.needsUpdate = true;
}

function applyWheelFinish() {
  const f = wheelFinishes[state.wheel];
  mats.wheel.color.setHex(f.color);
  mats.wheel.metalness = f.metalness;
  mats.wheel.roughness = f.roughness;
  mats.wheel.needsUpdate = true;
}

function applyCaliper() {
  mats.brake.color.setHex(state.caliper);
  mats.brake.needsUpdate = true;
}

function applyInterior() {
  mats.interior.color.setHex(state.interior);
  mats.interior.needsUpdate = true;
}

function applyHeadlights() {
  for (const hl of [hlL, hlR]) {
    const lens = hl.userData.lens;
    const ring = hl.userData.ring;
    const on = state.headlights;
    lens.material.emissive.setHex(on ? 0xffffff : 0x000000);
    lens.material.emissiveIntensity = on ? 1.6 : 0.0;
    ring.material.emissive.setHex(on ? 0xddeeff : 0x000000);
    ring.material.emissiveIntensity = on ? 1.0 : 0.0;
  }
  // Tail lights amplify slightly when "on"
  mats.taillightLens.emissiveIntensity = state.headlights ? 1.4 : 0.4;
}

// Animate doors and engine cover and wing each frame based on target angles
const anim = {
  doorL: 0, doorR: 0, hood: 0, wing: 1,
  doorLT: 0, doorRT: 0, hoodT: 0, wingT: 1,
};

function applyDoors() {
  anim.doorLT = state.doors ? -1.05 : 0;
  anim.doorRT = state.doors ?  1.05 : 0;
}
function applyHood() {
  anim.hoodT = state.hood ? 0.6 : 0;
}
function applyWing() {
  anim.wingT = state.wing ? 1 : 0;
}

// ---------- Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- UI wiring ----------
const paintColors = [
  { hex: 0xd5001c, name: 'Guards Red', finish: 'metallic' },
  { hex: 0xf3f3f3, name: 'Carrara White', finish: 'metallic' },
  { hex: 0x0c0c10, name: 'Jet Black', finish: 'metallic' },
  { hex: 0x183a5a, name: 'Gentian Blue', finish: 'metallic' },
  { hex: 0xb8b8c4, name: 'GT Silver', finish: 'metallic' },
  { hex: 0x6f7d2a, name: 'Olive Neo', finish: 'matte' },
  { hex: 0xdfa64a, name: 'Signal Yellow', finish: 'metallic' },
  { hex: 0x8b1f3a, name: 'Ruby Star', finish: 'metallic' },
  { hex: 0x35463a, name: 'Oak Green', finish: 'metallic' },
  { hex: 0xff7a00, name: 'Lava Orange', finish: 'metallic' },
  { hex: 0xe6c8b4, name: 'Crayon', finish: 'matte' },
  { hex: 0x303035, name: 'Slate Grey', finish: 'metallic' },
];

function buildPaintSwatches() {
  const grid = document.querySelector('#paintSwatches');
  grid.innerHTML = '';
  paintColors.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'swatch';
    el.style.background = '#' + c.hex.toString(16).padStart(6, '0');
    el.dataset.finish = c.finish;
    el.title = c.name + ' · ' + c.finish;
    if (c.hex === state.paint.hex) el.classList.add('selected');
    el.addEventListener('click', () => {
      state.paint = c;
      applyPaint();
      document.querySelectorAll('#paintSwatches .swatch').forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      document.querySelector('#paintLabel').textContent = c.name + ' (' + c.finish + ')';
    });
    grid.appendChild(el);
  });
  document.querySelector('#paintLabel').textContent = state.paint.name + ' (' + state.paint.finish + ')';
}

function buildWheelOptions() {
  const opts = [
    { id: 'silver', label: 'Silver' },
    { id: 'black',  label: 'Satin Black' },
    { id: 'gold',   label: 'Gold' },
  ];
  const root = document.querySelector('#wheelOpts');
  root.innerHTML = '';
  opts.forEach(o => {
    const d = document.createElement('div');
    d.className = 'opt' + (state.wheel === o.id ? ' selected' : '');
    d.textContent = o.label;
    d.addEventListener('click', () => {
      state.wheel = o.id;
      applyWheelFinish();
      document.querySelectorAll('#wheelOpts .opt').forEach(x => x.classList.remove('selected'));
      d.classList.add('selected');
    });
    root.appendChild(d);
  });
}

function buildCaliperOptions() {
  const opts = [
    { hex: 0xffcc00, label: 'Yellow' },
    { hex: 0xd5001c, label: 'Red' },
    { hex: 0x111111, label: 'Black' },
    { hex: 0xeeeeee, label: 'Silver' },
    { hex: 0x4a90e2, label: 'Blue' },
    { hex: 0x7c3aed, label: 'Violet' },
  ];
  const root = document.querySelector('#caliperOpts');
  root.innerHTML = '';
  opts.forEach(o => {
    const d = document.createElement('div');
    d.className = 'swatch' + (state.caliper === o.hex ? ' selected' : '');
    d.style.background = '#' + o.hex.toString(16).padStart(6, '0');
    d.title = o.label;
    d.addEventListener('click', () => {
      state.caliper = o.hex;
      applyCaliper();
      document.querySelectorAll('#caliperOpts .swatch').forEach(x => x.classList.remove('selected'));
      d.classList.add('selected');
    });
    root.appendChild(d);
  });
}

function buildInteriorOptions() {
  const opts = [
    { hex: 0x1a1a1a, label: 'Black' },
    { hex: 0x6e3b27, label: 'Cognac' },
    { hex: 0x8d1d1d, label: 'Bordeaux' },
    { hex: 0xb6a892, label: 'Cream' },
    { hex: 0x3a4250, label: 'Slate' },
    { hex: 0x2a4a36, label: 'Olive' },
  ];
  const root = document.querySelector('#interiorOpts');
  root.innerHTML = '';
  opts.forEach(o => {
    const d = document.createElement('div');
    d.className = 'swatch' + (state.interior === o.hex ? ' selected' : '');
    d.style.background = '#' + o.hex.toString(16).padStart(6, '0');
    d.title = o.label;
    d.addEventListener('click', () => {
      state.interior = o.hex;
      applyInteriorReplace(o.hex);
      document.querySelectorAll('#interiorOpts .swatch').forEach(x => x.classList.remove('selected'));
      d.classList.add('selected');
    });
    root.appendChild(d);
  });
}

function applyInteriorReplace(hex) {
  mats.interior.color.setHex(hex);
}

function bindToggle(id, key, onChange) {
  const el = document.querySelector('#' + id);
  if (state[key]) el.classList.add('on');
  el.addEventListener('click', () => {
    state[key] = !state[key];
    el.classList.toggle('on', state[key]);
    onChange && onChange();
  });
}

function bindCamButtons() {
  document.querySelectorAll('.dock .cam').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.dock .cam').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      flyTo(b.dataset.cam);
    });
  });
}

function bindTabs() {
  document.querySelectorAll('.panel .tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.panel .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const target = t.dataset.tab;
      document.querySelectorAll('.tab-pane').forEach(p => p.style.display = (p.dataset.tab === target ? 'block' : 'none'));
    });
  });
}

function bindHud() {
  document.querySelector('#hudRotate').addEventListener('click', (e) => {
    state.autoRotate = !state.autoRotate;
    controls.autoRotate = state.autoRotate;
    controls.autoRotateSpeed = 0.8;
    e.currentTarget.classList.toggle('active', state.autoRotate);
  });
  document.querySelector('#hudShot').addEventListener('click', () => {
    renderer.render(scene, camera);
    const data = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = 'porsche-911-gt3.png';
    a.click();
  });
  document.querySelector('#hudReset').addEventListener('click', () => {
    flyTo('hero');
    document.querySelectorAll('.dock .cam').forEach(x => x.classList.remove('active'));
    document.querySelector('.dock .cam[data-cam="hero"]').classList.add('active');
  });
  document.querySelector('#hudEnv').addEventListener('click', cycleEnv);
}

const envOrder = ['studio', 'sunset', 'night'];
function cycleEnv() {
  const idx = envOrder.indexOf(state.env);
  state.env = envOrder[(idx + 1) % envOrder.length];
  applyEnv();
}
function applyEnv() {
  if (state.env === 'studio') {
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog.color = new THREE.Color(0x0a0a0c);
    key.intensity = 2.4; rim.intensity = 1.2; fill.intensity = 0.6;
    key.color.setHex(0xffffff); rim.color.setHex(0xff8866);
    floor.material.color.setHex(0x121216);
    renderer.toneMappingExposure = 1.05;
  } else if (state.env === 'sunset') {
    scene.background = new THREE.Color(0x2c1820);
    scene.fog.color = new THREE.Color(0x2c1820);
    key.intensity = 2.6; rim.intensity = 2.4; fill.intensity = 0.4;
    key.color.setHex(0xffd9aa); rim.color.setHex(0xff5533);
    floor.material.color.setHex(0x1a1014);
    renderer.toneMappingExposure = 1.15;
  } else if (state.env === 'night') {
    scene.background = new THREE.Color(0x05060a);
    scene.fog.color = new THREE.Color(0x05060a);
    key.intensity = 0.8; rim.intensity = 0.5; fill.intensity = 1.4;
    key.color.setHex(0xaabbff); rim.color.setHex(0x3355ff);
    floor.material.color.setHex(0x06070b);
    renderer.toneMappingExposure = 0.85;
  }
  document.querySelector('#hudEnv').textContent = 'Env: ' + state.env;
}

// ---------- Init UI ----------
buildPaintSwatches();
buildWheelOptions();
buildCaliperOptions();
buildInteriorOptions();
bindToggle('togWing', 'wing', applyWing);
bindToggle('togDoors', 'doors', applyDoors);
bindToggle('togHood', 'hood', applyHood);
bindToggle('togLights', 'headlights', applyHeadlights);
bindCamButtons();
bindTabs();
bindHud();
applyHeadlights();
applyEnv();

// ---------- Render loop ----------
const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();

  // Smoothly interpolate animated parts
  const ease = 1 - Math.pow(0.001, dt);
  anim.doorL += (anim.doorLT - anim.doorL) * ease;
  anim.doorR += (anim.doorRT - anim.doorR) * ease;
  anim.hood  += (anim.hoodT  - anim.hood)  * ease;
  anim.wing  += (anim.wingT  - anim.wing)  * ease;

  // Rotate door around hinge x (front of door)
  const hingeX = 0.85;
  doorL.rotation.y = anim.doorL;
  doorL.position.x = -hingeX + Math.cos(anim.doorL) * hingeX;
  doorL.position.y = 0;
  // approximation — gives a believable swing-out
  doorR.rotation.y = -anim.doorR;
  doorR.position.x = -hingeX + Math.cos(anim.doorR) * hingeX;

  engineCover.rotation.z = -anim.hood;
  engineCover.position.x = -1.55 + Math.sin(anim.hood) * 0.35;
  engineCover.position.y = 0.96 + (1 - Math.cos(anim.hood)) * 0.30;

  wing.position.y = 1.05 + anim.wing * 0.10;
  wing.scale.y = 0.001 + anim.wing * 0.999;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Hide loader once first frame is up
requestAnimationFrame(() => {
  setTimeout(() => {
    document.querySelector('.loader')?.classList.add('hidden');
  }, 600);
});
