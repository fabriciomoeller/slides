# 2026-03-08 - Plano: 3 Slides de Cenários LB vs Retry (NATS → Worker → EME4)

## Contexto
- O slide 5 mostra o fluxo completo do Modo 2 (Com Tradutor/Worker) com 6 v-clicks
- A análise documentada em `2026-03-08-11-59-17-loadbalance-vs-retry-nats-garantia-entrega.md` detalha como LB e Retry são complementares
- Precisamos de slides focados **exclusivamente nos 3 blocos**: NATS, Worker e servidores EME4 (1 e 2)
- Decisão: 3 slides separados (um por cenário) em vez de 1 slide com 7+ cliques

## Decisão Técnica: Por que 3 slides separados

1. **Reset de estado impossível em v-click** — v-click só mostra/esconde, não "volta ao normal"
2. **SVG isolado por slide** — sem conflito de animações nem ranges complexos
3. **2-3 cliques por slide** — ritmo ideal para apresentação
4. **Diagrama base reutilizado** — mesmo layout com variações por cenário

## Diagrama Base (comum aos 3 slides)

Layout SVG horizontal (viewBox ~700x110):
```
┌──────┐       ┌────────┐       ┌────────┐
│ NATS │ ───── │ Worker │ ──┬── │ EME4 1 │
│ fila │       │tradutor│   │   └────────┘
└──────┘       └────────┘   │   ┌────────┐
                            └── │ EME4 2 │
                                └────────┘
```

Posições (reutilizadas do slide 5):
- NATS: `left-0`, ~80px wide
- Worker: `left-200px`, ~90px wide
- Fork (LB): SVG path bifurcando
- EME4 1: `top`, ~90px wide
- EME4 2: `bottom`, ~90px wide

Cores:
- NATS: cyan (`bg-cyan-500/12 border-cyan-500/40 text-cyan-400`)
- Worker: fuchsia (`bg-fuchsia-500/12 border-fuchsia-500/40 text-fuchsia-400`)
- EME4 normal: cyan (mesma paleta)
- EME4 erro: pink (`bg-pink-500/15 border-pink-500/50 text-pink-400`)
- EME4 down: gray (`bg-slate-500/15 border-slate-500/30 text-slate-500`)

## Slide 6a — "1ª Linha de Defesa: Load Balancer"

**Narrativa**: EME4 1 está fora, LB detecta e desvia para EME4 2.

### Estado Inicial (sem clique)
- Diagrama base visível
- NATS → Worker: linha tracejada cyan com dots animados (fluxo normal)
- Worker → fork → EME4 1 e EME4 2: linhas tracejadas fuchsia (ambas visíveis)
- EME4 1: **gray/down** (já começa fora) com ícone `✕` e label "offline"
- EME4 2: cyan (saudável) com dot pulsando
- Texto descritivo: "O EME4 1 está fora do ar. O que acontece?"

### v-click 1 — "LB detecta e desvia"
- Linha Worker → EME4 1: fica opaca/cinza (cortada, sem dots)
- Linha Worker → EME4 2: fica mais brilhante, dots animados passam **só por baixo**
- Badge aparece no fork: "LB desvia" (fuchsia)
- Ícone de health check no EME4 1: `✕ down` (pink)
- Texto passo: "Health Check detecta EME4 1 offline → LB nem envia para ele"

### v-click 2 — "Entregue com sucesso"
- Badge "✓ Entregue" aparece ao lado do EME4 2 (cyan, pulsando)
- Worker faz Ack → linha de retorno Worker → NATS (cyan, tracejada, retorno)
- Texto conclusão: "**LB foi suficiente** — sem retry, sem atraso. Mensagem entregue no EME4 2."

### CSS necessário
- Reutilizar: `anim-node-sm`, `anim-seg`, `anim-svg`, SVG line classes, `svg-line`, `svg-dot`
- Novo: keyframe `wfLbDownOnly` (dot vai só para EME4 2, sem alternar)
- Novo: classe `.anim-node-down` (gray, opacidade reduzida, sem animação)

---

## Slide 6b — "Quando o LB Não Basta: Retry"

**Narrativa**: EME4 1 parece saudável, recebe a mensagem, mas retorna erro 500 durante o processamento.

### Estado Inicial (sem clique)
- Diagrama base, **todos saudáveis** (NATS, Worker, EME4 1, EME4 2 em cores normais)
- NATS → Worker: dots animados (cyan)
- Worker → EME4 1 e EME4 2: dots alternando (fuchsia, igual slide 5 v-click 5)
- Texto: "O LB escolheu o EME4 1 (parecia saudável). Mas..."

### v-click 1 — "Erro 500 no EME4 1"
- EME4 1 muda para pink (overlay, igual slide 5 v-click 6)
- Animação `pulseAlert` no EME4 1
- Dots param de ir para EME4 1
- Badge "✕ erro 500" aparece acima do EME4 1 (pink)
- Texto: "EME4 1 aceitou a conexão mas falhou durante o processamento"

### v-click 2 — "Nak → Refila"
- Linhas de retorno aparecem (igual slide 5 v-click 6):
  - EME4 1 → Worker (pink, path por cima)
  - Worker → NATS (cyan, path por baixo)
- Dots animados nas linhas de retorno (direita → esquerda)
- Badge "↺ Nak → refila" entre Worker e NATS
- NATS pulsa (glow cyan mais forte)
- Texto: "Worker faz **Nak** — mensagem volta para a fila NATS"

### v-click 3 — "Retry entrega no EME4 2"
- Nova linha NATS → Worker → EME4 2 (dots animados, fuchsia, só para baixo)
- EME4 1 permanece pink (ainda com erro)
- Badge "✓ Entregue na 2ª tentativa" ao lado do EME4 2 (cyan, pulsando)
- Badge "Ack ✓" na linha Worker → NATS (retorno cyan)
- Texto: "NATS reentrega → LB reavalia → EME4 2 recebe → **sucesso na 2ª tentativa**"

### CSS necessário
- Reutilizar: `anim-retry-eme4`, `anim-retry-nats`, `pulseAlert`, `svg-stroke-pink`
- Novo: keyframe `wfRetryDeliverDown` (dot vai só para EME4 2 após retry)
- Novo: keyframe `natsRequeuePulse` (NATS glow mais intenso durante refila)

---

## Slide 6c — "Ambos Fora: A Fila Garante"

**Narrativa**: Cenário mais extremo — ambos EME4 offline. A mensagem não se perde.

### Estado Inicial (sem clique)
- Diagrama base
- EME4 1: **pink/down** com `✕`
- EME4 2: **pink/down** com `✕`
- Worker tenta enviar → ambos falham
- Badge "✕ sem servidor disponível" no fork (pink)
- NATS com glow normal
- Texto: "Cenário extremo: ambos os servidores EME4 estão fora"

### v-click 1 — "Mensagem segura na fila"
- Linhas de retorno: Worker → NATS (cyan, por baixo)
- Badge "↺ Nak → fila persiste"
- NATS recebe glow forte + badge "mensagem persistida em disco" (cyan)
- Ícone de relógio/timer aparece: "Backoff: 5s → 30s → 2min..."
- Texto: "Worker faz Nak → mensagem **persiste na fila** → NATS aguarda com backoff exponencial"

### v-click 2 — "EME4 2 volta ao ar"
- EME4 2 transiciona de pink → cyan (animação de recuperação, glow cyan)
- Badge "↑ online" aparece ao lado do EME4 2
- EME4 1 permanece pink/down
- Texto: "Minutos depois, EME4 2 é reiniciado e volta ao ar"

### v-click 3 — "Recuperação automática"
- NATS → Worker → EME4 2: dots animados (fuchsia, só para baixo)
- Badge "✓ Recuperação automática" ao lado do EME4 2 (cyan, grande, pulsando)
- Badge "Ack ✓" retorno Worker → NATS
- Texto conclusão: "**Nenhuma mensagem se perdeu** — a fila garantiu a entrega mesmo com falha total temporária"

### v-click 4 (opcional) — Conclusão visual
- Badge grande centralizado abaixo: "LB + Retry = Zero mensagens perdidas"
- Três ícones: 🛡️ LB (prevenção) + 🔄 Retry (recuperação) + 💾 Fila (persistência)

### CSS necessário
- Reutilizar: `pulseAlert`, linhas de retorno, dots
- Novo: keyframe `nodeRecover` (transição pink → cyan com glow de "ligando")
- Novo: classe `.anim-backoff-badge` (timer visual pulsando)

---

## Inserção no slides.md

Os 3 novos slides serão inseridos **entre o slide 5 (linha 303) e o slide 6 atual (linha 304)**:

```
Slide 5 (Modo 2: Com Tradutor)        — linhas 198-303
--- (novo) ---
Slide 6a (LB Resolve)                 — NOVO
--- (novo) ---
Slide 6b (Retry Resolve)              — NOVO
--- (novo) ---
Slide 6c (Ambos Fora)                 — NOVO
--- (existente) ---
Slide 6 atual → vira Slide 7          — linhas 304+
```

**Nota**: Os slides existentes após o 6 (7, 8, 9...) não precisam ser renumerados nos comentários — apenas os comentários internos indicam o número, o Slidev usa ordem sequencial.

## Classes CSS Reutilizáveis dos 3 Slides

Do slide 5 já existente:
- `.anim-flow`, `.anim-node-sm`, `.anim-node-top`, `.anim-seg`, `.anim-svg`
- `.svg-line`, `.svg-line-return`, `.svg-dot`
- `.svg-stroke-*`, `.svg-fill-*`
- `.anim-s4`, `.anim-lb-up1`, `.anim-lb-down1` (dots NATS→Worker e Worker→EME4)
- `.anim-retry-eme4`, `.anim-retry-nats` (dots de retorno)
- `pulseAlert` (keyframe para erro)

Novas classes necessárias:
- `.anim-lb-down-only` — dot que vai apenas para EME4 2 (sem alternar)
- `.anim-node-down` — node cinza/desabilitado
- `.anim-node-recover` — transição de pink → cyan
- `.anim-nats-persist` — glow intenso no NATS durante persistência
- `.anim-retry-deliver-down` — dot de retry que vai apenas para EME4 2

## Estimativa de Complexidade

- Slide 6a: ~50 linhas HTML, ~20 linhas CSS
- Slide 6b: ~70 linhas HTML, ~30 linhas CSS
- Slide 6c: ~80 linhas HTML, ~40 linhas CSS
- Total: ~200 linhas HTML + ~90 linhas CSS

## Task Planejada
- [ ] Criar CSS: novas classes e keyframes
- [ ] Criar Slide 6a (LB Resolve)
- [ ] Criar Slide 6b (Retry Resolve)
- [ ] Criar Slide 6c (Ambos Fora)
- [ ] Testar transições entre slides
- [ ] Documentar implementação

## Validação
- Cada slide deve funcionar independentemente
- Paleta colorblind respeitada (pink em vez de red, cyan em vez de green)
- Animações fluem no sentido correto (esquerda→direita para envio, direita→esquerda para retorno)
- v-clicks sequenciais sem estados "órfãos"
- Diagrama base consistente entre os 3 slides

---

**Status**: Planejamento
**Tipo**: Slide/Apresentação
**Data**: 08/03/2026 12:31
