import { describe, expect, it } from 'vitest';
import { easeOutQuart, interpolate, Tweener } from './tween';

describe('easing', () => {
  it('starts at 0, ends at 1, and clamps outside', () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
    expect(easeOutQuart(-1)).toBe(0);
    expect(easeOutQuart(2)).toBe(1);
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.5);
  });
  it('interpolates between two values', () => {
    expect(interpolate(0, 100, 0)).toBe(0);
    expect(interpolate(0, 100, 1)).toBe(100);
  });
});

function makeTweener(duration = 100) {
  const frames: Array<(t: number) => void> = [];
  let clock = 0;
  const t = new Tweener({
    duration,
    raf: (cb) => {
      frames.push(cb);
      return frames.length;
    },
    now: () => clock,
  });
  const tickTo = (time: number): void => {
    clock = time;
    const pending = frames.splice(0, frames.length);
    pending.forEach((cb) => cb(time));
  };
  return { t, tickTo, frames };
}

describe('Tweener', () => {
  it('writes the first value instantly', () => {
    const { t, frames } = makeTweener();
    const seen: number[] = [];
    t.bind('x', (v) => seen.push(v));
    t.set('x', 42);
    expect(seen).toEqual([42]);
    expect(frames).toHaveLength(0);
  });

  it('animates later values over the duration and lands exactly', () => {
    const { t, tickTo } = makeTweener(100);
    const seen: number[] = [];
    t.bind('x', (v) => seen.push(v));
    t.set('x', 0);
    t.set('x', 100);
    tickTo(50);
    expect(seen.at(-1)).toBeGreaterThan(50);
    expect(seen.at(-1)).toBeLessThan(100);
    tickTo(100);
    expect(seen.at(-1)).toBe(100);
    tickTo(200);
    expect(seen.at(-1)).toBe(100);
  });

  it('retargets mid-flight from the current value', () => {
    const { t, tickTo } = makeTweener(100);
    const seen: number[] = [];
    t.bind('x', (v) => seen.push(v));
    t.set('x', 0);
    t.set('x', 100);
    tickTo(50);
    const mid = seen.at(-1) ?? 0;
    t.set('x', 0);
    tickTo(51);
    expect(seen.at(-1)).toBeLessThanOrEqual(mid);
    tickTo(200);
    expect(seen.at(-1)).toBe(0);
  });

  it('ignores a repeated target', () => {
    const { t, frames } = makeTweener(100);
    t.bind('x', () => undefined);
    t.set('x', 5);
    t.set('x', 9);
    const queued = frames.length;
    t.set('x', 9);
    expect(frames.length).toBe(queued);
  });
});
