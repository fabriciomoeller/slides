# Refatoração Fase 2 — Limpeza de CSS e Consolidação de Cores

## Contexto
- O `style.css` global tinha ~1.620 linhas, incluindo ~780 linhas de CSS morto (classes não utilizadas por nenhum slide)
- Variantes de cores repetiam blocos inteiros (ex: `.tech-badge-blue`, `.tech-badge-purple`, `.tech-badge-cyan` com mesma estrutura)
- Classe `.stats-row` podia ser substituída por utilitários UnoCSS inline
- Itens 6, 7 e 8 do plano de refatoração

## Implementação

### Item 6: Consolidação de variantes de cor com custom properties
- `tech-badge-*` → consolidado com variável `--tb` (R G B) e `rgb(var(--tb) / alpha)`
- `stat-glow-*` → consolidado com variável `--sg`
- Padrão: classe define a variável, seletor genérico `[class*="prefix-"]` aplica os estilos
- **Nota**: tentou-se o mesmo padrão nos `<style>` de .md importados, mas `rgb(var() / alpha)` não funcionou — mantido com `rgba()` explícito

### Item 7: Migração de CSS simples para UnoCSS inline
- `.stats-row` em `07-tecnologias.md` → substituído por `flex justify-center gap-4 flex-wrap my-4`
- Classe removida do `style.css`

### Item 8: Remoção de CSS morto
- **~780 linhas removidas** de classes não utilizadas:
  - `pipe-*` (pipeline diagram antigo)
  - `middleware-*` (middleware box antigo)
  - `benefit-*` (benefit pills)
  - `timeline-*` (timeline row)
  - `nats-*` (pub/sub animation antigo — substituído por FlowNode/FlowDot)
  - `s6-*` (exceto `s6-message` que permanece)
  - `ve-slide`, `ve-title`, `ve-arch`, `ve-center`, `ve-lines`, `ve-middleware`, `ve-bottom`, `ve-box-*`, `ve-col-*`, `ve-line-*` (layout antigo da visão estratégica)
- **CSS vivo mantido no `style.css`**: slide-bg, company-badge, gradient-*, tech-badge-*, accent-bar-*, info-card-*, pulseAlert, result-*, stat-card-*, SVG classes, scenario-flow-*, FlowDot/FlowNode keyframes, mode-*, comp-*, ve-*, rec-*, anim-sync-*

### Tentativa de co-locação descartada
- Tentou-se mover CSS slide-específico para `<style>` nos .md importados via `src:`
- **Resultado**: estilos não aplicaram de forma confiável em arquivos multi-slide
- **Decisão**: manter todo CSS no `style.css` global (funciona corretamente)

### Resultado final
- `style.css`: de ~1.620 linhas para ~470 linhas (~70% de redução)
- Zero CSS morto restante
- Consolidação com custom properties no CSS global (tech-badge, stat-glow)

## Walkthrough
- `cd poc-middleware-slidev && npx slidev` — verificar todos os 17 slides
- Slide 4 (Modelo Novo): cards mode-card-cyan e mode-card-fuchsia com bordas e backgrounds
- Slide 12 (Comparação): panels comp-panel-pink e comp-panel-cyan
- Slide 13 (Visão Estratégica): timeline ve-dot-*, phase cards ve-pcard-*
- Slide 13 (Tecnologias): stats-row substituído por UnoCSS flex inline
- Slide 17 (Recomendação): cards rec-card-cyan/blue/purple

## Task Executada
- [x] Item 6: Consolidar variantes de cor com custom properties (tech-badge, stat-glow)
- [x] Item 7: Migrar stats-row para UnoCSS inline
- [x] Item 8: Remover ~780 linhas de CSS morto
- [x] Tentativa de co-locação em `<style>` de .md → descartada (não funciona em multi-slide)
- [x] Todos os estilos vivos restaurados no style.css global

## Validação
- Build `npx slidev build` passa sem erros
- Todos os 17 slides renderizam corretamente
- Slide 4 (mode-cards) confirmado visualmente pelo usuário
- Nenhuma referência a classes removidas nos arquivos .md
