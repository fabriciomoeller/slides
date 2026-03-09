# UnoCSS Shortcuts e Configuração Google Fonts

## Contexto
- Os slides da apresentação tinham padrões de classes utilitárias repetidos dezenas de vezes: step-items (listas de passos com borda lateral) e num-badges (círculos numerados) apareciam 23+ vezes cada
- A configuração de fontes (Nunito Sans + Fira Code) era implícita via tema default do Slidev — sem declaração explícita no frontmatter

## Implementação

### Item 15 — UnoCSS Shortcuts

Adicionados 5 novos shortcuts em `uno.config.ts`:

| Shortcut | Classes que substitui | Ocorrências |
|----------|----------------------|-------------|
| `step-item` | `flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid bg-slate-800/40` | 5 (slide 3) |
| `step-item-sm` | `flex items-center gap-3 py-1.5 px-4 rounded-[10px] border-l-3 border-l-solid bg-slate-800/40` | 15 (slides 5, 6a-c) |
| `step-item-xs` | `flex items-center gap-2 py-1 px-3 rounded-[10px] border-l-3 border-l-solid bg-slate-800/40` | 3 (slide 9) |
| `num-badge` | `rounded-full flex items-center justify-center font-700 shrink-0` | 23 (todos os step-items) |
| `mini-stat` | `text-center px-4 py-2 rounded-10px bg-slate-800/40 border` | 4 (slide 14) |

Cores, tamanhos de fonte e tamanhos de badge permanecem inline por variarem entre slides.

**Antes:**
```html
<div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.65em] bg-slate-800/40 border-l-blue-500 text-blue-300">
  <div class="w-28px h-28px rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">1</div>
```

**Depois:**
```html
<div class="step-item text-[0.65em] border-l-blue-500 text-blue-300">
  <div class="num-badge w-28px h-28px text-[0.85em] bg-blue-500/20 text-blue-400">1</div>
```

### Item 16 — Google Fonts

Adicionada configuração explícita no frontmatter de `slides.md`:

```yaml
fonts:
  sans: Nunito Sans
  mono: Fira Code
  weights: '200,400,600'
```

O Slidev gera automaticamente o link para Google Fonts CDN com os pesos declarados.

### Arquivos modificados
- `poc-middleware-slidev/uno.config.ts` — 5 novos shortcuts
- `poc-middleware-slidev/slides.md` — configuração `fonts:` no frontmatter
- `poc-middleware-slidev/slides/02-situacao-atual.md` — 5 step-items + 5 num-badges
- `poc-middleware-slidev/slides/03-modelo-novo.md` — 6 step-items + 6 num-badges
- `poc-middleware-slidev/slides/04-cenarios.md` — 9 step-items + 9 num-badges
- `poc-middleware-slidev/slides/05-analogia-comparacao.md` — 3 step-items + 3 num-badges
- `poc-middleware-slidev/slides/07-tecnologias.md` — 4 mini-stats

## Walkthrough
- `cd poc-middleware-slidev && npx slidev`
- Verificar slides 3, 5, 6a-c, 9, 14: step-items devem renderizar com borda lateral colorida + círculo numerado
- Verificar slide 14: mini-stats devem ter borda colorida, fundo escuro, texto centralizado
- Verificar que fontes Nunito Sans e Fira Code carregam corretamente

## Task Executada
- [x] Criar shortcuts `step-item`, `step-item-sm`, `step-item-xs` em uno.config.ts
- [x] Criar shortcut `num-badge` em uno.config.ts
- [x] Criar shortcut `mini-stat` em uno.config.ts
- [x] Refatorar 23 step-items em 5 arquivos de slides
- [x] Refatorar 23 num-badges nos mesmos arquivos
- [x] Refatorar 4 mini-stats em 07-tecnologias.md
- [x] Declarar fontes explicitamente no frontmatter de slides.md
- [x] Build validado sem erros

## Validação
- `npx slidev build` passa sem erros
- HTML gerado contém link Google Fonts com Nunito Sans + Fira Code (wght 200,400,600)
- Todos os 17 slides renderizam corretamente
