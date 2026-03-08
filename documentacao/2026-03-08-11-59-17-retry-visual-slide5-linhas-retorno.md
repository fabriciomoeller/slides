# 2026-03-08 - Retry Visual no Slide 5: Linhas de Retorno EME4 → Worker → NATS

## Contexto
- O slide 5 (Modo 2: Com Tradutor/Worker) mencionava "retry automático com backoff exponencial" no passo 6, mas não havia representação visual do ciclo de retry
- O badge `↺ retry` flutuava isolado sem conexão com o fluxo do diagrama
- Era necessário evidenciar graficamente como a mensagem retorna ao NATS quando o EME4 falha

## Implementação

### Arquivos modificados
- `poc-middleware-slidev/slides.md` — Slide 5, bloco v-click="6"
- `poc-middleware-slidev/style.css` — Novas animações de retry

### O que foi adicionado no SVG (slides.md)

**Duas paths de retorno pontilhadas** no v-click="6":
1. **EME4 → Worker** (path superior, cor pink): `M630,3 Q630,4 616,4 L524,4 Q510,4 510,18`
   - Sai do lado esquerdo do EME4 1, sobe até y=4, vai à esquerda, desce até o Worker
2. **Worker → NATS** (path inferior, cor cyan): `M509,70 Q509,85 495,85 L364,85 Q350,85 350,70`
   - Sai da base do Worker, desce até y=85, vai à esquerda, sobe até o NATS

**Dots animados** sobre cada path (direita → esquerda)

**Overlay de erro no EME4 1**: no v-click="6", um div com `bg-pink-500/15 border-pink-500/50 text-pink-400` cobre o EME4 1 original (cyan), evidenciando o servidor com erro. Usa animação `pulseAlert` para pulsar.

**Badges informativos**:
- `✕ erro/timeout` — posicionado acima (entre EME4 e Worker)
- `↺ Nak → refila` — posicionado abaixo (entre Worker e NATS)

**Texto do passo 6 atualizado**:
- De: "Se der erro → retry automático com backoff exponencial"
- Para: "Se der erro → Worker devolve à fila (**Nak**) → NATS retenta com backoff exponencial"

### O que foi adicionado no CSS (style.css)

- `.svg-stroke-pink { stroke: #ec4899; }` — cor de stroke para linhas de erro
- `.anim-retry-eme4` — classe do dot animado EME4 → Worker (2s ciclo)
- `.anim-retry-nats` — classe do dot animado Worker → NATS (2s ciclo, 2s delay)
- `@keyframes retryEme4ToWorker` — dot viaja pela curva superior (y=4)
- `@keyframes retryWorkerToNats` — dot viaja pela curva inferior (y=84)

### Correção na animação dashFlowReturn

A animação `dashFlowReturn` foi corrigida para fazer os tracejados fluírem na direção do path (da direita para a esquerda):
- Antes: `stroke-dashoffset: 0 → 10` (direção errada)
- Depois: `stroke-dashoffset: 18 → 0` (acompanha o sentido do path)

Isso afeta todas as linhas de retorno: 202 Accepted, erro/timeout e Nak → refila.

## Walkthrough
1. Executar `pnpm dev` no diretório `poc-middleware-slidev/`
2. Navegar até o slide 5 (Modo 2: Com Tradutor)
3. Clicar até o v-click 6
4. Verificar:
   - EME4 1 muda para cor pink (erro) e pulsa
   - Linha pontilhada pink aparece acima (EME4 → Worker)
   - Linha pontilhada cyan aparece abaixo (Worker → NATS)
   - Dots animados percorrem as paths da direita para esquerda
   - Badges "✕ erro/timeout" e "↺ Nak → refila" visíveis
   - Tracejados de todas as linhas de retorno fluem para a esquerda

## Task Executada
- [x] Path SVG de retorno EME4 → Worker (pink, por cima)
- [x] Path SVG de retorno Worker → NATS (cyan, por baixo)
- [x] Dots animados nos paths de retorno
- [x] Overlay de erro no EME4 1 com pulseAlert
- [x] Badges "✕ erro/timeout" e "Nak → refila"
- [x] Texto do passo 6 atualizado com mecanismo Nak
- [x] Correção da animação dashFlowReturn (direção correta)
- [x] Classe svg-stroke-pink adicionada

## Validação
- Animações de retorno fluem da direita para esquerda (coerente com sentido de retorno)
- v-clicks 1-5 continuam funcionando normalmente
- EME4 1 muda para pink apenas no v-click 6 (overlay com z-5 cobre o original)
- Paleta colorblind respeitada (pink em vez de red/orange)
