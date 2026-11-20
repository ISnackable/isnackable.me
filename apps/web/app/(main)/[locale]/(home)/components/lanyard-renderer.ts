// biome-ignore-all lint/suspicious/noBitwiseOperators: Preserve upstream color decoding and seeded texture noise.
// biome-ignore lint/performance/noNamespaceImport: Three.js is isolated from the page's initial client bundle.
import * as THREE from "three";
import {
  type BadgeCanvas,
  type BadgeContext,
  type BadgePortrait,
  type LanyardDictionary,
  paintBadgeFace,
} from "./lanyard-content";

import {
  LANYARD_ENTRANCE_RISE,
  LANYARD_ENTRANCE_TILT,
} from "./lanyard-preview";

export interface LanyardConfiguration {
  avatarUrl?: string;
  dictionary: LanyardDictionary;
  fov: number;
  isDark: boolean;
  reducedMotion: boolean;
}
export interface LanyardSize {
  height: number;
  pixelRatio: number;
  width: number;
}
export interface LanyardPointer {
  button: number;
  clientX: number;
  clientY: number;
  isPrimary: boolean;
  pointerId: number;
  pointerType: string;
  time: number;
  type:
    | "pointerdown"
    | "pointermove"
    | "pointerup"
    | "pointercancel"
    | "pointerleave";
  x: number;
  y: number;
}
export type LanyardEvent =
  | { type: "ready"; revision: number }
  | { type: "cursor"; value: string }
  | { type: "error"; message?: string };
export interface LanyardRenderer {
  configure(
    configuration: LanyardConfiguration,
    size: LanyardSize,
    revision: number
  ): void;
  dispose(): void;
  pointer(event: LanyardPointer): void;
  resize(size: LanyardSize): void;
  reveal(revision: number): void;
  setVisible(visible: boolean): void;
}
export type LanyardCommand =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      configuration: LanyardConfiguration;
      size: LanyardSize;
      revision: number;
    }
  | {
      type: "configure";
      configuration: LanyardConfiguration;
      size: LanyardSize;
      revision: number;
    }
  | { type: "reveal"; revision: number }
  | { type: "pointer"; pointer: LanyardPointer }
  | { type: "visibility"; visible: boolean };

const createCanvas = (): BadgeCanvas =>
  typeof document === "undefined"
    ? new OffscreenCanvas(1, 1)
    : document.createElement("canvas");
const scheduleFrame = (callback: FrameRequestCallback) =>
  typeof requestAnimationFrame === "function"
    ? requestAnimationFrame(callback)
    : (setTimeout(() => callback(performance.now()), 16) as unknown as number);
const cancelFrame = (id: number) =>
  typeof cancelAnimationFrame === "function"
    ? cancelAnimationFrame(id)
    : clearTimeout(id);
const closePortrait = (portrait: BadgePortrait | null) => {
  if (portrait && "close" in portrait) {
    portrait.close();
  }
};
const loadPortrait = async (
  url: string,
  signal: AbortSignal
): Promise<BadgePortrait | null> => {
  try {
    if (typeof document === "undefined") {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        return null;
      }
      return await createImageBitmap(await response.blob());
    }
    return await new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image();
      const finish = (value: HTMLImageElement | null) => {
        image.onload = null;
        image.onerror = null;
        signal.removeEventListener("abort", abort);
        resolve(value);
      };
      const abort = () => finish(null);
      signal.addEventListener("abort", abort, { once: true });
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => finish(image);
      image.onerror = () => finish(null);
      image.src = url;
    });
  } catch {
    return null;
  }
};

type Orientation = "portrait" | "landscape";
type Finish = "glossy" | "matte" | "holographic" | "metallic";
type Metal = "graphite" | "silver" | "gold";
type Anchor = "left" | "center" | "right";
type Rgb = [number, number, number];
interface Point {
  x: number;
  y: number;
}

interface PathLike {
  bezierCurveTo(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ): unknown;
  lineTo(x: number, y: number): unknown;
  moveTo(x: number, y: number): unknown;
}

interface Settings {
  anchor: Anchor;
  avatarUrl?: string;
  breeze: number;
  cardColor: string;
  cornerRadius: number;
  damping: number;
  dictionary: LanyardDictionary;
  elasticity: number;
  finish: Finish;
  fov: number;
  gravity: number;
  interactive: boolean;
  intro: boolean;
  isDark: boolean;
  metal: Metal;
  orientation: Orientation;
  reducedMotion: boolean;
  size: number;
  strapColor: string;
  strapLength: number;
  strapWidth: number;
}

interface CardLayout {
  hangY: number;
  height: number;
  radius: number;
  ringY: number;
  slot: { width: number; height: number; y: number };
  width: number;
}

interface FinishLook {
  anisotropy: number;
  clearcoat: number;
  clearcoatRoughness: number;
  foil: number;
  metalness: number;
  roughness: number;
}

interface Body {
  angular: THREE.Vector3;
  hang: THREE.Vector3;
  inverseInertia: THREE.Vector3;
  mass: number;
  position: THREE.Vector3;
  previous: THREE.Vector3;
  previousQuaternion: THREE.Quaternion;
  quaternion: THREE.Quaternion;
  velocity: THREE.Vector3;
}

interface Simulation {
  anchor: THREE.Vector3;
  body: Body;
  calm: number;
  impulses: Float64Array;
  lengths: Float64Array;
  nodes: THREE.Vector3[];
  previous: THREE.Vector3[];
  rest: number;
  turn: number;
  twist: number;
  twistRaw: number;
  velocities: THREE.Vector3[];
}

interface Physics {
  air: number;
  angularDrag: number;
  bandDamping: number;
  breeze: number;
  broadside: number;
  gravity: number;
  hold: number;
  linearDrag: number;
  nodeAir: number;
  nodeDrag: number;
  spinAir: number;
  spring: number;
  stiffness: number;
  twist: number;
  twistDamping: number;
}

interface Applied {
  avatarUrl?: string;
  dictionary?: LanyardDictionary;
  framingKey?: string;
  isDark?: boolean;
  layoutKey?: string;
  strapColor?: string;
  strapScale?: number;
}

interface Press {
  point: THREE.Vector3;
  pointerId: number;
  time: number;
  x: number;
  y: number;
}

const CARD_SIZES: Record<string, [number, number]> = {
  portrait: [1.611_940_3, 2.25],
  landscape: [2.25, 1.6],
};
const ANCHORS: Record<string, number> = {
  left: 0.27,
  center: 0.5,
  right: 0.73,
};
const THICKNESS = 0.018;
const BEVEL = 0.007;
const JOINTS = 4;
const NODE_WEIGHT = 1 / 0.05;
const MAX_STEP = 1 / 960;
const PHYSICS_STEP = 1 / 120;
const ITERATIONS = 2;
const SAMPLES = 72;
const FOV = 24;
const STRAP_WIDTH = 0.36;
const RING_RADIUS = 0.095;
const RING_TUBE = 0.0135;
const EYELET_RADIUS = 0.036;
const CLAMP_BODY = 0.15;
const MAX_FACE_SIZE = 2048;
const FACE_OVERSAMPLE = 3;

const FINISHES: Record<string, FinishLook> = {
  glossy: {
    roughness: 0.42,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    foil: 0,
    anisotropy: 0,
  },
  matte: {
    roughness: 0.85,
    metalness: 0,
    clearcoat: 0,
    clearcoatRoughness: 0.6,
    foil: 0,
    anisotropy: 0,
  },
  holographic: {
    roughness: 0.3,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    foil: 1,
    anisotropy: 0,
  },
  metallic: {
    roughness: 0.36,
    metalness: 0.75,
    clearcoat: 0.5,
    clearcoatRoughness: 0.18,
    foil: 0,
    anisotropy: 0.7,
  },
};

const BAND_COLUMNS = [0, 0.07, 0.93, 1];
const BAND_BEND = [-0.95, -0.28, 0.28, 0.95];
const FLIP_SPIN = 9;

const METALS: Record<string, { color: string; roughness: number }> = {
  silver: { color: "#d9dce2", roughness: 0.16 },
  gold: { color: "#e4b965", roughness: 0.2 },
  graphite: { color: "#4d4f55", roughness: 0.28 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const COLOR_PARTS = /[\d.]+/g;

const parseColor = (value: string, fallback: Rgb): Rgb => {
  try {
    const ctx = createCanvas().getContext("2d") as BadgeContext | null;
    if (!ctx) {
      return fallback;
    }
    ctx.fillStyle = "#000000";
    ctx.fillStyle = value;
    const resolved = ctx.fillStyle;
    if (resolved.startsWith("#")) {
      const n = Number.parseInt(resolved.slice(1), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    const parts = resolved.match(COLOR_PARTS);
    if (!parts || parts.length < 3) {
      return fallback;
    }
    return [
      Number(parts[0]) / 255,
      Number(parts[1]) / 255,
      Number(parts[2]) / 255,
    ];
  } catch {
    return fallback;
  }
};

const luminance = (rgb: Rgb) =>
  0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
const toCss = (rgb: Rgb, alpha = 1) =>
  `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${alpha})`;

const seeded = (start: number) => {
  let state = start >>> 0;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const traceRoundedRect = (
  path: PathLike,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const k = r * 0.4477;
  path.moveTo(x + r, y);
  path.lineTo(x + width - r, y);
  path.bezierCurveTo(x + width - k, y, x + width, y + k, x + width, y + r);
  path.lineTo(x + width, y + height - r);
  path.bezierCurveTo(
    x + width,
    y + height - k,
    x + width - k,
    y + height,
    x + width - r,
    y + height
  );
  path.lineTo(x + r, y + height);
  path.bezierCurveTo(x + k, y + height, x, y + height - k, x, y + height - r);
  path.lineTo(x, y + r);
  path.bezierCurveTo(x, y + k, x + k, y, x + r, y);
};

const cardLayout = (
  orientation: Orientation,
  cornerRadius: number
): CardLayout => {
  const [width, height] = CARD_SIZES[orientation] || CARD_SIZES.portrait;
  const radius = mix(
    0.03,
    Math.min(width, height) * 0.2,
    clamp(cornerRadius, 0, 1)
  );
  const slot = { width: 0.34, height: 0.07, y: height / 2 - 0.13 };
  const ringY = height / 2 - 0.055;
  return { width, height, radius, slot, ringY, hangY: ringY + RING_RADIUS };
};

const buildCardGeometry = (layout: CardLayout) => {
  const { width, height, radius, slot } = layout;
  const outline = new THREE.Shape();
  traceRoundedRect(
    outline,
    -width / 2 + BEVEL,
    -height / 2 + BEVEL,
    width - BEVEL * 2,
    height - BEVEL * 2,
    Math.max(radius - BEVEL, 0.005)
  );
  const hole = new THREE.Path();
  traceRoundedRect(
    hole,
    -slot.width / 2 - BEVEL,
    slot.y - slot.height / 2 - BEVEL,
    slot.width + BEVEL * 2,
    slot.height + BEVEL * 2,
    slot.height / 2 + BEVEL
  );
  outline.holes.push(hole);
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 24,
  });
  body.translate(0, 0, -THICKNESS / 2);
  const face = new THREE.ShapeGeometry(outline, 24);
  const position = face.getAttribute("position");
  const uv = face.getAttribute("uv");
  for (let i = 0; i < position.count; i++) {
    uv.setXY(
      i,
      (position.getX(i) + width / 2) / width,
      (position.getY(i) + height / 2) / height
    );
  }
  uv.needsUpdate = true;
  return { body, face };
};

const disposeGeometries = (meshes: readonly THREE.Mesh[]) => {
  for (const geometry of new Set(meshes.map((mesh) => mesh.geometry))) {
    geometry.dispose();
  }
};

const buildClampGeometry = (width: number) => {
  const shape = new THREE.Shape();
  const w = width * 1.16;
  traceRoundedRect(
    shape,
    -w / 2 + 0.014,
    -CLAMP_BODY / 2 + 0.014,
    w - 0.028,
    CLAMP_BODY - 0.028,
    0.024
  );
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 6,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -0.01);
  return geometry;
};

const buildBandGeometry = (count: number) => {
  const columns = BAND_COLUMNS.length;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3)
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3)
  );
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(count * columns * 2), 2)
  );
  const index: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    for (let c = 0; c < columns - 1; c++) {
      const a = i * columns + c;
      index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
    }
  }
  geometry.setIndex(index);
  return geometry;
};

const buildEnvironment = (renderer: THREE.WebGLRenderer) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0.035, 0.035, 0.04);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.Material[] = [];
  const panel = (
    intensity: number,
    position: [number, number, number],
    scale: [number, number],
    rotation = 0
  ) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(intensity, intensity, intensity),
      side: THREE.DoubleSide,
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rotation);
    scene.add(mesh);
  };
  panel(2.6, [0, 4.5, 8], [9, 4]);
  panel(6, [-5.5, 0.5, 7], [0.9, 14]);
  panel(4, [5, -0.5, 8], [0.6, 14]);
  panel(3.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
  panel(2.5, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
  panel(1.4, [0, 6, -6], [12, 4]);
  panel(0.5, [0, -7, 1], [16, 6]);
  panel(0.9, [8, 0, -2], [4, 10]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  geometry.dispose();
  for (const material of materials) {
    material.dispose();
  }
  return target;
};

const makeCanvasTexture = (canvas: BadgeCanvas, anisotropy: number) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
};

const buildGrainTexture = () => {
  const size = 128;
  const canvas = createCanvas();
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as BadgeContext | null;
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }
  const random = seeded(7);
  const field = Float32Array.from({ length: size * size }, () => random());
  const height = (x: number, y: number) => {
    let sum = 0;
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        sum += field[((y + j + size) % size) * size + ((x + i + size) % size)];
      }
    }
    return (sum / 9) * 1.6;
  };
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = height((x - 1 + size) % size, y) - height((x + 1) % size, y);
      const ny = height(x, (y - 1 + size) % size) - height(x, (y + 1) % size);
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      image.data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      image.data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      image.data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 7);
  return texture;
};

const buildWeaveTexture = () => {
  const size = 128;
  const threads = 8;
  const random = seeded(19);
  const fiber = Float32Array.from({ length: size * size }, () => random());
  const profile = (f: number) => Math.sqrt(Math.max(0, 1 - 4 * f * f));
  const height = (x: number, y: number) => {
    const px = ((x % size) + size) % size;
    const py = ((y % size) + size) % size;
    const u = (px / size) * threads;
    const v = (py / size) * threads;
    const cu = Math.floor(u);
    const cv = Math.floor(v);
    const fu = u - cu - 0.5;
    const fv = v - cv - 0.5;
    const lift = (cu + cv) % 2 === 0;
    const warp =
      profile(fu) * (0.55 + 0.45 * Math.cos(fv * Math.PI * (lift ? 1 : 0.6)));
    const weft =
      profile(fv) * (0.55 + 0.45 * Math.cos(fu * Math.PI * (lift ? 0.6 : 1)));
    return (
      (lift ? Math.max(warp, weft * 0.7) : Math.max(weft, warp * 0.7)) +
      fiber[py * size + px] * 0.08
    );
  };
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (height(x - 1, y) - height(x + 1, y)) * 1.6;
      const ny = (height(x, y - 1) - height(x, y + 1)) * 1.6;
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};

const paintStrap = (canvas: BadgeCanvas, color: Rgb) => {
  const across = 192;
  const along = across * 2;
  canvas.width = across;
  canvas.height = along;
  const ctx = canvas.getContext("2d") as BadgeContext | null;
  if (!ctx) {
    return along / across;
  }
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, across, along);
  const ink: Rgb = luminance(color) > 0.5 ? [0, 0, 0] : [1, 1, 1];
  ctx.fillStyle = toCss(ink, 0.05);
  for (let y = 0; y < along; y += 4) {
    ctx.fillRect(0, y, across, 1);
  }
  ctx.fillStyle = toCss(ink, 0.2);
  for (let y = 0; y < along; y += 14) {
    ctx.fillRect(across * 0.075, y, 2, 8);
    ctx.fillRect(across * 0.925 - 2, y, 2, 8);
  }
  return along / across;
};

const createSimulation = (): Simulation => {
  const vectors = () =>
    Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
  return {
    nodes: vectors(),
    previous: vectors(),
    velocities: vectors(),
    lengths: new Float64Array(JOINTS),
    impulses: new Float64Array(JOINTS),
    rest: 1,
    anchor: new THREE.Vector3(),
    body: {
      position: new THREE.Vector3(),
      previous: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      previousQuaternion: new THREE.Quaternion(),
      angular: new THREE.Vector3(),
      mass: 1,
      inverseInertia: new THREE.Vector3(1, 1, 1),
      hang: new THREE.Vector3(),
    },
    turn: 0,
    twist: 0,
    twistRaw: 0,
    calm: 0,
  };
};

const scratch = {
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  c: new THREE.Vector3(),
  d: new THREE.Vector3(),
  e: new THREE.Vector3(),
  f: new THREE.Vector3(),
  g: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  r: new THREE.Quaternion(),
};

const applyInverseInertia = (
  body: Body,
  vector: THREE.Vector3,
  out: THREE.Vector3
) => {
  scratch.r.copy(body.quaternion).invert();
  out.copy(vector).applyQuaternion(scratch.r);
  out.set(
    out.x * body.inverseInertia.x,
    out.y * body.inverseInertia.y,
    out.z * body.inverseInertia.z
  );
  return out.applyQuaternion(body.quaternion);
};

const rotateBody = (q: THREE.Quaternion, w: THREE.Vector3) => {
  const { x: qx, y: qy, z: qz, w: qw } = q;
  q.x += 0.5 * (w.x * qw + w.y * qz - w.z * qy);
  q.y += 0.5 * (w.y * qw + w.z * qx - w.x * qz);
  q.z += 0.5 * (w.z * qw + w.x * qy - w.y * qx);
  q.w += 0.5 * (-w.x * qx - w.y * qy - w.z * qz);
  q.normalize();
};

const bodyWeight = (body: Body, r: THREE.Vector3, normal: THREE.Vector3) => {
  const rn = scratch.c.crossVectors(r, normal);
  return 1 / body.mass + rn.dot(applyInverseInertia(body, rn, scratch.d));
};

const pushBody = (body: Body, r: THREE.Vector3, impulse: THREE.Vector3) => {
  body.position.addScaledVector(impulse, 1 / body.mass);
  rotateBody(
    body.quaternion,
    applyInverseInertia(body, scratch.e.crossVectors(r, impulse), scratch.f)
  );
};

const solveSegment = (
  sim: Simulation,
  i: number,
  h: number,
  physics: Physics
) => {
  const { nodes, body } = sim;
  const a = nodes[i];
  const wa = i === 0 ? 0 : NODE_WEIGHT;
  const last = i === JOINTS - 1;
  const r = scratch.g;
  let b = nodes[i + 1];
  if (last) {
    r.copy(body.hang).applyQuaternion(body.quaternion);
    b = scratch.b.copy(body.position).add(r);
  }
  const delta = scratch.a.subVectors(b, a);
  const length = delta.length();
  const stretch = length - sim.rest;
  if (stretch <= 0 || length < 1e-9) {
    return;
  }
  const normal = delta.divideScalar(length);
  const wb = last ? bodyWeight(body, r, normal) : NODE_WEIGHT;
  const rate = (length - sim.lengths[i]) / h;
  const tension =
    physics.hold * Math.tanh((physics.stiffness * stretch) / physics.hold) +
    physics.spring * stretch +
    physics.bandDamping * Math.max(0, rate);
  const room = tension * h * h - sim.impulses[i];
  if (room <= 0) {
    return;
  }
  const lambda = Math.min(stretch / (wa + wb), room);
  sim.impulses[i] += lambda;
  if (wa) {
    a.addScaledVector(normal, lambda * wa);
  }
  if (last) {
    pushBody(body, r, normal.multiplyScalar(-lambda));
  } else {
    b.addScaledVector(normal, -lambda * wb);
  }
};

const placeHanging = (sim: Simulation, layout: CardLayout, intro: boolean) => {
  const { nodes, previous, velocities, body, anchor } = sim;
  nodes[0].copy(anchor);
  for (let i = 1; i <= JOINTS; i++) {
    nodes[i].copy(nodes[i - 1]);
    if (intro) {
      nodes[i].x += sim.rest;
    } else {
      nodes[i].y -= sim.rest;
    }
  }
  body.quaternion.identity();
  if (intro) {
    body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  }
  body.hang.set(0, layout.hangY, 0);
  const offset = scratch.a.copy(body.hang).applyQuaternion(body.quaternion);
  body.position.copy(nodes[JOINTS]).sub(offset);
  body.previous.copy(body.position);
  body.previousQuaternion.copy(body.quaternion);
  body.velocity.set(0, 0, 0);
  body.angular.set(0, 0, 0);
  for (let i = 0; i <= JOINTS; i++) {
    previous[i].copy(nodes[i]);
    velocities[i].set(0, 0, 0);
  }
  sim.lengths.fill(sim.rest);
  sim.turn = 0;
  sim.twist = 0;
  sim.twistRaw = 0;
  sim.calm = 0;
};

const configureSimulation = (
  sim: Simulation,
  layout: CardLayout,
  length: number
) => {
  sim.rest = length / JOINTS;
  const { width, height } = layout;
  const body = sim.body;
  const t = THICKNESS + BEVEL * 2;
  body.mass = 1;
  body.inverseInertia.set(
    12 / (height * height + t * t),
    12 / (width * width + t * t),
    12 / (width * width + height * height)
  );
  body.hang.set(0, layout.hangY, 0);
};

const stepSimulation = (
  sim: Simulation,
  dt: number,
  physics: Physics,
  time: number
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Preserve the upstream physics integration order.
) => {
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP - 1e-6));
  const h = dt / steps;
  const { nodes, previous, velocities, body } = sim;
  const windX =
    physics.breeze *
    (Math.sin(time * 0.53) * 0.7 + Math.sin(time * 1.31 + 1.7) * 0.3) *
    3;
  const windZ = physics.breeze * Math.sin(time * 0.37 + 0.6) * 2;
  const nodeDrag = Math.exp(-physics.nodeDrag * h);
  const linearDrag = Math.exp(-physics.linearDrag * h);
  const angularDrag = Math.exp(-physics.angularDrag * h);

  for (let s = 0; s < steps; s++) {
    for (let i = 1; i < JOINTS; i++) {
      const v = velocities[i];
      v.y -= physics.gravity * h;
      v.x += windX * h;
      v.z += windZ * h;
      previous[i].copy(nodes[i]);
      nodes[i].addScaledVector(v, h);
    }

    body.previous.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    const q = body.quaternion;
    const up = scratch.a.set(0, 1, 0).applyQuaternion(q);
    const front = scratch.b.set(-up.x * up.z, -up.y * up.z, 1 - up.z * up.z);
    if (front.lengthSq() > 1e-3) {
      const facing = scratch.d.set(0, 0, 1).applyQuaternion(q);
      const raw = Math.atan2(
        scratch.e.crossVectors(front, facing).dot(up),
        front.dot(facing)
      );
      let turned = raw - sim.twistRaw;
      if (turned > Math.PI) {
        turned -= Math.PI * 2;
      } else if (turned < -Math.PI) {
        turned += Math.PI * 2;
      }
      sim.twist += turned;
      sim.twistRaw = raw;
    }
    const spin = body.angular.dot(up);
    body.angular.addScaledVector(
      up,
      (physics.twist * (sim.turn - sim.twist) - physics.twistDamping * spin) * h
    );
    body.velocity.y -= physics.gravity * h;
    body.velocity.x += windX * 0.35 * h;
    body.velocity.z += windZ * 0.35 * h;
    body.position.addScaledVector(body.velocity, h);
    rotateBody(body.quaternion, scratch.f.copy(body.angular).multiplyScalar(h));

    sim.impulses.fill(0);
    for (let iteration = 0; iteration < ITERATIONS; iteration++) {
      for (let i = 0; i < JOINTS; i++) {
        solveSegment(sim, i, h, physics);
      }
    }

    for (let i = 1; i < JOINTS; i++) {
      const v = velocities[i]
        .subVectors(nodes[i], previous[i])
        .divideScalar(h)
        .multiplyScalar(nodeDrag);
      v.multiplyScalar(1 / (1 + physics.nodeAir * v.length() * h));
    }
    body.velocity.subVectors(body.position, body.previous).divideScalar(h);
    const dq = scratch.q
      .copy(body.previousQuaternion)
      .invert()
      .premultiply(body.quaternion);
    body.angular
      .set(dq.x, dq.y, dq.z)
      .multiplyScalar((2 / h) * (dq.w < 0 ? -1 : 1));

    const normal = scratch.a.set(0, 0, 1).applyQuaternion(body.quaternion);
    const across = body.velocity.dot(normal);
    const along = scratch.b
      .copy(body.velocity)
      .addScaledVector(normal, -across);
    along.multiplyScalar(1 / (1 + physics.air * along.length() * h));
    body.velocity
      .copy(along)
      .addScaledVector(
        normal,
        across / (1 + physics.broadside * Math.abs(across) * h)
      )
      .multiplyScalar(linearDrag);
    body.angular.multiplyScalar(
      angularDrag / (1 + physics.spinAir * body.angular.length() * h)
    );
    if (body.velocity.lengthSq() > 3600) {
      body.velocity.setLength(60);
    }
    if (body.angular.lengthSq() > 1600) {
      body.angular.setLength(40);
    }

    nodes[JOINTS]
      .copy(body.hang)
      .applyQuaternion(body.quaternion)
      .add(body.position);
    for (let i = 0; i < JOINTS; i++) {
      sim.lengths[i] = nodes[i].distanceTo(nodes[i + 1]);
    }
  }

  let energy = body.velocity.lengthSq() + body.angular.lengthSq() * 0.3;
  for (let i = 1; i < JOINTS; i++) {
    energy += velocities[i].lengthSq() * 0.05;
  }
  sim.calm = energy < 2e-4 ? sim.calm + dt : 0;
};

const makeSettings = (configuration: LanyardConfiguration): Settings => ({
  ...configuration,
  cardColor: configuration.isDark ? "#111312" : "#ffffff",
  orientation: "portrait",
  finish: "glossy",
  cornerRadius: 0.3,
  size: 0.6,
  anchor: "center",
  strapLength: 0.5,
  strapColor: "#111111",
  strapWidth: 0.28,
  metal: "silver",
  gravity: 1,
  damping: 0.5,
  elasticity: 0.5,
  breeze: 0,
  interactive: true,
  intro: false,
});

export function createLanyardRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  configuration: LanyardConfiguration,
  initialSize: LanyardSize,
  emit: (event: LanyardEvent) => void,
  initialRevision = 0
): LanyardRenderer {
  const settingsRef = { current: makeSettings(configuration) };
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x00_00_00, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const scene = new THREE.Scene();
  const environment = buildEnvironment(renderer);
  scene.environment = environment.texture;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 100);
  const keyLight = new THREE.DirectionalLight(0xff_ff_ff, 1.6);
  keyLight.position.set(-2.5, 4, 6);
  const fillLight = new THREE.DirectionalLight(0xff_ff_ff, 0.35);
  fillLight.position.set(3, -1, 4);
  scene.add(keyLight, fillLight);

  let avatar: BadgePortrait | null = null;
  let avatarRequest: AbortController | null = null;
  const frontCanvas = createCanvas();
  const backCanvas = createCanvas();
  const strapCanvas = createCanvas();
  const frontTexture = makeCanvasTexture(frontCanvas, anisotropy);
  const backTexture = makeCanvasTexture(backCanvas, anisotropy);
  const strapTexture = makeCanvasTexture(strapCanvas, anisotropy);
  strapTexture.wrapS = THREE.ClampToEdgeWrapping;
  strapTexture.wrapT = THREE.RepeatWrapping;
  const grain = buildGrainTexture();
  const weave = buildWeaveTexture();
  const frontMaterial = new THREE.MeshPhysicalMaterial({
    normalMap: grain,
    normalScale: new THREE.Vector2(0.06, 0.06),
  });
  const backMaterial = new THREE.MeshPhysicalMaterial({
    normalMap: grain,
    normalScale: new THREE.Vector2(0.06, 0.06),
  });
  // Text and pills keep their authored colors, independent of the lights.
  // The physical surfaces beneath them retain the updated card finish.
  const inkOptions = {
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
  };
  const frontInkMaterial = new THREE.MeshBasicMaterial({
    ...inkOptions,
    map: frontTexture,
  });
  const backInkMaterial = new THREE.MeshBasicMaterial({
    ...inkOptions,
    map: backTexture,
  });
  const edgeMaterial = new THREE.MeshPhysicalMaterial();
  const metalMaterial = new THREE.MeshStandardMaterial({ metalness: 1 });
  const bandMaterial = new THREE.MeshPhysicalMaterial({
    map: strapTexture,
    normalMap: weave,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.68,
    sheen: 1,
    sheenRoughness: 0.42,
    sheenColor: new THREE.Color(0.32, 0.32, 0.34),
    side: THREE.DoubleSide,
  });

  const cardGroup = new THREE.Group();
  const bodyMesh = new THREE.Mesh(undefined, edgeMaterial);
  const frontMesh = new THREE.Mesh(undefined, frontMaterial);
  const backMesh = new THREE.Mesh(undefined, backMaterial);
  const frontInk = new THREE.Mesh(undefined, frontInkMaterial);
  const backInk = new THREE.Mesh(undefined, backInkMaterial);
  frontInk.renderOrder = 1;
  backInk.renderOrder = 1;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 18, 72),
    metalMaterial
  );
  ring.rotation.y = Math.PI / 2 - 0.7;
  cardGroup.add(bodyMesh, frontMesh, backMesh, frontInk, backInk, ring);
  scene.add(cardGroup);

  const bandGeometry = buildBandGeometry(SAMPLES);
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  band.frustumCulled = false;
  scene.add(band);

  const clampGroup = new THREE.Group();
  const initialStrapScale =
    STRAP_WIDTH * clamp(settingsRef.current.strapWidth, 0.2, 2);
  const clampMesh = new THREE.Mesh(
    buildClampGeometry(initialStrapScale),
    metalMaterial
  );
  clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY / 2 - 0.004;
  const eyelet = new THREE.Mesh(
    new THREE.TorusGeometry(EYELET_RADIUS, 0.0105, 14, 40),
    metalMaterial
  );
  clampGroup.add(clampMesh, eyelet);
  scene.add(clampGroup);

  const sim = createSimulation();
  const controls: THREE.Vector3[] = [];
  const mouth = new THREE.Vector3();
  const tuck = new THREE.Vector3();
  const curve = new THREE.CatmullRomCurve3(controls, false, "centripetal");
  const view = { width: 1, height: 1 };
  let layout = cardLayout("portrait", 0.3);
  let applied: Applied = { strapScale: initialStrapScale };
  let ready = false;
  let released = false;
  let revision = initialRevision;
  let preparation = 0;
  let avatarTask: Promise<boolean> = Promise.resolve(true);
  let strapScale = initialStrapScale;
  let tileRatio = 2;
  let raf = 0;
  let last = performance.now();
  let time = 0;
  let accumulatedTime = 0;
  let visible = true;
  let alive = true;
  let placed = false;
  let press: Press | null = null;

  const paintFaces = () => {
    const s = settingsRef.current;
    // Allocate for the badge's actual physical pixels, with 3x headroom for
    // sharp text. A 2K cap applies to the longest side, not just its width.
    const viewHeight = 60 * Math.tan((s.fov * Math.PI) / 360);
    const pixelHeight =
      (view.height * layout.height * renderer.getPixelRatio()) / viewHeight;
    const longestSide = Math.max(
      pixelHeight,
      (pixelHeight * layout.width) / layout.height
    );
    const resolution = clamp(
      2 ** Math.ceil(Math.log2(longestSide * FACE_OVERSAMPLE)),
      512,
      MAX_FACE_SIZE
    );
    const scale = resolution / Math.max(layout.width, layout.height);
    const width = Math.round(layout.width * scale);
    const height = Math.round(layout.height * scale);
    if (frontCanvas.width !== width || frontCanvas.height !== height) {
      frontCanvas.width = width;
      frontCanvas.height = height;
      backCanvas.width = width;
      backCanvas.height = height;
      frontTexture.dispose();
      backTexture.dispose();
    }
    paintBadgeFace(frontCanvas, "front", s.dictionary, s.isDark, avatar);
    paintBadgeFace(backCanvas, "back", s.dictionary, s.isDark, null);
    frontTexture.needsUpdate = true;
    backTexture.needsUpdate = true;
  };

  const loadAvatar = (url?: string) => {
    avatarRequest?.abort();
    closePortrait(avatar);
    avatar = null;
    if (!url) {
      avatarTask = Promise.resolve(true);
      return;
    }
    const request = new AbortController();
    avatarRequest = request;
    avatarTask = loadPortrait(url, request.signal).then((portrait) => {
      if (!alive || request.signal.aborted) {
        closePortrait(portrait);
        return false;
      }
      avatar = portrait;
      paintFaces();
      return Boolean(portrait);
    });
  };

  const repaintStrap = () => {
    const s = settingsRef.current;
    tileRatio = paintStrap(
      strapCanvas,
      parseColor(s.strapColor, [0.07, 0.07, 0.07])
    );
    weave.repeat.set(2, 2 * tileRatio);
    strapTexture.dispose();
    strapTexture.needsUpdate = true;
  };

  const frameView = () => {
    const s = settingsRef.current;
    const aspect = view.width / view.height;
    // Retain the original hero camera, card dimensions, and responsive framing.
    const viewHeight = 60 * Math.tan((s.fov * Math.PI) / 360);
    const viewWidth = viewHeight * aspect;
    camera.fov = s.fov;
    camera.aspect = aspect;
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const anchorX = ((ANCHORS[s.anchor] ?? 0.5) - 0.5) * viewWidth;
    const anchorY = viewHeight / 2 + 0.2;
    const top = view.width < 320 ? 0.047 : 0.36;
    const cardTop = viewHeight / 2 - viewHeight * top;
    const hangTop = cardTop + (layout.hangY - layout.height / 2);
    sim.anchor.set(anchorX, anchorY, 0);
    configureSimulation(sim, layout, anchorY - hangTop);
    sim.nodes[0].copy(sim.anchor);
    sim.previous[0].copy(sim.anchor);
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Keep the upstream scene reconciliation together.
  const apply = () => {
    const s = settingsRef.current;
    const layoutKey = `${s.orientation}|${s.cornerRadius}`;
    if (layoutKey !== applied.layoutKey) {
      layout = cardLayout(s.orientation, s.cornerRadius);
      const geometry = buildCardGeometry(layout);
      disposeGeometries([bodyMesh, frontMesh, backMesh, frontInk, backInk]);
      bodyMesh.geometry = geometry.body;
      frontMesh.geometry = geometry.face;
      backMesh.geometry = geometry.face;
      frontInk.geometry = geometry.face;
      backInk.geometry = geometry.face;
      // Leave enough depth separation for the original, distant hero camera.
      frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.003;
      backMesh.rotation.y = Math.PI;
      backMesh.position.z = -frontMesh.position.z;
      frontInk.position.z = frontMesh.position.z + 0.001;
      backInk.rotation.y = Math.PI;
      backInk.position.z = backMesh.position.z - 0.001;
      ring.position.set(0, layout.ringY, 0);
      applied.framingKey = "";
    }
    const framingKey = `${layoutKey}|${s.size}|${s.anchor}|${s.strapLength}|${view.width}|${view.height}|${s.fov}|${renderer.getPixelRatio()}`;
    if (framingKey !== applied.framingKey) {
      frameView();
      if (!placed) {
        placeHanging(sim, layout, s.intro && !s.reducedMotion);
        placed = true;
      } else if (layoutKey !== applied.layoutKey) {
        placeHanging(sim, layout, false);
      }
    }

    const avatarChanged = s.avatarUrl !== applied.avatarUrl;
    if (avatarChanged) {
      loadAvatar(s.avatarUrl);
    }
    if (
      framingKey !== applied.framingKey ||
      layoutKey !== applied.layoutKey ||
      s.dictionary !== applied.dictionary ||
      s.isDark !== applied.isDark ||
      avatarChanged
    ) {
      paintFaces();
    }
    if (s.strapColor !== applied.strapColor) {
      repaintStrap();
    }

    const finishLook = FINISHES[s.finish] || FINISHES.glossy;
    const card = parseColor(s.cardColor, [1, 1, 1]);
    for (const material of [frontMaterial, backMaterial]) {
      material.roughness = finishLook.roughness;
      material.metalness = finishLook.metalness;
      material.clearcoat = finishLook.clearcoat;
      material.clearcoatRoughness = finishLook.clearcoatRoughness;
      material.anisotropy = finishLook.anisotropy;
    }
    frontMaterial.color.set(s.cardColor);
    backMaterial.color.set(s.cardColor === "#111312" ? "#1a1c1b" : "#f9f9f9");
    edgeMaterial.color.setRGB(
      card[0] * 0.92,
      card[1] * 0.92,
      card[2] * 0.92,
      THREE.SRGBColorSpace
    );
    edgeMaterial.roughness = Math.min(finishLook.roughness, 0.35);
    edgeMaterial.metalness = finishLook.metalness;
    edgeMaterial.clearcoat = 1;
    edgeMaterial.clearcoatRoughness = 0.08;
    const metalLook = METALS[s.metal] || METALS.silver;
    metalMaterial.color.set(metalLook.color);
    metalMaterial.roughness = metalLook.roughness;
    strapScale = STRAP_WIDTH * clamp(s.strapWidth, 0.2, 2);
    if (strapScale !== applied.strapScale) {
      clampMesh.geometry.dispose();
      clampMesh.geometry = buildClampGeometry(strapScale);
    }
    currentPhysics = physics();
    applied = {
      layoutKey,
      framingKey,
      avatarUrl: s.avatarUrl,
      strapColor: s.strapColor,
      strapScale,
      dictionary: s.dictionary,
      isDark: s.isDark,
    };
  };

  const points = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
  const sides = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
  const bends = BAND_BEND.map((angle): [number, number] => [
    Math.cos(angle),
    Math.sin(angle),
  ]);
  const work = {
    tangent: new THREE.Vector3(),
    toCamera: new THREE.Vector3(),
    basis: new THREE.Matrix4(),
    up: new THREE.Vector3(),
    across: new THREE.Vector3(),
    facing: new THREE.Vector3(),
    end: new THREE.Vector3(),
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Preserve the upstream strap geometry update.
  const updateBand = () => {
    const hang = sim.nodes[JOINTS];
    const reach = EYELET_RADIUS + CLAMP_BODY + 0.05;
    let guide = JOINTS - 1;
    while (guide > 0 && sim.nodes[guide].distanceTo(hang) < reach * 1.1) {
      guide--;
    }
    const axis = work.up.subVectors(sim.nodes[guide], hang);
    if (axis.lengthSq() < 1e-8) {
      axis.set(0, 1, 0).applyQuaternion(sim.body.quaternion);
    }
    axis.normalize();
    mouth.copy(hang).addScaledVector(axis, reach);
    tuck.copy(hang).addScaledVector(axis, EYELET_RADIUS + CLAMP_BODY * 0.35);
    controls.length = 0;
    for (let i = 0; i <= guide; i++) {
      controls.push(sim.nodes[i]);
    }
    controls.push(mouth, tuck);
    curve.updateArcLengths();
    for (let i = 0; i < SAMPLES; i++) {
      curve.getPointAt(i / (SAMPLES - 1), points[i]);
    }
    const length = curve.getLength();
    const held = 1 - mouth.distanceTo(tuck) / Math.max(length, 0.001);
    const position = bandGeometry.getAttribute("position");
    const normal = bandGeometry.getAttribute("normal");
    const uv = bandGeometry.getAttribute("uv");
    const columns = BAND_COLUMNS.length;
    const restLength = sim.rest * JOINTS;
    const repeats = restLength / (strapScale * tileRatio);
    const width =
      strapScale / Math.max(1, length / Math.max(restLength, 0.001)) ** 0.35;
    const { tangent, toCamera, across, facing } = work;
    for (let i = 0; i < SAMPLES; i++) {
      tangent.subVectors(
        points[Math.min(SAMPLES - 1, i + 1)],
        points[Math.max(0, i - 1)]
      );
      if (tangent.lengthSq() < 1e-12) {
        tangent.set(0, -1, 0);
      }
      tangent.normalize();
      toCamera.subVectors(camera.position, points[i]).normalize();
      const side = sides[i].crossVectors(toCamera, tangent);
      if (side.lengthSq() < 1e-10) {
        side.copy(i > 0 ? sides[i - 1] : scratch.a.set(1, 0, 0));
      }
      side.normalize();
      if (i > 0 && side.dot(sides[i - 1]) < 0) {
        side.negate();
      }
      const angle = -sim.twist * Math.min(1, i / (SAMPLES - 1) / held) ** 1.3;
      facing.crossVectors(tangent, side);
      across
        .copy(side)
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(facing, Math.sin(angle));
      facing.crossVectors(tangent, across);
      const p = points[i];
      const v = (1 - i / (SAMPLES - 1)) * repeats;
      for (let c = 0; c < columns; c++) {
        const k = i * columns + c;
        const offset = (BAND_COLUMNS[c] - 0.5) * width;
        const [bendCos, bendSin] = bends[c];
        position.setXYZ(
          k,
          p.x + across.x * offset,
          p.y + across.y * offset,
          p.z + across.z * offset
        );
        normal.setXYZ(
          k,
          facing.x * bendCos + across.x * bendSin,
          facing.y * bendCos + across.y * bendSin,
          facing.z * bendCos + across.z * bendSin
        );
        uv.setXY(k, BAND_COLUMNS[c], v);
      }
    }
    work.end.copy(across);
    position.needsUpdate = true;
    normal.needsUpdate = true;
    uv.needsUpdate = true;

    across
      .copy(work.end)
      .addScaledVector(axis, -work.end.dot(axis))
      .normalize();
    facing.crossVectors(across, axis).normalize();
    work.basis.makeBasis(across, axis, facing);
    clampGroup.quaternion.setFromRotationMatrix(work.basis);
    clampGroup.position.copy(hang);
  };

  const render = () => {
    cardGroup.position.copy(sim.body.position);
    cardGroup.quaternion.copy(sim.body.quaternion);
    updateBand();
    renderer.render(scene, camera);
  };

  const physics = (): Physics => {
    const s = settingsRef.current;
    const gravityForce = 40 * clamp(s.gravity, 0, 3);
    const weight = Math.max(gravityForce, 20);
    const springy = clamp(s.elasticity, 0, 1);
    const settle = clamp(s.damping, 0, 1);
    return {
      gravity: gravityForce,
      hold: weight * mix(2.2, 5.5, springy),
      stiffness: weight * 10 * JOINTS,
      spring: weight * mix(0.1, 0.4, springy) * JOINTS,
      bandDamping: weight * mix(0.3, 0.08, springy) * JOINTS,
      linearDrag: 0.25 * 16 ** settle,
      angularDrag: 0.5 * 12 ** settle,
      air: 0.15,
      broadside: 0.5,
      spinAir: 0.03,
      nodeDrag: 2,
      nodeAir: 0.2,
      twist: 30,
      twistDamping: 3,
      breeze: s.reducedMotion ? 0 : clamp(s.breeze, 0, 1),
    };
  };

  let currentPhysics = physics();

  const tick = (now: number) => {
    raf = 0;
    if (!alive) {
      return;
    }
    const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
    last = now;
    accumulatedTime += dt;
    const current = currentPhysics;
    // Fixed physics steps keep numerical resting energy independent of frame
    // jitter, so a settled badge can actually sleep on variable-refresh phones.
    const steps = Math.floor((accumulatedTime + 1e-9) / PHYSICS_STEP);
    for (let step = 0; step < steps; step++) {
      time += PHYSICS_STEP;
      stepSimulation(sim, PHYSICS_STEP, current, time);
    }
    accumulatedTime = Math.max(0, accumulatedTime - steps * PHYSICS_STEP);
    const body = sim.body;
    if (
      !Number.isFinite(
        body.position.x + body.position.y + body.position.z + body.quaternion.w
      )
    ) {
      placeHanging(sim, layout, false);
    }
    render();
    const resting = sim.calm > 1.2 && current.breeze === 0;
    if (visible && !resting) {
      raf = scheduleFrame(tick);
    }
  };

  const start = () => {
    if (raf || !visible || !alive || !ready || !released) {
      return;
    }
    sim.calm = 0;
    accumulatedTime = 0;
    last = performance.now();
    raf = scheduleFrame(tick);
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const toPointer = (event: Point) => {
    pointer.set(event.x, event.y);
    raycaster.setFromCamera(pointer, camera);
  };

  const pickCard = () => {
    cardGroup.updateMatrixWorld();
    const hits = raycaster.intersectObjects(
      [bodyMesh, frontMesh, backMesh],
      false
    );
    return hits[0] || null;
  };

  let cursor = "";
  const setCursor = (value: string) => {
    if (cursor !== value) {
      cursor = value;
      emit({ type: "cursor", value });
    }
  };

  const flip = (point: THREE.Vector3) => {
    const body = sim.body;
    const up = scratch.a.set(0, 1, 0).applyQuaternion(body.quaternion);
    let direction = sim.turn > 0 ? -1 : 1;
    if (sim.turn === 0) {
      const away = scratch.c.subVectors(point, camera.position).normalize();
      direction =
        scratch.b.subVectors(point, body.position).cross(away).dot(up) < 0
          ? -1
          : 1;
    }
    sim.turn = sim.turn === 0 ? Math.PI * direction : 0;
    body.angular.addScaledVector(up, FLIP_SPIN * direction);
  };

  const onPointerDown = (event: LanyardPointer) => {
    // A second finger belongs to a browser gesture, not a pending card tap.
    if (!event.isPrimary) {
      press = null;
      return;
    }
    if (!settingsRef.current.interactive || event.button > 0) {
      return;
    }
    toPointer(event);
    const hit = pickCard();
    if (!hit) {
      return;
    }
    press = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: event.time,
      point: hit.point.clone(),
    };
  };

  const onPointerMove = (event: LanyardPointer) => {
    if (!settingsRef.current.interactive) {
      return;
    }
    if (
      press &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6
    ) {
      press = null;
    }
    if (event.pointerType === "touch") {
      return;
    }
    toPointer(event);
    setCursor(pickCard() ? "pointer" : "");
  };

  const onPointerUp = (event: LanyardPointer) => {
    const currentPress = press;
    press = null;
    if (!currentPress || currentPress.pointerId !== event.pointerId) {
      return;
    }
    if (
      !settingsRef.current.interactive ||
      event.time - currentPress.time >= 450
    ) {
      return;
    }
    if (
      Math.hypot(
        event.clientX - currentPress.x,
        event.clientY - currentPress.y
      ) > 6
    ) {
      return;
    }
    toPointer(event);
    if (!pickCard()) {
      return;
    }
    flip(currentPress.point);
    start();
  };

  const cancelPress = () => {
    press = null;
    setCursor("");
  };

  const resize = (size: LanyardSize) => {
    if (!alive) {
      return;
    }
    view.width = Math.max(1, size.width);
    view.height = Math.max(1, size.height);
    const ratio = Math.min(size.pixelRatio, 2);
    // Set the dimensions and density together: setPixelRatio() also resizes,
    // which otherwise allocates and clears the GPU buffer twice on startup.
    if (
      canvas.width !== Math.floor(view.width * ratio) ||
      canvas.height !== Math.floor(view.height * ratio)
    ) {
      renderer.setDrawingBufferSize(view.width, view.height, ratio);
    }
    apply();
    if (ready) {
      render();
    }
  };
  const placeStartup = () => {
    placeHanging(sim, layout, false);
    // Resolve the small strap extension before capture, so reduced-motion and
    // static previews use the same final framing as the settled live badge.
    for (let step = 0; step < 180; step++) {
      stepSimulation(sim, 1 / 120, currentPhysics, 0);
    }
    if (!settingsRef.current.reducedMotion) {
      sim.body.position.y += layout.height * LANYARD_ENTRANCE_RISE;
      sim.body.quaternion.setFromAxisAngle(
        scratch.c.set(0, 0, 1),
        LANYARD_ENTRANCE_TILT
      );
      const hang = scratch.a
        .copy(sim.body.hang)
        .applyQuaternion(sim.body.quaternion)
        .add(sim.body.position);
      for (let i = 1; i <= JOINTS; i++) {
        sim.nodes[i].lerpVectors(sim.anchor, hang, i / JOINTS);
      }
    }
    sim.body.previous.copy(sim.body.position);
    sim.body.previousQuaternion.copy(sim.body.quaternion);
    sim.body.velocity.set(0, 0, 0);
    sim.body.angular.set(0, 0, 0);
    for (let i = 0; i <= JOINTS; i++) {
      sim.previous[i].copy(sim.nodes[i]);
      sim.velocities[i].set(0, 0, 0);
    }
    sim.calm = 0;
  };

  const prepare = async () => {
    const current = ++preparation;
    const portraitLoaded = await avatarTask;
    if (!alive || current !== preparation) {
      return;
    }
    if (!portraitLoaded) {
      throw new Error("The badge portrait could not be loaded");
    }
    // Never reveal a half-painted badge, including when a theme/configuration
    // update arrives during asynchronous material compilation.
    await renderer.compileAsync(scene, camera);
    if (!alive || current !== preparation) {
      return;
    }
    if (!released) {
      placeStartup();
    }
    ready = true;
    render();
    emit({ type: "ready", revision });
    if (released && !settingsRef.current.reducedMotion) {
      start();
    }
  };
  const prepareFrame = () => {
    const pending = prepare();
    const current = preparation;
    pending.catch((error: unknown) => {
      if (alive && current === preparation) {
        emit({ type: "error", message: String(error) });
      }
    });
  };
  canvas.addEventListener("webglcontextlost", () => {
    if (alive) {
      emit({ type: "error", message: "The badge graphics context was lost" });
    }
  });
  resize(initialSize);
  prepareFrame();

  return {
    configure(next, size, nextRevision) {
      revision = nextRevision;
      settingsRef.current = makeSettings(next);
      resize(size);
      prepareFrame();
    },
    reveal(nextRevision) {
      if (!ready || revision !== nextRevision || released) {
        return;
      }
      released = true;
      if (!settingsRef.current.reducedMotion) {
        start();
      }
    },
    resize,
    pointer(event) {
      switch (event.type) {
        case "pointerdown":
          onPointerDown(event);
          break;
        case "pointermove":
          onPointerMove(event);
          break;
        case "pointerup":
          onPointerUp(event);
          break;
        default:
          cancelPress();
      }
    },
    setVisible(next) {
      visible = next;
      if (visible) {
        start();
      } else {
        cancelFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      alive = false;
      avatarRequest?.abort();
      closePortrait(avatar);
      cancelFrame(raf);
      disposeGeometries([
        bodyMesh,
        frontMesh,
        backMesh,
        frontInk,
        backInk,
        ring,
        clampMesh,
        eyelet,
        band,
      ]);
      for (const material of [
        frontMaterial,
        backMaterial,
        frontInkMaterial,
        backInkMaterial,
        edgeMaterial,
        metalMaterial,
        bandMaterial,
      ]) {
        material.dispose();
      }
      for (const texture of [
        frontTexture,
        backTexture,
        strapTexture,
        grain,
        weave,
      ]) {
        texture.dispose();
      }
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
