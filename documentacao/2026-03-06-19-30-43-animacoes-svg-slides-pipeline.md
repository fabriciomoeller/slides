# 06/03/2026 - Animações SVG nos Slides de Pipeline (Slides 2 e 5)

## Contexto
- A apresentação Slidev precisava de animações visuais que demonstrassem o fluxo de dados entre blocos do pipeline, tanto no modelo atual (síncrono) quanto no modelo com Worker
- O slide 11 (NATS Pub/Sub) já possuía uma animação SVG de referência com dots viajando por linhas tracejadas
- O objetivo foi replicar e adaptar essa técnica nos slides 2 e 5 para reforçar visualmente os conceitos de comunicação síncrona vs assíncrona

## Implementação

### Arquivos modificados
- `poc-middleware-slidev/slides.md` — slides 2 e 5 (HTML/SVG)
- `poc-middleware-slidev/style.css` — classes `sync-*` e `wf-*` (~250 linhas adicionadas)

### Slide 2 — "Como funciona HOJE" (Comunicação Síncrona)

**O que foi feito:**
- Substituído o pipeline estático (seta `━━━━►` com `animate-pulse`) por um container SVG animado (`sync-flow`)
- Dois nós posicionados com `position: absolute` (Sistema Externo e EME4)
- Camada SVG sobreposta com linha tracejada e dots animados

**Comportamento da animação (ciclo de 8s):**
1. 3 dots azuis viajam da esquerda → direita (registros enviados com sucesso)
2. 1 dot rosa viaja até o meio e para — representando erro
3. Texto "✕ ERRO 500" aparece com flash no ponto de falha
4. Ciclo reinicia

**Classes CSS:** `sync-flow`, `sync-node`, `sync-node-blue`, `sync-node-cyan`, `sync-label`, `sync-svg`, `sync-path`, `sync-dot-ok`, `sync-dot-fail`, `sync-err-text`

**Keyframes:** `syncDotOk`, `syncDotErr`, `syncErrFlash`

### Slide 5 — "Modo 2: Com Tradutor (Worker)"

**O que foi feito:**
- Substituído o pipeline estático (flex com `pipe-node` e `pipe-arrow`) por container SVG animado (`wf-box`)
- 6 nós posicionados com `position: absolute`: ORIGEM, KONG, NATS, Worker, EME4 1, EME4 2
- Cada segmento de animação sincronizado com a mensagem correspondente via `v-click="N"` explícito
- Linhas de retorno (202 Accepted) com caminho retangular e cantos arredondados

**Sincronização v-click:**

| Click | Animação SVG | Mensagem |
|-------|-------------|----------|
| 1 | Dots azuis: ORIGEM → KONG | Sistema externo envia dados |
| 2 | Dots roxos: KONG → NATS | Kong autentica e coloca na fila |
| 3 | Linha de retorno KONG → ORIGEM + badge "✓ 202 Accepted" | Sistema recebe confirmação |
| 4 | Dots cyan: NATS → Worker | Worker pega da fila e traduz |
| 5 | Dots fuchsia alternados: Worker → EME4 1 / EME4 2 | Load Balancer distribui |
| 6 | Badge "retry" pulsante | Retry automático com backoff |

**Load Balancing visual (click 5):**
- 4 dots com delays escalonados (0s, 1.25s, 2.5s, 3.75s)
- Alternando entre `wfLbUp` (→ EME4 1) e `wfLbDown` (→ EME4 2)
- Cria o efeito visual de distribuição de carga round-robin

**Velocidades diferenciadas:**

| Trecho | Duração | Propósito |
|--------|---------|-----------|
| ORIGEM → KONG | 1.2s | Rápido — entrega instantânea |
| KONG → NATS | 1.2s | Rápido — sistema origem já liberado |
| NATS → Worker | 3.5s | Lento — processamento interno |
| Worker → EME4s | 5s | Mais lento — tradução + LB |

A diferença de velocidade comunica que do ORIGEM até o NATS a entrega é quase instantânea (o sistema emissor já foi liberado com 202), enquanto o processamento interno acontece no ritmo adequado sem pressionar o emissor.

**Classes CSS:** `wf-box`, `wf-node`, `wf-n-origin`, `wf-n-kong`, `wf-n-nats`, `wf-n-worker`, `wf-n-eme4a`, `wf-n-eme4b`, `wf-seg-layer`, `wf-svg`, `wf-line`, `wf-dot`, `wf-accepted`, `wf-retry-badge`

**Keyframes:** `wfSeg1`, `wfSeg2`, `wfSeg3`, `wfSeg4`, `wfLbUp`, `wfLbDown`, `wfAcceptedPulse`, `wfRetryPulse`, `dashFlowReturn`

## Técnica de Animação SVG

### Arquitetura geral

A técnica consiste em **sobrepor um SVG transparente** sobre nós HTML posicionados com `position: absolute` dentro de um container relativo:

```
┌─ Container (position: relative, largura fixa, altura fixa) ─┐
│                                                               │
│  [Nó A]  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  [Nó B]                  │
│     │         ← SVG overlay →          │                      │
│     │    (position: absolute, inset:0)  │                      │
│     │    <line> + <circle> animados     │                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 1. Container + Nós

```css
.container { position: relative; width: 750px; height: 110px; }
.node { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; }
```

Os nós ficam em `z-index: 2` para aparecer sobre o SVG.

### 2. Camada SVG

```css
.seg-layer { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.svg { width: 100%; height: 100%; }
```

O SVG usa `viewBox` com as mesmas dimensões do container, garantindo que as coordenadas SVG coincidam com os pixels CSS.

### 3. Linhas tracejadas animadas

```css
.line {
  fill: none;
  stroke-width: 1.5;
  stroke-dasharray: 6, 4;     /* tracejado: 6px traço, 4px espaço */
  opacity: 0.4;
  animation: dashFlowIn 1s linear infinite;
}
@keyframes dashFlowIn {
  0%   { stroke-dashoffset: 10; }  /* = dasharray total (6+4) */
  100% { stroke-dashoffset: 0; }
}
```

O `stroke-dashoffset` animado cria a ilusão de fluxo contínuo na direção desejada. Para inverter a direção (linha de retorno), inverte-se o offset (0 → 10).

### 4. Dots animados com `cx`/`cy`

```css
.dot {
  opacity: 0;
  filter: drop-shadow(0 0 4px currentColor);  /* glow colorido */
}
@keyframes dotTravel {
  0%   { cx: 90;  cy: 55; opacity: 0; }  /* ponto inicial */
  10%  { opacity: 1; }                     /* fade in */
  45%  { cx: 160; cy: 55; opacity: 1; }  /* ponto final */
  55%  { opacity: 0; }                     /* fade out */
  100% { cx: 160; cy: 55; opacity: 0; }  /* permanece oculto */
}
```

Animar `cx`/`cy` diretamente no `<circle>` SVG move o dot ao longo de qualquer trajetória. Para múltiplos dots no mesmo caminho, usa-se `animation-delay` escalonado.

### 5. Caminhos retangulares com cantos arredondados

Para conexões que não são retas (ex: bifurcações, retornos), usa-se `<path>` com curvas quadráticas `Q`:

```svg
<!-- Saída reta → curva → reta horizontal → curva → entrada reta -->
<path d="M553,55 L573,55 Q580,55 580,48 L580,30 Q580,23 587,23 L630,23"/>
```

Anatomia do path:
- `M553,55` — ponto de partida (borda direita do nó)
- `L573,55` — segmento reto horizontal (saída)
- `Q580,55 580,48` — curva quadrática (canto arredondado, raio ~7px)
- `L580,30` — segmento reto vertical
- `Q580,23 587,23` — curva quadrática (segundo canto)
- `L630,23` — segmento reto horizontal (entrada no nó destino)

Para dots seguindo caminhos retangulares, os keyframes precisam de waypoints intermediários:

```css
@keyframes dotRectPath {
  0%   { cx: 553; cy: 55; }   /* início */
  20%  { cx: 580; cy: 55; }   /* fim do trecho horizontal */
  55%  { cx: 580; cy: 23; }   /* fim do trecho vertical */
  80%  { cx: 630; cy: 23; }   /* chegada ao destino */
}
```

### 6. Linhas de retorno (resposta)

Para representar respostas (ex: 202 Accepted), a linha sai por baixo dos nós:

```svg
<path d="M199,81 L199,88 Q199,96 191,96 L51,96 Q44,96 44,88 L44,81"/>
```

O caminho forma um "U" invertido por baixo, saindo da borda inferior de um nó, viajando horizontalmente, e subindo para a borda inferior do nó de destino.

### 7. Sincronização com v-click do Slidev

Cada segmento de animação é envolvido em uma `div` com `v-click="N"`. A mensagem de texto correspondente usa o mesmo índice. Quando o apresentador clica, ambos aparecem simultaneamente:

```html
<!-- Dentro do container SVG -->
<div v-click="1" class="seg-layer">
  <svg><!-- linhas + dots do segmento 1 --></svg>
</div>

<!-- Na área de mensagens -->
<div v-click="1" class="flow-step">Mensagem do passo 1</div>
```

As animações CSS começam a rodar automaticamente quando o elemento se torna visível.

### 8. Load Balancing com alternância

Para simular round-robin visual, 4 dots usam 2 keyframes diferentes com delays escalonados:

```css
.dot-1 { animation: pathUp   5s ease-in-out infinite; }          /* → EME4 1 */
.dot-2 { animation: pathDown 5s ease-in-out 1.25s infinite; }    /* → EME4 2 */
.dot-3 { animation: pathUp   5s ease-in-out 2.5s infinite; }     /* → EME4 1 */
.dot-4 { animation: pathDown 5s ease-in-out 3.75s infinite; }    /* → EME4 2 */
```

O delay de 1.25s (= 5s ÷ 4) garante distribuição uniforme no ciclo.

## Walkthrough

1. Executar `cd poc-middleware-slidev && pnpm dev`
2. Acessar `http://localhost:3030`
3. **Slide 2**: verificar dots azuis viajando, dot rosa parando no meio com "✕ ERRO 500"
4. **Slide 5**: clicar 6 vezes, verificando:
   - Clicks 1-2: dots rápidos (ORIGEM→KONG→NATS)
   - Click 3: linha de retorno retangular + badge "✓ 202 Accepted"
   - Click 4: dots lentos (NATS→Worker)
   - Click 5: dots alternando entre EME4 1 e EME4 2 (load balancing)
   - Click 6: badge "retry" pulsante
5. Verificar que o layout dos cards/mensagens abaixo não é afetado

## Task Executada

- [x] Animação SVG no slide 2 (comunicação síncrona com erro)
- [x] Animação SVG no slide 5 (pipeline com Worker)
- [x] Sincronização v-click entre animação e mensagens
- [x] Linhas retangulares com cantos arredondados (Worker → EME4s)
- [x] Linha de retorno KONG → ORIGEM (202 Accepted)
- [x] Load balancing visual com alternância EME4 1 / EME4 2
- [x] Velocidades diferenciadas (rápido até NATS, lento após NATS)
- [x] Documentação técnica da técnica de animação

## Validação

- Animações rodam em loop infinito sem degradação de performance
- Cores seguem a paleta colorblind-safe do projeto (sem verde/vermelho)
- SVGs não possuem linhas em branco internas (evita quebra do parser Markdown do Slidev)
- Nenhum `<div />` auto-fechado (compatibilidade Vue)
- Layout responsivo mantido via `max-width` e `viewBox` proporcional

---

**Data:** 06/03/2026 19:30
**Status:** Concluído
**Tipo:** Enhancement — Animações de apresentação
