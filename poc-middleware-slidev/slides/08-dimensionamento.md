---
transition: slide-left
---

# Dimensionamento: Equipe e Tempo

<div class="gradient-subtitle text-[0.9rem]">Estimativa para implementação da POC com escopo reduzido</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div v-click class="grid grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
  <div class="info-card border-cyan-500/20 p-5">
    <div class="card-header text-cyan-600 dark:text-cyan-400"><span class="i-ph-users-three-fill inline-block align-middle mr-2"></span>Equipe</div>
    <div class="card-body mt-3 text-xs">
      <div class="flex items-center gap-2 mb-2"><span class="i-ph-user-fill inline-block text-cyan-600 dark:text-cyan-400"></span> <strong>1 Dev Integração</strong> — APIs + Worker</div>
      <div class="flex items-center gap-2 mb-2"><span class="i-ph-user-fill inline-block text-blue-600 dark:text-blue-400"></span> <strong>1 Infra/DevOps</strong> — NATS + Gateway</div>
      <div class="flex items-center gap-2"><span class="i-ph-user-fill inline-block text-purple-600 dark:text-purple-400"></span> <strong>1 Analista EME4</strong> — negócio + validação</div>
    </div>
  </div>
  <div class="info-card border-purple-500/20 p-5 text-[1rem]">
    <div class="card-header text-purple-600 dark:text-purple-400"><span class="i-ph-calendar-check-fill inline-block align-middle mr-2"></span>Cronograma</div>
    <div class="card-body mt-3 text-[0.85rem]">
      <div class="flex items-center gap-2 mb-2"><span class="i-ph-number-circle-one-fill inline-block text-cyan-600 dark:text-cyan-400"></span> <strong>Semana 1–2</strong> — Infra + NATS + Gateway</div>
      <div class="flex items-center gap-2 mb-2"><span class="i-ph-number-circle-two-fill inline-block text-blue-600 dark:text-blue-400"></span> <strong>Semana 3</strong> — integração EME4</div>
      <div class="flex items-center gap-2"><span class="i-ph-number-circle-three-fill inline-block text-purple-600 dark:text-purple-400"></span> <strong>Semana 4</strong> — Testes + ajustes + entrega</div>
    </div>
  </div>
</div>

<div v-click class="grid grid-cols-3 gap-4 mt-6 max-w-3xl mx-auto">
  <div class="stat-card stat-glow-cyan">
    <div class="stat-value text-cyan-600 dark:text-cyan-400 text-[1.8rem]">3</div>
    <div class="stat-label">profissionais</div>
  </div>
  <div class="stat-card stat-glow-blue">
    <div class="stat-value text-blue-600 dark:text-blue-400 text-[1.8rem]">4</div>
    <div class="stat-label">semanas</div>
  </div>
  <div class="stat-card stat-glow-purple">
    <div class="stat-value text-purple-600 dark:text-purple-400 text-[1.8rem]">R$ 0</div>
    <div class="stat-label">licenças de software</div>
  </div>
</div>

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good max-w-2xl mx-auto">
  <span class="text-cyan-700 dark:text-cyan-300">POC viável com equipe enxuta e prazo curto — sem custos de licenciamento.</span>
</div>

<!--
- Equipe mínima: 3 profissionais (Dev, DevOps, Analista EME4)
- 4 semanas do início à entrega
- Sem custos de licença — NATS e Kong/APISIX são open source
- Risco baixo: escopo reduzido, equipe enxuta, prazo curto
- Se a POC funciona, temos base concreta para expandir
-->
