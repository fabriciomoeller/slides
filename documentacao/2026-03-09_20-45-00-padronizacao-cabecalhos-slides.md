# Padronização de Cabeçalhos dos Slides

## Contexto
- Os slides tinham cabeçalhos inconsistentes: alguns usavam `accent-bar` (borda lateral colorida), outros `gradient-subtitle` + `gradient-divider` (subtítulo simples + linha centralizada), e dois usavam divs customizados
- O padrão preferido: **Título (H1) + subtítulo simples (gradient-subtitle) + linha divisória centralizada (gradient-divider)**

## Implementação

### Padrão adotado para todos os slides
```html
# Título do Slide

<div class="gradient-subtitle text-[0.9rem]">Subtítulo descritivo</div>
<div class="gradient-divider mx-auto mt-2 mb-4"></div>
```
- `gradient-subtitle`: texto cinza `#94a3b8`, sem borda, sem background
- `gradient-divider mx-auto`: linha gradiente azul→roxo, 200px, centralizada

### Slides alterados

| Slide | Arquivo | Antes | Depois |
|-------|---------|-------|--------|
| 2 | 02-situacao-atual.md | accent-bar-blue | gradient-subtitle + divider |
| 3 | 02-situacao-atual.md | accent-bar-pink | gradient-subtitle + divider |
| 5 | 03-modelo-novo.md | accent-bar-fuchsia | gradient-subtitle + divider |
| 6 | 04-cenarios.md | accent-bar-fuchsia | gradient-subtitle + divider |
| 7 | 04-cenarios.md | accent-bar-pink | gradient-subtitle + divider |
| 8 | 04-cenarios.md | accent-bar-pink | gradient-subtitle + divider |
| 9 | 05-analogia-comparacao.md | accent-bar-pink | gradient-subtitle + divider |
| 10 | 05-analogia-comparacao.md | div custom | `# Title` + gradient-subtitle + divider |
| 11 | 05-analogia-comparacao.md | sem subtitle | gradient-subtitle + divider adicionados |
| 12 | 06-visao-estrategica.md | div custom | `# Title` + divider (subtitle removido pelo usuário) |
| 13 | 07-tecnologias.md | sem subtitle | gradient-subtitle + divider adicionados |
| 14 | 07-tecnologias.md | accent-bar-cyan | gradient-subtitle + divider |
| 15 | 08-dimensionamento.md | accent-bar-cyan | gradient-subtitle + divider |

### Slides que já estavam no padrão (sem alteração)
- Slide 4 (03-modelo-novo.md, 1º slide): já tinha gradient-subtitle + gradient-divider
- Slide 17 (09-recomendacao.md): já tinha gradient-subtitle + gradient-divider

### Accent-bars mantidos
- Accent-bars de **conteúdo interno** (não cabeçalho) permaneceram nos slides de analogia (05-analogia-comparacao.md) — servem como separadores de seções dentro do slide

### Ajustes manuais do usuário
- Slide 12 (06-visao-estrategica.md): removeu o gradient-subtitle, mantendo apenas título + divider
- Slide 13 (07-tecnologias.md): ajustou margem de `mt-10` para `mt-7` nos cards

## Walkthrough
- `cd poc-middleware-slidev && npx slidev` — verificar todos os 17 slides
- Cada slide deve ter: título H1 + subtítulo cinza (quando aplicável) + linha gradiente centralizada
- Conferir que accent-bars internos (slides de analogia) permanecem intactos

## Task Executada
- [x] Mapear cabeçalhos de todos os 17 slides
- [x] Substituir accent-bars de cabeçalho por gradient-subtitle + gradient-divider
- [x] Converter cabeçalhos customizados (divs) para padrão `# Title`
- [x] Adicionar subtítulo e divider em slides que não tinham
- [x] Manter accent-bars de conteúdo interno

## Validação
- Build `npx slidev build` passa sem erros
- Todos os 17 slides renderizam com cabeçalho padronizado
- Aprovado visualmente pelo usuário
