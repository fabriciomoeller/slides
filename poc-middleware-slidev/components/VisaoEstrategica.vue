<!--
  VisaoEstrategica.vue
  Diagrama SVG completo do slide "Visão Estratégica" que mostra a evolução em 3 fases:
    1. POC (agora) — ERP Externo ↔ EME4
    2. Fase 2 — + Outros módulos e sistemas Datainfo
    3. Fase 3 (IA) — Agentes de IA consultando todos os sistemas
  Inclui timeline animada, arquitetura futura (produtores → Middleware → sistemas)
  e mensagem-chave final. Animações sequenciais via classes .a1–.a18 com delays escalonados,
  ativadas após 600ms (aguarda transição do slide) via flag `ready`.
-->
<script setup>
import { ref, onMounted } from 'vue'

const ready = ref(false)

onMounted(() => {
  // Wait for slide transition to finish before starting animations
  setTimeout(() => { ready.value = true }, 600)
})
</script>

<template>
  <div class="visao-wrapper" :class="{ animate: ready }">
    <svg viewBox="50 20 1120 630" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="ve-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ve-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="ve-accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>

      <!-- Title -->
      <text x="600" y="50" text-anchor="middle" font-size="26" font-weight="700" fill="white" class="a a1">Vis&#xE3;o Estrat&#xE9;gica: O Middleware como base para IA</text>
      <text x="600" y="75" text-anchor="middle" font-size="15" fill="#94a3b8" class="a a1">N&#xE3;o &#xE9; exagero. &#xC9; o primeiro passo de algo muito maior.</text>

      <!-- Timeline -->
      <line x1="100" y1="160" x2="1100" y2="160" stroke="#334155" stroke-width="3" class="a a1"/>

      <!-- POC (now) -->
      <g class="a a2">
        <circle cx="200" cy="160" r="14" fill="#3b82f6" filter="url(#ve-glow)"/>
        <text x="200" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="white">1</text>
        <text x="200" y="140" text-anchor="middle" font-size="13" font-weight="700" fill="#60a5fa">POC (agora)</text>
      </g>
      <g class="a a3">
        <rect x="110" y="185" width="180" height="90" rx="8" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="200" y="210" text-anchor="middle" font-size="12" fill="#cbd5e1">ERP Externo &#x2194; EME4</text>
        <text x="200" y="230" text-anchor="middle" font-size="11" fill="#94a3b8">Engenharia + OPs</text>
        <text x="200" y="255" text-anchor="middle" font-size="13" font-weight="600" fill="#60a5fa">Centenas/dia</text>
      </g>

      <!-- Phase 2 -->
      <g class="a a4">
        <circle cx="550" cy="160" r="14" fill="#8b5cf6"/>
        <text x="550" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="white">2</text>
        <text x="550" y="140" text-anchor="middle" font-size="13" font-weight="700" fill="#a78bfa">Fase 2</text>
      </g>
      <g class="a a5">
        <rect x="430" y="185" width="240" height="90" rx="8" fill="none" stroke="#8b5cf6" stroke-width="1.5"/>
        <text x="550" y="210" text-anchor="middle" font-size="12" fill="#cbd5e1">+ Outros m&#xF3;dulos EME4</text>
        <text x="550" y="230" text-anchor="middle" font-size="11" fill="#94a3b8">+ Sistemas Datainfo</text>
        <text x="550" y="255" text-anchor="middle" font-size="13" font-weight="600" fill="#a78bfa">Milhares/dia</text>
      </g>

      <!-- Phase 3 (AI) -->
      <g class="a a6">
        <circle cx="900" cy="160" r="14" fill="#06b6d4" filter="url(#ve-glow)"/>
        <text x="900" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="white">3</text>
        <text x="900" y="140" text-anchor="middle" font-size="13" font-weight="700" fill="#22d3ee">Fase 3 (IA)</text>
      </g>
      <g class="a a7">
        <rect x="760" y="185" width="280" height="90" rx="8" fill="none" stroke="#06b6d4" stroke-width="1.5"/>
        <text x="900" y="210" text-anchor="middle" font-size="12" fill="#cbd5e1">+ Agentes de IA</text>
        <text x="900" y="230" text-anchor="middle" font-size="11" fill="#94a3b8">consultando e atuando em todos os sistemas</text>
        <text x="900" y="255" text-anchor="middle" font-size="13" font-weight="600" fill="#22d3ee">Dezenas de milhares/dia</text>
      </g>

      <!-- Future architecture title -->
      <text x="600" y="320" text-anchor="middle" font-size="18" font-weight="600" fill="white" class="a a8">Futuro: Uma porta &#xFA;nica para todos os sistemas</text>

      <!-- Producers (left side) -->
      <g transform="translate(80, 350)" class="a a9">
        <rect width="140" height="40" rx="8" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="white">Agentes IA</text>
      </g>
      <g transform="translate(80, 400)" class="a a10">
        <rect width="140" height="40" rx="8" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="white">ERP Externo</text>
      </g>
      <g transform="translate(80, 450)" class="a a11">
        <rect width="140" height="40" rx="8" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="white">App Mobile</text>
      </g>
      <g transform="translate(80, 500)" class="a a12">
        <rect width="140" height="40" rx="8" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="white">Dashboard</text>
      </g>

      <!-- Dashed arrows to middleware -->
      <g class="a a13">
        <line x1="225" y1="370" x2="420" y2="410" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
        <line x1="225" y1="420" x2="420" y2="425" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
        <line x1="225" y1="470" x2="420" y2="440" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
        <line x1="225" y1="520" x2="420" y2="455" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
      </g>

      <!-- Middleware box -->
      <g class="a a13">
        <rect x="420" y="370" width="260" height="110" rx="12" fill="#1e1b4b" stroke="url(#ve-accentGrad)" stroke-width="2" filter="url(#ve-shadow)"/>
        <text x="550" y="405" text-anchor="middle" font-size="16" font-weight="700" fill="white">MIDDLEWARE</text>
        <text x="550" y="425" text-anchor="middle" font-size="12" fill="#a78bfa">Kong/APISIX + NATS</text>
        <text x="550" y="450" text-anchor="middle" font-size="11" fill="#94a3b8">Auth | LB | Fila | Tradu&#xE7;&#xE3;o</text>
        <text x="550" y="468" text-anchor="middle" font-size="10" fill="#64748b">Worker quando precisa | Direto quando n&#xE3;o</text>
      </g>

      <!-- Dashed arrows to systems -->
      <g class="a a14">
        <line x1="685" y1="410" x2="830" y2="370" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
        <line x1="685" y1="425" x2="830" y2="420" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
        <line x1="685" y1="440" x2="830" y2="470" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
        <line x1="685" y1="455" x2="830" y2="520" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
      </g>

      <!-- Backend systems (right side) -->
      <g transform="translate(835, 350)" class="a a14">
        <rect width="140" height="40" rx="8" fill="#083344" stroke="#06b6d4" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="#67e8f9">EME4</text>
      </g>
      <g transform="translate(835, 400)" class="a a15">
        <rect width="140" height="40" rx="8" fill="#083344" stroke="#06b6d4" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="#67e8f9">ERP Externo</text>
      </g>
      <g transform="translate(835, 450)" class="a a16">
        <rect width="140" height="40" rx="8" fill="#083344" stroke="#06b6d4" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="#67e8f9">Sistema X</text>
      </g>
      <g transform="translate(835, 500)" class="a a17">
        <rect width="140" height="40" rx="8" fill="#083344" stroke="#06b6d4" stroke-width="1"/>
        <text x="70" y="25" text-anchor="middle" font-size="12" font-weight="600" fill="#67e8f9">Sistema Y</text>
      </g>

      <!-- Key message -->
      <g class="a a18">
        <rect x="200" y="575" width="800" height="45" rx="10" fill="#1e293b" stroke="#d946ef" stroke-width="1.5"/>
        <text x="600" y="603" text-anchor="middle" font-size="15" font-weight="600" fill="#e879f9">A POC &#xE9; o piloto. O Middleware &#xE9; a pista de decolagem para a IA.</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.visao-wrapper {
  position: absolute;
  inset: 0;
  padding: 0;
  overflow: hidden;
}
.visao-wrapper svg {
  width: 100%;
  height: 100%;
}

/* All animated elements start invisible */
.a { opacity: 0; }

/* Only animate when .animate class is added (after slide transition) */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate .a {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate .a1  { animation-delay: 0s; }
.animate .a2  { animation-delay: 0.15s; }
.animate .a3  { animation-delay: 0.25s; }
.animate .a4  { animation-delay: 0.35s; }
.animate .a5  { animation-delay: 0.45s; }
.animate .a6  { animation-delay: 0.55s; }
.animate .a7  { animation-delay: 0.65s; }
.animate .a8  { animation-delay: 0.85s; }
.animate .a9  { animation-delay: 1.0s; }
.animate .a10 { animation-delay: 1.05s; }
.animate .a11 { animation-delay: 1.1s; }
.animate .a12 { animation-delay: 1.15s; }
.animate .a13 { animation-delay: 1.3s; }
.animate .a14 { animation-delay: 1.5s; }
.animate .a15 { animation-delay: 1.55s; }
.animate .a16 { animation-delay: 1.6s; }
.animate .a17 { animation-delay: 1.65s; }
.animate .a18 { animation-delay: 1.9s; }
</style>
