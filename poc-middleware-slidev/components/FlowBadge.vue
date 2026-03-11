<!--
  FlowBadge.vue
  Badge de texto posicionado sobre os diagramas de fluxo SVG dos slides de cenário.
  Exibe rótulos como "Pub", "Ack", "fan-out", "Entregue" etc. nas animações de fluxo.
  Suporta ícone opcional, borda estilizada, efeito pulse e dois tamanhos (xs/sm).

  Props:
    - text     : texto exibido no badge (obrigatório)
    - icon     : classe Iconify do ícone (opcional)
    - color    : cor do tema — cyan, fuchsia, pink, blue, purple, slate (padrão: cyan)
    - position : classe CSS de posicionamento absoluto (obrigatório)
    - bordered : exibe fundo e borda coloridos (padrão: false)
    - pulse    : ativa animação de pulso para destaque (padrão: false)
    - size     : tamanho do texto — xs (8px) ou sm (9px, padrão)
-->
<script setup>
const props = defineProps({
  text: { type: String, required: true },
  icon: { type: String, default: '' },
  color: { type: String, default: 'cyan' },
  position: { type: String, required: true },
  bordered: { type: Boolean, default: false },
  pulse: { type: Boolean, default: false },
  size: { type: String, default: 'sm' },
})

const colorTextMap = {
  cyan: 'text-cyan-600 dark:text-cyan-400',
  fuchsia: 'text-fuchsia-600 dark:text-fuchsia-400',
  pink: 'text-fuchsia-700 dark:text-pink-400',
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
  slate: 'text-slate-500 dark:text-slate-400',
}

const borderMap = {
  cyan: 'bg-cyan-500/10 border border-cyan-500/30 rounded-6px px-6px',
  fuchsia: 'bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-6px px-6px',
  pink: 'bg-pink-500/10 border border-pink-500/30 rounded-6px px-6px',
  blue: 'bg-blue-500/10 border border-blue-500/30 rounded-6px px-6px',
  purple: 'bg-purple-500/10 border border-purple-500/30 rounded-6px px-6px',
  slate: 'bg-slate-500/10 border border-slate-500/30 rounded-6px px-6px',
}

const sizeMap = {
  xs: 'text-[8px]',
  sm: 'text-[9px]',
}
</script>

<template>
  <div :class="[
    'anim-badge',
    position,
    colorTextMap[color],
    sizeMap[size],
    bordered ? borderMap[color] : '',
    { 'anim-success-pulse': pulse },
  ]">
    <span v-if="icon" :class="[icon, 'inline-block text-[8px]']"></span>
    {{ text }}
  </div>
</template>
