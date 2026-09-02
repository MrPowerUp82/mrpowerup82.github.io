/**
 * Cyber-circuit / IoT canvas engine.
 * Linear pulse motion = plain RAF math. Event-driven surges/sparks = anime.js springs.
 * The render loop only runs while the hero is on-screen and the tab is visible.
 */
import { animate, utils, createSpring } from './anime.js';
import { pauseWhenOffscreen } from './env.js';

export const circuit = { ready: false };

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function initCircuit({ staticFrame = false } = {}) {
    const canvas = document.getElementById('circuit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroSection = document.querySelector('.hero');
    let rafId = null;
    let lastT = 0;
    let width, height;
    let nodes = [];
    let traces = [];
    let pulses = [];
    let particles = [];
    const mouse = { x: -1000, y: -1000, active: false };

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

        // Pulses: plain data, no anime.js. Progress advanced in the render loop.
        pulses = [];
        if (!staticFrame) {
            traces.forEach((trace, traceIdx) => {
                const pulseCount = trace.length > 150 ? 2 : 1;
                for (let p = 0; p < pulseCount; p++) {
                    pulses.push({
                        traceIndex: traceIdx,
                        progress: Math.random(),
                        speed: 0.003 + Math.random() * 0.005, // per-frame at 60fps
                        dir: Math.random() > 0.5 ? 1 : -1,
                        size: 2.5 + Math.random() * 1.5,
                        color: Math.random() > 0.35 ? 'hsl(187, 95%, 65%)' : 'hsl(163, 95%, 60%)',
                        alpha: 0.85,
                    });
                }
            });
        }
    }

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

    function triggerElectricSurge(originX, originY, intensity = 1) {
        if (staticFrame || !nodes.length) return;
        const sorted = nodes
            .map(n => ({ node: n, dist: Math.hypot(n.x - originX, n.y - originY) }))
            .sort((a, b) => a.dist - b.dist);
        const targets = sorted.slice(0, Math.min(6, nodes.length));

        targets.forEach((item, i) => {
            const node = item.node;
            animate(node, {
                glow: [0.3, 1 * intensity, 0.3],
                scale: [1, 1.4 * intensity, 1],
                activity: [0.1, 1, 0.1],
                duration: 900,
                delay: i * 60,
                ease: createSpring({ stiffness: 80, damping: 10 }),
            });
            createSparks(node.x, node.y, Math.round(6 * intensity), node.color);
            node.connections.forEach(tIdx => {
                if (traces[tIdx]) {
                    animate(traces[tIdx], {
                        activeGlow: [0, 1, 0],
                        duration: 800,
                        delay: i * 60 + 50,
                        ease: 'outQuad',
                    });
                }
            });
        });
    }

    function createSparks(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3.5;
            const spark = {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 1.8,
                alpha: 1,
                color: color || 'hsl(187, 100%, 75%)',
            };
            particles.push(spark);
            animate(spark, {
                alpha: [1, 0],
                radius: [spark.radius, 0.2],
                duration: utils.random(500, 900),
                ease: 'outCubic',
                onComplete: () => {
                    const idx = particles.indexOf(spark);
                    if (idx > -1) particles.splice(idx, 1);
                },
            });
        }
    }

    function advancePulses(dtFrames) {
        for (const pulse of pulses) {
            pulse.progress += pulse.speed * pulse.dir * dtFrames;
            if (pulse.progress >= 1) { pulse.progress = 1; pulse.dir = -1; }
            else if (pulse.progress <= 0) { pulse.progress = 0; pulse.dir = 1; }
        }
    }

    function draw() {
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

            const t = pulse.progress;
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
                const trailT = t - (pulse.dir * step * 0.025);
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

        // Cursor magnetism: pull nearby nodes toward the pointer, spring back when idle.
        for (const node of nodes) {
            if (mouse.active && width > 768) {
                const dx = mouse.x - node.baseX;
                const dy = mouse.y - node.baseY;
                const dist = Math.hypot(dx, dy);
                if (dist < 160) {
                    const pull = (1 - dist / 160) * 12;
                    node.x += ((node.baseX + (dx / dist) * pull) - node.x) * 0.12;
                    node.y += ((node.baseY + (dy / dist) * pull) - node.y) * 0.12;
                    continue;
                }
            }
            node.x += (node.baseX - node.x) * 0.08; // ease home
            node.y += (node.baseY - node.y) * 0.08;
        }

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
    }

    function loop(t) {
        const dtFrames = lastT ? Math.min((t - lastT) / 16.667, 3) : 1;
        lastT = t;
        advancePulses(dtFrames);
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (rafId == null) { lastT = 0; rafId = requestAnimationFrame(loop); }
    }
    function stop() {
        if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Wire the public surface before any early return.
    circuit.triggerSurge = triggerElectricSurge;
    circuit.createSparks = createSparks;
    circuit.setPointer = (x, y) => { mouse.x = x; mouse.y = y; mouse.active = true; };
    circuit.ready = true;

    window.addEventListener('resize', debounce(resize, 200));
    resize();

    if (staticFrame) { draw(); return; } // one frame, no loop, no listeners

    pauseWhenOffscreen(heroSection, { onEnter: start, onLeave: stop });

    heroSection.addEventListener('mousemove', function (e) {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });
    heroSection.addEventListener('mouseleave', () => { mouse.active = false; });
    heroSection.addEventListener('click', function (e) {
        const rect = heroSection.getBoundingClientRect();
        triggerElectricSurge(e.clientX - rect.left, e.clientY - rect.top, 1.4);
    });
}
