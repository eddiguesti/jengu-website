/**
 * Jengu character scene: renderer, studio lighting, glow sprites, and the
 * animator that gives it a personality (tracking, blinks, boredom, sleep,
 * drag-to-spin with dizziness, tap reactions, double-tap fold morph, and
 * the scroll-driven hologram presentation).
 */
import * as THREE from 'three';
import { makeMaterials, makeStudioEnvironment, makeGlowSprite } from './materials';
import { buildCharacter } from './model';
import { Face } from './face';
import { Hologram } from './hologram';
import { Particles } from './particles';
import { Chores } from './chores';
import { Bubbles } from './bubbles';
import { Game } from './game';
import { Animator } from './animator';

export interface RobotHandle {
  destroy: () => void;
  setPaused: (paused: boolean) => void;
}

function makeLights(scene: THREE.Scene): void {
  const key = new THREE.DirectionalLight(0xfff3e6, 1.4);
  key.position.set(4, 7, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4.5;
  key.shadow.bias = -0.0006;
  key.shadow.radius = 5;
  const fill = new THREE.PointLight(0xbfd0ff, 2.5, 24, 1.8);
  fill.position.set(-5, -1, 5);
  const rimViolet = new THREE.PointLight(0x9a6bff, 11, 24, 1.6);
  rimViolet.position.set(4.5, 3, -4);
  const rimCyan = new THREE.PointLight(0x5ad8ff, 9, 24, 1.6);
  rimCyan.position.set(-5, 2.5, -3);
  const under = new THREE.PointLight(0x5ad8ff, 2.5, 7, 2);
  under.position.set(0, -3.0, 1.2);
  scene.add(key, fill, rimViolet, rimCyan, under);
}

export function mountRobot(canvas: HTMLCanvasElement, host: HTMLElement): RobotHandle {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hero = host.closest<HTMLElement>('.v2-hero');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, finePointer ? 1.75 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = finePointer;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = makeStudioEnvironment(renderer);
  makeLights(scene);

  const CAM_Z = 20;
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 80);
  camera.position.set(0, -0.3, CAM_Z);
  camera.lookAt(0, -0.6, 0);

  const glow = makeGlowSprite();
  const materials = makeMaterials();
  const face = new Face();
  const rig = buildCharacter(materials, face, glow);
  const hologram = new Hologram();
  const particles = new Particles(glow, finePointer ? 170 : 90);
  const chores = new Chores();
  const bubbles = new Bubbles();
  const game = new Game();
  scene.add(rig.root, rig.platform, hologram.mesh, particles.points, chores.group, bubbles.group, game.group);

  // Visible half-width at the character plane (fov, camera distance) and his home column.
  const halfHeight = (): number => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
  const halfWidth = (): number => halfHeight() * camera.aspect;
  const homeX = (): number => (camera.aspect > 1.25 ? halfWidth() * 0.52 : 0);
  const hitTest = (clientX: number, clientY: number): boolean => {
    const r = host.getBoundingClientRect();
    const centre = new THREE.Vector3(rig.root.position.x, rig.root.position.y - 1.0, 0).project(camera);
    const edge = new THREE.Vector3(rig.root.position.x + 1.9, rig.root.position.y - 1.0, 0).project(camera);
    const sx = r.left + ((centre.x + 1) / 2) * r.width;
    const sy = r.top + ((1 - centre.y) / 2) * r.height;
    const radius = Math.abs(((edge.x - centre.x) / 2) * r.width);
    const dx = clientX - sx;
    const dy = (clientY - sy) * 0.8;
    return dx * dx + dy * dy < radius * radius;
  };
  const animator = new Animator(rig, face, hologram, particles, chores, bubbles, game, { reduceMotion, finePointer, hitTest, halfWidth, halfHeight, homeX });
  animator.attach(canvas, host);

  const resize = (): void => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait: wider view and the character framed in the lower half, under the copy.
    const portrait = w < h;
    camera.fov = portrait ? 17 : 22;
    camera.position.y = -0.3;
    camera.lookAt(0, -0.6, 0);
    camera.updateProjectionMatrix();
    hologram.setHome(homeX());
    animator.rehome();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let paused = false;
  let raf = 0;
  const clock = new THREE.Clock();

  const frame = (): void => {
    raf = requestAnimationFrame(frame);
    if (paused) return;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.getElapsedTime();
    let scroll = 0;
    // The hero is not pinned on phones, so the hologram presentation is desktop-only.
    if (hero && camera.aspect > 1) {
      const rect = hero.getBoundingClientRect();
      scroll = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
    }
    animator.update(t, dt, scroll);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    setPaused: (p: boolean) => {
      paused = p;
      if (!p) clock.getDelta();
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      animator.detach();
      renderer.dispose();
    },
  };
}
