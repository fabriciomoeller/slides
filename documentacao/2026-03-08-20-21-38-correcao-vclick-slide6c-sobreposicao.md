# 08/03/2026 — Correção de v-click no Slide 6c: Sobreposição de Elementos

## Contexto

O slide 6c (Cenário 3: Ambos Fora, A Fila Garante) apresentava problemas visuais onde elementos de estados diferentes ficavam sobrepostos ao avançar os clicks. Badges, caixas de nó e animações SVG de etapas anteriores permaneciam visíveis quando novos estados apareciam, causando poluição visual.

## Problemas Identificados

1. **EME4 2 offline sobreposto ao EME4 2 recuperado** — o box pink "offline" não desaparecia quando o box cyan "voltou" aparecia no click 2
2. **"Nak → fila persiste" sobreposto com "Ack ✓"** — o segmento do click 1 permanecia visível no click 3
3. **Badge "sem servidor" visível** mesmo após EME4 2 voltar ao ar
4. **"persistida em disco" e "5s → 30s → 2min..."** continuavam visíveis no estado final de sucesso
5. **Ponto cyan flutuante** — animação `anim-sc-retry-nats` do segmento 1 permanecia visível

## Implementação

### Arquivo modificado
- `poc-middleware-slidev/slides.md` — slide 6c (Cenário 3)

### Alterações

1. **`v-click.hide="2"` no box EME4 2 offline** — desaparece quando "EME4 2 voltou" aparece no click 2
2. **`v-click.hide="2"` no badge "sem servidor"** — desaparece junto quando EME4 2 volta
3. **`v-click="[1, 3]"` no segmento de Nak/retry** (substituiu `v-click="1"`) — visível apenas nos clicks 1 e 2, desaparece no click 3 quando o fluxo de sucesso aparece

### Técnica utilizada: Click Ranges do Slidev

Conforme documentação oficial do Slidev (`sli.dev/guide/animations`), click ranges permitem controlar quando um elemento aparece E desaparece:

```html
<!-- v-click="[enter, leave]" -->
<div v-click="[1, 3]">Visível nos clicks 1 e 2, some no click 3</div>
```

Isso é mais limpo que usar `v-click="1"` + `v-click.hide="3"` separados, pois mantém a lógica em um único atributo.

## Walkthrough

### Fluxo corrigido dos clicks

| Click | Aparece | Desaparece |
|-------|---------|------------|
| Inicial | NATS, Worker, EME4 1 offline, EME4 2 offline, linhas dim, "sem servidor" | — |
| 1 | Nak return path, "fila persiste", "persistida em disco", "5s → 30s → 2min..." | — |
| 2 | "EME4 2 voltou" (recovery node) | EME4 2 offline, "sem servidor" |
| 3 | Fluxo sucesso (dots, linhas, "Sucesso", "Recuperação automática", "Ack ✓") | Segmento Nak (path, dot, badges) |
| 4 | Box final "LB + Retry = Zero mensagens perdidas" | — |

### Teste

```bash
cd poc-middleware-slidev
pnpm dev
```

Navegar até o slide 6c e verificar que cada click mostra/esconde os elementos corretos sem sobreposição.

## Task Executada

- [x] Adicionado `v-click.hide="2"` no box EME4 2 offline
- [x] Adicionado `v-click.hide="2"` no badge "sem servidor"
- [x] Substituído `v-click="1"` por `v-click="[1, 3]"` no segmento Nak/retry

## Validação

- Elementos temporários (Nak, persistência) desaparecem antes do fluxo de sucesso
- EME4 2 transiciona corretamente de offline (pink) para recuperado (cyan)
- Badge "sem servidor" desaparece quando há servidor disponível
- Nenhuma animação órfã (ponto flutuante) permanece visível

---

**Data:** 08/03/2026 20:21
**Status:** Concluído
**Tipo:** Correção visual / Animações Slidev
