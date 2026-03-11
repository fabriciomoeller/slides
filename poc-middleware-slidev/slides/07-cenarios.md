---
transition: fade
---

# 1ª Linha de Defesa: Load Balancer

<div class="gradient-subtitle text-[0.9rem]">Load Balancer distribui as mensagens entre os servidores EME4</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<ScenarioFlow>
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist hint="<strong>Message Broker — Sistema Nervoso</strong><br>Recebe mensagens e garante entrega<br>Persiste em disco (JetStream)<br>Retry automático com backoff">
    <template #right><FlowMsgStack :clicks="$clicks" :fill-at="0" :drain-at="2" /></template>
  </FlowNode>
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="tradutor" hint="<strong>Executor de Lógica</strong><br>Consome mensagens da fila NATS<br>Transforma formatos (XML→JSON)<br>Mapeia campos DE→PARA" />
  <FlowNode label="EME4 1" icon="i-carbon-bare-metal-server-02" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" hint="<strong>Sistema Provedor</strong> (destino)<br>Recebe chamadas normais da API<br>Não sabe que existe middleware" />
  <FlowNode label="EME4 2" icon="i-carbon-bare-metal-server-02" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" hint="<strong>Sistema Provedor</strong> (destino)<br>Recebe chamadas normais da API<br>Não sabe que existe middleware" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
    </svg>
  </div>
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="fuchsia" :duration="2.5" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" :delay="1.5" />
    </svg>
    <FlowBadge text=" LB distribui" icon="i-ph-arrows-split" color="fuchsia" position="left-95 top-15" bordered />
  </div>
  <div v-click="2" class="anim-seg">
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
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px top-0" />
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0" />
    <FlowBadge text=" Entregue" icon="i-ph-check-circle-fill" color="cyan" position="right-0px bottom-10" bordered pulse />
    <FlowBadge text="✓ Ack" color="cyan" position="left-120px top-0px" size="xs" />
    <FlowBadge text="✓ Ack" color="cyan" position="left-120px bottom-0px" size="xs" />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-2 max-w-580px mx-auto">
<div class="step-item-sm text-[0.58em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"><span class="i-svg-spinners-pulse-3 inline-block"></span></div>
  <div>Ambos EME4 <strong>online</strong> — NATS entrega mensagens ao Worker</div>
</div>
<div v-click="1" class="step-item-sm text-[0.58em] border-l-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400">1</div>
  <div>Load Balancer <strong>distribui</strong> entre EME4 1 e EME4 2 (Round Robin / Health Check)</div>
</div>
<div v-click="2" class="step-item-sm text-[0.58em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300 font-600">
  <div class="num-badge w-22px h-22px text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">2</div>
  <div><strong>Sucesso</strong> — EME4 responde OK → Worker faz <strong>Ack</strong> → mensagem removida da fila</div>
</div>
</div>

<!--
- Cenário ideal: ambos EME4 online, LB distribui entre eles
- Round Robin ou Health Check — distribui carga de forma inteligente
- Sucesso: EME4 responde OK, Worker confirma (Ack), mensagem sai da fila
- Este é o fluxo normal do dia a dia
-->

---
transition: fade
---

# Quando o LB Não Basta: Retry

<div class="gradient-subtitle text-[0.9rem]">Cenário: EME4 1 aceitou a conexão mas falhou durante o processamento (erro 500)</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<ScenarioFlow>
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist hint="<strong>Message Broker — Sistema Nervoso</strong><br>Recebe mensagens e garante entrega<br>Persiste em disco (JetStream)<br>Retry automático com backoff">
    <template #right><FlowMsgStack :clicks="$clicks" :fill-at="0" :drain-at="1" /></template>
  </FlowNode>
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="tradutor" hint="<strong>Executor de Lógica</strong><br>Consome mensagens da fila NATS<br>Transforma formatos (XML→JSON)<br>Mapeia campos DE→PARA" />
  <FlowNode v-click.hide="1" label="EME4 1" icon="i-carbon-bare-metal-server-02" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" hint="<strong>Sistema Provedor</strong> (destino)<br>Recebe chamadas normais da API<br>Não sabe que existe middleware" />
  <FlowNode label="EME4 2" icon="i-carbon-bare-metal-server-02" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" hint="<strong>Sistema Provedor</strong> (destino)<br>Recebe chamadas normais da API<br>Não sabe que existe middleware" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <path v-click.hide="1" d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia"/>
      <path v-click="1" d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35" class="svg-line svg-stroke-fuchsia" style="opacity:0.15"/>
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
    </svg>
  </div>
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
      <FlowDot v-click.hide="1" d="M340,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L430,35" color="fuchsia" :duration="2.5" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" :delay="1.5" />
      <path v-click.hide="1" d="M420,20 L265,20 Q250,20 250,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot v-click.hide="1" d="M420,28 L420,20 L265,20 L250,40" color="cyan" :duration="2.5" />
      <path d="M420,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" :delay="0.5" />
      <path v-click.hide="1" d="M250,40 Q250,20 235,20 L60,20 Q45,20 45,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot v-click.hide="1" d="M250,40 L250,20 L60,20 L45,40" color="cyan" :duration="2" :delay="1.5" />
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="2" />
    </svg>
    <FlowNode v-click="1" label="EME4 1" icon="i-ph-x-circle-fill" color="pink" position="eme4-top" sub="erro 500" pulse hint="<strong>EME4 1 — Erro 500</strong><br>Worker devolve à fila (<strong>Nak</strong>)<br>NATS retenta com backoff exponencial" />
    <FlowBadge v-click.hide="1" text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px top-0" />
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0"/>
    <FlowBadge v-click.hide="1" text="✓ Ack" color="cyan" position="left-120px top-0px" size="xs" />
    <FlowBadge text="✓ Ack" color="cyan" position="left-120px bottom-0px" size="xs" />
  </div>
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" />
      <path d="M420,120 Q420,120 406,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" />
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="1" />
      <path d="M420,20 Q420,20 406,20 L260,20 Q250,20 250,40" class="svg-line-return svg-stroke-pink"/>
      <FlowDot d="M420,20 L260,20 L250,40" color="pink" :duration="2.5" :loop="false" />
      <path d="M250,40 Q250,20 240,20 L60,20 Q45,20 45,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,40 L250,20 L60,20 L45,40" color="cyan" :duration="2.5" :delay="1.2" :loop="false" />
    </svg>
    <FlowBadge text="✕ erro/timeout" color="pink" position="left-300px top-0" size="xs" />
    <FlowBadge text=" Nak → refila" icon="i-ph-arrow-counter-clockwise-fill" color="cyan" position="left-100px top-0" size="xs" />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-2 max-w-580px mx-auto">
<div class="step-item-sm text-[0.58em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"><span class="i-ph-check-circle-fill inline-block"></span></div>
  <div>LB distribui entre ambos EME4 com <strong>sucesso</strong> (igual cenário anterior)</div>
</div>
<div v-click="1" class="step-item-sm text-[0.58em] border-l-fuchsia-500 text-fuchsia-800 dark:text-pink-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-fuchsia-500/20 text-fuchsia-700 dark:text-pink-400">1</div>
  <div>EME4 1 <strong>erro 500</strong> → Worker faz <strong>Nak</strong> → mensagem volta para a fila NATS</div>
</div>
</div>

<!--
- Este cenário mostra o que acontece quando um EME4 falha DURANTE o processamento
- O LB mandou para o EME4 1, mas ele devolveu erro 500
- Worker faz Nak (negative acknowledgment) → mensagem volta para a fila
- NATS retenta automaticamente — manda para o EME4 2 que está saudável
- Resultado: a mensagem é processada com sucesso, sem intervenção manual
-->

---
transition: slide-up
---

# Ambos Fora: A Fila Garante

<div class="gradient-subtitle text-[0.9rem]">Cenário extremo: todos os servidores EME4 estão indisponíveis</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<ScenarioFlow>
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist hint="<strong>Message Broker — Resiliência Total</strong><br>Mensagens persistidas em disco<br>Não se perdem mesmo com tudo fora<br>Backoff: 5s → 30s → 2min...">
    <template #right><FlowMsgStack :clicks="$clicks" :fill-at="1" :drain-at="3" /></template>
  </FlowNode>
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="tradutor" hint="<strong>Executor de Lógica</strong><br>Consome mensagens da fila NATS<br>Transforma formatos (XML→JSON)<br>Mapeia campos DE→PARA" />
  <FlowNode label="EME4 1" icon="i-ph-x-circle-fill" color="pink" position="eme4-top" sub="offline" pulse hint="<strong>EME4 1 — Offline</strong><br>Mensagens aguardam na fila NATS<br>Serão entregues quando voltar" />
  <FlowNode v-click.hide="2" label="EME4 2" icon="i-ph-x-circle-fill" color="pink" position="eme4-bottom" sub="offline" pulse hint="<strong>EME4 2 — Offline</strong><br>Mensagens aguardam na fila NATS<br>Serão entregues quando voltar" />
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
  <div v-click="[1, 3]" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M250,100 Q250,110 240,110 L55,110 Q45,110 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,110 L55,110 L45,100" color="cyan" :duration="2.5" />
    </svg>
    <FlowBadge text=" Nak → fila persiste" icon="i-ph-arrow-counter-clockwise-fill" color="cyan" position="left-100px bottom-15px" size="xs" />
    <FlowBadge text=" persistida em disco" icon="i-ph-hard-drives-fill" color="cyan" position="left-0 top-2" bordered size="xs" />
    <FlowBadge text=" 5s → 30s → 2min..." icon="i-ph-timer-fill" color="slate" position="left-100px bottom-30px" size="xs" />
  </div>
  <div v-click="2" class="anim-seg">
    <FlowNode label="EME4 2" icon="i-carbon-bare-metal-server-02" color="cyan" position="eme4-bottom" sub=" voltou" subIcon="i-ph-arrow-up-fill" recover hint="<strong>EME4 2 — Recuperado</strong><br>Voltou ao ar automaticamente<br>Mensagens da fila são processadas<br>Zero intervenção manual" />
  </div>
  <div v-click="3" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M340,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L430,105" color="fuchsia" :duration="3" />
      <path d="M420,120 Q420,120 406,120 L265,120 Q250,120 250,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,112 L420,120 L265,120 L250,100" color="cyan" :duration="2.5" />
      <path d="M250,100 Q250,120 235,120 L60,120 Q45,120 45,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M250,100 L250,120 L60,120 L45,100" color="cyan" :duration="2" :delay="1" />
    </svg>
    <FlowBadge text=" Sucesso" icon="i-ph-check-circle-fill" color="cyan" position="left-300px bottom-0" />
    <FlowBadge text=" Recuperação automática" icon="i-ph-check-circle-fill" color="cyan" position="left-420px bottom-13" bordered pulse />
    <FlowBadge text="Ack ✓" color="cyan" position="left-130px bottom-2px" size="xs" />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-2 max-w-580px mx-auto">
<div class="step-item-sm text-[0.58em] border-l-fuchsia-500 text-fuchsia-800 dark:text-pink-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-fuchsia-500/20 text-fuchsia-700 dark:text-pink-400"><span class="i-ph-x-circle-fill inline-block"></span></div>
  <div><strong>Ambos</strong> EME4 1 e EME4 2 estão fora — LB não tem para onde mandar</div>
</div>
<div v-click="1" class="step-item-sm text-[0.58em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">1</div>
  <div>Mensagem <strong>não se perde</strong> — NATS persiste em disco. Backoff: 5s → 30s → 2min...</div>
</div>
<div v-click="2" class="step-item-sm text-[0.58em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300">
  <div class="num-badge w-22px h-22px text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">2</div>
  <div>Minutos depois, <strong>EME4 2 é reiniciado</strong> e volta ao ar</div>
</div>
<div v-click="3" class="step-item-sm text-[0.58em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300 font-600">
  <div class="num-badge w-22px h-22px text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">3</div>
  <div><strong>Nenhuma mensagem se perdeu</strong> — EME4 2 responde sucesso → Worker faz Ack</div>
</div>
</div>

<div v-click="4" class="text-center mt-4 py-3 px-6 rounded-12px border-1.5 border-solid border-cyan-500/30 bg-cyan-500/8 max-w-400px mx-auto" v-motion :initial="{opacity:0, scale:0.9}" :enter="{opacity:1, scale:1, transition:{delay:300}}">
  <div class="text-[13px] font-700 text-slate-900 dark:text-white"><span class="i-ph-shield-check-fill text-cyan-600 dark:text-cyan-400 inline-block mr-4px"></span> LB + Retry = Zero mensagens perdidas</div>
  <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">LB previne · Retry recupera · Fila persiste</div>
</div>

<!--
- Cenário EXTREMO: ambos EME4 offline ao mesmo tempo
- Mensagem-chave para a diretoria: NENHUMA mensagem se perde
- NATS persiste em disco com backoff exponencial (5s, 30s, 2min)
- Quando qualquer EME4 volta, as mensagens são processadas automaticamente
- Sem intervenção manual, sem perda de dados
- Resumo: LB previne → Retry recupera → Fila persiste
-->
