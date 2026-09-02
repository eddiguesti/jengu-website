/**
 * Animator — the character's personality and the game-like interactions.
 *  · eyes and head track the cursor with spring physics; antenna wobbles from head motion
 *  · idle: breathing, bob, blinks; bored look-around after 4s; dozes off after 14s, wakes with a double blink
 *  · hover: leans toward the cursor, eyes brighten
 *  · tap: cycles wave → jump (squash & stretch + particle burst) → 360° spin
 *  · drag: picks him up and moves him; release drops him with a bounce and the platform follows
 *  · double-tap: folds limbs into the head and floats as an orb; double-tap again to unfold
 *  · scroll: turns to the hologram and presents it with a raised arm
 *  · ambient vignettes (chores, language bubbles) while calm
 *
 * Every smoothing step is time-based (exponential damping by dt), so motion
 * is identical at 60, 120 or 30 fps, and every pose target is damped so
 * interrupted actions blend instead of snapping.
 */
import * as THREE from 'three';
import type { Rig, Arm } from './model';
import type { Face } from './face';
import type { Hologram } from './hologram';
import type { Particles } from './particles';
import type { Chores } from './chores';
import type { Bubbles } from './bubbles';
import type { Game } from './game';

interface Options {
  reduceMotion: boolean;
  finePointer: boolean;
  /** True when a client-space point is over the character. */
  hitTest: (clientX: number, clientY: number) => boolean;
  /** Half the visible world width / height at the character plane. */
  halfWidth: () => number;
  halfHeight: () => number;
  /** Resting x of the character (right-hand column on wide screens). */
  homeX: () => number;
}

type Reaction = 'wave' | 'jump' | 'spin';
const REACTIONS: Reaction[] = ['wave', 'jump', 'spin'];
const DURATION: Record<Reaction, number> = { wave: 1.7, jump: 0.95, spin: 1.15 };
const TORSO_Y = -1.72;
const SHOULDER_Y = -1.3;

const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** Frame-rate independent exponential smoothing: lambda is the rate per second. */
const damp = (a: number, b: number, lambda: number, dt: number): number => lerp(a, b, 1 - Math.exp(-lambda * dt));
const smooth = (t: number): number => t * t * (3 - 2 * t);
const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

class Spring {
  value = 0;
  vel = 0;
  constructor(
    private readonly k: number,
    private readonly damping: number
  ) {}
  step(target: number, dt: number): number {
    // Sub-step so stiff springs stay stable on slow frames.
    let remaining = Math.min(dt, 0.1);
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 120);
      this.vel += (target - this.value) * this.k * h;
      this.vel *= Math.exp(-this.damping * h);
      this.value += this.vel * h;
      remaining -= h;
    }
    return this.value;
  }
}

export class Animator {
  private readonly pointer = new THREE.Vector2();
  private readonly pointerSmooth = new THREE.Vector2();
  private pointerMoved = false;
  private lastMove = 0;
  private hovered = false;
  private hoverAmt = 0;

  private readonly headYaw = new Spring(70, 9);
  private readonly headPitch = new Spring(70, 9);
  private readonly antX = new Spring(180, 5);
  private readonly antZ = new Spring(180, 5);

  private readonly look = new THREE.Vector2();
  private readonly boredTarget = new THREE.Vector2();
  private nextBored = 0;
  private blinkStart = -1;
  private nextBlink = 2.2;
  private pendingBlinks = 0;
  private happy = 0;
  private sleepy = 0;
  private wasAsleep = false;

  private spinAngle = 0;
  private spinVel = 0;
  private dragging = false;
  private dragLastX = 0;
  private dragMoved = 0;
  private dragStart = 0;
  private dizzy = 0;

  private reaction: { type: Reaction; start: number } | null = null;
  private reactionIndex = 0;
  private lastTap = 0;
  private fold = 0;
  private foldTarget = 0;
  private burst = 0;
  private time = 0;
  private hp = 0;
  private catchAmt = 0;
  private toEarAmt = 0;
  private nextBubbles = 9;
  private rootY = 0;
  private rootSx = 1;
  private rootSy = 1;
  /** Where he has been put (world x) and the lift while dragging (world y). */
  private readonly place = new THREE.Vector2();
  private readonly pos = new THREE.Vector2();
  private dropVel = 0;
  private lift = 0;
  private velX = 0;
  private dragLastY = 0;
  private tapTimes: number[] = [];
  private pressed = false;
  private keyLeft = false;
  private keyRight = false;
  private gameAmt = 0;
  private happyBoost = 0;
  private placed = false;
  private wasGameOn = false;
  private heartsAmt = 0;
  private surpriseAmt = 0;

  private host: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(
    private readonly rig: Rig,
    private readonly face: Face,
    private readonly hologram: Hologram,
    private readonly particles: Particles,
    private readonly chores: Chores,
    private readonly bubbles: Bubbles,
    private readonly game: Game,
    private readonly opts: Options
  ) {}

  /* ---------------- input ---------------- */

  private readonly onMove = (e: PointerEvent): void => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    this.pointerMoved = true;
    if (this.host) {
      const r = this.host.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      this.hovered = nx * nx * 5 + ny * ny * 3.2 < 1;
    }
    const limit = this.opts.halfWidth() - 0.9;
    if (this.game.playing && this.host) {
      // In the game the cursor position steers him directly across the full width.
      const r = this.host.getBoundingClientRect();
      this.place.x = clamp(((e.clientX - r.left) / r.width - 0.5) * 2 * this.opts.halfWidth(), -limit, limit);
      return;
    }
    if (this.dragging && this.host) {
      const dx = e.clientX - this.dragLastX;
      const dy = e.clientY - this.dragLastY;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      // world units per pixel at the character plane
      const k = (2 * this.opts.halfHeight()) / Math.max(1, this.host.clientHeight);
      this.place.x = clamp(this.place.x + dx * k, -limit, limit);
      this.place.y = clamp(this.place.y - dy * k, 0, 3.2);
      this.placed = true;
      return;
    }
    if (this.canvas) this.canvas.style.cursor = this.game.active || this.opts.hitTest(e.clientX, e.clientY) ? 'grab' : 'default';
  };

  private readonly onDown = (e: PointerEvent): void => {
    if (this.game.active) {
      this.pressed = true;
      this.dragStart = performance.now();
      this.dragMoved = 0;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      return;
    }
    // Only the character himself is grabbable; the rest of the layer is inert.
    if (!this.opts.hitTest(e.clientX, e.clientY)) return;
    this.dragging = true;
    this.dragLastX = e.clientX;
    this.dragLastY = e.clientY;
    this.dragMoved = 0;
    this.dragStart = performance.now();
    this.canvas?.setPointerCapture(e.pointerId);
  };

  private readonly onKey = (e: KeyboardEvent): void => {
    if (!this.game.active) return;
    const down = e.type === 'keydown';
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keyLeft = down;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keyRight = down;
    else if (e.key === 'Escape' && down) this.game.stop();
    else return;
    e.preventDefault();
  };

  private readonly onUp = (): void => {
    if (this.pressed) {
      this.pressed = false;
      if (performance.now() - this.dragStart < 420) this.game.tap(this.time);
      return;
    }
    if (!this.dragging) return;
    this.dragging = false;
    const quick = performance.now() - this.dragStart < 420;
    if (this.dragMoved < 8 && quick) this.tap();
  };

  /** Fold any in-progress spin into the base angle so interrupting never snaps. */
  private settleReaction(): void {
    const r = this.reaction;
    if (r?.type === 'spin') {
      const f = clamp((this.time - r.start) / DURATION.spin, 0, 1);
      this.spinAngle += Math.PI * 2 * easeInOut(f);
    }
    this.reaction = null;
  }

  private tap(): void {
    const now = performance.now();
    // Triple-tap within 0.9s opens the easter-egg game.
    this.tapTimes = [...this.tapTimes.filter((x) => now - x < 900), now];
    if (this.tapTimes.length >= 3) {
      this.tapTimes = [];
      this.lastTap = 0;
      this.foldTarget = 0;
      this.settleReaction();
      this.game.start(this.time);
      return;
    }
    if (now - this.lastTap < 340) {
      this.lastTap = 0;
      this.foldTarget = this.foldTarget > 0.5 ? 0 : 1;
      this.settleReaction();
      this.burst = 1;
      return;
    }
    this.lastTap = now;
    this.settleReaction();
    if (this.foldTarget > 0.5) {
      this.reaction = { type: 'jump', start: this.time };
      return;
    }
    const type = REACTIONS[this.reactionIndex % REACTIONS.length];
    this.reactionIndex += 1;
    this.reaction = { type, start: this.time };
  }

  /** Walk back to the home column (after a game). */
  private goHome(): void {
    this.placed = false;
    this.place.x = this.opts.homeX();
    this.place.y = 0;
  }

  /** Put him at his home column unless the visitor has placed him somewhere. */
  rehome(): void {
    if (this.placed) return;
    const x = this.opts.homeX();
    this.place.x = x;
    this.pos.x = x;
    this.rig.platform.position.x = x;
    this.particles.points.position.x = x;
  }

  attach(canvas: HTMLCanvasElement, host: HTMLElement): void {
    this.canvas = canvas;
    this.host = host;
    this.rehome();
    window.addEventListener('pointermove', this.onMove, { passive: true });
    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
  }

  detach(): void {
    window.removeEventListener('pointermove', this.onMove);
    this.canvas?.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
  }

  /* ---------------- per-frame ---------------- */

  update(t: number, dt: number, scroll: number): void {
    this.time = t;
    const { rig } = this;
    const motion = this.opts.reduceMotion ? 0 : 1;
    if (this.pointerMoved) {
      this.lastMove = t;
      this.pointerMoved = false;
    }
    this.pointerSmooth.x = damp(this.pointerSmooth.x, this.pointer.x, 14, dt);
    this.pointerSmooth.y = damp(this.pointerSmooth.y, this.pointer.y, 14, dt);
    const ptr = this.pointerSmooth;
    // easter-egg game: keys steer, no dozing, no vignettes
    const gameOn = this.game.active;
    if (this.wasGameOn && !gameOn) this.goHome();
    this.wasGameOn = gameOn;
    this.gameAmt = damp(this.gameAmt, this.game.playing ? 1 : 0, 8, dt);
    if (gameOn) this.lastMove = t;
    if (this.game.playing && (this.keyLeft || this.keyRight)) {
      const limit = this.opts.halfWidth() - 0.9;
      this.place.x = clamp(this.place.x + ((this.keyRight ? 1 : 0) - (this.keyLeft ? 1 : 0)) * 7 * dt, -limit, limit);
    }
    const idleFor = t - this.lastMove;
    this.hp = damp(this.hp, clamp((scroll - 0.15) / 0.6, 0, 1), 9, dt);
    const hp = this.hp;
    const presenting = hp > 0.25;

    // mood
    const bored = idleFor > 4 && !this.hovered && !presenting;
    const asleep = idleFor > 14 && !presenting && this.opts.finePointer;
    this.sleepy = damp(this.sleepy, asleep ? 1 : 0, 2, dt);
    if (this.wasAsleep && !asleep) this.pendingBlinks = 2;
    this.wasAsleep = asleep;
    this.hoverAmt = damp(this.hoverAmt, this.hovered && !asleep ? 1 : 0, 5, dt);

    // reaction timeline
    let e = 0;
    let f = 0;
    const r = this.reaction;
    if (r) {
      e = t - r.start;
      f = clamp(e / DURATION[r.type], 0, 1);
      if (e > DURATION[r.type]) this.settleReaction();
    }
    const active = this.reaction?.type ?? null;

    // spin: inertia + dizziness
    if (!this.dragging) {
      this.spinVel *= Math.exp(-2.4 * dt);
      this.spinAngle += this.spinVel * dt;
    }
    const spinSpeed = Math.abs(this.spinVel);
    this.dizzy = damp(this.dizzy, clamp((spinSpeed - 2.5) / 6, 0, 1), spinSpeed > 2.5 ? 7 : 1.8, dt);
    const armOut = clamp(spinSpeed / 9, 0, 1) + (active === 'spin' ? Math.sin(Math.PI * f) : 0) + this.lift * 0.75;

    // fold morph
    this.fold = damp(this.fold, this.foldTarget, 4.2, dt);
    const fold = smooth(clamp(this.fold, 0, 1));

    // look target
    const look = new THREE.Vector2();
    const gameLookX = clamp((this.game.focusX - this.pos.x) * 0.45, -0.9, 0.9);
    if (this.game.playing) {
      look.set(gameLookX, clamp(this.game.focusY * 0.22, -0.4, 0.8));
    } else if (this.dizzy > 0.05) {
      look.set(Math.cos(t * 14), Math.sin(t * 14)).multiplyScalar(0.85 * this.dizzy);
    } else if (this.sleepy > 0.5) {
      look.set(0, -0.35);
    } else if (this.chores.focused) {
      if (this.chores.toEar) look.set(0.5, 0.1);
      else look.set(0.45, -0.35);
    } else if (presenting) {
      look.set(-0.6, 0.12);
    } else if (bored) {
      if (t > this.nextBored) {
        this.boredTarget.set((Math.random() * 2 - 1) * 0.8, (Math.random() * 2 - 1) * 0.5);
        this.nextBored = t + 1.6 + Math.random() * 2.2;
      }
      look.copy(this.boredTarget);
    } else {
      look.copy(ptr).multiplyScalar(0.95);
    }
    const lookRate = this.dizzy > 0.05 ? 40 : 10;
    this.look.x = damp(this.look.x, look.x, lookRate, dt);
    this.look.y = damp(this.look.y, look.y, lookRate, dt);

    // blink
    if (this.blinkStart < 0 && (t > this.nextBlink || this.pendingBlinks > 0)) {
      this.blinkStart = t;
      if (this.pendingBlinks > 0) this.pendingBlinks -= 1;
    }
    let blink = 0;
    if (this.blinkStart >= 0) {
      const p = (t - this.blinkStart) / 0.22;
      if (p >= 1) {
        this.blinkStart = -1;
        // occasional double-blink for life
        if (this.pendingBlinks === 0 && Math.random() < 0.22) this.pendingBlinks = 1;
        this.nextBlink = t + (this.pendingBlinks > 0 ? 0.28 : 2.0 + Math.random() * 2.8);
      } else {
        blink = smooth(p < 0.5 ? p * 2 : (1 - p) * 2);
      }
    }
    blink = Math.max(blink, this.sleepy * 0.74, this.dizzy * 0.2);

    // happiness
    const happyTarget =
      Math.max(active === 'wave' || active === 'jump' ? 1 : 0, this.chores.stamping && this.sleepy < 0.5 ? 0.8 : 0, this.hoverAmt * 0.25, fold * 0.45, presenting ? 0.35 : 0, this.lift * 0.6, this.happyBoost, this.game.over ? 0.7 : 0) *
      (1 - this.sleepy);
    this.happy = damp(this.happy, happyTarget, 6, dt);
    this.heartsAmt = damp(this.heartsAmt, active === 'wave' || (this.hoverAmt > 0.9 && idleFor > 2.5 && !gameOn) ? 1 : 0, active === 'wave' ? 8 : 3, dt);
    this.surpriseAmt = damp(this.surpriseAmt, this.lift > 0.5 || (active === 'jump' && f > 0.1 && f < 0.6) ? 1 : 0, 9, dt);
    this.face.draw(this.look, blink, this.happy * (1 - this.surpriseAmt), { hearts: this.heartsAmt, surprise: this.surpriseAmt, dizzy: this.dizzy, time: t });

    // head + antenna springs
    const yawTarget =
      this.game.playing ? gameLookX * 0.6 :
      (this.chores.focused ? (this.chores.toEar ? 0.22 : 0.3) : presenting ? -0.32 : bored ? this.boredTarget.x * 0.5 : ptr.x * 0.55) * (1 - this.sleepy) * motion;
    const pitchTarget =
      this.game.playing ? -0.28 :
      (this.chores.focused ? (this.chores.toEar ? -0.05 : 0.3) : presenting ? -0.05 : bored ? -this.boredTarget.y * 0.3 : -ptr.y * 0.3) * (1 - this.sleepy) * motion +
      this.sleepy * 0.32;
    rig.head.rotation.y = this.headYaw.step(yawTarget, dt) + fold * Math.sin(t * 0.5) * 0.3;
    rig.head.rotation.x = this.headPitch.step(pitchTarget, dt) + this.bubbles.nod(t) * Math.sin(t * 9) * 0.09;
    rig.head.rotation.z = -this.headYaw.value * 0.08;
    rig.antenna.rotation.z = this.antZ.step(-this.headYaw.vel * 0.05 - this.spinVel * 0.01, dt);
    rig.antenna.rotation.x = this.antX.step(this.headPitch.vel * 0.05, dt);

    // pick up & place: follow the drag, drop with a bounce, platform slides under him
    this.lift = damp(this.lift, this.dragging ? 1 : 0, 10, dt);
    const prevX = this.pos.x;
    this.pos.x = damp(this.pos.x, this.place.x, 22, dt);
    this.velX = damp(this.velX, (this.pos.x - prevX) / Math.max(dt, 1e-3), 12, dt);
    if (this.dragging) {
      this.pos.y = damp(this.pos.y, this.place.y, 22, dt);
      this.dropVel = 0;
    } else if (this.pos.y > 0 || this.dropVel !== 0) {
      this.dropVel -= 22 * dt;
      this.pos.y += this.dropVel * dt;
      if (this.pos.y <= 0) {
        this.pos.y = 0;
        if (this.dropVel < -1.2) {
          this.dropVel = -this.dropVel * 0.3;
          this.burst = Math.max(this.burst, 0.7);
        } else this.dropVel = 0;
      }
      this.place.y = 0;
    }
    const lifted = this.lift;

    // idle body motion
    const breath = Math.sin(t * 1.5) * 0.012 * motion;
    const bob = Math.sin(t * 1.3) * 0.05 * (1 - this.sleepy * 0.6) * motion;
    let y = bob;
    let sx = 1;
    let sy = 1;
    let reactionSpin = 0;
    this.burst = damp(this.burst, 0, 5, dt);

    if (active === 'jump') {
      const air = Math.sin(Math.PI * f);
      y += air * 0.9;
      const pre = f < 0.14 ? smooth((0.14 - f) / 0.14) : 0;
      sy = 1 + air * 0.1 - pre * 0.12;
      sx = 1 - air * 0.06 + pre * 0.08;
      if (f > 0.05 && f < 0.2) this.burst = 1;
    } else if (active === 'spin') {
      reactionSpin = Math.PI * 2 * easeInOut(f);
    }

    // automation vignettes (only while calm; items still get processed while asleep)
    const calm = !gameOn && !presenting && !active && fold < 0.05 && this.dizzy < 0.05 && !this.dragging && this.pos.y < 0.05 && spinSpeed < 0.5 && !this.hovered;
    const dozing = this.sleepy > 0.5;
    const handWorld = new THREE.Vector3();
    rig.armR.hand.getWorldPosition(handWorld);
    if (!calm) this.bubbles.stop();
    else if (!dozing && this.chores.idle && !this.bubbles.active && t > this.nextBubbles) {
      this.bubbles.begin(t);
      this.nextBubbles = t + 14 + Math.random() * 10;
    }
    this.bubbles.update(t);
    this.bubbles.group.position.set(this.pos.x, this.pos.y, 0);
    const choreEnergy = this.chores.update(t, dt, calm, handWorld, dozing, !this.bubbles.active, rig.root.position);
    this.catchAmt = damp(this.catchAmt, this.chores.catching, 12, dt);
    this.toEarAmt = damp(this.toEarAmt, this.chores.toEar ? 1 : 0, 12, dt);

    // game step: catches make him beam, misses make him blink
    const gameEv = this.game.update(t, dt, this.pos.x, this.opts.halfWidth(), this.opts.homeX());
    if (gameEv.caught > 0) {
      this.happyBoost = 1;
      this.burst = Math.max(this.burst, 0.6);
    }
    if (gameEv.missed > 0) this.pendingBlinks = Math.max(this.pendingBlinks, 1);
    this.happyBoost = damp(this.happyBoost, 0, 3, dt);

    // arms (targets are damped inside poseArm so interrupted gestures blend)
    const ready = this.gameAmt;
    this.poseArm(rig.armR, t, dt, armOut, active === 'wave' ? this.waveAmount(e) : 0, e, 0, Math.max(this.catchAmt, ready), this.toEarAmt * (1 - ready));
    this.poseArm(rig.armL, t, dt, armOut, 0, e, hp, ready, 0);

    // root transform
    rig.root.rotation.y = -0.22 * hp + this.spinAngle + reactionSpin;
    rig.root.rotation.z = -ptr.x * 0.04 * this.hoverAmt * motion * (1 - this.gameAmt) - clamp(this.velX * 0.06, -0.35, 0.35) * Math.max(lifted, this.gameAmt * 0.6);
    rig.root.rotation.x = -ptr.y * 0.03 * this.hoverAmt * motion;
    rig.root.position.x = this.pos.x;
    rig.platform.position.x = damp(rig.platform.position.x, this.pos.x, 6, dt);
    this.particles.points.position.x = damp(this.particles.points.position.x, this.pos.x, 4, dt);
    rig.legs.rotation.x = Math.sin(t * 6) * 0.14 * lifted;
    rig.basket.scale.setScalar(Math.max(0.001, this.gameAmt));
    rig.basket.rotation.z = -clamp(this.velX * 0.05, -0.25, 0.25) * this.gameAmt;
    this.rootY = damp(this.rootY, y + fold * Math.sin(t * 2) * 0.08, 24, dt);
    this.rootSx = damp(this.rootSx, sx, 24, dt);
    this.rootSy = damp(this.rootSy, sy, 24, dt);
    rig.root.position.y = this.rootY + this.pos.y;
    rig.root.scale.set(this.rootSx, this.rootSy, this.rootSx);

    // fold morph: limbs shrink into the head, head drops and floats as an orb
    const shrink = Math.max(0.001, 1 - fold);
    rig.torso.scale.set((1 - breath * 0.6) * shrink, (1 + breath) * shrink, (1 - breath * 0.6) * shrink);
    const headY = -fold * 1.5;
    rig.head.position.y = headY;
    rig.head.scale.setScalar(0.94 + fold * 0.14);
    rig.neck.scale.setScalar(shrink);
    rig.neck.position.y = lerp(-0.96, headY, fold);
    rig.torso.position.y = lerp(TORSO_Y, headY, fold);
    [rig.armL, rig.armR].forEach((arm) => {
      arm.shoulder.scale.setScalar(shrink);
      arm.shoulder.position.y = lerp(SHOULDER_Y, headY, fold);
    });
    rig.legs.scale.setScalar(shrink);
    rig.legs.position.y = lerp(0, headY + 2.7, fold);

    // ground shadow follows height
    const height = this.rootY + this.pos.y + fold * 0.3;
    rig.shadow.scale.setScalar(clamp(1 - height * 0.2 + fold * 0.1, 0.5, 1.3));
    (rig.shadow.material as THREE.MeshBasicMaterial).opacity = clamp(0.5 - height * 0.25, 0.15, 0.6);
    (rig.badgeGlow.material as THREE.SpriteMaterial).opacity = 0.08 + Math.sin(t * 2.2) * 0.03 + this.happy * 0.12;

    const energy = clamp(Math.max(hp, this.burst, armOut * 0.6, fold * 0.5, choreEnergy), 0, 1);
    this.particles.update(t, energy);
    this.hologram.update(hp, t);
  }

  private waveAmount(e: number): number {
    const dur = DURATION.wave;
    const inA = smooth(clamp(e / 0.25, 0, 1));
    const out = smooth(clamp((dur - e) / 0.3, 0, 1));
    return Math.min(inA, out);
  }

  private poseArm(arm: Arm, t: number, dt: number, out: number, wave: number, e: number, present: number, catching: number, toEar: number): void {
    const side = arm.side;
    const sway = Math.sin(t * 1.5 + side) * 0.03;
    const baseZ = side * (0.5 + out * 1.1 + sway);
    const raise = Math.max(wave, present);
    let z = lerp(baseZ, side * 2.3, wave) + (side < 0 ? side * present * 1.3 : 0);
    let x = -present * 0.25;
    let fx = lerp(-0.55 - out * 0.2, 0, raise) - present * 0.7;
    const fz = Math.sin(e * 16) * 0.45 * wave * side + present * 0.3 * side;
    // catching: arm comes forward and up, hand open toward the item; phone goes to the ear
    z = lerp(z, lerp(side * 0.06, side * 0.8, toEar), catching);
    x = lerp(x, lerp(-1.45, -2.25, toEar), catching);
    fx = lerp(fx, lerp(-0.2, -1.1, toEar), catching);
    const k = 18;
    arm.shoulder.rotation.x = damp(arm.shoulder.rotation.x, x, k, dt);
    arm.shoulder.rotation.z = damp(arm.shoulder.rotation.z, z, k, dt);
    arm.forearm.rotation.x = damp(arm.forearm.rotation.x, fx, k, dt);
    arm.forearm.rotation.z = damp(arm.forearm.rotation.z, fz, k * 1.5, dt);
  }
}
