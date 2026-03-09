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
  cyan: 'text-cyan-400',
  fuchsia: 'text-fuchsia-400',
  pink: 'text-pink-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  slate: 'text-slate-400',
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
