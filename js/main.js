/**
 * Animation bootstrap. Independent of js/ui.js.
 * On any failure the whole animation layer is skipped and the page is
 * marked .no-motion so CSS can force the final visible state.
 */
import { prefersReducedMotion } from './motion/env.js';

async function boot() {
    try {
        await import('./motion/anime.js');

        const { initCircuit } = await import('./motion/circuit.js');
        initCircuit({ staticFrame: prefersReducedMotion() });
    } catch (err) {
        document.documentElement.classList.add('no-motion');
        console.warn('[motion] animation layer disabled:', err);
    }
}

boot();
