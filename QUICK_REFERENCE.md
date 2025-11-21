# 🚀 Quick Reference Guide

## Where to Find Things

### **Want to modify the navbar?**
📁 `src/components/layout/Navbar.astro`

### **Want to modify burger menu animation?**
📁 `public/scripts/main.js` → Section: `// BURGER MENU ANIMATION (GSAP)`

### **Want to modify scroll effects?**
📁 `public/scripts/main.js` → Section: `// SCROLL EFFECTS`

### **Want to modify calculator modal?**
📁 `public/scripts/main.js` → Section: `// CALCULATOR MODAL`

### **Want to modify feature modal?**
📁 `public/scripts/main.js` → Section: `// FEATURE MODAL`

### **Want to modify video autoplay?**
📁 `public/scripts/main.js` → Section: `// VIDEO AUTOPLAY (iOS Fix)`

### **Want to modify page layout?**
📁 `src/components/layout/BaseLayout.astro`

### **Want to modify styling?**
📁 `src/styles/landing.css`

---

## Common Tasks

### **Add a new navbar link:**

1. Open `src/components/layout/Navbar.astro`
2. Add inside `.burger-dropdown-content`:
```astro
<a href="/your-page">
  <i class="fas fa-your-icon"></i>
  <span>{t.nav.yourLink}</span>
</a>
```
3. Add translation to `src/i18n/en.json`, `fr.json`, `es.json`

### **Change mobile breakpoint:**

1. Open `public/scripts/main.js`
2. Find `const MOBILE_BREAKPOINT = 768;`
3. Change to your desired pixel value
4. Also update CSS if needed

### **Adjust animation timing:**

1. Open `public/scripts/main.js`
2. Find the `initBurgerMenu()` function
3. Modify `duration` values in GSAP timeline

### **Add a new modal:**

1. Create modal HTML in your `.astro` file
2. Add open/close functions in `main.js`
3. Register in `initModalManager()`

---

## File Structure at a Glance

```
KEY FILES:
├── src/components/layout/
│   ├── BaseLayout.astro ⭐ Main layout
│   └── Navbar.astro ⭐ Navigation component
│
├── public/scripts/
│   ├── main.js ⭐ All interactive features
│   └── language-persistence.js
│
├── src/styles/
│   └── landing.css ⭐ All styling
│
└── src/i18n/
    ├── en.json ⭐ English translations
    ├── fr.json ⭐ French translations
    └── es.json ⭐ Spanish translations

DOCUMENTATION:
├── REFACTOR_SUMMARY.md - What changed
├── ARCHITECTURE.md - How it works
├── REFACTOR_COMPLETE.md - Completion status
└── QUICK_REFERENCE.md - This file
```

---

## Code Sections in main.js

Use `Ctrl+F` to find these:

1. `// UTILITIES`
2. `// INTERSECTION OBSERVERS`
3. `// BURGER MENU ANIMATION (GSAP)`
4. `// SCROLL EFFECTS`
5. `// VIDEO AUTOPLAY (iOS Fix)`
6. `// CALCULATOR MODAL`
7. `// FEATURE MODAL`
8. `// MODAL MANAGER`
9. `// SCROLL ANIMATIONS INITIALIZATION`
10. `// APPLICATION INITIALIZATION`

---

## Constants You Can Modify

```javascript
// Mobile/Desktop breakpoint
const MOBILE_BREAKPOINT = 768;

// How far navbar slides on desktop
const DESKTOP_SLIDE_DISTANCE = -280;

// Modal fade duration
const MODAL_TRANSITION_DURATION = 400;
```

---

## Testing After Changes

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Getting Help

1. **Read inline comments** - Every function is documented
2. **Check ARCHITECTURE.md** - Understand the system
3. **Review REFACTOR_SUMMARY.md** - See what changed
4. **Search for section headers** - Use `// ============` pattern

---

## Emergency Rollback

If something breaks:

```bash
# Restore old main.js
copy public\scripts\main-old.js public\scripts\main.js

# Restore old BaseLayout (if needed)
git checkout src/components/layout/BaseLayout.astro
```

---

**Last Updated:** 2025
**Version:** 2.0.0
