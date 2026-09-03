import { describe, expect, it } from 'vitest';
import { barPath, cumulativeChart, cumulativeTip, niceTicks, splitBars } from './charts';
import { CAUTIOUS, compute, DEFAULT_ASSUMPTIONS, DEFAULT_INPUTS, GENEROUS, projectionFor } from './model';

describe('niceTicks', () => {
  it('returns clean steps that cover the maximum', () => {
    expect(niceTicks(61250)).toEqual([0, 20000, 40000, 60000, 80000]);
    expect(niceTicks(950)).toEqual([0, 250, 500, 750, 1000]);
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});

describe('barPath', () => {
  it('rounds only the data end and is empty for zero width', () => {
    expect(barPath(0, 0, 0, 16, 4)).toBe('');
    const d = barPath(10, 5, 100, 16, 4);
    expect(d.startsWith('M10 5H106A4 4 0 0 1 110 9V17A4 4 0 0 1 106 21H10Z')).toBe(true);
  });
});

describe('cumulativeChart', () => {
  const a = { ...DEFAULT_ASSUMPTIONS, monthlyFee: 750, setupFee: 5000 };
  const r = compute(DEFAULT_INPUTS, a);
  const svg = cumulativeChart({
    base: r.monthly,
    low: projectionFor(DEFAULT_INPUTS, a, CAUTIOUS),
    high: projectionFor(DEFAULT_INPUTS, a, GENEROUS),
    setupFee: a.setupFee,
    payback: r.paybackMonths,
    symbol: '£',
  });

  it('draws a band, a line, twelve hover targets and the payback marker', () => {
    expect(svg).toContain('class="band"');
    expect(svg).toContain('class="line"');
    expect((svg.match(/class="hit"/g) ?? []).length).toBe(12);
    expect(svg).toContain(`Setup repaid in month ${r.paybackMonths}`);
    expect(svg).toContain('g--zero');
  });

  it('says so when the setup never repays', () => {
    const never = cumulativeChart({ base: r.monthly, low: r.monthly, high: r.monthly, setupFee: 5000, payback: null, symbol: '£' });
    expect(never).toContain('Does not repay');
  });

  it('escapes nothing dangerous into the tooltip', () => {
    expect(cumulativeTip(r.monthly[5], r.monthly[5], r.monthly[5], '€')).toMatch(/^Month 6 · €/);
  });
});

describe('splitBars', () => {
  const r = compute(DEFAULT_INPUTS);
  it('keeps one row per agent and marks the off ones', () => {
    const svg = splitBars({ lines: r.lines, on: DEFAULT_INPUTS.agents, hoursAsCash: true, symbol: '£' });
    expect((svg.match(/class="row/g) ?? []).length).toBe(4);
    expect((svg.match(/row--off/g) ?? []).length).toBe(2);
    expect(svg).toContain('Guest messages');
    expect(svg).toContain('data-tip="Phone bookings');
  });
  it('drops the staff-time segment when hours are not cash', () => {
    const svg = splitBars({ lines: r.lines, on: DEFAULT_INPUTS.agents, hoursAsCash: false, symbol: '£' });
    expect(svg).not.toContain('staff time');
  });
});
