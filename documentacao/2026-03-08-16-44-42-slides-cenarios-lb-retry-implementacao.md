# 2026-03-08 - Implementação dos Slides 6a/6b/6c: Cenários LB vs Retry

## Contexto
- O slide 5 mostra o fluxo completo do Modo 2 (Com Tradutor/Worker) com 6 v-clicks
- A análise de negócio documentada em `2026-03-08-11-59-17-loadbalance-vs-retry-nats-garantia-entrega.md` detalha como LB e Retry são complementares
- Foram criados 3 slides focados nos blocos NATS, Worker e servidores EME4 (1 e 2)
- Decisão: 3 slides separados em vez de 1 slide com 7+ cliques (v-click não reseta estado entre cenários)

## Implementação

### Slide 6a — "1ª Linha de Defesa: Load Balancer"
**Narrativa**: Ambos EME4 online, LB distribui com sucesso.

- **Estado inicial**: NATS→Worker dots fluindo
- **v-click=1**: LB distribui entre EME4 1 e EME4 2 (dots alternando)
- **v-click=2**: Sucesso (EME4→Worker) + Ack (Worker→NATS)

### Slide 6b — "Quando o LB Não Basta: Retry"
**Narrativa**: Mesmo fluxo de sucesso, mas EME4 1 falha com erro 500.

- **Estado inicial**: Idêntico ao final do 6a (LB alternando, sucesso, ack)
- **v-click=1**: Três coisas simultâneas:
  1. Erro 500 no EME4 1 (overlay pink com pulseAlert)
  2. LB para de enviar ao EME4 1 (`v-click.hide="1"` no dot), continua só EME4 2
  3. Retorno erro/Nak pela parte superior (animação única via inline `forwards`)
- **v-click=2**: Linhas de retorno Nak com fluxo de sucesso EME4 2 mantido

### Slide 6c — "Ambos Fora: A Fila Garante"
**Narrativa**: Cenário extremo — ambos EME4 offline, mensagem não se perde.

- **Estado inicial**: Ambos EME4 pink/down com pulseAlert
- **v-click=1**: Nak → fila persiste, NATS glow, backoff exponencial
- **v-click=2**: EME4 2 recupera (animação `nodeRecover`: pink→cyan)
- **v-click=3**: Reentrega automática → Sucesso + Ack
- **v-click=4**: Badge conclusivo "LB + Retry = Zero mensagens perdidas"

### Arquivos modificados
- `poc-middleware-slidev/slides.md` — 3 novos slides inseridos entre slide 5 e o antigo slide 6
- `poc-middleware-slidev/style.css` — ~120 linhas de CSS (keyframes e classes de cenário)

### CSS criado

**Keyframes**:
- `scNatsWorker` — dot NATS→Worker (cx:100→210, cy:70)
- `scLbUp` / `scLbDown` — dots Worker→EME4 1/2 (bifurcação fuchsia)
- `scRetryEme4` — dot retorno EME4 1→Worker pela parte superior (cy:20)
- `scRetryNats` — dot retorno Worker→NATS pela parte superior (cy:20)
- `scEme4Success` — dot retorno Sucesso EME4 2→Worker pela parte inferior (cy:120)
- `scAckReturn` — dot retorno Ack Worker→NATS pela parte inferior (cy:120)
- `natsPersistGlow` — glow no NATS durante persistência
- `nodeRecover` — transição pink→cyan com glow
- `successPulse` — badge de sucesso pulsando

**Classes**:
- `.scenario-flow` — container (max-width:580px, height:140px)
- `.anim-sc-nats-worker` / `.anim-sc-nats-worker-d` — dots NATS→Worker (com delay)
- `.anim-sc-lb-down` / `.anim-sc-lb-down-d` — dots LB só para EME4 2
- `.anim-sc-lb-alt-up` / `.anim-sc-lb-alt-down` — dots LB alternando
- `.anim-sc-retry-eme4` / `.anim-sc-retry-nats` — dots retorno erro
- `.anim-sc-eme4-success` / `.anim-sc-ack-return` — dots retorno sucesso
- `.anim-nats-persist` — NATS glow
- `.anim-node-recover` — transição de estado recover
- `.anim-success-pulse` — badge pulsante
- `.svg-stroke-slate` — stroke cinza para paths desabilitados

## Decisões Técnicas

### v-click.hide em vez de v-click ranges
- `v-click="[0, 1]"` mostrou-se **não confiável** para elementos inicialmente visíveis
- **Solução**: usar `v-click.hide="N"` para esconder elementos individuais no click N
- Permite esconder/mostrar dentro do **mesmo container SVG** sem reiniciar animações

### Elementos no mesmo container
- Em vez de dividir SVG em múltiplos `anim-seg` por click, usar `v-click.hide` e `v-click` em elementos individuais dentro do mesmo SVG
- Dots que não mudam de estado continuam animando sem interrupção

### Animação single-play via inline style
- `style="animation: keyframeName 2.5s ease-in-out 1 forwards"` no elemento SVG
- Evita criar classes CSS extras para variantes que rodam uma vez
- O `forwards` mantém o estado final (opacity:0) após a animação

### Retornos por caminhos distintos
- **Sucesso** (EME4→Worker→NATS): paths pela parte **inferior** (cy:120)
- **Erro/Nak** (EME4 1→Worker→NATS): paths pela parte **superior** (cy:20)
- Evita sobreposição visual quando ambos estão visíveis simultaneamente

### Continuidade entre slides (fade transition)
- Slide 6b abre com o mesmo estado visual do final do slide 6a
- `transition: fade` entre slides para transição suave
- Dá a sensação de continuidade narrativa

## Walkthrough
1. `cd poc-middleware-slidev && pnpm dev`
2. Navegar até o slide 6a (após slide 5)
3. Slide 6a: 2 clicks (LB distribui → Sucesso + Ack)
4. Slide 6b: 2 clicks (Erro 500 + Nak → Retorno Nak)
5. Slide 6c: 4 clicks (Nak persiste → EME4 2 recupera → Reentrega → Conclusão)

## Task Executada
- [x] CSS: keyframes e classes de cenário
- [x] Slide 6a: LB com sucesso nos dois EME4
- [x] Slide 6b: Retry com erro 500 e Nak
- [x] Slide 6c: Ambos fora, fila garante
- [x] Linhas de retorno Sucesso (EME4 2→Worker) e Ack (Worker→NATS)
- [x] Retorno erro/Nak pela parte superior (sem sobreposição)
- [x] v-click.hide para swap de estado sem reiniciar animações
- [x] Animação single-play para eventos únicos (erro/Nak)
- [x] Skill Slidev atualizada com aprendizados

## Validação
- Cada slide funciona independentemente
- Paleta colorblind respeitada (pink para erro, cyan para sucesso)
- Animações fluem no sentido correto (esquerda→direita envio, direita→esquerda retorno)
- v-clicks sequenciais sem estados "órfãos"
- Diagrama base consistente entre os 3 slides
- Transição fade entre slides mantém continuidade visual

---

**Status**: Concluído
**Tipo**: Slide/Apresentação
**Data**: 08/03/2026 16:44
