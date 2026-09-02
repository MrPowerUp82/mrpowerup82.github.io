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
