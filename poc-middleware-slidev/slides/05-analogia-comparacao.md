---
transition: slide-left
---

# Analogia: O Restaurante

<div class="accent-bar accent-bar-pink">
  Modelo Atual: o cliente vai direto à cozinha — sem garçom, sem comanda
</div>

<ScenarioFlow>
  <FlowNode label="Cliente" icon="i-ph-user-fill" color="blue" position="top-50% -translate-y-50% left-0 w-90px h-56px" />
  <FlowNode v-click.hide="2" label="Cozinheiro" icon="i-ph-cooking-pot-fill" color="cyan" position="top-50% -translate-y-50% left-420px w-100px h-56px" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="420" y2="70" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M100,70 L420,70" color="blue" :duration="3.5" />
    </svg>
    <FlowBadge text=" direto / bloqueante" icon="i-ph-arrow-right-fill" color="blue" position="left-180px top-50px" bordered />
  </div>
  <div v-click="1" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <FlowDot d="M100,70 L420,70" color="blue" :duration="4" :delay="1" />
    </svg>
    <FlowBadge text=" Esperando o prato..." icon="i-ph-hourglass-fill" color="pink" position="left-200px top-15px" bordered />
    <FlowBadge text=" 50 clientes na fila" icon="i-ph-users-three-fill" color="pink" position="left-200px bottom-15px" bordered />
  </div>
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


<div v-click="3" class="accent-bar accent-bar-cyan mt-2">
  Modelo Novo: garçom anota, comanda na fila, cozinheiro prepara — ninguém espera
</div>

<ScenarioFlow v-click="3">
  <FlowNode label="Cliente" icon="i-ph-user-fill" color="blue" position="top-50% -translate-y-50% left-0 w-78px h-56px" />
  <FlowNode label="Garçom" icon="i-ph-user-circle-fill" color="fuchsia" position="top-50% -translate-y-50% left-140px w-80px h-56px" sub="anota" />
  <FlowNode label="Comanda" icon="i-ph-clipboard-text-fill" color="cyan" position="top-50% -translate-y-50% left-280px w-80px h-56px" sub="fila" persist />
  <FlowNode label="Cozinheiro 1" color="cyan" position="top-6px left-430px w-95px h-42px" sub=" ativo" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="Cozinheiro 2" color="cyan" position="bottom-6px left-430px w-95px h-42px" sub=" ativo" subIcon="i-svg-spinners-pulse-3" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="80" y1="70" x2="140" y2="70" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M82,70 L140,70" color="blue" :duration="1.5" />
      <FlowDot d="M82,70 L140,70" color="blue" :duration="1.5" :delay="0.8" />
    </svg>
    <FlowBadge text=" Cliente pede" icon="i-ph-chat-circle-text-fill" color="blue" position="left-70px top-22px"  />
  </div>
  <div v-click="4" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="222" y1="70" x2="280" y2="70" class="svg-line svg-stroke-fuchsia"/>
      <FlowDot d="M224,70 L280,70" color="fuchsia" :duration="1.5" />
      <FlowDot d="M224,70 L280,70" color="fuchsia" :duration="1.5" :delay="0.8" />
    </svg>
    <FlowBadge text=" Garçom coloca na fila" icon="i-ph-clipboard-text-fill" color="fuchsia" position="left-190px top-22px"  />
  </div>
  <div v-click="5" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M362,70 L390,70 Q400,70 400,63 L400,42 Q400,35 410,35 L430,35" class="svg-line svg-stroke-cyan"/>
      <path d="M362,70 L390,70 Q400,70 400,77 L400,98 Q400,105 410,105 L430,105" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M362,70 L390,70 Q400,70 400,63 L400,42 Q400,35 410,35 L435,35" color="cyan" :duration="2" />
      <FlowDot d="M362,70 L390,70 Q400,70 400,77 L400,98 Q400,105 410,105 L435,105" color="cyan" :duration="2.5" :delay="1" />
    </svg>
    <FlowBadge text=" Cozinheiro pega" icon="i-ph-cooking-pot-fill" color="cyan" position="left-325px top-22px" />
  </div>
  <div v-click="6" class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <path d="M430,20 L325,20 Q310,20 310,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M435,28 L435,20 L325,20 L310,40" color="cyan" :duration="2" />
      <path d="M430,120 L325,120 Q310,120 310,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M435,112 L435,120 L325,120 L310,100" color="cyan" :duration="2" :delay="0.5" />
      <path d="M310,40 Q310,20 295,20 L50,20 Q35,20 35,40" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M310,40 L310,20 L50,20 L35,40" color="cyan" :duration="2" :delay="1.5" />
      <path d="M310,100 Q310,120 295,120 L50,120 Q35,120 35,100" class="svg-line-return svg-stroke-cyan"/>
      <FlowDot d="M310,100 L310,120 L50,120 L35,100" color="cyan" :duration="2" :delay="2" />
    </svg>
    <FlowBadge text=" Pronto!" icon="i-ph-check-circle-fill" color="cyan" position="left-350px bottom-0" />
    <FlowBadge text=" Nenhum pedido perdido" icon="i-ph-shield-check-fill" color="cyan" position="right-10 bottom-15" bordered pulse />
  </div>
</ScenarioFlow>

<div class="flex flex-col gap-1 max-w-580px mx-auto">
<div v-click="3" class="flex items-center gap-2 py-1 px-3 rounded-[10px] border-l-3 border-l-solid text-[0.52em] bg-slate-800/40 border-l-fuchsia-500 text-fuchsia-300">
  <div class="w-18px h-18px rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-700 shrink-0 text-[9px]">1</div>
  <div><strong>Cliente</strong> pede → <strong>Garçom</strong> anota e coloca na comanda (fila) — cliente não espera</div>
</div>
<div v-click="5" class="flex items-center gap-2 py-1 px-3 rounded-[10px] border-l-3 border-l-solid text-[0.52em] bg-slate-800/40 border-l-cyan-500 text-cyan-300 font-600">
  <div class="w-18px h-18px rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-700 shrink-0 text-[9px]">2</div>
  <div><strong>Cozinheiro</strong> pega a comanda e prepara — nenhum pedido se perde</div>
</div>
</div>

<!--
- Analogia para a diretoria entender sem jargão técnico
- Modelo atual = cliente vai direto à cozinha (bloqueante, sem redundância)
- Se a cozinha pega fogo, pedido perdido
- Modelo novo = cliente → garçom → comanda (fila) → cozinheiro pega
- Click 3: cliente faz o pedido ao garçom (é liberado, não espera)
- Click 4: garçom anota e coloca na comanda (fila)
- Click 5: cozinheiro pega a primeira comanda e prepara
- Click 6: pronto! — entrega feita, nenhum pedido perdido
-->

---
transition: slide-up
---

<div class="text-center" v-motion :initial="{opacity:0, y:-15}" :enter="{opacity:1, y:0, transition:{delay:100}}">
  <div class="text-[18px] font-bold text-white">Como funcionaria com o MIDDLEWARE</div>
  <div class="text-[11px] text-gray-400">Dois modos: o Worker só existe quando há trabalho a fazer</div>
</div>

<div class="accent-bar accent-bar-cyan mt-1">
  <span class="i-ph-arrow-right-bold inline-block text-cyan-400 align-middle"></span> Passagem direta — sem fila, sem tradutor, rápido
</div>

<ScenarioFlow>
  <FlowNode label="Agente IA" icon="i-carbon-bot" color="blue" position="top-50% -translate-y-50% left-0 w-90px h-56px" sub="(futuro)" />
  <FlowNode label="Kong" icon="i-ph-shield-check-fill" color="purple" position="top-50% -translate-y-50% left-200px w-95px h-56px" sub="Auth + LB" />
  <FlowNode label="EME4 1" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-blue"/>
      <FlowDot d="M100,70 L210,70" color="blue" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="blue" :duration="2" :delay="1" />
    </svg>
  </div>
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

<div v-click="1" class="accent-bar accent-bar-fuchsia mt-0">
  <span class="i-ph-arrows-clockwise-bold inline-block text-fuchsia-400 align-middle"></span> Com Worker — fila + tradução + retry automático
</div>

<ScenarioFlow v-click="1">
  <FlowNode label="NATS" icon="i-ph-cloud-arrow-up-fill" color="cyan" position="nats" sub="fila" persist />
  <FlowNode label="Worker" icon="i-ph-gear-six-fill" color="fuchsia" position="worker" sub="traduz DE→PARA" />
  <FlowNode label="EME4 1" color="cyan" position="eme4-top" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <FlowNode label="EME4 2" color="cyan" position="eme4-bottom" sub=" online" subIcon="i-svg-spinners-pulse-3" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 580 140">
      <line x1="92" y1="70" x2="200" y2="70" class="svg-line svg-stroke-cyan"/>
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" />
      <FlowDot d="M100,70 L210,70" color="cyan" :duration="2" :delay="1" />
    </svg>
    <FlowBadge text=" ERP Externo → Kong →" icon="i-ph-plugs-connected-fill" color="blue" position="left-0 top-0" bordered size="xs" />
  </div>
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

<v-click>
<div class="flex justify-center gap-2 mt-1" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:300}}">
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-cyan-500/20"><div class="text-cyan-400 text-[9px] font-700"><span class="i-ph-lightning-fill inline-block mr-2px"></span> Load Balancing</div><div class="text-[7px] text-slate-400">Distribui carga</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-purple-500/20"><div class="text-purple-400 text-[9px] font-700"><span class="i-ph-shield-check-fill inline-block mr-2px"></span> Failover</div><div class="text-[7px] text-slate-400">Servidor cai, outro assume</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-blue-500/20"><div class="text-blue-400 text-[9px] font-700"><span class="i-ph-lock-key-fill inline-block mr-2px"></span> Auth Centralizada</div><div class="text-[7px] text-slate-400">Uma porta de entrada</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-cyan-500/20"><div class="text-cyan-400 text-[9px] font-700"><span class="i-ph-chart-line-up-fill inline-block mr-2px"></span> Rastreabilidade</div><div class="text-[7px] text-slate-400">Tudo registrado</div></div>
  <div class="text-center px-2 py-1 rounded-8px bg-slate-800/40 border border-fuchsia-500/20"><div class="text-fuchsia-400 text-[9px] font-700"><span class="i-ph-heartbeat-fill inline-block mr-2px"></span> Resiliência</div><div class="text-[7px] text-slate-400">Nenhum dado se perde</div></div>
</div>
</v-click>

<!--
- Visão consolidada dos dois modos do Middleware funcionando
- Modo 1 (Passagem Direta): IA e dashboards falam direto via Kong — rápido e sem overhead
- Modo 2 (Com Worker): ERP externo usa fila + tradução — seguro e desacoplado
- Cinco benefícios principais: LB, Failover, Auth, Rastreabilidade, Resiliência
-->

---
transition: slide-left
---

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

<!--
- Slide de comparação direta para a diretoria tomar decisão
- Cada item aparece lado a lado: problema atual vs. solução com middleware
- Ponto-chave: desacoplamento — cada sistema evolui independentemente
- Mensagem final: zero perda de dados, failover automático, evolução independente
-->
