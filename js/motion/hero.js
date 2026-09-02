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
