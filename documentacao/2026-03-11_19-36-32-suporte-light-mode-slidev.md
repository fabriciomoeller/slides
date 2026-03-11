# 11/03/2026 - Suporte a Light Mode no Slidev

## Contexto
- A apresentação usava `colorSchema: auto` mas 100% das cores eram hardcoded para dark mode
- No light mode, textos claros (blue-400, cyan-400) desapareciam sobre fundo branco
- Backgrounds escuros (`rgba(30,41,59,...)`) ficavam deslocados em fundo claro
- O diretor é deuteranópico — tons de rosa/vermelho no light mode poderiam ser confundidos com vermelho puro

## Implementação

### Arquivos modificados (18 arquivos, +406 -325 linhas)

**CSS e configuração:**
- `poc-middleware-slidev/style.css` — ~30 custom properties em `:root` (light) e `.dark` (dark), classes adaptativas
- `poc-middleware-slidev/uno.config.ts` — Shortcuts step-item/mini-stat com `bg-white shadow-sm dark:shadow-none dark:bg-slate-800/40`

**Componentes Vue (4):**
- `components/FlowDot.vue` — `fillMap`/`shadowMap` reativos via `useDark()` + `computed()`
- `components/FlowNode.vue` — `colorMap` com pastéis sólidos (`bg-*-50`) no light, semi-transparentes no dark
- `components/FlowBadge.vue` — `colorTextMap` com variantes `dark:` e pink→fuchsia no light
- `components/FlowHintLayer.vue` — Opacidades de borda aumentadas (0.5→0.6)

**Slides .md (12):**
- `slides.md`, `02-situacao-atual.md`, `03-modelo-novo.md`, `04-analogia-comparacao.md`
- `05-anatomia-middleware.md`, `06-glossario-visual.md`, `07-cenarios.md`
- `08-n8n-no-ecossistema.md`, `08-dimensionamento.md`, `09-tecnologias.md`
- `10-visao-estrategica.md`, `11-recomendacao.md`

### Decisões técnicas

1. **CSS Custom Properties** para classes compartilhadas (`style.css`), **UnoCSS `dark:`** para utilitárias inline nos `.md`
2. **Tema flat/branco**: cards com `bg-white` + `box-shadow: 0 1px 4px rgba(0,0,0,0.06)` em vez de backgrounds semi-transparentes
3. **FlowNodes pastéis**: `bg-*-50` (ex: `bg-cyan-50`) no light em vez de `bg-*-500/8` (quase invisível)
4. **Pink→Fuchsia no light mode**: todas as referências `text-pink-*`/`bg-pink-*`/`border-pink-*` no light mode foram trocadas por fuchsia/magenta para acessibilidade deuteranópica. No dark mode, pink foi mantido pois tem contraste suficiente sobre fundo escuro
5. **SVG fills/strokes** via custom properties (`--fill-cyan`, `--shadow-cyan`, etc.) para adaptar automaticamente

### Padrão de cores light vs dark

| Elemento | Light | Dark |
|----------|-------|------|
| Card bg | `#ffffff` | `rgba(30,41,59,0.6)` |
| Card shadow | `0 1px 4px rgba(0,0,0,0.06)` | nenhum |
| Texto principal | `slate-700/800` | `slate-300/400` |
| Accent cyan | `cyan-600/700` | `cyan-300/400` |
| Accent pink | `fuchsia-700/800` | `pink-300/400` |
| FlowNode bg | `*-50` (sólido) | `*-500/12` (transparente) |
| SVG fill cyan | `#0891b2` | `#22d3ee` |

## Walkthrough

1. Iniciar o servidor de desenvolvimento:
   ```bash
   cd poc-middleware-slidev
   pnpm dev
   ```
2. Acessar `http://localhost:3030`
3. Clicar no ícone de sol/lua no canto inferior para alternar entre light e dark mode
4. Navegar por TODOS os slides verificando:
   - Textos legíveis em ambos os modos
   - Cards com fundo branco e sombra sutil no light mode
   - FlowNodes com backgrounds pastéis visíveis
   - Nenhum tom vermelho/rosa puro no light mode (tudo fuchsia/magenta)
   - SVGs (dots, linhas, badges) com cores adequadas em ambos os modos

## Task Executada
- [x] Definir custom properties em `:root` e `.dark` no `style.css`
- [x] Atualizar classes CSS compartilhadas para usar variáveis
- [x] Adaptar FlowDot.vue com `useDark()` reativo
- [x] Adaptar FlowNode.vue com pastéis sólidos (`bg-*-50`)
- [x] Adaptar FlowBadge.vue com variantes `dark:`
- [x] Adaptar FlowHintLayer.vue com opacidades maiores
- [x] Atualizar uno.config.ts (step-item, mini-stat)
- [x] Adicionar variantes `dark:` em todos os 12 slides .md
- [x] Trocar pink→fuchsia no light mode para acessibilidade
- [x] Build verificado sem erros

## Validação
- Build `npx slidev build` passou sem erros (15.9s)
- Nenhuma referência `border-pink-500` residual nos slides
- Nenhuma referência `text-pink-[5-9]00` sem variante dark nos slides
- Paleta colorblind-safe mantida: sem verde, laranja ou vermelho puro
