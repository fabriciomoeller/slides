import { defineConfig } from 'unocss'
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
  presets: [
    presetAttributify(),
  ],
  shortcuts: {
    // ── Containers de animação ──
    'anim-flow': 'relative w-full mx-auto',
    'anim-seg': 'absolute inset-0 z-1 pointer-events-none',
    'anim-svg': 'w-full h-full',

    // ── Nó base (position:absolute centrado verticalmente) ──
    'anim-node': 'absolute top-50% -translate-y-50% rounded-12px font-700 text-center border-2 border-solid flex flex-col items-center justify-center z-2',
    'anim-node-sm': 'absolute rounded-10px font-700 text-11px text-center border-2 border-solid flex flex-col items-center justify-center z-2 gap-1px',
    'anim-node-top': 'absolute rounded-10px font-700 text-11px text-center border-2 border-solid flex flex-col items-center justify-center z-2',

    // ── Badges (202 Accepted, retry) ──
    'anim-badge': 'absolute rounded-8px px-10px py-2px text-10px font-700 z-3',

    // ── Sub-text nos nós ──
    'anim-sub': 'text-8px font-400 opacity-50',
  },
})
