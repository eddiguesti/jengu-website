/**
 * Calculator runtime. Numbers live inside sentences: drag one sideways to
 * change it, or click it and type. Results tween to their new values.
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
import { parseTyped, rangeFromAttrs, valueFromDrag, type ScrubRange } from './scrub';
import { Tweener } from './tween';

const AGENT_KEYS: Array<keyof Agents> = ['messaging', 'phone', 'pricing', 'integrations'];
const UNIT_WORDS: Record<PropertyType, string> = { hotel: 'rooms', resort: 'rooms', campsite: 'pitches', tour: 'places' };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- reading the form ---------- */

const num = (root: ParentNode, name: string, fallback: number): number => {
  const el = root.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!el) return fallback;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : fallback;
};

const bool = (root: ParentNode, name: string, fallback: boolean): boolean => {
  const el = root.querySelector<HTMLInputElement>(`[name="${name}"]`);
  return el ? el.checked : fallback;
};

function readInputs(root: HTMLElement): Inputs {
  const sel = root.querySelector<HTMLSelectElement>('[name="propertyType"]');
  const type = (sel?.value as PropertyType | undefined) ?? DEFAULT_INPUTS.propertyType;
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

const currentSymbol = (root: HTMLElement): string => root.querySelector<HTMLSelectElement>('[name="currency"]')?.value ?? '£';

/* ---------- inline number fields ---------- */

interface NumField {
  el: HTMLElement;
  input: HTMLInputElement;
  ghost: HTMLElement;
  range: ScrubRange;
}

function syncGhost(f: NumField): void {
  const text = f.input.value === '' ? '0' : f.input.value;
  if (f.ghost.textContent !== text) f.ghost.textContent = text;
}

function setFieldValue(f: NumField, value: number, notify: boolean): void {
  const next = String(value);
  if (f.input.value === next) return;
  f.input.value = next;
  syncGhost(f);
  if (notify) f.input.dispatchEvent(new Event('input', { bubbles: true }));
}

function wireNumber(el: HTMLElement): NumField | null {
  const input = el.querySelector<HTMLInputElement>('input');
  const ghost = el.querySelector<HTMLElement>('.v2-num__ghost');
  if (!input || !ghost) return null;
  const f: NumField = { el, input, ghost, range: rangeFromAttrs(input.min, input.max, input.step) };
  syncGhost(f);

  let startX = 0;
  let startValue = 0;
  let moved = false;
  let pointerId: number | null = null;

  const endTyping = (): void => {
    if (!el.classList.contains('is-typing')) return;
    el.classList.remove('is-typing');
    const value = parseTyped(input.value, startValue, f.range);
    input.value = String(value);
    syncGhost(f);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  el.addEventListener('pointerdown', (e) => {
    if (el.classList.contains('is-typing')) return;
    if (e.button !== 0) return;
    e.preventDefault();
    pointerId = e.pointerId;
    startX = e.clientX;
    startValue = Number(input.value) || 0;
    moved = false;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener('pointermove', (e) => {
    if (pointerId !== e.pointerId) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) < 3) return;
    if (!moved) {
      moved = true;
      el.classList.add('is-scrubbing');
      document.body.classList.add('is-scrubbing');
    }
    setFieldValue(f, valueFromDrag(startValue, dx, f.range, e.shiftKey), true);
  });

  const release = (e: PointerEvent): void => {
    if (pointerId !== e.pointerId) return;
    pointerId = null;
    el.classList.remove('is-scrubbing');
    document.body.classList.remove('is-scrubbing');
    if (moved) return;
    el.classList.add('is-typing');
    startValue = Number(input.value) || 0;
    input.focus();
    input.select();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);

  input.addEventListener('focus', () => el.classList.add('is-typing'));
  input.addEventListener('blur', endTyping);
  input.addEventListener('input', () => syncGhost(f));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') input.blur();
  });
  return f;
}

/* ---------- inline selects ---------- */

function fitSelect(el: HTMLElement): void {
  const select = el.querySelector<HTMLSelectElement>('select');
  const ghost = el.querySelector<HTMLElement>('.v2-sel__ghost');
  if (!select || !ghost) return;
  ghost.textContent = select.options[select.selectedIndex]?.text ?? '';
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

function applyPreset(root: HTMLElement, fields: NumField[], type: PropertyType): void {
  const preset = PRESETS[type];
  fields.forEach((f) => {
    const v = preset[f.input.name as keyof Inputs];
    if (typeof v === 'number') setFieldValue(f, v, false);
  });
  root.querySelectorAll<HTMLElement>('[data-unit-word]').forEach((el) => (el.textContent = UNIT_WORDS[type]));
}

function applyCurrency(root: HTMLElement, symbol: string): void {
  root.querySelectorAll<HTMLElement>('[data-cur]').forEach((el) => (el.textContent = symbol));
}

function resetAll(root: HTMLElement, fields: NumField[]): void {
  const type = (root.querySelector<HTMLSelectElement>('[name="propertyType"]')?.value as PropertyType | undefined) ?? 'hotel';
  applyPreset(root, fields, type);
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
  fields.forEach((f) => {
    const v = defaults[f.input.name];
    if (typeof v === 'number') setFieldValue(f, v, false);
  });
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
  const fields = Array.from(root.querySelectorAll<HTMLElement>('.v2-num'))
    .map(wireNumber)
    .filter((f): f is NumField => f !== null);
  root.querySelectorAll<HTMLElement>('.v2-sel').forEach(fitSelect);

  const out = bindOutputs(root);
  let latest = { inputs: DEFAULT_INPUTS, results: compute(DEFAULT_INPUTS), symbol: '£' };

  const update = (): void => {
    const inputs = readInputs(root);
    const assumptions = readAssumptions(root);
    const results = compute(inputs, assumptions);
    const symbol = currentSymbol(root);
    latest = { inputs, results, symbol };
    writeOutputs(root, out, results, symbol);
    writeLines(root, results, inputs, assumptions, symbol);
  };

  root.addEventListener('input', update);
  root.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    const sel = t.closest<HTMLElement>('.v2-sel');
    if (sel) fitSelect(sel);
    if (t.name === 'propertyType') applyPreset(root, fields, t.value as PropertyType);
    if (t.name === 'currency') applyCurrency(root, t.value);
    update();
  });
  root.querySelector<HTMLElement>('[data-reset]')?.addEventListener('click', (e) => {
    e.preventDefault();
    resetAll(root, fields);
    update();
  });

  wireSend(root, () => latest);
  wireMobileBar(root);
  applyCurrency(root, currentSymbol(root));
  update();
}

document.querySelectorAll<HTMLElement>('[data-calc]').forEach(initCalculator);
