---
transition: slide-left
---

# Por que confiamos nessas tecnologias?

<div class="gradient-subtitle text-[0.9rem]">Números reais das tecnologias escolhidas para o Middleware</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div v-click class="flex justify-center gap-4 flex-wrap my-4">
  <div class="stat-card stat-glow-cyan">
    <div class="stat-value text-cyan-400">2 milhões</div>
    <div class="stat-label">mensagens processadas<br><strong>por segundo</strong> (NATS, 1 servidor)</div>
  </div>
  <div class="stat-card stat-glow-blue">
    <div class="stat-value text-blue-400">50 a 150 mil</div>
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

<div v-click class="grid grid-cols-3 gap-4 mt-7">
  <div class="info-card border-cyan-500/20 p-14px">
    <div class="card-header text-cyan-400">NATS</div>
    <div class="card-body text-[0.78rem]">
      <div>→ Escrito em Go (Google)</div>
      <div>→ Tesla, Mastercard, Walmart</div>
      <div>→ CNCF (fundação do Kubernetes)</div>
      <div>→ Um executável de 20 MB, sem dependências</div>
    </div>
  </div>
  <div class="info-card border-violet-500/20 p-14px">
    <div class="card-header text-purple-400">Kong / APISIX</div>
    <div class="card-body text-[0.78rem]">
      <div>→ Construído sobre <strong>NGINX</strong></div>
      <div>→ NGINX serve 30% da internet mundial</div>
      <div>→ Netflix, Samsung, NASA usam</div>
      <div>→ LB + Auth + Failover + Logs inclusos</div>
    </div>
  </div>
  <div class="info-card border-cyan-500/20 p-14px">
    <div class="card-header text-cyan-400">Infraestrutura Total</div>
    <div class="card-body text-[0.78rem]">
      <div>→ <strong>2 GB</strong> RAM total</div>
      <div>→ 6 vCPU</div>
      <div>→ ~50 GB de disco</div>
      <div>→ Cabe em qualquer VM ou container</div>
    </div>
  </div>
</div>

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good">
  <span class="text-cyan-300">Nosso volume atual é de ~500 mil mensagens <strong>por dia</strong>.</span> <br>
  <span class="opacity-50"> Um único servidor NATS já processa 2 milhões msg/s — e escala linearmente em cluster.</span> <br>
  <span class="opacity-50 text-xs"><span class="i-ph-info-bold inline-block align-middle text-fuchsia-400 text-lg"></span> Com JetStream (persistência), o throughput é de ~1,2M msg/s por servidor</span>
</div>

<!--
- Números concretos para dar confiança à diretoria
- NATS: 2M msg/s com apenas 18MB de RAM — extremamente eficiente
- Kong/APISIX: construído sobre NGINX que serve 30% da internet
- Empresas que usam: Tesla, Mastercard, Walmart, Netflix, Samsung, NASA
- Nosso volume (500K msg/dia) é MUITO abaixo da capacidade do NATS
- Infraestrutura total: 2GB RAM, 6 vCPU — cabe em qualquer VM
-->

---
transition: slide-left
---

# NATS — Publish / Subscribe

<div class="gradient-subtitle text-[0.9rem]">Como o NATS distribui mensagens — o motor por trás do Middleware</div>
<div class="gradient-divider mx-auto mt-2 mb-2"></div>

<div class="text-center text-[11px] text-slate-400 mb-1"><span class="i-ph-broadcast-fill inline-block mr-1 text-cyan-400"></span> subject: <span class="text-cyan-300 font-600">eme4.op.criar</span></div>

<div class="scenario-flow-tall my-3" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <FlowNode label="ERP Externo" icon="i-ph-plugs-connected-fill" color="blue" position="top-50% -translate-y-50% left-0 w-90px h-56px" sub="Publisher" />
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="top-50% -translate-y-50% left-200px w-95px h-56px" sub="JetStream" persist />
  <FlowNode label="Worker 1" icon="i-ph-gear-six-fill" color="fuchsia" position="top-2px left-420px w-100px h-42px" sub="Subscriber" size="top" />
  <FlowNode label="Worker 2" icon="i-ph-gear-six-fill" color="cyan" position="top-50% -translate-y-50% left-420px w-100px h-42px" sub="Subscriber" size="top" />
  <FlowNode label="Monitor" icon="i-carbon-dashboard" color="cyan" position="bottom-2px left-420px w-100px h-42px" sub="Subscriber" size="top" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 180">
      <line x1="92" y1="90" x2="200" y2="90" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M100,90 L210,90" color="blue" :duration="2" />
      <FlowDot d="M100,90 L210,90" color="blue" :duration="2" :delay="0.8" />
      <FlowDot d="M100,90 L210,90" color="blue" :duration="2" :delay="1.6" />
    </svg>
  </div>
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 180">
      <path d="M300,90 L360,90 Q370,90 370,75 L370,35 Q370,25 380,25 L420,25" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M310,90 L360,90 Q370,90 370,75 L370,35 Q370,25 380,25 L430,25" color="fuchsia" :duration="2.5" />
      <line x1="300" y1="90" x2="420" y2="90" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M310,90 L430,90" color="cyan" :duration="2" :delay="0.3" />
      <path d="M300,90 L360,90 Q370,90 370,105 L370,145 Q370,155 380,155 L420,155" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M310,90 L360,90 Q370,90 370,105 L370,145 Q370,155 380,155 L430,155" color="cyan" :duration="2.5" :delay="0.6" />
    </svg>
    <FlowBadge text=" fan-out" icon="i-ph-arrows-split" color="cyan" position="left-310px top-100px" bordered />
  </div>
  <div v-click="2" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 180">
      <path d="M420,10 L270,10 Q255,10 255,30" class="svg-line-return svg-stroke-fuchsia"/>
      <FlowDot d="M420,10 L270,10 L255,30" color="fuchsia" :duration="2.5" />
      <path d="M420,105 L310,105 Q300,105 300,95" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M420,105 L310,105 L300,95" color="cyan" :duration="2.2" :delay="0.4" />
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

<!--
- Demonstração visual de como o Pub/Sub funciona
- 1 publish → N subscribers recebem em paralelo (fan-out)
- Subject-based: "eme4.op.criar" — organização por domínio
- JetStream garante persistência — mensagens não se perdem
- Latência de 0,2ms — praticamente instantâneo
- O publisher não precisa saber quem está ouvindo (desacoplamento total)
-->
