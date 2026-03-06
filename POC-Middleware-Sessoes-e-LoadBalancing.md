# Gestão de Sessões EME4 e Load Balancing no Middleware

## O Problema: Sessões Stateful do EME4

**Data:** 04/03/2026
**Versão:** 1.0
**Público-alvo:** Time técnico, Diretoria

---

## 1. Como o EME4 Gerencia Sessões Hoje

A investigação do código-fonte revelou que o EME4 usa um modelo de **sessão stateful em memória do servidor**. Isso significa que a sessão vive e morre dentro de um servidor específico.

### 1.1 Fluxo de Autenticação do EME4

```
Cliente                              Servidor EME4
   │                                       │
   │── POST /AUTENTICAR ─────────────────>│
   │   Headers:                            │
   │     Login: usuario                    │
   │     Password: senha                   │
   │     Company: empresa                  │
   │                                       │── Cria TConexao (thread dedicada)
   │                                       │── Gera GUID como SessionId
   │                                       │── Cria TxbSession (acesso ao banco)
   │                                       │── Armazena no dicionário em memória:
   │                                       │   FSessoes['GUID-ABC'] = TConexao
   │                                       │
   │<── Response 200 ─────────────────────│
   │   Headers:                            │
   │     Session-Id: GUID-ABC-123-...     │
   │     SessionTimeout: 600000 (ms)       │
   │                                       │
   │                                       │
   │── POST /Incluir_API ────────────────>│
   │   Headers:                            │
   │     Session-Id: GUID-ABC-123-...     │── Busca no dicionário: FSessoes['GUID-ABC']
   │                                       │── Encontrado! Processa requisição
   │<── Response 200 ─────────────────────│
   │                                       │
```

### 1.2 Detalhes Técnicos Encontrados no Código

| Aspecto | Implementação |
|---------|--------------|
| **Identificador** | GUID gerado via `CreateGUID` (header `Session-Id`) |
| **Armazenamento** | `TDictionary<string, TConexao>` — dicionário em memória RAM |
| **Estrutura** | Cada sessão cria uma **thread dedicada** (`TConexao` herda de `TThread`) |
| **Cada thread tem** | Conexão própria ao banco (`TFDConnection`) + `TxbSession` |
| **Keep-alive** | Cliente envia `CONEXAOATIVA` a cada `SessionTimeout/2` |
| **Timeout** | Configurável (~10min default). Inatividade = sessão destruída |
| **Renovação** | Se recebe HTTP 401, cliente reautentica silenciosamente |
| **Multi-servidor** | **Não suportado** — sessões não são compartilhadas entre servidores |

### 1.3 O Problema com Load Balancing

```
                                           Servidor EME4-A
                                           Sessoes = {
                                             'GUID-123': TConexao (ativa)
                                           }
                                                │
Worker ── POST (Session-Id: GUID-123) ──> Load Balancer
                                                │
                                           Servidor EME4-B
                                           Sessoes = {
                                             (vazio — não conhece GUID-123!)
                                           }

Se o Load Balancer enviar para EME4-B:
  → Sessão não encontrada
  → HTTP 401 (Conexão perdida)
  → Precisa reautenticar (cria sessão NOVA no servidor B)
  → Sessão do servidor A fica "órfã" consumindo memória e thread
```

---

## 2. Soluções no Middleware

Existem **4 estratégias** para resolver este problema. Vamos da mais simples à mais robusta:

### Estratégia 1: Sticky Sessions (Session Affinity)

**Conceito:** O Load Balancer garante que todas as requisições de uma mesma sessão sempre vão para o **mesmo servidor**.

```
Worker              Kong/APISIX (Load Balancer)         EME4 Servidores
   │                        │                           ┌──────────────┐
   │── Session: GUID-123 ──>│                           │ Servidor A   │
   │                        │── Hash(GUID-123) = A ────>│ (tem GUID-123│
   │                        │                           │  em memória) │
   │                        │                           └──────────────┘
   │                        │                           ┌──────────────┐
   │── Session: GUID-456 ──>│                           │ Servidor B   │
   │                        │── Hash(GUID-456) = B ────>│ (tem GUID-456│
   │                        │                           │  em memória) │
   │                        │                           └──────────────┘
   │                        │
   │  SEMPRE: GUID-123 → Servidor A
   │  SEMPRE: GUID-456 → Servidor B
```

**Como configurar no Kong/APISIX:**

```
Upstream: eme4-servers
  Algoritmo: Consistent Hashing
  Hash On: header → Session-Id

  Targets:
    - eme4-server-A:8080 (peso: 100)
    - eme4-server-B:8080 (peso: 100)
```

| Prós | Contras |
|------|---------|
| Simples de implementar | Se o servidor cai, TODAS as sessões dele se perdem |
| Não requer mudança no EME4 | Distribuição pode ficar desigual |
| Kong/APISIX suportam nativamente | Não é verdadeiro Load Balancing (mesma sessão = mesmo server) |
| Funciona imediatamente | |

**Recomendação:** Bom para a POC. Solução rápida e pragmática.

---

### Estratégia 2: Session Pool no Worker (recomendada para a POC)

**Conceito:** Cada Worker mantém **uma sessão fixa** para cada servidor EME4. O Worker gerencia o pool de sessões e escolhe qual usar. Não depende do Load Balancer do Kong/APISIX para distribuir — o próprio Worker sabe para qual servidor enviar.

```
┌──────────────────────────────────────────────────────────────────┐
│                          WORKER                                  │
│                                                                  │
│  Session Pool:                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ Sessão A            │  │ Sessão B            │              │
│  │ Server: EME4-A      │  │ Server: EME4-B      │              │
│  │ Session-Id: GUID-1  │  │ Session-Id: GUID-2  │              │
│  │ Status: Ativa       │  │ Status: Ativa       │              │
│  │ Keep-alive: ativo   │  │ Keep-alive: ativo   │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  Ao receber mensagem da fila NATS:                              │
│  1. Escolhe sessão com menor carga (ou round-robin)             │
│  2. Envia direto para o servidor daquela sessão                 │
│  3. Se sessão expirou → reautentica automaticamente             │
│  4. Se servidor caiu → usa sessão do outro servidor             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Fluxo detalhado:**

```
NATS            WORKER (com Session Pool)                EME4 Servidores
  │                     │                                ┌──────────────┐
  │── Mensagem OP1 ────>│                                │ Servidor A   │
  │                     │── Pool: Sessão A (GUID-1) ────>│              │
  │                     │<── OK ─────────────────────────│              │
  │<── ACK ─────────────│                                └──────────────┘
  │                     │                                ┌──────────────┐
  │── Mensagem OP2 ────>│                                │ Servidor B   │
  │                     │── Pool: Sessão B (GUID-2) ────>│              │
  │                     │<── OK ─────────────────────────│              │
  │<── ACK ─────────────│                                └──────────────┘
  │                     │
  │── Mensagem OP3 ────>│                                ┌──────────────┐
  │                     │── Pool: Sessão A (menos carga)>│ Servidor A   │
  │                     │<── OK ─────────────────────────│              │
  │<── ACK ─────────────│                                └──────────────┘
  │                     │
  │── Mensagem OP4 ────>│                                ┌──────────────┐
  │                     │── Sessão A → Servidor A CAIU!  │ Servidor A X │
  │                     │── Detecta falha                └──────────────┘
  │                     │── Fallback: Sessão B           ┌──────────────┐
  │                     │── Pool: Sessão B (GUID-2) ────>│ Servidor B   │
  │                     │<── OK ─────────────────────────│              │
  │<── ACK ─────────────│                                └──────────────┘
```

| Prós | Contras |
|------|---------|
| Controle total das sessões no Worker | Precisa implementar a lógica de pool |
| Sessões pré-autenticadas (sem delay) | Worker precisa fazer keep-alive |
| Failover inteligente (Worker sabe qual servidor está vivo) | Mais código no Worker |
| Não desperdiça sessões | |
| Não depende de sticky session no LB | |
| Reutiliza a mesma sessão para múltiplas mensagens | |

**Recomendação:** Melhor custo-benefício. O Worker já existe e já faz a transformação DE-PARA — adicionar session pool é natural.

---

### Estratégia 3: Session Gateway (camada intermediária)

**Conceito:** Um micro-serviço entre o Worker e o EME4 que abstrai completamente a gestão de sessões. Todos os Workers enviam requisições sem se preocupar com sessão, e o Session Gateway adiciona o header correto.

```
Workers              Session Gateway              EME4 Servidores
  │                        │                       ┌──────────────┐
  │── POST (sem sessão) ──>│                       │ Servidor A   │
  │                        │── Tem sessão ativa? ──│              │
  │                        │── Sim → usa GUID-1    │              │
  │                        │── POST + GUID-1 ─────>│              │
  │<── Resposta ───────────│<── OK ────────────────│              │
  │                        │                       └──────────────┘
  │                        │
  │                        │  Se sessão expirou:
  │                        │── Autentica ──────────>│ Servidor A
  │                        │<── Nova GUID ─────────│
  │                        │── POST + Nova GUID ──>│
```

| Prós | Contras |
|------|---------|
| Workers ficam simples (stateless) | Mais um componente para manter |
| Sessões centralizadas | Ponto único de falha (pode ter redundância) |
| Reutilização máxima de sessões | Complexidade adicional |
| Facilita adicionar novos Workers | |

**Recomendação:** Ideal para produção em escala, mas pode ser exagero para a POC.

---

### Estratégia 4: Modificar o EME4 para Stateless (longo prazo)

**Conceito:** Alterar o EME4 para usar autenticação stateless (JWT/Token), eliminando o problema na raiz.

```
Hoje (Stateful):
  POST /Incluir_API
  Header: Session-Id: GUID-123  ← preso ao servidor que criou

Futuro (Stateless):
  POST /Incluir_API
  Header: Authorization: Bearer eyJhbG...  ← JWT verificável por QUALQUER servidor
```

| Prós | Contras |
|------|---------|
| Elimina o problema na raiz | Requer alteração no código do EME4 |
| Qualquer servidor processa qualquer requisição | Impacto em todo o sistema |
| Load Balancing perfeito | Esforço de desenvolvimento significativo |
| Padrão da indústria | Fora do escopo da POC |

**Recomendação:** Evolução futura. Não para a POC.

---

## 3. Comparação das Estratégias

| Critério | 1. Sticky Session | 2. Session Pool (Worker) | 3. Session Gateway | 4. Stateless |
|----------|-------------------|--------------------------|-------------------|-------------|
| **Complexidade** | Baixa | Média | Alta | Muito Alta |
| **Mudança no EME4** | Nenhuma | Nenhuma | Nenhuma | Total |
| **Failover** | Perda de sessões | Worker gerencia | Gateway gerencia | Nativo |
| **Performance** | Boa | Muito boa | Boa | Excelente |
| **Sessões desperdiçadas** | Possível | Mínimo | Mínimo | N/A |
| **Para a POC** | Viável | **Recomendado** | Overkill | Fora de escopo |
| **Para Produção** | Aceitável | **Recomendado** | Ideal | Ideal (longo prazo) |

---

## 4. Recomendação para a POC: Estratégia 2 (Session Pool no Worker)

### Por que esta estratégia?

1. **Não precisa mudar o EME4** — o sistema continua funcionando como sempre
2. **O Worker já existe** — ele já faz a tradução DE-PARA, adicionar session pool é extensão natural
3. **Controle total** — o Worker sabe exatamente qual servidor tem qual sessão
4. **Keep-alive automático** — o Worker mantém as sessões vivas (igual ao cliente EME4 faz hoje)
5. **Failover inteligente** — se um servidor cai, o Worker redireciona para outro e cria nova sessão
6. **Performance** — sessões pré-autenticadas, sem delay de login a cada mensagem

### Diagrama da Solução Completa

```
PROTHEUS        KONG/APISIX         NATS JetStream      WORKER (com Session Pool)     EME4
   │            (Entrada)                │                  │                            │
   │─ POST ────>│                        │                  │                            │
   │            │─ Auth ────────────────>│                  │                            │
   │            │─ Publish ────────────>│                  │                            │
   │<── 202 ────│                        │                  │                            │
   │            │                        │                  │                            │
   │            │                        │─ Deliver ───────>│                            │
   │            │                        │                  │                            │
   │            │                        │                  │  ┌─ Pool de Sessões ────┐  │
   │            │                        │                  │  │ SrvA: GUID-1 (ativa) │  │
   │            │                        │                  │  │ SrvB: GUID-2 (ativa) │  │
   │            │                        │                  │  └──────────────────────┘  │
   │            │                        │                  │                            │
   │            │                        │                  │── Escolhe melhor sessão ──>│
   │            │                        │                  │   Header: Session-Id       │
   │            │                        │                  │<── Sucesso ────────────────│
   │            │                        │<── ACK ──────────│                            │
   │            │                        │                  │                            │
   │            │                        │                  │── Keep-alive periódico ───>│
   │            │                        │                  │   (CONEXAOATIVA)           │
   │            │                        │                  │<── OK ─────────────────────│
```

### Comportamento do Session Pool

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION POOL - Regras                        │
│                                                                 │
│  INICIALIZAÇÃO:                                                 │
│    Para cada servidor EME4 configurado:                         │
│      1. Conecta (POST /AUTENTICAR com Login/Password/Company)  │
│      2. Recebe Session-Id (GUID)                                │
│      3. Armazena: { server, sessionId, lastUsed, healthy }     │
│      4. Inicia timer de keep-alive (SessionTimeout / 2)        │
│                                                                 │
│  AO RECEBER MENSAGEM DA FILA:                                  │
│    1. Filtra sessões healthy = true                             │
│    2. Escolhe a com menor uso recente (least recently used)     │
│    3. Envia requisição com Header Session-Id                    │
│    4. Se OK → marca lastUsed = agora                           │
│    5. Se 401 → reautentica nesse servidor                      │
│    6. Se timeout/erro conexão → marca healthy = false           │
│       e tenta próxima sessão disponível                         │
│                                                                 │
│  KEEP-ALIVE (timer periódico):                                  │
│    Para cada sessão ativa:                                      │
│      1. Envia CONEXAOATIVA para o servidor                      │
│      2. Se OK → atualiza lastKeepAlive                         │
│      3. Se falha → marca healthy = false                       │
│                                                                 │
│  HEALTH CHECK (timer periódico):                                │
│    Para cada sessão unhealthy:                                  │
│      1. Tenta reconectar (AUTENTICAR)                          │
│      2. Se OK → marca healthy = true, atualiza sessionId       │
│      3. Se falha → mantém unhealthy, tenta novamente depois    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Outros Modelos de Autenticação e como o Middleware lida

O EME4 usa sessão stateful, mas em integrações futuras podemos encontrar outros modelos. O Middleware resolve todos:

| Modelo de Auth | Como funciona | Como o Middleware resolve |
|---------------|---------------|--------------------------|
| **Sessão (EME4)** | Session-Id em header, preso ao servidor | Session Pool no Worker (Estratégia 2) |
| **Token Bearer/JWT** | Token no header `Authorization`, sem estado no servidor | Load Balancing puro — qualquer servidor aceita o token |
| **OAuth2** | Token temporário obtido via `/token`, expira | Worker renova token antes de expirar (token refresh) |
| **API Key** | Chave fixa no header | Load Balancing puro — chave aceita por qualquer servidor |
| **Cookie** | Cookie HTTP, tipicamente preso ao servidor | Sticky Session no Kong/APISIX (hash no cookie) |
| **Basic Auth** | Login/senha a cada requisição | Load Balancing puro — cada request é independente |
| **mTLS** | Certificado cliente, sem estado | Load Balancing puro — certificado aceito por qualquer servidor |

### Visão de como cada modelo se comporta com Load Balancing:

```
STATELESS (Token, JWT, API Key, Basic, mTLS):
┌────────┐     ┌──────────┐     ┌───────────┐
│ Worker │────>│    LB    │──┬─>│ Server A  │  Qualquer servidor
│        │     │          │  ├─>│ Server B  │  processa qualquer
│        │     │          │  └─>│ Server C  │  requisição.
└────────┘     └──────────┘     └───────────┘
                                 Load Balancing puro.
                                 Sem complicação.

STATEFUL (Session, Cookie):
┌────────┐     ┌──────────────────────┐     ┌───────────┐
│ Worker │────>│ Session Pool ou      │────>│ Server A  │  Sessão 1 → sempre Server A
│        │     │ Sticky Session       │────>│ Server B  │  Sessão 2 → sempre Server B
│        │     │ (gerencia afinidade) │     └───────────┘
└────────┘     └──────────────────────┘
                Precisa de gestão.
                Middleware resolve com Session Pool.
```

---

## 6. Resumo para a Diretoria

### O Problema
O EME4 usa sessões que ficam "presas" a um servidor específico (como ter uma chave que só abre uma porta). Se distribuirmos requisições entre vários servidores, a sessão não é encontrada no servidor "errado".

### A Solução
O Middleware (Worker) mantém sessões pré-abertas em cada servidor do EME4 — como ter uma cópia da chave de cada porta. Quando precisa entregar uma mensagem, escolhe a porta menos ocupada e usa a chave certa.

### O que muda para o EME4?
**Nada.** O EME4 continua funcionando exatamente como hoje. O Worker é que faz a gestão inteligente das sessões.

### E se quisermos integrar com outros sistemas no futuro?
O Middleware lida com qualquer modelo de autenticação: sessões, tokens, JWT, API Keys, certificados. Cada sistema pode usar seu modelo — o Worker se adapta.

---

> **Conclusão:** A sessão stateful do EME4 não é impedimento para o Load Balancing. A Estratégia 2 (Session Pool no Worker) resolve o problema sem alterar o EME4, mantendo os benefícios de distribuição de carga e failover automático.
