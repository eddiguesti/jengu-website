/**
 * Language vignette: speech bubbles in three languages pop up around the
 * head, the character nods, and each bubble resolves into a check mark.
 */
import * as THREE from 'three';

const PHRASES = ['Bonjour !', '¡Hola!', 'こんにちは'];
const SPOTS = [new THREE.Vector3(-1.75, 0.75, 0.4), new THREE.Vector3(1.7, 1.05, 0.3), new THREE.Vector3(-1.45, -0.45, 0.9)];
const STAGGER = 0.38;
const RESOLVE_AT = 1.9;
const END_AT = 3.3;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
const overshoot = (t: number): number => (t >= 1 ? 1 : 1 + 0.35 * Math.sin(t * Math.PI) * (1 - t) + (easeOut(t) - 1));

function bubbleTexture(text: string, tailLeft: boolean): THREE.CanvasTexture {
  const W = 320;
  const H = 160;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(c);
  ctx.fillStyle = '#f7f6fb';
  const r = 34;
  const x = 16;
  const y = 16;
  const w = W - 32;
  const h = 96;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  const tx = tailLeft ? 70 : W - 70;
  ctx.moveTo(tx - 18, y + h - 2);
  ctx.lineTo(tx + (tailLeft ? -8 : 8), y + h + 34);
  ctx.lineTo(tx + 18, y + h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0a0a0c';
  ctx.font = '500 40px "Geist", "Hiragino Sans", "Noto Sans JP", -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, y + h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function checkTexture(): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(c);
  ctx.fillStyle = '#5ad8ff';
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0a0a0c';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(40, 66);
  ctx.lineTo(58, 84);
  ctx.lineTo(92, 46);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Bubbles {
  readonly group: THREE.Group;
  private readonly bubbles: THREE.Sprite[];
  private readonly checks: THREE.Sprite[];
  private start = -1;

  constructor() {
    this.group = new THREE.Group();
    const check = checkTexture();
    this.bubbles = PHRASES.map((p, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTexture(p, i !== 1), transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
      s.position.copy(SPOTS[i]);
      s.center.set(0.5, 0.1);
      this.group.add(s);
      return s;
    });
    this.checks = PHRASES.map((_, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: check, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
      s.position.copy(SPOTS[i]).add(new THREE.Vector3(0, 0.35, 0));
      this.group.add(s);
      return s;
    });
  }

  get active(): boolean {
    return this.start >= 0;
  }

  /** 0..1 nod intensity for the head. */
  nod(t: number): number {
    if (this.start < 0) return 0;
    const e = t - this.start;
    return e > 0.5 && e < 2.2 ? 1 : 0;
  }

  begin(t: number): void {
    this.start = t;
  }

  stop(): void {
    this.start = -1;
    this.bubbles.forEach((b) => ((b.material as THREE.SpriteMaterial).opacity = 0));
    this.checks.forEach((c) => ((c.material as THREE.SpriteMaterial).opacity = 0));
  }

  update(t: number): void {
    if (this.start < 0) return;
    const e = t - this.start;
    if (e > END_AT) {
      this.stop();
      return;
    }
    this.bubbles.forEach((b, i) => {
      const local = e - i * STAGGER;
      const inP = clamp01(local / 0.35);
      const resolve = clamp01((local - RESOLVE_AT) / 0.3);
      const s = 1.1 * overshoot(inP) * (1 - resolve);
      b.scale.set(1.1 * s, 0.55 * s, 1);
      (b.material as THREE.SpriteMaterial).opacity = inP > 0 ? 1 - resolve : 0;
      const c = this.checks[i];
      const cp = clamp01((local - RESOLVE_AT) / 0.35);
      const fade = clamp01((local - RESOLVE_AT - 0.7) / 0.4);
      const cs = 0.38 * overshoot(cp) * (1 - fade);
      c.scale.set(cs, cs, 1);
      (c.material as THREE.SpriteMaterial).opacity = cp > 0 ? 1 - fade : 0;
      c.position.y = SPOTS[i].y + 0.35 + fade * 0.4;
    });
  }
}
