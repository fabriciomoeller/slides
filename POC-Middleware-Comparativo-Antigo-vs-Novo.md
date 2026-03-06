# Integração Protheus x EME4: Modelo Atual vs Middleware

## Por que estamos propondo uma mudança?

**Data:** 04/03/2026
**Versão:** 1.0
**Público-alvo:** Diretoria, time EME4, time Protheus

---

## 1. Como funciona HOJE (Modelo Direto - API para API)

### A ideia é simples:

O Protheus chama diretamente a API do EME4. É como fazer uma **ligação telefônica**: você liga, a outra pessoa precisa atender, vocês conversam, e pronto.

```
┌───────────┐                              ┌───────────┐
│           │   POST /Incluir_API          │           │
│ PROTHEUS  │─────────────────────────────>│   EME4    │
│           │                              │           │
│           │<─────────────────────────────│           │
│           │   { "Sucesso": true }        │           │
└───────────┘                              └───────────┘
```

### Como funciona passo a passo:

1. O Protheus monta um JSON com os dados (ex: uma Ordem de Produção)
2. O Protheus faz uma chamada HTTP direta para o EME4 (ex: `POST /DoctoOrdProducaoManufatura/Incluir_API`)
3. O EME4 recebe, processa, e devolve uma resposta
4. O Protheus recebe a resposta e segue em frente

### Exemplo prático - Criar uma Ordem de Produção:

```
PROTHEUS                                                    EME4
   │                                                          │
   │── POST /DoctoOrdProducaoManufatura/Incluir_API ────────>│
   │   { "QtdeOrdem": 1000, "Produto": "PECA-001", ... }    │
   │                                                          │
   │   (Protheus AGUARDA... 2s, 5s, 10s, timeout?)           │
   │                                                          │
   │<──────────── { "Sucesso": true, "ID": 4567 } ──────────│
   │                                                          │
```

---

## 2. Como funcionaria com o MIDDLEWARE (Modelo Novo - Kong + NATS)

### A ideia também é simples:

Em vez de ligar direto, o Protheus **deixa um recado** em uma caixa de mensagens. Um assistente pega esse recado, traduz para o idioma do EME4, e entrega. É como um **serviço de correio com rastreamento**: você posta a carta, recebe um comprovante, e o carteiro entrega mesmo que o destinatário não esteja em casa naquele momento.

```
┌───────────┐     ┌───────────────────────────────┐     ┌───────────┐
│           │     │         MIDDLEWARE             │     │           │
│ PROTHEUS  │────>│  KONG ──> NATS ──> Tradutor   │────>│   EME4    │
│           │<────│  (portaria) (correio) (carteiro)│<────│           │
└───────────┘     └───────────────────────────────┘     └───────────┘
```

### Como funciona passo a passo:

1. O Protheus envia os dados para o Middleware (Kong)
2. O Kong autentica e coloca a mensagem na fila (NATS)
3. O Protheus recebe imediatamente um **"recebido!"** (202 Accepted) e segue em frente
4. O Tradutor (Worker) pega a mensagem da fila
5. O Tradutor converte os campos do Protheus para os campos do EME4
6. O Tradutor chama a API do EME4
7. Se der erro, o Tradutor **tenta de novo automaticamente**

### Exemplo prático - Criar uma Ordem de Produção:

```
PROTHEUS              MIDDLEWARE                              EME4
   │                      │                                     │
   │── POST /mw/op ──────>│                                     │
   │                      │─ (guarda na fila) ─>                │
   │<── 202 "Recebido!" ──│                                     │
   │                      │                                     │
   │  (Protheus já está   │── Tradutor pega da fila ──>         │
   │   livre para fazer   │── Converte campos ──>               │
   │   outras coisas)     │── POST Incluir_API ────────────────>│
   │                      │<────── { "Sucesso": true } ────────│
   │                      │── (marca como entregue) ──>         │
   │                      │                                     │
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
| O EME4 pode ficar sobrecarregado | O Middleware controla o ritmo de entrega (vazão) |
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

### Cenário E: "Um apontamento no EME4 precisa voltar para o Protheus"

| Modelo Atual (Direto) | Modelo Novo (Middleware) |
|------------------------|------------------------|
| O EME4 precisa conhecer a API do Protheus | O EME4 envia para o Middleware |
| Se o Protheus mudar a API, o EME4 quebra | O Tradutor faz a adaptação |
| Cada sistema precisa saber a "língua" do outro | Cada sistema fala apenas com o Middleware |
| **Acoplamento forte** | **Independência entre sistemas** |

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

### Modelo Novo (Middleware Kong + NATS)

| Prós | Contras |
|------|---------|
| Nenhuma mensagem se perde (garantia de entrega) | Mais componentes na infraestrutura |
| Se um sistema cai, o outro continua funcionando | Curva de aprendizado para o time |
| Protheus não fica "travado" esperando | Custo de infraestrutura do Middleware |
| Controle de vazão (não sobrecarrega) | Resposta não é imediata (assíncrono) |
| Retry automático com tentativas configuráveis | Complexidade de monitoramento |
| Rastreabilidade de todas as mensagens | Precisa de estratégia para saber o resultado final |
| Tradução centralizada (DE-PARA) | |
| Cada sistema evolui independentemente | |
| Escalável para qualquer volume | |
| Monitoramento e dashboards centralizados | |
| Uma porta de entrada única (segurança) | |

---

## 5. Analogias para Facilitar o Entendimento

### O Restaurante

**Modelo Atual (Direto):**
Imagine que o cliente (Protheus) vai até a cozinha (EME4) e faz o pedido diretamente ao cozinheiro. O cliente fica parado na cozinha esperando o prato ficar pronto. Se o cozinheiro estiver no banheiro, o cliente fica esperando. Se a cozinha pegar fogo, o cliente perde o pedido.

**Modelo Novo (Middleware):**
O cliente (Protheus) faz o pedido ao garçom (Kong), que anota na comanda (NATS). O cliente volta para a mesa e continua conversando. O expedidor (Worker/Tradutor) pega a comanda, adapta para a linguagem da cozinha, e entrega ao cozinheiro (EME4). Se a cozinha estiver cheia, a comanda espera na fila. Se o cozinheiro errar, o expedidor pede para refazer. O cliente tem o número da comanda para rastrear.

### Os Correios

**Modelo Atual (Direto):**
Você precisa entregar um documento pessoalmente. Vai até o destino, bate na porta, e entrega na mão. Se a pessoa não estiver, você volta com o documento. Se chover no caminho, o documento molha.

**Modelo Novo (Middleware):**
Você vai até os Correios (Kong), registra a carta (NATS), recebe um código de rastreio, e vai embora. Os Correios cuidam de entregar. Se o destinatário não estiver, eles tentam novamente. A carta está protegida. Você acompanha pelo rastreio.

---

## 6. Perguntas Frequentes

### "Se o Protheus não espera a resposta, como sabe se deu certo?"

Existem duas abordagens:
- **Callback**: O Middleware avisa o Protheus quando a mensagem foi processada (como um SMS de confirmação de entrega)
- **Consulta**: O Protheus consulta o status quando precisar (como rastrear uma encomenda)

Na prática, para 90% dos casos o fluxo é: "enviei, está na fila, será processado". Se houver erro, o Middleware tenta de novo. Se falhar depois de várias tentativas, vai para uma fila de erros que o time pode monitorar.

### "Vai ficar mais lento?"

Para quem ENVIA (Protheus), fica **mais rápido** — ele não espera mais o EME4 processar. O processamento acontece em paralelo. Para o resultado final aparecer no EME4, pode levar alguns segundos a mais (milissegundos na maioria dos casos), mas o Protheus não fica travado.

### "E se o Middleware cair?"

O NATS JetStream persiste as mensagens em disco. Mesmo que o Middleware reinicie, nenhuma mensagem é perdida. O Kong pode ter múltiplas instâncias (redundância). É mais confiável que uma conexão direta entre dois sistemas.

### "Qual o custo?"

- **Kong**: Tem versão open-source gratuita (Kong OSS) e versão Enterprise
- **NATS**: Open-source e gratuito
- **Workers**: Aplicação customizada (custo de desenvolvimento)
- **Infraestrutura**: Um servidor adicional (ou containers Docker)

O custo é principalmente de **desenvolvimento e aprendizado**, não de licenças.

### "Não é exagero para a nossa necessidade?"

Depende da visão de futuro. Se a integração é apenas Protheus-EME4 e não vai crescer, o modelo direto pode ser suficiente. Mas se a empresa planeja:
- Integrar com outros sistemas no futuro
- Aumentar o volume de produção
- Ter garantia de que dados não se perdem
- Ter visibilidade do fluxo de dados

...então o Middleware é o investimento certo. A POC serve exatamente para validar isso com custo controlado antes de decidir.

---

## 7. Resumo Visual

```
╔══════════════════════════════════════════════════════════════════════╗
║                    MODELO ATUAL (API Direta)                       ║
║                                                                      ║
║   PROTHEUS ──────── chamada direta ────────> EME4                  ║
║                                                                      ║
║   - Simples, mas frágil                                             ║
║   - Se um cai, o outro para                                        ║
║   - Dados podem se perder                                           ║
║   - Sem rastreabilidade                                             ║
╚══════════════════════════════════════════════════════════════════════╝

                            vs

╔══════════════════════════════════════════════════════════════════════╗
║                  MODELO NOVO (Middleware)                           ║
║                                                                      ║
║   PROTHEUS ──> KONG ──> NATS ──> Tradutor ──> EME4                 ║
║             (portaria) (fila)   (carteiro)                          ║
║                                                                      ║
║   - Robusto e confiável                                             ║
║   - Se um cai, o outro continua                                    ║
║   - Nenhum dado se perde                                            ║
║   - Rastreabilidade total                                           ║
║   - Escalável e preparado para o futuro                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 8. Recomendação

Recomendamos a aprovação da **POC do Middleware** com escopo reduzido para validar o conceito:

1. **Escopo mínimo da POC**: Sincronizar 1 cadastro de engenharia (ex: Centro de Trabalho) e 1 fluxo de OP (criar + apontar)
2. **Prazo estimado**: A definir após validação desta análise
3. **Risco**: Baixo — a POC não afeta os sistemas atuais
4. **Resultado esperado**: Demonstrar que o Middleware funciona, medir performance, e ter base concreta para decisão

> A POC é um investimento pequeno para uma decisão informada. Melhor testar antes de comprometer do que comprometer antes de testar.
