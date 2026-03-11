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
- **Escopo**: Adicionar atributo `title` ou componente tooltip no FlowNode.vue
- **Cobertura**: Todos os 13 tipos de FlowNodes identificados nos slides:
  - ORIGEM/ERP Externo: "Qualquer sistema externo que precisa enviar ou consultar dados no EME4"
  - KONG: "API Gateway — valida credenciais, distribui carga, limita requisições"
  - NATS: "Message Broker — recebe mensagens e garante que não se percam"
  - Worker: "Consome mensagens da fila e executa a lógica de integração"
  - EME4: "Sistema provedor (destino). Recebe chamadas normais da API"
  - Monitor: "Assinante que consome eventos para gerar métricas e alertas"
  - Garçom (analogia): "Equivale ao Kong — recebe o pedido e encaminha para a cozinha"
  - Comanda (analogia): "Equivale ao NATS — o pedido não se perde na fila"
  - Cozinheiro (analogia): "Equivale ao Worker — pega a comanda e prepara o prato"
  - N8N: "Ferramenta de automação visual — aqui aparece como sistema provedor/destino"
- **Prop nova no FlowNode.vue**: `hint` (String, opcional) — renderiza como `title` no div principal

#### Atividade 4 — Slide Glossário Visual
- **Posição**: Antes dos cenários (slide 04)
- **Conteúdo**: Todos os FlowNodes com ícone + cor + hint, tipo legenda de mapa
- **Usa os mesmos textos dos hints** da Atividade 3

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
- [x] Atividade 3: Hints nos FlowNodes
- [ ] Atividade 4: Slide Glossário Visual

## Validação
- Análise validada pelo usuário antes de iniciar implementação
- Priorização aprovada: Anatomia → N8N → Hints → Glossário
- Abordagem para N8N aprovada: posicionar como Worker, não confrontar
