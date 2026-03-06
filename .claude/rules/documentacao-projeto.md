---
trigger: always_on
---

# Instruções para Documentação do Projeto

## Escopo do Projeto
Este é o projeto **POC Middleware — EME4** da Datainfo. O escopo inclui:
- **Apresentação Slidev** (`poc-middleware-slidev/`) — slides para apresentar a POC à diretoria
- **Documentação técnica** (`documentacao/`) — registros detalhados de cada implementação
- **Análises comparativas** — documentos `.md` na raiz do `docs/` (ex: comparativos, análises Kong/NATS)

### Stack do Projeto
- **Middleware**: Kong/APISIX (API Gateway) + NATS JetStream (mensageria)
- **Backend**: Go com DDD, GORM, Bun
- **Frontend**: Vue.js + TailwindCSS
- **Apresentação**: Slidev + UnoCSS + Iconify (ph, carbon, svg-spinners)
- **Infraestrutura**: Docker/containers, Load Balancing, Failover

## Restrições — O que a IA NÃO deve fazer
- **NÃO criar documentação sem ser solicitado** — só documentar quando o usuário pedir explicitamente
- **NÃO criar README.md** em diretórios onde não existe — a menos que solicitado
- **NÃO alterar documentos existentes** (análises, comparativos) sem instrução direta
- **NÃO commitar automaticamente** — commits só quando o usuário solicitar (ver skill `github`)
- **NÃO sair do escopo do projeto** — toda sugestão, código e documentação devem ser relevantes para o contexto Middleware/EME4/Slidev
- **NÃO inventar dados técnicos** — métricas (ex: 25M msg/s NATS, 18K req/s Kong) devem vir de fontes confiáveis ou do próprio projeto

## Estrutura de Documentação

### Documento principal
- **`docs/README.md`**: Síntese do projeto com visão geral, status, links para documentação detalhada e próximos passos
- Atualizar a tabela "Histórico de Implementações Detalhadas" ao criar novos registros
- Atualizar timestamp "Atualizado em" no final

### Documentação datada
- **Localização**: pasta `documentacao/` (caminhos relativos, sem prefixo `file:`)
- **Nomenclatura**: `YYYY-MM-DD_HH-MM-SS-nome-da-tarefa.md`
- **Formato obrigatório**:

```markdown
# [Data] - [Nome da Tarefa]

## Contexto
- Por que esta tarefa foi necessária?
- Qual problema resolve no contexto do Middleware/EME4?

## Implementação
- O que foi implementado?
- Quais arquivos foram modificados/criados? (caminhos relativos)
- Principais decisões técnicas

## Walkthrough
- Passo a passo de como testar/validar
- Comandos necessários (ex: `pnpm dev`, `go run .`)
- Resultados esperados vs. obtidos

## Task Executada
- [x] Item concluído
- [ ] Item pendente (se aplicável)

## Validação
- Critérios de aceitação atendidos
- Testes realizados
```

## Regras de Idioma
- **Conteúdo e documentação**: Português (Brasil)
- **Código, nomes de arquivo, variáveis**: Inglês
- **Commits**: Português — título extraído do documento (ver skill `github`)

## Integração com Skills
- Ao documentar, verificar se a skill `documentation` tem regras aplicáveis
- Ao commitar, seguir a skill `github` (commit message = título H1 do documento)
- Ao alterar slides, seguir a skill `slidev` (paleta colorblind, regras SVG, etc.)
