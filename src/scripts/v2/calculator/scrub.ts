/**
 * Pure helpers for the drag-to-change number fields. Kept free of DOM so the
 * arithmetic can be tested on its own.
 */

export interface ScrubRange {
  min: number;
  max: number;
  step: number;
}

/** Pixels of horizontal drag that sweep the whole range. */
export const SCRUB_TRAVEL_PX = 520;

/** Round `value` to the nearest multiple of `step` (step may be fractional). */
export function snapToStep(value: number, step: number): number {
  if (!(step > 0)) return value;
  const snapped = Math.round(value / step) * step;
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(snapped.toFixed(decimals));
}

/** Value after dragging `dx` pixels from `startValue`. Clamped and snapped. */
export function valueFromDrag(startValue: number, dx: number, range: ScrubRange, fine = false): number {
  const span = Math.max(range.step, range.max - range.min);
  const perPx = (span / SCRUB_TRAVEL_PX) * (fine ? 0.2 : 1);
  const raw = startValue + dx * perPx;
  const clamped = Math.min(range.max, Math.max(range.min, raw));
  return snapToStep(clamped, range.step);
}

/** Parse what the visitor typed; fall back to the previous value if it is nonsense. */
export function parseTyped(text: string, previous: number, range: ScrubRange): number {
  const cleaned = text.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  if (cleaned === '' || !Number.isFinite(n)) return previous;
  return snapToStep(Math.min(range.max, Math.max(range.min, n)), range.step);
}

/** Read a range off an input's attributes with safe fallbacks. */
export function rangeFromAttrs(min: string | null, max: string | null, step: string | null): ScrubRange {
  const toNum = (v: string | null, fallback: number): number => {
    const n = Number(v);
    return v !== null && v !== '' && Number.isFinite(n) ? n : fallback;
  };
  const lo = toNum(min, 0);
  const hi = toNum(max, lo + 100);
  return { min: lo, max: Math.max(lo, hi), step: Math.max(0.0001, toNum(step, 1)) };
}
