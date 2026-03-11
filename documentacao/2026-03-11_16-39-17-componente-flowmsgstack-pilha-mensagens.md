# 11/03/2026 - Componente FlowMsgStack — Pilha Visual de Mensagens no NATS

## Contexto
- Os slides de cenários mostram mensagens fluindo pelo NATS, mas não havia representação visual de mensagens **acumuladas na fila**
- Para a apresentação à diretoria, é importante demonstrar visualmente que o NATS **retém mensagens** quando há erro ou indisponibilidade
- O componente precisa ser reutilizável em todos os slides que possuem um nó NATS

## Implementação

### Componente FlowMsgStack.vue (novo)
- **Arquivo**: `poc-middleware-slidev/components/FlowMsgStack.vue`
- Pilha de 7 barras horizontais com larguras variadas (10-16px), simulando mensagens empilhadas
- Reativo ao `$clicks` do Slidev via props `fillAt` e `drainAt`
- Três fases: `idle` (invisível) → `fill` (barras surgem escalonadas) → `drain` (barras deslizam e somem)
- Prop `side` ("right" | "left") controla posicionamento dentro do nó
- Prop `color` suporta cyan, fuchsia e pink
- Usa `:key="${phase}-${i}"` para forçar re-render e re-trigger das animações CSS ao trocar de fase

### FlowNode.vue (modificado)
- **Arquivo**: `poc-middleware-slidev/components/FlowNode.vue`
- Adicionado `overflow: visible` no estilo do root para permitir conteúdo dos slots ultrapassar limites visuais
- Adicionados slots nomeados `#left` e `#right` para conteúdo posicionado ao lado do nó

### CSS (style.css)
- **Arquivo**: `poc-middleware-slidev/style.css`
- Adicionadas animações `msgBarIn` (slide-in da esquerda) e `msgBarOut` (slide-out para direita)
- Classes `.msg-bar-in` (0.45s ease-out) e `.msg-bar-out` (0.5s ease-in) com `animation-fill-mode: both`

### Slides modificados

| Slide | Arquivo | fillAt | drainAt | Lógica |
|---|---|---|---|---|
| 1ª Linha de Defesa: LB | `slides/04-cenarios.md` | 0 | 2 | Mensagens visíveis desde o início, drenam no Ack |
| Quando o LB Não Basta: Retry | `slides/04-cenarios.md` | 1 | 1 | Flash rápido no erro |
| Ambos Fora: A Fila Garante | `slides/04-cenarios.md` | 1 | 3 | Acumulam offline, drenam na recuperação |
| Com Worker (Analogia) | `slides/05-analogia-comparacao.md` | 0 | 1 | Visíveis no NATS, drenam quando Worker envia |
| Com Tradutor (Worker) | `slides/03-modelo-novo.md` | 2 | 4 | Chegam via Kong, saem quando Worker consome |
| NATS — Pub/Sub | `slides/07-tecnologias.md` | 0 | 2 | Visíveis ao entrar, drenam no Ack dos subscribers |

### Decisões técnicas
- **Slot dentro do FlowNode** em vez de posicionamento absoluto no ScenarioFlow: garante que as barras fiquem sempre relativas ao nó NATS, independente do layout do slide
- **`$clicks` como prop** em vez de importar internals do Slidev: mais simples, testável e desacoplado
- **CSS animations com `:key` reativo**: garante re-trigger ao mudar de fase, sem depender de v-click do Slidev para timing

## Walkthrough

1. Executar a apresentação:
   ```bash
   cd poc-middleware-slidev
   pnpm dev
   ```
2. Navegar até o slide "Ambos Fora: A Fila Garante" (slide 11)
3. Click 0: NATS sem barras (idle)
4. Click 1: Barras surgem dentro do NATS, uma por uma (fill)
5. Click 2: EME4 2 volta ao ar, barras permanecem
6. Click 3: Barras deslizam e desaparecem (drain), fluxo de sucesso aparece
7. Verificar os mesmos efeitos nos outros slides com NATS

## Task Executada
- [x] Componente FlowMsgStack.vue criado com props reativas
- [x] FlowNode.vue atualizado com slots #left e #right + overflow visible
- [x] Animações CSS msgBarIn/msgBarOut adicionadas ao style.css
- [x] FlowMsgStack aplicado em 6 slides com NATS (fill/drain calibrados por slide)
- [x] Build compilando sem erros

## Validação
- Build Slidev (`npx slidev build`) concluído com sucesso em todas as iterações
- Barras posicionadas dentro do nó NATS sem sobreposição do conteúdo (ícone, label, sub)
- Animações reativas: fill ao atingir fillAt, drain ao atingir drainAt
- Componente reutilizável via slot em qualquer FlowNode
