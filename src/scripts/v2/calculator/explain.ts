/**
 * Turns the model's arithmetic into sentences that show the working with the
 * visitor's own numbers, so nothing on the page reads as a black box.
 */
import {
  DAYS_PER_MONTH,
  WEEKS_PER_MONTH,
  formatHours,
  formatMoney,
  roomRevenuePerMonth,
  sanitiseAssumptions,
  sanitiseInputs,
  type Agents,
  type Assumptions,
  type Inputs,
  type LineItem,
} from './model';

const pct = (v: number): string => `${Math.round(v * 100)}%`;
const n = (v: number, digits = 0): string => v.toLocaleString('en-GB', { maximumFractionDigits: digits });

export type Explanations = Record<keyof Agents, string>;

/** One sentence per agent, using the sanitised inputs the model would use. */
export function explainLines(rawInputs: Inputs, rawAssumptions: Assumptions, symbol = '£'): Explanations {
  const i = sanitiseInputs(rawInputs);
  const a = sanitiseAssumptions(rawAssumptions);
  const money = (v: number): string => formatMoney(v, symbol);

  const msgHours = (i.messagesPerDay * DAYS_PER_MONTH * a.minutesPerMessage * a.messagingShare) / 60;
  const messaging =
    `${n(i.messagesPerDay)} messages a day × ${DAYS_PER_MONTH} days × ${n(a.minutesPerMessage, 1)} minutes × ${pct(a.messagingShare)} resolved by the agent ÷ 60 ` +
    `= ${formatHours(msgHours)} hours a month. At ${money(i.hourlyCost)} an hour that is ${money(msgHours * i.hourlyCost)} a month.`;

  const calls = i.callsPerDay * DAYS_PER_MONTH;
  const callHours = (calls * a.minutesPerCall * a.callShare) / 60;
  const bookingValue = i.nightlyRate * a.avgStayNights;
  const recovered = calls * a.callsMissedShare * a.callBookingRate * bookingValue;
  const phone =
    `${n(i.callsPerDay)} calls a day is ${n(calls)} a month. Time: × ${n(a.minutesPerCall, 1)} minutes × ${pct(a.callShare)} handled end to end ÷ 60 ` +
    `= ${formatHours(callHours)} hours, worth ${money(callHours * i.hourlyCost)}. Revenue: ${n(calls)} × ${pct(a.callsMissedShare)} currently missed × ${pct(a.callBookingRate)} that would have booked ` +
    `× a stay worth ${money(bookingValue)} (${money(i.nightlyRate)} × ${n(a.avgStayNights, 1)} nights) = ${money(recovered)} a month.`;

  const room = roomRevenuePerMonth(i);
  const gross = room * a.pricingUplift;
  const pricing =
    `${n(i.units)} units × ${money(i.nightlyRate)} × ${pct(i.occupancy / 100)} occupancy × ${DAYS_PER_MONTH} days = ${money(room)} of room revenue a month. ` +
    `× ${pct(a.pricingUplift)} uplift = ${money(gross)}, less our ${pct(a.pricingFeeShare)} share = ${money(gross * (1 - a.pricingFeeShare))} that stays with you.`;

  const adminHours = i.adminHoursPerWeek * WEEKS_PER_MONTH * a.integrationsShare;
  const integrations =
    `${n(i.adminHoursPerWeek)} hours a week × ${WEEKS_PER_MONTH} weeks × ${pct(a.integrationsShare)} removed = ${formatHours(adminHours)} hours a month, ` +
    `worth ${money(adminHours * i.hourlyCost)} at ${money(i.hourlyCost)} an hour.`;

  return { messaging, phone, pricing, integrations };
}

/** Short figure for an agent row: "49 h · £681" or just the money. */
export function lineSummary(line: LineItem | undefined, symbol = '£'): string {
  if (!line) return 'off';
  const money = formatMoney(line.costSavedPerMonth + line.revenuePerMonth, symbol);
  return line.hoursPerMonth > 0 ? `${formatHours(line.hoursPerMonth)} h · ${money}` : money;
}
