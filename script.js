/**
 * Gustavo Tramonte — Portfolio Animations & Interactivity
 * Powered by Anime.js & HTML5 Canvas Circuit Simulation
 */

document.addEventListener('DOMContentLoaded', function () {
    // Anime.js Animations & Circuit Engine
    if (typeof anime !== 'undefined') {
        initializeScrollAnimations();
        initializeInteractiveMicroAnimations();
    } else {
        // Fallback if Anime.js is not reachable
        initializeFallbackAnimations();
    }
});

// ==========================================
// 3. SCROLL REVEALS & STAGGERING (Anime.js + Observer)
// ==========================================
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    // Animate section headings
    const sectionHeaders = document.querySelectorAll('.section-title, .section-description');
    sectionHeaders.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
    });

    const headerObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [25, 0],
                    duration: 700,
                    easing: 'easeOutCubic'
                });
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sectionHeaders.forEach(el => headerObserver.observe(el));

    // Stagger Specialty Cards
    const specialtiesContainer = document.querySelector('.specialties');
    if (specialtiesContainer) {
        const cards = specialtiesContainer.querySelectorAll('.specialty-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(35px)';
        });

        const specialtyObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: cards,
                        opacity: [0, 1],
                        translateY: [35, 0],
                        scale: [0.95, 1],
                        delay: anime.stagger(100),
                        duration: 850,
                        easing: 'spring(1, 80, 12, 0)'
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        specialtyObserver.observe(specialtiesContainer);
    }

    // Stagger Skill Categories & Tags
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
        const categories = skillsGrid.querySelectorAll('.skill-category');
        categories.forEach(cat => {
            cat.style.opacity = '0';
            cat.style.transform = 'translateY(30px)';
            const tags = cat.querySelectorAll('.skill-tag');
            tags.forEach(t => {
                t.style.opacity = '0';
                t.style.transform = 'scale(0.7)';
            });
        });

        const skillsObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate category containers
                    anime({
                        targets: categories,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        delay: anime.stagger(120),
                        duration: 800,
                        easing: 'spring(1, 80, 12, 0)',
                        complete: () => {
                            // Pop in skill tags with elastic bounce
                            categories.forEach(cat => {
                                const tags = cat.querySelectorAll('.skill-tag');
                                anime({
                                    targets: tags,
                                    opacity: [0, 1],
                                    scale: [0.7, 1],
                                    delay: anime.stagger(35),
                                    duration: 600,
                                    easing: 'easeOutBack'
                                });
                            });
                        }
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        skillsObserver.observe(skillsGrid);
    }

    // Stagger Project Cards
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        const projectCards = projectsGrid.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
        });

        const projectsObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: projectCards,
                        opacity: [0, 1],
                        translateY: [40, 0],
                        scale: [0.96, 1],
                        delay: anime.stagger(110),
                        duration: 850,
                        easing: 'spring(1, 75, 12, 0)'
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        projectsObserver.observe(projectsGrid);
    }
}

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
