<script setup>
</script>

<template>
  <div class="scenario-flow my-1" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
    <slot />
  </div>
</template>
