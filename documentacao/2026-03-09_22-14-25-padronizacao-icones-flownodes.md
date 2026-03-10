# Padronização de Ícones nos FlowNodes

## Contexto
- Vários slides usavam ícones para NATS, Kong e Worker nos FlowNodes, mas os nós EME4 e Cozinheiro não tinham ícones
- O slide "Por que confiamos nessas tecnologias?" também não tinha ícones nos cards de NATS e Kong/APISIX
- Inconsistência visual entre slides comprometia a identidade dos componentes

## Implementação

### Convenção final de ícones

| Componente | Ícone | Cor |
|------------|-------|-----|
| NATS | `i-ph-cloud-arrow-up-fill` | cyan |
| Kong/APISIX | `i-ph-shield-check-fill` | violet/purple |
| Worker | `i-ph-gear-six-fill` | fuchsia |
| EME4 (online) | `i-carbon-bare-metal-server-02` | cyan |
| EME4 (erro) | `i-ph-x-circle-fill` | pink |
| Cozinheiro | `i-ph-cooking-pot-fill` | cyan |
| ERP/Origem | `i-ph-plugs-connected-fill` | blue |

### Arquivos modificados

**`poc-middleware-slidev/slides/03-modelo-novo.md`** — Slide 5 (Com Tradutor)
- EME4 1 e EME4 2 online: adicionado `icon="i-carbon-bare-metal-server-02"`
- EME4 1 erro: adicionado `icon="i-ph-x-circle-fill"`
- EME4 1 online: adicionado `v-click.hide="6"` para ocultar ao mostrar estado de erro

**`poc-middleware-slidev/slides/04-cenarios.md`** — Slides 6a/6b/6c (Cenários LB vs Retry)
- EME4 1/2 online (slides 6a e 6b): adicionado `icon="i-carbon-bare-metal-server-02"`
- EME4 1 erro 500 (slide 6b): adicionado `icon="i-ph-x-circle-fill"`
- EME4 2 recuperado (slide 6c): adicionado `icon="i-carbon-bare-metal-server-02"`

**`poc-middleware-slidev/slides/05-analogia-comparacao.md`** — Slides 9 e 10
- Cozinheiro 1/2: adicionado `icon="i-ph-cooking-pot-fill"`
- EME4 1/2 nos dois ScenarioFlows (passagem direta e com worker): adicionado `icon="i-carbon-bare-metal-server-02"`

**`poc-middleware-slidev/slides/07-tecnologias.md`** — Slide 14 (Por que confiamos)
- Card NATS: adicionado `i-ph-cloud-arrow-up-fill` no título
- Card Kong/APISIX: adicionado `i-ph-shield-check-fill` no título

### Total de alterações
- 17 FlowNodes receberam ícones (EME4, Cozinheiro)
- 2 cards de info receberam ícones inline (NATS, Kong)
- 1 `v-click.hide="6"` adicionado para transição visual EME4 online→erro

## Walkthrough
- `cd poc-middleware-slidev && pnpm dev`
- Navegar pelos slides 5, 6a, 6b, 6c, 9, 10, 13, 14
- Verificar que todos os FlowNodes têm ícones consistentes
- Slide 5: EME4 1 online deve sumir no click 6 e ser substituído pelo EME4 1 erro
- Slide 14: cards NATS e Kong devem ter ícones antes do título

## Task Executada
- [x] Adicionar `icon="i-carbon-bare-metal-server-02"` a todos os EME4 online/recuperados
- [x] Adicionar `icon="i-ph-x-circle-fill"` a EME4 em estado de erro
- [x] Adicionar `icon="i-ph-cooking-pot-fill"` aos Cozinheiros
- [x] Adicionar ícones inline nos cards do slide "Por que confiamos"
- [x] Adicionar `v-click.hide="6"` ao EME4 1 online no slide 5
- [x] Build `npx slidev build` passa sem erros

## Validação
- Build passou sem erros
- Todos os FlowNodes agora seguem a convenção de ícones
- Consistência visual mantida em todos os slides
