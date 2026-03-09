# POC Middleware — EME4

## Visao Geral

Prova de Conceito para infraestrutura de **Middleware** integrando o **EME4** (Manufatura) com sistemas externos (Protheus, IA, Dashboards) na Datainfo.

### Objetivo

Substituir o modelo atual de integracoes diretas (API-para-API) por uma arquitetura com:

- **API Gateway** (Kong/APISIX) — autenticacao, rate limiting, load balancing, failover
- **Mensageria** (NATS JetStream) — filas com garantia de entrega, retry automatico
- **Workers** — traducao DE-PARA entre formatos de sistemas diferentes

### Dois Modos de Operacao

| Modo | Quando usar | Componentes |
|------|-------------|-------------|
| **Passagem Direta** | Sistemas que ja falam a mesma lingua (IA, Dashboards) | Kong/APISIX → EME4 |
| **Com Tradutor** | Sistemas com formato diferente (Protheus → EME4) | Kong → NATS → Worker → EME4 |

## Status

| Item | Status |
|------|--------|
| Analise tecnica | Concluida |
| Comparativo Antigo vs Novo | Concluido |
| Apresentacao Slidev | Em andamento (17 slides) |
| Implementacao POC | Pendente aprovacao |

## Estrutura do Projeto

```
docs/
├── README.md                                    ← este arquivo
├── POC-Middleware-Comparativo-Antigo-vs-Novo.md  ← comparativo v1
├── POC-Middleware-Comparativo-Antigo-vs-Novo-v2.md ← comparativo v2
├── POC-Middleware-Kong-NATS-Analise.md           ← analise tecnica v1
├── POC-Middleware-Kong-NATS-Analise-v2.md        ← analise tecnica v2
├── POC-Middleware-Sessoes-e-LoadBalancing.md      ← gestao de sessoes
├── poc-middleware-slidev/                         ← apresentacao Slidev
│   ├── slides.md                                 ← 17 slides
│   ├── style.css                                 ← CSS customizado (~1050 linhas)
│   └── public/                                   ← assets estaticos
└── documentacao/                                  ← registros detalhados
```

## Documentacao Tecnica

| Data | Documento | Descricao |
|------|-----------|-----------|
| 04/03/2026 | [Comparativo Antigo vs Novo](POC-Middleware-Comparativo-Antigo-vs-Novo-v2.md) | Modelo atual (direto) vs Middleware |
| 04/03/2026 | [Analise Kong + NATS](POC-Middleware-Kong-NATS-Analise-v2.md) | Analise tecnica das tecnologias escolhidas |
| 04/03/2026 | [Sessoes e Load Balancing](POC-Middleware-Sessoes-e-LoadBalancing.md) | Gestao de sessoes stateful do EME4 |
| 06/03/2026 | [Animações SVG nos Slides de Pipeline](documentacao/2026-03-06-19-30-43-animacoes-svg-slides-pipeline.md) | Técnica de animação SVG com dots, linhas retangulares e load balancing visual |
| 06/03/2026 | [Padronização de Cores com Paleta Tailwind](documentacao/2026-03-06-22-07-40-padronizacao-cores-tailwind-palette.md) | Migração de cores inline (hex/rgba) para classes Tailwind CSS |
| 06/03/2026 | [Conversão de Classes flow-step para Tailwind Inline](documentacao/2026-03-06-22-53-00-flow-steps-classes-inline.md) | Eliminação de classes CSS customizadas flow-* em favor de utilitárias Tailwind |
| 08/03/2026 | [Retry Visual no Slide 5: Linhas de Retorno](documentacao/2026-03-08-11-59-17-retry-visual-slide5-linhas-retorno.md) | Paths SVG de retorno (EME4→Worker→NATS), overlay de erro e animações de retry |
| 08/03/2026 | [Load Balancing vs Retry: Garantia de Entrega](documentacao/2026-03-08-11-59-17-loadbalance-vs-retry-nats-garantia-entrega.md) | Análise de negócio: como LB e Retry/Nak do NATS JetStream se complementam |
| 08/03/2026 | [Plano: Slides LB vs Retry Cenários](documentacao/2026-03-08-12-31-56-plano-slides-lb-vs-retry-cenarios.md) | Planejamento de 3 slides animados com cenários hipotéticos de LB e Retry |
| 08/03/2026 | [Implementação Slides 6a/6b/6c: Cenários LB vs Retry](documentacao/2026-03-08-16-44-42-slides-cenarios-lb-retry-implementacao.md) | 3 slides com animações SVG, v-click.hide, retornos sucesso/erro e single-play |
| 08/03/2026 | [Correção v-click Slide 6c: Sobreposição](documentacao/2026-03-08-20-21-38-correcao-vclick-slide6c-sobreposicao.md) | Fix de elementos sobrepostos com v-click.hide e click ranges [enter, leave] |
| 08/03/2026 | [Análise: Componentes Vue + Animações Modernas](documentacao/2026-03-08-21-30-06-analise-arquitetura-componentes-vue-animacoes.md) | Arquitetura com offset-path, v-motion, useSpring e componentes reutilizáveis |
| 08/03/2026 | [Migração para Componentes Vue + offset-path](documentacao/2026-03-08-23-08-12-migracao-componentes-vue-slides-cenario.md) | Criação de FlowNode/FlowDot/FlowBadge, migração slides 5/6a/6b/6c, remoção de ~280 linhas CSS |

## Apresentacao

A apresentacao para a diretoria esta em `poc-middleware-slidev/`. Para executar:

```bash
cd poc-middleware-slidev
pnpm install
pnpm dev
```

Acesse `http://localhost:3030`

### Slides

1. Titulo
2. Como funciona hoje
3. Fluxo passo a passo (hoje)
4. Modelo Novo — visao geral
5. Modo 2: Com Tradutor (Worker)
6a. Cenário 1: LB Resolve (1ª Linha de Defesa)
6b. Cenário 2: Retry Resolve (Quando o LB não basta)
6c. Cenário 3: Ambos Fora (A Fila Garante)
7. Como funcionaria com o Middleware
8. Comparacao cenario a cenario
8. Visao Estrategica
9. Analogia: O Restaurante
10. Por que confiamos nessas tecnologias?
11. **NATS — Publish / Subscribe** (animacao interativa)
12. Modo 1: Passagem Direta
13. Visao Estrategica: Pista de Decolagem para IA
14. Recomendacao

## Stack Tecnica

| Componente | Tecnologia | Funcao |
|------------|-----------|--------|
| API Gateway | Kong / APISIX | Auth, LB, Failover, Rate Limit, Logging |
| Mensageria | NATS JetStream | Filas, garantia de entrega, pub/sub |
| Backend | Go (DDD, GORM, Bun) | Workers, traducao DE-PARA |
| Frontend | Vue.js + TailwindCSS | Interfaces de monitoramento |
| Apresentacao | Slidev + UnoCSS | Slides interativos (~1300 linhas CSS) |

## Proximos Passos

1. Aprovacao da POC pela diretoria
2. Implementacao do escopo reduzido: 1 cadastro (Centro de Trabalho) + 1 fluxo OP
3. Medicao de performance real
4. Decisao de expansao

---

*Atualizado em: 08/03/2026 21:30*
