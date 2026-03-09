# 08/03/2026 — Análise: Arquitetura de Componentes Vue + Animações Modernas para Slides de Cenário

## Objetivo

Avaliar a viabilidade de substituir os **384 linhas de CSS customizado** (13 @keyframes + classes de cenário) dos slides 6a/6b/6c por uma arquitetura baseada em **componentes Vue reutilizáveis**, **v-motion**, **offset-path** e composables do **VueUse**. O objetivo é reduzir complexidade, eliminar repetição e tornar os slides mais declarativos e fáceis de manter.

## Problema Atual

### CSS verboso e não-reutilizável

Os slides 6a, 6b e 6c (cenários LB vs Retry) acumularam:

| Métrica | Valor |
|---------|-------|
| @keyframes totais | 13 |
| Keyframes complexos (dots SVG) | 9 (258 linhas) |
| Keyframes simples (glow/pulse) | 4 (50 linhas) |
| CSS total de cenário | 384 linhas |
| Padrões SVG repetidos entre slides | 4 (fork, retorno sucesso, retorno erro, linha base) |

### Padrões repetidos identificados

O fork visual em `y=70, x=370` se repete em todos os 3 slides:

```svg
<!-- Path para EME4 1 (cima) -->
<path d="M300,70 L360,70 Q370,70 370,63 L370,42 Q370,35 380,35 L420,35"/>
<!-- Path para EME4 2 (baixo) -->
<path d="M300,70 L360,70 Q370,70 370,77 L370,98 Q370,105 380,105 L420,105"/>
```

Outros padrões repetidos:
- **Linha base** (cy:70): `M92,70 L200,70` — NATS→Worker (todos os slides)
- **Retorno sucesso** (cy:120): EME4→Worker→NATS pela parte inferior (6a, 6b, 6c)
- **Retorno erro** (cy:20): EME4→Worker→NATS pela parte superior (6b)

## Análise de Tecnologias

### 1. v-motion (VueUse Motion)

**O que pode animar:**
- Propriedades CSS: `opacity`, `scale`, `x`, `y`, `rotate`
- Propriedades SVG via CSS: `strokeDasharray`, `strokeDashoffset`, `strokeWidth`, `stroke`
- Funciona dentro de `<svg>` em elementos como `<circle>`, `<path>`, `<line>`

**Exemplo real já usado no projeto** (`slides.md` linha 1198):

```html
<circle cx="100" cy="100" r="50" fill="blue"
  v-motion
  :initial="{ opacity: 0, scale: 0 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 1000 } }"
/>
```

**O que NÃO anima nativamente:**
- Atributos SVG `cx`/`cy` (são atributos, não propriedades CSS)
- `box-shadow` (possível via JS, mas caro para GPU)
- `background-color` / `border-color` (não suportado pelo motor)

**Uso ideal:** entrada de nodes, sequências sincronizadas com v-click, efeito "linha se desenhando" via `strokeDasharray`.

### 2. offset-path (CSS moderno) — a peça que muda o jogo

**O que resolve:** dots seguindo curvas SVG exatas, sem keyframes manuais.

**Como funciona:**

```css
.dot {
  offset-path: path("M300,70 L360,70 Q370,70 370,77 L420,105");
  offset-distance: 0%;
  animation: followPath 1.5s ease-in-out infinite;
}

@keyframes followPath {
  to { offset-distance: 100%; }
}
```

**Vantagens sobre keyframes manuais:**
1. Movimento segue exatamente a curva (sem aproximar com porcentagens)
2. Se o path mudar, o dot continua correto (desacoplado)
3. 31 linhas de keyframe → ~5 linhas

**Suporte:** Chrome 55+, Firefox 72+, Safari 16+ — compatível com apresentação em desktop.

### 3. Composables VueUse relevantes

| Composable | Uso no projeto | Prioridade |
|------------|---------------|-----------|
| `useSpring` | Entrada de nodes com física de mola (mais natural que `duration: 1s`) | Alta |
| `useTransition` | Interpola `offset-distance` reativamente, sincroniza com `v-click` | Alta |
| `useMotions` | Orquestra múltiplos `v-motion` (mensagem→worker→ack em sequência) | Alta |
| `createReusableTemplate` | Templates reutilizáveis dentro do markdown, sem criar arquivo separado | Alta |
| `useRafFn` | `getPointAtLength()` por frame — **apenas fallback** para edge cases | Baixa |

#### Por que `useRafFn` foi descartado como padrão

Apesar de poderoso, ele sai do modelo declarativo para um loop de frame manual. Isso aumenta complexidade cognitiva (quem abrir o slide precisa entender RAF loop + path sampling + sincronização). Para slides de apresentação, `offset-path` + `useTransition` resolve 95% dos casos sem essa complexidade.

### 4. UnoCSS — camada de estilo

Substitui classes CSS customizadas por utilitários:

```html
<!-- Antes: classe customizada -->
<path class="svg-line svg-stroke-fuchsia"/>

<!-- Depois: utilitários UnoCSS -->
<path class="stroke-fuchsia stroke-2 fill-none"/>
```

Para microefeitos que continuam como CSS:

```html
<div class="animate-pulse opacity-80"/>
```

Para `box-shadow` (glow/pulse): substituir por `scale + opacity` via UnoCSS — menos custo GPU, mesmo efeito visual.

### 5. createReusableTemplate vs Componentes separados

| Abordagem | Prós | Contras |
|-----------|------|---------|
| `components/*.vue` | Tipagem, reuso entre slides, testável | Quebra fluxo de edição do markdown |
| `createReusableTemplate` | Tudo no mesmo arquivo, edição rápida | Sem tipagem, não reutiliza entre slides |
| **Híbrido** | Componentes para estrutura complexa, templates para variações simples | Dois padrões |

**Recomendação:** componentes `.vue` para `Node`, `ForkPath`, `MessageDot` (reutilizados em 3+ slides). `createReusableTemplate` para variações específicas de um slide.

## Arquitetura Proposta

### Stack final

```
Slidev markdown
     │
     ▼
ScenarioFlow (component)
     │
     ├─ Node        → v-motion + useSpring (entrada)
     ├─ ForkPath    → props auto-geram paths + UnoCSS (estilo)
     └─ MessageDot  → offset-path + useTransition (movimento)

Camadas:
  UnoCSS       → estilo (cores, stroke, fill, animate-pulse)
  v-motion     → entrada e sequências
  offset-path  → dots seguindo curvas
  useSpring    → movimento natural de nodes
  useTransition → interpolação reativa de offset-distance
```

### Componentes planejados

#### `<Node>`
```html
<Node name="NATS" icon="cloud-arrow-up" :x="0" :y="70"
      status="active" color="cyan" sub="fila" />
```
Props: `name`, `icon`, `x`, `y`, `status` (active/offline/error/recover), `color`, `sub`

#### `<ForkPath>`
```html
<ForkPath :from="{x:300, y:70}" :offset="70" :spread="35" color="fuchsia" />
```
Gera automaticamente os dois paths (up/down) com curva Q no ponto `x + offset`.

#### `<MessageDot>`
```html
<MessageDot path="nats-worker" color="cyan" :duration="1500" :loop="true" />
```
Usa `offset-path` internamente. A prop `path` referencia um path registrado no `ScenarioFlow`.

#### `<ReturnPath>`
```html
<ReturnPath type="success" from="eme4-2" to="nats" color="cyan" />
<ReturnPath type="error" from="eme4-1" to="nats" color="pink" />
```
Gera paths de retorno pela parte inferior (success, cy:120) ou superior (error, cy:20).

### Exemplo de slide refatorado

**Antes** (~80 linhas de SVG manual):

```html
<div class="scenario-flow my-4">
  <div class="anim-node-sm top-50% left-0 w-90px h-56px bg-cyan-500/12 ...">
    <span class="i-ph-cloud-arrow-up-fill"/>NATS<span class="anim-sub">fila</span>
  </div>
  <div class="anim-node-sm top-50% left-200px w-95px h-56px bg-fuchsia-500/12 ...">
    <span class="i-ph-gear-six-fill"/>Worker<span class="anim-sub">tradutor</span>
  </div>
  <!-- ... 60+ linhas de SVG, circles, paths, badges ... -->
</div>
```

**Depois** (~15 linhas declarativas):

```html
<ScenarioFlow>
  <Node name="NATS" icon="cloud-arrow-up" :x="0" status="active" color="cyan" sub="fila" />
  <Node name="Worker" icon="gear-six" :x="200" status="active" color="fuchsia" sub="tradutor" />
  <Node name="EME4 1" :x="420" :y="35" status="offline" color="pink" />
  <Node name="EME4 2" :x="420" :y="105" status="active" color="cyan" />
  <ForkPath :from="{x:300, y:70}" :offset="70" :spread="35" color="fuchsia" />
  <MessageDot path="nats-worker" color="cyan" />
  <MessageDot path="fork-down" color="fuchsia" />
</ScenarioFlow>
```

### Impacto estimado

| Métrica | Antes | Depois |
|---------|-------|--------|
| CSS de cenário | 384 linhas | ~100 linhas (microefeitos) |
| SVG manual por slide | ~80 linhas | ~15 linhas (declarativo) |
| @keyframes complexos | 9 | 1-2 (offset-path genéricos) |
| Reutilização entre slides | Nenhuma (copy-paste) | Total (componentes com props) |

## Verificação Técnica

- [x] v-motion funciona dentro de SVG (confirmado com exemplo existente no slides.md)
- [x] `strokeDasharray` animável via v-motion (confirmado)
- [x] `offset-path` suportado em navegadores desktop modernos
- [x] `useTransition` pode interpolar `offset-distance`
- [x] `useSpring` produz movimento mais natural que duração fixa
- [x] `createReusableTemplate` funciona em Slidev
- [x] UnoCSS suporta propriedades SVG (`stroke-*`, `fill-*`)
- [ ] Implementação dos componentes (próxima etapa)
- [ ] Migração dos slides 6a/6b/6c existentes
- [ ] Validação visual após migração

## Decisões Técnicas Registradas

1. **`offset-path` > keyframes manuais** para dots em curvas
2. **`useRafFn` descartado como padrão** — apenas fallback para edge cases
3. **`scale + opacity` > `box-shadow`** para efeitos de glow/pulse
4. **Componentes `.vue` para estrutura reutilizável** entre slides
5. **`createReusableTemplate` para variações locais** dentro de um slide
6. **v-motion para entrada/sequência**, CSS para microefeitos (`animate-pulse`)

---

**Data:** 08/03/2026 21:30
**Status:** Análise concluída — implementação pendente
**Tipo:** Análise técnica / Arquitetura
