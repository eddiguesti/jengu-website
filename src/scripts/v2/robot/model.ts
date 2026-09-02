/**
 * Builds the Jengu character and returns the rig handles the animator drives.
 * Proportions follow the brand render: big helmet head, curved glass visor
 * with an inset rim, ear pods, antenna, pear torso with a glowing badge,
 * jointed arms with mitten hands, stubby legs on boots, lit platform.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sphericalPanel, smoothLathe, profileCurve, vestGeometry } from './geometry';
import type { RobotMaterials } from './materials';
import type { Face } from './face';

export interface Arm {
  shoulder: THREE.Group;
  forearm: THREE.Group;
  hand: THREE.Mesh;
  side: number;
}

export interface Rig {
  root: THREE.Group;
  head: THREE.Group;
  antenna: THREE.Group;
  neck: THREE.Mesh;
  torso: THREE.Group;
  armL: Arm;
  armR: Arm;
  legs: THREE.Group;
  platform: THREE.Group;
  platformRing: THREE.Mesh;
  shadow: THREE.Mesh;
  badgeGlow: THREE.Sprite;
  basket: THREE.Group;
}

const HEAD_R = 1;
const HEAD_SCALE = new THREE.Vector3(1.09, 0.9, 0.95);
const TORSO_Y = -1.72;

function shadowed(mesh: THREE.Mesh): THREE.Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  return mesh;
}

function buildHead(m: RobotMaterials, face: Face): { head: THREE.Group; antenna: THREE.Group } {
  const head = new THREE.Group();
  // Football helmet: wider than tall, slightly shallow front-to-back.
  const shell = new THREE.Group();
  shell.scale.copy(HEAD_SCALE);
  head.add(shell);

  const helmet = shadowed(new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 96, 64), m.shell));
  shell.add(helmet);

  // Visor: squarer rounded-rect patch with a thick lighter rim, glass over the face screen.
  const rim = new THREE.Mesh(sphericalPanel(HEAD_R + 0.014, 0.98, 0.76, 0.42), m.shellShade);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: face.texture,
    emissiveIntensity: 1.35,
    roughness: 1,
  });
  const screen = new THREE.Mesh(sphericalPanel(HEAD_R + 0.02, 0.88, 0.66, 0.42), screenMat);
  const glass = new THREE.Mesh(sphericalPanel(HEAD_R + 0.034, 0.89, 0.67, 0.42), m.glass);
  glass.renderOrder = 2;
  shell.add(rim, screen, glass);

  // Back cap on the ellipsoid.
  const backCap = shadowed(new THREE.Mesh(sphericalPanel(HEAD_R + 0.012, 0.5, 0.42, 0.6), m.shellShade));
  backCap.rotation.y = Math.PI;
  const backLed = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), m.emissive);
  backLed.position.set(0, 0.12, -(HEAD_R + 0.03));
  backLed.rotation.y = Math.PI;
  shell.add(backCap, backLed);

  // Ear pods sit on the wide axis of the ellipsoid.
  const earX = HEAD_R * HEAD_SCALE.x;
  [-1, 1].forEach((side) => {
    const pod = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 48), m.shell));
    pod.rotation.z = Math.PI / 2;
    pod.position.set(side * (earX + 0.02), -0.06, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 12, 48), m.emissive);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * (earX + 0.09), -0.06, 0);
    head.add(pod, ring);
  });

  const antenna = new THREE.Group();
  antenna.position.set(0, HEAD_R * HEAD_SCALE.y - 0.02, 0);
  const stem = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 24), m.shell));
  stem.position.y = 0.13;
  const ball = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 24), m.shell));
  ball.position.y = 0.33;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), m.emissive);
  tip.position.set(0, 0.41, 0.04);
  antenna.add(stem, ball, tip);
  head.add(antenna);

  return { head, antenna };
}


/** Name-pin face: "Jengu" lettered on navy enamel, like a hotel staff badge. */
function pinTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 192;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(c);
  ctx.fillStyle = '#0d1024';
  ctx.fillRect(0, 0, W, H);
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, 'rgba(255,255,255,0.10)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f4f3ef';
  ctx.font = '600 118px "Bricolage Grotesque", "Geist", -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Jengu', W / 2 + 6, H / 2 + 6);
  ctx.fillStyle = '#7fe3ff';
  ctx.beginPath();
  ctx.arc(52, H / 2, 11, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function buildTorso(m: RobotMaterials, glow: THREE.Texture): { torso: THREE.Group; badgeGlow: THREE.Sprite } {
  const torso = new THREE.Group();
  torso.position.y = TORSO_Y;
  const rel = (y: number): number => y - TORSO_Y;
  const profile: [number, number][] = [
    [0, rel(-2.47)],
    [0.32, rel(-2.45)],
    [0.68, rel(-2.3)],
    [0.86, rel(-2.0)],
    [0.88, rel(-1.6)],
    [0.74, rel(-1.2)],
    [0.45, rel(-1.0)],
    [0, rel(-0.98)],
  ];
  const body = shadowed(new THREE.Mesh(smoothLathe(profile, 96, 64), m.shell));
  torso.add(body);

  // Hotel waistcoat: navy fabric with a V-neck, gold piping, buttons and a bow tie
  const fabric = new THREE.MeshPhysicalMaterial({
    color: 0x131a33,
    roughness: 0.62,
    metalness: 0,
    sheen: 1,
    sheenColor: new THREE.Color(0x5f6fc4),
    sheenRoughness: 0.55,
    side: THREE.DoubleSide,
    envMapIntensity: 0.5,
  });
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd2ae62, metalness: 0.85, roughness: 0.32, clearcoat: 0.6, envMapIntensity: 1.2 });
  const curve = profileCurve(profile);
  const vest = vestGeometry(curve, rel(-1.06), rel(-2.3), 0.62, 0.95, 0.024);
  const vestMesh = shadowed(new THREE.Mesh(vest.geometry, fabric));
  torso.add(vestMesh);
  const piping = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(vest.neckline), 64, 0.022, 10, false), gold);
  torso.add(piping);
  const hemPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 96; i++) {
    const th = (i / 96) * Math.PI * 2;
    const rr = 0.024 + 0.012 + (curve.getPoints(240).reduce((acc, p) => (Math.abs(p.y - rel(-2.3)) < Math.abs(acc.y - rel(-2.3)) ? p : acc)).x);
    hemPts.push(new THREE.Vector3(rr * Math.sin(th), rel(-2.3), rr * Math.cos(th)));
  }
  const hem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hemPts, true), 96, 0.016, 8, true), gold);
  torso.add(hem);
  [-1.86, -2.02, -2.18].forEach((y) => {
    const r = 0.024 + 0.02 + curve.getPoints(240).reduce((acc, p) => (Math.abs(p.y - rel(y)) < Math.abs(acc.y - rel(y)) ? p : acc)).x;
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 12), gold);
    button.position.set(0, rel(y), r);
    torso.add(button);
  });
  const tieMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0f1c, roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0x4a5aa8) });
  const tie = new THREE.Group();
  [-1, 1].forEach((side) => {
    const wing = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), tieMat));
    wing.scale.set(1, 0.62, 0.42);
    wing.position.set(side * 0.16, 0, 0);
    tie.add(wing);
  });
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), tieMat);
  knot.position.z = 0.03;
  tie.add(knot);
  tie.position.set(0, rel(-1.12), 0.56);
  tie.rotation.x = -0.35;
  torso.add(tie);

  // Hotel-style name pin: gold plate with "Jengu" on navy enamel.
  const pin = new THREE.Group();
  const plate = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.17, 0.03, 3, 0.03), gold);
  const face = pinTexture();
  const enamel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.13),
    new THREE.MeshPhysicalMaterial({ map: face, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, emissive: 0xffffff, emissiveMap: face, emissiveIntensity: 0.3 })
  );
  enamel.position.z = 0.017;
  pin.add(plate, enamel);
  pin.position.set(0.44, rel(-1.6), 0.82);
  pin.rotation.set(-0.12, 0.52, 0);
  torso.add(pin);


  const badgeGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glow, color: 0x5ad8ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  badgeGlow.position.set(0.5, rel(-1.62), 0.88);
  badgeGlow.scale.set(0.35, 0.35, 1);
  torso.add(badgeGlow);
  return { torso, badgeGlow };
}

function buildArm(m: RobotMaterials, side: number): Arm {
  const shoulder = new THREE.Group();
  shoulder.position.set(side * 0.7, -1.26, 0.04);
  const cap = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 24), m.joint));
  const cuff = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.16, 32), m.joint));
  cuff.position.y = -0.2;
  const upper = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.24, 8, 24), m.shell));
  upper.position.y = -0.24;
  const elbow = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), m.joint));
  elbow.position.y = -0.48;
  const forearm = new THREE.Group();
  forearm.position.y = -0.48;
  const lower = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.2, 8, 24), m.shell));
  lower.position.y = -0.2;
  const wrist = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), m.joint));
  wrist.position.y = -0.38;
  const hand = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.3, 0.24, 4, 0.1), m.shell));
  hand.position.y = -0.54;
  const thumb = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), m.shell));
  thumb.position.set(-side * 0.12, -0.5, 0.1);
  forearm.add(lower, wrist, hand, thumb);
  shoulder.add(cap, cuff, upper, elbow, forearm);
  shoulder.rotation.z = side * 0.5;
  forearm.rotation.x = -0.4;
  return { shoulder, forearm, hand, side };
}

function buildLegs(m: RobotMaterials): THREE.Group {
  const legs = new THREE.Group();
  [-1, 1].forEach((side) => {
    const hip = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.3, 32), m.joint));
    hip.position.set(side * 0.34, -2.4, 0.02);
    const leg = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.1, 8, 24), m.shell));
    leg.position.set(side * 0.34, -2.62, 0.02);
    const boot = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.28, 0.64, 4, 0.13), m.shellShade));
    boot.position.set(side * 0.37, -2.84, 0.12);
    const sole = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.08, 0.66, 3, 0.03), m.joint));
    sole.position.set(side * 0.37, -2.96, 0.12);
    legs.add(hip, leg, boot, sole);
  });
  return legs;
}

function buildPlatform(m: RobotMaterials, glow: THREE.Texture): { platform: THREE.Group; ring: THREE.Mesh; shadow: THREE.Mesh } {
  const platform = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.62, 0.16, 96), m.platform);
  disc.position.y = -3.08;
  disc.receiveShadow = true;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.03, 12, 128), m.emissive);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.995;
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 48),
    new THREE.MeshBasicMaterial({ map: glow, color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.992;
  const underGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glow, color: 0x5ad8ff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  underGlow.position.y = -3.01;
  underGlow.scale.set(4.4, 1.5, 1);
  platform.add(disc, ring, shadow, underGlow);
  return { platform, ring, shadow };
}

/** Little tray he holds between his hands during the game. */
function buildBasket(m: RobotMaterials): THREE.Group {
  const basket = new THREE.Group();
  const bowl = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.38, 0.3, 48, 1, true), m.platform));
  (bowl.material as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide;
  const base = new THREE.Mesh(new THREE.CircleGeometry(0.38, 48), new THREE.MeshPhysicalMaterial({ color: 0x1a1d33, roughness: 0.6 }));
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.145;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.026, 10, 64), new THREE.MeshPhysicalMaterial({ color: 0xd2ae62, metalness: 0.85, roughness: 0.32, clearcoat: 0.6 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.15;
  const inner = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.018, 8, 48), m.emissive);
  inner.rotation.x = Math.PI / 2;
  inner.position.y = -0.12;
  basket.add(bowl, base, rim, inner);
  basket.position.set(0, -1.32, 1.22);
  basket.rotation.x = 0.15;
  basket.scale.setScalar(0.001);
  return basket;
}

export function buildCharacter(m: RobotMaterials, face: Face, glow: THREE.Texture): Rig {
  const root = new THREE.Group();
  const { head, antenna } = buildHead(m, face);
  const neck = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.22, 32), m.joint));
  neck.position.y = -0.95;
  const { torso, badgeGlow } = buildTorso(m, glow);
  const armL = buildArm(m, -1);
  const armR = buildArm(m, 1);
  const legs = buildLegs(m);
  root.add(head, neck, torso, armL.shoulder, armR.shoulder, legs);

  const { platform, ring, shadow } = buildPlatform(m, glow);
  const basket = buildBasket(m);
  root.add(basket);

  return { root, head, antenna, neck, torso, armL, armR, legs, platform, platformRing: ring, shadow, badgeGlow, basket };
}
