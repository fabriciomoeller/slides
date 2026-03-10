# Correção das Linhas Ack no Slide NATS Pub/Sub

## Contexto
- O slide NATS Pub/Sub (slide 13) tinha linhas de retorno (Ack) desalinhadas com o nó NATS
- As linhas de Ack dos subscribers terminavam fora do nó NATS (acima e abaixo)
- A linha de retorno do Worker 2 sobrepunha a linha de ida (ambas em y≈90)
- O badge "fan-out" estava posicionado sobre a área do Worker 2

## Implementação

### Mapeamento de coordenadas (viewBox 580×180, container 180px)

| Nó | Posição Y (centro) | Range Y |
|----|----|----|
| NATS | 90 | 62–118 |
| Worker 1 | 23 | 2–44 |
| Worker 2 | 90 | 69–111 |
| Monitor | 157 | 136–178 |

### Correções aplicadas em `slides/07-tecnologias.md`

**Worker 1 Ack** — y final: 30 → **68** (entra no topo do NATS)
```
M420,10 L270,10 Q255,10 255,68
```

**Worker 2 Ack** — roteado por baixo da forward line (y=90)
```
Antes: M420,105 L310,105 Q300,105 300,95  (sobrepunha a ida)
Depois: M420,112 L310,112 Q295,112 295,98  (passa por y=112, evita sobreposição)
```

**Monitor Ack** — y final: 150 → **112** (entra na base do NATS)
```
M420,170 L270,170 Q255,170 255,112
```

**Badge "fan-out"** — reposicionado de `top-100px` para `bottom-20px`

**Badge "Entregue"** — reposicionado de `left-0 bottom-0` para `left-140px bottom-10px` (próximo ao NATS)

### Arquivo modificado
- `poc-middleware-slidev/slides/07-tecnologias.md` — paths SVG e posições de badges

## Walkthrough
- `cd poc-middleware-slidev && npx slidev`
- Navegar até slide 13 (NATS Pub/Sub)
- Click 1: linhas fan-out devem sair do NATS e chegar aos 3 subscribers
- Click 2: linhas Ack (tracejadas) devem retornar dos subscribers e entrar no nó NATS
- Verificar que a linha de retorno do Worker 2 passa ABAIXO da linha de ida

## Task Executada
- [x] Corrigir path Ack Worker 1 (y final dentro do NATS)
- [x] Corrigir path Ack Worker 2 (roteado abaixo da forward line)
- [x] Corrigir path Ack Monitor (y final dentro do NATS)
- [x] Reposicionar badge "fan-out"
- [x] Reposicionar badge "Entregue"

## Validação
- Build `npx slidev build` passa sem erros
- Linhas de retorno conectam corretamente ao nó NATS
- Sem sobreposição entre linhas de ida e retorno
- Aprovado visualmente pelo usuário
