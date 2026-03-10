<!--
  ScenarioFlow.vue
  Container wrapper para os diagramas de fluxo dos slides de cenário.
  Aplica animação de entrada (fade-in via v-motion) ao conteúdo via slot.
  Cada slide de cenário envolve seu SVG + FlowNodes neste componente.
-->
<script setup>
</script>

<template>
  <div class="scenario-flow my-1" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
    <slot />
  </div>
</template>
