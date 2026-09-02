/**
 * Gustavo Tramonte — Portfolio Animations & Interactivity
 * Powered by Anime.js & HTML5 Canvas Circuit Simulation
 */

document.addEventListener('DOMContentLoaded', function () {
    // Anime.js Animations & Circuit Engine
    if (typeof anime !== 'undefined') {
        initializeCircuitAnimation();
        initializeHeroTimeline();
        initializeScrollAnimations();
        initializeInteractiveMicroAnimations();
    } else {
        // Fallback if Anime.js is not reachable
        initializeFallbackAnimations();
    }
});

// ==========================================
// 1. CYBER-CIRCUIT & IoT ANIMATION ENGINE (Anime.js + Canvas)
// ==========================================
let circuitEngine = null;

function initializeCircuitAnimation() {
    const canvas = document.getElementById('circuit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroSection = document.querySelector('.hero');
    let animationFrameId;
    let width, height;
    let nodes = [];
    let traces = [];
    let pulses = [];
    let particles = [];
    let mouse = { x: -1000, y: -1000, active: false, targetNode: null };

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Procedural PCB & IoT Circuit Generator
    function generateCircuitGraph() {
        nodes = [];
        traces = [];
        pulses = [];

        // Grid parameters based on screen size
        const isMobile = width < 768;
        const cols = isMobile ? 5 : 9;
        const rows = isMobile ? 6 : 7;
        const cellW = width / (cols + 1);
        const cellH = height / (rows + 1);

        // Core Microcontroller Chips (ICs)
        const icLabels = ['ESP32', 'MCU', 'IOT-BUS', 'ADC', 'PWM', 'LOGIC', 'WIFI'];
        const icNodes = [];

        for (let c = 1; c <= cols; c++) {
            for (let r = 1; r <= rows; r++) {
                // Avoid placing dense nodes right over the center text on desktop
                const posX = c * cellW + (Math.random() - 0.5) * (cellW * 0.4);
                const posY = r * cellH + (Math.random() - 0.5) * (cellH * 0.4);

                const distToCenter = Math.hypot(posX - width / 2, posY - height / 2);
                const isCenterZone = distToCenter < Math.min(width, height) * 0.28;

                // Probability of creating a node (lower in center to keep text legible)
                const prob = isCenterZone ? 0.25 : 0.7;
                if (Math.random() < prob) {
                    const isIC = !isCenterZone && Math.random() < 0.15 && icNodes.length < 5;
                    const nodeType = isIC ? 'ic' : (Math.random() < 0.4 ? 'pad' : 'via');
                    const label = isIC ? icLabels[icNodes.length % icLabels.length] : '';

                    const node = {
                        id: nodes.length,
                        x: posX,
                        y: posY,
                        baseX: posX,
                        baseY: posY,
                        type: nodeType,
                        label: label,
                        radius: nodeType === 'ic' ? 14 : (nodeType === 'pad' ? 4.5 : 2.5),
                        color: Math.random() > 0.4 ? 'hsl(187, 85%, 55%)' : 'hsl(163, 85%, 52%)',
                        glow: 0.3,
                        scale: 1,
                        activity: 0.1,
                        connections: []
                    };

                    if (isIC) icNodes.push(node);
                    nodes.push(node);
                }
            }
        }

        // Connect nodes with characteristic PCB traces (orthogonal + 45° bends)
        const maxDist = isMobile ? 180 : 240;

        for (let i = 0; i < nodes.length; i++) {
            const nA = nodes[i];
            const neighbors = nodes
                .map((n, idx) => ({ idx, dist: Math.hypot(nA.x - n.x, nA.y - n.y) }))
                .filter(n => n.idx !== i && n.dist < maxDist)
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 3); // Max 3 connections per node

            neighbors.forEach(neighbor => {
                const nB = nodes[neighbor.idx];
                // Check if trace already exists
                const exists = traces.some(t => 
                    (t.from === i && t.to === neighbor.idx) || 
                    (t.from === neighbor.idx && t.to === i)
                );

                if (!exists) {
                    // Create authentic PCB trace routing points (start -> midpoint bend -> end)
                    const midX = nA.x + (nB.x - nA.x) * 0.5;
                    const midY = nA.y;
                    
                    const trace = {
                        from: i,
                        to: neighbor.idx,
                        path: [
                            { x: nA.x, y: nA.y },
                            { x: midX, y: midY },
                            { x: nB.x, y: nB.y }
                        ],
                        length: neighbor.dist,
                        activeGlow: 0,
                        baseOpacity: 0.12 + Math.random() * 0.12
                    };

                    traces.push(trace);
                    nA.connections.push(traces.length - 1);
                    nB.connections.push(traces.length - 1);
                }
            });
        }

        // Generate electrical current pulses managed by Anime.js
        if (!prefersReducedMotion) {
            traces.forEach((trace, traceIdx) => {
                // Number of pulses based on trace length
                const pulseCount = trace.length > 150 ? 2 : 1;
                for (let p = 0; p < pulseCount; p++) {
                    const pulse = {
                        traceIndex: traceIdx,
                        progress: Math.random(),
                        speed: 0.003 + Math.random() * 0.005,
                        size: 2.5 + Math.random() * 1.5,
                        color: Math.random() > 0.35 ? 'hsl(187, 95%, 65%)' : 'hsl(163, 95%, 60%)',
                        trailLength: 0.15 + Math.random() * 0.1,
                        alpha: 0.85,
                        direction: Math.random() > 0.5 ? 1 : -1
                    };

                    pulses.push(pulse);

                    // Animate continuous pulse progress with Anime.js
                    anime({
                        targets: pulse,
                        progress: [pulse.progress, pulse.progress + (pulse.direction > 0 ? 1 : -1)],
                        duration: anime.random(2200, 4200),
                        easing: 'linear',
                        loop: true,
                        direction: 'alternate',
                        delay: anime.random(0, 2000)
                    });
                }
            });
        }
    }

    // Interpolate point along trace path
    function getPointOnTrace(trace, progress) {
        const clampedT = Math.max(0, Math.min(1, progress));
        const pts = trace.path;
        if (pts.length < 3) return pts[0];

        // Segment 1 (start to mid) and Segment 2 (mid to end)
        if (clampedT < 0.5) {
            const segT = clampedT * 2;
            return {
                x: pts[0].x + (pts[1].x - pts[0].x) * segT,
                y: pts[0].y + (pts[1].y - pts[0].y) * segT
            };
        } else {
            const segT = (clampedT - 0.5) * 2;
            return {
                x: pts[1].x + (pts[2].x - pts[1].x) * segT,
                y: pts[1].y + (pts[2].y - pts[1].y) * segT
            };
        }
    }

    // Trigger an Electric Shockwave / Overvoltage Wave (on click or power-up)
    function triggerElectricSurge(originX, originY, intensity = 1) {
        if (prefersReducedMotion || !nodes.length) return;

        // Find closest nodes to origin
        const sortedNodes = nodes
            .map((n, idx) => ({ idx, node: n, dist: Math.hypot(n.x - originX, n.y - originY) }))
            .sort((a, b) => a.dist - b.dist);

        const targetNodes = sortedNodes.slice(0, Math.min(6, nodes.length));

        targetNodes.forEach((item, i) => {
            const node = item.node;
            
            // Anime.js node flash
            anime({
                targets: node,
                glow: [0.3, 1 * intensity, 0.3],
                scale: [1, 1.4 * intensity, 1],
                activity: [0.1, 1, 0.1],
                duration: 900,
                delay: i * 60,
                easing: 'spring(1, 80, 10, 0)'
            });

            // Trigger sparks / micro-particles
            createSparks(node.x, node.y, 6 * intensity, node.color);

            // Light up adjacent traces
            node.connections.forEach(tIdx => {
                if (traces[tIdx]) {
                    anime({
                        targets: traces[tIdx],
                        activeGlow: [0, 1, 0],
                        duration: 800,
                        delay: i * 60 + 50,
                        easing: 'easeOutQuad'
                    });
                }
            });
        });
    }

    // Spark Particles Burst
    function createSparks(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3.5;
            const spark = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 1.8,
                alpha: 1,
                color: color || 'hsl(187, 100%, 75%)',
                life: 0
            };

            particles.push(spark);

            anime({
                targets: spark,
                alpha: [1, 0],
                radius: [spark.radius, 0.2],
                duration: anime.random(500, 900),
                easing: 'easeOutCubic',
                complete: () => {
                    const idx = particles.indexOf(spark);
                    if (idx > -1) particles.splice(idx, 1);
                }
            });
        }
    }

    // Expose method to global circuitEngine
    circuitEngine = {
        triggerSurge: triggerElectricSurge,
        createSparks: createSparks
    };

    // Render Loop (60 FPS)
    function render() {
        ctx.clearRect(0, 0, width, height);

        // 1. Draw PCB Traces
        traces.forEach(trace => {
            const pts = trace.path;
            const glowVal = trace.activeGlow;
            
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[1].x, pts[1].y);
            ctx.lineTo(pts[2].x, pts[2].y);

            // Base trace line
            ctx.strokeStyle = `rgba(30, 60, 85, ${trace.baseOpacity})`;
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Active energy surge overlay
            if (glowVal > 0.02) {
                ctx.save();
                ctx.strokeStyle = `hsl(187, 90%, 65%)`;
                ctx.globalAlpha = glowVal * 0.8;
                ctx.lineWidth = 2 + glowVal * 1.5;
                ctx.shadowColor = 'hsl(187, 90%, 60%)';
                ctx.shadowBlur = 12 * glowVal;
                ctx.stroke();
                ctx.restore();
            }
        });

        // 2. Draw Moving Electric Current Pulses
        pulses.forEach(pulse => {
            const trace = traces[pulse.traceIndex];
            if (!trace) return;

            // Normalized progress
            const t = ((pulse.progress % 1) + 1) % 1;
            const currentPt = getPointOnTrace(trace, t);

            // Draw glowing head
            ctx.save();
            ctx.beginPath();
            ctx.arc(currentPt.x, currentPt.y, pulse.size, 0, Math.PI * 2);
            ctx.fillStyle = pulse.color;
            ctx.globalAlpha = pulse.alpha;
            ctx.shadowColor = pulse.color;
            ctx.shadowBlur = 10;
            ctx.fill();

            // Draw fading electric trail
            const trailSteps = 4;
            for (let step = 1; step <= trailSteps; step++) {
                const trailT = t - (pulse.direction * step * 0.025);
                if (trailT >= 0 && trailT <= 1) {
                    const trailPt = getPointOnTrace(trace, trailT);
                    ctx.beginPath();
                    ctx.arc(trailPt.x, trailPt.y, pulse.size * (1 - step / trailSteps * 0.6), 0, Math.PI * 2);
                    ctx.fillStyle = pulse.color;
                    ctx.globalAlpha = pulse.alpha * (1 - step / trailSteps) * 0.5;
                    ctx.shadowBlur = 4;
                    ctx.fill();
                }
            }
            ctx.restore();
        });

        // 3. Draw Nodes & Microchips
        nodes.forEach(node => {
            const rad = node.radius * node.scale;

            if (node.type === 'ic') {
                // Microchip / SMT IC Package
                const boxW = rad * 2.8;
                const boxH = rad * 2;
                
                ctx.save();
                ctx.translate(node.x, node.y);

                // Chip Body
                ctx.fillStyle = 'rgba(10, 20, 32, 0.9)';
                ctx.strokeStyle = node.color;
                ctx.lineWidth = 1.2;
                ctx.globalAlpha = 0.85;
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 8 * node.glow;

                ctx.beginPath();
                ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 3);
                ctx.fill();
                ctx.stroke();

                // Chip Pins
                const pins = 3;
                const pinSpacing = boxW / (pins + 1);
                ctx.fillStyle = node.color;
                for (let p = 1; p <= pins; p++) {
                    const px = -boxW / 2 + p * pinSpacing - 1;
                    ctx.fillRect(px, -boxH / 2 - 3, 2, 3);
                    ctx.fillRect(px, boxH / 2, 2, 3);
                }

                // IC Text Label
                if (node.label && width > 480) {
                    ctx.fillStyle = node.color;
                    ctx.font = '600 7px "JetBrains Mono", monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(node.label, 0, 0);
                }
                ctx.restore();

            } else {
                // Pad or Via (Circular Connection Point)
                ctx.save();
                ctx.beginPath();
                ctx.arc(node.x, node.y, rad, 0, Math.PI * 2);

                if (node.type === 'pad') {
                    // Solder Ring
                    ctx.fillStyle = 'rgba(13, 25, 40, 0.9)';
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 1.5;
                    ctx.globalAlpha = 0.6 + node.glow * 0.4;
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 6 * node.glow;
                    ctx.fill();
                    ctx.stroke();

                    // Inner Dot
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, rad * 0.45, 0, Math.PI * 2);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                } else {
                    // Small Via
                    ctx.fillStyle = node.color;
                    ctx.globalAlpha = 0.4 + node.glow * 0.5;
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 4 * node.glow;
                    ctx.fill();
                }
                ctx.restore();
            }
        });

        // 4. Draw Interactive Particles (Sparks)
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
        });

        // 5. Mouse Magnetic Field Distortion
        if (mouse.active && width > 768) {
            ctx.save();
            const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
            grad.addColorStop(0, 'rgba(0, 240, 255, 0.06)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        animationFrameId = requestAnimationFrame(render);
    }

    // User Event Listeners
    window.addEventListener('resize', debounce(resize, 200));
    resize();
    render();

    // Mouse Interactions
    heroSection.addEventListener('mousemove', function (e) {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', function () {
        mouse.active = false;
    });

    // Click / Tap Electric Surge
    heroSection.addEventListener('click', function (e) {
        const rect = heroSection.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        triggerElectricSurge(clickX, clickY, 1.4);
    });
}

// ==========================================
// 2. HERO ORCHESTRATION TIMELINE (Anime.js)
// ==========================================
function initializeHeroTimeline() {
    const badge = document.getElementById('hero-badge');
    const titleLines = document.querySelectorAll('.hero-line');
    const desc = document.getElementById('hero-desc');
    const buttons = document.querySelectorAll('#hero-buttons .btn');
    const arrow = document.getElementById('hero-arrow');

    // Create High-Tech System Boot Timeline
    const heroTl = anime.timeline({
        easing: 'easeOutExpo',
        duration: 900
    });

    heroTl
        // 1. Cyber Badge Pops in
        .add({
            targets: badge,
            opacity: [0, 1],
            translateY: [-25, 0],
            scale: [0.85, 1],
            duration: 850,
            easing: 'spring(1, 80, 10, 0)'
        })
        // 2. Title Lines Reveal with Spring Physics
        .add({
            targets: titleLines,
            opacity: [0, 1],
            translateY: [45, 0],
            rotateX: [-15, 0],
            delay: anime.stagger(140),
            duration: 950,
            easing: 'spring(1, 75, 12, 0)'
        }, '-=550')
        // 3. Description Fades and Glides in
        .add({
            targets: desc,
            opacity: [0, 1],
            translateY: [25, 0],
            duration: 800,
            easing: 'easeOutCubic'
        }, '-=600')
        // 4. Action Buttons Pop with Elastic Bounce
        .add({
            targets: buttons,
            opacity: [0, 1],
            translateY: [25, 0],
            scale: [0.92, 1],
            delay: anime.stagger(90),
            duration: 850,
            easing: 'spring(1, 85, 10, 0)'
        }, '-=500')
        // 5. Scroll Indicator
        .add({
            targets: arrow,
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 700,
            easing: 'easeOutCubic',
            complete: () => {
                // Trigger initial power-up spark wave across the hero board
                if (circuitEngine) {
                    const hero = document.querySelector('.hero');
                    if (hero) {
                        const rect = hero.getBoundingClientRect();
                        circuitEngine.triggerSurge(rect.width / 2, rect.height * 0.4, 1.2);
                    }
                }
            }
        }, '-=400');
}

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
