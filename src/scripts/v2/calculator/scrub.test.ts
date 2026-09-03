import { describe, expect, it } from 'vitest';
import { parseTyped, rangeFromAttrs, SCRUB_TRAVEL_PX, snapToStep, valueFromDrag } from './scrub';

const units = { min: 1, max: 601, step: 1 };

describe('snapToStep', () => {
  it('rounds to whole steps and keeps fractional steps tidy', () => {
    expect(snapToStep(41.4, 1)).toBe(41);
    expect(snapToStep(41.6, 1)).toBe(42);
    expect(snapToStep(122, 5)).toBe(120);
    expect(snapToStep(2.26, 0.5)).toBe(2.5);
    expect(snapToStep(0.1 + 0.2, 0.1)).toBe(0.3);
  });
  it('leaves the value alone for a non-positive step', () => {
    expect(snapToStep(3.3, 0)).toBe(3.3);
  });
});

describe('valueFromDrag', () => {
  it('sweeps the whole range across the travel distance', () => {
    expect(valueFromDrag(1, SCRUB_TRAVEL_PX, units)).toBe(601);
    expect(valueFromDrag(601, -SCRUB_TRAVEL_PX, units)).toBe(1);
  });
  it('clamps at both ends', () => {
    expect(valueFromDrag(600, 5000, units)).toBe(601);
    expect(valueFromDrag(2, -5000, units)).toBe(1);
  });
  it('moves five times more slowly in fine mode', () => {
    const coarse = valueFromDrag(100, 100, units);
    const fine = valueFromDrag(100, 100, units, true);
    expect(coarse - 100).toBeCloseTo((fine - 100) * 5, 0);
  });
  it('does not move for a zero drag', () => {
    expect(valueFromDrag(40, 0, units)).toBe(40);
  });
});

describe('parseTyped', () => {
  it('accepts digits with stray currency marks', () => {
    expect(parseTyped('£1,250', 0, { min: 0, max: 5000, step: 5 })).toBe(1250);
  });
  it('falls back to the previous value on nonsense', () => {
    expect(parseTyped('abc', 40, units)).toBe(40);
    expect(parseTyped('', 40, units)).toBe(40);
  });
  it('clamps typed values into range', () => {
    expect(parseTyped('9999', 40, units)).toBe(601);
  });
});

describe('rangeFromAttrs', () => {
  it('reads attributes and fills gaps', () => {
    expect(rangeFromAttrs('0', '100', '1')).toEqual({ min: 0, max: 100, step: 1 });
    expect(rangeFromAttrs(null, null, null)).toEqual({ min: 0, max: 100, step: 1 });
    expect(rangeFromAttrs('10', '5', '0')).toEqual({ min: 10, max: 10, step: 0.0001 });
  });
});
