# 2026-03-08 — Migração de Slides para Componentes Vue + offset-path

## Contexto
- Os slides 5, 6a, 6b e 6c acumulavam ~280 linhas de CSS com 13 @keyframes específicos para animação de dots (cx/cy)
- Código SVG repetido entre slides dificultava manutenção e ajustes visuais
- Necessidade de unificar o padrão de animação usando `offset-path` (CSS moderno)

## Implementação

### Componentes criados (`poc-middleware-slidev/components/`)

| Componente | Responsabilidade |
|------------|-----------------|
| `ScenarioFlow.vue` | Wrapper com v-motion fade-in para cenários 6a/6b/6c |
| `FlowNode.vue` | Nodes (NATS, Worker, EME4) com props de cor, posição, pulse, persist, recover |
| `FlowDot.vue` | Dot animado via CSS `offset-path` — substitui todos os @keyframes de cx/cy |
| `FlowBadge.vue` | Badge posicionado com texto, ícone, cor e borda opcional |

### FlowNode — posições e cores

**Posições nomeadas** (cenários 6a/6b/6c):
- `nats`, `worker`, `eme4-top`, `eme4-bottom`

**Posições custom** (slide 5): string livre de classes UnoCSS passada diretamente
- Ex: `position="top-50% -translate-y-50% left-310px w-78px h-52px"`

**Cores suportadas**: cyan, fuchsia, pink, blue, violet, purple

### FlowDot — offset-path

Substitui @keyframes complexos de cx/cy por um único `@keyframes followPath`:
```css
@keyframes followPath {
  0%   { offset-distance: 0%;   opacity: 0; }
  10%  { offset-distance: 10%;  opacity: 1; }
  80%  { offset-distance: 100%; opacity: 1; }
  90%  { offset-distance: 100%; opacity: 0; }
  100% { offset-distance: 100%; opacity: 0; }
}
```

Props: `d` (path SVG), `color`, `duration`, `delay`, `loop`, `r`

### Fluxo de sucesso duplicado (EME4 1 + EME4 2)

Slides 6a e 6b agora mostram retorno de sucesso de **ambos** EME4:
- **EME4 1** (top) → Worker via path superior (cy:20)
- **EME4 2** (bottom) → Worker via path inferior (cy:120)
- **Ack** duplicado: Worker → NATS por cima e por baixo

No slide 6b, os paths/dots/badges do EME4 1 usam `v-click.hide="1"` para desaparecer quando EME4 1 falha.

### Comentários descritivos

Todos os slides 6a, 6b e 6c receberam comentários HTML descrevendo cada segmento de animação:
- `<!-- Animação do NATS para o Worker -->`
- `<!-- EME4 1 (top) → Worker via path superior -->`
- `<!-- Click 2: Retry — EME4 1 retorna erro, EME4 2 sucesso (bottom), Nak refila -->`

### Slides migrados

| Slide | Descrição | Mudanças |
|-------|-----------|----------|
| 5 (Modo 2: Com Tradutor) | 6 nodes, 12 dots, 2 badges | Nodes → FlowNode, dots → FlowDot, badges → FlowBadge |
| 6a (LB com Sucesso) | 4 nodes, sucesso duplo | Migrado + retorno EME4 1 (top) e EME4 2 (bottom) |
| 6b (Retry Resolve) | v-click.hide swap, retry | Migrado + sucesso duplo com v-click.hide="1" |
| 6c (Ambos Fora) | v-click range, recover | Migrado + comentários descritivos |

### CSS removido (~280 linhas)

**@keyframes removidos**: `wfSeg1`–`wfSeg4`, `wfLbUp`, `wfLbDown`, `wfAcceptedPulse`, `wfRetryPulse`, `retryEme4ToWorker`, `retryWorkerToNats`, `scNatsWorker`, `scLbUp`, `scLbDown`, `scRetryEme4`, `scRetryNats`, `scEme4Success`, `scAckReturn`

**Classes removidas**: `.anim-s1` a `.anim-s4-d`, `.anim-lb-up1` a `.anim-lb-down2`, `.anim-retry-eme4`, `.anim-retry-nats`, `.anim-accepted-pulse`, `.anim-retry-pulse`, `.anim-sc-*`

**Restaurado**: `@keyframes dashFlowReturn` (estava embarcado no bloco removido, necessário por `.svg-line-return`)

### Slide 2 — mantido

O slide 2 (Como Funciona Hoje) não foi migrado: os dots usam timing de burst (3 dots em ciclo de 8s com pausa longa) incompatível com o `followPath` genérico.

## Walkthrough

```bash
cd poc-middleware-slidev && pnpm dev
```

1. **Slide 5** (Modo 2): Verificar 6 clicks — cada segmento aparece com dots seguindo os paths
2. **Slide 6a**: Click 1 = LB fork, Click 2 = sucesso duplo (top + bottom) com Ack
3. **Slide 6b**: Estado inicial com sucesso duplo → Click 1 = EME4 1 erro (top desaparece) → Click 2 = retry
4. **Slide 6c**: EME4s offline → Click 1 = Nak loop → Click 2 = EME4 2 volta → Click 3 = sucesso

## Task Executada
- [x] Criar componentes ScenarioFlow, FlowNode, FlowDot, FlowBadge
- [x] Adicionar @keyframes followPath ao CSS
- [x] Migrar slides 6a, 6b, 6c para componentes
- [x] Migrar slide 5 para componentes (extensão de cores e posições)
- [x] Duplicar fluxo de sucesso para ambos EME4 (slides 6a e 6b)
- [x] Adicionar comentários descritivos nos slides 6a, 6b, 6c
- [x] Remover ~280 linhas de CSS não utilizado
- [x] Restaurar @keyframes dashFlowReturn

## Validação
- Servidor Slidev inicia sem erros (`pnpm dev`)
- Slides 5, 6a, 6b, 6c renderizam corretamente
- Todas as animações de dots seguem os paths via offset-path
- v-click.hide funciona em elementos SVG (path, circle/FlowDot)
- Transições fade entre slides mantidas

---
**Data**: 2026-03-08
**Status**: Concluído
**Tipo**: Refatoração / Melhoria Visual
