# Integração Protheus x EME4: Modelo Atual vs Middleware

## Por que estamos propondo uma mudança?

**Data:** 04/03/2026
**Versão:** 2.0
**Público-alvo:** Diretoria, time EME4, time Protheus
**Changelog v2:** Adicionado Load Balancing das APIs EME4. Adicionada seção de performance e porquê NATS e Kong/APISIX são confiáveis e rápidos.

---

## 1. Como funciona HOJE (Modelo Direto - API para API)

### A ideia é simples:

O Protheus chama diretamente a API do EME4. É como fazer uma **ligação telefônica**: você liga, a outra pessoa precisa atender, vocês conversam, e pronto.

```
┌───────────┐                              ┌───────────┐
│           │   POST /Incluir_API          │           │
│ PROTHEUS  │─────────────────────────────>│   EME4    │
│           │                              │ (1 servidor│
│           │<─────────────────────────────│  sozinho)  │
│           │   { "Sucesso": true }        │           │
└───────────┘                              └───────────┘

Se o EME4 estiver ocupado, lento, ou fora do ar...
o Protheus fica esperando ou recebe um erro.
```

### Como funciona passo a passo:

1. O Protheus monta um JSON com os dados (ex: uma Ordem de Produção)
2. O Protheus faz uma chamada HTTP direta para o EME4 (ex: `POST /DoctoOrdProducaoManufatura/Incluir_API`)
3. O EME4 recebe, processa, e devolve uma resposta
4. O Protheus recebe a resposta e segue em frente

### O problema do servidor único:

```
PROTHEUS                                       EME4 (1 servidor)
   │                                                │
   │── OP 1 ──────────────────────────────────────>│  Processando...
   │   (esperando 3s...)                            │
   │<─────────────────────────── OK ────────────────│
   │                                                │
   │── OP 2 ──────────────────────────────────────>│  Processando...
   │   (esperando 3s...)                            │
   │<─────────────────────────── OK ────────────────│
   │                                                │
   │── OP 3 ──────────────────────────────────────>│  OCUPADO!
   │   (esperando 10s... timeout!)                  │  Fila interna
   │<─────────────────────────── ERRO ──────────────│
   │                                                │
   │  Total: 16s para 3 OPs (com 1 erro)           │
```

---

## 2. Como funcionaria com o MIDDLEWARE (Modelo Novo - Kong/APISIX + NATS)

### A ideia também é simples:

O Middleware é como uma **portaria inteligente** que fica entre quem pede e quem atende. Dependendo do que precisa ser feito, a portaria trabalha de dois jeitos:

### Modo 1: Passagem direta (sem tradutor)

Quando quem pede e quem atende **falam a mesma língua**, a portaria apenas distribui entre os atendentes disponíveis. Sem intermediário.

```
┌───────────┐     ┌──────────────────────────┐     ┌──────────────────┐
│           │     │       MIDDLEWARE          │     │ EME4 Servidor 1  │
│ Agente IA │────>│  KONG/APISIX             │──┬─>│ (menos ocupado)  │
│ (futuro)  │<────│  (portaria + distribuidor)│──┤  └──────────────────┘
│           │     │                          │  │  ┌──────────────────┐
└───────────┘     │  Sem fila. Sem tradutor. │  └─>│ EME4 Servidor 2  │
                  │  Direto e rápido.        │     └──────────────────┘
                  └──────────────────────────┘
```

**Quando usar:** Quando o sistema que chama já sabe montar o pedido no formato que o EME4 entende. Exemplos futuros: agente de IA consultando status de OP, dashboard buscando dados.

**O que se ganha mesmo sem tradutor:**
- Distribuição de carga entre servidores (Load Balancing)
- Se um servidor cai, o outro assume (Failover)
- Autenticação na portaria (não precisa saber a senha de cada servidor)
- Controle de vazão (não sobrecarrega)
- Registro de tudo que passou (Logging)

### Modo 2: Com tradutor (quando há trabalho a fazer)

Quando quem pede fala uma **língua diferente** de quem atende (como Protheus falando "SG1/SC2" e EME4 esperando "ListaMateriaisProduto/DoctoOrdProducao"), entra o tradutor (Worker).

```
┌───────────┐     ┌──────────────────────────────────┐     ┌──────────────────┐
│           │     │           MIDDLEWARE              │     │ EME4 Servidor 1  │
│           │     │                                    │  ┌─>│ (menos ocupado)  │
│ PROTHEUS  │────>│ KONG/APISIX ─> NATS ─> Tradutor ──│──┤  └──────────────────┘
│           │<────│ (portaria)   (correio) (carteiro)  │  │  ┌──────────────────┐
│           │     │                  +                 │  └─>│ EME4 Servidor 2  │
│           │     │           Load Balancer             │     │ (backup/escala)  │
└───────────┘     └──────────────────────────────────┘     └──────────────────┘
```

**Quando usar:** Quando precisa traduzir campos, garantir entrega, ou respeitar ordem de dependência.

### Os dois modos coexistem no mesmo Middleware:

```
┌──────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE                                │
│                                                                  │
│                    ┌─────────────┐                               │
│  Agente IA ──────>│             │── Passagem direta ──> EME4    │
│  (consulta)       │             │   (rápido, sem fila)          │
│                    │  KONG/APISIX│                               │
│  Protheus ───────>│             │── NATS ── Tradutor ──> EME4   │
│  (cria OP)        │             │   (com fila + tradução)       │
│                    └─────────────┘                               │
│                                                                  │
│  Mesmo Middleware, dois modos.                                   │
│  Worker só existe quando há trabalho a fazer.                    │
└──────────────────────────────────────────────────────────────────┘
```

### Como funciona passo a passo (Modo 2 — com tradutor):

1. O Protheus envia os dados para o Middleware (Kong/APISIX)
2. O Kong/APISIX autentica e coloca a mensagem na fila (NATS)
3. O Protheus recebe imediatamente um **"recebido!"** (202 Accepted) e segue em frente
4. O Tradutor (Worker) pega a mensagem da fila
5. O Tradutor converte os campos do Protheus para os campos do EME4
6. O Load Balancer escolhe a **melhor instância** do EME4 (a menos ocupada)
7. Se uma instância do EME4 cair, **redireciona automaticamente** para outra
8. Se der erro, o Tradutor **tenta de novo automaticamente**

### Como funciona passo a passo (Modo 1 — passagem direta):

1. O sistema (ex: agente IA) faz uma requisição ao Middleware (Kong/APISIX)
2. O Kong/APISIX autentica, escolhe o melhor servidor EME4, e repassa
3. O EME4 responde, e o Kong/APISIX devolve a resposta
4. **Pronto.** Sem fila, sem tradutor, sem espera.

### O ganho com Load Balancing (em ambos os modos):

```
PROTHEUS        MIDDLEWARE                    EME4 Servidor 1     EME4 Servidor 2
   │                │                              │                    │
   │── OP 1 ──────>│                              │                    │
   │<── Recebido! ──│── Entrega para Srv 1 ──────>│ Processando...     │
   │                │                              │                    │
   │── OP 2 ──────>│                              │                    │
   │<── Recebido! ──│── Entrega para Srv 2 ──────>│                    │ Processando...
   │                │                              │                    │
   │── OP 3 ──────>│                              │                    │
   │<── Recebido! ──│── Srv 1 livre, envia ──────>│ Processando...     │
   │                │                              │                    │
   │  Total: < 1s para enviar as 3 OPs            │                    │
   │  (processamento em paralelo nos servidores)   │                    │
```

---

## 3. Comparação Direta: Cenário a Cenário

### Cenário A: "O EME4 está fora do ar"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| O Protheus tenta chamar a API do EME4 | O Protheus envia para o Middleware |
| **Erro!** Timeout, conexão recusada | Middleware guarda a mensagem na fila |
| O Protheus precisa tratar o erro | O Protheus recebe "Recebido!" normalmente |
| Alguém precisa reenviar manualmente | Quando o EME4 voltar, as mensagens são entregues **automaticamente** |
| **Dados podem se perder** | **Nenhum dado se perde** |

### Cenário B: "Preciso enviar 500 Ordens de Produção de uma vez"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| O Protheus envia uma por uma, esperando cada resposta | O Protheus envia todas para a fila rapidamente |
| Se a 300a falhar, as 200 restantes param | Todas ficam na fila, cada uma é processada independentemente |
| O EME4 (1 servidor) pode ficar sobrecarregado | O Load Balancer distribui entre múltiplos servidores |
| **Lento e frágil** | **Rápido e resiliente** |

### Cenário C: "O formato dos dados do Protheus mudou"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| Precisa alterar o código do Protheus E do EME4 | Altera apenas o Tradutor no Middleware |
| Os dois sistemas precisam ser atualizados juntos | Cada sistema evolui no seu ritmo |
| **Alto risco de quebra** | **Mudança isolada e segura** |

### Cenário D: "Preciso saber o que foi enviado ontem"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| Precisa consultar logs em ambos os sistemas | Tudo está registrado no Middleware |
| Difícil rastrear o que aconteceu | Dashboard centralizado com histórico completo |
| **Sem visibilidade** | **Rastreabilidade total** |

### Cenário E: "Um servidor do EME4 caiu"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| **Tudo para.** O Protheus recebe erro | O Load Balancer detecta a falha em segundos |
| Alguém precisa intervir manualmente | O tráfego é redirecionado automaticamente para outro servidor |
| Downtime até o servidor voltar | **Zero downtime** — o outro servidor assume |
| **Ponto único de falha** | **Alta disponibilidade automática** |

### Cenário F: "O EME4 está lento porque muitos usuários estão acessando"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| Protheus também fica lento (esperando) | Protheus envia e segue em frente |
| Todas as requisições vão para o mesmo servidor | Load Balancer distribui a carga |
| **Efeito dominó** — lentidão se propaga | **Isolamento** — um sistema não afeta o outro |

---

## 4. Prós e Contras - Visão Honesta

### Modelo Atual (API Direta)

| Prós | Contras |
|------|---------|
| Simples de entender | Se um sistema cai, o outro é afetado |
| Menos componentes para instalar | Dados podem se perder em caso de falha |
| Resposta imediata (síncrono) | Protheus fica "travado" esperando resposta |
| Menor custo inicial | Sem controle de vazão (pode sobrecarregar) |
| Time já conhece o modelo | Sem rastreabilidade centralizada |
| | Mudança em um sistema impacta o outro |
| | Difícil escalar para alto volume |
| | Sem retry automático (reprocessamento manual) |
| | Cada integração nova é um ponto de falha novo |
| | **Servidor único = ponto único de falha** |
| | **Sem distribuição de carga** |

### Modelo Novo (Middleware Kong/APISIX + NATS)

| Prós | Contras |
|------|---------|
| Nenhuma mensagem se perde (garantia de entrega) | Mais componentes na infraestrutura |
| Se um sistema cai, o outro continua funcionando | Curva de aprendizado para o time |
| Protheus não fica "travado" esperando | Resposta não é imediata (assíncrono) |
| **Load Balancing — distribui carga entre servidores** | Precisa de estratégia para saber o resultado final |
| **Failover automático — se um servidor cai, outro assume** | |
| Controle de vazão (não sobrecarrega) | |
| Retry automático com tentativas configuráveis | |
| Rastreabilidade de todas as mensagens | |
| Tradução centralizada (DE-PARA) | |
| Cada sistema evolui independentemente | |
| Escalável para qualquer volume | |
| Monitoramento e dashboards centralizados | |
| Uma porta de entrada única (segurança) | |
| **Usa < 300 MB de RAM (leve e barato)** | |
| **Construído sobre NGINX (20+ anos de confiança)** | |

---

## 5. Analogias para Facilitar o Entendimento

### O Restaurante

**Modelo Atual (Direto):**
Imagine que o cliente (Protheus) vai até a cozinha (EME4) e faz o pedido diretamente ao **único** cozinheiro. O cliente fica parado na cozinha esperando o prato ficar pronto. Se o cozinheiro estiver no banheiro, o cliente fica esperando. Se a cozinha pegar fogo, o cliente perde o pedido. Se chegam 50 clientes, todos ficam na fila do mesmo cozinheiro.

**Modelo Novo (Middleware) — com dois modos:**

*Modo 1 — Cliente que fala a língua da cozinha (passagem direta):*
Um cliente estrangeiro (agente de IA) que já fala a língua do cozinheiro vai até o maître (Kong/APISIX). O maître verifica a reserva (autenticação), vê qual cozinheiro está menos ocupado, e encaminha direto. Sem garçom no meio, sem comanda. Rápido e direto.

*Modo 2 — Cliente que precisa de tradução:*
O cliente (Protheus) faz o pedido ao garçom (Kong/APISIX), que anota na comanda (NATS). O cliente volta para a mesa e continua conversando. O expedidor (Worker/Tradutor) pega a comanda, **traduz para a linguagem da cozinha**, e escolhe o cozinheiro menos ocupado (Load Balancing). Se um cozinheiro passar mal, os pedidos vão para os outros (Failover).

*O ponto-chave:* o maître e o garçom trabalham no mesmo restaurante. O expedidor só aparece quando precisa traduzir. Se não precisa, é passagem direta.

### Os Correios

**Modelo Atual (Direto):**
Você precisa entregar um documento pessoalmente, e só existe **uma** pessoa que pode receber. Vai até o destino, bate na porta, e entrega na mão. Se a pessoa não estiver, você volta com o documento. Se chover no caminho, o documento molha.

**Modelo Novo (Middleware):**
Você vai até os Correios (Kong/APISIX), registra a carta (NATS), recebe um código de rastreio, e vai embora. Os Correios cuidam de entregar. Se o destinatário não estiver na sede 1, entregam na sede 2 (Load Balancing). A carta está protegida e rastreável. Se uma agência dos Correios cair, outra assume.

### A Rodovia

**Modelo Atual (Direto):**
Uma estrada de mão única entre duas cidades. Se há um acidente (falha), TUDO para. Se o volume de carros aumenta (mais requisições), forma engarrafamento. Não tem desvio.

**Modelo Novo (Middleware):**
Uma rodovia com múltiplas faixas e pedágio inteligente (Kong/APISIX). O pedágio distribui os carros pelas faixas menos congestionadas (Load Balancing). Se uma faixa é interditada, o tráfego flui pelas outras (Failover). E entre as cidades há um depósito (NATS) que guarda as cargas até ter espaço na rodovia de destino.

---

## 6. Perguntas Frequentes

### "Se o Protheus não espera a resposta, como sabe se deu certo?"

Existem duas abordagens:
- **Callback**: O Middleware avisa o Protheus quando a mensagem foi processada (como um SMS de confirmação de entrega)
- **Consulta**: O Protheus consulta o status quando precisar (como rastrear uma encomenda)

Na prática, para 90% dos casos o fluxo é: "enviei, está na fila, será processado". Se houver erro, o Middleware tenta de novo. Se falhar depois de várias tentativas, vai para uma fila de erros que o time pode monitorar.

### "Vai ficar mais lento?"

Para quem ENVIA (Protheus), fica **mais rápido** — ele não espera mais o EME4 processar. O processamento acontece em paralelo e é **distribuído entre vários servidores** (Load Balancing). Para o resultado final aparecer no EME4, pode levar alguns milissegundos a mais, mas o Protheus não fica travado.

### "E se o Middleware cair?"

O NATS JetStream persiste as mensagens em disco. Mesmo que o Middleware reinicie, nenhuma mensagem é perdida. O Kong/APISIX pode ter múltiplas instâncias (redundância). É mais confiável que uma conexão direta entre dois sistemas.

### "O que é Load Balancing na prática?"

É como um controlador de tráfego aéreo. Em vez de todos os aviões (requisições) tentarem pousar na mesma pista (servidor), o controlador (Kong/APISIX) distribui entre as pistas disponíveis. Se uma pista é interditada, ele redireciona para outra. Isso significa:
- **Nenhum servidor fica sobrecarregado**
- **Se um servidor cai, o outro assume automaticamente**
- **Performance melhor** — usa todos os recursos disponíveis

### "Qual o custo?"

- **Kong**: Tem versão open-source gratuita (Kong OSS) e versão Enterprise paga
- **APISIX**: 100% open-source e gratuito (Apache Foundation)
- **NATS**: Open-source e gratuito
- **Workers**: Aplicação customizada (custo de desenvolvimento)
- **Infraestrutura**: Tudo roda com ~280 MB de RAM — cabe em qualquer servidor existente

O custo é principalmente de **desenvolvimento e aprendizado**, não de licenças ou infraestrutura.

### "Não é exagero para a nossa necessidade?"

**Não. Na verdade, é o primeiro passo de algo muito maior.**

A POC usa o caso Protheus-EME4 porque é um cenário real e tangível — perfeito para demonstrar que o Middleware funciona. Mas a verdadeira razão para construir essa infraestrutura é outra:

**Estamos preparando o terreno para Inteligência Artificial.**

A Datainfo é uma empresa com múltiplos sistemas (EME4, ERPs de clientes, sistemas internos). Em um futuro próximo, agentes de IA vão precisar:

- **Consultar APIs do EME4** para responder perguntas como "Qual o status da OP 12345?" ou "Quais produtos tiveram mais refugo este mês?"
- **Consultar APIs de outros sistemas da Datainfo** para cruzar dados entre plataformas
- **Executar ações** como criar ordens, atualizar cadastros ou disparar processos — tudo de forma autônoma
- **Processar alto volume** — um agente de IA pode fazer centenas de consultas por minuto para montar uma análise

Sem o Middleware, cada agente de IA precisaria:
- Conhecer a autenticação de cada sistema (sessão, token, API key...)
- Saber o endereço de cada servidor
- Lidar com falhas, timeouts e retentativas
- Ser reescrito toda vez que um sistema muda

Com o Middleware, o agente de IA fala com **uma porta única** (Kong/APISIX), e o Middleware cuida de todo o resto:

```
                                         ┌─────────────┐
                                    ┌───>│    EME4      │
                                    │    └─────────────┘
┌──────────────┐    ┌───────────┐   │    ┌─────────────┐
│  Agente IA   │───>│ MIDDLEWARE│───┼───>│  Protheus    │
│  (futuro)    │<───│ Kong+NATS │───┤    └─────────────┘
└──────────────┘    └───────────┘   │    ┌─────────────┐
                                    ├───>│ Sistema X    │
┌──────────────┐         │          │    └─────────────┘
│  Protheus    │─────────┘          │    ┌─────────────┐
│  (POC hoje)  │                    └───>│ Sistema Y    │
└──────────────┘                         └─────────────┘
```

**A POC de hoje (Protheus-EME4) é o piloto. O Middleware é a pista de decolagem para a IA.**

E os números mostram que não é pesado: o NATS usa apenas 30 MB de RAM e o Kong/APISIX apenas 100 MB. É uma infraestrutura leve que escala do nosso volume atual (centenas/dia) até milhões de requisições quando a IA entrar em cena.

---

## 7. Por que confiamos nessas tecnologias?

### NATS — O sistema de mensageria mais rápido e leve do mercado

```
┌─────────────────────────────────────────────────────────────────┐
│                       NATS em números                           │
│                                                                 │
│  Velocidade:    25 milhões de mensagens por segundo             │
│  Latência:      0.2 milissegundos (quase instantâneo)           │
│  Memória:       18 MB (menos que uma foto do celular)           │
│  Startup:       < 1 segundo                                     │
│  Binário:       20 MB (um executável, sem dependências)          │
│                                                                 │
│  Escrito em:    Go (linguagem criada pelo Google)               │
│  Quem usa:      Tesla, Mastercard, GE, Walmart                  │
│  Mantido por:   CNCF (mesma fundação do Kubernetes)             │
│                                                                 │
│  Para o nosso volume (~500 msgs/dia):                           │
│  Usa 0,000002% da capacidade. Roda em qualquer lugar.           │
└─────────────────────────────────────────────────────────────────┘
```

**Em linguagem simples:** O NATS é como um correio ultrarrápido que cabe no bolso. Ele entrega milhões de cartas por segundo, mas consome menos energia que uma lâmpada. Para as nossas centenas de mensagens por dia, é como ter um foguete para ir à esquina — mas o "combustível" custa quase nada.

### Kong / APISIX — Construídos sobre o NGINX, o servidor web mais confiável do mundo

```
┌─────────────────────────────────────────────────────────────────┐
│                   Kong / APISIX em números                      │
│                                                                 │
│  Base:          NGINX (serve 30% de toda a internet)            │
│  NGINX existe:  desde 2004 (20+ anos de maturidade)            │
│  Velocidade:    10.000-18.000 requisições por segundo           │
│  Latência:      0.5-2 milissegundos adicionados                │
│  Memória:       50-100 MB                                       │
│                                                                 │
│  Quem usa NGINX:  Netflix, Cloudflare, WordPress.com           │
│  Quem usa Kong:   Samsung, Nasdaq, Honeywell                   │
│  Quem usa APISIX: NASA, Airbus, WPS                            │
│                                                                 │
│  Para o nosso volume (~500 req/dia):                            │
│  Usa 0,00006% da capacidade.                                   │
│  E de graça temos: Load Balancing, Auth, Failover, Logs.       │
└─────────────────────────────────────────────────────────────────┘
```

**Em linguagem simples:** O Kong e o APISIX são construídos em cima do NGINX — o mesmo "motor" que faz funcionar a Netflix, Cloudflare e um terço de toda a internet. Se ele aguenta bilhões de acessos por dia no mundo inteiro, aguenta nossas centenas de requisições sem suar. E a cereja do bolo: ele distribui a carga entre vários servidores do EME4 automaticamente.

### Infraestrutura total: surpreendentemente leve

```
┌──────────────────────────────────────────────────────────┐
│           O Middleware inteiro precisa de:                │
│                                                          │
│           280 MB de RAM                                  │
│           (menos que o Chrome com 3 abas abertas)        │
│                                                          │
│           < 7% de CPU                                    │
│           (praticamente invisível)                        │
│                                                          │
│           ~1 GB de disco                                 │
│           (para persistir mensagens)                     │
│                                                          │
│           Cabe em qualquer VM ou container.               │
│           Não precisa de servidor dedicado.               │
│           Pode rodar junto com outros serviços.           │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Resumo Visual

```
╔════════════════════════════════════════════════════════════════════════╗
║                      MODELO ATUAL (API Direta)                       ║
║                                                                        ║
║   PROTHEUS ──────── chamada direta ────────> EME4 (1 servidor)       ║
║                                                                        ║
║   - Simples, mas frágil                                               ║
║   - Se um cai, o outro para                                          ║
║   - Dados podem se perder                                             ║
║   - Sem rastreabilidade                                               ║
║   - Servidor único = ponto único de falha                             ║
║   - Sem distribuição de carga                                         ║
╚════════════════════════════════════════════════════════════════════════╝

                              vs

╔════════════════════════════════════════════════════════════════════════╗
║                    MODELO NOVO (Middleware)                           ║
║                                                                        ║
║   Modo 1 — Passagem direta (sem tradutor, quando não precisa):       ║
║                                                  ┌─> EME4 Srv 1     ║
║   Agente IA ──> KONG/APISIX (portaria + LB) ────┤                   ║
║                                                  └─> EME4 Srv 2     ║
║                                                                        ║
║   Modo 2 — Com tradutor (quando há trabalho a fazer):                ║
║                                                  ┌─> EME4 Srv 1     ║
║   PROTHEUS ──> KONG/APISIX ──> NATS ──> Worker ─┤                   ║
║             (portaria+LB)   (fila)   (tradutor)  └─> EME4 Srv 2     ║
║                                                                        ║
║   Worker só existe quando há trabalho real.                           ║
║   Sem trabalho = passagem direta (mais rápido).                      ║
║                                                                        ║
║   - Robusto e confiável                                               ║
║   - Se um cai, o outro continua                                      ║
║   - Nenhum dado se perde                                              ║
║   - Rastreabilidade total                                             ║
║   - Load Balancing entre servidores                                   ║
║   - Failover automático                                               ║
║   - Construído sobre NGINX (20+ anos) e NATS (Tesla, Mastercard)     ║
║   - Tudo rodando com apenas 280 MB de RAM                            ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## 9. Recomendação

Recomendamos a aprovação da **POC do Middleware** com escopo reduzido para validar o conceito:

1. **Escopo mínimo da POC**: Sincronizar 1 cadastro de engenharia (ex: Centro de Trabalho) e 1 fluxo de OP (criar + apontar)
2. **Prazo estimado**: A definir após validação desta análise
3. **Risco**: Baixo — a POC não afeta os sistemas atuais
4. **Resultado esperado**: Demonstrar que o Middleware funciona, medir performance, e ter base concreta para decisão
5. **Infraestrutura necessária**: Mínima — ~280 MB de RAM em qualquer servidor existente

> A POC é um investimento pequeno para uma decisão informada. Melhor testar antes de comprometer do que comprometer antes de testar.

---

## Glossário

| Termo | Significado simples |
|-------|---------------------|
| **API** | Uma "porta" que um sistema abre para outros sistemas se comunicarem com ele |
| **API Gateway** | Uma "portaria inteligente" que controla quem entra, quanto entra, e para onde vai |
| **Load Balancing** | Distribuir o trabalho entre vários servidores para nenhum ficar sobrecarregado |
| **Failover** | Quando um servidor cai, outro assume automaticamente |
| **Mensageria** | Sistema de "caixa postal" — você deixa a mensagem, o destinatário pega quando puder |
| **NATS** | O sistema de mensageria que usamos — ultrarrápido e ultraleve |
| **Kong / APISIX** | O API Gateway que usamos — construído sobre o NGINX |
| **NGINX** | O servidor web mais usado do mundo, base do Kong e APISIX |
| **Worker** | Um "tradutor" que só entra em cena quando há trabalho real (tradução, orquestração). Se não precisa, não existe no caminho |
| **Passthrough** | Modo de passagem direta — a requisição vai do Kong/APISIX direto para o destino, sem Worker |
| **DE-PARA** | Tabela que traduz códigos de um sistema para códigos do outro |
| **JetStream** | Módulo do NATS que persiste mensagens em disco (não perde nada) |
| **Health Check** | Teste automático que verifica se um servidor está funcionando |
| **Rate Limiting** | Controle de "quantas requisições por minuto" um sistema pode fazer |
| **Síncrono** | Você envia e espera a resposta (como uma ligação) |
| **Assíncrono** | Você envia e segue em frente, a resposta vem depois (como um e-mail) |
