/**
 * Ambient automation vignettes. Items fly in from the right and get handled:
 *  · envelope  → caught, read, stamped CONFIRMED, flicked away
 *  · phone     → rings and shakes, hand goes to the ear, stamped BOOKED
 *  · key card  → held to the chest badge, beeps, stamped CHECKED IN
 * When the character is asleep, items still arrive and are stamped mid-air
 * beside him: it works while you sleep.
 */
import * as THREE from 'three';

export type Kind = 'envelope' | 'phone' | 'keycard';
type State = 'idle' | 'in' | 'hold' | 'stamp' | 'out';
const ORDER: Kind[] = ['envelope', 'phone', 'keycard'];
const DUR: Record<Exclude<State, 'idle'>, number> = { in: 1.0, hold: 0.9, stamp: 0.55, out: 0.7 };
const LABEL: Record<Kind, string> = { envelope: 'CONFIRMED', phone: 'BOOKED', keycard: 'CHECKED IN' };

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number): number => t * t * t;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [c, ctx];
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function envelopeTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 168);
  ctx.fillStyle = '#f7f6fb';
  ctx.fillRect(0, 0, 256, 168);
  ctx.strokeStyle = 'rgba(40,50,90,0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 164);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, 6);
  ctx.lineTo(128, 100);
  ctx.lineTo(252, 6);
  ctx.stroke();
  ctx.fillStyle = '#5ad8ff';
  ctx.beginPath();
  ctx.arc(128, 100, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0a0a0c';
  ctx.beginPath();
  ctx.arc(128, 100, 7, 0, Math.PI * 2);
  ctx.fill();
  return toTexture(c);
}

function phoneTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(128, 256);
  ctx.fillStyle = '#0b0d16';
  ctx.fillRect(0, 0, 128, 256);
  ctx.fillStyle = '#121a33';
  ctx.fillRect(8, 20, 112, 216);
  ctx.strokeStyle = '#5ad8ff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(90,216,255,0.9)';
  ctx.shadowBlur = 12;
  // handset
  ctx.beginPath();
  ctx.moveTo(44, 96);
  ctx.quadraticCurveTo(40, 150, 88, 166);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(46, 92, 8, 0, Math.PI * 2);
  ctx.arc(88, 168, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#5ad8ff';
  ctx.fill();
  // ring arcs
  ctx.lineWidth = 4;
  [22, 36].forEach((r) => {
    ctx.beginPath();
    ctx.arc(84, 84, r, -1.6, -0.2);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(90,216,255,0.6)';
  ctx.fillRect(48, 220, 32, 4);
  return toTexture(c);
}

function keycardTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 160);
  ctx.fillStyle = '#f7f6fb';
  ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = '#131a33';
  ctx.fillRect(0, 26, 256, 34);
  ctx.fillStyle = '#d2ae62';
  ctx.fillRect(22, 84, 42, 32);
  ctx.strokeStyle = '#5ad8ff';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(90,216,255,0.8)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(196, 100, 16, 0, Math.PI * 2);
  ctx.moveTo(180, 100);
  ctx.lineTo(120, 100);
  ctx.moveTo(136, 100);
  ctx.lineTo(136, 116);
  ctx.moveTo(154, 100);
  ctx.lineTo(154, 112);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(19,26,51,0.5)';
  ctx.fillRect(22, 128, 120, 6);
  return toTexture(c);
}

export function stampTexture(label: string): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 160);
  ctx.strokeStyle = '#7fe3ff';
  ctx.fillStyle = '#7fe3ff';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(90,216,255,0.9)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(128, 62, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(106, 64);
  ctx.lineTo(122, 80);
  ctx.lineTo(152, 46);
  ctx.stroke();
  ctx.font = '600 22px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, 128, 142);
  return toTexture(c);
}

export interface Item {
  kind: Kind;
  mesh: THREE.Mesh;
  holdOffset: THREE.Vector3;
}

export function makeItem(kind: Kind): Item {
  const paper = new THREE.MeshStandardMaterial({ color: 0xf7f6fb, roughness: 0.85 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0d16, roughness: 0.5 });
  let geo: THREE.BoxGeometry;
  let front: THREE.MeshStandardMaterial;
  let side: THREE.MeshStandardMaterial;
  let holdOffset: THREE.Vector3;
  if (kind === 'phone') {
    geo = new THREE.BoxGeometry(0.24, 0.46, 0.04);
    front = new THREE.MeshStandardMaterial({ map: phoneTexture(), roughness: 0.4, emissive: 0x5ad8ff, emissiveIntensity: 0.25, emissiveMap: phoneTexture() });
    side = dark;
    holdOffset = new THREE.Vector3(0.04, 0.14, 0.12);
  } else if (kind === 'keycard') {
    geo = new THREE.BoxGeometry(0.5, 0.31, 0.02);
    front = new THREE.MeshStandardMaterial({ map: keycardTexture(), roughness: 0.6 });
    side = paper;
    holdOffset = new THREE.Vector3(0.02, 0.22, 0.14);
  } else {
    geo = new THREE.BoxGeometry(0.52, 0.34, 0.025);
    front = new THREE.MeshStandardMaterial({ map: envelopeTexture(), roughness: 0.85 });
    side = paper;
    holdOffset = new THREE.Vector3(0.02, 0.24, 0.14);
  }
  const mesh = new THREE.Mesh(geo, [side, side, side, side, front, side]);
  mesh.castShadow = true;
  mesh.visible = false;
  return { kind, mesh, holdOffset };
}

export class Chores {
  readonly group: THREE.Group;
  private readonly items: Record<Kind, Item>;
  private readonly stamps: Record<Kind, THREE.Sprite>;
  private current: Kind = 'envelope';
  private index = 0;
  private state: State = 'idle';
  private stateStart = 0;
  private nextAt = 3.5;
  private time = 0;
  private asleepRun = false;
  private readonly from = new THREE.Vector3();
  private readonly ctrl = new THREE.Vector3();
  private readonly holdPos = new THREE.Vector3();
  private readonly outTo = new THREE.Vector3(-2.2, 1.3, -1.4);
  private readonly origin = new THREE.Vector3();
  private readonly sleepSlot = new THREE.Vector3(1.25, 0.2, 0.6);

  constructor() {
    this.group = new THREE.Group();
    this.items = { envelope: makeItem('envelope'), phone: makeItem('phone'), keycard: makeItem('keycard') };
    this.stamps = {} as Record<Kind, THREE.Sprite>;
    ORDER.forEach((kind) => {
      this.group.add(this.items[kind].mesh);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: stampTexture(LABEL[kind]), transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
      s.scale.set(0.001, 0.001, 1);
      this.stamps[kind] = s;
      this.group.add(s);
    });
  }

  get idle(): boolean {
    return this.state === 'idle';
  }

  get kind(): Kind {
    return this.current;
  }

  private get elapsed(): number {
    return this.time - this.stateStart;
  }

  /** 0..1 how far the catching arm should be raised (0 while asleep). */
  get catching(): number {
    if (this.asleepRun) return 0;
    const e = this.elapsed;
    switch (this.state) {
      case 'in':
        return easeOut(clamp01(e / 0.45));
      case 'hold':
      case 'stamp':
        return 1;
      case 'out':
        return 1 - easeOut(clamp01(e / DUR.out));
      default:
        return 0;
    }
  }

  /** True when the hand should go to the ear (phone) rather than in front. */
  get toEar(): boolean {
    return this.current === 'phone';
  }

  get focused(): boolean {
    return !this.asleepRun && (this.state === 'hold' || this.state === 'stamp' || (this.state === 'in' && this.elapsed > 0.4));
  }

  get stamping(): boolean {
    return this.state === 'stamp';
  }

  private enter(state: State): void {
    this.state = state;
    this.stateStart = this.time;
  }

  reset(): void {
    if (this.state !== 'idle') {
      this.enter('idle');
      this.nextAt = this.time + 2.5;
    }
    ORDER.forEach((k) => {
      this.items[k].mesh.visible = false;
      (this.stamps[k].material as THREE.SpriteMaterial).opacity = 0;
    });
  }

  /**
   * hand: world position of the catching hand. asleep: process items mid-air
   * without the character. allowStart: false while another vignette plays.
   * Returns particle energy to add.
   */
  update(t: number, dt: number, calm: boolean, hand: THREE.Vector3, asleep: boolean, allowStart: boolean, origin: THREE.Vector3): number {
    this.time = t;
    if (!calm) {
      this.reset();
      return 0;
    }
    const item = this.items[this.current];
    const mesh = item.mesh;
    const stamp = this.stamps[this.current];
    const mat = stamp.material as THREE.SpriteMaterial;
    if (this.asleepRun) this.holdPos.copy(this.sleepSlot).add(origin);
    else this.holdPos.copy(hand).add(item.holdOffset);
    let energy = 0;

    switch (this.state) {
      case 'idle':
        if (t >= this.nextAt && allowStart) {
          this.current = ORDER[this.index % ORDER.length];
          this.index += 1;
          this.asleepRun = asleep;
          const it = this.items[this.current];
          this.origin.copy(origin);
          this.from.set(3.4, 0.4 + Math.random() * 1.2, -0.8 + Math.random() * 0.6).add(origin);
          const target = this.asleepRun ? this.sleepSlot.clone().add(origin) : hand.clone().add(it.holdOffset);
          this.ctrl.copy(this.from).lerp(target, 0.5).add(new THREE.Vector3(0.3, 1.3, 0.4));
          it.mesh.visible = true;
          it.mesh.scale.setScalar(1);
          (this.stamps[this.current].material as THREE.SpriteMaterial).opacity = 0;
          this.stamps[this.current].scale.set(0.001, 0.001, 1);
          this.enter('in');
        }
        break;
      case 'in': {
        const p = clamp01(this.elapsed / DUR.in);
        const q = easeOut(p);
        const a = this.from.clone().lerp(this.ctrl, q);
        const b = this.ctrl.clone().lerp(this.holdPos, q);
        mesh.position.copy(a.lerp(b, q));
        const ring = this.current === 'phone' ? Math.sin(t * 40) * 0.22 * (1 - p) : 0;
        mesh.rotation.set(lerp(1.4, -0.2, q), lerp(-2.4, 0.25, q), lerp(0.8, 0.05, q) + ring);
        if (p >= 1) this.enter('hold');
        break;
      }
      case 'hold':
        mesh.position.lerp(this.holdPos, 1 - Math.exp(-22 * dt));
        mesh.rotation.set(-0.2 + Math.sin(t * 3) * 0.03, this.asleepRun ? t * 1.5 : 0.25, 0.05);
        if (this.elapsed >= DUR.hold) this.enter('stamp');
        break;
      case 'stamp': {
        const p = clamp01(this.elapsed / DUR.stamp);
        mesh.position.lerp(this.holdPos, 1 - Math.exp(-22 * dt));
        stamp.position.copy(mesh.position).add(new THREE.Vector3(0.1, 0.1, 0.25));
        const pop = p < 0.4 ? easeOut(p / 0.4) * 1.25 : 1.25 - 0.25 * easeOut((p - 0.4) / 0.6);
        stamp.scale.set(0.62 * pop, 0.39 * pop, 1);
        mat.opacity = Math.min(1, p * 4);
        energy = p < 0.3 ? 0.6 : 0;
        if (p >= 1) this.enter('out');
        break;
      }
      case 'out': {
        const p = clamp01(this.elapsed / DUR.out);
        mesh.position.copy(this.holdPos).lerp(this.outTo.clone().add(this.origin), easeOut(p));
        mesh.scale.setScalar(1 - easeIn(p));
        mesh.rotation.y += 15 * dt;
        stamp.position.copy(mesh.position).add(new THREE.Vector3(0.1, 0.1, 0.25));
        mat.opacity = 1 - p;
        if (p >= 1) {
          mesh.visible = false;
          this.enter('idle');
          this.nextAt = t + (this.asleepRun ? 1.6 : 3) + Math.random() * 3;
        }
        break;
      }
    }
    return energy;
  }
}
