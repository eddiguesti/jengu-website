/**
 * ROI estimate model. Pure arithmetic over the visitor's own inputs and a set
 * of visible, editable assumptions. It contains no benchmark data of its own:
 * every figure the page shows can be traced to something the visitor typed
 * or an assumption they can change.
 */

export type PropertyType = 'hotel' | 'resort' | 'campsite' | 'park' | 'tour' | 'other';
export type PropertySize = 'small' | 'medium' | 'large';

export interface Agents {
  messaging: boolean;
  phone: boolean;
  pricing: boolean;
  integrations: boolean;
}

export interface Inputs {
  propertyType: PropertyType;
  /** Rooms, pitches or bookable units. */
  units: number;
  /** Average price per night, in the visitor's currency. */
  nightlyRate: number;
  /** 0..100 */
  occupancy: number;
  /** Guest messages per day across email, chat, WhatsApp. */
  messagesPerDay: number;
  /** Inbound phone calls per day. */
  callsPerDay: number;
  /** Hours per week the team spends on repetitive admin and retyping. */
  adminHoursPerWeek: number;
  /** Fully loaded cost of an hour of staff time. */
  hourlyCost: number;
  /** Count freed staff hours as cash. Off means they stay capacity, not savings. */
  hoursAsCash: boolean;
  agents: Agents;
}

export interface Assumptions {
  minutesPerMessage: number;
  /** 0..1 share of messages an agent resolves without a person. */
  messagingShare: number;
  minutesPerCall: number;
  /** 0..1 share of calls the team currently misses. */
  callsMissedShare: number;
  /** 0..1 share of answered enquiry calls that turn into a booking. */
  callBookingRate: number;
  /** 0..1 share of calls an agent handles end to end. */
  callShare: number;
  /** Average length of stay in nights, to turn a rate into a booking value. */
  avgStayNights: number;
  /** 0..1 uplift on room revenue from dynamic pricing. */
  pricingUplift: number;
  /** 0..1 share of the uplift Jengu charges as its performance fee. */
  pricingFeeShare: number;
  /** 0..1 share of admin hours removed by integrations. */
  integrationsShare: number;
  /** Monthly fee from the visitor's quote. Zero until they have one. */
  monthlyFee: number;
  /** One-off setup from the visitor's quote. Zero until they have one. */
  setupFee: number;
  /** Months until an agent delivers its full effect; month 1 delivers 1/ramp. */
  rampMonths: number;
}

export interface LineItem {
  key: keyof Agents;
  label: string;
  hoursPerMonth: number;
  costSavedPerMonth: number;
  revenuePerMonth: number;
}

export interface MonthPoint {
  month: number;
  /** Benefit earned in this month after ramp-up. */
  benefit: number;
  cumulativeBenefit: number;
  /** Cumulative benefit less monthly fees and the setup fee. */
  cumulativeNet: number;
}

export interface Range {
  low: number;
  high: number;
}

export interface Results {
  lines: LineItem[];
  hoursPerMonth: number;
  hoursPerWeek: number;
  costSavedPerMonth: number;
  revenuePerMonth: number;
  /** Revenue plus, when hours count as cash, staff cost saved. At full effect. */
  monthlyBenefit: number;
  annualBenefit: number;
  /** Monthly benefit under cautious and generous versions of the share assumptions. */
  range: Range;
  /** Twelve months from go-live, with ramp-up and fees. */
  monthly: MonthPoint[];
  monthlyFee: number;
  setupFee: number;
  netMonthly: number;
  /** First month in which cumulative net gain covers the setup fee; null if it never does within three years. */
  paybackMonths: number | null;
  roomRevenuePerMonth: number;
}

export const DAYS_PER_MONTH = 30.4;
export const WEEKS_PER_MONTH = 4.33;

export const DEFAULT_ASSUMPTIONS: Assumptions = Object.freeze({
  minutesPerMessage: 4,
  messagingShare: 0.6,
  minutesPerCall: 6,
  callsMissedShare: 0.15,
  callBookingRate: 0.2,
  callShare: 0.5,
  avgStayNights: 2.5,
  pricingUplift: 0.05,
  pricingFeeShare: 0.15,
  integrationsShare: 0.6,
  monthlyFee: 0,
  setupFee: 0,
  rampMonths: 3,
});

export const DEFAULT_INPUTS: Inputs = Object.freeze({
  propertyType: 'hotel',
  units: 40,
  nightlyRate: 120,
  occupancy: 70,
  messagesPerDay: 40,
  callsPerDay: 15,
  adminHoursPerWeek: 10,
  hourlyCost: 14,
  hoursAsCash: true,
  agents: Object.freeze({ messaging: true, phone: true, pricing: false, integrations: false }),
}) as Inputs;

/** Starting points per property type: a typical nightly price and occupancy. */
export const TYPE_PRESETS: Record<PropertyType, { nightlyRate: number; occupancy: number }> = {
  hotel: { nightlyRate: 120, occupancy: 70 },
  resort: { nightlyRate: 220, occupancy: 65 },
  campsite: { nightlyRate: 45, occupancy: 55 },
  park: { nightlyRate: 90, occupancy: 60 },
  tour: { nightlyRate: 180, occupancy: 60 },
  other: { nightlyRate: 100, occupancy: 65 },
};

/** Units per size band, per property type. */
export const SIZE_PRESETS: Record<PropertyType, Record<PropertySize, number>> = {
  hotel: { small: 20, medium: 60, large: 150 },
  resort: { small: 40, medium: 120, large: 300 },
  campsite: { small: 60, medium: 150, large: 400 },
  park: { small: 60, medium: 150, large: 400 },
  tour: { small: 8, medium: 20, large: 50 },
  other: { small: 20, medium: 60, large: 150 },
};

/** Workload starting points scale with the size band. */
export const WORKLOAD_PRESETS: Record<PropertySize, { messagesPerDay: number; callsPerDay: number; adminHoursPerWeek: number }> = {
  small: { messagesPerDay: 20, callsPerDay: 8, adminHoursPerWeek: 6 },
  medium: { messagesPerDay: 45, callsPerDay: 18, adminHoursPerWeek: 12 },
  large: { messagesPerDay: 110, callsPerDay: 40, adminHoursPerWeek: 25 },
};

/** Everything a type and size band imply, as a partial set of inputs. */
export function presetFor(type: PropertyType, size: PropertySize): Partial<Inputs> {
  return { ...TYPE_PRESETS[type], units: SIZE_PRESETS[type][size], ...WORKLOAD_PRESETS[size] };
}

/** Kept for the home page estimate, which only knows the type. */
export const PRESETS: Record<PropertyType, Partial<Inputs>> = Object.fromEntries(
  (Object.keys(TYPE_PRESETS) as PropertyType[]).map((t) => [t, presetFor(t, 'medium')])
) as Record<PropertyType, Partial<Inputs>>;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
const share = (v: number): number => clamp(v, 0, 1);
const nonNeg = (v: number): number => clamp(v, 0, Number.POSITIVE_INFINITY);

/** Clamp every input into a sane range so the maths never explodes on odd values. */
export function sanitiseInputs(raw: Inputs): Inputs {
  return {
    ...raw,
    units: clamp(raw.units, 1, 5000),
    nightlyRate: clamp(raw.nightlyRate, 1, 10000),
    occupancy: clamp(raw.occupancy, 0, 100),
    messagesPerDay: clamp(raw.messagesPerDay, 0, 5000),
    callsPerDay: clamp(raw.callsPerDay, 0, 2000),
    adminHoursPerWeek: clamp(raw.adminHoursPerWeek, 0, 400),
    hourlyCost: clamp(raw.hourlyCost, 1, 500),
    agents: { ...raw.agents },
  };
}

export function sanitiseAssumptions(raw: Assumptions): Assumptions {
  return {
    minutesPerMessage: clamp(raw.minutesPerMessage, 0, 60),
    messagingShare: share(raw.messagingShare),
    minutesPerCall: clamp(raw.minutesPerCall, 0, 60),
    callsMissedShare: share(raw.callsMissedShare),
    callBookingRate: share(raw.callBookingRate),
    callShare: share(raw.callShare),
    avgStayNights: clamp(raw.avgStayNights, 0.5, 60),
    pricingUplift: share(raw.pricingUplift),
    pricingFeeShare: share(raw.pricingFeeShare),
    integrationsShare: share(raw.integrationsShare),
    monthlyFee: nonNeg(raw.monthlyFee),
    setupFee: nonNeg(raw.setupFee),
    rampMonths: clamp(raw.rampMonths, 1, 12),
  };
}

/** Scale every share-type assumption by k, for the cautious and generous cases. */
export function scaleShares(a: Assumptions, k: number): Assumptions {
  return sanitiseAssumptions({
    ...a,
    messagingShare: a.messagingShare * k,
    callShare: a.callShare * k,
    callsMissedShare: a.callsMissedShare * k,
    callBookingRate: a.callBookingRate * k,
    pricingUplift: a.pricingUplift * k,
    integrationsShare: a.integrationsShare * k,
  });
}

/** Share of full effect delivered in a given month (1-based). */
export const rampFactor = (month: number, rampMonths: number): number => Math.min(1, month / Math.max(1, rampMonths));

export const HORIZON_MONTHS = 12;
const PAYBACK_HORIZON_MONTHS = 36;
export const CAUTIOUS = 0.7;
export const GENEROUS = 1.25;

export function roomRevenuePerMonth(i: Inputs): number {
  return i.units * i.nightlyRate * (i.occupancy / 100) * DAYS_PER_MONTH;
}

function messagingLine(i: Inputs, a: Assumptions): LineItem {
  const hours = (i.messagesPerDay * DAYS_PER_MONTH * a.minutesPerMessage * a.messagingShare) / 60;
  return { key: 'messaging', label: 'Guest messages', hoursPerMonth: hours, costSavedPerMonth: hours * i.hourlyCost, revenuePerMonth: 0 };
}

function phoneLine(i: Inputs, a: Assumptions): LineItem {
  const callsPerMonth = i.callsPerDay * DAYS_PER_MONTH;
  const hours = (callsPerMonth * a.minutesPerCall * a.callShare) / 60;
  const bookingValue = i.nightlyRate * a.avgStayNights;
  const recovered = callsPerMonth * a.callsMissedShare * a.callBookingRate * bookingValue;
  return { key: 'phone', label: 'Phone bookings', hoursPerMonth: hours, costSavedPerMonth: hours * i.hourlyCost, revenuePerMonth: recovered };
}

function pricingLine(i: Inputs, a: Assumptions): LineItem {
  const gross = roomRevenuePerMonth(i) * a.pricingUplift;
  const net = gross * (1 - a.pricingFeeShare);
  return { key: 'pricing', label: 'Dynamic pricing (net of fee)', hoursPerMonth: 0, costSavedPerMonth: 0, revenuePerMonth: net };
}

function integrationsLine(i: Inputs, a: Assumptions): LineItem {
  const hours = i.adminHoursPerWeek * WEEKS_PER_MONTH * a.integrationsShare;
  return { key: 'integrations', label: 'Integrations and admin', hoursPerMonth: hours, costSavedPerMonth: hours * i.hourlyCost, revenuePerMonth: 0 };
}

interface Tally {
  lines: LineItem[];
  hoursPerMonth: number;
  costSavedPerMonth: number;
  revenuePerMonth: number;
  benefit: number;
}

function tally(i: Inputs, a: Assumptions): Tally {
  const candidates: Array<[keyof Agents, (x: Inputs, y: Assumptions) => LineItem]> = [
    ['messaging', messagingLine],
    ['phone', phoneLine],
    ['pricing', pricingLine],
    ['integrations', integrationsLine],
  ];
  const lines = candidates.filter(([key]) => i.agents[key]).map(([, fn]) => fn(i, a));
  const hoursPerMonth = lines.reduce((s, l) => s + l.hoursPerMonth, 0);
  const costSavedPerMonth = lines.reduce((s, l) => s + l.costSavedPerMonth, 0);
  const revenuePerMonth = lines.reduce((s, l) => s + l.revenuePerMonth, 0);
  const benefit = revenuePerMonth + (i.hoursAsCash ? costSavedPerMonth : 0);
  return { lines, hoursPerMonth, costSavedPerMonth, revenuePerMonth, benefit };
}

function projection(benefit: number, a: Assumptions, monthlyFee: number, setupFee: number, months: number): MonthPoint[] {
  const out: MonthPoint[] = [];
  let cumulativeBenefit = 0;
  let cumulativeNet = -setupFee;
  for (let month = 1; month <= months; month++) {
    const earned = benefit * rampFactor(month, a.rampMonths);
    cumulativeBenefit += earned;
    cumulativeNet += earned - monthlyFee;
    out.push({ month, benefit: earned, cumulativeBenefit, cumulativeNet });
  }
  return out;
}

function paybackFrom(benefit: number, a: Assumptions, monthlyFee: number, setupFee: number, active: boolean): number | null {
  if (!active || benefit - monthlyFee <= 0) return null;
  if (setupFee <= 0) return 0;
  const hit = projection(benefit, a, monthlyFee, setupFee, PAYBACK_HORIZON_MONTHS).find((p) => p.cumulativeNet >= 0);
  return hit ? hit.month : null;
}

export function compute(rawInputs: Inputs, rawAssumptions: Assumptions = DEFAULT_ASSUMPTIONS): Results {
  const i = sanitiseInputs(rawInputs);
  const a = sanitiseAssumptions(rawAssumptions);

  const base = tally(i, a);
  const low = tally(i, scaleShares(a, CAUTIOUS));
  const high = tally(i, scaleShares(a, GENEROUS));
  const active = base.lines.length > 0;
  const monthlyFee = active ? a.monthlyFee : 0;
  const setupFee = active ? a.setupFee : 0;
  const netMonthly = base.benefit - monthlyFee;

  return {
    lines: base.lines,
    hoursPerMonth: base.hoursPerMonth,
    hoursPerWeek: base.hoursPerMonth / WEEKS_PER_MONTH,
    costSavedPerMonth: base.costSavedPerMonth,
    revenuePerMonth: base.revenuePerMonth,
    monthlyBenefit: base.benefit,
    annualBenefit: base.benefit * 12,
    range: { low: low.benefit, high: high.benefit },
    monthly: projection(base.benefit, a, monthlyFee, setupFee, HORIZON_MONTHS),
    monthlyFee,
    setupFee,
    netMonthly,
    paybackMonths: paybackFrom(base.benefit, a, monthlyFee, setupFee, active),
    roomRevenuePerMonth: roomRevenuePerMonth(i),
  };
}

/** Projection under the cautious or generous case, for chart bands. */
export function projectionFor(rawInputs: Inputs, rawAssumptions: Assumptions, k: number): MonthPoint[] {
  const i = sanitiseInputs(rawInputs);
  const a = scaleShares(sanitiseAssumptions(rawAssumptions), k);
  const t = tally(i, a);
  const active = t.lines.length > 0;
  return projection(t.benefit, a, active ? a.monthlyFee : 0, active ? a.setupFee : 0, HORIZON_MONTHS);
}

/** Compact currency formatting for the UI: 1,234 → "1,234"; 12345 → "12,345". */
export function formatMoney(value: number, symbol = '£'): string {
  const rounded = Math.round(value);
  return `${symbol}${rounded.toLocaleString('en-GB')}`;
}

export function formatHours(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(value >= 10 ? 0 : 1);
}

/** Short money for axes and tiles: £950, £61k, £1.2m. */
export function formatCompact(value: number, symbol = '£'): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}${symbol}${Math.round(abs)}`;
}
