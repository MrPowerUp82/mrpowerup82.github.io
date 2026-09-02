# anime.js v4 Migration + Animation Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the portfolio from anime.js 3.2.2 to v4 (ESM via CDN, no build), split the monolithic `script.js` into focused ES modules, fix the current reduced-motion and infinite-RAF defects, and add four new animation areas — all while keeping Lighthouse mobile Performance ≥ 90.

**Architecture:** A `js/ui.js` module owns all non-animation UI (nav, menu, smooth scroll, footer year, contact form) and always loads. A separate `js/main.js` bootstraps the animation layer: it dynamically imports `js/motion/anime.js` (single point that re-exports anime.js v4 from jsDelivr) and, on any failure, adds `class="no-motion"` to `<html>` so the site stays fully usable. Each animation concern is its own module under `js/motion/` (`env`, `circuit`, `hero`, `scroll`, `svg`, `interactions`). The two script graphs are independent: an animation failure never affects functional UI. Migration is incremental — v3 and v4 run side by side across Tasks 2–7, one concern ported per task, and v3 is fully removed in Task 8.

**Tech Stack:** Static HTML/CSS/vanilla JS. ES modules served from `/js/`. anime.js v4 (`animejs@4`) loaded as ESM from `https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js`. Native `IntersectionObserver`. Python `http.server` (port 8123, from `.claude/launch.json`) for local preview. No package manager, no bundler, no test framework.

## Global Constraints

- **No build step, no `package.json`, no new dependencies** beyond anime.js v4. Deploy stays "push to GitHub Pages, served at root `/`".
- **Lighthouse mobile Performance ≥ 90.** Every JS-driven animation animates only `transform` / `opacity`. No animation may introduce CLS.
- **Max 4 scroll-scrubbed animations** total (the `onScroll({ sync })` ones in Task 5). Any new scrubbed effect must replace an existing one.
- **`prefers-reduced-motion: reduce`** must yield the final static state immediately in every module: no movement, no parallax, no scramble, no scrubbing. The canvas renders exactly one static frame and starts no RAF loop.
- **CDN failure must degrade gracefully:** `<html class="no-motion">` + all content visible and interactive. Never a blank screen or thrown-to-console-only failure.
- **The `<h1>` and hero description text stay verbatim in the static HTML.** Animations may only reveal what is already in the DOM — never split into per-character spans, never inject text.
- **anime.js v4 API names** (differ from v3): `animate(targets, params)` not `anime({targets})`; `ease:` not `easing:`; easing names are short (`'outExpo'`, `'outCubic'`, `'inOutQuad'`, `'outBack'`, `'linear'`); `createSpring({ stiffness, damping })` for springs; callbacks are `onComplete` / `onBegin` / `onUpdate`; `loop: true, alternate: true` replaces `direction: 'alternate'`; helpers are `utils.random`, `utils.$`, `utils.set`, `stagger(...)`, `createTimeline({ defaults })`, `onScroll({...})`, `svg.createDrawable(...)`.
- **Absolute module paths** in `index.html` (`/js/main.js`, `/js/ui.js`) — this is a user site served at root.

### Deviations from the design doc (`docs/anime-v4-migration.md`) — intentional, UX-equivalent

1. **Reveals use `whenVisible()` (env.js) + `animate({ autoplay: true })`**, not `onScroll()` without `sync`. More deterministic; `onScroll` is reserved for the 4 scrubbed effects.
2. **Toast entrance/exit stays pure CSS.** `.toast` already has `transition: var(--transition)` and `.toast.show` toggles `transform`/`opacity`; the v3 `anime()` call in `showToast` was redundant. It is simply dropped. `interactions.js` therefore only implements the Download-CV feedback.
3. **Badge scramble uses `setInterval` (8 s cadence) + a short `requestAnimationFrame` loop (~600 ms)** instead of `createTimer`. Fewer moving parts, no lib dependency for a decorative effect.
4. **Hover reduced-motion needs no per-selector overrides** — the existing global block at `style.css:1405` (`@media (prefers-reduced-motion: reduce) { *,*::before,*::after { transition-duration: 0.01ms !important } }`) already neutralizes CSS hover transitions.

---

## File Structure

| Path | Responsibility | Lifecycle |
|---|---|---|
| `js/ui.js` | Header scroll state, smooth scrolling, contact form (mailto), `showToast`, footer year, mobile menu, Escape-to-dismiss-toast. No animation library. Loads on every page view. | Created Task 1 |
| `js/main.js` | Animation bootstrap: dynamic-import `motion/anime.js` to validate the CDN, then `Promise.all` the concern modules and call their `init*` functions; `try/catch` → `document.documentElement.classList.add('no-motion')`. | Created Task 2, grows Tasks 3–7 |
| `js/motion/anime.js` | The only file naming the CDN URL. Re-exports the v4 named API used project-wide. | Created Task 2 |
| `js/motion/env.js` | `prefersReducedMotion()`, `whenVisible(el, cb, opts)`, `pauseWhenOffscreen(el, {onEnter,onLeave})`. Sole source of reduced-motion + viewport observation. | Created Task 2 |
| `js/motion/circuit.js` | Canvas PCB engine: procedural graph, render loop, pulses (plain RAF math), event-driven surges/sparks (anime.js springs), RAF gated by `pauseWhenOffscreen`, `staticFrame` path, `circuit` export (`setPointer`, `triggerSurge`, `createSparks`, `ready`). | Created Task 3, edited Task 4 |
| `js/motion/hero.js` | Boot timeline (`createTimeline`), badge scramble, pointer parallax (≤ ±6 px, desktop) feeding `circuit.setPointer`. | Created Task 4 |
| `js/motion/scroll.js` | Reveal animations via `whenVisible`; 4 `onScroll({ sync })` scrubbed effects incl. the reading-progress bar. | Created Task 5 |
| `js/motion/svg.js` | Icon line-drawing: `svg.createDrawable` `draw` for stroked children, fade+scale for filled children, triggered per container. | Created Task 6 |
| `js/motion/interactions.js` | Download-CV click feedback (label swap + scale pulse). Placeholder home for future form states. | Created Task 7 |
| `index.html` | Script tags, `modulepreload`, `.read-progress` element. | Edited Tasks 1,2,5,8 |
| `style.css` | CSS-only hover states, `.read-progress`, `.no-motion` fallback rules. | Edited Tasks 5,7,8 |
| `script.js` | v3 monolith — shrinks each task, deleted in Task 8. | Edited Tasks 1,3,4,5,7; deleted Task 8 |

---

## Verification model (no test framework)

Every task ends with a manual verification cycle, then a commit. The standard loop:

1. **Start preview** — `preview_start` with `{ name: "portfolio" }` (serves the repo on `http://localhost:8123`). If already running, `navigate` to `http://localhost:8123` to reload, or run `javascript_tool` → `location.reload()`.
2. **Console must be clean** — `read_console_messages` with `{ onlyErrors: true }` → expect `[]`.
3. **Behavioral checks** — as listed per task, using `computer` (click / screenshot), `read_page`, `javascript_tool` (read computed styles / flags), `resize_window` (mobile 375×812), and DevTools-equivalent emulation notes.
4. **Commit** with the exact message given.

Reduced-motion is emulated with `javascript_tool`:
```js
// there is no MCP toggle; assert the guard path by forcing the query result
matchMedia('(prefers-reduced-motion: reduce)').matches
```
For a real emulation pass, the human runs Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce" and reloads. Each task notes what to expect in that mode.

---

## Task 1: Extract non-animation UI into `js/ui.js`

Pure refactor. anime.js v3 stays; no visible behavior change. Decouples functional UI from the animation layer (Global Constraint: independent script graphs).

**Files:**
- Create: `js/ui.js`
- Modify: `index.html` (add one script tag)
- Modify: `script.js` (remove moved functions + their calls)
- Test: manual (preview loop)

**Interfaces:**
- Consumes: nothing.
- Produces: `js/ui.js` as an ES module with a side-effecting `DOMContentLoaded` bootstrap. Exports `showToast(message, type = 'success')` for potential reuse. No other module imports it in this plan.

- [ ] **Step 1: Create `js/ui.js` with the extracted code**

```js
/**
 * Portfolio — functional UI (no animation library).
 * Loads on every page view; must work even if the animation layer fails.
 */

function initializeHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                window.scrollTo({ top: targetSection.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    const heroArrow = document.querySelector('.hero-arrow');
    if (heroArrow) {
        heroArrow.addEventListener('click', function () {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                window.scrollTo({ top: aboutSection.offsetTop - 80, behavior: 'smooth' });
            }
        });
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const errorElement = document.getElementById('form-error');
    const fields = {
        name: document.getElementById('form-name'),
        email: document.getElementById('form-email'),
        message: document.getElementById('form-message')
    };

    function setError(message, invalidFields) {
        Object.values(fields).forEach(field => field && field.classList.remove('invalid'));
        if (message && errorElement) {
            errorElement.textContent = message;
            errorElement.hidden = false;
            invalidFields.forEach(field => field && field.classList.add('invalid'));
            if (invalidFields[0]) invalidFields[0].focus();
        } else if (errorElement) {
            errorElement.hidden = true;
        }
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = fields.name ? fields.name.value.trim() : '';
        const email = fields.email ? fields.email.value.trim() : '';
        const message = fields.message ? fields.message.value.trim() : '';

        const empty = [fields.name, fields.email, fields.message].filter(f => f && !f.value.trim());
        if (empty.length > 0) {
            setError('Preencha todos os campos para enviar a mensagem.', empty);
            return;
        }
        if (!isValidEmail(email)) {
            setError('Insira um endereço de email válido.', [fields.email]);
            return;
        }
        setError(null, []);

        const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:gustavohenrique8282@hotmail.com?subject=${subject}&body=${body}`;
        showToast('Abrindo seu aplicativo de email...', 'success');
    });
}

export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const toastContent = toast.querySelector('.toast-content');

    if (type === 'success') {
        toastContent.innerHTML = `
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            </div>
            <div><h4>Sucesso!</h4><p>${message}</p></div>`;
    } else if (type === 'error') {
        toastContent.innerHTML = `
            <div class="toast-icon" style="color: var(--color-destructive);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <div><h4>Erro!</h4><p>${message}</p></div>`;
    }

    toast.classList.add('show'); // CSS transition on .toast handles the slide-in/out
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
}

function initializeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    if (!navMenu || !navToggle) return;

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        if (isOpen) {
            setTimeout(() => navMenu.classList.add('show'), 10);
        } else {
            navMenu.classList.remove('show');
        }
    });

    function closeMenu() {
        navMenu.classList.remove('active', 'show');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
    }

    navMenu.querySelectorAll('.nav-link, .nav-button').forEach(link =>
        link.addEventListener('click', closeMenu));
    document.addEventListener('click', function (e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const toast = document.getElementById('toast');
        if (toast && toast.classList.contains('show')) toast.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    initializeHeader();
    initializeSmoothScrolling();
    initializeContactForm();
    updateCurrentYear();
    initializeMobileMenu();
});
```

- [ ] **Step 2: Add the `ui.js` script tag to `index.html`**

Find (near end of file):
```html
  <!-- Anime.js Animation Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
  <script src="script.js"></script>
```
Replace with:
```html
  <!-- Functional UI (always loads) -->
  <script type="module" src="/js/ui.js"></script>

  <!-- Anime.js Animation Engine (v3 — removed in migration Task 8) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
  <script src="script.js"></script>
```

- [ ] **Step 3: Remove the moved code from `script.js`**

In `script.js`:

1. In the `DOMContentLoaded` handler (top of file), delete these five lines:
```js
    initializeHeader();
    initializeSmoothScrolling();
    initializeContactForm();
    updateCurrentYear();
    initializeMobileMenu();
```
Leave the `if (typeof anime !== 'undefined') { ... } else { ... }` block intact. The handler now starts directly with that `if`.

2. Delete the whole functions (they now live in `ui.js`): `initializeHeader`, `initializeSmoothScrolling`, `initializeContactForm`, `isValidEmail`, `showToast`, `updateCurrentYear`, `initializeMobileMenu`, and the standalone `document.addEventListener('keydown', ...)` Escape handler at the bottom.

3. Keep: `initializeCircuitAnimation`, `initializeHeroTimeline`, `initializeScrollAnimations`, `initializeInteractiveMicroAnimations`, `initializeFallbackAnimations`, `circuitEngine`, and `debounce`.

- [ ] **Step 4: Verify**

- `preview_start` `{ name: "portfolio" }`, open `http://localhost:8123`.
- `read_console_messages` `{ onlyErrors: true }` → expect `[]`.
- `computer` screenshot: hero renders, canvas animating, hero boot animation played once.
- Click a nav link (e.g. "Projetos") → smooth scroll to `#projects`.
- `resize_window` `{ preset: "mobile" }`, reload → tap `#nav-toggle` → menu opens/closes; tapping a link closes it.
- `javascript_tool`: `document.getElementById('current-year').textContent` → `"2026"`.
- `resize_window` `{ preset: "desktop" }`.

- [ ] **Step 5: Commit**

```bash
git add js/ui.js index.html script.js
git commit -m "refactor: extract functional UI into js/ui.js module

Decouples nav, menu, smooth scroll, contact form, toast and footer year
from the animation layer so a future animation failure cannot break
functional UI. No behavior change; anime.js v3 still drives animations.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Add anime.js v4 infrastructure alongside v3

Introduces the v4 CDN entry, the shared `env` helpers, and the `main.js` orchestrator — but wired to run *nothing* yet. v3 `script.js` keeps driving every animation. This isolates "does the CDN load and does the fallback fire" from any porting.

**Files:**
- Create: `js/motion/anime.js`
- Create: `js/motion/env.js`
- Create: `js/main.js`
- Modify: `index.html` (add `modulepreload` + `main.js` tag)
- Test: manual

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `js/motion/anime.js` re-exports from `animejs@4`: `animate`, `createTimeline`, `stagger`, `svg`, `utils`, `onScroll`, `engine`.
  - `js/motion/env.js` exports:
    - `prefersReducedMotion(): boolean`
    - `whenVisible(el: Element, cb: (el: Element) => void, opts?: { threshold?: number, margin?: string }): () => void` — fires `cb` once when `el` first intersects; returns a disconnect function.
    - `pauseWhenOffscreen(el: Element, handlers: { onEnter: () => void, onLeave: () => void }): () => void` — calls `onEnter`/`onLeave` on intersection changes and on `visibilitychange`; returns a teardown function.
  - `js/main.js` — side-effecting bootstrap, no exports.

- [ ] **Step 1: Create `js/motion/anime.js`**

```js
/**
 * Single point that names the anime.js v4 CDN URL.
 * Swap CDNs or pin a patch version by editing only this line.
 */
export {
    animate,
    createTimeline,
    createTimer,
    stagger,
    svg,
    utils,
    onScroll,
    engine,
} from 'https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js';
```

- [ ] **Step 2: Create `js/motion/env.js`**

```js
/**
 * Shared environment helpers. The ONLY place that reads prefers-reduced-motion
 * or constructs an IntersectionObserver for the animation layer.
 */

const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion() {
    return reduceMQ.matches;
}

export function whenVisible(el, cb, { threshold = 0.15, margin = '0px 0px -40px 0px' } = {}) {
    const io = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                obs.unobserve(entry.target);
                cb(entry.target);
            }
        }
    }, { threshold, rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
}

export function pauseWhenOffscreen(el, { onEnter, onLeave }) {
    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (document.hidden) return;
        visible ? onEnter() : onLeave();
    });
    io.observe(el);

    const onVisibilityChange = () => {
        if (document.hidden) onLeave();
        else if (visible) onEnter();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
    };
}
```

- [ ] **Step 3: Create `js/main.js` (orchestrator — calls nothing yet)**

```js
/**
 * Animation bootstrap. Independent of js/ui.js.
 * On any failure the whole animation layer is skipped and the page is
 * marked .no-motion so CSS can force the final visible state.
 */
import { prefersReducedMotion } from './motion/env.js';

async function boot() {
    try {
        await import('./motion/anime.js'); // validates the CDN is reachable

        // Concern modules are imported and initialised here in Tasks 3-7.
        // Intentionally empty in Task 2.
        void prefersReducedMotion;
    } catch (err) {
        document.documentElement.classList.add('no-motion');
        console.warn('[motion] animation layer disabled:', err);
    }
}

boot();
```

- [ ] **Step 4: Wire `index.html`**

Find:
```html
  <!-- Functional UI (always loads) -->
  <script type="module" src="/js/ui.js"></script>
```
Replace with:
```html
  <!-- Functional UI (always loads) -->
  <script type="module" src="/js/ui.js"></script>

  <!-- Animation layer (anime.js v4, ESM) -->
  <link rel="modulepreload" href="/js/main.js" />
  <link rel="modulepreload" href="/js/motion/anime.js" />
  <script type="module" src="/js/main.js"></script>
```

- [ ] **Step 5: Verify the happy path**

- Reload `http://localhost:8123`.
- `read_network_requests` `{ urlPattern: "jsdelivr" }` → a request to `.../animejs@4/lib/anime.esm.min.js` with status 200.
- `read_console_messages` `{ onlyErrors: true }` → `[]` (no `[motion]` warning).
- `javascript_tool`: `document.documentElement.classList.contains('no-motion')` → `false`.
- Hero boot animation still plays (v3). Canvas still animates (v3).

- [ ] **Step 6: Verify the fallback path**

- `javascript_tool` to simulate an unreachable CDN by re-running the boot logic against a bad URL:
```js
(async () => {
  try { await import('https://cdn.jsdelivr.net/npm/animejs@4/lib/DOES_NOT_EXIST.js'); }
  catch (e) { document.documentElement.classList.add('no-motion'); }
  return document.documentElement.classList.contains('no-motion');
})()
```
Expected: `true`, and the page remains fully readable/scrollable (nav, menu, links still work — those are `ui.js`).
- Reload to clear the manually-added class before committing.

- [ ] **Step 7: Commit**

```bash
git add js/motion/anime.js js/motion/env.js js/main.js index.html
git commit -m "feat: add anime.js v4 ESM infrastructure alongside v3

js/motion/anime.js re-exports v4 from jsDelivr; js/motion/env.js holds the
shared reduced-motion + viewport helpers; js/main.js bootstraps the layer
and falls back to <html class=no-motion> on CDN failure. Nothing is ported
yet — v3 script.js still drives all animation.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Port the circuit engine to `js/motion/circuit.js`

Move the canvas engine to v4, replace the ~120 infinite `anime()` pulse instances with plain RAF math, gate the render loop with `pauseWhenOffscreen`, and add the `staticFrame` + `circuit` export surface. Faithful visuals otherwise.

**Files:**
- Create: `js/motion/circuit.js` (ported from `script.js` `initializeCircuitAnimation`, lines ~29–505)
- Modify: `js/main.js` (import + call)
- Modify: `script.js` (remove circuit code + its call; neutralise the `circuitEngine` reference in the v3 hero timeline)
- Test: manual

**Interfaces:**
- Consumes: `pauseWhenOffscreen`, (indirectly) `prefersReducedMotion` via the `staticFrame` arg passed by `main.js`; `animate`, `utils` from `motion/anime.js` — import as `import { animate, utils } from './anime.js'`. Springs: `import { createSpring } from './anime.js'` — add `createSpring` to the `motion/anime.js` re-export list.
- Produces:
  - `initCircuit({ staticFrame = false } = {}): void`
  - `export const circuit` — a live object, mutated (never reassigned) by `initCircuit`:
    - `circuit.ready: boolean` (false until `initCircuit` finishes wiring)
    - `circuit.triggerSurge(x: number, y: number, intensity?: number): void`
    - `circuit.createSparks(x: number, y: number, count: number, color: string): void`
    - `circuit.setPointer(x: number, y: number): void` — sets the internal mouse target; `x`/`y` are hero-relative px.

- [ ] **Step 1: Add `createSpring` to `js/motion/anime.js`**

Edit the export list in `js/motion/anime.js` to include `createSpring`:
```js
export {
    animate,
    createTimeline,
    createTimer,
    createSpring,
    stagger,
    svg,
    utils,
    onScroll,
    engine,
} from 'https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js';
```

- [ ] **Step 2: Create `js/motion/circuit.js`**

Port `initializeCircuitAnimation` from `script.js`. Keep verbatim: `resize`, `generateCircuitGraph` (graph/trace generation), `getPointOnTrace`, the entire `render()` drawing of traces / nodes / ICs / pads / vias / sparks / mouse gradient. Apply the changes below.

```js
/**
 * Cyber-circuit / IoT canvas engine.
 * Linear pulse motion = plain RAF math. Event-driven surges/sparks = anime.js springs.
 * The render loop only runs while the hero is on-screen and the tab is visible.
 */
import { animate, utils, createSpring } from './anime.js';
import { pauseWhenOffscreen } from './env.js';

export const circuit = { ready: false };

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function initCircuit({ staticFrame = false } = {}) {
    const canvas = document.getElementById('circuit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroSection = document.querySelector('.hero');
    let rafId = null;
    let lastT = 0;
    let width, height;
    let nodes = [];
    let traces = [];
    let pulses = [];
    let particles = [];
    const mouse = { x: -1000, y: -1000, active: false };

    function resize() {
        const rect = heroSection.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        generateCircuitGraph();
    }

    function generateCircuitGraph() {
        // === UNCHANGED from script.js: node grid + IC placement + trace routing ===
        // (copy the body verbatim, EXCEPT the pulse-generation block at the end)
        // ...

        // Pulses: plain data, no anime.js. Progress advanced in the render loop.
        pulses = [];
        if (!staticFrame) {
            traces.forEach((trace, traceIdx) => {
                const pulseCount = trace.length > 150 ? 2 : 1;
                for (let p = 0; p < pulseCount; p++) {
                    pulses.push({
                        traceIndex: traceIdx,
                        progress: Math.random(),
                        speed: 0.003 + Math.random() * 0.005, // per-frame at 60fps
                        dir: Math.random() > 0.5 ? 1 : -1,
                        size: 2.5 + Math.random() * 1.5,
                        color: Math.random() > 0.35 ? 'hsl(187, 95%, 65%)' : 'hsl(163, 95%, 60%)',
                        alpha: 0.85,
                    });
                }
            });
        }
    }

    function getPointOnTrace(trace, progress) {
        // === UNCHANGED from script.js ===
        // ...
    }

    function triggerElectricSurge(originX, originY, intensity = 1) {
        if (staticFrame || !nodes.length) return;
        const sorted = nodes
            .map(n => ({ node: n, dist: Math.hypot(n.x - originX, n.y - originY) }))
            .sort((a, b) => a.dist - b.dist);
        const targets = sorted.slice(0, Math.min(6, nodes.length));

        targets.forEach((item, i) => {
            const node = item.node;
            animate(node, {
                glow: [0.3, 1 * intensity, 0.3],
                scale: [1, 1.4 * intensity, 1],
                activity: [0.1, 1, 0.1],
                duration: 900,
                delay: i * 60,
                ease: createSpring({ stiffness: 80, damping: 10 }),
            });
            createSparks(node.x, node.y, Math.round(6 * intensity), node.color);
            node.connections.forEach(tIdx => {
                if (traces[tIdx]) {
                    animate(traces[tIdx], {
                        activeGlow: [0, 1, 0],
                        duration: 800,
                        delay: i * 60 + 50,
                        ease: 'outQuad',
                    });
                }
            });
        });
    }

    function createSparks(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3.5;
            const spark = {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 1.8,
                alpha: 1,
                color: color || 'hsl(187, 100%, 75%)',
            };
            particles.push(spark);
            animate(spark, {
                alpha: [1, 0],
                radius: [spark.radius, 0.2],
                duration: utils.random(500, 900),
                ease: 'outCubic',
                onComplete: () => {
                    const idx = particles.indexOf(spark);
                    if (idx > -1) particles.splice(idx, 1);
                },
            });
        }
    }

    function advancePulses(dtFrames) {
        for (const pulse of pulses) {
            pulse.progress += pulse.speed * pulse.dir * dtFrames;
            if (pulse.progress >= 1) { pulse.progress = 1; pulse.dir = -1; }
            else if (pulse.progress <= 0) { pulse.progress = 0; pulse.dir = 1; }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        // === UNCHANGED from script.js render(): sections 1-5 (traces, pulses,
        // nodes/ICs, particles, mouse gradient). For section 2, read pulse.progress
        // directly (it is already 0..1); drop the `((p % 1) + 1) % 1` wrap. ===
        // ...
    }

    function loop(t) {
        const dtFrames = lastT ? Math.min((t - lastT) / 16.667, 3) : 1;
        lastT = t;
        advancePulses(dtFrames);
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (rafId == null) { lastT = 0; rafId = requestAnimationFrame(loop); }
    }
    function stop() {
        if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Wire the public surface before any early return.
    circuit.triggerSurge = triggerElectricSurge;
    circuit.createSparks = createSparks;
    circuit.setPointer = (x, y) => { mouse.x = x; mouse.y = y; mouse.active = true; };
    circuit.ready = true;

    window.addEventListener('resize', debounce(resize, 200));
    resize();

    if (staticFrame) { draw(); return; } // one frame, no loop, no listeners

    pauseWhenOffscreen(heroSection, { onEnter: start, onLeave: stop });

    heroSection.addEventListener('mousemove', function (e) {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });
    heroSection.addEventListener('mouseleave', () => { mouse.active = false; });
    heroSection.addEventListener('click', function (e) {
        const rect = heroSection.getBoundingClientRect();
        triggerElectricSurge(e.clientX - rect.left, e.clientY - rect.top, 1.4);
    });
}
```

Notes for the port:
- The v3 `render()` referenced `mouse.active && width > 768` for the gradient — keep that.
- v3 `node` objects already carry `glow`, `scale`, `activity`, `baseX`, `baseY`, `connections` — keep them; `animate(node, {...})` mutates the same properties `draw()` reads.
- Do not start any RAF when `staticFrame` is true; `pulses` is empty in that mode so `draw()` renders a still board.

- [ ] **Step 3: Call it from `js/main.js`**

Replace the body of the `try` block in `boot()`:
```js
        await import('./motion/anime.js');

        const { initCircuit } = await import('./motion/circuit.js');
        initCircuit({ staticFrame: prefersReducedMotion() });
```

- [ ] **Step 4: Remove circuit code from `script.js`**

- Delete the function `initializeCircuitAnimation` (entire body).
- In the `DOMContentLoaded` `if (typeof anime !== 'undefined')` block, delete the line `initializeCircuitAnimation();`.
- Keep `let circuitEngine = null;` where it is. Nothing assigns it now, so the v3 `initializeHeroTimeline` guard `if (circuitEngine)` is simply falsy until Task 4 replaces that timeline. (No ReferenceError.)
- Keep the local `debounce` in `script.js` (still used by nothing there now, but harmless; deleted with the file in Task 8).

- [ ] **Step 5: Verify**

- Reload. `read_console_messages` `{ onlyErrors: true }` → `[]`.
- Screenshot the hero: PCB traces, glowing pads/vias, labelled ICs, moving pulses — visually equivalent to before.
- Click inside the hero → surge: nearby nodes flash/scale with a spring, sparks burst, adjacent traces light up.
- Scroll down past the hero, then `javascript_tool`:
```js
// rAF should be parked while the hero is off-screen
(() => { let n = 0; const id = requestAnimationFrame(function f(){ n++; if(n<5) requestAnimationFrame(f); }); return 'scheduled'; })()
```
  Then take a Performance trace in DevTools (human step) OR add a temporary `console.count('draw')` inside `draw()`, confirm it stops incrementing when the hero is scrolled out, and remove it before committing.
- Switch to another tab and back — canvas pauses and resumes (no error).
- DevTools → emulate `prefers-reduced-motion: reduce`, reload: the canvas shows a single static PCB frame, no pulses moving; `javascript_tool` `performance.now()` twice a second apart with the tab focused — no continuous repaint (verify via DevTools FPS meter staying idle).

- [ ] **Step 6: Commit**

```bash
git add js/motion/anime.js js/motion/circuit.js js/main.js script.js
git commit -m "feat: port canvas circuit engine to anime.js v4 module

Linear pulse motion moves to plain RAF math (removes ~120 infinite anime
instances); the render loop is now gated by pauseWhenOffscreen so it stops
when the hero leaves the viewport or the tab is hidden; staticFrame renders
a single still frame for prefers-reduced-motion. Exposes circuit.setPointer
/ triggerSurge / createSparks for the hero module.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Port the hero timeline + add badge scramble & pointer parallax

**Files:**
- Create: `js/motion/hero.js` (boot timeline ported from `script.js` `initializeHeroTimeline`, lines ~510–579; scramble + parallax are new)
- Modify: `js/motion/circuit.js` (add cursor node-attraction + spring-back in `draw()`)
- Modify: `js/main.js` (import + call)
- Modify: `script.js` (remove `initializeHeroTimeline` + its call)
- Test: manual

**Interfaces:**
- Consumes: `createTimeline`, `stagger`, `utils` from `./anime.js`; `prefersReducedMotion` from `./env.js`; `circuit` from `./circuit.js`.
- Produces: `initHero(): void`.

- [ ] **Step 1: Add cursor node-attraction to `js/motion/circuit.js`**

Inside `draw()`, before the node-drawing section, add:
```js
        // Cursor magnetism: pull nearby nodes toward the pointer, spring back when idle.
        for (const node of nodes) {
            if (mouse.active && width > 768) {
                const dx = mouse.x - node.baseX;
                const dy = mouse.y - node.baseY;
                const dist = Math.hypot(dx, dy);
                if (dist < 160) {
                    const pull = (1 - dist / 160) * 12;
                    node.x += ((node.baseX + (dx / dist) * pull) - node.x) * 0.12;
                    node.y += ((node.baseY + (dy / dist) * pull) - node.y) * 0.12;
                    continue;
                }
            }
            node.x += (node.baseX - node.x) * 0.08; // ease home
            node.y += (node.baseY - node.y) * 0.08;
        }
```
(`node.x/y` are what `draw()` and trace routing read; `baseX/baseY` are the procedural home set in `generateCircuitGraph`.)

- [ ] **Step 2: Create `js/motion/hero.js`**

```js
/**
 * Hero: system-boot timeline + decorative badge scramble + subtle pointer parallax.
 * The <h1> and description text are never split or injected — only revealed.
 */
import { createTimeline, stagger, utils } from './anime.js';
import { prefersReducedMotion } from './env.js';
import { circuit } from './circuit.js';

const HERO_SELECTOR =
    '#hero-badge, .hero-line, #hero-desc, #hero-buttons .btn, #hero-arrow';

export function initHero() {
    if (prefersReducedMotion()) {
        utils.set(utils.$(HERO_SELECTOR), { opacity: 1, translateY: 0, translateX: 0, scale: 1 });
        return;
    }
    buildBootTimeline();
    initBadgeScramble();
    initPointerParallax();
}

function buildBootTimeline() {
    const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 900 } });

    tl.add('#hero-badge', {
        opacity: [0, 1], translateY: [-25, 0], scale: [0.85, 1],
        duration: 850, ease: 'outElastic(1, .6)',
    })
    .add('.hero-line', {
        opacity: [0, 1], translateY: [45, 0],
        clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
        delay: stagger(140), duration: 950,
    }, '-=550')
    .add('#hero-desc', {
        opacity: [0, 1], translateY: [25, 0], duration: 800, ease: 'outCubic',
    }, '-=600')
    .add('#hero-buttons .btn', {
        opacity: [0, 1], translateY: [25, 0], scale: [0.92, 1],
        delay: stagger(90), duration: 850, ease: 'outBack',
    }, '-=500')
    .add('#hero-arrow', {
        opacity: [0, 1], translateY: [15, 0], duration: 700, ease: 'outCubic',
        onComplete: () => {
            const hero = document.querySelector('.hero');
            if (circuit.ready && hero) {
                const r = hero.getBoundingClientRect();
                circuit.triggerSurge(r.width / 2, r.height * 0.4, 1.2);
            }
        },
    }, '-=400');
}

function initBadgeScramble() {
    const el = document.querySelector('.hero-badge-text');
    if (!el) return;
    const original = el.textContent;
    el.dataset.label = original;
    const CHARS = '!<>-_\\/[]{}—=+*^?#________';

    function scrambleOnce() {
        const start = performance.now();
        const DURATION = 600;
        function frame(now) {
            const p = Math.min((now - start) / DURATION, 1);
            const reveal = Math.floor(p * original.length);
            let out = original.slice(0, reveal);
            for (let i = reveal; i < original.length; i++) {
                out += original[i] === ' '
                    ? ' '
                    : CHARS[(Math.random() * CHARS.length) | 0];
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(frame);
            else el.textContent = original;
        }
        requestAnimationFrame(frame);
    }

    setInterval(scrambleOnce, 8000);
}

function initPointerParallax() {
    const hero = document.querySelector('.hero');
    const content = document.querySelector('.hero-content');
    if (!hero || !content) return;

    let queued = false;
    let lastX = 0, lastY = 0;

    hero.addEventListener('pointermove', (e) => {
        if (window.innerWidth < 768) return;
        const r = hero.getBoundingClientRect();
        lastX = e.clientX - r.left;
        lastY = e.clientY - r.top;
        if (circuit.ready) circuit.setPointer(lastX, lastY);
        if (!queued) {
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                const r2 = hero.getBoundingClientRect();
                const nx = (lastX / r2.width - 0.5) * 2;   // -1..1
                const ny = (lastY / r2.height - 0.5) * 2;
                content.style.transform = `translate(${(-nx * 6).toFixed(2)}px, ${(-ny * 6).toFixed(2)}px)`;
            });
        }
    });

    hero.addEventListener('pointerleave', () => {
        content.style.transform = 'translate(0, 0)';
    });
}
```

- [ ] **Step 3: Call it from `js/main.js`**

Update the `try` block so the concern modules load together:
```js
        await import('./motion/anime.js');

        const [{ initCircuit }, { initHero }] = await Promise.all([
            import('./motion/circuit.js'),
            import('./motion/hero.js'),
        ]);

        initCircuit({ staticFrame: prefersReducedMotion() });
        initHero();
```

- [ ] **Step 4: Remove the v3 hero timeline from `script.js`**

- Delete the function `initializeHeroTimeline` (entire body).
- In the `DOMContentLoaded` `if` block, delete the line `initializeHeroTimeline();`.
- You may now also delete `let circuitEngine = null;` (nothing references it anymore).

- [ ] **Step 5: Verify**

- Reload. `read_console_messages` `{ onlyErrors: true }` → `[]`.
- Watch the boot: badge → two title lines wiping in top-to-bottom (clip) staggered → description → buttons popping → arrow → a circuit surge fires from mid-hero.
- Wait ~8 s: `.hero-badge-text` scrambles for ~0.6 s and resettles to exactly `⚡ SYSTEM: ONLINE // CIRCUITS & FULL-STACK`. `javascript_tool`: `document.querySelector('.hero-badge-text').dataset.label` → the original string; after a scramble, `.textContent` equals `.dataset.label`.
- Desktop pointer move across the hero: `.hero-content` shifts at most 6 px; circuit nodes lean toward the cursor and spring home on `pointerleave`. `javascript_tool`:
```js
getComputedStyle(document.querySelector('.hero-content')).transform
```
  → a `matrix(...)` with translate components within ±6.
- `resize_window` `{ preset: "mobile" }`, reload → no parallax on touch-drag; boot still plays.
- DevTools emulate `prefers-reduced-motion: reduce`, reload → hero fully visible instantly, no scramble ever (`setInterval` not armed), no parallax.
- `resize_window` `{ preset: "desktop" }`.

- [ ] **Step 6: Commit**

```bash
git add js/motion/circuit.js js/motion/hero.js js/main.js script.js
git commit -m "feat: port hero boot timeline to v4, add badge scramble + pointer parallax

Boot sequence rebuilt with createTimeline; title lines now wipe in via
clip-path. New: decorative scramble on .hero-badge-text only (original kept
in data-label), and a <=6px desktop pointer parallax on .hero-content that
also feeds circuit.setPointer for cursor node-magnetism. All gated by
prefers-reduced-motion.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Port scroll reveals + add scrubbed scroll-driven effects + reading-progress bar

**Files:**
- Create: `js/motion/scroll.js` (reveals ported from `script.js` `initializeScrollAnimations`, lines ~584–719; scrubbed effects + progress bar are new)
- Modify: `index.html` (add `.read-progress` element)
- Modify: `style.css` (add `.read-progress` rule)
- Modify: `js/main.js` (import + call)
- Modify: `script.js` (remove `initializeScrollAnimations` + call)
- Test: manual

**Interfaces:**
- Consumes: `animate`, `stagger`, `onScroll`, `utils` from `./anime.js`; `whenVisible`, `prefersReducedMotion` from `./env.js`.
- Produces: `initScroll(): void`.

- [ ] **Step 1: Add the progress-bar element to `index.html`**

Inside `<header class="header" id="header">`, as the first child (before `<nav class="nav">`):
```html
    <div class="read-progress" id="read-progress" aria-hidden="true"></div>
```

- [ ] **Step 2: Add `.read-progress` to `style.css`**

Add near the `.header` rules (after line ~134):
```css
.read-progress {
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 100%;
    height: 2px;
    transform: scaleX(0);
    transform-origin: left center;
    background: var(--gradient-primary);
    pointer-events: none;
}
```

- [ ] **Step 3: Create `js/motion/scroll.js`**

```js
/**
 * Scroll reveals (one-shot, via whenVisible) + at most four scrubbed
 * scroll-driven effects (via onScroll({ sync })), including the reading bar.
 */
import { animate, stagger, onScroll, utils } from './anime.js';
import { whenVisible, prefersReducedMotion } from './env.js';

const REVEAL_TARGETS =
    '.section-title, .section-description, .specialty-card, .skill-category, .skill-tag, .project-card';

export function initScroll() {
    if (prefersReducedMotion()) {
        utils.set(utils.$(REVEAL_TARGETS), { opacity: 1, translateY: 0, scale: 1 });
        utils.set('#read-progress', { scaleX: 0 });
        return;
    }
    initReveals();
    initScrollDriven();
}

function reveal(targets, { y = 28, scale, delay = 0, trigger } = {}) {
    if (!targets.length) return;
    utils.set(targets, { opacity: 0, translateY: y, ...(scale ? { scale } : {}) });
    whenVisible(trigger || targets[0], () => {
        animate(targets, {
            opacity: [0, 1],
            translateY: [y, 0],
            ...(scale ? { scale: [scale, 1] } : {}),
            delay: delay ? stagger(delay) : 0,
            duration: 800,
            ease: 'outCubic',
        });
    });
}

function initReveals() {
    utils.$('.section-title, .section-description').forEach(el => reveal([el], { y: 25 }));

    const specialties = utils.$('.specialty-card');
    reveal(specialties, { y: 35, scale: 0.95, delay: 100, trigger: document.querySelector('.specialties') });

    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
        const categories = utils.$('.skill-category', skillsGrid);
        const tags = utils.$('.skill-tag', skillsGrid);
        utils.set(categories, { opacity: 0, translateY: 30 });
        utils.set(tags, { opacity: 0, scale: 0.7 });
        whenVisible(skillsGrid, () => {
            animate(categories, {
                opacity: [0, 1], translateY: [30, 0],
                delay: stagger(120), duration: 800, ease: 'outCubic',
                onComplete: () => animate(tags, {
                    opacity: [0, 1], scale: [0.7, 1],
                    delay: stagger(35), duration: 600, ease: 'outBack',
                }),
            });
        });
    }

    const projectCards = utils.$('.project-card');
    reveal(projectCards, { y: 40, scale: 0.96, delay: 110, trigger: document.querySelector('.projects-grid') });
}

function initScrollDriven() {
    const hero = document.querySelector('.hero');

    // 1. Hero content fades + lifts as the hero scrolls away.
    animate('.hero-content', {
        opacity: [1, 0.3], translateY: [0, -40],
        autoplay: onScroll({ target: hero, enter: 'bottom bottom', leave: 'bottom top', sync: 0.4 }),
    });

    // 2. Reading-progress bar bound to whole-page scroll.
    animate('#read-progress', {
        scaleX: [0, 1],
        autoplay: onScroll({ target: document.documentElement, enter: 'top top', leave: 'bottom bottom', sync: 0.2 }),
    });

    // 3. Hero particles drift.
    animate('.hero-particles', {
        translateY: [0, -60],
        autoplay: onScroll({ target: hero, enter: 'top top', leave: 'bottom top', sync: 0.5 }),
    });

    // 4. Section-heading gradient text parallax.
    animate('.section-title .gradient-text', {
        translateY: [10, -10],
        autoplay: onScroll({ enter: 'bottom top', leave: 'top bottom', sync: 0.6 }),
    });
}
```

- [ ] **Step 4: Call it from `js/main.js`**

```js
        const [{ initCircuit }, { initHero }, { initScroll }] = await Promise.all([
            import('./motion/circuit.js'),
            import('./motion/hero.js'),
            import('./motion/scroll.js'),
        ]);

        initCircuit({ staticFrame: prefersReducedMotion() });
        initHero();
        initScroll();
```

- [ ] **Step 5: Remove the v3 scroll code from `script.js`**

- Delete the function `initializeScrollAnimations` (entire body).
- In the `DOMContentLoaded` `if` block, delete `initializeScrollAnimations();`.

- [ ] **Step 6: Verify**

- Reload. `read_console_messages` `{ onlyErrors: true }` → `[]`.
- Scroll slowly through the page:
  - Section titles/descriptions fade+rise once on entry.
  - Specialty cards stagger in; skill categories stagger, then their tags pop; project cards stagger.
  - The 2px bar under the header grows left→right from 0 to full as you reach the bottom. `javascript_tool` at bottom: `getComputedStyle(document.getElementById('read-progress')).transform` → `matrix(1, 0, 0, 1, 0, 0)` (scaleX ≈ 1).
  - Leaving the hero, `.hero-content` fades toward 0.3 opacity and lifts.
  - `.hero-particles` drift upward slightly; heading gradient text has a small parallax.
- `read_page` after scrolling: every section's text is present and fully opaque (no stuck-hidden content).
- Count scrubbed animations in `initScrollDriven` = exactly 4 (Global Constraint).
- DevTools emulate `prefers-reduced-motion: reduce`, reload → everything visible immediately, bar stays at `scaleX(0)`, nothing scrubs on scroll.

- [ ] **Step 7: Commit**

```bash
git add js/motion/scroll.js js/main.js script.js index.html style.css
git commit -m "feat: port scroll reveals to v4 module, add scrubbed scroll-driven effects

Reveals now fire via whenVisible + animate (deterministic). New scroll-driven
layer (exactly four onScroll sync animations, transform/opacity only): hero
content fade-lift, reading-progress bar, particle drift, heading parallax.
Fully bypassed under prefers-reduced-motion.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Icon line-drawing — `js/motion/svg.js`

New feature. Stroked icon children draw themselves in; filled children fade+scale. Triggered per container so it staggers naturally and only runs when visible.

**Files:**
- Create: `js/motion/svg.js`
- Modify: `js/main.js` (import + call)
- Test: manual

**Interfaces:**
- Consumes: `animate`, `stagger`, `svg`, `utils` from `./anime.js`; `whenVisible`, `prefersReducedMotion` from `./env.js`.
- Produces: `initSVG(): void`.

- [ ] **Step 1: Create `js/motion/svg.js`**

```js
/**
 * Line-drawing for card icons. Stroked shapes use svg draw; filled shapes
 * (polygons, chip pins) fade + scale in. Runs once per container on reveal.
 */
import { animate, stagger, svg, utils } from './anime.js';
import { whenVisible, prefersReducedMotion } from './env.js';

const ICON_SELECTOR = '.specialty-icon svg, .project-icon svg';

function partsOf(svgEl) {
    const strokable = [...svgEl.querySelectorAll('path, line, polyline, circle, rect, ellipse')]
        .filter(el => getComputedStyle(el).stroke !== 'none' && getComputedStyle(el).stroke !== '');
    const filled = [...svgEl.querySelectorAll('polygon')]
        .concat([...svgEl.querySelectorAll('[fill]')].filter(el => {
            const f = el.getAttribute('fill');
            return f && f !== 'none';
        }));
    return { strokable, filled };
}

function prime(svgEl) {
    const { strokable, filled } = partsOf(svgEl);
    if (strokable.length) utils.set(svg.createDrawable(strokable), { draw: '0 0' });
    if (filled.length) utils.set(filled, { opacity: 0, scale: 0.6 });
}

function drawIcon(svgEl) {
    const { strokable, filled } = partsOf(svgEl);
    if (strokable.length) {
        animate(svg.createDrawable(strokable), {
            draw: ['0 0', '0 1'],
            duration: 900, delay: stagger(80), ease: 'inOutQuad',
        });
    }
    if (filled.length) {
        animate(filled, {
            opacity: [0, 1], scale: [0.6, 1],
            duration: 500, delay: stagger(80, { start: 300 }), ease: 'outBack',
        });
    }
}

export function initSVG() {
    const icons = utils.$(ICON_SELECTOR);
    if (!icons.length) return;

    if (prefersReducedMotion()) {
        icons.forEach(svgEl => {
            const { strokable, filled } = partsOf(svgEl);
            if (strokable.length) utils.set(svg.createDrawable(strokable), { draw: '0 1' });
            if (filled.length) utils.set(filled, { opacity: 1, scale: 1 });
        });
        return;
    }

    icons.forEach(prime);
    ['.specialties', '.projects-grid'].forEach(sel => {
        const scope = document.querySelector(sel);
        if (scope) whenVisible(scope, () => scope.querySelectorAll('svg').forEach(drawIcon));
    });
}
```

- [ ] **Step 2: Call it from `js/main.js`**

```js
        const [{ initCircuit }, { initHero }, { initScroll }, { initSVG }] = await Promise.all([
            import('./motion/circuit.js'),
            import('./motion/hero.js'),
            import('./motion/scroll.js'),
            import('./motion/svg.js'),
        ]);

        initCircuit({ staticFrame: prefersReducedMotion() });
        initHero();
        initScroll();
        initSVG();
```

- [ ] **Step 3: Verify**

- Reload. `read_console_messages` `{ onlyErrors: true }` → `[]`.
- Scroll to "Sobre Mim": each specialty-card icon draws its outline stroke over ~0.9 s, staggered; the lightning `<polygon>` in the 4th card fades+scales in slightly later.
- Scroll to "Projetos": project-card icons draw in; chip-pin `<rect>`s and any filled shapes fade+scale.
- No visible flash of fully-drawn icons before the reveal (they start blank). `javascript_tool` immediately after load, before scrolling:
```js
getComputedStyle(document.querySelector('.specialty-icon svg path')).strokeDashoffset
```
  → a non-zero value (primed hidden).
- DevTools emulate `prefers-reduced-motion: reduce`, reload → all icons fully drawn and visible immediately, no animation.

- [ ] **Step 4: Commit**

```bash
git add js/motion/svg.js js/main.js
git commit -m "feat: add SVG icon line-drawing on scroll reveal

Stroked icon children draw in via anime.js svg.createDrawable; filled
children (polygons, chip pins) fade+scale. Primed hidden to avoid flash,
triggered per container. Instant full-draw under prefers-reduced-motion.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Move hover states to CSS + Download-CV feedback module

**Files:**
- Modify: `style.css` (hover transitions with spring easing; the existing reduced-motion block already covers them)
- Create: `js/motion/interactions.js`
- Modify: `js/main.js` (import + call)
- Modify: `script.js` (remove `initializeInteractiveMicroAnimations` + call; the `DOMContentLoaded` block is now empty)
- Test: manual

**Interfaces:**
- Consumes: `animate` from `./anime.js`; `prefersReducedMotion` from `./env.js`.
- Produces: `initInteractions(): void`.

- [ ] **Step 1: Update hover rules in `style.css`**

Replace the existing `.project-icon` block (currently `width/height/color` + `transition: transform 0.3s ease;`) and its hover with:
```css
.project-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.project-card:hover .project-icon {
    transform: scale(1.15) rotate(6deg);
}
```

Add to the `.specialty-icon` block a transition, and a new hover rule:
```css
.specialty-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
    margin-bottom: 1rem;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.specialty-card:hover .specialty-icon {
    transform: translateY(-4px) scale(1.12);
}
```

In `.skill-tag`, change the transition easing and extend the hover transform:
```css
.skill-tag {
    /* ...unchanged declarations... */
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.skill-tag:hover {
    background: rgba(255, 255, 255, 0.13);
    border-color: hsl(187 65% 52% / 0.6);
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 4px 12px hsl(215 30% 4% / 0.4);
}
```

No new `@media (prefers-reduced-motion)` rules — the global block at `style.css:1405` already forces `transition-duration: 0.01ms !important` on everything.

- [ ] **Step 2: Create `js/motion/interactions.js`**

```js
/**
 * Small interaction feedback. Currently: the Download-CV button.
 * Home for contact-form button states when the form is re-enabled.
 */
import { animate } from './anime.js';
import { prefersReducedMotion } from './env.js';

export function initInteractions() {
    initCVFeedback();
}

function initCVFeedback() {
    const btn = document.getElementById('download-cv');
    if (!btn) return;

    let busy = false;
    btn.addEventListener('click', () => {
        if (busy) return;
        busy = true;

        const label = [...btn.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        const original = label ? label.textContent : null;
        if (label) label.textContent = ' Baixando… ';

        if (!prefersReducedMotion()) {
            animate(btn, { scale: [1, 0.96, 1], duration: 200, ease: 'outQuad' });
        }

        setTimeout(() => {
            if (label && original !== null) label.textContent = original;
            busy = false;
        }, 1200);
    });
}
```

- [ ] **Step 3: Call it from `js/main.js`**

```js
        const [{ initCircuit }, { initHero }, { initScroll }, { initSVG }, { initInteractions }] =
            await Promise.all([
                import('./motion/circuit.js'),
                import('./motion/hero.js'),
                import('./motion/scroll.js'),
                import('./motion/svg.js'),
                import('./motion/interactions.js'),
            ]);

        initCircuit({ staticFrame: prefersReducedMotion() });
        initHero();
        initScroll();
        initSVG();
        initInteractions();
```

- [ ] **Step 4: Strip `script.js` to nothing**

- Delete the function `initializeInteractiveMicroAnimations` (entire body).
- Delete `initializeFallbackAnimations` (its role is replaced by `.no-motion` CSS in Task 8).
- Delete the now-empty `DOMContentLoaded` handler and the `if (typeof anime !== 'undefined')` block, and the leftover `debounce`.
- `script.js` should now be empty (or contain only a top comment). Leave the file — Task 8 deletes it.

- [ ] **Step 5: Verify**

- Reload. `read_console_messages` `{ onlyErrors: true }` → `[]`.
- Hover a project card → icon scales to 1.15 and rotates 6° with a springy overshoot; leaving returns it smoothly.
- Hover a specialty card → its icon lifts and scales.
- Hover a skill tag → scales to ~1.08 with existing bg/border/shadow change.
- Click "Download CV" → label becomes "Baixando…" for 1.2 s and the button does a quick scale pulse; the `CV.pdf` download starts (browser download prompt / file). After 1.2 s the label reads "Download CV" again. Rapid double-click does not stack (guarded by `busy`).
- `javascript_tool`: `getComputedStyle(document.querySelector('.project-icon')).transitionTimingFunction` → `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- DevTools emulate `prefers-reduced-motion: reduce`, reload → hovers produce no transform; CV click still swaps the label (functional feedback) but no scale pulse.

- [ ] **Step 6: Commit**

```bash
git add style.css js/motion/interactions.js js/main.js script.js
git commit -m "feat: move hover micro-interactions to CSS, add Download-CV feedback

Project/specialty icon and skill-tag hovers are now pure CSS transitions
with spring easing (existing reduced-motion block covers them), removing
~100 lines of JS. New interactions.js gives the CV button a label swap +
scale pulse on click. script.js is now empty.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Remove anime.js v3, add `.no-motion` fallback CSS, full verification

**Files:**
- Modify: `index.html` (drop the v3 `<script>` tag and `script.js` tag)
- Delete: `script.js`
- Modify: `style.css` (add `.no-motion` rules)
- Test: manual + Lighthouse

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new.

- [ ] **Step 1: Remove v3 from `index.html`**

Delete these lines:
```html
  <!-- Anime.js Animation Engine (v3 — removed in migration Task 8) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
  <script src="script.js"></script>
```
The script section at the end of `<body>` should now be exactly:
```html
  <!-- Functional UI (always loads) -->
  <script type="module" src="/js/ui.js"></script>

  <!-- Animation layer (anime.js v4, ESM) -->
  <link rel="modulepreload" href="/js/main.js" />
  <link rel="modulepreload" href="/js/motion/anime.js" />
  <script type="module" src="/js/main.js"></script>
```

- [ ] **Step 2: Delete `script.js`**

```bash
git rm script.js
```

- [ ] **Step 3: Add `.no-motion` fallback rules to `style.css`**

Add just before the `/* Reduced motion */` block near the end:
```css
/* CDN failure fallback: js/main.js sets <html class="no-motion"> */
.no-motion #hero-badge,
.no-motion .hero-line,
.no-motion #hero-desc,
.no-motion #hero-buttons .btn,
.no-motion #hero-arrow,
.no-motion .section-title,
.no-motion .section-description,
.no-motion .specialty-card,
.no-motion .skill-category,
.no-motion .skill-tag,
.no-motion .project-card {
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
}

.no-motion .specialty-icon svg *,
.no-motion .project-icon svg * {
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
}

.no-motion .read-progress {
    display: none;
}
```

- [ ] **Step 4: Verify — full behavioral pass**

Run the whole verification table from `docs/anime-v4-migration.md` §5:

1. **Visual parity** — reload; boot sequence, all scroll reveals, hovers, canvas surge on hero click all work as in Task 7.
2. **`prefers-reduced-motion`** — DevTools Rendering → emulate `reduce`, reload: hero static instantly; canvas is one still frame with no repaint (DevTools FPS meter idle); no scroll scrubbing; icons fully drawn; bar hidden; hovers inert.
3. **CDN failure** — DevTools → Network → right-click `cdn.jsdelivr.net` request → Block request domain → reload. Expect: `<html class="no-motion">` (`javascript_tool`: `document.documentElement.className`), all sections visible and readable, nav/menu/smooth-scroll/CV-download/mailto all functional. Remove the block, reload.
4. **Offscreen RAF** — scroll past the hero; DevTools Performance record 3 s → no scripting from `circuit.js` `loop`/`draw`. Scroll hero back → repaint resumes.
5. **Hidden tab** — switch tab 5 s, return → no error, canvas resumes.
6. **Cross-browser** — load `http://localhost:8123` in Firefox and Safari: no console errors; boot timeline, `onScroll` scrubbing, and `svg` draw all render. If Safari `onScroll({ sync })` stutters, raise the `sync` values (more smoothing) — do not exceed 4 scrubbed animations.
7. **UI independence** — `javascript_tool`: `document.documentElement.classList.add('no-motion')` then exercise nav, mobile menu (`resize_window` mobile), smooth scroll, footer year, Escape-dismiss toast — all work. Reload to clear.

- [ ] **Step 5: Verify — Lighthouse mobile ≥ 90**

With the preview running on `http://localhost:8123`:
```bash
npx --yes lighthouse http://localhost:8123 --only-categories=performance --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --chrome-flags="--headless" --output=json --output-path=./lighthouse-mobile.json --quiet
```
Then read the score:
```bash
node -e "console.log('perf', JSON.parse(require('fs').readFileSync('lighthouse-mobile.json')).categories.performance.score * 100)"
```
Expected: `perf` ≥ 90, and `cumulative-layout-shift` audit numericValue ≈ 0. If below 90, inspect the `diagnostics` / `bootup-time` / `mainthread-work-breakdown` audits: likely culprits are the canvas (confirm it is parked offscreen) or too many scrubbed animations. Do not add libraries. Delete `lighthouse-mobile.json` after (it is untracked; do not commit it).

- [ ] **Step 6: Commit**

```bash
git add index.html style.css
git rm script.js
git commit -m "feat: remove anime.js v3, complete migration to v4

Drops the v3 CDN script and the monolithic script.js. Adds .no-motion
fallback CSS so a v4 CDN failure still renders every section. Verified:
visual parity, prefers-reduced-motion static state, CDN-failure degradation,
offscreen RAF parking, cross-browser, and Lighthouse mobile Performance >= 90.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage** (against `docs/anime-v4-migration.md`):

| Spec item | Task |
|---|---|
| Migrate to v4, ESM via CDN, no build | 2 (infra), 3–7 (port), 8 (remove v3) |
| `script.js` → ES modules + `ui.js` + `main.js` | 1 (ui.js), 2 (main.js), 3–7 (motion/*) |
| `motion/anime.js` single CDN point, versioned URL | 2 (created), 3 (+`createSpring`) |
| `motion/env.js` sole reduced-motion + viewport source | 2 |
| Fallback via `.no-motion` class + `try/catch` | 2 (JS), 8 (CSS) |
| Circuit: pulses off anime.js → RAF math | 3 |
| Circuit: RAF gated by viewport + tab visibility | 3 (`pauseWhenOffscreen`) |
| Circuit: `staticFrame` one frame for reduced-motion | 3 |
| Circuit: `setPointer` + cursor node-attraction | 3 (surface), 4 (attraction in draw) |
| Hero: boot timeline v4 | 4 |
| Hero: title reveal by line with clip, never per-char | 4 (`clipPath` on `.hero-line`) |
| Hero: scramble only on `.hero-badge-text`, original in `data-label` | 4 |
| Hero: parallax ≤ ±6px, desktop, feeds circuit | 4 |
| Scroll: reveals ported | 5 (via `whenVisible` — deviation 1) |
| Scroll: ≤ 4 scrubbed `onScroll` effects | 5 (exactly 4) |
| Scroll: reading-progress bar | 5 (`index.html` + `style.css` + `scroll.js`) |
| SVG: line-drawing, stroke vs filled rule, per-container trigger | 6 |
| SVG: logo animado out of scope | not implemented (correct) |
| Hover → CSS + reduced-motion via existing block | 7 (deviation 4) |
| `interactions.js` = toast + CV feedback; form dormant | 7 (CV only; toast = CSS, deviation 2) |
| Single plan / incremental / frequent commits | 8 tasks, 1 commit each |
| Verification: 8-check table + Lighthouse mobile | 8 |
| Scope = `index.html` only | all tasks |
| No deps beyond anime.js v4 | enforced in Global Constraints |

No gaps. The four deviations are listed up front with rationale and are UX-equivalent.

**2. Placeholder scan:** The port steps for `circuit.js` (Task 3 Step 2) use `// === UNCHANGED from script.js ... ===` markers for the large verbatim regions (graph generation, `getPointOnTrace`, the drawing body). This is deliberate: the source is a specific, named function in a file in the repo, and the changed regions *are* shown in full. Every genuinely new or modified region has complete code. No "TBD", no "add error handling", no undefined references.

**3. Type consistency:**
- `circuit` export shape (`ready`, `triggerSurge`, `createSparks`, `setPointer`) — defined Task 3, consumed Task 4 (`circuit.ready`, `circuit.triggerSurge`, `circuit.setPointer`). Match.
- `initCircuit({ staticFrame })` — defined Task 3, called with `{ staticFrame: prefersReducedMotion() }` Tasks 3–7. Match.
- `whenVisible(el, cb, opts)` / `pauseWhenOffscreen(el, {onEnter,onLeave})` — defined Task 2, used Tasks 3 (`pauseWhenOffscreen`), 5 & 6 (`whenVisible`). Signatures match.
- `prefersReducedMotion()` — function call form used consistently everywhere.
- `motion/anime.js` re-exports grow monotonically: Task 2 base set, Task 3 adds `createSpring`. `createTimer` is exported but unused (harmless; scramble uses `setInterval` per deviation 3) — acceptable, or drop it in Task 3 Step 1. Leaving it is fine.
- `init*` names: `initCircuit`, `initHero`, `initScroll`, `initSVG`, `initInteractions` — consistent between each module's definition and the `main.js` call site in the task that adds it and all later tasks.
- `showToast` — exported from `ui.js` (Task 1), used internally by `initializeContactForm`; no cross-module import elsewhere. Consistent.

No inconsistencies found.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-02-anime-v4-migration.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
