/**
 * SVG chart builders for the calculator. Pure functions that return markup,
 * so they can be tested without a browser. Styling of text and gridlines
 * comes from CSS classes; only the data marks carry colour.
 */
import { formatCompact, formatMoney, type Agents, type LineItem, type MonthPoint } from './model';

/** One fixed hue per agent, validated for the ink surface. Never reassigned. */
export const AGENT_COLORS: Record<keyof Agents, string> = {
  messaging: '#2e7cff',
  phone: '#1f9a7d',
  pricing: '#9a6ae0',
  integrations: '#c2842a',
};

export const AGENT_LABELS: Record<keyof Agents, string> = {
  messaging: 'Guest messages',
  phone: 'Phone bookings',
  pricing: 'Dynamic pricing',
  integrations: 'Integrations',
};

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n: number): string => (Math.round(n * 100) / 100).toString();

/** Clean tick values from 0 up to at least `max`: 0, 2k, 4k, 6k. */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const rough = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * mag);
  const step = candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(Number(v.toFixed(10)));
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/** A bar rounded only on its data end (the right side), square at the baseline. */
export function barPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  if (w <= 0) return '';
  return `M${r2(x)} ${r2(y)}H${r2(x + w - rr)}A${r2(rr)} ${r2(rr)} 0 0 1 ${r2(x + w)} ${r2(y + rr)}V${r2(y + h - rr)}A${r2(rr)} ${r2(rr)} 0 0 1 ${r2(x + w - rr)} ${r2(y + h)}H${r2(x)}Z`;
}

export interface CumulativeOpts {
  base: MonthPoint[];
  low: MonthPoint[];
  high: MonthPoint[];
  setupFee: number;
  payback: number | null;
  symbol: string;
  width?: number;
  height?: number;
}

/**
 * Cumulative net gain over twelve months: a band for the cautious to generous
 * cases, a 2px line for the base case, a hairline at zero (setup repaid), and
 * a marked payback month. Hover targets are one rect per month.
 */
export function cumulativeChart(o: CumulativeOpts): string {
  const W = o.width ?? 560;
  const H = o.height ?? 250;
  const pad = { l: 52, r: 18, t: 18, b: 30 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = o.base.length;
  if (!n) return '';

  const values = [...o.base, ...o.low, ...o.high].map((p) => p.cumulativeNet);
  const maxV = Math.max(0, ...values);
  const minV = Math.min(0, ...values);
  const ticksUp = niceTicks(maxV || 1);
  const step = ticksUp[1] - ticksUp[0];
  const top = ticksUp[ticksUp.length - 1];
  const bottom = minV < 0 ? -Math.ceil(-minV / step) * step : 0;
  const ticks: number[] = [];
  for (let v = bottom; v <= top + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)));

  const x = (m: number): number => pad.l + ((m - 1) / (n - 1)) * iw;
  const y = (v: number): number => pad.t + ((top - v) / (top - bottom || 1)) * ih;

  const grid = ticks
    .map((t) => `<line class="g${t === 0 ? ' g--zero' : ''}" x1="${pad.l}" x2="${W - pad.r}" y1="${r2(y(t))}" y2="${r2(y(t))}"/>` +
      `<text class="tick" x="${pad.l - 8}" y="${r2(y(t) + 3.5)}" text-anchor="end">${esc(formatCompact(t, o.symbol))}</text>`)
    .join('');

  const xLabels = [1, 3, 6, 9, 12]
    .filter((m) => m <= n)
    .map((m) => `<text class="tick" x="${r2(x(m))}" y="${H - 8}" text-anchor="middle">${m === 1 ? 'Month 1' : m}</text>`)
    .join('');

  const line = o.base.map((p, i) => `${i ? 'L' : 'M'}${r2(x(p.month))} ${r2(y(p.cumulativeNet))}`).join('');
  const band =
    o.high.map((p, i) => `${i ? 'L' : 'M'}${r2(x(p.month))} ${r2(y(p.cumulativeNet))}`).join('') +
    [...o.low].reverse().map((p) => `L${r2(x(p.month))} ${r2(y(p.cumulativeNet))}`).join('') +
    'Z';

  const last = o.base[n - 1];
  const endLabel = `<text class="label" x="${r2(x(last.month) - 6)}" y="${r2(y(last.cumulativeNet) - 10)}" text-anchor="end">${esc(formatCompact(last.cumulativeNet, o.symbol))} after ${n} months</text>`;

  let marker = '';
  if (o.payback !== null && o.payback >= 1 && o.payback <= n) {
    const p = o.base[o.payback - 1];
    const cx = x(p.month);
    const cy = y(p.cumulativeNet);
    const anchor = p.month > n * 0.6 ? 'end' : 'start';
    const lx = anchor === 'end' ? cx - 12 : cx + 12;
    marker =
      `<circle class="mark-ring" cx="${r2(cx)}" cy="${r2(cy)}" r="7"/>` +
      `<circle class="mark" cx="${r2(cx)}" cy="${r2(cy)}" r="5" fill="${AGENT_COLORS.messaging}"/>` +
      `<text class="label label--strong" x="${r2(lx)}" y="${r2(cy + 4)}" text-anchor="${anchor}">Setup repaid in month ${p.month}</text>`;
  } else if (o.setupFee > 0 && o.payback === null) {
    marker = `<text class="label" x="${pad.l + 4}" y="${pad.t + 12}">Does not repay the setup within three years</text>`;
  }

  const slot = iw / (n - 1);
  const hover = o.base
    .map((p) => `<rect class="hit" data-m="${p.month}" data-x="${r2(x(p.month))}" data-y="${r2(y(p.cumulativeNet))}" x="${r2(x(p.month) - slot / 2)}" y="${pad.t}" width="${r2(slot)}" height="${ih}"/>`)
    .join('');
  const cross = `<g class="cross" hidden><line class="cross-line" y1="${pad.t}" y2="${pad.t + ih}"/><circle class="mark-ring" r="7"/><circle class="mark" r="5" fill="${AGENT_COLORS.messaging}"/></g>`;

  return (
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative net gain over twelve months" preserveAspectRatio="none">` +
    grid +
    xLabels +
    `<path class="band" d="${band}" fill="${AGENT_COLORS.messaging}" fill-opacity="0.12"/>` +
    `<path class="line" d="${line}" fill="none" stroke="${AGENT_COLORS.messaging}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` +
    endLabel +
    marker +
    cross +
    hover +
    `</svg>`
  );
}

/** Tooltip text for a month on the cumulative chart. */
export function cumulativeTip(base: MonthPoint, low: MonthPoint, high: MonthPoint, symbol: string): string {
  const spread = low.cumulativeNet === high.cumulativeNet ? '' : ` · likely ${formatCompact(low.cumulativeNet, symbol)} to ${formatCompact(high.cumulativeNet, symbol)}`;
  return `Month ${base.month} · ${formatMoney(base.cumulativeNet, symbol)} net so far${spread}`;
}

export interface SplitOpts {
  lines: LineItem[];
  on: Agents;
  hoursAsCash: boolean;
  symbol: string;
  width?: number;
}

/**
 * Horizontal bars, one per agent: staff cost saved (solid) and revenue
 * (same hue, lighter) with a 2px surface gap between them. Off agents keep
 * their row so the chart never re-orders.
 */
export function splitBars(o: SplitOpts): string {
  const W = o.width ?? 560;
  const rowH = 44;
  const barH = 16;
  const labelW = 132;
  const valueW = 76;
  const keys = Object.keys(AGENT_LABELS) as Array<keyof Agents>;
  const H = rowH * keys.length + 8;
  const x0 = labelW;
  const iw = W - labelW - valueW;
  const byKey = new Map(o.lines.map((l) => [l.key, l]));
  const totalOf = (l: LineItem): number => l.revenuePerMonth + (o.hoursAsCash ? l.costSavedPerMonth : 0);
  const max = Math.max(1, ...o.lines.map(totalOf));
  const sx = (v: number): number => (v / max) * iw;

  const rows = keys
    .map((key, i) => {
      const yTop = 4 + i * rowH;
      const yBar = yTop + (rowH - barH) / 2;
      const line = o.on[key] ? byKey.get(key) : undefined;
      const colour = AGENT_COLORS[key];
      const label = `<circle cx="6" cy="${r2(yTop + rowH / 2)}" r="4" fill="${colour}"/><text class="label" x="18" y="${r2(yTop + rowH / 2 + 4)}">${esc(AGENT_LABELS[key])}</text>`;
      if (!line) {
        return `<g class="row row--off">${label}<line class="g" x1="${x0}" x2="${x0 + iw}" y1="${r2(yTop + rowH / 2)}" y2="${r2(yTop + rowH / 2)}"/><text class="tick" x="${W}" y="${r2(yTop + rowH / 2 + 4)}" text-anchor="end">off</text></g>`;
      }
      const cost = o.hoursAsCash ? line.costSavedPerMonth : 0;
      const rev = line.revenuePerMonth;
      const wCost = sx(cost);
      const wRev = sx(rev);
      const gap = wCost > 0 && wRev > 0 ? 2 : 0;
      const parts =
        (wCost > 0 ? (wRev > 0 ? `<rect x="${x0}" y="${r2(yBar)}" width="${r2(wCost - gap)}" height="${barH}" fill="${colour}"/>` : `<path d="${barPath(x0, yBar, wCost, barH, 4)}" fill="${colour}"/>`) : '') +
        (wRev > 0 ? `<path d="${barPath(x0 + wCost, yBar, wRev, barH, 4)}" fill="${colour}" fill-opacity="0.45"/>` : '');
      const total = totalOf(line);
      const tip = `${AGENT_LABELS[key]} · ${formatMoney(total, o.symbol)} a month` + (cost > 0 ? ` · staff time ${formatMoney(cost, o.symbol)}` : '') + (rev > 0 ? ` · revenue ${formatMoney(rev, o.symbol)}` : '');
      return `<g class="row" data-tip="${esc(tip)}">${label}${parts}<text class="tick tick--value" x="${W}" y="${r2(yTop + rowH / 2 + 4)}" text-anchor="end">${esc(formatCompact(total, o.symbol))}</text><rect class="hit" x="0" y="${yTop}" width="${W}" height="${rowH}"/></g>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly benefit by agent">${rows}</svg>`;
}
