---
transition: slide-left
---

# E o N8N? Onde ele se encaixa?

<div class="gradient-subtitle text-[0.9rem]">Cada ferramenta tem seu lugar no ecossistema</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div class="grid grid-cols-2 gap-6 mt-2">

<div>
  <div class="accent-bar accent-bar-fuchsia mb-3">
    <span class="i-carbon-chart-network inline-block text-fuchsia-600 dark:text-fuchsia-400 align-middle mr-1"></span> N8N é um <strong>orquestrador visual</strong> de workflows
  </div>

  <div class="flex flex-col gap-2">
    <div v-click class="flex items-start gap-2 p-2.5 rounded-lg bg-fuchsia-500/8 border border-solid border-fuchsia-500/20">
      <span class="i-ph-check-circle-fill text-fuchsia-600 dark:text-fuchsia-400 text-base inline-block mt-0.5 shrink-0"></span>
      <div>
        <div class="text-fuchsia-700 dark:text-fuchsia-300 font-600 text-[11px]">Pode ser um Worker</div>
        <div class="text-[10px] text-slate-500 dark:text-slate-400">Consome webhooks, transforma dados, chama APIs — como qualquer Worker</div>
      </div>
    </div>
    <div v-click class="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-500/8 border border-solid border-cyan-500/20">
      <span class="i-ph-check-circle-fill text-cyan-600 dark:text-cyan-400 text-base inline-block mt-0.5 shrink-0"></span>
      <div>
        <div class="text-cyan-700 dark:text-cyan-300 font-600 text-[11px]">Pode ser um Sistema Provedor</div>
        <div class="text-[10px] text-slate-500 dark:text-slate-400">O middleware roteia mensagens para ele, como faz com EME4, Gesti ou qualquer outro</div>
      </div>
    </div>
    <div v-click class="flex items-start gap-2 p-2.5 rounded-lg bg-fuchsia-500/8 border border-solid border-fuchsia-500/20">
      <span class="i-ph-x-circle-fill text-fuchsia-700 dark:text-pink-400 text-base inline-block mt-0.5 shrink-0"></span>
      <div>
        <div class="text-fuchsia-800 dark:text-pink-300 font-600 text-[11px]">Não substitui o API Gateway</div>
        <div class="text-[10px] text-slate-500 dark:text-slate-400">Sem rate limiting real, sem LB nativo, sem plugins de auth enterprise</div>
      </div>
    </div>
    <div v-click class="flex items-start gap-2 p-2.5 rounded-lg bg-fuchsia-500/8 border border-solid border-fuchsia-500/20">
      <span class="i-ph-x-circle-fill text-fuchsia-700 dark:text-pink-400 text-base inline-block mt-0.5 shrink-0"></span>
      <div>
        <div class="text-fuchsia-800 dark:text-pink-300 font-600 text-[11px]">Não substitui o Message Broker</div>
        <div class="text-[10px] text-slate-500 dark:text-slate-400">Sem filas persistentes em disco, sem fan-out nativo, sem garantia at-least-once em crash</div>
      </div>
    </div>
  </div>
</div>

<div>
  <div v-click="1" class="accent-bar accent-bar-cyan mb-3">
    <span class="i-ph-map-trifold-fill inline-block text-cyan-600 dark:text-cyan-400 align-middle mr-1"></span> Onde cada um vive no middleware
  </div>

  <div v-click="1" class="relative p-3 rounded-xl bg-white shadow-sm dark:shadow-none dark:bg-slate-800/40 border border-solid border-slate-600/20">
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center gap-3">
        <div class="w-28 shrink-0 flex items-center gap-1.5">
          <span class="i-ph-shield-check-fill text-purple-600 dark:text-purple-400 inline-block"></span>
          <span class="text-[11px] text-purple-700 dark:text-purple-300 font-600">Kong</span>
        </div>
        <div class="flex-1 h-5 rounded-md bg-purple-500/15 border border-solid border-purple-500/25 flex items-center px-2">
          <span class="text-[9px] text-purple-700 dark:text-purple-300">Porta de entrada — auth, LB, rate limit</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-28 shrink-0 flex items-center gap-1.5">
          <span class="i-ph-cloud-arrow-up-fill text-cyan-600 dark:text-cyan-400 inline-block"></span>
          <span class="text-[11px] text-cyan-700 dark:text-cyan-300 font-600">NATS</span>
        </div>
        <div class="flex-1 h-5 rounded-md bg-cyan-500/15 border border-solid border-cyan-500/25 flex items-center px-2">
          <span class="text-[9px] text-cyan-700 dark:text-cyan-300">Sistema nervoso — filas, retry, fan-out</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-28 shrink-0 flex items-center gap-1.5">
          <span class="i-ph-gear-six-fill text-fuchsia-600 dark:text-fuchsia-400 inline-block"></span>
          <span class="text-[11px] text-fuchsia-700 dark:text-fuchsia-300 font-600">Workers</span>
        </div>
        <div class="flex-1 h-5 rounded-md bg-fuchsia-500/15 border border-solid border-fuchsia-500/25 flex items-center px-2">
          <span class="text-[9px] text-fuchsia-700 dark:text-fuchsia-300">Executores — transformação, chamadas</span>
        </div>
      </div>
      <div class="ml-28 pl-3 border-l-2 border-solid border-dashed border-fuchsia-500/30">
        <div class="flex items-center gap-3 mt-1">
          <div class="w-24 shrink-0 flex items-center gap-1.5">
            <span class="i-carbon-chart-network text-fuchsia-600 dark:text-fuchsia-400 inline-block"></span>
            <span class="text-[10px] text-fuchsia-700 dark:text-fuchsia-300">N8N</span>
          </div>
          <div class="flex-1 h-5 rounded-md bg-fuchsia-500/10 border border-dashed border-fuchsia-500/20 flex items-center px-2">
            <span class="text-[9px] text-fuchsia-600/70 dark:text-fuchsia-200/70">um tipo de Worker (visual/low-code)</span>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-1.5">
          <div class="w-24 shrink-0 flex items-center gap-1.5">
            <span class="i-ph-code-fill text-fuchsia-600 dark:text-fuchsia-400 inline-block"></span>
            <span class="text-[10px] text-fuchsia-700 dark:text-fuchsia-300">Serviço Go</span>
          </div>
          <div class="flex-1 h-5 rounded-md bg-fuchsia-500/10 border border-dashed border-fuchsia-500/20 flex items-center px-2">
            <span class="text-[9px] text-fuchsia-600/70 dark:text-fuchsia-200/70">um tipo de Worker (código)</span>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-1.5">
          <div class="w-24 shrink-0 flex items-center gap-1.5">
            <span class="i-ph-terminal-fill text-fuchsia-600 dark:text-fuchsia-400 inline-block"></span>
            <span class="text-[10px] text-fuchsia-700 dark:text-fuchsia-300">Script Python</span>
          </div>
          <div class="flex-1 h-5 rounded-md bg-fuchsia-500/10 border border-dashed border-fuchsia-500/20 flex items-center px-2">
            <span class="text-[9px] text-fuchsia-600/70 dark:text-fuchsia-200/70">um tipo de Worker (script)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</div>

<div v-click class="mt-4 p-3 rounded-xl text-center text-sm result-good">
  <span class="text-cyan-700 dark:text-cyan-300 font-semibold">N8N é um chef versátil — funciona bem num food truck.</span><br>
  <span class="opacity-50">Num restaurante com 500 mesas, ele pode ser um dos chefs. Não o restaurante inteiro.</span>
</div>

<!--
- Slide educativo que posiciona o N8N dentro do ecossistema middleware
- Abordagem não-confrontacional: "N8N tem seu lugar"
- Pode ser Worker (consome webhooks, transforma, chama APIs)
- Pode ser Sistema Provedor (middleware roteia para ele)
- NÃO substitui API Gateway (sem rate limiting, LB, auth enterprise)
- NÃO substitui Message Broker (sem filas persistentes, fan-out, garantia at-least-once)
- Diagrama mostra N8N como subtipo de Worker (ao lado de Go e Python)
- Analogia final: chef versátil no food truck vs restaurante com 500 mesas
-->
