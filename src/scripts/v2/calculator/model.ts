/**
 * ROI estimate model. Pure arithmetic over the visitor's own inputs and a set
 * of visible, editable assumptions. It contains no benchmark data of its own:
 * every figure the page shows can be traced to something the visitor typed
 * or an assumption they can change.
 */

export type PropertyType = 'hotel' | 'resort' | 'campsite' | 'tour';

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
}

export interface LineItem {
  key: keyof Agents;
  label: string;
  hoursPerMonth: number;
  costSavedPerMonth: number;
  revenuePerMonth: number;
}

export interface Results {
  lines: LineItem[];
  hoursPerMonth: number;
  hoursPerWeek: number;
  costSavedPerMonth: number;
  revenuePerMonth: number;
  monthlyBenefit: number;
  annualBenefit: number;
  monthlyFee: number;
  setupFee: number;
  netMonthly: number;
  /** Months to earn back the setup fee from net monthly gain; null if never. */
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
  agents: Object.freeze({ messaging: true, phone: true, pricing: false, integrations: false }),
}) as Inputs;

/** Property-type presets for the input defaults (nothing else depends on type). */
export const PRESETS: Record<PropertyType, Partial<Inputs>> = {
  hotel: { units: 40, nightlyRate: 120, occupancy: 70, messagesPerDay: 40, callsPerDay: 15, adminHoursPerWeek: 10 },
  resort: { units: 120, nightlyRate: 220, occupancy: 65, messagesPerDay: 90, callsPerDay: 30, adminHoursPerWeek: 20 },
  campsite: { units: 150, nightlyRate: 45, occupancy: 55, messagesPerDay: 35, callsPerDay: 20, adminHoursPerWeek: 12 },
  tour: { units: 12, nightlyRate: 180, occupancy: 60, messagesPerDay: 30, callsPerDay: 10, adminHoursPerWeek: 8 },
};

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
  };
}

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

export function compute(rawInputs: Inputs, rawAssumptions: Assumptions = DEFAULT_ASSUMPTIONS): Results {
  const i = sanitiseInputs(rawInputs);
  const a = sanitiseAssumptions(rawAssumptions);

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
  const monthlyBenefit = costSavedPerMonth + revenuePerMonth;
  const monthlyFee = lines.length ? a.monthlyFee : 0;
  const setupFee = lines.length ? a.setupFee : 0;
  const netMonthly = monthlyBenefit - monthlyFee;
  const paybackMonths = netMonthly > 0 && setupFee > 0 ? Math.ceil(setupFee / netMonthly) : netMonthly > 0 ? 0 : null;

  return {
    lines,
    hoursPerMonth,
    hoursPerWeek: hoursPerMonth / WEEKS_PER_MONTH,
    costSavedPerMonth,
    revenuePerMonth,
    monthlyBenefit,
    annualBenefit: monthlyBenefit * 12,
    monthlyFee,
    setupFee,
    netMonthly,
    paybackMonths,
    roomRevenuePerMonth: roomRevenuePerMonth(i),
  };
}

/** Compact currency formatting for the UI: 1,234 → "1,234"; 12345 → "12,345". */
export function formatMoney(value: number, symbol = '£'): string {
  const rounded = Math.round(value);
  return `${symbol}${rounded.toLocaleString('en-GB')}`;
}

export function formatHours(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(value >= 10 ? 0 : 1);
}
