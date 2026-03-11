<!--
  FlowMsgStack.vue
  Pilha visual de mensagens acumuladas — usado como slot dentro de FlowNode.
  Barras aparecem (fill) e desaparecem (drain) conforme os clicks do slide.
  Posiciona-se DENTRO do nó pai, no lado indicado pela prop "side".

  Props:
    - clicks  : número do click atual ($clicks do Slidev)
    - fillAt  : click em que as barras começam a acumular (default: 1)
    - drainAt : click em que as barras começam a drenar (default: Infinity)
    - side    : lado do nó — "right" ou "left" (default: right)
    - color   : cor base — cyan, fuchsia, pink (default: cyan)

  Uso (dentro de FlowNode):
    <FlowNode label="NATS" ...>
      <template #right>
        <FlowMsgStack :clicks="$clicks" :fill-at="1" :drain-at="3" />
      </template>
    </FlowNode>
-->
<script setup>
import { computed } from "vue";

const props = defineProps({
  clicks: { type: Number, default: 0 },
  fillAt: { type: Number, default: 1 },
  drainAt: { type: Number, default: Infinity },
  side: { type: String, default: "right" },
  color: { type: String, default: "cyan" },
});

const phase = computed(() => {
  if (props.clicks >= props.drainAt) return "drain";
  if (props.clicks >= props.fillAt) return "fill";
  return "idle";
});

const colorMap = {
  cyan: "34 211 238",
  fuchsia: "217 70 239",
  pink: "236 72 153",
};

const rgb = computed(() => colorMap[props.color] || colorMap.cyan);

// Small bars — fit inside 56px tall node
const bars = [
  { w: 16 },
  { w: 12 },
  { w: 14 },
  { w: 10 },
  { w: 15 },
  { w: 11 },
  { w: 13 },
];

const opacities = [0.55, 0.38, 0.48, 0.42, 0.52, 0.36, 0.5];

const posStyle = computed(() =>
  props.side === "left"
    ? { left: "2px", top: "2px", bottom: "2px" }
    : { right: "2px", top: "2px", bottom: "2px" },
);
</script>

<template>
  <div
    v-if="phase !== 'idle'"
    class="absolute flex flex-col items-end justify-center gap-1px pointer-events-none"
    :style="posStyle"
  >
    <div
      v-for="(bar, i) in bars"
      :key="`${phase}-${i}`"
      :class="phase === 'drain' ? 'msg-bar-out' : 'msg-bar-in'"
      :style="{
        width: `${bar.w}px`,
        height: '3px',
        borderRadius: '1.5px',
        background: `rgb(${rgb} / ${opacities[i]})`,
        animationDelay: `${i * 0.15}s`,
      }"
    />
  </div>
</template>
