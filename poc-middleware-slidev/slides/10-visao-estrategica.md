---
transition: slide-left
---

# Visão Estratégica: O Middleware como base para IA

<div class="gradient-divider mx-auto mt-2 mb-2"></div>

<div class="ve-timeline" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:300}}">
  <div class="ve-tl-line"></div>
  <div class="ve-tl-phases">
    <div class="ve-phase">
      <div class="ve-phase-label text-blue-600 dark:text-blue-400">POC (agora)</div>
      <div class="ve-dot ve-dot-blue">1</div>
    </div>
    <div class="ve-phase">
      <div class="ve-phase-label text-purple-600 dark:text-purple-400">Fase 2</div>
      <div class="ve-dot ve-dot-purple">2</div>
    </div>
    <div class="ve-phase">
      <div class="ve-phase-label text-cyan-600 dark:text-cyan-400">Fase 3 (IA)</div>
      <div class="ve-dot ve-dot-cyan">3</div>
    </div>
  </div>
</div>

<div class="ve-phase-cards">
  <div class="ve-pcard ve-pcard-blue" v-motion :initial="{opacity:0, y:15}" :enter="{opacity:1, y:0, transition:{delay:100}}">
    <div class="text-gray-700 dark:text-gray-300 text-[11px]">Outro Sistema ↔ EME4</div>
    <div class="text-gray-500 text-[10px]">Engenharia + OPs</div>
    <div class="text-blue-600 dark:text-blue-400 font-semibold text-[12px] mt-1">Centenas/dia</div>
  </div>
  <div class="ve-pcard ve-pcard-purple" v-motion :initial="{opacity:0, y:15}" :enter="{opacity:1, y:0, transition:{delay:150}}">
    <div class="text-gray-700 dark:text-gray-300 text-[11px]">+ Outros módulos EME4</div>
    <div class="text-gray-500 text-[10px]">+ Sistemas Datainfo</div>
    <div class="text-purple-600 dark:text-purple-400 font-semibold text-[12px] mt-1">Milhares/dia</div>
  </div>
  <div class="ve-pcard ve-pcard-cyan" v-motion :initial="{opacity:0, y:15}" :enter="{opacity:1, y:0, transition:{delay:100}}">
    <div class="text-gray-700 dark:text-gray-300 text-[11px]">+ Agentes de IA</div>
    <div class="text-gray-500 text-[10px]">consultando e atuando em todos os sistemas</div>
    <div class="text-cyan-600 dark:text-cyan-400 font-semibold text-[12px] mt-1">Dezenas de milhares/dia</div>
  </div>
</div>

<div class="text-center mt-3 mb-1" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:300, duration:300}}">
  <div class="text-slate-900 dark:text-white font-semibold text-[14px]">Futuro: Uma porta única para todos os sistemas</div>
</div>

<div class="scenario-flow-arch my-2" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:500,duration:600}}">
  <FlowNode label="Agentes IA" icon="i-carbon-bot" color="blue" position="top-6px left-0 w-88px h-34px" size="sm" hint="<strong>Agentes de IA</strong> (futuro)<br>Consultam todos os sistemas via porta única<br>Sem saber a auth de cada sistema" />
  <FlowNode label="ERP Externo" icon="i-ph-plugs-connected-fill" color="blue" position="top-48px left-0 w-95px h-34px" size="sm" hint="<strong>ERP Externo</strong><br>Sistema externo que envia ou consulta dados<br>Ex: ERP, Portal, App Mobile" />
  <FlowNode label="Portal Cloud" icon="i-carbon-cloud" color="blue" position="top-90px left-0 w-88px h-34px" size="sm" hint="<strong>Portal Cloud</strong> (futuro)<br>Acesso via middleware a todos os sistemas<br>Autenticação centralizada" />
  <FlowNode label="Dashboard" icon="i-ph-chart-line-up-fill" color="blue" position="top-132px left-0 w-88px h-34px" size="sm" hint="<strong>Dashboards</strong> (futuro)<br>Dados em tempo real de todos os sistemas<br>Via passagem direta pelo Kong" />
  <div class="absolute top-50% -translate-y-50% left-230px w-160px h-130px rounded-14px border-2 border-solid border-purple-500/40 bg-purple-500/10 flex flex-col items-center justify-center z-2 gap-2px" style="animation: natsPersistGlow 3s ease-in-out infinite">
    <span class="i-ph-shield-check-fill text-purple-600 dark:text-purple-400 text-lg inline-block"></span>
    <div class="text-slate-900 dark:text-white font-700 text-12px">MIDDLEWARE</div>
    <div class="text-purple-600 dark:text-purple-400 text-[9px]">Kong/APISIX + NATS</div>
    <div class="text-gray-500 dark:text-gray-400 text-[8px]">Auth | LB | Fila | Tradução</div>
  </div>
  <FlowNode label="EME4" icon="i-ph-buildings-fill" color="cyan" position="top-6px left-530px w-88px h-34px" size="sm" hint="<strong>EME4</strong><br>ERP de manufatura da Datainfo<br>Principal sistema provedor da POC" />
  <FlowNode label="Gesti / Service" icon="i-ph-database-fill" color="cyan" position="top-48px left-530px w-88px h-34px" size="sm" hint="<strong>Gesti / Service</strong><br>Sistema interno da Datainfo<br>Futuro destino via middleware" />
  <FlowNode label="N8N" icon="i-carbon-chart-network" color="cyan" position="top-90px left-530px w-88px h-34px" size="sm" hint="<strong>N8N</strong> — Automação visual<br>Aqui como sistema provedor/destino<br>O middleware roteia mensagens para ele" />
  <FlowNode label="BRC / Previva" icon="i-ph-cube-fill" color="cyan" position="top-132px left-530px w-88px h-34px" size="sm" hint="<strong>Sistema Y</strong> (qualquer futuro)<br>O middleware conecta novos sistemas<br>Sem alterar os demais" />
  <div class="anim-seg">
    <svg class="anim-svg" viewBox="0 0 640 170">
      <line x1="90" y1="23" x2="230" y2="70" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <line x1="90" y1="65" x2="230" y2="78" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <line x1="90" y1="107" x2="230" y2="92" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <line x1="90" y1="149" x2="230" y2="100" class="svg-line svg-stroke-blue" style="opacity:0.4"/>
      <FlowDot d="M90,23 L230,70" color="blue" :duration="2.5" />
      <FlowDot d="M90,65 L230,78" color="blue" :duration="2.2" :delay="0.5" />
      <FlowDot d="M90,107 L230,92" color="blue" :duration="2.3" :delay="1" />
      <FlowDot d="M90,149 L230,100" color="blue" :duration="2.5" :delay="1.5" />
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

<div class="info-card info-card-pink mx-auto mt-0 w-190" v-motion :initial="{opacity:0, scale:0.9}" :enter="{opacity:1, scale:1, transition:{delay:800, duration:400}}">
  <div class="card-header text-fuchsia-800 dark:text-pink-300 text-0.8em">Por que IA precisa de Middleware?</div>
  <div class="card-body text-[0.65rem]">
    <div>→ Agente fala com <strong>uma porta única</strong> em vez de conhecer cada sistema</div>
    <div>→ Sem precisar saber a autenticação de cada sistema (sessão, token, API key...)</div>
    <div>→ Alto volume: centenas de consultas por minuto para montar análises completas</div>
  </div>
</div>

<!--
- Visão de 3 fases: POC agora → expansão → IA
- A POC é o primeiro passo de algo muito maior
- Fase 2: expandir para outros módulos EME4 e sistemas Datainfo
- Fase 3: agentes de IA consultando todos os sistemas via porta única
- IA precisa de Middleware: auth centralizada, alto volume, sem conhecer cada sistema
- Diagrama fan-in/fan-out mostra a arquitetura futura completa
-->
