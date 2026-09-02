/**
 * v2 motion runtime — Lenis smooth scroll, preloader, split-text reveals,
 * scroll-scrubbed manifesto, per-section theme switching, counters, cursor,
 * magnetic buttons, index-list image follower and the nav clock.
 */
import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/* ---------- Split text into masked words ---------- */
function splitWords(root: HTMLElement, counter: { i: number }): void {
  const nodes = Array.from(root.childNodes);
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const w = document.createElement('span');
        w.className = 'w';
        const wi = document.createElement('span');
        wi.className = 'wi';
        wi.textContent = part;
        wi.style.setProperty('--i', String(counter.i));
        w.style.setProperty('--i', String(counter.i));
        counter.i += 1;
        w.appendChild(wi);
        frag.appendChild(w);
      });
      root.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BR') {
      return;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      splitWords(node as HTMLElement, counter);
    }
  });
}

function initSplit(): void {
  document.querySelectorAll<HTMLElement>('[data-split], [data-words]').forEach((el) => {
    const counter = { i: 0 };
    splitWords(el, counter);
    el.style.setProperty('--n', String(counter.i));
  });
}

/* ---------- Intersection reveals ---------- */
function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-split]:not([data-hero]), [data-reveal], [data-line], .v2-step');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  targets.forEach((el) => io.observe(el));

  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty('--i', String(i)));
  });
}

/* ---------- Section theme: continuous, scroll-driven ink/bone crossfade ---------- */
const DARK = { bg: [10, 10, 12], fg: [244, 243, 239] };
const LIGHT = { bg: [239, 237, 232], fg: [10, 10, 12] };
const mixChannels = (a: number[], b: number[], t: number): string =>
  a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',');

function createThemeMixer(): () => void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.v2-main [data-theme], footer[data-theme]'));
  let tops: number[] = [];
  const measure = (): void => {
    tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
  };
  measure();
  new ResizeObserver(measure).observe(document.body);
  let last = -1;

  return () => {
    if (!sections.length) return;
    const vh = window.innerHeight;
    const probe = window.scrollY + vh * 0.5;
    const range = vh * 0.7;
    let t = sections[0].dataset.theme === 'light' ? 1 : 0;
    for (let i = 1; i < sections.length; i++) {
      const p = clamp01((probe - (tops[i] - range / 2)) / range);
      const eased = p * p * (3 - 2 * p);
      t = lerp(t, sections[i].dataset.theme === 'light' ? 1 : 0, eased);
    }
    if (Math.abs(t - last) < 0.002) return;
    last = t;
    const s = document.body.style;
    const fg = mixChannels(DARK.fg, LIGHT.fg, t);
    s.setProperty('--bg', `rgb(${mixChannels(DARK.bg, LIGHT.bg, t)})`);
    s.setProperty('--fg', `rgb(${fg})`);
    s.setProperty('--muted', `rgba(${fg},0.56)`);
    s.setProperty('--faint', `rgba(${fg},0.33)`);
    s.setProperty('--line', `rgba(${fg},0.14)`);
    s.setProperty('--card', `rgba(${fg},0.04)`);
    document.body.dataset.theme = t > 0.5 ? 'light' : 'dark';
  };
}

/* ---------- Counters ---------- */
function initCounters(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  const run = (el: HTMLElement): void => {
    const end = Number(el.dataset.count ?? '0');
    const dur = 1600;
    const t0 = performance.now();
    const tick = (now: number): void => {
      const p = clamp01((now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(end * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target as HTMLElement);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Scroll-driven values (manifesto scrub, hero parallax, scale-in) ---------- */
function initScrollDriven(): void {
  const manifesto = document.querySelector<HTMLElement>('.v2-manifesto');
  const manifestoText = manifesto?.querySelector<HTMLElement>('.v2-manifesto__text') ?? null;
  const scalers = document.querySelectorAll<HTMLElement>('[data-scale-in]');
  const nav = document.querySelector<HTMLElement>('.v2-nav');
  const mixTheme = createThemeMixer();

  const update = (): void => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (nav) nav.classList.toggle('is-scrolled', y > 40);
    mixTheme();
    if (reduceMotion) {
      manifestoText?.style.setProperty('--p', '1');
      scalers.forEach((el) => el.style.setProperty('--s', '1'));
      return;
    }
    if (manifesto && manifestoText) {
      const rect = manifesto.getBoundingClientRect();
      const total = rect.height - vh;
      const p = clamp01(-rect.top / total);
      manifestoText.style.setProperty('--p', p.toFixed(4));
    }
    scalers.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = clamp01((vh - r.top) / (vh * 0.75));
      const eased = 1 - Math.pow(1 - p, 3);
      el.style.setProperty('--s', (0.86 + 0.14 * eased).toFixed(4));
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- Hero: pin progress for the copy fade (the 3D character reads scroll itself) ---------- */
function initHeroScrub(): void {
  const hero = document.querySelector<HTMLElement>('.v2-hero');
  if (!hero || reduceMotion) return;
  const update = (): void => {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0) return;
    const p = clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight));
    hero.style.setProperty('--hp', p.toFixed(4));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Cursor + magnetic ---------- */
function initCursor(): void {
  if (!finePointer || reduceMotion) return;
  const dot = document.createElement('div');
  dot.className = 'v2-cursor';
  document.body.appendChild(dot);
  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;
  let shown = false;
  window.addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!shown) {
      shown = true;
      cx = x;
      cy = y;
      document.body.classList.add('has-cursor');
    }
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  document.addEventListener('mouseenter', () => shown && document.body.classList.add('has-cursor'));
  const hoverables = 'a, button, summary, [data-cursor]';
  document.addEventListener('pointerover', (e) => {
    if ((e.target as HTMLElement).closest(hoverables)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if ((e.target as HTMLElement).closest(hoverables)) document.body.classList.remove('cursor-hover');
  });
  const loop = (): void => {
    cx = lerp(cx, x, 0.2);
    cy = lerp(cy, y, 0.2);
    dot.style.left = `${cx}px`;
    dot.style.top = `${cy}px`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/* ---------- Index list image follower ---------- */
function initFollower(): void {
  const list = document.querySelector<HTMLElement>('.v2-index');
  const follower = document.querySelector<HTMLElement>('.v2-follower');
  if (!list || !follower || !finePointer) return;
  const imgs = Array.from(follower.querySelectorAll<HTMLElement>('.v2-follower__item'));
  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;
  let on = false;
  list.addEventListener('pointermove', (e) => {
    x = e.clientX + 40;
    y = e.clientY;
  });
  list.querySelectorAll<HTMLElement>('.v2-row').forEach((row, i) => {
    row.addEventListener('pointerenter', () => {
      imgs.forEach((img, j) => img.classList.toggle('is-active', i === j));
      if (!on) {
        cx = x;
        cy = y;
        on = true;
      }
      follower.classList.add('is-on');
    });
  });
  list.addEventListener('pointerleave', () => {
    follower.classList.remove('is-on');
    on = false;
  });
  const loop = (): void => {
    cx = lerp(cx, x, 0.12);
    cy = lerp(cy, y, 0.12);
    follower.style.left = `${cx}px`;
    follower.style.top = `${cy}px`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- Preloader ---------- */
function runPreloader(onDone: () => void): void {
  const loader = document.querySelector<HTMLElement>('.v2-loader');
  const count = loader?.querySelector<HTMLElement>('.v2-loader__count') ?? null;
  const seen = (() => {
    try {
      return sessionStorage.getItem('v2-seen') === '1';
    } catch {
      return false;
    }
  })();
  if (!loader || !count || seen || reduceMotion) {
    loader?.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    onDone();
    return;
  }
  const dur = 1400;
  const t0 = performance.now();
  const tick = (now: number): void => {
    const p = clamp01((now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    count.textContent = String(Math.round(e * 100)).padStart(3, '0');
    if (p < 1) {
      requestAnimationFrame(tick);
      return;
    }
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    try {
      sessionStorage.setItem('v2-seen', '1');
    } catch {
      /* private mode */
    }
    setTimeout(onDone, 250);
    setTimeout(() => loader.classList.add('is-hidden'), 1200);
  };
  requestAnimationFrame(tick);
}

/* ---------- Hero entrance ---------- */
function revealHero(): void {
  document.querySelectorAll<HTMLElement>('[data-hero]').forEach((el, i) => {
    el.style.setProperty('--d', `${i * 120}ms`);
    el.classList.add('is-in');
  });
}

/* ---------- Misc chrome ---------- */
function initClock(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
  const tick = (): void => els.forEach((el) => (el.textContent = `London ${fmt.format(new Date())}`));
  tick();
  setInterval(tick, 15000);
}

function initMenu(): void {
  const burger = document.querySelector<HTMLElement>('.v2-nav__burger');
  const menu = document.querySelector<HTMLElement>('.v2-menu');
  if (!burger || !menu) return;
  const toggle = (force?: boolean): void => {
    const open = force ?? !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => toggle());
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
}

function initFaq(): void {
  const items = document.querySelectorAll<HTMLDetailsElement>('.v2-faq details');
  items.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      items.forEach((o) => o !== d && o.open && (o.open = false));
    });
  });
}

function initLenis(): void {
  if (reduceMotion || !finePointer) return;
  // The booking modal scrolls internally; keep Lenis out of it.
  document.querySelectorAll<HTMLElement>('.booking-modal').forEach((el) => el.setAttribute('data-lenis-prevent', ''));
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  const raf = (time: number): void => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  });
}

export function initMotion(): void {
  document.body.classList.add('v2');
  initSplit();
  initScrollDriven();
  initHeroScrub();
  initLenis();
  initCursor();
  initFollower();
  initCounters();
  initClock();
  initMenu();
  initFaq();
  runPreloader(() => {
    revealHero();
    initReveals();
  });
}
