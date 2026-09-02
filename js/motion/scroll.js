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
