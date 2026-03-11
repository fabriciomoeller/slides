---
layout: center
transition: slide-left
---

# Modelo Novo — Middleware

<div class="gradient-subtitle text-[1.1rem]">Dois modos que coexistem no mesmo Middleware</div>

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

<!--
- O Middleware oferece DOIS modos — não é "um ou outro", coexistem
- Passagem Direta: para sistemas que já falam a linguagem do EME4 (IA, dashboards)
- Com Tradutor: para sistemas legados que precisam de tradução DE-PARA
- O Worker só existe quando necessário — não é overhead permanente
-->

---
transition: slide-left
---

# <span class="i-ph-arrows-clockwise-bold inline-block text-fuchsia-400 align-middle"></span> Com Tradutor (Worker)

<div class="gradient-subtitle text-[0.9rem]">Quando há trabalho real — tradução, orquestração, garantia de entrega</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div class="anim-flow max-w-750px h-120px my-4" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <FlowNode label="ORIGEM" icon="i-ph-plugs-connected-fill" color="blue" position="top-50% -translate-y-50% left-0 w-88px h-52px" sub="ex: ERP" hint="Sistema externo que envia ou consulta dados no EME4 (ERP, Portal, App)" />
  <FlowNode label="KONG" icon="i-ph-shield-check-fill" color="violet" position="top-50% -translate-y-50% left-160px w-78px h-52px" sub="portaria" hint="API Gateway — valida credenciais, distribui carga e limita requisições abusivas" />
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="top-50% -translate-y-50% left-310px w-78px h-52px" sub="fila" hint="Message Broker — recebe mensagens e garante que não se percam (JetStream)" />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="top-50% -translate-y-50% left-465px w-88px h-52px" sub="tradutor" hint="Consome da fila e executa a lógica: transforma formatos (XML→JSON), mapeia campos (DE→PARA)" />
  <FlowNode label="EME4 1" v-click.hide="6" icon="i-carbon-bare-metal-server-02" color="cyan" position="top-4px left-630px w-88px h-38px" size="top" hint="Sistema provedor (destino). Recebe chamadas normais da API" />
  <FlowNode label="EME4 2" icon="i-carbon-bare-metal-server-02" color="cyan" position="bottom-4px left-630px w-88px h-38px" size="top" hint="Sistema provedor (destino). Recebe chamadas normais da API" />
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
    <FlowNode label="EME4 1" icon="i-ph-x-circle-fill" color="pink" position="top-4px left-630px w-88px h-38px z-5" size="top" hint="EME4 1 com erro — Worker devolve à fila (Nak) para retry automático" />
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
<div v-click="1" class="step-item-sm text-[0.60em] border-l-blue-500 text-blue-300">
  <div class="num-badge w-24px h-24px bg-blue-500/20">1</div>
  <div>Sistema externo envia os dados para o APIGATEWAY Kong/APISIX</div>
</div>
<div v-click="2" class="step-item-sm text-[0.60em] border-l-violet-500 text-violet-300">
  <div class="num-badge w-24px h-24px bg-violet-500/20 text-purple-300">2</div>
  <div>Kong/APISIX autentica e coloca a mensagem na fila (NATS JetStream)</div>
</div>
<div v-click="3" class="step-item-sm text-[0.60em] border-l-cyan-500 text-cyan-300 font-600">
  <div class="num-badge w-24px h-24px bg-cyan-500/20 text-cyan-400">3</div>
  Sistema origem recebe "Recebido!" (202 Accepted) e segue em frente.<br> Desacoplamento total para enviar outras mensagens
</div>
<div v-click="4" class="step-item-sm text-[0.60em] border-l-fuchsia-500 text-fuchsia-300">
  <div class="num-badge w-24px h-24px bg-fuchsia-500/20 text-fuchsia-400">4</div>
  <div>Worker pega da fila e traduz campos (DE-PARA: SG1 → ListaMateriaisProduto)</div>
</div>
<div v-click="5" class="step-item-sm text-[0.60em] border-l-fuchsia-500 text-fuchsia-300">
  <div class="num-badge w-24px h-24px bg-fuchsia-500/20 text-fuchsia-400">5</div>
  <div>Load Balancer escolhe a melhor instância do EME4 (menos ocupada)</div>
</div>
<div v-click="6" class="step-item-sm text-[0.60em] border-l-cyan-500 text-cyan-300">
  <div class="num-badge w-24px h-24px bg-cyan-500/20 text-cyan-400">6</div>
  <div>Se der erro → Worker devolve à fila (<strong>Nak</strong>) → NATS retenta com backoff exponencial</div>
</div>
</div>

<!--
- Este é o fluxo COMPLETO do modo com tradutor — o coração da POC
- Passo 3 é o mais importante: o sistema origem recebe 202 e SEGUE EM FRENTE
- Desacoplamento total: quem envia não precisa esperar o processamento
- Worker faz a tradução DE-PARA (ex: campo SG1 vira ListaMateriaisProduto)
- Se der erro, NATS garante retry com backoff exponencial (5s, 30s, 2min...)
- Nenhuma mensagem se perde
-->
