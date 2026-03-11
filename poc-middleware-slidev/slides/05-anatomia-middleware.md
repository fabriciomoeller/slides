---
transition: slide-left
---

# Anatomia do Middleware — 3 Camadas

<div class="gradient-subtitle text-[0.9rem]">Cada ferramenta tem um papel insubstituível</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div class="grid grid-cols-3 gap-5 mt-2">

<div v-click class="relative p-4 rounded-xl border border-solid border-purple-500/30 bg-purple-500/8">
  <div class="absolute -top-3 left-4 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-solid border-purple-500/40 text-purple-600 dark:text-purple-400 text-[10px] font-700 tracking-wider">CAMADA 1 — PORTA DE ENTRADA</div>
  <div class="flex items-center gap-2 mt-2 mb-3">
    <span class="i-ph-shield-check-fill text-purple-600 dark:text-purple-400 text-2xl inline-block"></span>
    <div class="text-slate-900 dark:text-white font-700 text-[15px]">Kong / APISIX</div>
  </div>
  <div class="text-purple-700 dark:text-purple-300 font-600 text-[11px] mb-2">Quem entra? Para onde vai?</div>
  <div class="flex flex-col gap-1.5">
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-key-fill inline-block text-purple-600 dark:text-purple-400 mr-1"></span> Autenticação (JWT, API Key, OAuth)</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-scales-fill inline-block text-purple-600 dark:text-purple-400 mr-1"></span> Load Balancing entre servidores</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-gauge-fill inline-block text-purple-600 dark:text-purple-400 mr-1"></span> Rate Limiting (controle de abuso)</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-arrows-split inline-block text-purple-600 dark:text-purple-400 mr-1"></span> Roteamento inteligente</div>
  </div>
  <div class="mt-3 pt-2 border-t border-solid border-purple-500/20 text-[9px] text-slate-500">
    <span class="i-ph-arrow-down-fill inline-block text-purple-600 dark:text-purple-400 mr-1"></span> Tráfego norte→sul (externo → interno)
  </div>
</div>

<div v-click class="relative p-4 rounded-xl border border-solid border-cyan-500/30 bg-cyan-500/8">
  <div class="absolute -top-3 left-4 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-solid border-cyan-500/40 text-cyan-600 dark:text-cyan-400 text-[10px] font-700 tracking-wider">CAMADA 2 — SISTEMA NERVOSO</div>
  <div class="flex items-center gap-2 mt-2 mb-3">
    <span class="i-ph-cloud-arrow-up-fill text-cyan-600 dark:text-cyan-400 text-2xl inline-block"></span>
    <div class="text-slate-900 dark:text-white font-700 text-[15px]">NATS JetStream</div>
  </div>
  <div class="text-cyan-700 dark:text-cyan-300 font-600 text-[11px] mb-2">Não perde nenhum pedido</div>
  <div class="flex flex-col gap-1.5">
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-queue-fill inline-block text-cyan-600 dark:text-cyan-400 mr-1"></span> Filas com persistência em disco</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-arrows-clockwise-fill inline-block text-cyan-600 dark:text-cyan-400 mr-1"></span> Retry automático com backoff</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-broadcast-fill inline-block text-cyan-600 dark:text-cyan-400 mr-1"></span> Fan-out (1 msg → N consumidores)</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-link-break-fill inline-block text-cyan-600 dark:text-cyan-400 mr-1"></span> Desacopla produtor de consumidor</div>
  </div>
  <div class="mt-3 pt-2 border-t border-solid border-cyan-500/20 text-[9px] text-slate-500">
    <span class="i-ph-arrows-left-right-fill inline-block text-cyan-600 dark:text-cyan-400 mr-1"></span> Tráfego leste↔oeste (interno ↔ interno)
  </div>
</div>

<div v-click class="relative p-4 rounded-xl border border-solid border-fuchsia-500/30 bg-fuchsia-500/8">
  <div class="absolute -top-3 left-4 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-solid border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-400 text-[10px] font-700 tracking-wider">CAMADA 3 — EXECUTORES</div>
  <div class="flex items-center gap-2 mt-2 mb-3">
    <span class="i-ph-gear-six-fill text-fuchsia-600 dark:text-fuchsia-400 text-2xl inline-block"></span>
    <div class="text-slate-900 dark:text-white font-700 text-[15px]">Workers</div>
  </div>
  <div class="text-fuchsia-700 dark:text-fuchsia-300 font-600 text-[11px] mb-2">Cada um faz seu trabalho</div>
  <div class="flex flex-col gap-1.5">
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-shuffle-fill inline-block text-fuchsia-600 dark:text-fuchsia-400 mr-1"></span> Transformação DE→PARA (XML↔JSON)</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-plugs-connected-fill inline-block text-fuchsia-600 dark:text-fuchsia-400 mr-1"></span> Chamadas ao sistema destino</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-copy-fill inline-block text-fuchsia-600 dark:text-fuchsia-400 mr-1"></span> Escalável: 1, 5 ou 50 instâncias</div>
    <div class="text-[10px] text-slate-600 dark:text-slate-300"><span class="i-ph-wrench-fill inline-block text-fuchsia-600 dark:text-fuchsia-400 mr-1"></span> Go, Python, C#, N8N, RPA... qualquer tech</div>
  </div>
  <div class="mt-3 pt-2 border-t border-solid border-fuchsia-500/20 text-[9px] text-slate-500">
    <span class="i-ph-arrow-bend-down-right-fill inline-block text-fuchsia-600 dark:text-fuchsia-400 mr-1"></span> Consome da fila, entrega no destino
  </div>
</div>

</div>

<div v-click class="mt-5 flex justify-center">
  <div class="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white shadow-sm dark:shadow-none dark:bg-slate-800/50 border border-solid border-slate-600/30">
    <div class="flex items-center gap-1.5">
      <span class="i-ph-shield-check-fill text-purple-600 dark:text-purple-400 inline-block"></span>
      <span class="text-[11px] text-purple-700 dark:text-purple-300 font-600">Kong</span>
    </div>
    <span class="text-slate-600 text-[11px]">→</span>
    <div class="flex items-center gap-1.5">
      <span class="i-ph-cloud-arrow-up-fill text-cyan-600 dark:text-cyan-400 inline-block"></span>
      <span class="text-[11px] text-cyan-700 dark:text-cyan-300 font-600">NATS</span>
    </div>
    <span class="text-slate-600 text-[11px]">→</span>
    <div class="flex items-center gap-1.5">
      <span class="i-ph-gear-six-fill text-fuchsia-600 dark:text-fuchsia-400 inline-block"></span>
      <span class="text-[11px] text-fuchsia-700 dark:text-fuchsia-300 font-600">Worker</span>
    </div>
    <span class="text-slate-600 text-[11px]">→</span>
    <div class="flex items-center gap-1.5">
      <span class="i-carbon-bare-metal-server-02 text-cyan-600 dark:text-cyan-400 inline-block"></span>
      <span class="text-[11px] text-cyan-700 dark:text-cyan-300 font-600">EME4</span>
    </div>
  </div>
</div>

<div v-click class="mt-3 p-3 rounded-xl text-center text-sm result-good">
  <span class="text-cyan-700 dark:text-cyan-300 font-semibold">O maître não cozinha. O sistema de comandas não decide quem entra. O chef não controla a fila.</span><br>
  <span class="opacity-50">Cada camada faz uma coisa — e faz bem.</span>
</div>

<!--
- Slide educativo: explica as 3 camadas do ecossistema middleware
- Camada 1 (Kong/APISIX): API Gateway — porta de entrada, autenticação, roteamento, rate limiting
- Camada 2 (NATS JetStream): Message Broker — filas persistentes, retry, fan-out, desacoplamento
- Camada 3 (Workers): Executores — transformação de dados, chamadas ao destino, escaláveis
- Barra de fluxo mostra a sequência: Kong → NATS → Worker → EME4
- Frase final amarra com a analogia do restaurante (slide anterior)
- Nenhuma camada substitui a outra — cada ferramenta tem papel insubstituível
-->
