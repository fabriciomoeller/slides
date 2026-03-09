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
    POC — Prova de Conceito para infraestrutura de Middleware — Ex: ERP Externo, IA, Dashboards
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

<div class="anim-flow max-w-700px h-100px my-10" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
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

<div class="grid grid-cols-2 gap-6 mt-2" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:2000}}">
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
transition: slide-top
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 3 — FLUXO PASSO A PASSO (HOJE)
     ═══════════════════════════════════════════════════════════ -->

# O fluxo passo a passo (Hoje)

<div class="accent-bar accent-bar-pink">
  O sistema externo fica bloqueado até o EME4 responder
</div>

<div class="flex flex-col gap-2 max-w-700px mx-auto my-10">


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


</div>

<div class="mt-6 p-4 rounded-xl text-center text-sm result-bad" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:800}}">
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
    <div class="mode-number bg-cyan-500/15 text-cyan-400"><span class="i-ph-arrow-right-bold inline-block text-[1.2em]"></span></div>
    <div class="mode-title text-cyan-300">Passagem Direta</div>
    <div class="mode-desc">Sem tradutor. Sem fila.<br>Direto e rápido.</div>
    <div class="mode-use">IA, Dashboards, Consultas</div>
  </div>
  <div class="mode-card mode-card-fuchsia">
    <div class="mode-number"><span class="i-ph-arrows-clockwise-bold inline-block text-[1.2em]"></span></div>
    <div class="mode-title text-fuchsia-300">Com Tradutor</div>
    <div class="mode-desc">Fila NATS + Worker<br>Tradução DE-PARA + Garantia de entrega</div>
    <div class="mode-use">Ex: ERP → EME4 (com tradução)</div>
  </div>
</div>

<div class="s6-message mt-8 text-sm opacity-50 text-center" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:800}}">
  Worker só existe quando há trabalho real a fazer como a tradução DE-PARA.
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 5 — MODO 2: COM TRADUTOR (WORKER)
     ═══════════════════════════════════════════════════════════ -->

# <span class="i-ph-arrows-clockwise-bold inline-block text-fuchsia-400 align-middle"></span> Com Tradutor (Worker)

<div class="accent-bar accent-bar-fuchsia">
  Quando há trabalho real — tradução, orquestração, garantia de entrega
</div>

<div class="anim-flow max-w-750px h-120px my-4" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <FlowNode label="ORIGEM" icon="i-ph-plugs-connected-fill" color="blue" position="top-50% -translate-y-50% left-0 w-88px h-52px" sub="ex: ERP" />
  <FlowNode label="KONG" icon="i-ph-shield-check-fill" color="violet" position="top-50% -translate-y-50% left-160px w-78px h-52px" sub="portaria" />
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="top-50% -translate-y-50% left-310px w-78px h-52px" sub="fila" />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="top-50% -translate-y-50% left-465px w-88px h-52px" sub="tradutor" />
  <FlowNode label="EME4 1" color="cyan" position="top-4px left-630px w-88px h-38px" size="top" />
  <FlowNode label="EME4 2" color="cyan" position="bottom-4px left-630px w-88px h-38px" size="top" />
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <line x1="90" y1="55" x2="160" y2="55" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M90,55 L160,55" color="blue" :duration="1.2" />
      <FlowDot d="M90,55 L160,55" color="blue" :duration="1.2" :delay="0.6" />
    </svg>
  </div>
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <line x1="240" y1="55" x2="310" y2="55" class="svg-line svg-stroke-purple"/>
      <FlowDot d="M240,55 L310,55" color="purple" :duration="1.2" />
      <FlowDot d="M240,55 L310,55" color="purple" :duration="1.2" :delay="0.6" />
    </svg>
  </div>
  <div v-click="3" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <path d="M199,81 L199,88 Q199,96 191,96 L51,96 Q44,96 44,88 L44,81" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M199,81 L199,96 L44,96 L44,81" color="cyan" :duration="1.2" />
    </svg>
    <FlowBadge text="✓ 202 Accepted" color="cyan" position="left-75px bottom-20px" />
  </div>
  <div v-click="4" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <line x1="390" y1="55" x2="465" y2="55" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M390,55 L465,55" color="cyan" :duration="3.5" />
      <FlowDot d="M390,55 L465,55" color="cyan" :duration="3.5" :delay="0.6" />
    </svg>
  </div>
  <div v-click="5" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 750 110">
      <path d="M553,55 L573,55 Q580,55 580,48 L580,30 Q580,23 587,23 L630,23" class="svg-line svg-stroke-fuchsia"/>
      <path d="M553,55 L573,55 Q580,55 580,62 L580,80 Q580,87 587,87 L630,87" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M553,55 L573,55 Q580,55 580,48 L580,30 Q580,23 587,23 L630,23" color="fuchsia" :duration="5" />
      <FlowDot d="M553,55 L573,55 Q580,55 580,62 L580,80 Q580,87 587,87 L630,87" color="fuchsia" :duration="5" :delay="1.25" />
      <FlowDot d="M553,55 L573,55 Q580,55 580,48 L580,30 Q580,23 587,23 L630,23" color="fuchsia" :duration="5" :delay="2.5" />
      <FlowDot d="M553,55 L573,55 Q580,55 580,62 L580,80 Q580,87 587,87 L630,87" color="fuchsia" :duration="5" :delay="3.75" />
    </svg>
  </div>
  <div v-click="6" class="anim-seg">
    <FlowNode label="EME4 1" color="pink" position="top-4px left-630px w-88px h-38px z-5" size="top" />
    <svg class="anim-svg" viewBox="0 0 750 90">
      <path d="M630,3 Q630,4 616,4 L524,4 Q510,4 510,18" class="svg-line-return svg-stroke-pink"/>
      <FlowDot d="M630,18 L630,4 L510,4 L510,18" color="pink" :duration="2" />
      <path d="M509,70 Q509,85 495,85 L364,85 Q350,85 350,70" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M509,70 L509,85 L350,85 L350,70" color="cyan" :duration="2" :delay="2" />
    </svg>
    <FlowBadge text="✕ erro/timeout" color="pink" position="right-140px top-0px" />
    <FlowBadge text="Nak → refila" icon="i-ph-arrow-counter-clockwise-fill" color="cyan" position="left-380px bottom-20px" />
  </div>
</div>

<div class="flex flex-col gap-2 max-w-750px mx-auto">
<div v-click="1" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-blue-500 text-blue-300">
  <div class="w-24px h-24px rounded-full bg-blue-500/20 flex items-center justify-center font-700  shrink-0">1</div>
  <div>Sistema externo envia os dados para o APIGATEWAY Kong/APISIX</div>
</div>
<div v-click="2" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-violet-500 text-violet-300">
  <div class="w-24px h-24px rounded-full bg-violet-500/20 text-purple-300 flex items-center justify-center font-700  shrink-0">2</div>
  <div>Kong/APISIX autentica e coloca a mensagem na fila (NATS JetStream)</div>
</div>
<div v-click="3" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.60em] bg-slate-800/40 border-l-cyan-500 text-cyan-300 font-600">
  <div class="w-24px h-24px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700  shrink-0">3</div>
  Sistema origem recebe "Recebido!" (202 Accepted) e segue em frente.<br> Desacoplamento total para enviar outras mensagens
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
  <div>Se der erro → Worker devolve à fila (<strong>Nak</strong>) → NATS retenta com backoff exponencial</div>
</div>
</div>

<!--
Descobri como fazer o modo apresentação
-->

---
transition: fade
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 6 — CENÁRIO 1: LOAD BALANCER COM SUCESSO
     ═══════════════════════════════════════════════════════════ -->

# 1ª Linha de Defesa: Load Balancer

<div class="accent-bar accent-bar-fuchsia">
  Load Balancer distribui as mensagens entre os servidores EME4
</div>

<ScenarioFlow>
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="tradutor" />
  <FlowNode label="EME4 1" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <!-- Animação do NATS para o Worker -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
    </svg>
  </div>
  <!-- Animação do Worker para o balanceamento nos EME4 Server -->
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="fuchsia" :duration="2.5" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" :delay="1.5" />
    </svg>
    <FlowBadge text=" LB distribui" icon="i-ph-arrows-split" color="fuchsia" position="left-95 top-15" bordered />
  </div>
  <!-- Animação dos EME4 com as entregas de Sucesso (EME4 1 top + EME4 2 bottom) -->
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <!-- EME4 1 (top) → Worker via path superior -->
      <path d="M420,20 L265,20 Q250,20 250,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,28 L420,20 L265,20 L250,40" color="cyan" :duration="2.5" />
      <!-- EME4 2 (bottom) → Worker via path inferior -->
      <path d="M420,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" :delay="0.5" />
      <!-- Worker → NATS (Ack) via path superior -->
      <path d="M250,40 Q250,20 235,20 L60,20 Q45,20 45,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,40 L250,20 L60,20 L45,40" color="cyan" :duration="2" :delay="1.5" />
      <!-- Worker → NATS (Ack) via path inferior -->
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="2" />
    </svg>
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px top-0" />
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0" />
    <FlowBadge text=" Entregue" icon="i-ph-check-circle-fill" color="cyan" position="right-0px bottom-10" bordered pulse />
    <FlowBadge text="✓ Ack" color="cyan" position="left-120px top-0px" size="xs" />
    <FlowBadge text="✓ Ack" color="cyan" position="left-120px bottom-0px" size="xs" />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-2 max-w-580px mx-auto">
<div class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-22px h-22px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[10px]"><span class="i-svg-spinners-pulse-3 inline-block"></span></div>
  <div>Ambos EME4 <strong>online</strong> — NATS entrega mensagens ao Worker</div>
</div>
<div v-click="1" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-fuchsia-500 text-fuchsia-300">
  <div class="w-22px h-22px rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-700 shrink-0 text-[10px]">1</div>
  <div>Load Balancer <strong>distribui</strong> entre EME4 1 e EME4 2 (Round Robin / Health Check)</div>
</div>
<div v-click="2" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-cyan-500 text-cyan-300 font-600">
  <div class="w-22px h-22px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[10px]">2</div>
  <div><strong>Sucesso</strong> — EME4 responde OK → Worker faz <strong>Ack</strong> → mensagem removida da fila</div>
</div>
</div>


---
transition: fade
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 7 — CENÁRIO 2: RETRY RESOLVE (LB NÃO BASTA)
     ═══════════════════════════════════════════════════════════ -->

# Quando o LB Não Basta: Retry

<div class="accent-bar accent-bar-pink">
  Cenário: EME4 1 aceitou a conexão mas falhou durante o processamento (erro 500)
</div>

<ScenarioFlow>
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="tradutor" />
  <FlowNode v-click.hide="1" label="EME4 1" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <!-- Linhas estáticas: NATS→Worker e Worker→EME4 (fork) -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
    </svg>
  </div>
  <!-- Fluxo contínuo: dots NATS→Worker, LB fork, sucesso EME4 1+2 (top desaparece no click 1) -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <!-- NATS → Worker -->
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
      <!-- Worker → EME4 1 (top, desaparece no click 1) -->
      <FlowDot v-click.hide="1" d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="fuchsia" :duration="2.5" />
      <!-- Worker → EME4 2 (bottom, contínuo) -->
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" :delay="1.5" />
      <!-- EME4 1 (top) → Worker via path superior (desaparece no click 1) -->
      <path v-click.hide="1" d="M420,20 L265,20 Q250,20 250,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot v-click.hide="1" d="M420,28 L420,20 L265,20 L250,40" color="cyan" :duration="2.5" />
      <!-- EME4 2 (bottom) → Worker via path inferior -->
      <path d="M420,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" :delay="0.5" />
      <!-- Worker → NATS (Ack) via path superior (desaparece no click 1) -->
      <path v-click.hide="1" d="M250,40 Q250,20 235,20 L60,20 Q45,20 45,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot v-click.hide="1" d="M250,40 L250,20 L60,20 L45,40" color="cyan" :duration="2" :delay="1.5" />
      <!-- Worker → NATS (Ack) via path inferior -->
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="2" />
    </svg>
    <!-- EME4 1 muda para erro 500 no click 1 -->
    <FlowNode v-click="1" label="EME4 1" color="pink" position="eme4-top" sub="erro 500" pulse />
    <FlowBadge v-click.hide="1" text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px top-0" />
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0"/>
    <FlowBadge v-click.hide="1" text="✓ Ack" color="cyan" position="left-120px top-0px" size="xs" />
    <FlowBadge text="✓ Ack" color="cyan" position="left-120px bottom-0px" size="xs" />
  </div>
  <!-- Click 2: Retry — EME4 1 retorna erro, EME4 2 sucesso (bottom), Nak refila -->
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <!-- NATS → Worker (nova tentativa) -->
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <!-- Worker → EME4 2 (bottom, única rota disponível) -->
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" />
      <!-- EME4 2 (bottom) → Worker sucesso -->
      <path d="M420,120 Q420,120 406,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" />
      <!-- Worker → NATS (Ack) via path inferior -->
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="1" />
      <!-- EME4 1 (top) → Worker erro (one-shot: acontece 1x, LB para de enviar) -->
      <path d="M420,20 Q420,20 406,20 L260,20 Q250,20 250,40" class="svg-line-return svg-stroke-pink"/>
      <FlowDot d="M420,20 L260,20 L250,40" color="pink" :duration="2.5" :loop="false" />
      <!-- Worker → NATS (Nak → refila, one-shot) -->
      <path d="M250,40 Q250,20 240,20 L60,20 Q45,20 45,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,40 L250,20 L60,20 L45,40" color="cyan" :duration="2.5" :delay="1.2" :loop="false" />
    </svg>
    <FlowBadge text="✕ erro/timeout" color="pink" position="left-300px top-0" size="xs" />
    <FlowBadge text=" Nak → refila" icon="i-ph-arrow-counter-clockwise-fill" color="cyan" position="left-100px top-0" size="xs" />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-2 max-w-580px mx-auto">
<div class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-22px h-22px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[10px]"><span class="i-ph-check-circle-fill inline-block"></span></div>
  <div>LB distribui entre ambos EME4 com <strong>sucesso</strong> (igual cenário anterior)</div>
</div>
<div v-click="1" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-pink-500 text-pink-300">
  <div class="w-22px h-22px rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-700 shrink-0 text-[10px]">1</div>
  <div>EME4 1 <strong>erro 500</strong> → Worker faz <strong>Nak</strong> → mensagem volta para a fila NATS</div>
</div>
</div>


---
transition: fade
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 8 — CENÁRIO 3: AMBOS FORA, FILA GARANTE
     ═══════════════════════════════════════════════════════════ -->

# Ambos Fora: A Fila Garante

<div class="accent-bar accent-bar-pink">
  Cenário extremo: todos os servidores EME4 estão indisponíveis
</div>

<ScenarioFlow>
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="tradutor" />
  <FlowNode label="EME4 1" icon="i-ph-x-circle-fill" color="pink" position="eme4-top" sub="offline" pulse />
  <FlowNode v-click.hide="2" label="EME4 2" icon="i-ph-x-circle-fill" color="pink" position="eme4-bottom" sub="offline" pulse />
  <!-- Estado inicial: NATS→Worker contínuo, linhas LB esmaecidas (sem servidor) -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia" style="opacity:0.15"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia" style="opacity:0.15"/>
    </svg>
    <FlowBadge v-click.hide="2" text=" sem servidor" icon="i-ph-x-circle-fill" color="pink" position="left-95 top-15" bordered />
  </div>
  <!-- Click 1→3: Nak contínuo — Worker devolve para NATS (backoff) -->
  <div v-click="[1, 3]" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M250,100 Q250,110 240,110 L55,110 Q45,110 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,110 L55,110 L45,100" color="cyan" :duration="2.5" />
    </svg>
    <FlowBadge text=" Nak → fila persiste" icon="i-ph-arrow-counter-clockwise-fill" color="cyan" position="left-100px bottom-15px" size="xs" />
    <FlowBadge text=" persistida em disco" icon="i-ph-hard-drives-fill" color="cyan" position="left-0 top-2" bordered size="xs" />
    <FlowBadge text=" 5s → 30s → 2min..." icon="i-ph-timer-fill" color="slate" position="left-100px bottom-30px" size="xs" />
  </div>
  <!-- Click 2: EME4 2 volta ao ar (recover) -->
  <div v-click="2" class="anim-seg">
    <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" voltou" subIcon="i-ph-arrow-up-fill" recover />
  </div>
  <!-- Click 3: Sucesso — NATS→Worker→EME4 2→Worker→NATS (Ack) -->
  <div v-click="3" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <!-- NATS → Worker -->
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <!-- Worker → EME4 2 (bottom, única rota disponível) -->
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" />
      <!-- EME4 2 (bottom) → Worker sucesso -->
      <path d="M420,120 Q420,120 406,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" />
      <!-- Worker → NATS (Ack) via path inferior -->
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="1" />
    </svg>
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0" />
    <FlowBadge text=" Recuperação automática" icon="i-ph-check-circle-fill" color="cyan" position="left-420px bottom-13" bordered pulse />
    <FlowBadge text="Ack ✓" color="cyan" position="left-130px bottom-2px" size="xs" />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-2 max-w-580px mx-auto">
<div class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-pink-500 text-pink-300">
  <div class="w-22px h-22px rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-700 shrink-0 text-[10px]"><span class="i-ph-x-circle-fill inline-block"></span></div>
  <div><strong>Ambos</strong> EME4 1 e EME4 2 estão fora — LB não tem para onde mandar</div>
</div>
<div v-click="1" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-22px h-22px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[10px]">1</div>
  <div>Mensagem <strong>não se perde</strong> — NATS persiste em disco. Backoff: 5s → 30s → 2min...</div>
</div>
<div v-click="2" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-22px h-22px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[10px]">2</div>
  <div>Minutos depois, <strong>EME4 2 é reiniciado</strong> e volta ao ar</div>
</div>
<div v-click="3" class="flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.58em] bg-slate-800/40 border-l-cyan-500 text-cyan-300 font-600">
  <div class="w-22px h-22px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[10px]">3</div>
  <div><strong>Nenhuma mensagem se perdeu</strong> — EME4 2 responde sucesso → Worker faz Ack</div>
</div>
</div>

<div v-click="4" class="text-center mt-4 py-3 px-6 rounded-12px border-1.5 border-solid border-cyan-500/30 bg-cyan-500/8 max-w-400px mx-auto" v-motion :initial="{opacity:0, scale:0.9}" :enter="{opacity:1, scale:1, transition:{delay:300}}">
  <div class="text-[13px] font-700 text-white"><span class="i-ph-shield-check-fill text-cyan-400 inline-block mr-4px"></span> LB + Retry = Zero mensagens perdidas</div>
  <div class="text-[10px] text-slate-400 mt-1">LB previne · Retry recupera · Fila persiste</div>
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 9 — ANALOGIA: O RESTAURANTE
     ═══════════════════════════════════════════════════════════ -->

# Analogia: O Restaurante

<div class="accent-bar accent-bar-pink">
  Modelo Atual: o cliente vai direto à cozinha — sem garçom, sem comanda
</div>

<ScenarioFlow>
  <FlowNode label="Cliente" icon="i-ph-user-fill" color="blue" position="top-50% -translate-y-50% left-0 w-90px h-56px" />
  <FlowNode v-click.hide="2" label="Cozinheiro" icon="i-ph-cooking-pot-fill" color="cyan" position="top-50% -translate-y-50% left-420px w-100px h-56px" />
  <!-- Linha direta Cliente → Cozinheiro -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="420" y2="70" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M100,70 L420,70" color="blue" :duration="3.5" />
    </svg>
    <FlowBadge text=" direto / bloqueante" icon="i-ph-arrow-right-fill" color="blue" position="left-180px top-50px" bordered />
  </div>
  <!-- Click 1: Problemas — bloqueado esperando -->
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <FlowDot d="M100,70 L420,70" color="blue" :duration="4" :delay="1" />
    </svg>
    <FlowBadge text=" Esperando o prato..." icon="i-ph-hourglass-fill" color="pink" position="left-200px top-15px" bordered />
    <FlowBadge text=" 50 clientes na fila" icon="i-ph-users-three-fill" color="pink" position="left-200px bottom-15px" bordered />
  </div>
  <!-- Click 2: Cozinheiro offline — perde o pedido -->
  <div v-click="2" class="anim-seg">
    <FlowNode label="Cozinheiro" icon="i-ph-x-circle-fill" color="pink" position="top-50% -translate-y-50% left-420px w-100px h-56px" pulse />
    <FlowBadge text=" Cozinha pegou fogo!" icon="i-ph-fire-fill" color="pink" position="left-350px top-5px" bordered />
    <FlowBadge text=" Pedido perdido" icon="i-ph-trash-fill" color="pink" position="left-350px bottom-5px" bordered />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-1 max-w-580px mx-auto">
<div class="flex items-center gap-2 py-1 px-3 rounded-[10px] border-l-3 border-l-solid text-[0.52em] bg-slate-800/40 border-l-pink-500 text-pink-300">
  <div class="w-18px h-18px rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-700 shrink-0 text-[9px]"><span class="i-ph-x-circle-fill inline-block"></span></div>
  <div><strong>Modelo Atual:</strong> cliente vai direto ao cozinheiro — espera, bloqueio, ponto único de falha</div>
</div>
</div>


<!-- Modelo Novo -->
<div v-click="3" class="accent-bar accent-bar-cyan mt-4">
  Modelo Novo: comanda na fila, expedidor distribui — nenhum pedido se perde
</div>

<ScenarioFlow v-click="3">
  <FlowNode label="Comanda" icon="i-ph-clipboard-text-fill" color="cyan" position="nats" sub="fila" persist />
  <FlowNode label="Expedidor" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="traduz" />
  <FlowNode label="Cozinha 1" color="cyan" position="eme4-top" sub=" ativo" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="Cozinha 2" color="cyan" position="eme4-bottom" sub=" ativo" subIcon="i-svg-spinners-pulse-3" />
  <!-- Comanda → Expedidor -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
    </svg>
  </div>
  <!-- Expedidor → Cozinhas (LB) -->
  <div v-click="3" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="fuchsia" :duration="2.5" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" :delay="1.5" />
    </svg>
    <FlowBadge text=" LB distribui" icon="i-ph-arrows-split" color="fuchsia" position="left-95 top-15" bordered />
  </div>
  <!-- Sucesso: retorno dos dois cozinheiros -->
  <div v-click="3" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M420,20 L265,20 Q250,20 250,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,28 L420,20 L265,20 L250,40" color="cyan" :duration="2.5" />
      <path d="M420,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" :delay="0.5" />
      <path d="M250,40 Q250,20 235,20 L60,20 Q45,20 45,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,40 L250,20 L60,20 L45,40" color="cyan" :duration="2" :delay="1.5" />
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="2" />
    </svg>
    <FlowBadge text=" Pronto!" icon="i-ph-check-circle-fill" color="cyan" position="left-300px top-0" />
    <FlowBadge text=" Pronto!" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0" />
    <FlowBadge text=" Nenhum pedido perdido" icon="i-ph-shield-check-fill" color="cyan" position="right-0px bottom-10" bordered pulse />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-1 max-w-580px mx-auto">

<div v-click="3" class="flex items-center gap-2 py-1 px-3 rounded-[10px] border-l-3 border-l-solid text-[0.52em] bg-slate-800/40 border-l-cyan-500 text-cyan-300">
  <div class="w-18px h-18px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[9px]"><span class="i-ph-check-circle-fill inline-block"></span></div>
  <div><strong>Modelo Novo:</strong> comanda na fila, expedidor distribui — LB + Retry + Zero perda</div>
</div>
</div>

---
transition: slide-up
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 10 — COMO FUNCIONARIA COM O MIDDLEWARE
     ═══════════════════════════════════════════════════════════ -->

<!-- Título -->
<div class="text-center" v-motion :initial="{opacity:0, y:-15}" :enter="{opacity:1, y:0, transition:{delay:100}}">
  <div class="text-[18px] font-bold text-white">Como funcionaria com o MIDDLEWARE</div>
  <div class="text-[11px] text-gray-400">Dois modos: o Worker só existe quando há trabalho a fazer</div>
</div>

<!-- MODO 1: PASSAGEM DIRETA -->
<div class="accent-bar accent-bar-cyan mt-1">
  <span class="i-ph-arrow-right-bold inline-block text-cyan-400 align-middle"></span> Passagem direta — sem fila, sem tradutor, rápido
</div>

<ScenarioFlow>
  <FlowNode label="Agente IA" icon="i-carbon-bot" color="blue" position="top-50% -translate-y-50% left-0 w-90px h-56px" sub="(futuro)" />
  <FlowNode label="Kong" icon="i-ph-shield-check-fill" color="purple" position="top-50% -translate-y-50% left-200px w-95px h-56px" sub="Auth + LB" />
  <FlowNode label="EME4 1" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <!-- Agente IA → Kong -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M100,70 L210,70" color="blue" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="blue" :duration="2" :delay="1" />
    </svg>
  </div>
  <!-- Kong → EME4 1/2 (LB direto) -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-purple"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-purple"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="purple" :duration="2.5" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="purple" :duration="3" :delay="1.5" />
    </svg>
    <FlowBadge text=" direto, sem fila" icon="i-ph-lightning-fill" color="cyan" position="left-95 top-15" bordered />
  </div>
</ScenarioFlow>

<!-- MODO 2: COM WORKER -->
<div v-click="1" class="accent-bar accent-bar-fuchsia mt-0">
  <span class="i-ph-arrows-clockwise-bold inline-block text-fuchsia-400 align-middle"></span> Com Worker — fila + tradução + retry automático
</div>

<ScenarioFlow v-click="1">
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="traduz DE→PARA" />
  <FlowNode label="EME4 1" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <!-- NATS → Worker -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
    </svg>
    <FlowBadge text=" ERP Externo → Kong →" icon="i-ph-plugs-connected-fill" color="blue" position="left-0 top-0" bordered size="xs" />
  </div>
  <!-- Worker → EME4 1/2 (LB) -->
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="fuchsia" :duration="2.5" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" :delay="1.5" />
    </svg>
    <FlowBadge text=" LB + tradução" icon="i-ph-arrows-split" color="fuchsia" position="left-95 top-15" bordered />
  </div>
</ScenarioFlow>

<!-- Features -->
<v-click>
<div class="flex justify-center gap-2 mt-1" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:300}}">
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-cyan-500/20"><div class="text-cyan-400 text-[9px] font-700"><span class="i-ph-lightning-fill inline-block mr-2px"></span> Load Balancing</div><div class="text-[7px] text-slate-400">Distribui carga</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-purple-500/20"><div class="text-purple-400 text-[9px] font-700"><span class="i-ph-shield-check-fill inline-block mr-2px"></span> Failover</div><div class="text-[7px] text-slate-400">Servidor cai, outro assume</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-blue-500/20"><div class="text-blue-400 text-[9px] font-700"><span class="i-ph-lock-key-fill inline-block mr-2px"></span> Auth Centralizada</div><div class="text-[7px] text-slate-400">Uma porta de entrada</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-cyan-500/20"><div class="text-cyan-400 text-[9px] font-700"><span class="i-ph-chart-line-up-fill inline-block mr-2px"></span> Rastreabilidade</div><div class="text-[7px] text-slate-400">Tudo registrado</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-fuchsia-500/20"><div class="text-fuchsia-400 text-[9px] font-700"><span class="i-ph-heartbeat-fill inline-block mr-2px"></span> Resiliência</div><div class="text-[7px] text-slate-400">Nenhum dado se perde</div></div>
</div>
</v-click>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 11 — COMPARAÇÃO CENÁRIO A CENÁRIO
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
     SLIDE 12 — Visão Estratégica
     ═══════════════════════════════════════════════════════════ -->

<!-- Título -->
<div class="text-center" v-motion :initial="{opacity:0, y:-15}" :enter="{opacity:1, y:0, transition:{delay:100}}">
  <div class="text-[20px] font-bold text-white">Visão Estratégica: O Middleware como base para IA</div>
  <div class="text-[12px] text-gray-400 mt-1">Fases para evoluir.</div>
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
    <div class="text-gray-300 text-[11px]">Outro Sistema ↔ EME4</div>
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
<div v-click="1" class="text-center mt-3 mb-1" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:300}}">
  <div class="text-white font-semibold text-[14px]">Futuro: Uma porta única para todos os sistemas</div>
</div>

<!-- Arquitetura com ScenarioFlow -->
<div v-click="1" class="scenario-flow-arch my-2" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <!-- Produtores (esquerda) -->
  <FlowNode label="Agentes IA" icon="i-carbon-bot" color="blue" position="top-6px left-0 w-88px h-34px" size="sm" />
  <FlowNode label="ERP Externo" icon="i-ph-plugs-connected-fill" color="blue" position="top-48px left-0 w-95px h-34px" size="sm" />
  <FlowNode label="App Mobile" icon="i-ph-device-mobile-fill" color="blue" position="top-90px left-0 w-88px h-34px" size="sm" />
  <FlowNode label="Dashboard" icon="i-ph-chart-line-up-fill" color="blue" position="top-132px left-0 w-88px h-34px" size="sm" />
  <!-- Middleware (centro) -->
  <div class="absolute top-50% -translate-y-50% left-230px w-160px h-130px rounded-14px border-2 border-solid border-purple-500/40 bg-purple-500/10 flex flex-col items-center justify-center z-2 gap-2px" style="animation: natsPersistGlow 3s ease-in-out infinite">
    <span class="i-ph-shield-check-fill text-purple-400 text-lg inline-block"></span>
    <div class="text-white font-700 text-12px">MIDDLEWARE</div>
    <div class="text-purple-400 text-[9px]">Kong/APISIX + NATS</div>
    <div class="text-gray-400 text-[8px]">Auth | LB | Fila | Tradução</div>
  </div>
  <!-- Consumidores (direita) -->
  <FlowNode label="EME4" icon="i-ph-buildings-fill" color="cyan" position="top-6px left-530px w-88px h-34px" size="sm" />
  <FlowNode label="Gesti" icon="i-ph-database-fill" color="cyan" position="top-48px left-530px w-88px h-34px" size="sm" />
  <FlowNode label="Sistema X" icon="i-ph-cube-fill" color="cyan" position="top-90px left-530px w-88px h-34px" size="sm" />
  <FlowNode label="Sistema Y" icon="i-ph-cube-fill" color="cyan" position="top-132px left-530px w-88px h-34px" size="sm" />
  <!-- SVG: linhas e dots -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 640 170">
      <!-- Produtores → Middleware (fan-in) -->
      <line x1="90" y1="23" x2="230" y2="70" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <line x1="90" y1="65" x2="230" y2="78" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <line x1="90" y1="107" x2="230" y2="92" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <line x1="90" y1="149" x2="230" y2="100" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <FlowDot d="M90,23 L230,70" color="blue" :duration="2.5" />
      <FlowDot d="M90,65 L230,78" color="blue" :duration="2.2" :delay="0.5" />
      <FlowDot d="M90,107 L230,92" color="blue" :duration="2.3" :delay="1" />
      <FlowDot d="M90,149 L230,100" color="blue" :duration="2.5" :delay="1.5" />
      <!-- Middleware → Consumidores (fan-out) -->
      <line x1="390" y1="70" x2="530" y2="23" class="svg-line svg-stroke-cyan" style="opacity:0.4"/>
      <line x1="390" y1="78" x2="530" y2="65" class="svg-line svg-stroke-cyan" style="opacity:0.4"/>
      <line x1="390" y1="92" x2="530" y2="107" class="svg-line svg-stroke-cyan" style="opacity:0.4"/>
      <line x1="390" y1="100" x2="530" y2="149" class="svg-line svg-stroke-cyan" style="opacity:0.4"/>
      <FlowDot d="M390,70 L530,23" color="cyan" :duration="2.5" :delay="0.3" />
      <FlowDot d="M390,78 L530,65" color="cyan" :duration="2.2" :delay="0.8" />
      <FlowDot d="M390,92 L530,107" color="cyan" :duration="2.3" :delay="1.3" />
      <FlowDot d="M390,100 L530,149" color="cyan" :duration="2.5" :delay="1.8" />
    </svg>
  </div>
</div>

<!-- Mensagem final -->
<div v-click="2" class="info-card info-card-pink mx-auto mt-0 w-190" v-motion :initial="{opacity:0, scale:0.9}" :enter="{opacity:1, scale:1, transition:{delay:300}}">
  <div class="card-header text-pink-300 text-0.8em">Por que IA precisa de Middleware?</div>
  <div class="card-body" style="font-size:0.65em;">
    <div>→ Agente fala com <strong>uma porta única</strong> em vez de conhecer cada sistema</div>
    <div>→ Sem precisar saber a autenticação de cada sistema (sessão, token, API key...)</div>
    <div>→ Alto volume: centenas de consultas por minuto para montar análises completas</div>
  </div>
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 13 — TECNOLOGIAS (COM MÉTRICAS CLARAS)
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

<div v-click class="grid grid-cols-3 gap-4 mt-10">
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
  <span class="text-cyan-300">Nosso volume atual é de ~500 mil mensagens <strong>por dia</strong>.</span> <br>
  <span class="opacity-50"> Estamos prontos para escalar com o NATS que processa 25 milhões por segundos.</span>
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

<div class="text-center text-[11px] text-slate-400 mb-1"><span class="i-ph-broadcast-fill inline-block mr-1 text-cyan-400"></span> subject: <span class="text-cyan-300 font-600">eme4.op.criar</span></div>

<div class="scenario-flow-tall my-3" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <FlowNode label="ERP Externo" icon="i-ph-plugs-connected-fill" color="blue" position="top-50% -translate-y-50% left-0 w-90px h-56px" sub="Publisher" />
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="top-50% -translate-y-50% left-200px w-95px h-56px" sub="JetStream" persist />
  <FlowNode label="Worker 1" icon="i-ph-gear-six-fill" color="fuchsia" position="top-2px left-420px w-100px h-42px" sub="Subscriber" size="top" />
  <FlowNode label="Worker 2" icon="i-ph-gear-six-fill" color="cyan" position="top-50% -translate-y-50% left-420px w-100px h-42px" sub="Subscriber" size="top" />
  <FlowNode label="Monitor" icon="i-carbon-dashboard" color="cyan" position="bottom-2px left-420px w-100px h-42px" sub="Subscriber" size="top" />
  <!-- ERP Externo → NATS (publish) -->
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 180">
      <line x1="92" y1="90" x2="200" y2="90" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M100,90 L210,90" color="blue" :duration="2" />
      <FlowDot d="M100,90 L210,90" color="blue" :duration="2" :delay="0.8" />
      <FlowDot d="M100,90 L210,90" color="blue" :duration="2" :delay="1.6" />
    </svg>
  </div>
  <!-- NATS → 3 Subscribers (fan-out) -->
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 180">
      <!-- NATS → Worker 1 (top) -->
      <path d="M300,90 L360,90 Q370,90 370,75 L370,35 Q370,25 380,25 L420,25" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M310,90 L360,90 Q370,90 370,75 L370,35 Q370,25 380,25 L430,25" color="fuchsia" :duration="2.5" />
      <!-- NATS → Worker 2 (middle) -->
      <line x1="300" y1="90" x2="420" y2="90" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M310,90 L430,90" color="cyan" :duration="2" :delay="0.3" />
      <!-- NATS → Monitor (bottom) -->
      <path d="M300,90 L360,90 Q370,90 370,105 L370,145 Q370,155 380,155 L420,155" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M310,90 L360,90 Q370,90 370,105 L370,145 Q370,155 380,155 L430,155" color="cyan" :duration="2.5" :delay="0.6" />
    </svg>
    <FlowBadge text=" fan-out" icon="i-ph-arrows-split" color="cyan" position="left-310px top-100px" bordered />
  </div>
  <!-- Retorno: Subscribers → NATS (Ack) -->
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 180">
      <!-- Worker 1 (top) → NATS via path superior -->
      <path d="M420,10 L270,10 Q255,10 255,30" class="svg-line-return svg-stroke-fuchsia"/>
      <FlowDot d="M420,10 L270,10 L255,30" color="fuchsia" :duration="2.5" />
      <!-- Worker 2 (middle) → NATS via path abaixo da linha principal -->
      <path d="M420,105 L310,105 Q300,105 300,95" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,105 L310,105 L300,95" color="cyan" :duration="2.2" :delay="0.4" />
      <!-- Monitor (bottom) → NATS via path inferior -->
      <path d="M420,170 L270,170 Q255,170 255,150" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,170 L270,170 L255,150" color="cyan" :duration="2.5" :delay="0.8" />
    </svg>
    <FlowBadge text="✓ Ack" color="fuchsia" position="left-330px top-0" size="xs" />
    <FlowBadge text="✓ Ack" color="cyan" position="left-350px top-55%" size="xs" />
    <FlowBadge text="✓ Ack" color="cyan" position="left-330px bottom-0" size="xs" />
    <FlowBadge text=" Entregue" icon="i-ph-check-circle-fill" color="cyan" position="left-0 bottom-0" bordered pulse />
  </div>
</div>

<v-click>
<div class="flex justify-center gap-4 mt-2">
  <div class="text-center px-4 py-2 rounded-10px bg-slate-800/40 border border-blue-500/20">
    <div class="text-[13px] font-700 text-blue-400">1 publish</div>
    <div class="text-[9px] text-slate-400">ERP Externo envia uma vez</div>
  </div>
  <div class="text-center px-4 py-2 rounded-10px bg-slate-800/40 border border-cyan-500/20">
    <div class="text-[13px] font-700 text-cyan-400">N subscribers</div>
    <div class="text-[9px] text-slate-400">Todos recebem em paralelo</div>
  </div>
  <div class="text-center px-4 py-2 rounded-10px bg-slate-800/40 border border-fuchsia-500/20">
    <div class="text-[13px] font-700 text-fuchsia-400">0,2 ms</div>
    <div class="text-[9px] text-slate-400">Latência por mensagem</div>
  </div>
  <div class="text-center px-4 py-2 rounded-10px bg-slate-800/40 border border-purple-500/20">
    <div class="text-[13px] font-700 text-purple-400">Garantido</div>
    <div class="text-[9px] text-slate-400">JetStream persiste na fila</div>
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
