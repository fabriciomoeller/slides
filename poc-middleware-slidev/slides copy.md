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

<div class="slide-bg">
  <div class="deco-circle deco-circle-1"></div>
  <div class="deco-circle deco-circle-2"></div>
  <div class="deco-circle deco-circle-3"></div>
</div>

<div class="company-badge">DATAINFO</div>

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
  <span class="tech-badge tech-badge-green glow-green">NATS JetStream</span>
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

<div v-click class="pipeline my-8 gap-4">
  <div class="pipe-node pipe-blue" style="padding:16px 24px;">
    <div class="text-2xl mb-1">🔗</div>
    <div class="font-bold text-base">Sistema Externo</div>
    <div class="text-xs opacity-40">(ex: ERP, IA, etc.)</div>
  </div>
  <div class="flex flex-col items-center gap-1">
    <span class="font-mono text-xs text-gray-400">POST /Incluir_API</span>
    <span class="text-2xl text-gray-500 animate-pulse">━━━━►</span>
  </div>
  <div class="pipe-node pipe-green" style="padding:16px 24px;">
    <div class="text-2xl mb-1">🏭</div>
    <div class="font-bold text-base">EME4</div>
    <div class="text-xs opacity-50">(1 servidor)</div>
  </div>
</div>

<div v-click class="grid grid-cols-2 gap-6 mt-2">
<div class="info-card info-card-red">
<div class="card-header text-red-400">Problemas</div>
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

<div class="accent-bar accent-bar-red">
  O sistema externo fica bloqueado até o EME4 responder
</div>

<div class="flow-steps">

<v-clicks>

<div class="flow-step flow-step-blue">
  <div class="flow-step-num">1</div>
  <div>Sistema externo monta o JSON com os dados (ex: OP, cadastro)</div>
</div>

<div class="flow-step flow-step-blue">
  <div class="flow-step-num">2</div>
  <div>Faz chamada HTTP direta: <code>POST /DoctoOrdProducaoManufatura/Incluir_API</code></div>
</div>

<div class="flow-step flow-step-orange">
  <div class="flow-step-num" style="background: rgba(245,158,11,0.2); color: #fbbf24;">3</div>
  <div>Sistema origem <strong>AGUARDA...</strong> 2s, 5s, 10s, timeout?</div>
</div>

<div class="flow-step flow-step-green">
  <div class="flow-step-num" style="background: rgba(16,185,129,0.2); color: #34d399;">4</div>
  <div>EME4 responde: <code>{ "Sucesso": true }</code></div>
</div>

<div class="flow-step flow-step-red">
  <div class="flow-step-num flow-step-num-alert">⚠</div>
  <div>Se EME4 estiver fora → <strong>ERRO!</strong> Dados podem se perder</div>
</div>

</v-clicks>

</div>

<div v-click class="mt-6 p-4 rounded-xl text-center text-sm result-bad">
  <span class="text-red-400 font-semibold">Total para 3 OPs:</span> 16 segundos (com 1 erro) — tudo sequencial, um esperando o outro
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
  <div v-click class="mode-card mode-card-orange">
    <div class="mode-number">2</div>
    <div class="mode-title text-orange-300">Com Tradutor</div>
    <div class="mode-desc">Fila NATS + Worker<br>Tradução DE-PARA + Garantia de entrega</div>
    <div class="mode-use">Ex: ERP → EME4 (com tradução)</div>
  </div>
  <div v-click class="mode-card mode-card-green">
    <div class="mode-number" style="background: rgba(16,185,129,0.15); color: #34d399;">1</div>
    <div class="mode-title text-green-300">Passagem Direta</div>
    <div class="mode-desc">Sem tradutor. Sem fila.<br>Direto e rápido.</div>
    <div class="mode-use">IA, Dashboards, Consultas</div>
  </div>
</div>

<div v-click class="mt-8 text-sm opacity-50 text-center">
  Worker só existe quando há trabalho real a fazer. Sem trabalho = passagem direta.
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 5 — MODO 2: COM TRADUTOR (WORKER)
     ═══════════════════════════════════════════════════════════ -->

# Modo 2: Com Tradutor (Worker)

<div class="accent-bar accent-bar-orange">
  Quando há trabalho real — tradução, orquestração, garantia de entrega
</div>

<div v-click class="pipeline my-4">
  <div class="pipe-node pipe-blue">ORIGEM<span class="pipe-sub">ex: ERP</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node pipe-purple">KONG<span class="pipe-sub">portaria</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node pipe-cyan">NATS<span class="pipe-sub">fila</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-node pipe-orange">Worker<span class="pipe-sub">tradutor</span></div>
  <div class="pipe-arrow">→</div>
  <div class="pipe-group">
    <div class="pipe-node pipe-green pipe-sm">EME4 1</div>
    <div class="pipe-node pipe-green pipe-sm">EME4 2</div>
  </div>
</div>

<div class="flow-steps" style="max-width:750px;">
<v-clicks>

<div class="flow-step flow-step-blue">
  <div class="flow-step-num">1</div>
  <div>Sistema externo envia os dados para o Kong/APISIX</div>
</div>
<div class="flow-step flow-step-cyan">
  <div class="flow-step-num" style="background:rgba(6,182,212,0.2);color:#22d3ee;">2</div>
  <div>Kong autentica e coloca a mensagem na fila (NATS JetStream)</div>
</div>
<div class="flow-step flow-step-green" style="font-weight:600;">
  <div class="flow-step-num" style="background:rgba(16,185,129,0.2);color:#34d399;">3</div>
  <div>Sistema origem recebe "Recebido!" (202 Accepted) e <strong>segue em frente</strong></div>
</div>
<div class="flow-step flow-step-orange">
  <div class="flow-step-num" style="background:rgba(245,158,11,0.2);color:#fbbf24;">4</div>
  <div>Worker pega da fila e traduz campos (DE-PARA: SG1 → ListaMateriaisProduto)</div>
</div>
<div class="flow-step flow-step-purple">
  <div class="flow-step-num" style="background:rgba(139,92,246,0.2);color:#a78bfa;">5</div>
  <div>Load Balancer escolhe a melhor instância do EME4 (menos ocupada)</div>
</div>
<div class="flow-step flow-step-green">
  <div class="flow-step-num" style="background:rgba(16,185,129,0.2);color:#34d399;">6</div>
  <div>Se der erro → retry automático com backoff exponencial</div>
</div>

</v-clicks>
</div>

<!--
Descobri como fazer o modo apresentação
-->

---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 6 — OS DOIS MODOS COEXISTEM
     ═══════════════════════════════════════════════════════════ -->

# Os dois modos coexistem

<div class="accent-bar accent-bar-purple">
  Mesmo Middleware, dois caminhos. Worker só existe quando há trabalho real.
</div>

<div v-click class="middleware-box">
  <div class="middleware-label">MIDDLEWARE</div>

  <div class="mw-row">
    <div class="pipe-node pipe-pink pipe-sm">Agente IA</div>
    <div class="pipe-arrow" style="font-size:1.1em;">→</div>
    <div class="pipe-node pipe-purple pipe-sm">KONG/APISIX</div>
    <span class="text-green-400 text-sm font-semibold mx-1">— direto →</span>
    <div class="pipe-node pipe-green pipe-sm">EME4</div>
    <span class="text-green-400/50 text-xs ml-2">Modo 1 — rápido, sem fila</span>
  </div>

  <div class="mw-row mt-4">
    <div class="pipe-node pipe-blue pipe-sm">ERP / Sistema</div>
    <div class="pipe-arrow" style="font-size:1.1em;">→</div>
    <div class="pipe-node pipe-purple pipe-sm">KONG/APISIX</div>
    <div class="pipe-arrow" style="font-size:1.1em;">→</div>
    <div class="pipe-node pipe-cyan pipe-sm">NATS</div>
    <div class="pipe-arrow" style="font-size:1.1em;">→</div>
    <div class="pipe-node pipe-orange pipe-sm">Worker</div>
    <div class="pipe-arrow" style="font-size:1.1em;">→</div>
    <div class="pipe-node pipe-green pipe-sm">EME4</div>
  </div>
  <div class="text-orange-400/50 text-xs ml-12 mt-1">Modo 2 — com fila + tradução (ex: Protheus, SAP...)</div>
</div>

<div v-click class="grid grid-cols-2 gap-6 mt-5 max-w-3xl mx-auto">
  <div class="info-card info-card-green" style="padding: 16px;">
    <div class="card-header text-green-400">Modo 1 — Passagem Direta</div>
    <div class="card-body" style="font-size:0.8em;">
      <div>→ Sem fila, sem Worker</div>
      <div>→ Resposta síncrona imediata</div>
      <div>→ Ideal para consultas e IA</div>
      <div>→ Latência mínima (~1ms extra)</div>
    </div>
  </div>
  <div class="info-card info-card-orange" style="padding: 16px;">
    <div class="card-header text-orange-400">Modo 2 — Com Worker</div>
    <div class="card-body" style="font-size:0.8em;">
      <div>→ Fila NATS + tradução DE-PARA</div>
      <div>→ Resposta assíncrona (202 Accepted)</div>
      <div>→ Ideal para integrações com ERPs</div>
      <div>→ Garantia de entrega + retry</div>
    </div>
  </div>
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 7 — COMPARAÇÃO CENÁRIO A CENÁRIO
     ═══════════════════════════════════════════════════════════ -->

# Comparação: Cenário a Cenário

<div class="grid grid-cols-2 gap-6 mt-4">

<div v-click class="comp-panel comp-panel-red">
<div class="comp-title text-red-400">Modelo Atual (Direto)</div>

<v-clicks>

- ✗ EME4 fora do ar → **erro e perda de dados**
- ✗ 500 OPs → uma por uma, **lento**
- ✗ Formato mudou → altera **ambos** os sistemas
- ✗ Servidor caiu → **tudo para**
- ✗ Sem rastreabilidade
- ✗ Sem distribuição de carga

</v-clicks>

</div>

<div v-click="1" class="comp-panel comp-panel-green">
<div class="comp-title text-green-400">Modelo Novo (Middleware)</div>

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

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good text-green-300">
  Nenhum dado se perde. Se um cai, o outro continua. Cada sistema evolui independentemente.
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 8 — ANALOGIA: O RESTAURANTE
     ═══════════════════════════════════════════════════════════ -->

# Analogia: O Restaurante

<div class="grid grid-cols-2 gap-8 mt-4">

<div v-click class="info-card info-card-red" style="padding:20px;">
<div class="card-header text-red-400" style="font-size:1.05em;">Modelo Atual</div>
<div class="card-body" style="font-size:0.82em; line-height:1.7;">

<v-clicks>

<div>O cliente <span class="text-blue-400">(sistema externo)</span> vai até a cozinha <span class="text-green-400">(EME4)</span> e faz o pedido diretamente ao <strong>único</strong> cozinheiro.</div>

<div>Fica <strong>parado na cozinha esperando</strong> o prato ficar pronto.</div>

<div>Cozinheiro no banheiro? <span class="text-red-400">Espera.</span></div>

<div>Cozinha pegou fogo? <span class="text-red-400">Perde o pedido.</span></div>

<div>50 clientes? Todos na fila do <strong>mesmo</strong> cozinheiro.</div>

</v-clicks>

</div>
</div>

<div v-click="1" class="info-card info-card-green" style="padding:20px;">
<div class="card-header text-green-400" style="font-size:1.05em;">Modelo Novo</div>
<div class="card-body" style="font-size:0.82em; line-height:1.7;">

<v-clicks at="6">

<div><strong class="text-orange-300">Modo 2:</strong> Cliente faz pedido ao <span class="text-purple-400">garçom (Kong)</span>, que anota na <span class="text-cyan-400">comanda (NATS)</span>. Volta para a mesa.</div>

<div>O <span class="text-orange-400">expedidor (Worker)</span> traduz o pedido e escolhe o cozinheiro menos ocupado <span class="text-gray-400">(Load Balancing)</span>.</div>

<div>Cozinheiro passou mal? Os pedidos vão para os outros <span class="text-gray-400">(Failover)</span>.</div>

<div><strong class="text-green-300">Modo 1:</strong> Cliente que fala a língua da cozinha vai ao <span class="text-purple-400">maître</span> → encaminha direto. Sem garçom no meio.</div>

</v-clicks>

</div>
</div>
</div>

---
transition: slide-up
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 9 — TECNOLOGIAS (COM MÉTRICAS CLARAS)
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
  <div class="stat-card stat-glow-green">
    <div class="stat-value text-green-400">18 MB</div>
    <div class="stat-label">de memória RAM<br>para rodar o <strong>NATS</strong></div>
  </div>
  <div class="stat-card stat-glow-purple">
    <div class="stat-value text-purple-400">0,2 ms</div>
    <div class="stat-label">latência por mensagem<br><strong>quase instantâneo</strong></div>
  </div>
</div>

<div v-click class="grid grid-cols-3 gap-4 mt-4">
  <div class="info-card" style="border-color: rgba(6,182,212,0.2); padding: 14px;">
    <div class="card-header text-cyan-400">NATS</div>
    <div class="card-body" style="font-size:0.78em;">
      <div>→ Escrito em Go (Google)</div>
      <div>→ Tesla, Mastercard, Walmart</div>
      <div>→ CNCF (fundação do Kubernetes)</div>
      <div>→ Um executável de 20 MB, sem dependências</div>
    </div>
  </div>
  <div class="info-card" style="border-color: rgba(139,92,246,0.2); padding: 14px;">
    <div class="card-header text-purple-400">Kong / APISIX</div>
    <div class="card-body" style="font-size:0.78em;">
      <div>→ Construído sobre <strong>NGINX</strong></div>
      <div>→ NGINX serve 30% da internet mundial</div>
      <div>→ Netflix, Samsung, NASA usam</div>
      <div>→ LB + Auth + Failover + Logs inclusos</div>
    </div>
  </div>
  <div class="info-card" style="border-color: rgba(16,185,129,0.2); padding: 14px;">
    <div class="card-header text-green-400">Infraestrutura Total</div>
    <div class="card-body" style="font-size:0.78em;">
      <div>→ <strong>280 MB</strong> RAM total (menos que o Chrome)</div>
      <div>→ Menos de 7% de CPU</div>
      <div>→ ~1 GB de disco</div>
      <div>→ Cabe em qualquer VM ou container</div>
    </div>
  </div>
</div>

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good">
  <span class="text-green-300">Nosso volume atual é de ~500 mensagens <strong>por dia</strong>.</span>
  <span class="opacity-50"> O NATS processa 25 milhões <strong>por segundo</strong>. É como ter um foguete para ir à padaria.</span>
</div>


---
transition: slide-left
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 10 — MODO 1: PASSAGEM DIRETA (IA)
     ═══════════════════════════════════════════════════════════ -->

# Modo 1: Passagem Direta

<div class="accent-bar accent-bar-green">
  Sem tradutor, sem fila — quando quem pede já fala a língua do destino
</div>

<div v-click class="pipeline my-6 gap-3">
  <div class="pipe-node pipe-pink" style="padding:12px 18px;">
    <div class="text-xl mb-1">🤖</div>
    <div class="font-bold text-sm">Agente IA</div>
    <span class="pipe-sub">(futuro)</span>
  </div>
  <div class="pipe-arrow text-green-500 text-xl animate-pulse">━►</div>
  <div class="pipe-node pipe-purple" style="padding:12px 18px; box-shadow: 0 0 20px rgba(139,92,246,0.15);">
    <div class="text-xl mb-1">🚪</div>
    <div class="font-bold text-sm">KONG/APISIX</div>
    <span class="pipe-sub">portaria + LB</span>
  </div>
  <div class="pipe-arrow text-green-500 text-xl animate-pulse">━►</div>
  <div class="pipe-group">
    <div class="pipe-node pipe-green pipe-sm">EME4 Srv 1</div>
    <div class="pipe-node pipe-green pipe-sm">EME4 Srv 2</div>
  </div>
</div>

<div class="flow-steps" style="max-width:650px;">
<v-clicks>

<div class="flow-step flow-step-purple">
  <div class="flow-step-num" style="background:rgba(139,92,246,0.2);color:#a78bfa;">1</div>
  <div>Sistema faz requisição HTTP ao Middleware (Kong/APISIX)</div>
</div>
<div class="flow-step flow-step-purple">
  <div class="flow-step-num" style="background:rgba(139,92,246,0.2);color:#a78bfa;">2</div>
  <div>Kong autentica, escolhe o servidor EME4 menos ocupado (LB)</div>
</div>
<div class="flow-step flow-step-green" style="font-weight:600;">
  <div class="flow-step-num" style="background:rgba(16,185,129,0.2);color:#34d399;">3</div>
  <div>EME4 responde → Kong devolve → <strong>Pronto.</strong> Sem fila, sem espera.</div>
</div>

</v-clicks>
</div>

<div v-click class="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
  <div class="benefit-pill">Load Balance</div>
  <div class="benefit-pill">Failover</div>
  <div class="benefit-pill">Auth Central</div>
  <div class="benefit-pill">Rate Limit</div>
  <div class="benefit-pill">Logging</div>
</div>


---
transition: slide-up
---

<!-- ═══════════════════════════════════════════════════════════
     SLIDE 11 — VISÃO ESTRATÉGICA IA
     ═══════════════════════════════════════════════════════════ -->

# Visão Estratégica: Pista de Decolagem para IA

<div class="accent-bar accent-bar-pink">
  A POC de hoje é o piloto. O Middleware é a pista de decolagem.
</div>

<div v-click class="pipeline my-5 gap-3">
  <div class="pipe-node pipe-pink" style="padding:10px 16px;">
    <div class="text-lg">🤖</div>
    <div class="font-bold text-sm">Agente IA</div>
  </div>
  <div class="pipe-arrow text-purple-400 text-xl animate-pulse">━►</div>
  <div class="pipe-node pipe-purple" style="padding:14px 20px; box-shadow: 0 0 20px rgba(139,92,246,0.15);">
    <div class="font-bold">MIDDLEWARE</div>
    <span class="pipe-sub">Kong + NATS</span>
  </div>
  <div class="pipe-arrow text-purple-400 text-xl animate-pulse">━►</div>
  <div class="pipe-group">
    <div class="pipe-node pipe-green pipe-sm">EME4</div>
    <div class="pipe-node pipe-blue pipe-sm">ERP</div>
    <div class="pipe-node pipe-gray pipe-sm">Sistema X</div>
    <div class="pipe-node pipe-gray pipe-sm">Sistema Y</div>
  </div>
</div>

<div v-click class="timeline-row">
  <div class="timeline-line"></div>
  <div class="tl-item">
    <div class="tl-dot" style="background:#3b82f6;">1</div>
    <div class="tl-title">POC</div>
    <div class="tl-desc">ERP ↔ EME4<br>1 cadastro + 1 fluxo OP</div>
  </div>
  <div class="tl-item">
    <div class="tl-dot" style="background:#10b981;">2</div>
    <div class="tl-title">Expansão</div>
    <div class="tl-desc">Mais integrações<br>Dashboard monitoramento</div>
  </div>
  <div class="tl-item">
    <div class="tl-dot" style="background:#8b5cf6;">3</div>
    <div class="tl-title">IA</div>
    <div class="tl-desc">Agentes IA consumindo<br>APIs via Middleware</div>
  </div>
</div>

<div v-click class="info-card info-card-pink mx-auto mt-4" style="max-width:650px; padding:14px 20px;">
  <div class="card-header" style="color:#f472b6; font-size:0.9em;">Por que IA precisa de Middleware?</div>
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
     SLIDE 12 — RECOMENDAÇÃO
     ═══════════════════════════════════════════════════════════ -->

# Recomendação

<div class="gradient-subtitle" style="font-size:0.95em;">Aprovação da POC do Middleware com escopo reduzido</div>

<div class="gradient-divider mx-auto mt-3 mb-6" style="width:150px;"></div>

<div v-click class="grid grid-cols-3 gap-5 max-w-3xl">
  <div class="rec-card rec-card-green">
    <div class="rec-icon">🎯</div>
    <div class="rec-title text-green-400">Escopo da POC</div>
    <div class="rec-desc">1 cadastro de engenharia<br>(Centro de Trabalho)<br>+ 1 fluxo de OP<br>(criar + apontar)</div>
  </div>
  <div class="rec-card rec-card-blue">
    <div class="rec-icon">🛡️</div>
    <div class="rec-title text-blue-400">Risco</div>
    <div class="rec-desc">Baixo — a POC<br>não afeta os sistemas<br>atuais em produção</div>
  </div>
  <div class="rec-card rec-card-purple">
    <div class="rec-icon">⚡</div>
    <div class="rec-title text-purple-400">Infraestrutura</div>
    <div class="rec-desc">~280 MB RAM<br>em qualquer servidor<br>NATS + Kong gratuitos</div>
  </div>
</div>

<div v-click class="mt-6 p-5 rounded-xl text-center result-good max-w-2xl mx-auto" style="border-width: 1.5px;">
  <div class="text-green-400 font-semibold mb-1">Resultado Esperado</div>
  <div class="text-sm opacity-80">Demonstrar que o Middleware funciona, medir performance real, e ter base concreta para decisão de expansão rumo à IA.</div>
</div>

<div v-click class="mt-6 text-center opacity-50 italic text-sm max-w-lg mx-auto">
  "A POC é um investimento pequeno para uma decisão informada.<br>
  Melhor testar antes de comprometer do que comprometer antes de testar."
</div>
