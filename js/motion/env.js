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
