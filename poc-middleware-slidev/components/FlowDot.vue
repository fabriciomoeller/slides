<!--
  FlowDot.vue
  Ponto animado que percorre um caminho SVG (offset-path) para representar
  o fluxo de mensagens nos diagramas de cenário (pub, ack, fan-out etc.).
  Usa CSS offset-path + @keyframes followPath para a animação.

  Props:
    - d        : string do path SVG que o ponto percorre (obrigatório)
    - color    : cor do ponto — cyan, fuchsia, pink, blue, purple (padrão: cyan)
    - duration : duração da animação em segundos (padrão: 2.5)
    - delay    : atraso inicial em segundos (padrão: 0)
    - loop     : se repete infinitamente (padrão: true)
    - r        : raio do círculo SVG em px (padrão: 4)
-->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  d: { type: String, required: true },
  color: { type: String, default: 'cyan' },
  duration: { type: Number, default: 2.5 },
  delay: { type: Number, default: 0 },
  loop: { type: Boolean, default: true },
  r: { type: Number, default: 4 },
})

const fillMap = {
  cyan: '#22d3ee',
  fuchsia: '#e879f9',
  pink: '#f472b6',
  blue: '#60a5fa',
  purple: '#c4b5fd',
}

const shadowMap = {
  cyan: '#06b6d4',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  blue: '#3b82f6',
  purple: '#8b5cf6',
}

const dotStyle = computed(() => ({
  offsetPath: `path('${props.d}')`,
  offsetRotate: '0deg',
  animation: `followPath ${props.duration}s ease-in-out ${props.delay}s ${props.loop ? 'infinite' : '1 forwards'}`,
  filter: `drop-shadow(0 0 4px ${shadowMap[props.color]})`,
}))
</script>

<template>
  <circle
    cx="0" cy="0"
    :r="r"
    :fill="fillMap[color]"
    :style="dotStyle"
  />
</template>
