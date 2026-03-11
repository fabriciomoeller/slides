# 11/03/2026 - Reorganização da Ordem dos Slides

## Contexto
- A apresentação Slidev seguia uma ordem de slides que não favorecia a fluidez narrativa para o público executivo (diretoria)
- Problemas identificados:
  - A **analogia do restaurante** (slide mais acessível) aparecia tarde demais — depois dos cenários técnicos animados
  - A **anatomia do middleware** (3 camadas) vinha depois da visão estratégica, invertendo a lógica (destino antes do veículo)
  - A **visão estratégica** (IA e expansão) aparecia antes das métricas de confiança, perdendo impacto
  - O **glossário visual** ficava entre a solução e os cenários sem que a analogia tivesse preparado o terreno

## Implementação
- **Arquivo modificado**: `poc-middleware-slidev/slides.md`
- Nenhum conteúdo de slide foi alterado — apenas a ordem dos `src:` imports

### Ordem anterior
| # | Slide | Papel |
|---|-------|-------|
| 1 | Capa | Abertura |
| 2 | 02-situacao-atual | Problema |
| 3 | 03-modelo-novo | Solução |
| 4 | 03b-glossario-visual | Legenda |
| 5 | 04-cenarios | Cenários |
| 6 | 05-analogia-comparacao | Analogia |
| 7 | 06-visao-estrategica | Visão futura |
| 8 | 06b-anatomia-middleware | Deep-dive |
| 9 | 06c-n8n-no-ecossistema | FAQ |
| 10 | 07-tecnologias | Métricas |
| 11 | 08-dimensionamento | Viabilidade |
| 12 | 09-recomendacao | Call to action |

### Nova ordem
| # | Slide | Papel |
|---|-------|-------|
| 1 | Capa | Abertura |
| 2 | 02-situacao-atual | Problema |
| 3 | 03-modelo-novo | Solução |
| 4 | 05-analogia-comparacao | Analogia (reforça entendimento) |
| 5 | 06b-anatomia-middleware | 3 camadas (aprofunda) |
| 6 | 03b-glossario-visual | Legenda (prepara cenários) |
| 7 | 04-cenarios | Cenários de resiliência |
| 8 | 06c-n8n-no-ecossistema | FAQ: e o N8N? |
| 9 | 07-tecnologias | Métricas e confiança |
| 10 | 06-visao-estrategica | Visão futura (após provas) |
| 11 | 08-dimensionamento | Equipe e tempo |
| 12 | 09-recomendacao | Recomendação final |

### Arco narrativo resultante
```
PROBLEMA → SOLUÇÃO → ANALOGIA → COMO FUNCIONA → LEGENDA → PROVA → FAQ → CONFIANÇA → VISÃO → VIABILIDADE → PEDIDO
```

## Walkthrough
1. Executar `pnpm dev` em `poc-middleware-slidev/`
2. Navegar pelos slides na ordem e verificar que:
   - A analogia do restaurante aparece logo após o modelo novo
   - A anatomia (3 camadas) prepara o terreno antes dos cenários
   - A visão estratégica vem após as métricas de confiança
3. Todas as animações e v-clicks permanecem funcionais (nenhum conteúdo foi alterado)

## Task Executada
- [x] Análise da ordem atual dos slides
- [x] Identificação de problemas de fluidez narrativa
- [x] Proposta de reorganização com justificativa
- [x] Aplicação da nova ordem em `slides.md`

## Validação
- Apenas a ordem dos imports `src:` foi alterada — zero risco de quebra de conteúdo
- Cada slide é independente (não há referências cruzadas por número de slide)
- Arco narrativo segue padrão executivo: problema → solução → prova → visão → pedido
