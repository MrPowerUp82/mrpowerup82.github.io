# Design — Migração para anime.js v4 + expansão de animações

> Documento de design gerado via brainstorming estruturado. Nenhuma implementação
> foi feita ainda. Data: 2026-09-02.

---

## 1. Resumo do entendimento

- **Migrar `anime.js` 3.2.2 → v4**, carregando via **ESM pelo CDN**
  (`import { ... } from "https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js"`),
  com `script.js` convertido para `<script type="module">`. Sem `package.json`,
  sem build, deploy continua direto no GitHub Pages.
- **Reescrever as 4 frentes atuais** para a API da v4 (timeline do hero, scroll
  reveals, micro-interações de hover, motor de circuito no canvas), preservando o
  comportamento visual atual como baseline.
- **Corrigir os defeitos atuais no mesmo movimento**: `prefers-reduced-motion`
  respeitado em todas as frentes (hoje só o canvas respeita); `requestAnimationFrame`
  do canvas pausado quando o hero sai da viewport / aba fica oculta.
- **Expandir a animação em 4 áreas**, num plano único:
  1. Hero mais elaborado — título revelado por linha com clip, badge com scramble,
     interação circuito↔cursor mais rica, parallax sutil.
  2. Scroll-driven real — `onScroll()` da v4, progresso preso ao scroll, parallax
     leve, barra de progresso de leitura.
  3. SVG e ícones — line-drawing (`svg.createDrawable` / `draw`) nos ícones dos cards.
  4. Transições e feedback — toast migrado com saída animada, feedback do botão
     "Download CV"; estados de formulário especificados mas dormentes.
- **Entrega**: um único plano/PR contínuo (migração + correções + 4 áreas).

### Público e propósito

Portfólio pessoal de Gustavo Tramonte. Público = recrutadores/clientes,
majoritariamente mobile. A animação transmite "engenheiro elétrico + full-stack"
(tema circuito/PCB), não efeito gratuito.

### Critérios de sucesso

- **Lighthouse Performance ≥ 90 no mobile** — inegociável. Animações só em
  `transform`/`opacity`; canvas pausado fora de vista; sem bloqueio do first paint;
  sem CLS causado por animação.
- Paridade visual: nada do que funciona hoje pode regredir.
- Fallback preservado: se o CDN da v4 falhar, o site aparece 100% utilizável.

### Não-objetivos

- Sem build step / toolchain / CI.
- Sem novas dependências além do anime.js v4 (nada de GSAP, Lenis, etc.).
- Subprojetos linkados (`/mario-jump`, `/vampiric-survival`, `/ci-simulator`,
  `/omnitrix-tizen-wearable`, `/DriveFlix`) fora de escopo.
- Sem `<h1>`/descrição fragmentados ou injetados via JS.
- Sem logo animado (não há SVG inline; `.nav-logo` é texto).
- Sem UI de formulário de contato (está comentada no HTML).
- Sem testes automatizados (o projeto não tem nenhum).

---

## 2. Premissas

1. Sem novas dependências além do anime.js v4. Scroll-driven sai do próprio v4 +
   `IntersectionObserver` nativo.
2. `prefers-reduced-motion: reduce` = estado final estático imediato em tudo
   (sem movimento, sem parallax, sem typing). O canvas renderiza um quadro estático
   único e não roda RAF.
3. Suporte a navegadores evergreen (Chrome/Edge/Firefox/Safari, últimas 2 versões).
   ESM `import` de URL absoluta é pré-requisito.
4. `script.js` é quebrado em módulos ES (`js/motion/*.js` + `js/main.js` + `js/ui.js`),
   servidos estáticos, sem minificação.
5. CDN = jsDelivr, URL versionada `animejs@4/lib/anime.esm.min.js`, com teste de
   disponibilidade que aciona o fallback. Sem SRI.
6. Escopo fecha em `index.html`.
7. Verificação via preview no browser + Lighthouse, manual.

---

## 3. Arquitetura

### 3.1 Carregamento (index.html)

Remove `anime.min.js` 3.2.2 + `script.js`. Adiciona:

```html
<link rel="modulepreload" href="/js/main.js" />
<link rel="modulepreload" href="/js/motion/anime.js" />
<script type="module" src="/js/ui.js"></script>
<script type="module" src="/js/main.js"></script>
```

### 3.2 Árvore de arquivos

```
js/
  ui.js                    ~120 linhas — navegação, menu mobile, smooth scroll,
                                         ano do footer, form (mailto). SEMPRE carrega.
  main.js                  ~40  — bootstrap de animação + try/catch + no-motion
  motion/
    anime.js               ~25  — import do CDN + reexport (ponto único)
    env.js                 ~60  — prefersReducedMotion, whenVisible, pauseWhenOffscreen
    circuit.js             ~380 — motor canvas (migração + RAF controlado)
    hero.js                ~140 — timeline boot + badge scramble + pointer parallax
    scroll.js              ~130 — reveals + scroll-driven (onScroll da v4)
    svg.js                 ~70  — line-drawing de ícones
    interactions.js        ~120 — toast + feedback do botão CV
```

### 3.3 main.js (ponto de entrada da animação)

```js
import { prefersReducedMotion } from './motion/env.js';

async function boot() {
  try {
    await import('./motion/anime.js'); // valida CDN
    const [{ initCircuit }, { initHero }, { initScroll }, { initSVG }, { initInteractions }] =
      await Promise.all([
        import('./motion/circuit.js'), import('./motion/hero.js'),
        import('./motion/scroll.js'), import('./motion/svg.js'),
        import('./motion/interactions.js'),
      ]);
    initHero(); initScroll(); initSVG(); initInteractions();
    initCircuit({ staticFrame: prefersReducedMotion() });
  } catch (err) {
    document.documentElement.classList.add('no-motion');
    console.warn('[motion] desativado:', err);
  }
}
boot();
```

### 3.4 motion/anime.js (ponto único do CDN)

```js
export {
  animate, createTimeline, createTimer, stagger,
  svg, utils, onScroll, engine,
} from 'https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js';
```

### 3.5 motion/env.js (contrato compartilhado)

```js
const mq = matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => mq.matches;

export function whenVisible(el, cb, { threshold = 0.15, margin = '0px 0px -40px 0px' } = {}) {
  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) if (e.isIntersecting) { obs.unobserve(e.target); cb(e.target); }
  }, { threshold, rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}

export function pauseWhenOffscreen(el, { onEnter, onLeave }) {
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? onEnter() : onLeave()));
  io.observe(el);
  document.addEventListener('visibilitychange', () =>
    document.hidden ? onLeave() : (el.getBoundingClientRect().top < innerHeight && onEnter()));
  return () => io.disconnect();
}
```

**Regra:** nenhum módulo lê `matchMedia` sozinho nem cria `IntersectionObserver`
cru — tudo passa por `env.js`.

---

## 4. Frentes

### 4.1 circuit.js

- **Pulsos lineares saem do anime.js** → `pulse.progress += pulse.speed * pulse.direction * dt`
  dentro do RAF. Remove ~120 instâncias de animação em loop infinito.
- anime.js v4 continua em `triggerElectricSurge` (spring nos nós, faíscas que somem).
- **RAF controlado por `pauseWhenOffscreen(heroSection, { onEnter: start, onLeave: stop })`.**
  Hero fora de vista ou aba oculta = zero trabalho de canvas.
- **`staticFrame: true`** monta o grafo, desenha 1 quadro e retorna.
- Gerador procedural de PCB, `getPointOnTrace`, desenho de ICs/pads/vias e faíscas
  não mudam — só as chamadas de animação.

Tabela de migração de API:

| v3 | v4 |
|---|---|
| `anime({ targets: o, ... })` | `animate(o, { ... })` |
| `anime.random(a,b)` | `utils.random(a,b)` |
| `anime.stagger(n)` | `stagger(n)` |
| `anime.timeline({...})` | `createTimeline({ defaults: {...} })` |
| `easing: 'easeOutQuad'` | `ease: 'outQuad'` |
| `easing: 'easeOutCubic'` | `ease: 'outCubic'` |
| `easing: 'easeOutBack'` | `ease: 'outBack'` |
| `easing: 'spring(1,80,10,0)'` | `ease: createSpring({ stiffness: 80, damping: 10 })` |
| `complete: fn` | `onComplete: fn` |
| `loop: true, direction: 'alternate'` | `loop: true, alternate: true` |

### 4.2 hero.js

```js
export function initHero() {
  if (prefersReducedMotion()) { utils.set(HERO_ELS, { opacity: 1, translateY: 0 }); return; }
  buildBootTimeline();
  initBadgeScramble();
  initPointerParallax();
}
```

- **Timeline de boot**: `createTimeline({ defaults: { ease: 'outExpo', duration: 900 } })`,
  offsets negativos mantidos. Sequência: badge → linhas do título → descrição →
  botões → seta → `circuitEngine.triggerSurge` no `onComplete`.
- **Título**: revela por linha com `translateY` + `clip-path` inset, stagger 140 ms.
  Nunca por caractere.
- **`initBadgeScramble()`**: `createTimer` (`loop: true`, `frameRate: 20`); a cada
  ~8 s embaralha `.hero-badge-text` por 600 ms e reassenta. Original salvo em
  `dataset.label`, sempre restaurado. Só o kicker — nunca `<h1>`/`<p>`.
- **`initPointerParallax()`**: `pointermove` no `.hero` (throttle via rAF).
  `.hero-content` translada no máximo ±6 px. Repassa a posição para
  `circuitEngine.setPointer(x, y)` (atrai nós próximos; spring de volta no
  `pointerleave`). Desativado em `< 768px` e `reduced-motion`.

### 4.3 scroll.js

```js
function reveal(targets, opts = {}) {
  animate(targets, {
    opacity: [0, 1], translateY: [opts.y ?? 28, 0], scale: opts.scale,
    delay: opts.stagger ? stagger(opts.stagger) : 0,
    duration: 800, ease: 'outCubic',
    autoplay: onScroll({ target: opts.trigger ?? targets, enter: 'bottom-=40 top' }),
  });
}
```

- **Reveals** (substituem os `IntersectionObserver` + `anime` atuais):
  `.section-title`/`.section-description`; `.specialty-card` (stagger 100);
  `.skill-category` (stagger 120) → tags com `'outBack'` no `onComplete`;
  `.project-card` (stagger 110).
- **Scroll-driven — teto de 4 animações scrubbed**, todas `transform`/`opacity`,
  cada uma com `autoplay: onScroll({ sync: 0.4, target, enter, leave })`:

  | Efeito | Alvo | Amplitude |
  |---|---|---|
  | Fade+lift do hero ao sair | `.hero-content` | `opacity 1→0.3`, `translateY 0→-40` |
  | Barra de progresso de leitura | `.read-progress` (novo, no header) | `scaleX 0→1` |
  | Parallax do heading | `.section-title .gradient-text` | `translateY ±10` |
  | Deriva das partículas | `.hero-particles` | `translateY 0→-60` |

- **`reduced-motion`**: `utils.set(TODOS_ALVOS, { opacity: 1, translateY: 0 })` e
  retorna — sem reveals, sem scrubbing.

### 4.4 svg.js

```js
export function initSVG() {
  const icons = utils.$('.specialty-icon svg, .project-icon svg');
  if (prefersReducedMotion()) {
    icons.forEach(s => utils.set(svg.createDrawable(s.querySelectorAll('*')), { draw: '0 1' }));
    return;
  }
  icons.forEach(prime);
  document.querySelectorAll('.specialties, .projects-grid').forEach(scope =>
    whenVisible(scope, () => scope.querySelectorAll('svg').forEach(drawIcon)));
}

function drawIcon(svgEl) {
  const strokable = [...svgEl.querySelectorAll('path,line,polyline,circle,rect,ellipse')]
    .filter(el => getComputedStyle(el).stroke !== 'none');
  const filled = [...svgEl.querySelectorAll('polygon,[fill]:not([fill="none"])')];
  animate(svg.createDrawable(strokable),
    { draw: ['0 0', '0 1'], duration: 900, delay: stagger(80), ease: 'inOutQuad' });
  animate(filled,
    { opacity: [0, 1], scale: [0.6, 1], duration: 500, delay: stagger(80, { start: 300 }), ease: 'outBack' });
}
```

- Ícones se desenham no reveal do container (`.specialties`, `.projects-grid`).
- `prime()` pré-seta `draw: '0 0'` e `opacity: 0` para evitar flash.
- Logo animado fora de escopo.

### 4.5 interactions.js + CSS

**Hover → 100% CSS** (em `style.css`):

```css
.project-icon   { transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
.project-card:hover .project-icon { transform: scale(1.15) rotate(6deg); }
.specialty-card:hover .specialty-icon { transform: translateY(-4px) scale(1.12); }
.skill-tag      { transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
.skill-tag:hover { transform: scale(1.08); }

@media (prefers-reduced-motion: reduce) {
  .project-icon, .specialty-icon, .skill-tag { transition: none; }
  .project-card:hover .project-icon,
  .specialty-card:hover .specialty-icon,
  .skill-tag:hover { transform: none; }
}
```

**interactions.js** (enxuto):
1. **Toast** — `anime()` → `animate()`, vira mini-timeline: entra → segura 4 s → sai.
   `reduced-motion`: só alterna `.show`.
2. **Feedback do "Download CV"** — no `click`: `scale 1→.96→1` (200 ms) + rótulo
   "Baixando…" por 1,2 s.
3. **Estados de formulário** — especificados mas dormentes (form comentado no HTML).

**CSS de suporte** (`style.css`):
- `.no-motion` — fixa estado final (`opacity:1; transform:none`) dos alvos animados.
- `.read-progress` — barra fina no topo do header (`height:2px; transform-origin:left`).

---

## 5. Estratégia de verificação

| # | Checagem | Como | Critério |
|---|---|---|---|
| 1 | Paridade visual | Preview (`launch.json` → `portfolio`, porta 8123): boot do hero → scroll das 4 seções → hover → clique no hero | Nada regride vs. `main` |
| 2 | Lighthouse mobile | `npx lighthouse http://localhost:8123 --preset=perf --form-factor=mobile` antes/depois | Performance ≥ 90; sem CLS novo |
| 3 | `prefers-reduced-motion` | DevTools › Rendering › emular `reduce` | Estático; canvas = 1 quadro; sem scrubbing |
| 4 | Falha de CDN | DevTools › Network › block `cdn.jsdelivr.net` | `<html class="no-motion">`, site 100% legível |
| 5 | RAF fora de vista | Scrollar além do hero; Performance panel | `draw()` para; CPU do canvas → 0 |
| 6 | Aba oculta | Trocar de aba com hero visível | Canvas pausa (`visibilitychange`) |
| 7 | Cross-browser | Safari + Firefox: ESM `import`, `onScroll({ sync })`, `svg.draw` | Sem erro; efeitos equivalentes |
| 8 | Regressão de UI | `js/ui.js`: menu mobile, smooth scroll, ano, skip-link | Funciona com animação desligada |

---

## 6. Decision Log

| # | Decisão | Alternativas | Por quê |
|---|---|---|---|
| D1 | Migrar anime.js 3.2.2 → v4 | Ficar na v3; GSAP; CSS puro | v3 é legada; v4 tem `onScroll`/`svg.draw` nativos; sem licença |
| D2 | ESM do CDN, sem build | IIFE global; Vite/esbuild + package.json | Site estático no GH Pages; tree-shaking parcial; zero toolchain |
| D3 | Abordagem modular (`js/motion/*` + orquestrador) | Arquivo único; CSS-first híbrido | `script.js` já tem 1074 linhas; 4 frentes isoladas; gate único |
| D4 | Grafos separados: `ui.js` (sempre) vs `motion/*` (pode falhar) | Tudo num módulo | Falha do CDN não pode quebrar menu/scroll/form |
| D5 | Fallback = classe `.no-motion` via try/catch | `initializeFallbackAnimations()` JS; SRI | Uma classe cobre tudo; CDN sem hash SRI estável |
| D6 | URL versionada (`animejs@4/lib/anime.esm.min.js`) | `/+esm` do jsDelivr | Cacheável, estável, permite `modulepreload` |
| D7 | `env.js` = única fonte de `reduced-motion` e viewport | Cada módulo lê `matchMedia`/cria observer | Consistência; corrige bug (só canvas respeitava) |
| D8 | Pulsos = matemática no RAF; anime.js só para física por evento | ~120 `anime()` em loop infinito | −120 instâncias; mesmo visual; ganho de CPU |
| D9 | Canvas pausa fora da viewport e com aba oculta | RAF perpétuo (atual) | Maior ganho isolado de Lighthouse; corrige bug |
| D10 | `staticFrame: true` desenha 1 quadro para `reduced-motion` | Não chamar `initCircuit` | Mantém visual de PCB sem movimento |
| D11 | Título revela por linha com clip, nunca por caractere | Split char-a-char; `svg` text | `<h1>` é conteúdo indexável; não fragmentar via JS |
| D12 | Scramble só no `.hero-badge-text`, original em `data-label` | Scramble no `<h1>`/descrição; sem scramble | Bom gosto; kicker decorativo; texto recuperável |
| D13 | Parallax ≤ ±6 px, desktop, ponteiro → circuito | Parallax de scroll amplo; sem parallax | Parallax forte enjoa; reaproveita motor |
| D14 | `onScroll()` da v4 para reveals e scroll-driven | `IntersectionObserver` cru + anime; CSS `animation-timeline` | Um sistema só; `animation-timeline` parcial no Safari |
| D15 | Teto de 4 animações scrubbed, só transform/opacity | Sem limite | Proteger Lighthouse ≥ 90 mobile |
| D16 | Barra de progresso de leitura no header | — | Efeito scroll-driven barato e útil |
| D17 | Ícones se desenham no reveal do container | Um observer por ícone | Menos observers; stagger natural |
| D18 | `drawIcon`: traço usa `draw`; preenchido usa fade+scale | Forçar stroke em tudo; só fade | Ícones misturam `stroke` e `polygon`/`rect` |
| D19 | Logo animado fora de escopo | Criar SVG inline novo | `.nav-logo` é texto; sem SVG inline |
| D20 | Hover em CSS (`cubic-bezier` spring) + media query | Manter em anime.js | Só `transform`; não paga custo de JS; −100 linhas |
| D21 | `interactions.js` = toast + feedback do CV; form dormente | Implementar UI de form | Form comentado no HTML; não construir UI morta |
| D22 | Um plano/PR único (migração + correções + 4 áreas) | Fase 1 só migração; por área | Escolha do usuário |
| D23 | Escopo = `index.html`; subprojetos fora | Incluir subprojetos | Mantê-lo fechado e verificável |
| D24 | Sem dependências além do anime.js v4 | Lenis; GSAP | v4 cobre scroll-driven; menos superfície |

---

## 7. Riscos conhecidos

- **`onScroll({ sync })` no Safari** — comportamento de scrubbing pode diferir;
  mitigar com `sync` numérico (suavização) e testar cedo (verificação #7).
- **`svg.createDrawable` em ícones com `fill`** — resolvido por `drawIcon` (regra
  traço vs. preenchido), mas cada ícone novo precisa seguir a convenção.
- **`import` de URL absoluta** — sem fallback para browsers sem ESM; aceito nas
  premissas (evergreen). O `try/catch` degrada para `.no-motion`, não para erro.
- **Orçamento de Lighthouse** — 4 animações scrubbed + canvas é o limite; qualquer
  efeito novo além disso exige remover outro.
- **7 módulos = 7 requests** — mitigado por `modulepreload` nos 2 críticos + HTTP/2
  do GitHub Pages; medir no item #2.
