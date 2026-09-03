/**
 * Calculator runtime. Inputs are sliders paired with number boxes and
 * minus/plus buttons; the live sentence at the top reads them back; the
 * ledger recomputes on every change and its figures tween to the new values.
 *
 * Works for the full page (`[data-calc="full"]`) and the home page estimate
 * (`[data-calc="quick"]`), which only has a few inputs and falls back to the
 * model defaults for everything else.
 */
import { explainLines, lineSummary } from './explain';
import {
  compute,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_INPUTS,
  formatHours,
  formatMoney,
  PRESETS,
  type Agents,
  type Assumptions,
  type Inputs,
  type PropertyType,
  type Results,
} from './model';
import { Tweener } from './tween';

const AGENT_KEYS: Array<keyof Agents> = ['messaging', 'phone', 'pricing', 'integrations'];
const UNIT_WORDS: Record<PropertyType, string> = { hotel: 'rooms', resort: 'rooms', campsite: 'pitches', tour: 'places' };
const TYPE_WORDS: Record<PropertyType, string> = { hotel: 'hotel', resort: 'resort', campsite: 'campsite', tour: 'tour business' };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- reading the form ---------- */

const num = (root: ParentNode, name: string, fallback: number): number => {
  const el = root.querySelector<HTMLInputElement>(`input[type="number"][name="${name}"], input[name="${name}"]`);
  if (!el) return fallback;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : fallback;
};

const bool = (root: ParentNode, name: string, fallback: boolean): boolean => {
  const el = root.querySelector<HTMLInputElement>(`[name="${name}"]`);
  return el ? el.checked : fallback;
};

const checked = (root: ParentNode, name: string): string | undefined =>
  root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value;

function readInputs(root: HTMLElement): Inputs {
  const type = (checked(root, 'propertyType') as PropertyType | undefined) ?? DEFAULT_INPUTS.propertyType;
  return {
    propertyType: type,
    units: num(root, 'units', DEFAULT_INPUTS.units),
    nightlyRate: num(root, 'nightlyRate', DEFAULT_INPUTS.nightlyRate),
    occupancy: num(root, 'occupancy', DEFAULT_INPUTS.occupancy),
    messagesPerDay: num(root, 'messagesPerDay', DEFAULT_INPUTS.messagesPerDay),
    callsPerDay: num(root, 'callsPerDay', DEFAULT_INPUTS.callsPerDay),
    adminHoursPerWeek: num(root, 'adminHoursPerWeek', DEFAULT_INPUTS.adminHoursPerWeek),
    hourlyCost: num(root, 'hourlyCost', DEFAULT_INPUTS.hourlyCost),
    agents: {
      messaging: bool(root, 'agent-messaging', DEFAULT_INPUTS.agents.messaging),
      phone: bool(root, 'agent-phone', DEFAULT_INPUTS.agents.phone),
      pricing: bool(root, 'agent-pricing', DEFAULT_INPUTS.agents.pricing),
      integrations: bool(root, 'agent-integrations', DEFAULT_INPUTS.agents.integrations),
    },
  };
}

/** Assumption fields are entered in human units (percent, minutes, money). */
function readAssumptions(root: HTMLElement): Assumptions {
  const d = DEFAULT_ASSUMPTIONS;
  const pct = (name: string, fallback: number): number => num(root, name, fallback * 100) / 100;
  return {
    minutesPerMessage: num(root, 'a-minutesPerMessage', d.minutesPerMessage),
    messagingShare: pct('a-messagingShare', d.messagingShare),
    minutesPerCall: num(root, 'a-minutesPerCall', d.minutesPerCall),
    callsMissedShare: pct('a-callsMissedShare', d.callsMissedShare),
    callBookingRate: pct('a-callBookingRate', d.callBookingRate),
    callShare: pct('a-callShare', d.callShare),
    avgStayNights: num(root, 'a-avgStayNights', d.avgStayNights),
    pricingUplift: pct('a-pricingUplift', d.pricingUplift),
    pricingFeeShare: pct('a-pricingFeeShare', d.pricingFeeShare),
    integrationsShare: pct('a-integrationsShare', d.integrationsShare),
    monthlyFee: num(root, 'a-monthlyFee', d.monthlyFee),
    setupFee: num(root, 'a-setupFee', d.setupFee),
  };
}

const currentSymbol = (root: HTMLElement): string => checked(root, 'currency') ?? '£';

/* ---------- fields: slider + box + steppers ---------- */

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const decimals = (step: number): number => (String(step).split('.')[1] ?? '').length;

function setByName(root: ParentNode, name: string, value: number): void {
  root.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((el) => {
    if (el.type !== 'range' && el.type !== 'number') return;
    el.value = String(value);
    if (el.type === 'number') el.style.width = `${Math.max(2, el.value.length)}ch`;
  });
}

function wireField(field: HTMLElement): void {
  const range = field.querySelector<HTMLInputElement>('input[type="range"]');
  const box = field.querySelector<HTMLInputElement>('input[type="number"]');
  if (!range || !box) return;
  const min = Number(box.min) || 0;
  const max = Number(box.max) || 100;
  const step = Number(box.step) || 1;
  const fit = (): void => {
    box.style.width = `${Math.max(2, box.value.length)}ch`;
  };
  fit();

  range.addEventListener('input', () => {
    box.value = range.value;
    fit();
  });
  box.addEventListener('input', () => {
    if (box.value !== '') range.value = box.value;
    fit();
  });
  box.addEventListener('blur', () => {
    const v = Number(box.value);
    const safe = Number.isFinite(v) && box.value !== '' ? clamp(v, min, max) : Number(range.value);
    box.value = safe.toFixed(decimals(step));
    range.value = box.value;
    box.dispatchEvent(new Event('input', { bubbles: true }));
  });

  field.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) => {
    const dir = Number(btn.dataset.step) || 1;
    btn.addEventListener('click', () => {
      const current = Number(box.value) || Number(range.value) || 0;
      const next = clamp(current + dir * step, min, max);
      box.value = next.toFixed(decimals(step));
      range.value = box.value;
      box.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
}

/* ---------- writing results ---------- */

type Formatter = (v: number, symbol: string) => string;
const FORMATTERS: Record<string, Formatter> = {
  monthlyBenefit: (v, s) => formatMoney(v, s),
  annualBenefit: (v, s) => formatMoney(v, s),
  costSaved: (v, s) => formatMoney(v, s),
  revenue: (v, s) => formatMoney(v, s),
  monthlyFee: (v, s) => formatMoney(v, s),
  setupFee: (v, s) => formatMoney(v, s),
  netMonthly: (v, s) => formatMoney(v, s),
  hoursPerWeek: (v) => formatHours(v),
  hoursPerMonth: (v) => formatHours(v),
  payback: (v) => String(Math.round(v)),
};

function numericOutputs(r: Results): Record<string, number> {
  return {
    monthlyBenefit: r.monthlyBenefit,
    annualBenefit: r.annualBenefit,
    costSaved: r.costSavedPerMonth,
    revenue: r.revenuePerMonth,
    monthlyFee: r.monthlyFee,
    setupFee: r.setupFee,
    netMonthly: r.netMonthly,
    hoursPerWeek: r.hoursPerWeek,
    hoursPerMonth: r.hoursPerMonth,
    payback: r.paybackMonths ?? 0,
  };
}

interface Outputs {
  tween: Tweener;
  symbol: { value: string };
}

function bindOutputs(root: HTMLElement): Outputs {
  const tween = new Tweener({ duration: reduceMotion ? 0 : 650 });
  const symbol = { value: '£' };
  root.querySelectorAll<HTMLElement>('[data-out]').forEach((el, i) => {
    const key = el.dataset.out ?? '';
    const fmt = FORMATTERS[key];
    if (!fmt) return;
    tween.bind(`${key}#${i}`, (v) => {
      const text = fmt(v, symbol.value);
      if (el.textContent !== text) el.textContent = text;
    });
  });
  return { tween, symbol };
}

function writeOutputs(root: HTMLElement, out: Outputs, r: Results, symbol: string): void {
  const symbolChanged = out.symbol.value !== symbol;
  out.symbol.value = symbol;
  const values = numericOutputs(r);
  root.querySelectorAll<HTMLElement>('[data-out]').forEach((el, i) => {
    const key = el.dataset.out ?? '';
    if (key in values) out.tween.set(`${key}#${i}`, values[key], symbolChanged);
  });
  const unit = root.querySelector<HTMLElement>('[data-out="payback-unit"]');
  if (unit) unit.textContent = r.paybackMonths === 1 ? 'month' : 'months';
  root.dataset.fees = r.monthlyFee > 0 || r.setupFee > 0 ? 'yes' : 'no';
  root.dataset.payback = r.paybackMonths === null ? 'never' : r.paybackMonths === 0 ? 'now' : 'months';
}

/** The sentence at the top reads the inputs back. */
function writeEcho(root: HTMLElement, i: Inputs, symbol: string): void {
  const plain: Record<string, string> = {
    units: String(i.units),
    occupancy: `${i.occupancy}%`,
    messagesPerDay: String(i.messagesPerDay),
    callsPerDay: String(i.callsPerDay),
    adminHoursPerWeek: String(i.adminHoursPerWeek),
    nightlyRate: formatMoney(i.nightlyRate, symbol),
    hourlyCost: formatMoney(i.hourlyCost, symbol),
    propertyType: TYPE_WORDS[i.propertyType],
    unitWord: UNIT_WORDS[i.propertyType],
  };
  root.querySelectorAll<HTMLElement>('[data-echo]').forEach((el) => {
    const text = plain[el.dataset.echo ?? ''];
    if (text !== undefined && el.textContent !== text) el.textContent = text;
  });
}

function writeLines(root: HTMLElement, r: Results, inputs: Inputs, assumptions: Assumptions, symbol: string): void {
  const byKey = new Map(r.lines.map((l) => [l.key, l]));
  const total = r.monthlyBenefit || 1;
  AGENT_KEYS.forEach((key) => {
    const line = byKey.get(key);
    root.querySelectorAll<HTMLElement>(`[data-line="${key}"]`).forEach((el) => {
      el.textContent = lineSummary(line, symbol);
      el.classList.toggle('is-off', !line);
    });
    root.querySelectorAll<HTMLElement>(`[data-line-money="${key}"]`).forEach((el) => {
      el.textContent = line ? formatMoney(line.costSavedPerMonth + line.revenuePerMonth, symbol) : 'off';
      el.closest('li')?.classList.toggle('is-off', !line);
    });
    root.querySelectorAll<HTMLElement>(`[data-bar="${key}"]`).forEach((el) => {
      const share = line ? ((line.costSavedPerMonth + line.revenuePerMonth) / total) * 100 : 0;
      el.style.width = `${share.toFixed(2)}%`;
    });
  });
  const explainEls = root.querySelectorAll<HTMLElement>('[data-explain]');
  if (explainEls.length) {
    const text = explainLines(inputs, assumptions, symbol);
    explainEls.forEach((el) => {
      const key = el.dataset.explain as keyof Agents;
      if (key in text) el.textContent = text[key];
    });
  }
}

/* ---------- presets, currency, reset ---------- */

function applyPreset(root: HTMLElement, type: PropertyType): void {
  Object.entries(PRESETS[type]).forEach(([key, value]) => {
    if (typeof value === 'number') setByName(root, key, value);
  });
}

function applyCurrency(root: HTMLElement, symbol: string): void {
  root.querySelectorAll<HTMLElement>('[data-cur]').forEach((el) => (el.textContent = symbol));
}

function resetAll(root: HTMLElement): void {
  const type = (checked(root, 'propertyType') as PropertyType | undefined) ?? 'hotel';
  applyPreset(root, type);
  const d = DEFAULT_ASSUMPTIONS;
  const defaults: Record<string, number> = {
    'a-minutesPerMessage': d.minutesPerMessage,
    'a-messagingShare': d.messagingShare * 100,
    'a-minutesPerCall': d.minutesPerCall,
    'a-callsMissedShare': d.callsMissedShare * 100,
    'a-callBookingRate': d.callBookingRate * 100,
    'a-callShare': d.callShare * 100,
    'a-avgStayNights': d.avgStayNights,
    'a-pricingUplift': d.pricingUplift * 100,
    'a-pricingFeeShare': d.pricingFeeShare * 100,
    'a-integrationsShare': d.integrationsShare * 100,
    'a-monthlyFee': d.monthlyFee,
    'a-setupFee': d.setupFee,
    hourlyCost: DEFAULT_INPUTS.hourlyCost,
  };
  Object.entries(defaults).forEach(([name, value]) => setByName(root, name, value));
  AGENT_KEYS.forEach((key) => {
    const box = root.querySelector<HTMLInputElement>(`[name="agent-${key}"]`);
    if (box) box.checked = DEFAULT_INPUTS.agents[key];
  });
}

/* ---------- email the estimate ---------- */

function wireSend(root: HTMLElement, latest: () => { inputs: Inputs; results: Results; symbol: string }): void {
  const form = root.querySelector<HTMLFormElement>('[data-send]');
  const status = root.querySelector<HTMLElement>('[data-send-status]');
  if (!form) return;
  const say = (text: string, cls: string): void => {
    if (!status) return;
    status.textContent = text;
    status.className = `v2-form__status ${cls}`.trim();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') ?? '').trim();
    const name = String(fd.get('name') ?? '').trim();
    const company = String(fd.get('company') ?? '').trim();
    if (!email || !name) {
      say('We need a name and an email to send it.', 'is-error');
      return;
    }
    say('Sending…', '');
    const { inputs, results, symbol } = latest();
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'estimate', fullName: name, email, companyName: company, symbol, inputs, results }),
      });
      if (res.ok) {
        say('Sent. Check your inbox.', 'is-ok');
        form.reset();
      } else {
        say('That did not send. Email us at info@jengu.ai instead.', 'is-error');
      }
    } catch {
      say('That did not send. Email us at info@jengu.ai instead.', 'is-error');
    }
  });
}

/* ---------- mobile summary bar ---------- */

function wireMobileBar(root: HTMLElement): void {
  const bar = root.querySelector<HTMLElement>('[data-mbar]');
  const target = root.querySelector<HTMLElement>('[data-mbar-target]');
  if (!bar || !target) return;
  const io = new IntersectionObserver((entries) => bar.classList.toggle('is-hidden', entries[0].isIntersecting), { threshold: 0.15 });
  io.observe(target);
}

/* ---------- boot ---------- */

export function initCalculator(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-fld]').forEach(wireField);
  const out = bindOutputs(root);
  let latest = { inputs: DEFAULT_INPUTS, results: compute(DEFAULT_INPUTS), symbol: '£' };

  const update = (): void => {
    const inputs = readInputs(root);
    const assumptions = readAssumptions(root);
    const results = compute(inputs, assumptions);
    const symbol = currentSymbol(root);
    latest = { inputs, results, symbol };
    writeOutputs(root, out, results, symbol);
    writeEcho(root, inputs, symbol);
    writeLines(root, results, inputs, assumptions, symbol);
  };

  root.addEventListener('input', update);
  root.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'propertyType') applyPreset(root, t.value as PropertyType);
    if (t.name === 'currency') applyCurrency(root, t.value);
    update();
  });
  root.querySelector<HTMLElement>('[data-reset]')?.addEventListener('click', (e) => {
    e.preventDefault();
    resetAll(root);
    update();
  });

  wireSend(root, () => latest);
  wireMobileBar(root);
  applyCurrency(root, currentSymbol(root));
  update();
}

document.querySelectorAll<HTMLElement>('[data-calc]').forEach(initCalculator);
