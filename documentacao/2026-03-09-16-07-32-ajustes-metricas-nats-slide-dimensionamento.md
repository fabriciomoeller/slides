# 2026-03-09 — Ajuste de Métricas NATS e Novo Slide de Dimensionamento

## Contexto
- A métrica de "25 milhões msg/s" do NATS estava apresentada sem qualificação — esse valor é de cluster, não de servidor único
- A diretoria precisa de dados honestos para tomada de decisão
- Faltava um slide de dimensionamento de equipe e prazo para a POC

## Alterações Realizadas

### Slide 13 — Métricas NATS (correção)
- **Stat card**: "25 milhões" → "2 milhões" + "(NATS, 1 servidor)"
- **Frase principal**: Ajustada para "Um único servidor NATS já processa 2 milhões msg/s — e escala linearmente em cluster"
- **Nota de observação** (novo): Ícone `ph:info-bold` com texto "Com JetStream (persistência), o throughput é de ~1,2M msg/s por servidor"
- Substituídos `style="font-size:..."` inline por classes UnoCSS (`text-xs`, `text-[0.85rem]`, `text-[1.8rem]`)

### Slide 15 — Dimensionamento: Equipe e Tempo (novo)
- **Equipe** (3 profissionais):
  - 1 Dev Integração — APIs + Worker Go
  - 1 Infra/DevOps — NATS + Gateway
  - 1 Analista EME4 — negócio + validação
- **Cronograma** (4 semanas):
  - Semana 1–2: Infra + NATS + Gateway
  - Semana 3: Integração EME4
  - Semana 4: Testes + ajustes + entrega
- **Stat cards**: 3 profissionais, 4 semanas, R$ 0 licenças
- **Mensagem final**: "POC viável com equipe enxuta e prazo curto — sem custos de licenciamento"
- 3 v-clicks para revelação progressiva
- Slide de Recomendação renumerado para 16

### Referências de throughput NATS (single-server)
| Cenário | Throughput |
|---------|-----------|
| Pub sem subscriber | ~7-8M msg/s |
| Pub/Sub real | ~2M msg/s |
| JetStream (persistente) | ~1,2M msg/s |

Fonte: benchmarks públicos do NATS e análise comparativa.

## Verificação Técnica
- [x] Métrica "25 milhões" substituída por "2 milhões" com qualificação "(1 servidor)"
- [x] Nota de observação com ícone para JetStream (~1,2M)
- [x] Novo slide 15 com equipe e cronograma adequados ao escopo da POC
- [x] Font-sizes inline substituídos por classes UnoCSS/Tailwind
- [x] Paleta colorblind respeitada (cyan, blue, purple, fuchsia)
- [x] Slide de Recomendação renumerado para 16

## Task Executada
- [x] Correção da métrica NATS de 25M para 2M msg/s (single-server)
- [x] Adição de nota informativa sobre JetStream
- [x] Criação do slide de dimensionamento de equipe e tempo
- [x] Substituição de font-size inline por classes UnoCSS

## Validação
- Dados de throughput consistentes com benchmarks públicos
- Equipe dimensionada para escopo real: integração ERP Externo ↔ EME4 via middleware
- Sem menção a backend Go/frontend Vue (fora do escopo da POC)

---
**Data**: 09/03/2026 16:07
**Status**: Concluído
**Tipo**: Correção de dados + novo slide
