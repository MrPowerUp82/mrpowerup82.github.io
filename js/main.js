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
