---
name: slidev
description: Expert rules for editing Slidev presentations — HTML/Vue templates, animations, icons, colorblind-friendly palette, CSS conventions, and common patterns.
---

# Skill: Slidev Presentation Expert

You are an expert in Slidev presentations. Use these rules when editing or creating slides in this project.

## Project Structure

- `slides.md` — Main presentation file (all slides in one markdown)
- `style.css` — Global CSS styles (custom classes, animations, layout)
- `components/` — Vue components auto-imported by Slidev
- `public/` — Static assets (images, SVGs)
- `ICONS.md` — Icon usage documentation and reference

## Critical Rules

### HTML in Vue Templates
- **NEVER use self-closing `<div />`** — Vue template compiler rejects it
- Use `<span class="..."></span>` for inline elements (icons, badges)
- Use `<div class="..."></div>` for block elements
- Self-closing is ONLY valid for Vue components: `<DecoShapes />`, `<v-click />`

### SVG Inside Slides
- **Inline SVG in Vue templates is fragile** — Vue's template compiler can mangle SVG content
- For small inline SVGs (arrows, simple shapes): OK, but keep them minimal
- For complex animated SVGs with many elements: works fine IF you follow the rules below
- SVG `<line>`, `<rect>`, `<circle>` work fine inline for diagram connectors and animated dots
- Always use `viewBox` and explicit `width`/`height` or CSS classes on SVGs
- **CRITICAL: NEVER leave blank lines inside `<svg>` tags** — Slidev's Markdown parser treats them as paragraph separators and wraps SVG content in `<pre><code>`, completely breaking rendering
- **NEVER put HTML comments (`<!-- -->`) inside `<svg>` tags** — same issue
- Keep all SVG children tightly packed with no empty lines between elements

### Animations

#### v-click (sequential reveal)
```html
<!-- Wrap content to reveal on click -->
<v-click>
  <div>Content appears on click</div>
</v-click>

<!-- Multiple items revealed one by one -->
<v-clicks>
  <div>First click</div>
  <div>Second click</div>
</v-clicks>

<!-- Synchronized with another v-click -->
<div v-click="1">Appears with click 1</div>
<v-clicks at="2">
  <div>Click 2</div>
  <div>Click 3</div>
</v-clicks>
```

#### v-motion (entrance animations)
Uses `@vueuse/motion` integrated in Slidev:
```html
<div v-motion
  :initial="{opacity:0, y:-20}"
  :enter="{opacity:1, y:0, transition:{delay:300}}">
  Fades in from top after 300ms
</div>

<!-- Slide from left -->
<div v-motion
  :initial="{opacity:0, x:-30}"
  :enter="{opacity:1, x:0, transition:{delay:500}}">
</div>
```

**Important**: `v-motion` runs on mount. If combined with `v-click`, put `v-click` wrapper OUTSIDE:
```html
<v-click>
<div v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0}">
  Content
</div>
</v-click>
```

#### CSS Animations (for continuous effects)
Dashed line flow animation:
```css
@keyframes dashFlowIn {
  from { stroke-dashoffset: 18; }
  to { stroke-dashoffset: 0; }
}
.ve-line-in {
  animation: dashFlowIn 1.2s linear infinite;
}
```

Pulse animation:
```css
@keyframes arrowPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

### Icons (UnoCSS + Iconify)

**Installed collections:**
- `ph` (Phosphor) — primary, clean design, ~7500 icons
- `carbon` (IBM) — complementary, tech/infra icons
- `svg-spinners` — animated icons (CSS-only animations)

**Syntax:**
```html
<!-- Always use <span> with closing tag, NEVER self-closing <div /> -->
<span class="i-ph-lightning-fill inline-block text-cyan-400"></span>
<span class="i-carbon-bot text-xl inline-block"></span>
<span class="i-svg-spinners-pulse-3 text-cyan-400 text-[7px] inline-block"></span>
```

**Pattern:** `i-{collection}-{icon-name}`

**Common icons used in this project:**

| Concept | Icon class |
|---|---|
| Connection | `i-ph-plugs-connected-fill` |
| Server | `i-carbon-bare-metal-server-02` |
| Warning | `i-ph-warning-diamond-fill` |
| Speed/Lightning | `i-ph-lightning-fill` |
| Shield/Protection | `i-ph-shield-check-fill` |
| Lock/Auth | `i-ph-lock-key-fill` |
| Chart/Monitoring | `i-ph-chart-line-up-fill` |
| Heartbeat/Resilience | `i-ph-heartbeat-fill` |
| AI/Robot | `i-carbon-bot` |
| Gateway/Door | `i-ph-door-open-fill` |
| Target/Scope | `i-ph-crosshair-fill` |
| Rate Limit | `i-ph-gauge-fill` |
| Logging/Search | `i-ph-list-magnifying-glass-fill` |
| Animated pulse dot | `i-svg-spinners-pulse-3` |

**Icon search:** https://icon-sets.iconify.design/ (filter by `ph`, `carbon`, `svg-spinners`)

### Color Palette (Colorblind-Friendly)

This presentation avoids green/orange pairs (director is colorblind). The palette:

| Role | Tailwind class | Hex |
|---|---|---|
| Primary | `blue-400/500` | `#60a5fa` / `#3b82f6` |
| Secondary | `purple-400/500` | `#a78bfa` / `#8b5cf6` |
| Accent (replaces green) | `cyan-400/500` | `#22d3ee` / `#06b6d4` |
| Highlight (replaces orange) | `fuchsia-400/500` | `#e879f9` / `#d946ef` |
| Alert (replaces red) | `pink-400/500` | `#f472b6` / `#ec4899` |
| Neutral | `gray-400/500` | `#94a3b8` / `#64748b` |

**NEVER use:** `green-*`, `orange-*`, `red-*` (except in node_modules).
**NEVER use:** `#10b981`, `#34d399`, `#6ee7b7` (emerald/green).
**NEVER use:** `#f59e0b`, `#fbbf24` (amber/orange).

**Background opacity rule:** Use `0.08-0.12` for semi-transparent backgrounds, not `0.03-0.06`.

### CSS Class Naming Conventions

Classes are prefixed by slide/section:
- `s6-*` — Slide 6 (middleware architecture diagram)
- `ve-*` — Visão Estratégica slide
- `nats-*` — NATS Pub/Sub animation slide
- `pipe-*` — Pipeline/flow diagrams
- `flow-step-*` — Step-by-step flow lists
- `info-card-*` — Information cards
- `comp-panel-*` — Comparison panels
- `rec-card-*` — Recommendation cards
- `stat-*` — Statistics cards
- `tl-*` — Timeline elements
- `benefit-pill` — Benefit badges

### Slide Frontmatter

```yaml
---
theme: default
colorSchema: dark
transition: slide-left  # or: fade, slide-up, fade-out
layout: center          # optional: center, default, two-cols
---
```

Slide separators: `---` with optional frontmatter between slides.

### Common Patterns

**Pipeline diagram:**
```html
<div class="pipeline my-4">
  <div class="pipe-node pipe-blue">ORIGEM<span class="pipe-sub">label</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node pipe-purple">MIDDLEWARE</div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node pipe-cyan">DESTINO</div>
</div>
```

**Flow steps:**
```html
<div class="flow-steps">
<v-clicks>
  <div class="flow-step flow-step-blue">
    <div class="flow-step-num">1</div>
    <div>Description</div>
  </div>
</v-clicks>
</div>
```

**Info cards side by side:**
```html
<div class="grid grid-cols-2 gap-6">
  <div class="info-card info-card-pink">
    <div class="card-header text-pink-400">Title</div>
    <div class="card-body">Content (supports markdown)</div>
  </div>
  <div class="info-card info-card-cyan">
    <div class="card-header text-cyan-400">Title</div>
    <div class="card-body">Content</div>
  </div>
</div>
```

**Dashed animated connector lines:**
```html
<svg class="s6-arrow" viewBox="0 0 40 10">
  <line x1="0" y1="5" x2="40" y2="5"
    stroke="#22d3ee" stroke-width="1.2"
    stroke-dasharray="4,3" class="ve-line-in"/>
</svg>
```

**Animated node diagram with particle dots (NATS Pub/Sub pattern):**
Uses absolute-positioned nodes + an SVG overlay with animated `<circle>` dots moving along `<line>` paths via CSS `@keyframes` animating `cx`/`cy`. Key CSS classes:
- `nats-pubsub` — container with `position: relative`
- `nats-node` — absolute-positioned node boxes
- `nats-svg` — SVG layer (`position: absolute; inset: 0; pointer-events: none`)
- `nats-path` — dashed lines with `dashFlowIn` animation
- `nats-dot` — animated circles with `drop-shadow` glow, keyframes move `cx`/`cy`
- Remember: **no blank lines inside `<svg>`** in Slidev markdown

### Dev Commands

```bash
npm run dev    # Start dev server (HMR)
npm run build  # Build for production
npm run export # Export to PDF
```

### Troubleshooting

1. **"Invalid end tag" error** → Check for self-closing `<div />`. Change to `<span></span>` or `<div></div>`
2. **SVG not rendering / `<pre>` inside `<svg>` warning** → Blank lines or HTML comments inside `<svg>` cause Markdown parser to inject `<pre><code>`. Remove ALL blank lines and comments from within SVG tags
3. **Animation runs during slide transition** → Use `v-motion` with `transition.delay` instead of CSS animations on mount
4. **Icons not showing** → Ensure `@iconify-json/{collection}` is installed. Check class has `inline-block`
5. **Colors look wrong in light mode** → Slidev inverts dark↔light. Test both modes
