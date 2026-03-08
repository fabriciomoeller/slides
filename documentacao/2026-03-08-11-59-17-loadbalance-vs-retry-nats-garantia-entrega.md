# 2026-03-08 - Load Balancing vs Retry: Como o Middleware Garante a Entrega de Mensagens

## Contexto
- Durante a revisão do slide 5 (Modo 2: Com Tradutor), surgiu a dúvida: se existe Load Balancing entre os servidores EME4, por que ainda é necessário um mecanismo de retry?
- A resposta está na separação de responsabilidades: o LB atua **antes** do envio, o retry atua **depois** de uma falha
- Este documento registra a análise técnica baseada na documentação oficial do NATS JetStream

## Duas Linhas de Defesa

### 1ª Linha: Load Balancer (Kong/APISIX) — Prevenção

O Load Balancer atua **antes** de enviar a requisição ao EME4:
- Escolhe o servidor **menos ocupado** (algoritmo round-robin/least-connections)
- Executa **health checks** periódicos (ex: a cada 5s) para detectar servidores indisponíveis
- Se um servidor está marcado como **down**, o LB **nem envia** para ele — redireciona para outro

**Quando o LB resolve sozinho (sem retry):**
- EME4 1 está fora, EME4 2 está ok → LB ignora o 1, manda pro 2
- EME4 1 está lento → LB detecta e prioriza o 2

O retry entra em cenários onde o LB **não consegue evitar** a falha:

| Cenário | LB resolve? | Retry necessário? |
|---------|-------------|-------------------|
| EME4 1 está fora, EME4 2 está ok | Sim — LB ignora o 1, manda pro 2 | Não |
| EME4 1 ficou lento (mas respondeu) | Sim — LB percebe e prioriza o 2 | Não |
| **Ambos** EME4 1 e 2 estão fora | Não — LB não tem para onde mandar | **Sim** |
| EME4 1 aceitou mas caiu **durante** o processamento | Não — LB já tinha escolhido | **Sim** |
| EME4 1 responde com erro 500 (bug, BD fora) | Não — LB vê o servidor como "saudável" | **Sim** |
| Rede instável (timeout esporádico) | Parcialmente | **Sim

### 2ª Linha: Retry via NATS JetStream (Nak + Backoff) — Recuperação

O retry atua **depois** de o Worker tentar enviar e falhar:
- O Worker envia o JSON traduzido para o EME4 e recebe erro (500, timeout, recusa)
- O Worker faz **Nak** (Negative Acknowledgment) — devolvendo a mensagem para a fila NATS
- O NATS JetStream reagenda a entrega com **backoff exponencial**
- No próximo retry, o Worker pega a mensagem de novo e o LB **reavalia** qual servidor usar

**Quando o retry é necessário (LB não resolve):**

| Cenário | Por que o LB não resolve? | O que o retry faz? |
|---------|---------------------------|---------------------|
| **Ambos** EME4 1 e 2 estão fora | LB não tem para onde mandar | Mensagem aguarda na fila até um servidor voltar |
| EME4 aceitou mas caiu **durante** o processamento | LB já tinha escolhido o servidor | Mensagem volta para a fila e é reenviada |
| EME4 responde com erro 500 (bug, BD fora) | LB vê o servidor como "saudável" | Worker detecta o erro e faz Nak |
| Rede instável (timeout esporádico) | Health check pode não detectar | Retry automático na próxima janela |
| Health check tem intervalo (ex: 5s) | Servidor caiu entre dois checks | Mensagem não se perde, retry garante |

## Mecanismo Técnico do NATS JetStream

### Persistência na Fila
- Diferente do NATS Core (at-most-once), o **JetStream garante at-least-once**
- A mensagem fica **persistida em disco** no momento que entra na fila
- Mesmo que o Worker caia, o NATS reinicie, ou todos os EME4 fiquem fora por horas — a mensagem **continua lá**

### Sistema de Acknowledgment (Ack/Nak)
O Worker, ao pegar uma mensagem, tem 3 respostas possíveis:

| Resposta | Significado | O que acontece |
|----------|-------------|----------------|
| **Ack** | "Processado com sucesso" | Mensagem sai da fila definitivamente |
| **Nak** | "Falhou, tente de novo" | Reentrega imediata (ou com NakWithDelay) |
| **Nenhuma** (timeout) | Worker não respondeu a tempo | Após AckWait (padrão 30s), NATS reentrega automaticamente |

### Backoff Exponencial (MaxDeliver + BackOff)
Configuração que controla **quantas vezes** e **com que intervalo** o NATS retenta:

```
MaxDeliver = 10
BackOff    = [5s, 30s, 2min, 10min, 30min, 1h, 2h, 6h, 12h, 24h]
```

| Tentativa | Espera antes de retentar | Tempo acumulado |
|-----------|--------------------------|-----------------|
| 1ª | 5 segundos | 5s |
| 2ª | 30 segundos | 35s |
| 3ª | 2 minutos | ~2.5 min |
| 4ª | 10 minutos | ~12.5 min |
| 5ª | 30 minutos | ~42 min |
| 6ª | 1 hora | ~1h 42min |
| 7ª | 2 horas | ~3h 42min |
| 8ª | 6 horas | ~9h 42min |
| 9ª | 12 horas | ~21h 42min |
| 10ª | 24 horas | ~1.9 dias |

**Comportamento importante:**
- **Nak** → reentrega imediata (ou com delay explícito via NakWithDelay)
- **Timeout** (sem resposta) → backoff é aplicado automaticamente
- Se `MaxDeliver` é maior que a lista de backoff, o último valor se repete
- Após esgotar todas as tentativas → **advisory** publicado no subject `$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES` (pode disparar alerta/notificação)
- **A mensagem continua no stream** mesmo após esgotar tentativas — pode ser tratada manualmente

### Fluxo Completo de Retry

```
Worker pega mensagem da fila
  ↓
Traduz campos (DE-PARA)
  ↓
Envia para EME4 (via LB → servidor escolhido)
  ↓
EME4 responde erro ou não responde (timeout)
  ↓
Worker faz Nak (devolve à fila)
  ↓
Mensagem volta para o NATS JetStream (persistida em disco)
  ↓
NATS agenda próxima tentativa (backoff: 5s, 30s, 2min...)
  ↓
Worker pega a mensagem novamente
  ↓
LB reavalia e pode escolher OUTRO servidor EME4
  ↓
Ciclo se repete até sucesso (Ack) ou esgotar MaxDeliver
```

## Comparação Direta: Modelo Atual vs Modelo Novo

| Aspecto | Modelo Atual (Direto) | Modelo Novo (Middleware) |
|---------|----------------------|--------------------------|
| EME4 fora | Erro imediato, dado perdido | Mensagem persiste na fila, retry por até 24h+ |
| EME4 lento | Sistema origem trava esperando | Sistema origem já recebeu 202, Worker lida sozinho |
| EME4 volta ao ar | Precisa reenviar manualmente | Próximo retry entrega automaticamente |
| Ambos EME4 fora | Impossível entregar | Fila guarda, entrega quando qualquer um voltar |
| Esgotou tentativas | N/A (nem tenta) | Alerta + mensagem preservada no stream |

## Conclusão

O **Load Balancer** e o **Retry** são mecanismos **complementares**, não concorrentes:
- O LB é a **primeira linha de defesa** — evita enviar para servidores problemáticos
- O Retry é a **segunda linha de defesa** — quando o LB fez sua parte mas ainda assim falhou
- Juntos, garantem que **nenhuma mensagem se perde**, mesmo em cenários de falha total temporária dos servidores EME4

## Fontes
- [NATS JetStream Consumers](https://docs.nats.io/nats-concepts/jetstream/consumers) — documentação oficial de Ack/Nak/MaxDeliver/BackOff
- [NATS JetStream Model Deep Dive](https://docs.nats.io/using-nats/developer/develop_jetstream/model_deep_dive) — garantias de entrega at-least-once
- [Exponential Message Delivery Backoff — GitHub Issue #2042](https://github.com/nats-io/nats-server/issues/2042) — discussão sobre implementação do backoff
