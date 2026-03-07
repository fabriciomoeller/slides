---
theme: default
title: POC Middleware — EME4
info: |
  POC - Prova de Conceito para infraestrutura de Middleware
  Integração do EME4 com sistemas externos
  Datainfo - Março 2026 - Versão 2.0
class: text-center
drawings:
  persist: false
transition: slide-left
colorSchema: dark
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 1 — TÍTULO
     ═══════════════════════════════════════════════════════════ -->

<DecoShapes opacity="0.10" />

<img src="/datainfo.png" class="mx-auto" style="width: 120px;" />

# EME4 — Integração via Middleware

<div class="gradient-subtitle">Conectando o EME4 a qualquer sistema</div>

<div class="gradient-divider mx-auto mt-4"></div>

<div class="pt-6">
  <span class="px-3 py-1.5 rounded-lg text-sm opacity-50">
    POC — Prova de Conceito para infraestrutura de Middleware — Ex: Protheus, IA, Dashboards
  </span>
</div>

<div class="pt-8 flex justify-center gap-5">
  <span class="tech-badge tech-badge-blue glow-blue">Kong / APISIX</span>
  <span class="tech-badge tech-badge-cyan glow-cyan">NATS JetStream</span>
  <span class="tech-badge tech-badge-purple glow-purple">Load Balancing</span>
  <span class="tech-badge tech-badge-cyan glow-cyan">Alta Disponibilidade</span>
</div>

<div class="abs-br m-6 text-sm opacity-40">
  Datainfo &bull; Março 2026 &bull; v2.0
</div>


---
transition: fade-out
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 2 — COMO FUNCIONA HOJE
     ═══════════════════════════════════════════════════════════ -->

# Como funciona HOJE

<div class="accent-bar accent-bar-blue">
  Modelo Direto — API para API — "Ligação telefônica"
</div>

<div v-click class="anim-flow max-w-700px h-100px my-6" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <div class="anim-node left-0 w-130px px-20px py-12px bg-[rgba(30,58,95,0.9)] border-blue-500/60 text-blue-300 text-13px shadow-[0_0_20px_rgba(59,130,246,0.15)]">
    <span class="i-ph-plugs-connected-fill text-2xl mb-1 inline-block"></span>
    <div class="font-bold text-base">Sistema Externo</div>
    <div class="text-xs opacity-40">(ex: ERP, IA, etc.)</div>
  </div>
  <div class="absolute left-50% top-2px -translate-x-50% font-mono text-10px text-slate-400 opacity-70 whitespace-nowrap z-3">POST /Incluir_API</div>
  <div class="anim-node right-0 w-130px px-20px py-12px bg-[rgba(10,50,60,0.9)] border-cyan-500/70 text-cyan-300 text-13px shadow-[0_0_20px_rgba(6,182,212,0.15)]">
    <span class="i-carbon-bare-metal-server-02 text-2xl mb-1 inline-block"></span>
    <div class="font-bold text-base">EME4</div>
    <div class="text-xs opacity-50">(1 servidor)</div>
  </div>
  <svg class="anim-svg absolute inset-0 z-1 pointer-events-none" viewBox="0 0 700 100" preserveAspectRatio="xMidYMid meet">
    <line x1="105" y1="50" x2="595" y2="50" class="svg-line svg-stroke-blue"/>
    <circle class="svg-dot svg-fill-blue anim-sync-ok" cx="105" cy="50" r="5"/>
    <circle class="svg-dot svg-fill-blue anim-sync-ok-d1" cx="105" cy="50" r="5"/>
    <circle class="svg-dot svg-fill-blue anim-sync-ok-d2" cx="105" cy="50" r="5"/>
    <circle class="svg-fill-pink anim-sync-err" cx="105" cy="50" r="5"/>
    <text class="anim-sync-err-text" x="350" y="30" text-anchor="middle">✕ ERRO 500</text>
  </svg>
</div>

<div v-click class="grid grid-cols-2 gap-6 mt-2">
<div class="info-card info-card-pink">
<div class="card-header text-pink-400">Problemas</div>
<div class="card-body">

- Sistema origem fica **travado** esperando
- Se EME4 cai, **tudo para**
- Sem retry automático
- Servidor único = **ponto único de falha**
- Sem distribuição de carga

</div>
</div>
<div class="info-card">
<div class="card-header text-gray-300">500 OPs de uma vez</div>
<div class="card-body">

- Envia **uma por uma**, esperando
- Se a 300ª falhar, as 200 **param**
- EME4 pode **sobrecarregar**
- **Lento e frágil**

</div>
</div>
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 3 — FLUXO PASSO A PASSO (HOJE)
     ═══════════════════════════════════════════════════════════ -->

# O fluxo passo a passo (Hoje)

<div class="accent-bar accent-bar-pink">
  O sistema externo fica bloqueado até o EME4 responder
</div>

<div class="flex flex-col gap-2 max-w-700px mx-auto">

<v-clicks>

<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-blue-500 text-blue-300">
  <div class="w-28px h-28px rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">1</div>
  <div>Sistema externo monta o JSON com os dados (ex: OP, cadastro)</div>
</div>

<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-blue-500 text-blue-300">
  <div class="w-28px h-28px rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">2</div>
  <div>Faz chamada HTTP direta: <code>POST /DoctoOrdProducaoManufatura/Incluir_API</code></div>
</div>

<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-fuchsia-500 text-fuchsia-300">
  <div class="w-28px h-28px rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">3</div>
  <div>Sistema origem <strong>AGUARDA...</strong> 2s, 5s, 10s, timeout?</div>
</div>

<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-28px h-28px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">4</div>
  <div>EME4 responde: <code>{ "Sucesso": true }</code></div>
</div>

<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-pink-500 text-pink-300">
  <div class="w-28px h-28px rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-700 text-[0.85em] shrink-0 animate-[pulseAlert_1.5s_ease-in-out_infinite]"><span class="i-ph-warning-diamond-fill inline-block"></span></div>
  <div>Se EME4 estiver fora → <strong>ERRO!</strong> Dados podem se perder</div>
</div>

</v-clicks>

</div>

<div v-click class="mt-6 p-4 rounded-xl text-center text-sm result-bad">
  <span class="text-pink-400 font-semibold">Total para 3 OPs:</span> 16 segundos (com 1 erro) — tudo sequencial, um esperando o outro
</div>


---
layout: center
transition: slide-up
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 4 — MODELO NOVO: VISÃO GERAL
     ═══════════════════════════════════════════════════════════ -->

# Modelo Novo — Middleware

<div class="gradient-subtitle" style="font-size:1.1em;">Dois modos que coexistem no mesmo Middleware</div>

<div class="gradient-divider mx-auto mt-4 mb-8"></div>

<div class="grid grid-cols-2 gap-8 w-full max-w-3xl">
  <div class="mode-card mode-card-cyan">
    <div class="mode-number bg-cyan-500/15 text-cyan-400">1</div>
    <div class="mode-title text-cyan-300">Passagem Direta</div>
    <div class="mode-desc">Sem tradutor. Sem fila.<br>Direto e rápido.</div>
    <div class="mode-use">IA, Dashboards, Consultas</div>
  </div>
  <div class="mode-card mode-card-fuchsia">
    <div class="mode-number">2</div>
    <div class="mode-title text-fuchsia-300">Com Tradutor</div>
    <div class="mode-desc">Fila NATS + Worker<br>Tradução DE-PARA + Garantia de entrega</div>
    <div class="mode-use">Ex: ERP → EME4 (com tradução)</div>
  </div>
</div>

<div class="s6-message mt-8 text-sm opacity-50 text-center" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:800}}">
  Worker só existe quando há trabalho real a fazer. Sem trabalho = passagem direta.
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 5 — MODO 2: COM TRADUTOR (WORKER)
     ═══════════════════════════════════════════════════════════ -->

# Modo 2: Com Tradutor (Worker)

<div class="accent-bar accent-bar-fuchsia">
  Quando há trabalho real — tradução, orquestração, garantia de entrega
</div>

<div class="anim-flow max-w-750px h-120px my-4" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <div class="anim-node-sm top-50% -translate-y-50% left-0 w-88px h-52px bg-blue-500/12 border-blue-500/40 text-blue-400"><span class="i-ph-plugs-connected-fill text-base inline-block"></span>ORIGEM<span class="anim-sub">ex: ERP</span></div>
  <div class="anim-node-sm top-50% -translate-y-50% left-160px w-78px h-52px bg-violet-500/12 border-violet-500/40 text-violet-400"><span class="i-ph-shield-check-fill text-base inline-block"></span>KONG<span class="anim-sub">portaria</span></div>
  <div class="anim-node-sm top-50% -translate-y-50% left-310px w-78px h-52px bg-cyan-500/12 border-cyan-500/40 text-cyan-400"><span class="i-ph-cloud-arrow-up-fill text-base inline-block"></span>NATS<span class="anim-sub">fila</span></div>
  <div class="anim-node-sm top-50% -translate-y-50% left-465px w-88px h-52px bg-fuchsia-500/12 border-fuchsia-500/40 text-fuchsia-400"><span class="i-ph-gear-six-fill text-base inline-block"></span>Worker<span class="anim-sub">tradutor</span></div>
  <div class="anim-node-top top-4px left-630px w-88px h-38px bg-cyan-500/12 border-cyan-500/40 text-cyan-400">EME4 1</div>
  <div class="anim-node-top bottom-4px left-630px w-88px h-38px bg-cyan-500/12 border-cyan-500/40 text-cyan-400">EME4 2</div>
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <line x1="90" y1="55" x2="160" y2="55" class="svg-line svg-stroke-blue"/>
      <circle class="svg-dot svg-fill-blue anim-s1" cx="90" cy="55" r="4"/>
      <circle class="svg-dot svg-fill-blue anim-s1-d" cx="90" cy="55" r="4"/>
    </svg>
  </div>
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <line x1="240" y1="55" x2="310" y2="55" class="svg-line svg-stroke-purple"/>
      <circle class="svg-dot svg-fill-purple anim-s2" cx="240" cy="55" r="4"/>
      <circle class="svg-dot svg-fill-purple anim-s2-d" cx="240" cy="55" r="4"/>
    </svg>
  </div>
  <div v-click="3" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <path d="M199,81 L199,88 Q199,96 191,96 L51,96 Q44,96 44,88 L44,81" class="svg-line-return svg-stroke-cyan"/>
      <circle class="svg-dot svg-fill-cyan anim-s3" cx="199" cy="81" r="4"/>
    </svg>
    <div class="anim-badge left-75px bottom-0px bg-cyan-500/15 border-1 border-solid border-cyan-500/40 text-cyan-400 anim-accepted-pulse">✓ 202 Accepted</div>
  </div>
  <div v-click="4" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <line x1="390" y1="55" x2="465" y2="55" class="svg-line svg-stroke-cyan"/>
      <circle class="svg-dot svg-fill-cyan anim-s4" cx="390" cy="55" r="4"/>
      <circle class="svg-dot svg-fill-cyan anim-s4-d" cx="390" cy="55" r="4"/>
    </svg>
  </div>
  <div v-click="5" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <path d="M553,55 L573,55 Q580,55 580,48 L580,30 Q580,23 587,23 L630,23" class="svg-line svg-stroke-fuchsia"/>
      <path d="M553,55 L573,55 Q580,55 580,62 L580,80 Q580,87 587,87 L630,87" class="svg-line svg-stroke-fuchsia"/>
      <circle class="svg-dot svg-fill-fuchsia anim-lb-up1" cx="553" cy="55" r="4"/>
      <circle class="svg-dot svg-fill-fuchsia anim-lb-down1" cx="553" cy="55" r="4"/>
      <circle class="svg-dot svg-fill-fuchsia anim-lb-up2" cx="553" cy="55" r="4"/>
      <circle class="svg-dot svg-fill-fuchsia anim-lb-down2" cx="553" cy="55" r="4"/>
    </svg>
  </div>
  
  <div v-click="6" class="anim-badge right-125px bottom-0px bg-cyan-500/12 border-1 border-solid border-cyan-500/35 text-cyan-400 anim-retry-pulse"><span class="i-ph-arrow-counter-clockwise-fill inline-block text-xs"></span> retry</div>
</div>

<div class="flex flex-col gap-2 max-w-750px mx-auto">
<div v-click="1" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-blue-500 text-blue-300">
  <div class="w-24px h-24px rounded-full bg-blue-500/20 flex items-center justify-center font-700  shrink-0">1</div>
  <div>Sistema externo envia os dados para o Kong/APISIX</div>
</div>
<div v-click="2" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-violet-500 text-violet-300">
  <div class="w-24px h-24px rounded-full bg-violet-500/20 text-purple-300 flex items-center justify-center font-700  shrink-0">2</div>
  <div>Kong autentica e coloca a mensagem na fila (NATS JetStream)</div>
</div>
<div v-click="3" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-cyan-500 text-cyan-300 font-600">
  <div class="w-24px h-24px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700  shrink-0">3</div>
  <div>Sistema origem recebe "Recebido!" (202 Accepted) e <strong>segue em frente</strong></div>
</div>
<div v-click="4" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-fuchsia-500 text-fuchsia-300">
  <div class="w-24px h-24px rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-700  shrink-0">4</div>
  <div>Worker pega da fila e traduz campos (DE-PARA: SG1 → ListaMateriaisProduto)</div>
</div>
<div v-click="5" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-fuchsia-500 text-fuchsia-300">
  <div class="w-24px h-24px rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-700  shrink-0">5</div>
  <div>Load Balancer escolhe a melhor instância do EME4 (menos ocupada)</div>
</div>
<div v-click="6" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-24px h-24px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700  shrink-0">6</div>
  <div>Se der erro → retry automático com backoff exponencial</div>
</div>
</div>

<!--
Descobri como fazer o modo apresentação
-->

---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 6 — COMO FUNCIONARIA COM O MIDDLEWARE
     ═══════════════════════════════════════════════════════════ -->

<div class="s6-slide">

<!-- Título -->
<div class="text-center" v-motion :initial="{opacity:0, y:-15}" :enter="{opacity:1, y:0, transition:{delay:100}}">
  <div class="text-[20px] font-bold text-white">Como funcionaria com o MIDDLEWARE</div>
  <div class="text-[12px] text-gray-400 mt-1">Dois modos: o Worker só existe quando há trabalho a fazer</div>
</div>

<!-- Dois painéis -->
<div class="s6-panels">

  <!-- MODO 1 -->
  
  <div class="s6-panel s6-panel-cyan" v-motion :initial="{opacity:0, x:-30}" :enter="{opacity:1, x:0, transition:{delay:300}}">
    <div class="s6-panel-title text-cyan-300">MODO 1: PASSAGEM DIRETA (sem Worker)</div>
    <div class="s6-diagram">
      <div class="s6-node s6-node-pink">
        <span class="i-carbon-bot text-lg inline-block"></span>
        <div class="">Agente IA</div>
        <span class="s6-node-sub">(futuro)</span>
      </div>
      <svg class="s6-arrow" viewBox="0 0 40 10"><line x1="0" y1="5" x2="40" y2="5" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/></svg>
      <div class="s6-node s6-node-teal">KONG/APISIX<span class="s6-node-sub">Auth + LB</span><span class="s6-node-sub">Direto, sem fila</span></div>
      <div class="s6-srv-group">
        <svg class="s6-arrow-fork" viewBox="0 0 40 50"><line x1="0" y1="25" x2="40" y2="8" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/><line x1="0" y1="25" x2="40" y2="42" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/></svg>
        <div class="s6-srv"><span>EME4 Srv 1</span><span class="i-svg-spinners-pulse-3 text-cyan-400 text-[7px] inline-block"></span></div>
        <div class="s6-srv"><span>EME4 Srv 2</span><span class="i-svg-spinners-pulse-3 text-cyan-400 text-[7px] inline-block"></span></div>
      </div>
    </div>
    <div class="s6-desc">
      <div>Sem fila. Sem tradutor. Rápido e direto.</div>
      <div>Quando os sistemas falam a mesma língua.</div>
      <div>Ganha: Auth, LB, Failover, Logging, Rate Limit</div>
      <div class="italic text-cyan-400/60 mt-1">Ex: IA consulta status de OP, Dashboard busca dados</div>
    </div>
  </div>
  

  <!-- MODO 2 -->
  <v-click>
  <div class="s6-panel s6-panel-purple" v-motion :initial="{opacity:0, x:30}" :enter="{opacity:1, x:0, transition:{delay:500}}">
    <div class="s6-panel-title text-purple-300">MODO 2: COM WORKER (quando há trabalho)</div>
    <div class="s6-diagram">
      <div class="s6-node s6-node-blue">Protheus<span class="s6-node-sub">ERP</span></div>
      <svg class="s6-arrow" viewBox="0 0 24 10"><line x1="0" y1="5" x2="24" y2="5" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/></svg>
      <div class="s6-node s6-node-teal-sm">KONG<span class="s6-node-sub">Auth</span></div>
      <svg class="s6-arrow" viewBox="0 0 24 10"><line x1="0" y1="5" x2="24" y2="5" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/></svg>
      <div class="s6-node s6-node-teal-sm">NATS<span class="s6-node-sub">Fila</span></div>
      <svg class="s6-arrow" viewBox="0 0 24 10"><line x1="0" y1="5" x2="24" y2="5" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/></svg>
      <div class="s6-node s6-node-fuchsia">Worker<span class="s6-node-sub">Traduz</span><span class="s6-node-sub">DE-PARA</span></div>
      <div class="s6-srv-group">
        <svg class="s6-arrow-fork" viewBox="0 0 30 50"><line x1="0" y1="25" x2="30" y2="8" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/><line x1="0" y1="25" x2="30" y2="42" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4,3" class="ve-line-in"/></svg>
        <div class="s6-srv s6-srv-sm"><span>EME4 Srv 1</span><span class="i-svg-spinners-pulse-3 text-cyan-400 text-[7px] inline-block"></span></div>
        <div class="s6-srv s6-srv-sm"><span>EME4  Srv 2</span><span class="i-svg-spinners-pulse-3 text-cyan-400 text-[7px] inline-block"></span></div>
      </div>
    </div>
    <div class="s6-desc">
      <div>Com fila + tradução + retry automático.</div>
      <div>Quando os sistemas falam línguas diferentes.</div>
      <div>Ganha: Tudo do Modo 1 + Tradução + Garantia</div>
      <div class="italic text-purple-400/60 mt-1">Ex: Protheus envia OP, Engenharia, Apontamentos</div>
    </div>
  </div>
  </v-click>

</div>

<!-- Mensagem central -->
<v-click>
<div class="s6-message" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:800}}">
  <div class="font-bold text-white text-[13px]">Worker só existe quando há trabalho real a fazer.</div>
  <div class="text-gray-400 text-[11px]">Sem tradução necessária = passagem direta. Mais rápido, menos componentes.</div>
</div>
</v-click>

<!-- Features -->
<v-click>
<div class="s6-features" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:1000}}">
  <div class="s6-feat"><div class="s6-feat-icon"><span class="i-ph-lightning-fill inline-block text-cyan-400"></span></div><div class="s6-feat-title">Load Balancing</div><div class="s6-feat-sub">Distribui carga</div></div>
  <div class="s6-feat"><div class="s6-feat-icon"><span class="i-ph-shield-check-fill inline-block text-purple-400"></span></div><div class="s6-feat-title">Failover</div><div class="s6-feat-sub">Servidor cai, outro assume</div></div>
  <div class="s6-feat"><div class="s6-feat-icon"><span class="i-ph-lock-key-fill inline-block text-blue-400"></span></div><div class="s6-feat-title">Auth Centralizada</div><div class="s6-feat-sub">Uma porta de entrada</div></div>
  <div class="s6-feat"><div class="s6-feat-icon"><span class="i-ph-chart-line-up-fill inline-block text-cyan-400"></span></div><div class="s6-feat-title">Rastreabilidade</div><div class="s6-feat-sub">Tudo registrado</div></div>
  <div class="s6-feat"><div class="s6-feat-icon"><span class="i-ph-heartbeat-fill inline-block text-fuchsia-400"></span></div><div class="s6-feat-title">Resiliência</div><div class="s6-feat-sub">Nenhum dado se perde</div></div>
</div>
</v-click>

</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 7 — COMPARAÇÃO CENÁRIO A CENÁRIO
     ═══════════════════════════════════════════════════════════ -->

# Comparação: Cenário a Cenário

<div class="grid grid-cols-2 gap-6 mt-4">

<div v-click class="comp-panel comp-panel-pink">
<div class="comp-title text-pink-400">Modelo Atual (Direto)</div>

<v-clicks>

- ✗ EME4 fora do ar → **erro e perda de dados**
- ✗ 500 OPs → uma por uma, **lento**
- ✗ Formato mudou → altera **ambos** os sistemas
- ✗ Servidor caiu → **tudo para**
- ✗ Sem rastreabilidade
- ✗ Sem distribuição de carga

</v-clicks>

</div>

<div v-click="1" class="comp-panel comp-panel-cyan">
<div class="comp-title text-cyan-400">Modelo Novo (Middleware)</div>

<v-clicks at="2">

- ✓ EME4 fora → fila guarda, **entrega depois**
- ✓ 500 OPs → todas na fila, **paralelo**
- ✓ Formato mudou → só altera o **Tradutor**
- ✓ Servidor caiu → **failover automático**
- ✓ Rastreabilidade total
- ✓ Load Balancing entre servidores

</v-clicks>

</div>
</div>

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good text-cyan-300">
  Nenhum dado se perde. Se um cai, o outro continua. Cada sistema evolui independentemente.
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 8 — Visão Estratégica
     ═══════════════════════════════════════════════════════════ -->

<div class="ve-slide">

<!-- Título -->
<div class="ve-title" v-motion :initial="{opacity:0, y:-20}" :enter="{opacity:1, y:0, transition:{delay:100}}">
  <div class="text-[22px] font-bold text-white">Visão Estratégica: O Middleware como base para IA</div>
  <div class="text-[13px] text-gray-400 mt-1">Não é exagero. É o primeiro passo de algo muito maior.</div>
</div>

<!-- Timeline -->
<div class="ve-timeline" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:300}}">
  <div class="ve-tl-line"></div>
  <div class="ve-tl-phases">
    <div class="ve-phase">
      <div class="ve-phase-label text-blue-400">POC (agora)</div>
      <div class="ve-dot ve-dot-blue">1</div>
    </div>
    <div class="ve-phase">
      <div class="ve-phase-label text-purple-400">Fase 2</div>
      <div class="ve-dot ve-dot-purple">2</div>
    </div>
    <div class="ve-phase">
      <div class="ve-phase-label text-cyan-400">Fase 3 (IA)</div>
      <div class="ve-dot ve-dot-cyan">3</div>
    </div>
  </div>
</div>

<!-- Cards das fases -->
<div class="ve-phase-cards">
  <div class="ve-pcard ve-pcard-blue" v-motion :initial="{opacity:0, y:15}" :enter="{opacity:1, y:0, transition:{delay:500}}">
    <div class="text-gray-300 text-[11px]">Protheus ↔ EME4</div>
    <div class="text-gray-500 text-[10px]">Engenharia + OPs</div>
    <div class="text-blue-400 font-semibold text-[12px] mt-1">Centenas/dia</div>
  </div>
  <div class="ve-pcard ve-pcard-purple" v-motion :initial="{opacity:0, y:15}" :enter="{opacity:1, y:0, transition:{delay:650}}">
    <div class="text-gray-300 text-[11px]">+ Outros módulos EME4</div>
    <div class="text-gray-500 text-[10px]">+ Sistemas Datainfo</div>
    <div class="text-purple-400 font-semibold text-[12px] mt-1">Milhares/dia</div>
  </div>
  <div class="ve-pcard ve-pcard-green" v-motion :initial="{opacity:0, y:15}" :enter="{opacity:1, y:0, transition:{delay:800}}">
    <div class="text-gray-300 text-[11px]">+ Agentes de IA</div>
    <div class="text-gray-500 text-[10px]">consultando e atuando em todos os sistemas</div>
    <div class="text-cyan-400 font-semibold text-[12px] mt-1">Dezenas de milhares/dia</div>
  </div>
</div>

<!-- Futuro título -->
<div class="text-center mt-4 mb-2" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:1000}}">
  <div class="text-white font-semibold text-[15px]">Futuro: Uma porta única para todos os sistemas</div>
</div>

<!-- Arquitetura: esquerda + centro + direita -->
<div class="ve-arch" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:1200}}">
  <!-- Produtores (esquerda) -->
  <div class="ve-col-left">
    <div class="ve-box ve-box-blue">Agentes IA</div>
    <div class="ve-box ve-box-blue">Protheus</div>
    <div class="ve-box ve-box-blue">App Mobile</div>
    <div class="ve-box ve-box-blue">Dashboard</div>
  </div>

  <!-- Linhas esquerda + Middleware + Linhas direita (SVG estático para linhas) -->
  <div class="ve-center">
    <svg class="ve-lines" viewBox="0 -30 500 260" preserveAspectRatio="none">
      <!-- Linhas esquerda → centro (fluxo para direita) -->
      <line x1="0" y1="25"  x2="140" y2="70"  class="ve-line-in" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <line x1="0" y1="75"  x2="140" y2="85"  class="ve-line-in" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <line x1="0" y1="125" x2="140" y2="100" class="ve-line-out" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <line x1="0" y1="175" x2="140" y2="115" class="ve-line-in" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <!-- Linhas centro → direita (fluxo para direita) -->
      <line x1="360" y1="70"  x2="500" y2="25"  class="ve-line-in" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <line x1="360" y1="85"  x2="500" y2="75"  class="ve-line-out" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <line x1="360" y1="100" x2="500" y2="125" class="ve-line-out" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
      <line x1="360" y1="115" x2="500" y2="175" class="ve-line-in" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.5"/>
    </svg>
    <div class="ve-middleware">
      <div class="text-white font-bold text-[15px]">MIDDLEWARE</div>
      <div class="text-purple-400 text-[11px]">Kong/APISIX + NATS</div>
      <div class="text-gray-400 text-[10px] mt-1">Auth | LB | Fila | Tradução</div>
      <div class="text-gray-500 text-[9px]">Worker quando precisa | Direto quando não</div>
    </div>
  </div>

  <!-- Consumidores (direita) -->
  <div class="ve-col-right">
    <div class="ve-box ve-box-cyan">EME4</div>
    <div class="ve-box ve-box-cyan">Gesti</div>
    <div class="ve-box ve-box-cyan">Sistema X</div>
    <div class="ve-box ve-box-cyan">Sistema Y</div>
  </div>
</div>

<!-- Mensagem final -->
<div class="ve-bottom" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:1500}}">
  A POC é o piloto. O Middleware é a pista de decolagem para a IA.
</div>

</div>

---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 9 — ANALOGIA: O RESTAURANTE
     ═══════════════════════════════════════════════════════════ -->

# Analogia: O Restaurante

<div class="grid grid-cols-2 gap-8 mt-4">

<div v-click class="info-card info-card-pink" style="padding:20px;">
<div class="card-header text-pink-400" style="font-size:1.05em;">Modelo Atual</div>
<div class="card-body" style="font-size:0.82em; line-height:1.7;">

<v-clicks>

<div>O cliente <span class="text-blue-400">(sistema externo)</span> vai até a cozinha <span class="text-cyan-400">(EME4)</span> e faz o pedido diretamente ao <strong>único</strong> cozinheiro.</div>

<div>Fica <strong>parado na cozinha esperando</strong> o prato ficar pronto.</div>

<div>Cozinheiro no banheiro? <span class="text-pink-400">Espera.</span></div>

<div>Cozinha pegou fogo? <span class="text-pink-400">Perde o pedido.</span></div>

<div>50 clientes? Todos na fila do <strong>mesmo</strong> cozinheiro.</div>

</v-clicks>

</div>
</div>

<div v-click="1" class="info-card info-card-cyan" style="padding:20px;">
<div class="card-header text-cyan-400" style="font-size:1.05em;">Modelo Novo</div>
<div class="card-body" style="font-size:0.82em; line-height:1.7;">

<v-clicks at="6">

<div><strong class="text-fuchsia-300">Modo 2:</strong> Cliente faz pedido ao <span class="text-purple-400">garçom (Kong)</span>, que anota na <span class="text-cyan-400">comanda (NATS)</span>. Volta para a mesa.</div>

<div>O <span class="text-fuchsia-400">expedidor (Worker)</span> traduz o pedido e escolhe o cozinheiro menos ocupado <span class="text-gray-400">(Load Balancing)</span>.</div>

<div>Cozinheiro passou mal? Os pedidos vão para os outros <span class="text-gray-400">(Failover)</span>.</div>

<div><strong class="text-cyan-300">Modo 1:</strong> Cliente que fala a língua da cozinha vai ao <span class="text-purple-400">maître</span> → encaminha direto. Sem garçom no meio.</div>

</v-clicks>

</div>
</div>
</div>

---
transition: slide-up
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 10 — TECNOLOGIAS (COM MÉTRICAS CLARAS)
     ═══════════════════════════════════════════════════════════ -->

# Por que confiamos nessas tecnologias?

<div v-click class="stats-row">
  <div class="stat-card stat-glow-cyan">
    <div class="stat-value text-cyan-400">25 milhões</div>
    <div class="stat-label">mensagens processadas<br><strong>por segundo</strong> (NATS)</div>
  </div>
  <div class="stat-card stat-glow-blue">
    <div class="stat-value text-blue-400">18 mil</div>
    <div class="stat-label">requisições HTTP<br><strong>por segundo</strong> (Kong/APISIX)</div>
  </div>
  <div class="stat-card stat-glow-cyan">
    <div class="stat-value text-cyan-400">18 MB</div>
    <div class="stat-label">de memória RAM<br>para rodar o <strong>NATS</strong></div>
  </div>
  <div class="stat-card stat-glow-purple">
    <div class="stat-value text-purple-400">0,2 ms</div>
    <div class="stat-label">latência por mensagem<br><strong>quase instantâneo</strong></div>
  </div>
</div>

<div v-click class="grid grid-cols-3 gap-4 mt-4">
  <div class="info-card border-cyan-500/20 p-14px">
    <div class="card-header text-cyan-400">NATS</div>
    <div class="card-body" style="font-size:0.78em;">
      <div>→ Escrito em Go (Google)</div>
      <div>→ Tesla, Mastercard, Walmart</div>
      <div>→ CNCF (fundação do Kubernetes)</div>
      <div>→ Um executável de 20 MB, sem dependências</div>
    </div>
  </div>
  <div class="info-card border-violet-500/20 p-14px">
    <div class="card-header text-purple-400">Kong / APISIX</div>
    <div class="card-body" style="font-size:0.78em;">
      <div>→ Construído sobre <strong>NGINX</strong></div>
      <div>→ NGINX serve 30% da internet mundial</div>
      <div>→ Netflix, Samsung, NASA usam</div>
      <div>→ LB + Auth + Failover + Logs inclusos</div>
    </div>
  </div>
  <div class="info-card border-cyan-500/20 p-14px">
    <div class="card-header text-cyan-400">Infraestrutura Total</div>
    <div class="card-body" style="font-size:0.78em;">
      <div>→ <strong>280 MB</strong> RAM total (menos que o Chrome)</div>
      <div>→ Menos de 7% de CPU</div>
      <div>→ ~1 GB de disco</div>
      <div>→ Cabe em qualquer VM ou container</div>
    </div>
  </div>
</div>

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good">
  <span class="text-cyan-300">Nosso volume atual é de ~500 mensagens <strong>por dia</strong>.</span>
  <span class="opacity-50"> O NATS processa 25 milhões <strong>por segundo</strong>. É como ter um foguete para ir à padaria.</span>
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 11 — NATS PUB/SUB ANIMAÇÃO
     ═══════════════════════════════════════════════════════════ -->

# NATS — Publish / Subscribe

<div class="accent-bar accent-bar-cyan">
  Como o NATS distribui mensagens — o motor por trás do Middleware
</div>

<div class="nats-pubsub" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <div class="nats-subject"><span class="i-ph-broadcast-fill inline-block mr-1"></span> subject: eme4.op.criar</div>
  <div class="nats-node nats-pub">
    <span class="i-ph-plugs-connected-fill text-lg inline-block"></span>
    <div>Protheus</div>
    <span class="nats-node-sub-text">Publisher</span>
  </div>
  <div class="nats-node nats-server">
    <div class="nats-server-glow"></div>
    <span class="i-ph-cloud-arrow-up-fill text-xl inline-block"></span>
    <div>NATS</div>
    <span class="nats-node-sub-text">JetStream</span>
  </div>
  <div class="nats-node nats-sub nats-sub-1">
    <span class="i-ph-gear-six-fill text-base inline-block"></span>
    <div>Worker 1</div>
    <span class="nats-node-sub-text">Subscriber</span>
  </div>
  <div class="nats-node nats-sub nats-sub-2 nats-sub-cyan">
    <span class="i-ph-gear-six-fill text-base inline-block"></span>
    <div>Worker 2</div>
    <span class="nats-node-sub-text">Subscriber</span>
  </div>
  <div class="nats-node nats-sub nats-sub-3 nats-sub-cyan">
    <span class="i-carbon-dashboard text-base inline-block"></span>
    <div>Monitor</div>
    <span class="nats-node-sub-text">Subscriber</span>
  </div>
  <svg class="nats-svg" viewBox="0 0 820 340" preserveAspectRatio="xMidYMid meet">
    <line x1="122" y1="170" x2="330" y2="170" class="nats-path nats-path-pub"/>
    <line x1="490" y1="170" x2="690" y2="42" class="nats-path nats-path-sub1"/>
    <line x1="490" y1="170" x2="690" y2="170" class="nats-path nats-path-sub2"/>
    <line x1="490" y1="170" x2="690" y2="298" class="nats-path nats-path-sub3"/>
    <circle class="nats-dot nats-dot-blue nats-dot-pub" cx="122" cy="170" r="5"/>
    <circle class="nats-dot nats-dot-blue nats-dot-pub-2" cx="122" cy="170" r="4"/>
    <circle class="nats-dot nats-dot-blue nats-dot-pub-3" cx="122" cy="170" r="4"/>
    <circle class="nats-dot nats-dot-fuchsia nats-dot-s1" cx="490" cy="170" r="4"/>
    <circle class="nats-dot nats-dot-cyan nats-dot-s2" cx="490" cy="170" r="4"/>
    <circle class="nats-dot nats-dot-cyan nats-dot-s3" cx="490" cy="170" r="4"/>
  </svg>
</div>

<v-click>
<div class="nats-callout">
  <div class="nats-callout-item">
    <div class="nats-callout-value text-blue-400">1 publish</div>
    <div class="nats-callout-label">Protheus envia uma vez</div>
  </div>
  <div class="nats-callout-item">
    <div class="nats-callout-value text-cyan-400">N subscribers</div>
    <div class="nats-callout-label">Todos recebem em paralelo</div>
  </div>
  <div class="nats-callout-item">
    <div class="nats-callout-value text-fuchsia-400">0,2 ms</div>
    <div class="nats-callout-label">Latência por mensagem</div>
  </div>
  <div class="nats-callout-item">
    <div class="nats-callout-value text-purple-400">Garantido</div>
    <div class="nats-callout-label">JetStream persiste na fila</div>
  </div>
</div>
</v-click>

<v-click>
<div class="mt-3 p-3 rounded-xl text-center text-sm result-good">
  <span class="text-cyan-300 font-semibold">O sistema origem publica uma vez.</span>
  <span class="opacity-60"> O NATS entrega para todos os interessados — Workers, Monitores, Logs — sem o Publisher saber quem está ouvindo.</span>
</div>
</v-click>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 12 — MODO 1: PASSAGEM DIRETA (IA)
     ═══════════════════════════════════════════════════════════ -->

# Modo 1: Passagem Direta

<div class="accent-bar accent-bar-cyan">
  Sem tradutor, sem fila — quando quem pede já fala a língua do destino
</div>

<div v-click class="pipeline my-6 gap-3">
  <div class="pipe-node pipe-pink px-18px py-12px">
    <span class="i-carbon-bot text-xl mb-1 inline-block"></span>
    <div class="font-bold text-sm">Agente IA</div>
    <span class="pipe-sub">(futuro)</span>
  </div>
  <div class="pipe-arrow text-cyan-500 text-xl animate-pulse">━►</div>
  <div class="pipe-node pipe-purple px-18px py-12px shadow-[0_0_20px_rgba(139,92,246,0.15)]">
    <span class="i-ph-door-open-fill text-xl mb-1 inline-block"></span>
    <div class="font-bold text-sm">KONG/APISIX</div>
    <span class="pipe-sub">portaria + LB</span>
  </div>
  <div class="pipe-arrow text-cyan-500 text-xl animate-pulse">━►</div>
  <div class="pipe-group">
    <div class="pipe-node pipe-cyan pipe-sm">EME4 Srv 1</div>
    <div class="pipe-node pipe-cyan pipe-sm">EME4 Srv 2</div>
  </div>
</div>

<div class="flex flex-col gap-2 max-w-650px mx-auto">
<v-clicks>

<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-violet-500 text-violet-300">
  <div class="w-28px h-28px rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">1</div>
  <div>Sistema faz requisição HTTP ao Middleware (Kong/APISIX)</div>
</div>
<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-violet-500 text-violet-300">
  <div class="w-28px h-28px rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">2</div>
  <div>Kong autentica, escolhe o servidor EME4 menos ocupado (LB)</div>
</div>
<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-cyan-500 text-cyan-300 font-600">
  <div class="w-28px h-28px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">3</div>
  <div>EME4 responde → Kong devolve → <strong>Pronto.</strong> Sem fila, sem espera.</div>
</div>

</v-clicks>
</div>

<div v-click class="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
  <div class="benefit-pill"><span class="i-ph-lightning-fill inline-block mr-1"></span>Load Balance</div>
  <div class="benefit-pill"><span class="i-ph-shield-check-fill inline-block mr-1"></span>Failover</div>
  <div class="benefit-pill"><span class="i-ph-lock-key-fill inline-block mr-1"></span>Auth Central</div>
  <div class="benefit-pill"><span class="i-ph-gauge-fill inline-block mr-1"></span>Rate Limit</div>
  <div class="benefit-pill"><span class="i-ph-list-magnifying-glass-fill inline-block mr-1"></span>Logging</div>
</div>


---
transition: slide-up
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 13 — VISÃO ESTRATÉGICA IA
     ═══════════════════════════════════════════════════════════ -->

# Visão Estratégica: Pista de Decolagem para IA

<div class="accent-bar accent-bar-pink">
  A POC de hoje é o piloto. O Middleware é a pista de decolagem.
</div>

<div v-click class="pipeline my-5 gap-3">
  <div class="pipe-node pipe-pink" style="padding:10px 16px;">
    <span class="i-carbon-bot text-lg inline-block"></span>
    <div class="font-bold text-sm">Agente IA</div>
  </div>
  <div class="pipe-arrow text-purple-400 text-xl animate-pulse">━►</div>
  <div class="pipe-node pipe-purple px-20px py-14px shadow-[0_0_20px_rgba(139,92,246,0.15)]">
    <div class="font-bold">MIDDLEWARE</div>
    <span class="pipe-sub">Kong + NATS</span>
  </div>
  <div class="pipe-arrow text-purple-400 text-xl animate-pulse">━►</div>
  <div class="pipe-group">
    <div class="pipe-node pipe-cyan pipe-sm">EME4</div>
    <div class="pipe-node pipe-blue pipe-sm">ERP</div>
    <div class="pipe-node pipe-gray pipe-sm">Sistema X</div>
    <div class="pipe-node pipe-gray pipe-sm">Sistema Y</div>
  </div>
</div>

<div v-click class="timeline-row">
  <div class="timeline-line"></div>
  <div class="tl-item">
    <div class="tl-dot bg-blue-500">1</div>
    <div class="tl-title">POC</div>
    <div class="tl-desc">ERP ↔ EME4<br>1 cadastro + 1 fluxo OP</div>
  </div>
  <div class="tl-item">
    <div class="tl-dot bg-cyan-500">2</div>
    <div class="tl-title">Expansão</div>
    <div class="tl-desc">Mais integrações<br>Dashboard monitoramento</div>
  </div>
  <div class="tl-item">
    <div class="tl-dot bg-violet-500">3</div>
    <div class="tl-title">IA</div>
    <div class="tl-desc">Agentes IA consumindo<br>APIs via Middleware</div>
  </div>
</div>

<div v-click class="info-card info-card-pink mx-auto mt-4" style="max-width:650px; padding:14px 20px;">
  <div class="card-header text-pink-300 text-0.9em">Por que IA precisa de Middleware?</div>
  <div class="card-body" style="font-size:0.78em;">
    <div>→ Agente fala com <strong>uma porta única</strong> em vez de conhecer cada sistema</div>
    <div>→ Sem precisar saber a autenticação de cada sistema (sessão, token, API key...)</div>
    <div>→ Alto volume: centenas de consultas por minuto para montar análises completas</div>
  </div>
</div>


---
layout: center
transition: fade
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 14 — RECOMENDAÇÃO
     ═══════════════════════════════════════════════════════════ -->

# Recomendação

<div class="gradient-subtitle" style="font-size:0.95em;">Aprovação da POC do Middleware com escopo reduzido</div>

<div class="gradient-divider mx-auto mt-3 mb-6" style="width:150px;"></div>

<div v-click class="grid grid-cols-3 gap-5 max-w-3xl">
  <div class="rec-card rec-card-cyan">
    <div class="rec-icon"><span class="i-ph-crosshair-fill inline-block text-cyan-400"></span></div>
    <div class="rec-title text-cyan-400">Escopo da POC</div>
    <div class="rec-desc">1 cadastro de engenharia<br>(Centro de Trabalho)<br>+ 1 fluxo de OP<br>(criar + apontar)</div>
  </div>
  <div class="rec-card rec-card-blue">
    <div class="rec-icon"><span class="i-ph-shield-check-fill inline-block text-blue-400"></span></div>
    <div class="rec-title text-blue-400">Risco</div>
    <div class="rec-desc">Baixo — a POC<br>não afeta os sistemas<br>atuais em produção</div>
  </div>
  <div class="rec-card rec-card-purple">
    <div class="rec-icon"><span class="i-ph-lightning-fill inline-block text-purple-400"></span></div>
    <div class="rec-title text-purple-400">Infraestrutura</div>
    <div class="rec-desc">~280 MB RAM<br>em qualquer servidor<br>NATS + Kong gratuitos</div>
  </div>
</div>

<div v-click class="mt-6 p-5 rounded-xl text-center result-good max-w-2xl mx-auto" style="border-width: 1.5px;">
  <div class="text-cyan-400 font-semibold mb-1">Resultado Esperado</div>
  <div class="text-sm opacity-80">Demonstrar que o Middleware funciona, medir performance real, e ter base concreta para decisão de expansão rumo à IA.</div>
</div>

<div v-click class="mt-6 text-center opacity-50 italic text-sm max-w-lg mx-auto">
  "A POC é um investimento pequeno para uma decisão informada.<br>
  Melhor testar antes de comprometer do que comprometer antes de testar."
</div>
