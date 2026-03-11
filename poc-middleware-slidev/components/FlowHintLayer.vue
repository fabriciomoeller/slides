<!--
  FlowHintLayer.vue
  Camada global de tooltips para FlowNodes.
  Escuta mouseenter/mouseleave via event delegation em [data-hint].
  Renderiza um tooltip position:fixed no body, fora de qualquer stacking context.
  Não altera o DOM dos FlowNodes — v-click.hide continua funcionando.
-->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const html = ref('')
const color = ref('cyan')
const style = ref({})

const colorBorders = {
  cyan: '1px solid rgba(6, 182, 212, 0.6)',
  fuchsia: '1px solid rgba(217, 70, 239, 0.6)',
  pink: '1px solid rgba(236, 72, 153, 0.6)',
  blue: '1px solid rgba(59, 130, 246, 0.6)',
  violet: '1px solid rgba(139, 92, 246, 0.6)',
  purple: '1px solid rgba(139, 92, 246, 0.6)',
}

const colorArrows = {
  cyan: 'rgba(6, 182, 212, 0.6)',
  fuchsia: 'rgba(217, 70, 239, 0.6)',
  pink: 'rgba(236, 72, 153, 0.6)',
  blue: 'rgba(59, 130, 246, 0.6)',
  violet: 'rgba(139, 92, 246, 0.6)',
  purple: 'rgba(139, 92, 246, 0.6)',
}

const tipRef = ref(null)
let currentEl = null

function show(e) {
  const el = e.target.closest('[data-hint]')
  if (!el || !el.dataset.hint) return
  currentEl = el
  html.value = el.dataset.hint
  color.value = el.dataset.hintColor || 'cyan'
  visible.value = true

  requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect()
    const tip = tipRef.value
    if (!tip) return
    const tipW = tip.offsetWidth
    const tipH = tip.offsetHeight
    let left = rect.left + rect.width / 2 - tipW / 2
    let top = rect.top - tipH - 10
    if (left < 8) left = 8
    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8
    if (top < 8) top = rect.bottom + 10
    style.value = {
      left: `${left}px`,
      top: `${top}px`,
      border: colorBorders[color.value] || colorBorders.cyan,
    }
  })
}

function hide(e) {
  const el = e.target.closest('[data-hint]')
  if (el === currentEl) {
    visible.value = false
    currentEl = null
  }
}

onMounted(() => {
  document.addEventListener('mouseenter', show, true)
  document.addEventListener('mouseleave', hide, true)
})

onUnmounted(() => {
  document.removeEventListener('mouseenter', show, true)
  document.removeEventListener('mouseleave', hide, true)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="tipRef"
      class="flow-hint"
      :style="style"
    >
      <div class="flow-hint-body" v-html="html"></div>
      <div
        class="flow-hint-arrow"
        :style="{ borderTopColor: colorArrows[color] || colorArrows.cyan }"
      ></div>
    </div>
  </Teleport>
</template>
