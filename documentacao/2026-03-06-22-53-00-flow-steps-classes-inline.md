# 06/03/2026 22:53 - Conversão de Classes flow-step para Tailwind Inline

## Contexto
- Os slides usavam classes CSS customizadas (`flow-steps`, `flow-step`, `flow-step-blue`, `flow-step-cyan`, etc.) definidas no `style.css`
- Seguindo a padronização iniciada na tarefa anterior (paleta Tailwind), estas classes foram convertidas para classes utilitárias inline
- Objetivo: eliminar dependência de CSS customizado e manter consistência com o padrão Tailwind do projeto

## Implementação

### Mapeamento de classes

| Classe CSS | Classes Tailwind inline |
|---|---|
| `.flow-steps` | `flex flex-col gap-2 max-w-Xpx mx-auto` |
| `.flow-step` | `flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.88em] bg-slate-800/40` |
| `.flow-step-blue` | `border-l-blue-500 text-blue-300` |
| `.flow-step-cyan` | `border-l-cyan-500 text-cyan-300` |
| `.flow-step-fuchsia` | `border-l-fuchsia-500 text-fuchsia-300` |
| `.flow-step-pink` | `border-l-pink-500 text-pink-300` |
| `.flow-step-purple` | `border-l-violet-500 text-violet-300` |
| `.flow-step-num` | `w-28px h-28px rounded-full flex items-center justify-center font-700 text-[0.85em] shrink-0` + cores da variante |
| `.flow-step-num-alert` | `bg-pink-500/20 text-pink-300 animate-[pulseAlert_1.5s_ease-in-out_infinite]` |

### Exemplo de conversão

```html
<!-- Antes -->
<div class="flow-steps">
  <div class="flow-step flow-step-blue">
    <div class="flow-step-num">1</div>
    <div>Texto do passo</div>
  </div>
</div>

<!-- Depois -->
<div class="flex flex-col gap-2 max-w-700px mx-auto">
  <div class="flex items-center gap-3 py-2 px-4 rounded-[10px] border-l-3 border-l-solid text-[0.88em] bg-slate-800/40 border-l-blue-500 text-blue-300">
    <div class="w-28px h-28px rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-700 text-[0.85em] shrink-0">1</div>
    <div>Texto do passo</div>
  </div>
</div>
```

### Arquivos modificados
- `poc-middleware-slidev/slides.md` — substituição de todas as ocorrências de classes `flow-*` por Tailwind inline
- `poc-middleware-slidev/style.css` — remoção de ~55 linhas de CSS (classes `.flow-steps`, `.flow-step`, variantes de cor, `.flow-step-num`, `.flow-step-num-alert`)

### O que permanece no CSS
- `@keyframes pulseAlert` — necessário para a animação do ícone de alerta (referenciado via `animate-[pulseAlert_...]` inline)

### Slides afetados
| Slide | Conversões |
|---|---|
| 3 (Fluxo passo a passo) | 1 container `flow-steps`, 5 `flow-step` (2 blue, 1 fuchsia, 1 cyan, 1 pink), 5 `flow-step-num` |
| 5 (Com Tradutor) | 1 container `flow-steps`, 6 `flow-step` (1 blue, 2 purple, 2 fuchsia, 1 cyan já convertido), 6 `flow-step-num` |
| 12 (Passagem Direta) | 1 container `flow-steps`, 3 `flow-step` (2 purple, 1 cyan já convertido), 3 `flow-step-num` |

## Walkthrough
1. `cd poc-middleware-slidev && pnpm dev`
2. Navegar pelos slides 3, 5 e 12
3. Verificar que os flow-steps mantêm visual idêntico (cores, bordas, layout)
4. Verificar que o ícone de alerta (slide 3, último passo) mantém animação pulsante

## Task Executada
- [x] Conversão de `flow-steps` container (3 ocorrências)
- [x] Conversão de `flow-step` + variantes de cor (14 ocorrências)
- [x] Conversão de `flow-step-num` base e com override (14 ocorrências)
- [x] Conversão de `flow-step-num-alert` (1 ocorrência)
- [x] Conversão de `style="font-weight:600"` para `font-600` (2 ocorrências)
- [x] Remoção de ~55 linhas de CSS customizado do `style.css`
- [x] Manutenção do `@keyframes pulseAlert` no CSS

## Validação
- Nenhuma referência a `flow-step` restante no `slides.md`
- CSS reduzido — apenas `@keyframes pulseAlert` mantido
- Layout e cores visualmente idênticos ao estado anterior

---
**Data**: 06/03/2026 22:53
**Status**: Concluído
**Tipo**: Refatoração / Inline CSS → Tailwind
