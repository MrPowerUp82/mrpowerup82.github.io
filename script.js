/**
 * Gustavo Tramonte — Portfolio Animations & Interactivity
 * Powered by Anime.js & HTML5 Canvas Circuit Simulation
 */

document.addEventListener('DOMContentLoaded', function () {
    // Anime.js Animations & Circuit Engine
    if (typeof anime !== 'undefined') {
        initializeInteractiveMicroAnimations();
    } else {
        // Fallback if Anime.js is not reachable
        initializeFallbackAnimations();
    }
});

// ==========================================
// 4. INTERACTIVE MICRO-ANIMATIONS (Anime.js)
// ==========================================
function initializeInteractiveMicroAnimations() {
    // Project Cards Hover Spring & Icon Glow
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const icon = card.querySelector('.project-icon');
        const badge = card.querySelector('.project-badge');

        card.addEventListener('mouseenter', function () {
            if (icon) {
                anime({
                    targets: icon,
                    scale: 1.15,
                    rotate: 6,
                    duration: 400,
                    easing: 'easeOutElastic(1, .6)'
                });
            }
            if (badge) {
                anime({
                    targets: badge,
                    scale: 1.08,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            }
        });

        card.addEventListener('mouseleave', function () {
            if (icon) {
                anime({
                    targets: icon,
                    scale: 1,
                    rotate: 0,
                    duration: 400,
                    easing: 'easeOutCubic'
                });
            }
            if (badge) {
                anime({
                    targets: badge,
                    scale: 1,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            }
        });
    });

    // Specialty Cards Hover Physics
    const specialtyCards = document.querySelectorAll('.specialty-card');
    specialtyCards.forEach(card => {
        const icon = card.querySelector('.specialty-icon');
        card.addEventListener('mouseenter', function () {
            if (icon) {
                anime({
                    targets: icon,
                    translateY: -4,
                    scale: 1.12,
                    duration: 350,
                    easing: 'spring(1, 80, 10, 0)'
                });
            }
        });

        card.addEventListener('mouseleave', function () {
            if (icon) {
                anime({
                    targets: icon,
                    translateY: 0,
                    scale: 1,
                    duration: 350,
                    easing: 'easeOutCubic'
                });
            }
        });
    });

    // Skill Tags Interactive Ripple on Hover
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function () {
            anime({
                targets: tag,
                scale: 1.08,
                duration: 250,
                easing: 'spring(1, 90, 10, 0)'
            });
        });
        tag.addEventListener('mouseleave', function () {
            anime({
                targets: tag,
                scale: 1,
                duration: 250,
                easing: 'easeOutCubic'
            });
        });
    });
}

// Fallback if Anime.js is unavailable
function initializeFallbackAnimations() {
    const heroElements = document.querySelectorAll('#hero-badge, .hero-line, #hero-desc, #hero-buttons .btn, #hero-arrow');
    heroElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });

    const animatedElements = document.querySelectorAll('.specialty-card, .skill-category, .project-card, .skill-tag');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

// Helper: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
