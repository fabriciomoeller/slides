# 06/03/2026 22:07 - Padronização de Cores com Paleta Tailwind CSS

## Contexto
- Os slides usavam cores hardcoded em `style=""` inline e arbitrary values UnoCSS (`bg-[rgba(...)]`, `text-[#hex]`, `border-[rgba(...)]`)
- Isso dificultava manutenção e consistência — alterar uma cor exigia buscar hex/rgba em múltiplos locais
- Tailwind CSS oferece paleta semântica com suporte a opacidade via `/` (ex: `bg-blue-500/20`)

## Implementação

### Mapeamento de cores

| Valor original | Classe Tailwind | Uso |
|---|---|---|
| `#93c5fd` | `blue-300` | Texto claro (nós blue) |
| `#60a5fa` | `blue-400` | Texto principal (nós blue) |
| `#3b82f6` | `blue-500` | Background sólido, base opacity |
| `#a78bfa` | `violet-400` | Texto principal (KONG) |
| `#8b5cf6` / `rgba(139,92,246,...)` | `violet-500` | Background/border com opacity |
| `#22d3ee` | `cyan-400` | Texto principal (NATS, EME4) |
| `#06b6d4` / `rgba(6,182,212,...)` | `cyan-500` | Background/border com opacity |
| `#e879f9` | `fuchsia-400` | Texto principal (Worker) |
| `#d946ef` / `rgba(217,70,239,...)` | `fuchsia-500` | Background/border com opacity |
| `#f472b6` | `pink-300` | Texto destaque (IA card) |
| `#94a3b8` | `slate-400` | Texto secundário (labels) |

### Padrão de conversão

**`style=""` inline → classes Tailwind:**
```html
<!-- Antes -->
<div class="flow-step-num" style="background:rgba(139,92,246,0.2);color:#a78bfa;">2</div>

<!-- Depois -->
<div class="flow-step-num bg-violet-500/20 text-violet-400">2</div>
```

**Arbitrary values → classes nomeadas:**
```html
<!-- Antes -->
<div class="... bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.4)] text-[#60a5fa]">

<!-- Depois -->
<div class="... bg-blue-500/12 border-blue-500/40 text-blue-400">
```

**`style="padding"` → classes Tailwind:**
```html
<!-- Antes -->
<div style="padding:12px 18px; box-shadow: 0 0 20px rgba(139,92,246,0.15);">

<!-- Depois -->
<div class="px-18px py-12px shadow-[0_0_20px_rgba(139,92,246,0.15)]">
```

### Arquivos modificados
- `poc-middleware-slidev/slides.md` — substituição de ~30 ocorrências de cores inline por classes Tailwind

### O que permanece como arbitrary value
- `bg-[rgba(30,58,95,0.9)]` — background escuro custom do nó "Sistema Externo" (sem equivalente na paleta)
- `bg-[rgba(10,50,60,0.9)]` — background escuro custom do nó "EME4" (sem equivalente na paleta)
- `shadow-[0_0_20px_...]` — shadows com glow colorido (sem preset Tailwind equivalente)
- Atributos SVG (`stroke`, `fill`) — propriedades SVG não usam classes Tailwind

### Slides afetados
| Slide | Conversões |
|---|---|
| 2 (Como funciona HOJE) | Nós HTML: border, text |
| 3 (Fluxo passo a passo) | flow-step-num: bg + text (fuchsia, cyan) |
| 4 (Modelo Novo) | mode-number: bg + text (cyan) |
| 5 (Com Tradutor) | 6 nós HTML + 2 badges + 6 flow-step-num |
| 10 (Tecnologias) | 3 info-cards: border-color + padding |
| 12 (Passagem Direta) | pipe-node: padding + shadow, 3 flow-step-num |
| 13 (Pista de Decolagem IA) | pipe-node shadow, 3 tl-dot bg, card-header text |

## Walkthrough
1. `cd poc-middleware-slidev && pnpm dev`
2. Navegar por todos os slides (1-14)
3. Verificar que cores dos nós, badges, flow-steps e cards permanecem idênticas
4. Confirmar que não há `style="...color..."` ou `style="...background..."` restante

## Task Executada
- [x] Mapeamento hex/rgba → paleta Tailwind
- [x] Conversão de ~30 ocorrências em slides.md
- [x] Eliminação de todos os `style=""` com cores
- [x] Manutenção de arbitrary values para cores custom sem equivalente

## Validação
- Todas as cores convertidas correspondem exatamente à paleta Tailwind CSS
- Nenhum `style=""` com `color`, `background` ou `border-color` restante no slides.md
- Apresentação renderiza identicamente antes e depois da conversão

---
**Data**: 06/03/2026 22:07
**Status**: Concluído
**Tipo**: Refatoração / Padronização
