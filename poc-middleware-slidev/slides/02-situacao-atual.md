---
transition: fade-out
---

# Como funciona HOJE

<div class="gradient-subtitle text-[0.9rem]">Modelo Direto — API para API — "Ligação telefônica"</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div class="anim-flow max-w-700px h-100px my-10" v-motion :initial="{opacity:0}" :enter="{opacity:1, transition:{delay:200, duration:600}}">
  <div class="anim-node left-0 w-130px px-20px py-12px bg-white dark:bg-[rgba(30,58,95,0.9)] border-blue-500/60 text-blue-700 dark:text-blue-300 text-13px shadow-[0_0_20px_rgba(59,130,246,0.15)]">
    <span class="i-ph-plugs-connected-fill text-2xl mb-1 inline-block"></span>
    <div class="font-bold text-base">Sistema Externo</div>
    <div class="text-xs opacity-40">(ex: ERP, IA, etc.)</div>
  </div>
  <div class="absolute left-50% top-2px -translate-x-50% font-mono text-10px text-slate-500 dark:text-slate-400 opacity-70 whitespace-nowrap z-3">POST /Incluir_API</div>
  <div class="anim-node right-0 w-130px px-20px py-12px bg-white dark:bg-[rgba(10,50,60,0.9)] border-cyan-500/70 text-cyan-700 dark:text-cyan-300 text-13px shadow-[0_0_20px_rgba(6,182,212,0.15)]">
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
<div class="card-header text-fuchsia-700 dark:text-pink-400">Problemas</div>
<div class="card-body">

- Sistema origem fica **travado** esperando
- Se EME4 cai, **tudo para**
- Sem retry automático
- Servidor único = **ponto único de falha**
- Sem distribuição de carga

</div>
</div>
<div class="info-card">
<div class="card-header text-gray-700 dark:text-gray-300">500 OPs de uma vez</div>
<div class="card-body">

- Envia **uma por uma**, esperando
- Se a 300ª falhar, as 200 **param**
- EME4 pode **sobrecarregar**
- **Lento e frágil**

</div>
</div>
</div>

<!--
- Hoje a integração é DIRETA: sistema externo chama API do EME4
- Analogia: "ligação telefônica" — quem liga fica esperando
- Problemas principais: ponto único de falha, sem retry, sem distribuição de carga
- Se EME4 cai ou demora, o sistema origem fica travado
- 500 OPs = sequencial, uma por uma, frágil
-->

---
transition: slide-up
---

# O fluxo passo a passo (Hoje)

<div class="gradient-subtitle text-[0.9rem]">O sistema externo fica bloqueado até o EME4 responder</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>

<div class="flex flex-col gap-2 max-w-700px mx-auto my-10">


<div class="step-item text-[0.65em] border-l-blue-500 text-blue-700 dark:text-blue-300">
  <div class="num-badge w-28px h-28px text-[0.85em] bg-blue-500/20 text-blue-600 dark:text-blue-400">1</div>
  <div>Sistema externo monta o JSON com os dados (ex: OP, cadastro)</div>
</div>

<div class="step-item text-[0.65em] border-l-blue-500 text-blue-700 dark:text-blue-300">
  <div class="num-badge w-28px h-28px text-[0.85em] bg-blue-500/20 text-blue-600 dark:text-blue-400">2</div>
  <div>Faz chamada HTTP direta: <code>POST /DoctoOrdProducaoManufatura/Incluir_API</code></div>
</div>

<div class="step-item text-[0.65em] border-l-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300">
  <div class="num-badge w-28px h-28px text-[0.85em] bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400">3</div>
  <div>Sistema origem <strong>AGUARDA...</strong> 2s, 5s, 10s, timeout?</div>
</div>

<div class="step-item text-[0.65em] border-l-cyan-500 text-cyan-700 dark:text-cyan-300">
  <div class="num-badge w-28px h-28px text-[0.85em] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">4</div>
  <div>EME4 responde: <code>{ "Sucesso": true }</code></div>
</div>

<div class="step-item text-[0.65em] border-l-fuchsia-500 text-fuchsia-800 dark:text-pink-300">
  <div class="num-badge w-28px h-28px text-[0.85em] bg-fuchsia-500/20 text-fuchsia-800 dark:text-pink-300 animate-[pulseAlert_1.5s_ease-in-out_infinite]"><span class="i-ph-warning-diamond-fill inline-block"></span></div>
  <div>Se EME4 estiver fora → <strong>ERRO!</strong> Dados podem se perder</div>
</div>


</div>

<div class="mt-6 p-4 rounded-xl text-center text-sm result-bad" v-motion :initial="{opacity:0, y:10}" :enter="{opacity:1, y:0, transition:{delay:800}}">
  <span class="text-fuchsia-700 dark:text-pink-400 font-semibold">Total para 3 OPs:</span> 16 segundos (com 1 erro) — tudo sequencial, um esperando o outro
</div>

<!--
- Passo a passo do modelo atual para a diretoria entender o problema
- Ponto-chave: o sistema origem fica BLOQUEADO esperando resposta
- Se o EME4 demora ou cai, dados podem se perder
- 16 segundos para 3 OPs com 1 erro — inaceitável em produção
-->
