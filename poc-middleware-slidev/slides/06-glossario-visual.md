---
transition: slide-left
---

# Glossário Visual — Legenda do Mapa

<div class="gradient-subtitle text-[0.9rem]">Antes de ver os cenários, conheça cada peça do diagrama</div>
<div class="gradient-divider mx-auto mt-2 mb-3"></div>

<div class="grid grid-cols-2 gap-x-6 gap-y-0 mt-1">

<div>
  <div class="accent-bar accent-bar-blue mb-2">
    <span class="i-ph-sign-in-fill inline-block text-blue-600 dark:text-blue-400 align-middle mr-1"></span> Quem envia (Consumidores)
  </div>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-blue-500/8 border border-solid border-blue-500/15">
      <span class="i-ph-plugs-connected-fill text-blue-600 dark:text-blue-400 text-base inline-block shrink-0"></span>
      <div>
        <span class="text-blue-700 dark:text-blue-300 font-600 text-[11px]">ERP Externo / Origem</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 ml-2">Sistema que envia ou consulta dados</span>
      </div>
    </div>
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-blue-500/8 border border-solid border-blue-500/15">
      <span class="i-carbon-bot text-blue-600 dark:text-blue-400 text-base inline-block shrink-0"></span>
      <div>
        <span class="text-blue-700 dark:text-blue-300 font-600 text-[11px]">Agente IA</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 ml-2">Consulta sistemas via porta única (futuro)</span>
      </div>
    </div>
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-blue-500/8 border border-solid border-blue-500/15">
      <span class="i-ph-chart-line-up-fill text-blue-600 dark:text-blue-400 text-base inline-block shrink-0"></span>
      <div>
        <span class="text-blue-700 dark:text-blue-300 font-600 text-[11px]">Dashboard / Portal</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 ml-2">Dados em tempo real via passagem direta</span>
      </div>
    </div>
  </div>
</div>

<div>
  <div class="accent-bar accent-bar-cyan mb-2">
    <span class="i-ph-sign-out-fill inline-block text-cyan-600 dark:text-cyan-400 align-middle mr-1"></span> Quem recebe (Provedores)
  </div>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-cyan-500/8 border border-solid border-cyan-500/15">
      <span class="i-carbon-bare-metal-server-02 text-cyan-600 dark:text-cyan-400 text-base inline-block shrink-0"></span>
      <div>
        <span class="text-cyan-700 dark:text-cyan-300 font-600 text-[11px]">EME4 / BRC /Previva</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 ml-2">Sistema destino — não sabe que existe middleware</span>
      </div>
    </div>
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-cyan-500/8 border border-solid border-cyan-500/15">
      <span class="i-carbon-chart-network text-cyan-600 dark:text-cyan-400 text-base inline-block shrink-0"></span>
      <div>
        <span class="text-cyan-700 dark:text-cyan-300 font-600 text-[11px]">N8N / Gesti / Service</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 ml-2">Outros destinos — o middleware conecta qualquer um</span>
      </div>
    </div>
    <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-cyan-500/8 border border-solid border-cyan-500/15">
      <span class="i-carbon-dashboard text-cyan-600 dark:text-cyan-400 text-base inline-block shrink-0"></span>
      <div>
        <span class="text-cyan-700 dark:text-cyan-300 font-600 text-[11px]">Monitor</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 ml-2">Consome eventos para métricas e alertas</span>
      </div>
    </div>
  </div>
</div>

</div>

<div class="mt-3">
  <div class="accent-bar accent-bar-purple mb-2">
    <span class="i-ph-puzzle-piece-fill inline-block text-purple-600 dark:text-purple-400 align-middle mr-1"></span> O Middleware (entre os dois lados)
  </div>
  <div class="grid grid-cols-3 gap-3">
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/8 border border-solid border-purple-500/15">
      <span class="i-ph-shield-check-fill text-purple-600 dark:text-purple-400 text-lg inline-block shrink-0"></span>
      <div>
        <div class="text-purple-700 dark:text-purple-300 font-600 text-[11px]">Kong / APISIX</div>
        <div class="text-[9px] text-slate-500 dark:text-slate-400">Porta de entrada — Auth, LB, Rate Limit</div>
      </div>
    </div>
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-cyan-500/8 border border-solid border-cyan-500/15">
      <span class="i-ph-cloud-arrow-up-fill text-cyan-600 dark:text-cyan-400 text-lg inline-block shrink-0"></span>
      <div>
        <div class="text-cyan-700 dark:text-cyan-300 font-600 text-[11px]">NATS JetStream</div>
        <div class="text-[9px] text-slate-500 dark:text-slate-400">Sistema nervoso — Filas, Retry, Fan-out</div>
      </div>
    </div>
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-fuchsia-500/8 border border-solid border-fuchsia-500/15">
      <span class="i-ph-gear-six-fill text-fuchsia-600 dark:text-fuchsia-400 text-lg inline-block shrink-0"></span>
      <div>
        <div class="text-fuchsia-700 dark:text-fuchsia-300 font-600 text-[11px]">Worker</div>
        <div class="text-[9px] text-slate-500 dark:text-slate-400">Executor — Tradução DE→PARA, chamadas</div>
      </div>
    </div>
  </div>
</div>

<div class="mt-3 flex justify-center gap-5">
  <div class="flex items-center gap-1.5">
    <svg width="32" height="6"><line x1="0" y1="3" x2="32" y2="3" stroke="rgb(96 165 250)" stroke-width="2" stroke-dasharray="5,4"/></svg>
    <span class="text-[9px] text-slate-500 dark:text-slate-400">Conexão entre componentes</span>
  </div>
  <div class="flex items-center gap-1.5">
    <div class="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
    <span class="text-[9px] text-slate-500 dark:text-slate-400">Mensagem em trânsito</span>
  </div>
  <div class="flex items-center gap-1.5">
    <span class="i-ph-check-circle-fill text-cyan-600 dark:text-cyan-400 text-xs inline-block"></span>
    <span class="text-[9px] text-slate-500 dark:text-slate-400">Ack (confirmação de entrega)</span>
  </div>
  <div class="flex items-center gap-1.5">
    <span class="i-ph-x-circle-fill text-fuchsia-700 dark:text-pink-400 text-xs inline-block"></span>
    <span class="text-[9px] text-slate-500 dark:text-slate-400">Nak (volta pra fila / retry)</span>
  </div>
</div>

<!--
- Slide de referência rápida — legenda de todos os elementos visuais usados nos diagramas
- Divide em 3 seções: Consumidores (blue), Provedores (cyan) e Middleware (purple/cyan/fuchsia)
- Inclui também legenda de linhas, dots e badges (Ack, Nak)
- Deve ser apresentado ANTES dos cenários para que o público já conheça as peças
- Complementa os hints interativos (web) com conteúdo para apresentação ao vivo
-->
