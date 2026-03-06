# Guia de Ícones SVG — POC Middleware Slidev

## Como funciona

O Slidev usa **UnoCSS** com o preset `@unocss/preset-icons`, que renderiza ícones SVG do [Iconify](https://icon-sets.iconify.design/) diretamente via classes CSS. Os ícones são injetados como SVG inline no build — sem fontes externas, sem requests adicionais.

### Sintaxe

```html
<!-- Inline em qualquer elemento -->
<div class="i-ph-lightning-fill text-2xl text-cyan-400" />

<!-- Com tamanho e cor customizados -->
<span class="i-carbon-bot text-3xl text-blue-400" />

<!-- Ícone animado (spinner) -->
<span class="i-svg-spinners-pulse-3 text-xl text-purple-400" />
```

### Padrão de nome

```
i-{coleção}-{nome-do-ícone}
```

Exemplos:
- `i-ph-shield-check-fill` → Phosphor, shield-check, variante fill
- `i-carbon-analytics` → Carbon, analytics
- `i-svg-spinners-pulse-rings-3` → SVG Spinners, pulse-rings-3 (animado)

---

## Coleções Utilizadas

### 1. Phosphor Icons (`ph`) — Coleção principal

- **Site**: https://icon-sets.iconify.design/ph/
- **Pacote**: `@iconify-json/ph`
- **Quantidade**: ~7.500 ícones (6 variantes: thin, light, regular, bold, fill, duotone)
- **Uso**: Ícones de UI, ações, conceitos técnicos
- **Convenção**: Preferir variante `-fill` para ícones pequenos e `-bold` para destaque

### 2. Carbon Icons (`carbon`) — Complementar

- **Site**: https://icon-sets.iconify.design/carbon/
- **Pacote**: `@iconify-json/carbon`
- **Quantidade**: ~2.300 ícones
- **Uso**: Ícones corporativos, infraestrutura, tecnologia (IBM Design Language)

### 3. SVG Spinners (`svg-spinners`) — Ícones animados

- **Site**: https://icon-sets.iconify.design/svg-spinners/
- **Pacote**: `@iconify-json/svg-spinners`
- **Quantidade**: ~44 ícones animados
- **Uso**: Indicadores de processamento, loading, atividade em tempo real
- **Destaque**: Animações CSS puras, sem JavaScript

---

## Mapeamento: Emoji → Ícone SVG

| Contexto | Emoji antigo | Classe UnoCSS | Coleção |
|---|---|---|---|
| Sistema Externo / Conexão | 🔗 | `i-ph-plugs-connected-fill` | Phosphor |
| EME4 / Servidor | 🏭 | `i-carbon-bare-metal-server-02` | Carbon |
| Aviso / Erro | ⚠ | `i-ph-warning-diamond-fill` | Phosphor |
| Load Balancing / Velocidade | ⚡ | `i-ph-lightning-fill` | Phosphor |
| Failover / Proteção | 🛡️ | `i-ph-shield-check-fill` | Phosphor |
| Auth / Segurança | 🔒 | `i-ph-lock-key-fill` | Phosphor |
| Rastreabilidade / Monitoramento | 📊 | `i-ph-chart-line-up-fill` | Phosphor |
| Resiliência / Força | 💪 | `i-ph-heartbeat-fill` | Phosphor |
| Agente IA / Robô | 🤖 | `i-carbon-bot` | Carbon |
| Gateway / Porta de entrada | 🚪 | `i-ph-door-open-fill` | Phosphor |
| Escopo / Alvo | 🎯 | `i-ph-crosshair-fill` | Phosphor |
| Processamento ativo (animado) | — | `i-svg-spinners-pulse-3` | SVG Spinners |
| Rede / Fluxo (animado) | — | `i-svg-spinners-wifi-fade` | SVG Spinners |

---

## Dicas de Uso

### Tamanhos (via Tailwind/UnoCSS)

| Classe | Tamanho |
|---|---|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |
| `text-3xl` | 30px |

### Cores

Os ícones herdam `color` do elemento pai ou podem ser estilizados com classes Tailwind:

```html
<div class="i-ph-lightning-fill text-cyan-400" />
<div class="i-ph-shield-check-fill text-purple-400" />
```

### Alinhamento vertical

Para alinhar ícones com texto, use:

```html
<span class="i-ph-lightning-fill inline-block align-middle" />
```

---

## Referência rápida para buscar ícones

1. Acesse https://icon-sets.iconify.design/
2. Pesquise pelo conceito em inglês (ex: "server", "shield", "lock")
3. Filtre pela coleção: `ph`, `carbon`, ou `svg-spinners`
4. Copie o nome e use com prefixo `i-`: `i-{coleção}-{nome}`

### Prioridade de escolha

1. **Phosphor (`ph`)** — coleção principal, design limpo e consistente
2. **Carbon (`carbon`)** — quando Phosphor não tem equivalente (ex: `bot`, `bare-metal-server`)
3. **SVG Spinners (`svg-spinners`)** — exclusivamente para elementos animados
