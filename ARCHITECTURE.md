# 🏗️ Jengu AI Website - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               BaseLayout.astro (Root)                    │  │
│  │                                                          │  │
│  │  ┌────────────────┐  ┌─────────────────────────────┐  │  │
│  │  │   SEO Head     │  │     Navigation Bar          │  │  │
│  │  │  - SEOHead     │  │  - Burger Menu (GSAP)      │  │  │
│  │  │  - Hreflang    │  │  - Language Switcher       │  │  │
│  │  │  - JsonLd      │  │  - Booking CTA             │  │  │
│  │  │  - Analytics   │  │                            │  │  │
│  │  └────────────────┘  └─────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │           <slot /> (Page Content)                │  │  │
│  │  │  - index.astro                                   │  │  │
│  │  │  - about.astro                                   │  │  │
│  │  │  - services.astro                                │  │  │
│  │  │  - blog/[...slug].astro                         │  │  │
│  │  │  - etc.                                          │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────┐  ┌─────────────────────────────┐  │  │
│  │  │     Footer     │  │         Modals              │  │  │
│  │  │  - Links       │  │  - Calculator Modal         │  │  │
│  │  │  - Contact     │  │  - Feature Modal            │  │  │
│  │  │  - Social      │  │  - BookingModal.astro       │  │  │
│  │  └────────────────┘  └─────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │            JavaScript Layer                       │  │  │
│  │  │  - GSAP (CDN)                                    │  │  │
│  │  │  - main.js (Refactored)                          │  │  │
│  │  │  - language-persistence.js                       │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## JavaScript Architecture (main.js)

```
┌────────────────────────────────────────────────────────────────┐
│                         main.js (v2.0)                         │
│                    Entry Point & Orchestrator                  │
└────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   UTILITIES   │     │  ANIMATIONS  │     │    MODALS    │
├───────────────┤     ├──────────────┤     ├──────────────┤
│               │     │              │     │              │
│ • throttle()  │     │ Burger Menu  │     │ Calculator   │
│               │     │  - GSAP      │     │  - Desktop   │
│ • observers   │     │  - Responsive│     │  - Mobile    │
│   - scroll    │     │  - Mobile Fix│     │              │
│   - stat card │     │              │     │ Feature      │
│   - ROI       │     │ Scroll FX    │     │  - Dynamic   │
│               │     │  - Navbar    │     │  - Content   │
│ • video       │     │  - Parallax  │     │              │
│   autoplay    │     │  - Smooth    │     │ Booking      │
│               │     │              │     │  - Defined   │
│               │     │              │     │    in Astro  │
└───────────────┘     └──────────────┘     └──────────────┘
```

---

## Component Hierarchy

```
BaseLayout.astro
├── <head>
│   ├── SEOHead.astro
│   ├── Hreflang.astro
│   ├── JsonLd.astro
│   └── Analytics.astro
│
├── <nav> (Inline)
│   └── <div class="nav-right">
│       ├── <button> Booking CTA
│       ├── LanguageSwitcher.astro
│       ├── <button> Burger Menu
│       └── <div> Burger Dropdown
│
├── <slot /> (Page Content)
│   └── [Dynamic page content]
│
├── <footer> (Inline)
│   └── [Footer content]
│
└── <modals>
    ├── Calculator Modal (Inline)
    └── BookingModal.astro
```

---

## Data Flow

### **1. Navigation Interaction**

```
User Click
    │
    ▼
Burger Button
    │
    ▼
initBurgerMenu()
    │
    ├──> Check if mobile (≤768px)
    │
    ├──> GSAP Timeline
    │    ├──> Desktop: Slide pill left (-280px)
    │    └──> Mobile: No slide (0px)
    │
    ├──> Fade in dropdown (opacity 0→1, y -20→0)
    │
    └──> Stagger links (15ms delay each)
```

### **2. Calculator Flow**

```
User Click
    │
    ▼
handleCalculatorClick()
    │
    ├──> Check if mobile (≤768px)
    │    │
    │    ├──> YES: window.location.href = '/calculator'
    │    │
    │    └──> NO: openCalculatorModal()
    │             │
    │             ├──> overlay.style.display = 'flex'
    │             │
    │             ├──> requestAnimationFrame()
    │             │
    │             └──> overlay.classList.add('active')
    │
    └──> Done
```

### **3. Scroll Animation**

```
Page Load
    │
    ▼
initScrollAnimations()
    │
    ├──> createScrollAnimationObserver()
    │    └──> observeElements('.animate-on-scroll')
    │
    ├──> createStatCardObserver()
    │    └──> observeElements('.stat-card')
    │
    └──> createROIObserver()
         └──> observe('#roiPreview')

                    │
                    ▼
              User Scrolls
                    │
                    ▼
        IntersectionObserver fires
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
  entry.isIntersecting?    Add 'visible' class
        │                       │
        YES                     ▼
        │                  Trigger animation
        ▼                       │
  Unobserve element            Done
   (performance)
```

---

## File Structure

```
jengu-astro-website/
├── public/
│   ├── scripts/
│   │   ├── main.js ⭐ (Refactored)
│   │   ├── main-old.js (Backup)
│   │   ├── main-new.js (ES6 Modules - Future)
│   │   ├── language-persistence.js
│   │   ├── utils/ (ES6 Modules)
│   │   │   ├── throttle.js
│   │   │   ├── observers.js
│   │   │   └── video-autoplay.js
│   │   ├── animations/ (ES6 Modules)
│   │   │   ├── burger-menu.js
│   │   │   └── scroll-effects.js
│   │   └── modals/ (ES6 Modules)
│   │       ├── calculator-modal.js
│   │       ├── feature-modal.js
│   │       └── modal-manager.js
│   │
│   ├── images/
│   └── calculator-ai-agents-2025.html
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── BaseLayout.astro ⭐
│   │   ├── seo/
│   │   │   ├── SEOHead.astro
│   │   │   ├── Hreflang.astro
│   │   │   ├── JsonLd.astro
│   │   │   └── Analytics.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── CTASection.astro
│   │   │   └── SectionHeader.astro
│   │   ├── BookingModal.astro
│   │   ├── LanguageSwitcher.astro
│   │   └── OptimizedImage.astro
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── services.astro
│   │   ├── blog/
│   │   │   └── [...slug].astro
│   │   ├── fr/ (French)
│   │   ├── es/ (Spanish)
│   │   └── api/
│   │       ├── book-meeting.ts
│   │       └── check-availability.ts
│   │
│   ├── styles/
│   │   └── landing.css (5,221 lines - needs modularization)
│   │
│   ├── lib/
│   │   └── seo/
│   │       ├── metadata.ts
│   │       └── jsonld.ts
│   │
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── es.json
│   │
│   └── content/
│       └── config.ts
│
├── astro.config.mjs ⭐ (Fixed)
├── package.json
├── tsconfig.json
├── REFACTOR_SUMMARY.md ⭐ (New)
└── ARCHITECTURE.md ⭐ (New)
```

---

## Performance Optimizations

### **1. Intersection Observers**
- **Purpose:** Trigger animations only when elements are visible
- **Benefit:** Reduces JavaScript execution, improves battery life
- **Implementation:** All scroll animations use IntersectionObserver

### **2. Throttling**
- **Purpose:** Limit scroll event handler frequency
- **Benefit:** Prevents layout thrashing, smoves scrolling
- **Implementation:** `throttle(handleScroll, 100)`

### **3. Passive Event Listeners**
- **Purpose:** Tell browser handler won't call `preventDefault()`
- **Benefit:** Browser can optimize scroll performance
- **Implementation:** `{ passive: true }` on scroll listeners

### **4. RequestAnimationFrame**
- **Purpose:** Sync DOM changes with browser repaint
- **Benefit:** Smooth animations, no jank
- **Implementation:** Modal opening uses RAF

### **5. Early Returns**
- **Purpose:** Avoid unnecessary code execution
- **Benefit:** Better performance, cleaner code
- **Implementation:** Guard clauses in all init functions

---

## Internationalization (i18n)

```
URL Structure:
├── /                    → English (default)
├── /fr/                 → French
└── /es/                 → Spanish

Locale Detection:
getLocaleFromUrl(pathname)
    │
    ├──> /fr/* → 'fr'
    ├──> /es/* → 'es'
    └──> /*    → 'en'

Translation Loading:
getTranslations(locale)
    │
    ├──> en.json
    ├──> fr.json
    └──> es.json
```

---

## Modal System

### **Calculator Modal**
```
Desktop (>768px):
    Click → openCalculatorModal() → Show Modal

Mobile (≤768px):
    Click → window.location.href = '/calculator'
```

### **Feature Modal**
```
Click Feature Card
    │
    ▼
openFeatureModal(featureId)
    │
    ├──> Fetch data from window.featureData
    ├──> Update modal icon
    ├──> Update modal title
    ├──> Render benefits list
    ├──> Render stats
    └──> Show modal
```

### **Booking Modal**
```
Defined in: BookingModal.astro
Functions:
    - window.openBookingModal()
    - window.closeBookingModal()
Integration:
    - Microsoft Graph API
    - Outlook Calendar
    - Email confirmation
```

---

## GSAP Animation Timeline

### **Burger Menu Open (Desktop)**
```
0ms:     Start
0ms:     navRight slides left (-280px) [350ms, power2.out]
80ms:    dropdown fades in [300ms, back.out(1.2)]
120ms:   links stagger animate [250ms, power2.out, 15ms apart]
470ms:   Complete
```

### **Burger Menu Open (Mobile)**
```
0ms:     Start
0ms:     (No pill slide)
80ms:    dropdown fades in [300ms, back.out(1.2)]
120ms:   links stagger animate [250ms, power2.out, 15ms apart]
470ms:   Complete
```

---

## Browser Compatibility

| Feature | Support | Fallback |
|---------|---------|----------|
| **GSAP** | All modern browsers | Graceful degradation |
| **IntersectionObserver** | Chrome 51+, Safari 12.1+ | Polyfill available |
| **CSS Grid** | Chrome 57+, Safari 10.1+ | Flexbox fallback |
| **requestAnimationFrame** | All modern browsers | setTimeout |
| **ES6** | Chrome 51+, Safari 10+ | Babel transpilation |

---

## Security Considerations

1. **XSS Prevention:** All user-generated content is sanitized
2. **HTTPS Only:** Site requires HTTPS (configured in Cloudflare)
3. **CSP Headers:** Content Security Policy configured
4. **No Inline Event Handlers:** Except global window functions
5. **API Keys:** Stored in environment variables

---

## Deployment

```
Development:
npm run dev → http://localhost:4321

Production Build:
npm run build → dist/

Preview:
npm run preview

Deployment Target:
Cloudflare Pages (Edge Functions)
```

---

## Next Recommended Refactors

1. **CSS Modularization** (Priority: High)
   - Split `landing.css` into component files
   - Extract CSS custom properties
   - Remove duplicates

2. **Component Extraction** (Priority: Medium)
   - `Navbar.astro` component
   - `Footer.astro` component
   - Modal wrapper component

3. **TypeScript Migration** (Priority: Low)
   - Add `.d.ts` type definitions
   - Migrate utils to TypeScript
   - Improve IDE support

4. **Performance Audit** (Priority: Medium)
   - Lazy-load modals
   - Defer GSAP loading
   - Image optimization review

---

## Questions & Support

**Documentation:** See `REFACTOR_SUMMARY.md`
**Code Comments:** All functions have JSDoc
**Module Files:** See `public/scripts/*/` for ES6 versions

---

**Last Updated:** 2025
**Version:** 2.0.0
**Status:** ✅ Production Ready
