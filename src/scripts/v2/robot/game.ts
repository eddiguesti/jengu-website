/**
 * Concierge Rush — the easter-egg mini game (triple-tap the character).
 * Guest requests rain down for 30 seconds; move Jengu to catch them.
 * Catches stamp the request and build a combo, misses break it. Ends on a
 * hologram scoreboard with tap-to-replay.
 */
import * as THREE from 'three';
import { makeItem, stampTexture, type Kind, type Item } from './chores';

type Phase = 'off' | 'countdown' | 'playing' | 'over';
const KINDS: Kind[] = ['envelope', 'phone', 'keycard'];
const ROUND = 30;
const COUNTDOWN = 3.2;
const OVER_HOLD = 9;
const POOL = 9;
const X_RANGE = 2.6;
const SPAWN_Y = 4.4;
const CATCH_Y_MIN = -1.6;
const CATCH_Y_MAX = -1.0;
const MISS_Y = -3.1;
const CATCH_HALF_W = 0.62;

const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

interface Falling {
  item: Item;
  active: boolean;
  vy: number;
  spin: number;
  dying: number;
}

interface Stamp {
  sprite: THREE.Sprite;
  born: number;
}

export interface GameEvents {
  caught: number;
  missed: number;
}

function panel(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [c, ctx];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

class TextSprite {
  readonly sprite: THREE.Sprite;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tex: THREE.CanvasTexture;
  readonly w: number;
  readonly h: number;

  constructor(w: number, h: number, worldW: number) {
    const [c, ctx] = panel(w, h);
    this.ctx = ctx;
    this.w = w;
    this.h = h;
    this.tex = new THREE.CanvasTexture(c);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    this.sprite.scale.set(worldW, (worldW * h) / w, 1);
  }

  set opacity(v: number) {
    (this.sprite.material as THREE.SpriteMaterial).opacity = v;
  }

  draw(fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): void {
    this.ctx.clearRect(0, 0, this.w, this.h);
    fn(this.ctx, this.w, this.h);
    this.tex.needsUpdate = true;
  }
}

export class Game {
  readonly group: THREE.Group;
  private phase: Phase = 'off';
  private phaseStart = 0;
  private time = 0;
  private score = 0;
  private combo = 0;
  private best = 0;
  private misses = 0;
  private nextSpawn = 0;
  private readonly pool: Falling[] = [];
  private readonly stamps: Stamp[] = [];
  private readonly stampTex: Record<Kind, THREE.CanvasTexture>;
  private readonly hud: TextSprite;
  private readonly big: TextSprite;
  private readonly board: TextSprite;
  private lastHud = '';
  private lastBig = '';
  /** x of the nearest falling item, for the character to look at. */
  focusX = 0;
  focusY = 0;
  private halfW = 2.6;

  constructor() {
    this.group = new THREE.Group();
    for (let i = 0; i < POOL; i++) {
      const item = makeItem(KINDS[i % KINDS.length]);
      this.group.add(item.mesh);
      this.pool.push({ item, active: false, vy: 0, spin: 0, dying: 0 });
    }
    this.stampTex = { envelope: stampTexture('CONFIRMED'), phone: stampTexture('BOOKED'), keycard: stampTexture('CHECKED IN') };
    this.hud = new TextSprite(640, 120, 3.2);
    this.hud.sprite.position.set(0, 2.3, 0);
    this.big = new TextSprite(640, 320, 3.2);
    this.big.sprite.position.set(0, 0.9, 1.2);
    this.board = new TextSprite(720, 440, 4.2);
    this.board.sprite.position.set(0, -0.2, 1.4);
    this.group.add(this.hud.sprite, this.big.sprite, this.board.sprite);
  }

  get active(): boolean {
    return this.phase !== 'off';
  }

  get playing(): boolean {
    return this.phase === 'playing';
  }

  get over(): boolean {
    return this.phase === 'over';
  }

  private enter(p: Phase): void {
    this.phase = p;
    this.phaseStart = this.time;
  }

  start(t: number): void {
    this.time = t;
    this.score = 0;
    this.combo = 0;
    this.best = 0;
    this.misses = 0;
    this.lastHud = '';
    this.lastBig = '';
    this.pool.forEach((f) => {
      f.active = false;
      f.item.mesh.visible = false;
    });
    this.stamps.forEach((s) => this.group.remove(s.sprite));
    this.stamps.length = 0;
    this.board.opacity = 0;
    this.enter('countdown');
  }

  stop(): void {
    this.enter('off');
    this.pool.forEach((f) => {
      f.active = false;
      f.item.mesh.visible = false;
    });
    this.stamps.forEach((s) => this.group.remove(s.sprite));
    this.stamps.length = 0;
    this.hud.opacity = 0;
    this.big.opacity = 0;
    this.board.opacity = 0;
  }

  /** Tap during the scoreboard restarts; during countdown/play it is ignored. */
  tap(t: number): void {
    if (this.phase === 'over') this.start(t);
  }

  private spawn(t: number): void {
    const free = this.pool.find((f) => !f.active);
    if (!free) return;
    const elapsed = t - this.phaseStart;
    const ramp = clamp(elapsed / ROUND, 0, 1);
    free.active = true;
    free.dying = 0;
    free.vy = -(1.7 + ramp * 1.6 + Math.random() * 0.4);
    free.spin = (Math.random() - 0.5) * 3;
    free.item.mesh.visible = true;
    free.item.mesh.scale.setScalar(1);
    const range = Math.max(X_RANGE, this.halfW - 0.7);
    free.item.mesh.position.set((Math.random() * 2 - 1) * range, SPAWN_Y, 1.7 + Math.random() * 0.3);
    free.item.mesh.rotation.set(Math.random() * 0.6, Math.random() * 6, Math.random() * 0.6);
  }

  private popStamp(kind: Kind, at: THREE.Vector3): void {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.stampTex[kind], transparent: true, opacity: 1, depthWrite: false, depthTest: false }));
    s.position.copy(at).add(new THREE.Vector3(0, 0.3, 0.3));
    s.scale.set(0.001, 0.001, 1);
    this.group.add(s);
    this.stamps.push({ sprite: s, born: this.time });
  }

  private drawHud(t: number): void {
    const left = Math.max(0, Math.ceil(ROUND - (t - this.phaseStart)));
    const key = `${this.score}|${left}|${this.combo}`;
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.hud.draw((ctx, w, h) => {
      ctx.fillStyle = 'rgba(12,14,24,0.72)';
      roundRect(ctx, 0, 0, w, h, 40);
      ctx.fill();
      ctx.strokeStyle = 'rgba(127,227,255,0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#f4f3ef';
      ctx.textBaseline = 'middle';
      ctx.font = '600 44px "Bricolage Grotesque", "Geist", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.score}`, 40, h / 2);
      ctx.font = '500 20px "Geist Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(244,243,239,0.6)';
      ctx.fillText('HANDLED', 40 + ctx.measureText(`${this.score}`).width + 60, h / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = left <= 5 ? '#ff8a8a' : '#7fe3ff';
      ctx.font = '600 44px "Bricolage Grotesque", "Geist", sans-serif';
      ctx.fillText(`${left}s`, w / 2 + 40, h / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = this.combo >= 3 ? '#ffd166' : 'rgba(244,243,239,0.6)';
      ctx.font = '500 22px "Geist Mono", ui-monospace, monospace';
      ctx.fillText(this.combo >= 2 ? `×${this.combo} COMBO` : 'CATCH THEM', w - 40, h / 2);
    });
  }

  private drawBig(text: string, sub = ''): void {
    const key = `${text}|${sub}`;
    if (key === this.lastBig) return;
    this.lastBig = key;
    this.big.draw((ctx, w, h) => {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#7fe3ff';
      ctx.shadowColor = 'rgba(90,216,255,0.9)';
      ctx.shadowBlur = 24;
      ctx.font = '700 170px "Bricolage Grotesque", "Geist", sans-serif';
      ctx.fillText(text, w / 2, h / 2 - (sub ? 24 : 0));
      if (sub) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f4f3ef';
        ctx.font = '500 22px "Geist Mono", ui-monospace, monospace';
        ctx.fillText(sub, w / 2, h / 2 + 100);
      }
    });
  }

  private drawBoard(): void {
    const total = this.score + this.misses;
    const rate = total ? Math.round((this.score / total) * 100) : 100;
    this.board.draw((ctx, w, h) => {
      ctx.fillStyle = 'rgba(12,14,24,0.86)';
      roundRect(ctx, 0, 0, w, h, 36);
      ctx.fill();
      ctx.strokeStyle = 'rgba(127,227,255,0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(244,243,239,0.6)';
      ctx.font = '500 22px "Geist Mono", ui-monospace, monospace';
      ctx.fillText('TIME’S UP', w / 2, 58);
      ctx.fillStyle = '#f4f3ef';
      ctx.font = '600 120px "Bricolage Grotesque", "Geist", sans-serif';
      ctx.fillText(`${this.score}`, w / 2, 160);
      ctx.font = '500 26px "Geist", sans-serif';
      ctx.fillText(`requests handled in 30s · ${rate}% caught · best combo ×${this.best}`, w / 2, 245);
      ctx.fillStyle = '#7fe3ff';
      ctx.font = '500 30px "Bricolage Grotesque", "Geist", sans-serif';
      ctx.fillText('Jengu does this 24/7, in 100+ languages.', w / 2, 315);
      ctx.fillStyle = 'rgba(244,243,239,0.55)';
      ctx.font = '500 20px "Geist Mono", ui-monospace, monospace';
      ctx.fillText('TAP TO PLAY AGAIN · ESC TO CLOSE', w / 2, 385);
    });
  }

  /** playerX: character x. Returns catch/miss counts this frame. */
  update(t: number, dt: number, playerX: number, halfW: number, centreX: number): GameEvents {
    this.time = t;
    this.halfW = halfW;
    this.hud.sprite.position.x = centreX;
    this.big.sprite.position.x = centreX;
    this.board.sprite.position.x = centreX;
    const ev: GameEvents = { caught: 0, missed: 0 };
    if (this.phase === 'off') return ev;
    const e = t - this.phaseStart;

    if (this.phase === 'countdown') {
      const n = Math.ceil(COUNTDOWN - e);
      this.drawBig(n > 0 ? String(n) : 'GO', 'CONCIERGE RUSH · CATCH EVERY REQUEST');
      this.big.opacity = 1;
      this.hud.opacity = easeOut(clamp(e / 0.6, 0, 1));
      const pulse = 1 + 0.1 * Math.sin((e % 1) * Math.PI);
      this.big.sprite.scale.set(3.2 * pulse, 1.6 * pulse, 1);
      if (e >= COUNTDOWN + 0.5) {
        this.enter('playing');
        this.big.opacity = 0;
        this.nextSpawn = t + 0.4;
      }
      this.drawHud(t);
      return ev;
    }

    if (this.phase === 'playing') {
      if (t >= this.nextSpawn) {
        this.spawn(t);
        const ramp = clamp(e / ROUND, 0, 1);
        this.nextSpawn = t + (0.95 - ramp * 0.45) + Math.random() * 0.25;
      }
      let nearest = Infinity;
      this.pool.forEach((f) => {
        if (!f.active) return;
        const m = f.item.mesh;
        if (f.dying > 0) {
          f.dying += dt;
          m.scale.setScalar(Math.max(0.001, 1 - f.dying / 0.25));
          if (f.dying > 0.25) {
            f.active = false;
            m.visible = false;
          }
          return;
        }
        m.position.y += f.vy * dt;
        m.rotation.y += f.spin * dt;
        m.rotation.x += f.spin * 0.4 * dt;
        const d = Math.abs(m.position.x - playerX);
        if (m.position.y < nearest) {
          nearest = m.position.y;
          this.focusX = m.position.x;
          this.focusY = m.position.y;
        }
        if (m.position.y < CATCH_Y_MAX && m.position.y > CATCH_Y_MIN && d < CATCH_HALF_W) {
          f.dying = 0.001;
          this.score += 1;
          this.combo += 1;
          this.best = Math.max(this.best, this.combo);
          this.popStamp(f.item.kind, m.position);
          ev.caught += 1;
        } else if (m.position.y < MISS_Y) {
          f.active = false;
          m.visible = false;
          this.misses += 1;
          this.combo = 0;
          ev.missed += 1;
        }
      });
      this.drawHud(t);
      if (e >= ROUND) {
        this.enter('over');
        this.pool.forEach((f) => {
          f.active = false;
          f.item.mesh.visible = false;
        });
        this.drawBoard();
      }
    }

    if (this.phase === 'over') {
      const eo = t - this.phaseStart;
      const p = clamp(eo / 0.5, 0, 1);
      this.board.opacity = easeOut(p);
      this.board.sprite.scale.set(4.2 * (0.9 + 0.1 * easeOut(p)), (4.2 * 440) / 720 * (0.9 + 0.1 * easeOut(p)), 1);
      this.hud.opacity = 1 - p;
      if (eo > OVER_HOLD) this.stop();
    }

    // stamp pops
    for (let i = this.stamps.length - 1; i >= 0; i--) {
      const s = this.stamps[i];
      const a = t - s.born;
      const pop = a < 0.15 ? easeOut(a / 0.15) * 1.2 : 1.2 - 0.2 * clamp((a - 0.15) / 0.3, 0, 1);
      s.sprite.scale.set(0.55 * pop, 0.34 * pop, 1);
      s.sprite.position.y += 0.9 * dt;
      (s.sprite.material as THREE.SpriteMaterial).opacity = 1 - clamp((a - 0.35) / 0.35, 0, 1);
      if (a > 0.75) {
        this.group.remove(s.sprite);
        this.stamps.splice(i, 1);
      }
    }
    return ev;
  }
}
