import { describe, expect, it } from 'vitest';
import { explainLines, lineSummary } from './explain';
import { compute, DEFAULT_ASSUMPTIONS, DEFAULT_INPUTS, formatMoney } from './model';

describe('explainLines', () => {
  const r = compute(DEFAULT_INPUTS);
  const e = explainLines(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS);

  it('ends each sentence on the same figure the model produces', () => {
    const msg = r.lines.find((l) => l.key === 'messaging');
    const phone = r.lines.find((l) => l.key === 'phone');
    expect(msg && e.messaging).toContain(formatMoney(msg!.costSavedPerMonth));
    expect(phone && e.phone).toContain(formatMoney(phone!.revenuePerMonth));
  });

  it('shows the visitor’s own inputs in the working', () => {
    expect(e.messaging).toContain('40 messages a day');
    expect(e.phone).toContain('15 calls a day');
    expect(e.pricing).toContain('40 units');
    expect(e.integrations).toContain('10 hours a week');
  });

  it('uses the chosen currency symbol', () => {
    const euro = explainLines(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS, '€');
    expect(euro.messaging).toContain('€');
    expect(euro.messaging).not.toContain('£');
  });

  it('contains no dashes', () => {
    Object.values(e).forEach((s) => expect(s).not.toMatch(/[—–]/));
  });
});

describe('lineSummary', () => {
  it('reads "off" for a missing line and combines hours and money otherwise', () => {
    expect(lineSummary(undefined)).toBe('off');
    expect(lineSummary({ key: 'messaging', label: 'x', hoursPerMonth: 48.6, costSavedPerMonth: 680.4, revenuePerMonth: 0 })).toBe('49 h · £680');
    expect(lineSummary({ key: 'pricing', label: 'x', hoursPerMonth: 0, costSavedPerMonth: 0, revenuePerMonth: 4341 }, '€')).toBe('€4,341');
  });
});
