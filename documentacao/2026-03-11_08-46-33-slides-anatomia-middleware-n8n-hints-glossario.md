# 11/03/2026 - Slides Anatomia do Middleware, N8N, Hints e Glossário Visual

## Contexto
- Os slides atuais explicam o fluxo do middleware através de cenários e analogias, mas **não explicam o que cada ferramenta é** (Kong, NATS, Workers)
- O diretor da empresa acredita que o N8N faz tudo que o middleware propõe — falta um slide que posicione o N8N dentro do ecossistema
- A apresentação também funciona como página web navegável — hints (tooltips) nos FlowNodes enriquecem a experiência de quem navega sozinho
- Falta um glossário visual que sirva como "legenda do mapa" antes dos cenários

## Implementação

### 4 Atividades Macro (em ordem de prioridade)

#### Atividade 1 — Slide "Anatomia do Middleware" (3 Camadas)
- **Posição**: Entre slide 05 (analogia) e 07 (tecnologias)
- **Conteúdo**: Diagrama mostrando as 3 camadas empilhadas do ecossistema:
  - **Camada 1 — API Gateway (Kong/APISIX)**: "Quem entra? Para onde vai?" — Autenticação, roteamento, rate limiting, load balancing. Tráfego norte-sul (externo→interno)
  - **Camada 2 — Message Broker (NATS JetStream)**: "Não perde nenhum pedido" — Desacopla produtor de consumidor, persiste mensagens, distribui carga. Tráfego leste-oeste (interno↔interno)
  - **Camada 3 — Workers (Serviços Go)**: "Cada um faz seu trabalho" — Transformação de dados, mapeamento DE→PARA, chamadas ao destino. Escaláveis horizontalmente
- **Decisão técnica**: Usar FlowNodes existentes com as cores já padronizadas (violet=gateway, cyan=broker, fuchsia=workers)

#### Atividade 2 — Slide "E o N8N?"
- **Posição**: Logo após o slide Anatomia
- **Objetivo**: Posicionar o N8N como possível Worker ou sistema provedor, não como substituto do middleware
- **Abordagem**: "N8N tem seu lugar — ele é um dos chefs, não o restaurante inteiro"
- **Conteúdo planejado**:
  - Tabela comparativa de capacidades (Kong vs NATS vs Worker vs N8N)
  - N8N como Worker: pode consumir webhooks, transformar dados e chamar APIs
  - N8N NÃO é API Gateway (sem rate limiting real, sem LB, sem plugins auth enterprise)
  - N8N NÃO é Message Broker (sem persistência de filas em disco, sem fan-out nativo)
  - Analogia: "Chef versátil no food truck vs restaurante com 500 mesas"

#### Atividade 3 — Hints (Tooltips) nos FlowNodes
- **Escopo**: Tooltips estilizados com HTML rico em todos os FlowNodes
- **Arquitetura final**: Event delegation + Teleport (3 tentativas até chegar na solução)
  - ❌ Tentativa 1: `title` nativo — tooltip feio, sem formatação
  - ❌ Tentativa 2: `<Teleport>` dentro do FlowNode — quebrou `v-click.hide` (mudança DOM)
  - ✅ Tentativa 3: `FlowHintLayer.vue` (global) — event delegation em `[data-hint]`, zero alteração DOM
- **Arquivos criados**:
  - `components/FlowHintLayer.vue` — Camada global de tooltips, usa `mouseenter`/`mouseleave` com `capture: true` via event delegation. Teleportado para `<body>` para escapar do `transform: scale()` do Slidev
  - `global-top.vue` — Monta FlowHintLayer acima de todos os slides (convenção Slidev)
- **Arquivos modificados**:
  - `components/FlowNode.vue` — Nova prop `hint`, renderiza como `data-hint`/`data-hint-color`, `cursor: help`
  - `style.css` — CSS `.flow-hint` com fundo sólido `#0f172a`, borda colorida, seta, animação fade-in
  - `slides/03-modelo-novo.md` — Hints em todos FlowNodes (ORIGEM, KONG, NATS, Worker, EME4)
  - `slides/04-cenarios.md` — Hints nos cenários LB/Retry (EME4 online/offline/erro)
  - `slides/05-analogia-comparacao.md` — Hints na analogia restaurante (Garçom, Comanda, Cozinheiro)
  - `slides/06-visao-estrategica.md` — Hints nos sistemas futuros (Agente IA, Portal, Dashboard, N8N)
  - `slides/07-tecnologias.md` — Hints no Pub/Sub (Publisher, NATS JetStream, Subscribers, Monitor)
- **Decisão crítica**: Nunca adicionar wrapper div no FlowNode — v-click.hide depende da estrutura DOM
- **Posicionamento**: `getBoundingClientRect()` + `position: fixed` + `<Teleport to="body">` para escapar do transform scale do Slidev

#### Atividade 4 — Slide Glossário Visual
- **Posição**: Entre slide 03 (Modelo Novo) e 04 (Cenários) — `slides/03b-glossario-visual.md`
- **Conteúdo**: Legenda completa de todos os elementos visuais dos diagramas
- **Layout**: Grid 2 colunas (Consumidores blue | Provedores cyan) + seção Middleware (purple/cyan/fuchsia)
- **Legenda de linhas**: Conexão tracejada, dot de mensagem em trânsito, Ack, Nak
- **Decisão**: Não diferenciar ida/volta por estilo de linha — nos slides reais ambas são tracejadas
- **Arquivo criado**: `slides/03b-glossario-visual.md`
- **Arquivo modificado**: `slides.md` — adicionado `src: ./slides/03b-glossario-visual.md`

### Análise de Padrão de Cores (documentado)
| Cor | Significado |
|-----|------------|
| Blue | Origem/consumidor (quem pede) |
| Violet/Purple | Gateway (quem controla acesso) |
| Cyan | Infraestrutura core (NATS, EME4) |
| Fuchsia | Processamento/transformação (Worker) |
| Pink | Erro/falha |

### Catálogo Completo de FlowNodes
| Label | Icon | Color | Sub | Slides | Papel |
|-------|------|-------|-----|--------|-------|
| ORIGEM / ERP Externo / Cliente | ph-plugs-connected / ph-user | blue | "ex: ERP" / "Publisher" | 03, 05, 07 | Sistema Consumidor |
| KONG | ph-shield-check | violet/purple | "portaria" / "Auth + LB" | 03, 05 | API Gateway |
| NATS | ph-cloud-arrow-up | cyan | "fila" / "JetStream" | 03, 04, 05, 07 | Message Broker |
| Worker | ph-gear-six | fuchsia | "tradutor" / "Subscriber" | 03, 04, 05, 07 | Executor de lógica |
| EME4 1/2 | carbon-bare-metal-server | cyan | "online" / "offline" / "voltou" | 03, 04, 05 | Sistema Provedor |
| Monitor | carbon-dashboard | cyan | "Subscriber" | 07 | Observador |
| Cozinheiro | ph-cooking-pot | cyan/pink | "ativo" | 05 | Analogia Worker |
| Garçom | ph-user-circle | fuchsia | "anota" | 05 | Analogia Kong |
| Comanda | ph-clipboard-text | cyan | "fila" | 05 | Analogia NATS |
| Agente IA | carbon-bot | blue | "(futuro)" | 05, 06 | Consumidor futuro |
| Portal Cloud | carbon-cloud | blue | — | 06 | Consumidor futuro |
| Dashboard | ph-chart-line-up | blue | — | 06 | Consumidor futuro |
| N8N / Gesti / Sistema Y | diversos | cyan | — | 06 | Sistemas Provedores |

## Walkthrough
- Executar cada atividade em sequência (1→2→3→4)
- Após cada atividade, validar com `pnpm dev` em `http://localhost:3030`
- Verificar que os novos slides respeitam a paleta colorblind (sem green/orange/red)
- Testar hints passando mouse sobre FlowNodes no browser

## Task Executada
- [x] Análise do gap nos slides atuais (falta explicação das ferramentas)
- [x] Pesquisa web sobre Kong vs NATS vs N8N vs Workflow Engine
- [x] Catálogo completo dos 13 FlowNodes com papel no ecossistema
- [x] Definição dos textos de hint para cada FlowNode
- [x] Priorização das 4 atividades macro
- [x] Atividade 1: Slide "Anatomia do Middleware"
- [x] Atividade 2: Slide "E o N8N?"
- [x] Atividade 3: Hints nos FlowNodes (FlowHintLayer + Teleport + event delegation)
- [x] Atividade 4: Slide Glossário Visual (legenda do mapa antes dos cenários)

## Validação
- Análise validada pelo usuário antes de iniciar implementação
- Priorização aprovada: Anatomia → N8N → Hints → Glossário
- Abordagem para N8N aprovada: posicionar como Worker, não confrontar
- Atividade 3 aprovada: tooltips estilizados com FlowHintLayer + Teleport
- Atividade 4 aprovada: glossário sem distinção ida/volta (ambas tracejadas nos slides)
