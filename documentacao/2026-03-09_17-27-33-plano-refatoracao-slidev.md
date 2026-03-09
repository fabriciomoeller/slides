# Plano de Refatoração Slidev — Fase 1

## Contexto
- A apresentação Slidev do POC Middleware possui 17 slides em arquivo único (1.163 linhas) com style.css de 1.628 linhas
- Análise identificou funcionalidades nativas do Slidev não aproveitadas e oportunidades de melhoria
- Plano organizado em 4 prioridades (P1–P4) com 17 itens totais

## Plano Completo

### P1 — Alto Impacto, Baixo Esforço
1. **Notas do Apresentador** — Adicionar notas de fala em cada slide para modo Presenter
2. **Layouts nativos `two-cols`** — Substituir `grid grid-cols-2` manual por layout nativo nos slides comparativos
3. **Layout `statement`/`fact`** — Destacar métricas impactantes no slide de tecnologias
4. **Exportar PDF** — Configurar `exportFilename` para distribuição pós-apresentação

### P2 — Alto Impacto, Esforço Médio
5. **Multi-arquivo (src imports)** — Dividir slides.md em ~7 módulos temáticos
6. **Consolidar variantes CSS com custom properties** — Reduzir ~100 linhas duplicadas
7. **Migrar CSS simples para UnoCSS** — Reduzir ~200-250 linhas do style.css
8. **`<style scoped>` per-slide** — Mover CSS específico de slide para blocos scoped
9. **Componente `<Arrow>` nativo** — Substituir SVG `<line>` manuais simples

### P3 — Impacto Médio, Esforço Maior
10. **`view-transition`** — Transições morphing entre slides
11. **`v-motion :click-N`** — Animações vinculadas a clicks intermediários
12. **Consolidar FlowNode/FlowDot/FlowBadge** — Unificar componentes
13. **Remover `!important`** — Limpar CSS desnecessário
14. **Layout `section`** — Slides de transição entre blocos temáticos

### P4 — Nice to Have
15. **UnoCSS shortcuts** em `uno.config.ts` — Tokens de design
16. **Google Fonts via frontmatter** — Tipografia consistente
17. **Corrigir cores proibidas no VisaoEstrategica.vue** — Green/orange → cyan/fuchsia

### Estimativa de Redução
| Arquivo | Atual | Após refatoração | Redução |
|---|---|---|---|
| slides.md | 1.163 linhas (monolítico) | ~150 linhas (index) + 7 módulos | Manutenibilidade |
| style.css | 1.628 linhas | ~900-1.000 linhas | ~40% menor |
| Componentes | 6 | 4-5 | Menos complexidade |

## Fase 1 — Itens Executados Nesta Sessão

### Item 17: Corrigir cores proibidas ✓
- `VisaoEstrategica.vue`: substituídas 6 cores proibidas (green `#10b981`/`#34d399`/`#6ee7b7`/`#064e3b` → cyan, orange `#f59e0b`/`#fbbf24` → fuchsia)
- `style.css`: removidas classes duplicadas `.tech-badge-green` e `.glow-green` (valores idênticos a `-cyan`), renomeada `.ve-pcard-green` → `.ve-pcard-cyan`
- `slides.md`: atualizada referência `ve-pcard-green` → `ve-pcard-cyan`

### Item 1: Notas do Apresentador ✓
- Adicionados blocos `<!-- notas -->` ao final de cada slide com pontos-chave de fala em português
- Notas acessíveis via modo Presenter (`/presenter` na URL)
- Foco em orientar o apresentador na reunião com a diretoria

### Item 2: Layouts `two-cols` — Descartado
- Avaliados slides 4 (mode-cards), 11 (comparação), 15 (dimensionamento)
- Todos usam `grid grid-cols-2` com classes CSS customizadas (comp-panel, mode-card, info-card) e v-clicks complexos
- O layout nativo `two-cols` com slots `::left::`/`::right::` não suporta wrappers com classes customizadas
- **Decisão**: manter `grid grid-cols-2` — funcional, testado, sem ganho na troca

### Item 3: Layout `statement`/`fact` — Descartado
- O layout `fact` é para destacar UM único número grande
- O slide de tecnologias (13) tem 4 stat-cards + 3 info-cards — complexo demais
- Criar slide extra só para uma métrica mudaria a narrativa sem ganho real
- **Decisão**: manter layout atual — já tem impacto visual forte

### Item 4: Exportar PDF ✓
- Adicionado `exportFilename: POC-Middleware-EME4` ao frontmatter global
- Comando: `npx slidev export` gera `POC-Middleware-EME4.pdf`

### Item 5: Multi-arquivo ✓
- `slides.md` reescrito como índice (50 linhas) com 9 imports via `src:`
- Estrutura:
  - `slides/01-titulo.md` (33 linhas, 1 slide)
  - `slides/02-situacao-atual.md` (117 linhas, 2 slides)
  - `slides/03-modelo-novo.md` (140 linhas, 2 slides)
  - `slides/04-cenarios.md` (238 linhas, 3 slides)
  - `slides/05-analogia-comparacao.md` (233 linhas, 3 slides)
  - `slides/06-visao-estrategica.md` (103 linhas, 1 slide)
  - `slides/07-tecnologias.md` (159 linhas, 2 slides)
  - `slides/08-dimensionamento.md` (55 linhas, 1 slide)
  - `slides/09-recomendacao.md` (41 linhas, 1 slide)
- Total: 16 slides em 1.119 linhas (vs. 1.163 no monolítico)

## Walkthrough
- `cd poc-middleware-slidev && npx slidev` — verificar renderização
- Navegar por todos os 16 slides conferindo animações e v-clicks
- Acessar `/presenter` na URL para verificar notas de fala
- `npx slidev export` — gerar PDF e conferir `POC-Middleware-EME4.pdf`

## Task Executada
- [x] Item 17: Corrigir cores proibidas no VisaoEstrategica.vue e style.css
- [x] Item 1: Notas do apresentador em todos os slides
- [ ] Item 2: Layouts two-cols — descartado (sem ganho real)
- [ ] Item 3: Layout statement/fact — descartado (sem ganho real)
- [x] Item 4: Configurar exportação PDF
- [x] Item 5: Dividir slides.md em multi-arquivo (9 módulos)

## Validação
- `npx slidev` — verificar que todos os 16 slides renderizam corretamente
- `/presenter` — verificar notas do apresentador
- `npx slidev export` — gerar PDF `POC-Middleware-EME4.pdf`
- Conferir paleta colorblind no VisaoEstrategica.vue (zero cores proibidas)
