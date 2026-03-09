# 2026-03-09 — Substituição de Números por Ícones nos Modos do Middleware

## Objetivo

Substituir os números "1" e "2" dos cards e referências aos modos do middleware por ícones representativos. Os dois modos (Passagem Direta e Com Tradutor) **não são etapas sequenciais**, mas formas de operação que coexistem — a numeração induzia interpretação incorreta de sequência.

## Alterações Realizadas

### Ícones escolhidos (Phosphor Icons — `ph`)

| Modo | Ícone | Classe UnoCSS | Significado |
|------|-------|---------------|-------------|
| Passagem Direta | Seta → | `i-ph-arrow-right-bold` | Fluxo direto, sem intermediários |
| Com Tradutor | Setas ↻ | `i-ph-arrows-clockwise-bold` | Processamento/transformação com worker |

### Arquivos modificados

- `poc-middleware-slidev/slides.md` — 5 substituições em 3 slides

### Detalhamento por slide

| Slide | Linha | Antes | Depois |
|-------|-------|-------|--------|
| Slide 4 (Modelo Novo) | Card cyan | Número `1` dentro de `.mode-number` | `i-ph-arrow-right-bold` cyan |
| Slide 4 (Modelo Novo) | Card fuchsia | Número `2` dentro de `.mode-number` | `i-ph-arrows-clockwise-bold` fuchsia |
| Slide 5 (Título H1) | `# Modo 2: Com Tradutor` | Texto "Modo 2:" | Ícone ↻ fuchsia |
| Slide final (barra cyan) | `accent-bar` | "Modo 1: Passagem direta..." | Ícone → cyan + texto |
| Slide final (barra fuchsia) | `accent-bar` | "Modo 2: Com Worker..." | Ícone ↻ fuchsia + texto |

### Decisões técnicas

- Ícones `bold` (não `regular`) para manter espessura compatível com a tipografia
- `text-[1.2em]` nos cards do slide 4 para proporção adequada no círculo de 50px
- `align-middle` nos títulos e barras para alinhamento vertical com o texto
- Cores herdadas do contexto: cyan para Passagem Direta, fuchsia para Com Tradutor
- Comentários HTML (`<!-- MODO 1 -->`, `<!-- MODO 2 -->`) mantidos para navegação no código

## Verificação Técnica

- [x] Ícones renderizam corretamente no Slidev
- [x] Layout, tamanhos e alinhamentos preservados
- [x] Cores consistentes com a paleta colorblind do projeto
- [x] Nenhuma referência numérica "1/2" visível nos slides
- [x] Comentários HTML mantidos para orientação do desenvolvedor

## Metadata

- **Data**: 09/03/2026 13:56
- **Status**: Concluído
- **Tipo**: Melhoria visual / UX
