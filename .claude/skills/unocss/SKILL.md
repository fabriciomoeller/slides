---
name: unocss
description: Guidelines and best practices for using UnoCSS in the POC Middleware Slidev presentation. Use this skill whenever the user works with CSS utility classes, icons (Iconify/Phosphor/Carbon), colors, or styling in the Slidev slides. Also use when the user mentions "UnoCSS", "ícones", "cores", "paleta", or any styling-related changes in slides.
---

# UnoCSS Skill

Guidance for using UnoCSS in the POC Middleware Slidev presentation (`poc-middleware-slidev/`).

## Project Configuration

Located at `poc-middleware-slidev/uno.config.ts`:
- `presetWind4` — Tailwind CSS v4 utilities
- `presetAttributify` — Utility classes as HTML attributes
- `presetIcons` — Iconify icons as pure CSS

## Colorblind-Friendly Palette (CRITICAL)

The director is deuteranopic (red-green colorblind). The project uses a strict palette that avoids green/orange/red pairs.

| Role | Tailwind class | Hex |
|---|---|---|
| Primary | `blue-400/500` | `#60a5fa` / `#3b82f6` |
| Secondary | `purple-400/500` | `#a78bfa` / `#8b5cf6` |
| Accent (replaces green) | `cyan-400/500` | `#22d3ee` / `#06b6d4` |
| Highlight (replaces orange) | `fuchsia-400/500` | `#e879f9` / `#d946ef` |
| Alert (replaces red) | `pink-400/500` | `#f472b6` / `#ec4899` |
| Neutral | `gray-400/500` | `#94a3b8` / `#64748b` |

### Forbidden Colors
- **NEVER use:** `green-*`, `orange-*`, `red-*` classes
- **NEVER use:** `#10b981`, `#34d399`, `#6ee7b7` (emerald/green)
- **NEVER use:** `#f59e0b`, `#fbbf24` (amber/orange)
- **NEVER use:** `#ef4444`, `#f87171` (red)

### Background Opacity
Use `0.08–0.12` for semi-transparent backgrounds (e.g., `bg-cyan-500/10`), not `0.03–0.06`.

## Icons (Iconify)

### Installed Collections
- `ph` (Phosphor) — primary, clean design
- `carbon` (IBM) — complementary, tech/infra icons
- `svg-spinners` — CSS-only animated icons

### Syntax
Always use `<span>` with closing tag and `inline-block`:
```html
<span class="i-ph-lightning-fill inline-block text-cyan-400"></span>
<span class="i-carbon-bot text-xl inline-block"></span>
<span class="i-svg-spinners-pulse-3 text-cyan-400 text-[7px] inline-block"></span>
```

**Pattern:** `i-{collection}-{icon-name}`

### Common Icons in This Project

| Concept | Icon class |
|---|---|
| Connection | `i-ph-plugs-connected-fill` |
| Server | `i-carbon-bare-metal-server-02` |
| Warning | `i-ph-warning-diamond-fill` |
| Speed | `i-ph-lightning-fill` |
| Shield | `i-ph-shield-check-fill` |
| Lock/Auth | `i-ph-lock-key-fill` |
| Chart | `i-ph-chart-line-up-fill` |
| Heartbeat | `i-ph-heartbeat-fill` |
| AI/Robot | `i-carbon-bot` |
| Gateway | `i-ph-door-open-fill` |
| Rate Limit | `i-ph-gauge-fill` |
| Logging | `i-ph-list-magnifying-glass-fill` |
| Animated pulse | `i-svg-spinners-pulse-3` |

**Icon search:** https://icon-sets.iconify.design/ (filter by `ph`, `carbon`, `svg-spinners`)

## Utility Classes

### Standard (presetWind4)
```html
<div class="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <span class="text-lg font-bold">KPI Value</span>
</div>
```

### Attributify Mode (presetAttributify)
```html
<button
  bg="blue-500 hover:blue-700"
  text="white sm"
  font="bold"
  p="y-2 x-4"
  border="rounded"
>
  Click Me
</button>
```

### Dynamic Classes (Vue)
```html
<div :class="{ 'text-pink-500': hasError, 'text-cyan-500': !hasError }">
  Status Message
</div>
```

## Best Practices
- Be consistent within the same component — pick utility or attributify, don't mix.
- Group related styles with attributify when there are many utilities of the same category.
- When adding colors, always check against the colorblind palette above.
