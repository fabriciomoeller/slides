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
