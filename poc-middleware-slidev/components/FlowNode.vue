<!--
  FlowNode.vue
  Nó (caixa) dos diagramas de fluxo representando um componente da arquitetura:
  NATS, Worker, EME4 (topo/base) etc. Posicionado via classes absolutas nos slides de cenário.
  Suporta ícone, subtítulo, efeitos de pulse/persist/recover para estados visuais.

  Props:
    - label    : texto principal do nó (obrigatório) — ex: "NATS", "Worker", "EME4 1"
    - sub      : subtítulo exibido abaixo do label (opcional)
    - icon     : classe Iconify do ícone principal (opcional) — ex: "i-carbon-cloud-upload"
    - subIcon  : classe Iconify do ícone do subtítulo (opcional)
    - color    : cor do tema — cyan, fuchsia, pink, blue, violet, purple (padrão: cyan)
    - position : posição predefinida — nats, worker, eme4-top, eme4-bottom, ou classes custom
    - size     : tamanho — top (menor) ou sm (padrão, calculado pela position)
    - pulse    : ativa animação pulseAlert para estados de erro (padrão: false)
    - persist  : ativa estilo visual de persistência NATS (padrão: false)
    - recover  : ativa estilo visual de recuperação/failover (padrão: false)
    - hint     : texto do tooltip (title) exibido ao hover (opcional)

  Slots:
    - #left  : conteúdo posicionado à esquerda do nó (ex: FlowMsgStack side="left")
    - #right : conteúdo posicionado à direita do nó (ex: FlowMsgStack side="right")
-->
<script setup>
const props = defineProps({
  label: { type: String, required: true },
  sub: { type: String, default: "" },
  icon: { type: String, default: "" },
  subIcon: { type: String, default: "" },
  color: { type: String, default: "cyan" },
  position: { type: String, default: "nats" },
  size: { type: String, default: "" },
  pulse: { type: Boolean, default: false },
  persist: { type: Boolean, default: false },
  recover: { type: Boolean, default: false },
  hint: { type: String, default: "" },
});

const colorMap = {
  cyan: "bg-cyan-50 dark:bg-cyan-500/12 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400",
  fuchsia: "bg-fuchsia-50 dark:bg-fuchsia-500/12 border-fuchsia-300 dark:border-fuchsia-500/40 text-fuchsia-700 dark:text-fuchsia-400",
  pink: "bg-fuchsia-50 dark:bg-pink-500/15 border-fuchsia-300 dark:border-pink-500/50 text-fuchsia-800 dark:text-pink-400",
  blue: "bg-blue-50 dark:bg-blue-500/12 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-400",
  violet: "bg-violet-50 dark:bg-violet-500/12 border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-400",
  purple: "bg-purple-50 dark:bg-purple-500/12 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-400",
};

const positionMap = {
  nats: "top-50% -translate-y-50% left-0 w-90px h-56px",
  worker: "top-50% -translate-y-50% left-200px w-95px h-56px",
  "eme4-top": "top-6px left-420px w-100px h-42px",
  "eme4-bottom": "bottom-6px left-420px w-100px h-42px",
};

const posClasses = positionMap[props.position] || props.position;

const sizeClass =
  props.size === "top"
    ? "anim-node-top"
    : props.size === "sm"
      ? "anim-node-sm"
      : props.position === "eme4-top" || props.position === "eme4-bottom"
        ? "anim-node-top"
        : "anim-node-sm";
</script>

<template>
  <div
    :class="[
      sizeClass,
      posClasses,
      colorMap[color],
      {
        'anim-nats-persist': persist,
        'anim-node-recover': recover,
        'z-5': recover,
      },
    ]"
    :data-hint="hint || undefined"
    :data-hint-color="hint ? color : undefined"
    :style="[
      pulse ? 'animation: pulseAlert 2.5s ease-in-out infinite' : '',
      hint ? 'cursor: help' : '',
      'overflow: visible',
    ]"
  >
    <slot name="left" />
    <span
      v-if="icon"
      :class="[
        icon,
        sizeClass === 'anim-node-top' ? 'text-xs mr-2px' : 'text-base',
        'inline-block',
      ]"
    ></span>
    {{ label }}
    <span v-if="sub" class="anim-sub">
      <span
        v-if="subIcon"
        :class="[subIcon, `text-${color}-700`, `dark:text-${color}-400`, 'text-[7px] inline-block']"
      ></span>
      {{ sub }}
    </span>
    <slot name="right" />
  </div>
</template>
