---
name: unocss
description: Guidelines and best practices for using UnoCSS in this project.
---

# UnoCSS Skill

This skill provides guidance on using UnoCSS within this project. The project currently uses UnoCSS with the following presets:
- `presetWind4`: Tailwind CSS v4 support.
- `presetAttributify`: Use utility classes as attributes.
- `presetIcons`: Use any icon as pure CSS (Iconify).

## Project Configuration

The UnoCSS configuration is located at `frontend/uno.config.js`.

```javascript
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    }),
  ],
})
```

## Usage Guidelines

### 1. Utility Classes (presetWind4)

Use standard tailwind-like utility classes in the `class` attribute.

```html
<div class="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <span class="text-lg font-bold">KPI Value</span>
</div>
```

### 2. Attributify Mode (presetAttributify)

You can use utility classes as attributes to keep the HTML cleaner.

```html
<div flex items-center justify-between p-4 bg-gray-100 rounded-lg>
  <span text-lg font-bold>KPI Value</span>
</div>
```

Special attributes like `text`, `bg`, `p`, etc., can be used for grouping:

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

### 3. Icons (presetIcons)

You can use any icon from Iconify using the `i-<collection>-<icon>` format.

```html
<!-- Using Lucide icons -->
<div class="i-lucide-box text-blue-500" />
<div class="i-lucide-settings w-6 h-6" />

<!-- Using Carbon icons -->
<div class="i-carbon-dashboard text-2xl" />
<div class="i-carbon-chart-line" />
```

You can combine it with attributify mode:

```html
<div i-lucide-user text-green-500 w-8 h-8 />
```

### 4. Dynamic Classes

When using dynamic classes with Vue, prefer standard class bindings or the `uno-` prefix if there are conflicts.

```html
<div :class="{ 'text-red-500': hasError, 'text-green-500': !hasError }">
  Status Message
</div>
```

### 5. Responsiveness

Use the standard prefix for breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Content -->
</div>
```

## Best Practices

- **Consistency**: Choose either utility classes or attributify mode and stick to it within the same component for better readability.
- **Organization**: Group related styles using the attributify syntax when multiple utilities of the same category are used.
- **Documentation**: If you add new shortcuts or custom rules, document them in `frontend/uno.config.js`.

## Resources

- [UnoCSS Documentation](https://unocss.dev/)
- [UnoCSS Interactive Docs](https://unocss.dev/interactive/)
