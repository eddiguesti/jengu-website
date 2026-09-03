/**
 * Small number tweener for the result figures. Each key animates from the
 * value it currently shows to the new target; a fresh target mid-flight
 * retargets from wherever the animation got to.
 */

export const easeOutQuart = (p: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 4);

export const interpolate = (from: number, to: number, p: number): number => from + (to - from) * easeOutQuart(p);

export interface TweenOptions {
  duration?: number;
  /** Injected for tests; defaults to requestAnimationFrame + performance.now. */
  raf?: (cb: (t: number) => void) => number;
  now?: () => number;
}

export class Tweener {
  private readonly current = new Map<string, number>();
  private readonly targets = new Map<string, number>();
  private readonly starts = new Map<string, { from: number; at: number }>();
  private readonly listeners = new Map<string, (v: number) => void>();
  private readonly duration: number;
  private readonly raf: (cb: (t: number) => void) => number;
  private readonly now: () => number;
  private running = false;

  constructor(opts: TweenOptions = {}) {
    this.duration = opts.duration ?? 650;
    this.raf = opts.raf ?? ((cb) => requestAnimationFrame(cb));
    this.now = opts.now ?? (() => performance.now());
  }

  /** Register where a key's value should be written. */
  bind(key: string, write: (v: number) => void): void {
    this.listeners.set(key, write);
  }

  /** Animate `key` towards `to`. The first call sets it instantly. */
  set(key: string, to: number, instant = false): void {
    const write = this.listeners.get(key);
    if (!this.current.has(key) || instant || this.duration <= 0) {
      this.current.set(key, to);
      this.targets.set(key, to);
      this.starts.delete(key);
      write?.(to);
      return;
    }
    if (this.targets.get(key) === to) return;
    this.targets.set(key, to);
    this.starts.set(key, { from: this.current.get(key) ?? to, at: this.now() });
    this.kick();
  }

  /** Advance every running tween to time `t`. Returns true while any is still moving. */
  step(t: number): boolean {
    let busy = false;
    this.starts.forEach((start, key) => {
      const to = this.targets.get(key) ?? start.from;
      const p = (t - start.at) / this.duration;
      const v = p >= 1 ? to : interpolate(start.from, to, p);
      this.current.set(key, v);
      this.listeners.get(key)?.(v);
      if (p >= 1) this.starts.delete(key);
      else busy = true;
    });
    return busy;
  }

  private kick(): void {
    if (this.running) return;
    this.running = true;
    const tick = (t: number): void => {
      if (this.step(t)) this.raf(tick);
      else this.running = false;
    };
    this.raf(tick);
  }
}
