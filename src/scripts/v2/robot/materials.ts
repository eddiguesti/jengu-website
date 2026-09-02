/**
 * Materials, procedural textures and the studio environment for the character.
 */
import * as THREE from 'three';

export const CYAN = 0x5ad8ff;
export const CYAN_COLOR = new THREE.Color(CYAN);

export interface RobotMaterials {
  shell: THREE.MeshPhysicalMaterial;
  shellShade: THREE.MeshPhysicalMaterial;
  joint: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  platform: THREE.MeshPhysicalMaterial;
  emissive: THREE.MeshStandardMaterial;
}

/** Fine grain roughness variation so the plastic reads as a material, not a flat colour. */
function makeNoiseTexture(size = 256): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 215 + Math.random() * 40;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function makeGlowSprite(): THREE.Texture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeMaterials(): RobotMaterials {
  const noise = makeNoiseTexture();
  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xf3f2f8,
    roughness: 0.42,
    metalness: 0,
    roughnessMap: noise,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
    sheen: 0.45,
    sheenColor: new THREE.Color(0xcfc8ff),
    sheenRoughness: 0.7,
    envMapIntensity: 0.85,
  });
  const shellShade = shell.clone();
  shellShade.color.set(0xd9d7e6);
  const joint = new THREE.MeshPhysicalMaterial({
    color: 0x6c6c9a,
    roughness: 0.48,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.8,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x05060c,
    roughness: 0.06,
    metalness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    transparent: true,
    opacity: 0.52,
    envMapIntensity: 2.2,
    depthWrite: false,
  });
  const platform = new THREE.MeshPhysicalMaterial({
    color: 0xd6d2ea,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    envMapIntensity: 0.8,
  });
  const emissive = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: CYAN_COLOR,
    emissiveIntensity: 1.7,
    roughness: 1,
  });
  return { shell, shellShade, joint, glass, platform, emissive };
}

/** A studio lighting rig baked into an environment map: big top softbox, cool and violet side cards. */
export function makeStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshBasicMaterial({ color: 0x0d0e15, side: THREE.BackSide }));
  scene.add(room);

  const card = (color: THREE.Color, w: number, h: number, pos: THREE.Vector3, look: THREE.Vector3): void => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.copy(pos);
    m.lookAt(look);
    scene.add(m);
  };
  card(new THREE.Color(2.6, 2.6, 2.8), 9, 6, new THREE.Vector3(0, 10, 2), new THREE.Vector3(0, 0, 0));
  card(new THREE.Color(0.5, 1.1, 2.8), 4, 9, new THREE.Vector3(-10, 2, 1), new THREE.Vector3(0, 0, 0));
  card(new THREE.Color(2.0, 1.0, 3.2), 4, 9, new THREE.Vector3(10, 3, -2), new THREE.Vector3(0, 0, 0));
  card(new THREE.Color(0.7, 0.7, 0.85), 10, 3, new THREE.Vector3(0, -4, 10), new THREE.Vector3(0, 0, 0));
  card(new THREE.Color(0.25, 0.4, 0.6), 12, 12, new THREE.Vector3(0, -11, 0), new THREE.Vector3(0, 0, 0));

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.03).texture;
  pmrem.dispose();
  return tex;
}
