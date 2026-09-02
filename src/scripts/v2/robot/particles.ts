/**
 * Orbiting particle field: cyan and violet motes drifting around the
 * character, brightening as the hologram builds.
 */
import * as THREE from 'three';

export class Particles {
  readonly points: THREE.Points;
  private readonly material: THREE.PointsMaterial;
  private readonly seeds: Float32Array;
  private readonly count: number;

  constructor(sprite: THREE.Texture, count = 160) {
    this.count = count;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.seeds = new Float32Array(count * 4);
    const cyan = new THREE.Color(0x7fe3ff);
    const violet = new THREE.Color(0xb48cff);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.9 + Math.random() * 1.4;
      const height = -3 + Math.random() * 4.6;
      const speed = 0.08 + Math.random() * 0.18;
      this.seeds.set([angle, radius, height, speed], i * 4);
      const c = Math.random() < 0.6 ? cyan : violet;
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.material = new THREE.PointsMaterial({
      map: sprite,
      size: 0.11,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.points = new THREE.Points(geo, this.material);
    this.update(0, 0);
  }

  update(t: number, energy: number): void {
    const pos = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < this.count; i++) {
      const a = this.seeds[i * 4];
      const r = this.seeds[i * 4 + 1] * (1 - energy * 0.25);
      const h = this.seeds[i * 4 + 2];
      const s = this.seeds[i * 4 + 3] * (1 + energy * 2.5);
      const ang = a + t * s;
      pos.setXYZ(i, Math.cos(ang) * r, h + Math.sin(t * 0.9 + a * 3) * 0.12, Math.sin(ang) * r * 0.75);
    }
    pos.needsUpdate = true;
    this.material.opacity = 0.45 + energy * 0.5;
    this.material.size = 0.1 + energy * 0.06;
  }
}
