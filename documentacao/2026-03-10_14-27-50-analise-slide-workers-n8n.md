# [2026-03-10] - Análise: Slide de Workers e N8N como Worker no Middleware

## Contexto

A apresentação Slidev da POC Middleware (EME4) já menciona o conceito de **Worker** em diversos slides (03, 04, 05), mas sempre no papel restrito de "Tradutor DE-PARA" para sistemas legados. Não existe um slide dedicado a explicar **o que é um Worker**, quais tipos existem e como ele se encaixa na arquitetura de forma mais ampla. Esta análise avalia:

1. Como incluir um slide específico sobre Workers na apresentação
2. A viabilidade de usar o **N8N** como Worker no contexto do Middleware

---

## 1. Estado Atual — Workers na Apresentação

### Onde "Worker" aparece hoje

| Slide | Arquivo | Como é mencionado |
|-------|---------|-------------------|
| **03 — Modelo Novo** | `slides/03-modelo-novo.md` | "Fila NATS + Worker / Tradução DE-PARA + Garantia de entrega". Destaca: "Worker só existe quando há trabalho real a fazer." |
| **04 — Cenários** | `slides/04-cenarios.md` | FlowNode `label="Worker"` nos 3 cenários (LB, Retry, Ambos Fora) — posicionado entre NATS e EME4 |
| **05 — Analogia** | `slides/05-analogia-comparacao.md` | FlowNode Worker no diagrama "Como funcionaria com o MIDDLEWARE" |

### Lacuna identificada

O Worker é apresentado como um **componente fixo** nos diagramas de fluxo, mas nunca é explicado isoladamente:
- O que é um Worker?
- Que tipos de Workers podem existir?
- O Worker é obrigatório ou opcional?
- Pode ser substituído/expandido por ferramentas externas (ex: N8N)?

---

## 2. Proposta — Slide Dedicado a Workers

### Posição recomendada

**Entre o slide 05 (Analogia/Comparação) e o slide 06 (Visão Estratégica).**

Justificativa:
- O slide 05 apresenta os dois modos (Passagem Direta vs. Com Tradutor) — o público já entende o papel básico do Worker
- O slide 06 fala sobre expansão futura (IA, outros módulos) — o slide de Workers faz a ponte natural, mostrando que o Worker é extensível
- Cria uma progressão lógica: **como funciona → o que é o Worker → para onde podemos crescer**

### Alternativa

Inserir como **sub-slide do 03 (Modelo Novo)**, expandindo a explicação ali mesmo. Porém, o slide 03 já tem 2 sub-slides (Passagem Direta e Com Tradutor), ficaria longo demais.

### Conteúdo sugerido para o slide

```
Título: Workers — O Motor do Middleware
Subtítulo: Processamento inteligente entre a fila e o destino

Estrutura visual (3 colunas):

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Worker Tradutor │  │  Worker N8N      │  │  Worker Custom   │
│  ───────────     │  │  ───────────     │  │  ───────────     │
│  • DE-PARA       │  │  • Workflows     │  │  • Código Go     │
│  • Mapeamento    │  │  • Low-code      │  │  • Lógica livre  │
│  • Legados       │  │  • +400 integ.   │  │  • Alta perf.    │
│  • ERP antigos   │  │  • IA/LLM        │  │  • Específico    │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Diagrama de fluxo:
  NATS Queue ──→ [Worker] ──→ EME4 / Sistema Externo
                    │
              ┌─────┴─────┐
              │ Tradutor   │
              │ N8N        │
              │ Custom Go  │
              └────────────┘

Pontos-chave:
- Worker é OPCIONAL (modo Passagem Direta não usa Worker)
- Worker é PLUGÁVEL (pode trocar/adicionar sem alterar a fila)
- Worker escala horizontalmente (múltiplas instâncias)
```

---

## 3. N8N como Worker — Análise de Viabilidade

### O que é o N8N

O [N8N](https://n8n.io/) é uma plataforma de automação de workflows com licença fair-code (Community Edition gratuita para self-hosting). Combina interface visual (low-code/no-code) com a flexibilidade de código customizado (JavaScript/Python).

### N8N na Datainfo — Uso Real Atual

> **O N8N já está em produção na Datainfo**, atuando como microserviço/Worker de consulta para o **Portal Cloud**.

**Arquitetura atual:**

```
Portal Cloud (Frontend) ──HTTP──→ N8N (Worker/Microserviço)
                                      │
                                      │ Queries diretas
                                      ▼
                                  Oracle DB
```

- **Sistema de origem**: Portal Cloud
- **Papel do N8N**: Worker que expõe **APIs de consulta** via webhooks
- **Fonte de dados**: Banco de dados Oracle (acesso direto)
- **Modelo**: N8N funciona como microserviço stateless — recebe request HTTP, executa query no Oracle, retorna JSON

**Isso é um precedente importante** porque:
1. A equipe já conhece e opera o N8N em produção
2. A integração N8N ↔ Oracle já está validada
3. O modelo "N8N como Worker/microserviço" já é realidade na Datainfo
4. Reduz risco de adoção — não é tecnologia nova, é expansão de uso
5. O N8N já se comunica com o mesmo banco Oracle que o EME4 utiliza

### ⚠ Queue Mode do N8N — NÃO RECOMENDADO nesta arquitetura

O N8N possui um modo chamado **Queue Mode** que usa **Redis** como fila interna para distribuir execuções entre instâncias worker. Porém, **este modo compete diretamente com o NATS JetStream** e **NÃO deve ser adotado** no contexto do Middleware:

| Aspecto | Queue Mode (N8N + Redis) | Middleware (NATS JetStream) |
|---------|--------------------------|----------------------------|
| **Fila** | Redis (interna ao N8N) | NATS JetStream |
| **Distribuição** | N8N main → Redis → N8N workers | NATS → Workers (Go / N8N) |
| **Persistência** | Redis (volátil por padrão) | JetStream (persistente) |
| **Retry/Nak** | Lógica interna do N8N | JetStream nativo (backoff exponencial) |
| **Componentes extras** | +Redis, +instâncias N8N worker | Nenhum adicional |

**Problemas do Queue Mode aqui:**
1. **Duplicação de filas** — NATS JetStream já faz o papel que Redis faria no Queue Mode
2. **Complexidade desnecessária** — mais um componente (Redis) para gerenciar, monitorar e escalar
3. **Competição de responsabilidades** — quem faz retry? NATS ou Redis? Quem persiste? Conflito de garantias
4. **Overhead operacional** — manter Redis + múltiplas instâncias N8N vs. NATS que já resolve tudo

**Modelo correto: N8N em modo single (padrão)**, acionado via:
- **Webhook HTTP** (Kong/APISIX faz proxy → N8N) — mesmo modelo do Portal Cloud
- **NATS Subscribe** (via community node) — N8N escuta diretamente o subject

O NATS é a fila. O N8N é apenas o **executor de workflow** — não precisa de fila própria.

### Integração N8N ↔ NATS

Existem **community nodes** para NATS no N8N:

| Pacote | Recursos | Status |
|--------|----------|--------|
| [`n8n-nodes-nats`](https://github.com/NarHakobyan/n8n-nodes-nats) | Publish/Subscribe em subjects NATS | v0.3.0 (Dez/2025), MIT |
| [`@zetanova/n8n-nodes-nats`](https://www.npmjs.com/package/@zetanova/n8n-nodes-nats) | Alternativa com funcionalidades similares | Disponível no npm |

**Fluxo de integração proposto:**

```
                    ┌──────────────────────────────┐
NATS JetStream ──→  │ N8N (Trigger: NATS Subscribe) │
                    │   ↓                           │
                    │ Transformação DE-PARA          │
                    │ Enriquecimento de dados        │
                    │ Validação / Regras de negócio  │
                    │   ↓                           │
                    │ HTTP Request → EME4 / ERP      │
                    └──────────────────────────────┘
```

1. N8N assina um subject NATS (ex: `middleware.erp.pedidos`)
2. Ao receber mensagem, executa workflow de transformação
3. Envia resultado via HTTP para o destino (EME4, ERP externo)
4. Em caso de erro, o workflow pode fazer Nak (devolver à fila) ou registrar falha

### Casos de Uso do N8N como Worker

#### 3.0 — APIs de Consulta para o Portal Cloud (JÁ EM PRODUÇÃO)
- Portal Cloud chama N8N via HTTP (webhook)
- N8N executa queries diretamente no Oracle
- Retorna dados formatados em JSON para o Portal
- **Realidade**: já em operação na Datainfo — prova que N8N funciona como Worker/microserviço
- **Expansão natural**: ao integrar com o Middleware, o N8N poderia receber chamadas via NATS (além de HTTP) e servir como Worker para o EME4 com a mesma stack já dominada pela equipe

#### 3.1 — Tradução DE-PARA para ERPs Legados
- Recebe pedido no formato EME4 via NATS
- Workflow mapeia campos (código produto, unidade, cliente) para formato do ERP legado
- Envia via HTTP/SOAP para o ERP
- **Vantagem**: mapeamento visual, fácil de alterar sem recompilar código

#### 3.2 — Integração com IA/LLM
- Recebe dados via NATS (ex: texto de um chamado)
- Workflow chama API da OpenAI/Claude para classificação ou extração
- Retorna resultado ao EME4 via NATS ou HTTP
- **Vantagem**: N8N tem conectores nativos para OpenAI, Hugging Face, Cohere

#### 3.3 — Sincronização Multi-Sistema
- Recebe evento de atualização do EME4
- Workflow distribui para múltiplos destinos: CRM, dashboard, e-mail
- Fan-out visual com tratamento de erro por destino
- **Vantagem**: +400 integrações prontas (Slack, Teams, Salesforce, ERPNext, etc.)

#### 3.4 — Validação e Enriquecimento de Dados
- Antes de entregar ao destino, valida CPF/CNPJ, consulta CEP, normaliza dados
- Workflow com branches condicionais (aprovado/rejeitado)
- **Vantagem**: lógica visual, testável passo a passo

#### 3.5 — Orquestração de Processos de Negócio
- Processos com múltiplas etapas (aprovação → processamento → notificação)
- Workflow com espera (wait node), condições e loops
- **Vantagem**: BPM visual sem precisar de engine dedicada

### Vantagens do N8N como Worker

| Aspecto | Benefício |
|---------|-----------|
| **Custo** | Community Edition gratuita (self-hosted), sem custo de licença |
| **Visual** | Interface drag-and-drop para criar/editar transformações |
| **Velocidade** | Novas integrações em horas, não dias |
| **Integrações** | +400 conectores prontos (ERPs, CRMs, APIs, bancos de dados) |
| **IA Nativa** | Conectores para LLMs (OpenAI, Claude, Hugging Face) |
| **Escalabilidade** | Queue Mode com workers horizontais |
| **Monitoramento** | UI com histórico de execuções, logs e debugging visual |
| **Self-hosted** | Dados ficam na infraestrutura da Datainfo |
| **Já em uso** | Em produção no Portal Cloud da Datainfo — equipe já domina a ferramenta |
| **Oracle validado** | Integração N8N ↔ Oracle já testada e operacional |

### Limitações e Riscos

| Aspecto | Risco | Mitigação |
|---------|-------|-----------|
| **Performance** | N8N (Node.js) é mais lento que Worker Go nativo | Usar para fluxos de baixa/média frequência; Worker Go para alta performance |
| **NATS JetStream** | Community nodes não suportam JetStream avançado | Usar webhook HTTP como trigger principal; Kong/APISIX faz proxy → N8N |
| **Maturidade** | Community nodes NATS têm poucos stars (3) | Testar extensivamente; ter fallback para trigger HTTP (modelo Portal Cloud) |
| **Complexidade** | Mais um componente na stack | Justificável apenas se houver demanda real de workflows visuais |
| **⚠ Queue Mode** | Compete com NATS — Redis duplica papel de fila, conflito de garantias | **NÃO usar Queue Mode**; manter N8N em modo single, acionado via webhook ou NATS subscribe |

### Arquitetura Proposta — N8N no Middleware

```
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                         │
│                   (Kong / APISIX)                        │
└────────┬──────────────────┬─────────────────┬──────────┘
         │                  │                 │
  Passagem Direta    Fila NATS JetStream    Proxy HTTP
  (IA, Dashboards)         │                  │
         │           ┌─────┴─────┐            │
         ▼           │           │            ▼
      EME4      Worker Go    NATS Sub    Worker N8N
    (direto)   (alta perf)      └────→  (modo single)
                     │                      │
                     ▼                      ▼
                  EME4               ERP Legado / IA
               (tradução             Oracle / Multi-
                DE-PARA)             sistema / LLM

  ┌─────────────────────────────────────────────────────┐
  │  ⚠ NATS = ÚNICA FILA da arquitetura                │
  │  N8N roda em modo SINGLE (sem Queue Mode/Redis)    │
  │  N8N é acionado via webhook HTTP ou NATS subscribe  │
  └─────────────────────────────────────────────────────┘

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  JÁ EM PRODUÇÃO NA DATAINFO (Portal Cloud):

  Portal Cloud ──HTTP──→ N8N (modo single) ──SQL──→ Oracle DB
                         (APIs de consulta)
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```

---

## 4. Recomendação

### Para o slide

1. **Criar um novo slide** `slides/05b-workers.md` (ou renumerar para `slides/05.5`)
2. Posicionar **após slide 05** (Analogia) e **antes do slide 06** (Visão Estratégica)
3. Conteúdo: explicar os 3 tipos de Worker (Tradutor, N8N, Custom) com diagrama visual
4. Incluir v-clicks para revelar progressivamente cada tipo

### Para o N8N

1. **Já validado na Datainfo** — o N8N opera em produção como Worker/microserviço do Portal Cloud, com integração Oracle comprovada
2. **Viável como Worker do Middleware** para fluxos de **baixa/média frequência** com necessidade de:
   - Mapeamento visual DE-PARA
   - Integrações multi-sistema (+400 conectores)
   - Workflows com IA/LLM
   - Orquestração de processos de negócio
   - APIs de consulta ao Oracle (mesmo modelo já usado no Portal Cloud)
3. **Não substituir** o Worker Go nativo para fluxos de **alta performance**
4. **Estratégia híbrida**: Worker Go para tradução EME4 (alta frequência) + Worker N8N para integrações complexas e consultas (baixa/média frequência)
5. Alinha perfeitamente com a **Fase 3 da Visão Estratégica** (agentes IA)
6. **Argumento forte para a diretoria**: não é adoção de tecnologia nova — é expansão de uso de ferramenta já dominada

### Próximos passos

- [ ] Criar o slide de Workers na apresentação
- [ ] Incluir caso de uso real (Portal Cloud) no slide como prova de conceito já existente
- [ ] Prototipar integração N8N ↔ NATS com community node
- [ ] Benchmark: Worker Go vs. Worker N8N em cenário equivalente
- [ ] Avaliar se N8N entra no escopo da POC ou fica para Fase 2

---

## 5. Autenticação no Middleware — Simplificação com EME4

### O problema da sessão stateful

O EME4 usa sessões em memória do servidor (`TDictionary<string, TConexao>`). Cada sessão é uma thread dedicada com conexão própria ao banco. Isso causa:
- Sessão presa a um servidor específico
- LB exige sticky session ou session pool
- Keep-alive periódico (`CONEXAOATIVA`)
- Complexidade no Worker para gerenciar pool de sessões

Análise completa em: `POC-Middleware-Sessoes-e-LoadBalancing.md`

### Proposta: EME4 sem autenticação na rede interna

Se o EME4 estiver em **rede privada** e acessível **apenas pelo Middleware**, a autenticação pode ser removida sem falha de segurança. A autenticação acontece no Kong (borda), não no EME4 (interno).

```
┌─────────────── REDE PÚBLICA ─────────────────┐
│  Cliente ──→ 🔒 Kong (API Key/JWT) ──┐       │
└──────────────────────────────────────┼───────┘
                                       │
┌─────────────── REDE PRIVADA ─────────┼───────┐
│  Kong ──→ NATS ──→ Worker ──→ EME4 (sem auth)│
│                                               │
│  ⚠ EME4 NÃO acessível de fora (firewall)     │
└───────────────────────────────────────────────┘
```

**Condições de segurança:**

| Requisito | Justificativa |
|-----------|---------------|
| EME4 em rede privada | Não exposto à internet |
| Firewall: apenas Worker/Kong → EME4 | Nenhum outro acesso direto |
| Kong autentica todo acesso externo | API Key/JWT na borda |
| VLAN/subnet isolada | Segregação de rede |

É o mesmo modelo de qualquer banco de dados: PostgreSQL/Oracle não fica exposto na internet, só a aplicação acessa.

### Opções de implementação

| Opção | Mudança no EME4 | Como funciona |
|-------|-----------------|---------------|
| **A — IP Whitelist** | Configuração | IPs do Worker/Kong → pula auth |
| **B — Header de confiança** | Mínima | Header `X-Internal-Token` com chave fixa → pula auth |
| **C — Conta de serviço** | Média | Sessão permanente, nunca expira |

### Impacto na arquitetura

| Aspecto | Com sessão (hoje) | Sem auth (rede privada) |
|---------|-------------------|------------------------|
| **Complexidade Worker** | Alta (session pool, keep-alive) | **Mínima** |
| **Load Balancing** | Sticky/pool | **Round-robin puro** |
| **Failover** | Recriar sessão | **Transparente** |
| **Performance** | Overhead de sessão | **Zero overhead** |
| **Mudança no EME4** | Nenhuma | IP whitelist ou header |

### Impacto no Kong — Abstração de auth para 6 sistemas

Com a autenticação centralizada no Kong, o cenário dos 6 sistemas Datainfo fica:

**Sem Middleware** — cliente precisa gerenciar:

| Sistema | Autenticação |
|---------|-------------|
| EME4 | Sessão ANSI/Latin-1 (stateful) |
| BR-Conselho | Token/JWT |
| Previva | API Key |
| Gesti | Usuário/senha Oracle |
| Service | SOAP/WS-Security |
| N8N | Bearer token |

= 6 métodos, 6 credenciais, 6 fluxos de login

**Com Middleware** — cliente precisa de:

```
1 API Key no Kong → Kong traduz auth por rota:
  /api/eme4/*        → IP whitelist (sem auth) ou header interno
  /api/br-conselho/* → Kong injeta JWT
  /api/previva/*     → Kong injeta API Key
  /api/gesti/*       → Proxy via N8N (já em produção)
  /api/service/*     → Kong monta envelope SOAP
  /api/n8n/*         → Kong injeta Bearer token
```

= 1 método, 1 credencial, 1 fluxo de login

### Recomendação

Para a POC: adotar **Opção A (IP Whitelist)** ou **Opção B (Header de confiança)** no EME4. Elimina toda complexidade de sessão, simplifica o Worker e permite LB round-robin puro.

---

## Implementação

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `slides/05b-workers.md` (novo) | Slide dedicado explicando Workers + N8N |
| `slides.md` | Adicionar import do novo slide após slide 05 |
| `slides/06-visao-estrategica.md` | Possivelmente referenciar N8N na timeline de expansão |

### Decisões técnicas

- Slide de Workers usa mesma paleta colorblind (cyan, fuchsia, purple)
- FlowNodes reutilizáveis para os tipos de Worker
- Manter padrão de header: `# Título` + `gradient-subtitle` + `gradient-divider`

---

## Validação

- [x] Análise completa da apresentação existente
- [x] Identificação de lacuna (Workers não explicado isoladamente)
- [x] Posição ideal para o novo slide definida
- [x] N8N analisado como Worker viável
- [x] Casos de uso documentados (5 cenários)
- [x] Vantagens e limitações mapeadas
- [x] Arquitetura híbrida proposta
- [x] Queue Mode N8N descartado (compete com NATS)
- [x] Autenticação centralizada no Kong analisada (6 sistemas)
- [x] EME4 sem auth em rede privada — viável e seguro
- [x] Cruzamento com doc de Sessões e LB
- [ ] Implementação do slide (pendente aprovação)
- [ ] Prototipação N8N ↔ NATS (pendente decisão de escopo)

---

## Fontes

- [N8N — Plataforma de Automação](https://n8n.io/)
- [N8N Queue Mode — Docs](https://docs.n8n.io/hosting/scaling/queue-mode/)
- [N8N Scaling Overview — Docs](https://docs.n8n.io/hosting/scaling/overview/)
- [n8n-nodes-nats — Community Node NATS](https://github.com/NarHakobyan/n8n-nodes-nats)
- [@zetanova/n8n-nodes-nats — npm](https://www.npmjs.com/package/@zetanova/n8n-nodes-nats)
- [NATS.io Integration — N8N Community](https://community.n8n.io/t/nats-io-integration/47969)
- [N8N Deep Dive 2026 — Architecture](https://jimmysong.io/blog/n8n-deep-dive/)
- [N8N Self-Host Guide 2026 — Northflank](https://northflank.com/blog/how-to-self-host-n8n-setup-architecture-and-pricing-guide)
- [Top 15 N8N Use Cases 2025](https://medium.com/@reliabledataengineering/the-top-15-n8n-use-cases-that-are-revolutionizing-workflow-automation-in-2025-cbe08df08702)
- [N8N Case Studies](https://n8n.io/case-studies/)
