import { describe, expect, it } from 'vitest';
import {
  compute,
  DAYS_PER_MONTH,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_INPUTS,
  formatHours,
  formatMoney,
  roomRevenuePerMonth,
  sanitiseAssumptions,
  sanitiseInputs,
  WEEKS_PER_MONTH,
  type Inputs,
} from './model';

const withAgents = (agents: Partial<Inputs['agents']>): Inputs => ({
  ...DEFAULT_INPUTS,
  agents: { messaging: false, phone: false, pricing: false, integrations: false, ...agents },
});

describe('messaging line', () => {
  it('turns messages per day into hours and cost from the visible assumptions', () => {
    const r = compute(withAgents({ messaging: true }));
    const expectedHours = (40 * DAYS_PER_MONTH * 4 * 0.6) / 60;
    expect(r.lines).toHaveLength(1);
    expect(r.hoursPerMonth).toBeCloseTo(expectedHours, 6);
    expect(r.costSavedPerMonth).toBeCloseTo(expectedHours * 14, 6);
    expect(r.revenuePerMonth).toBe(0);
  });
});

describe('phone line', () => {
  it('recovers revenue only from calls that are currently missed', () => {
    const r = compute(withAgents({ phone: true }));
    const calls = 15 * DAYS_PER_MONTH;
    const a = DEFAULT_ASSUMPTIONS;
    const expectedRevenue = calls * a.callsMissedShare * a.callBookingRate * (120 * a.avgStayNights);
    expect(r.revenuePerMonth).toBeCloseTo(expectedRevenue, 6);
    expect(r.hoursPerMonth).toBeCloseTo((calls * a.minutesPerCall * a.callShare) / 60, 6);
  });

  it('recovers nothing when no calls are missed', () => {
    const r = compute(withAgents({ phone: true }), { ...DEFAULT_ASSUMPTIONS, callsMissedShare: 0 });
    expect(r.revenuePerMonth).toBe(0);
  });
});

describe('pricing line', () => {
  it('applies the uplift to room revenue and takes the fee off', () => {
    const r = compute(withAgents({ pricing: true }));
    const room = roomRevenuePerMonth(DEFAULT_INPUTS);
    expect(room).toBeCloseTo(40 * 120 * 0.7 * DAYS_PER_MONTH, 6);
    expect(r.revenuePerMonth).toBeCloseTo(room * 0.05 * 0.85, 6);
    expect(r.hoursPerMonth).toBe(0);
  });
});

describe('integrations line', () => {
  it('removes a share of weekly admin hours', () => {
    const r = compute(withAgents({ integrations: true }));
    expect(r.hoursPerMonth).toBeCloseTo(10 * WEEKS_PER_MONTH * 0.6, 6);
  });
});

describe('totals and payback', () => {
  it('sums the chosen lines and computes payback from net monthly gain', () => {
    const r = compute(DEFAULT_INPUTS, { ...DEFAULT_ASSUMPTIONS, monthlyFee: 750, setupFee: 5000 });
    const sum = r.lines.reduce((s, l) => s + l.costSavedPerMonth + l.revenuePerMonth, 0);
    expect(r.monthlyBenefit).toBeCloseTo(sum, 6);
    expect(r.annualBenefit).toBeCloseTo(sum * 12, 6);
    expect(r.netMonthly).toBeCloseTo(sum - 750, 6);
    expect(r.paybackMonths).toBe(Math.ceil(5000 / (sum - 750)));
    expect(r.hoursPerWeek).toBeCloseTo(r.hoursPerMonth / WEEKS_PER_MONTH, 6);
  });

  it('charges nothing and returns zeros when no agent is selected', () => {
    const r = compute(withAgents({}));
    expect(r.lines).toHaveLength(0);
    expect(r.monthlyBenefit).toBe(0);
    expect(r.monthlyFee).toBe(0);
    expect(r.setupFee).toBe(0);
    expect(r.paybackMonths).toBeNull();
  });

  it('reports no payback when the fee exceeds the benefit', () => {
    const r = compute(withAgents({ messaging: true }), { ...DEFAULT_ASSUMPTIONS, monthlyFee: 1_000_000 });
    expect(r.netMonthly).toBeLessThan(0);
    expect(r.paybackMonths).toBeNull();
  });

  it('reports immediate payback when there is no setup fee', () => {
    const r = compute(DEFAULT_INPUTS, { ...DEFAULT_ASSUMPTIONS, monthlyFee: 100, setupFee: 0 });
    expect(r.paybackMonths).toBe(0);
  });

  it('starts with no fees at all, so nothing on the page is a price we invented', () => {
    expect(DEFAULT_ASSUMPTIONS.monthlyFee).toBe(0);
    expect(DEFAULT_ASSUMPTIONS.setupFee).toBe(0);
    const r = compute(DEFAULT_INPUTS);
    expect(r.netMonthly).toBe(r.monthlyBenefit);
  });
});

describe('sanitising', () => {
  it('clamps absurd inputs and shares', () => {
    const i = sanitiseInputs({ ...DEFAULT_INPUTS, units: -5, occupancy: 140, hourlyCost: Number.NaN });
    expect(i.units).toBe(1);
    expect(i.occupancy).toBe(100);
    expect(i.hourlyCost).toBe(1);
    const a = sanitiseAssumptions({ ...DEFAULT_ASSUMPTIONS, messagingShare: 3, pricingUplift: -1, setupFee: -100 });
    expect(a.messagingShare).toBe(1);
    expect(a.pricingUplift).toBe(0);
    expect(a.setupFee).toBe(0);
  });

  it('does not mutate its inputs', () => {
    const original = { ...DEFAULT_INPUTS, agents: { ...DEFAULT_INPUTS.agents } };
    compute(original);
    expect(original).toEqual(DEFAULT_INPUTS);
  });
});

describe('formatting', () => {
  it('formats money and hours for the UI', () => {
    expect(formatMoney(1234.6)).toBe('£1,235');
    expect(formatMoney(999, '€')).toBe('€999');
    expect(formatHours(3.14159)).toBe('3.1');
    expect(formatHours(42.7)).toBe('43');
    expect(formatHours(123.4)).toBe('123');
  });
});
