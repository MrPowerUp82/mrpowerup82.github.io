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
