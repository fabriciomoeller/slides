---
name: documentation
description: Skill for creating and maintaining project documentation in the documentacao/ folder. Use this skill whenever the user asks to document a task, create a report, register an implementation, or mentions "documentar", "criar doc", or "registrar implementação". Ensures naming conventions, content structure, and README updates are followed.
---

# Documentation Skill

Handles documentation tasks for the POC Middleware — EME4 project.

## Core Rules

### File Location
All dated documentation files go in the `documentacao/` folder (relative to project root).

### Naming Convention
Format: `YYYY-MM-DD_HH-MM-SS-slug-name.md` (underscore separates date from time).

**Example:** `2026-03-08_16-44-42-slides-cenarios-lb-retry-implementacao.md`

### Content Structure
Every documentation file must follow this template:

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

### README Update
Whenever a new documentation file is created, update `docs/README.md`:
1. Add a new row to the "Histórico de Implementações Detalhadas" table:
   `| DD/MM/YYYY HH:MM:SS | Título | [Ver Detalhes](documentacao/filename.md) |`
2. Update the "Atualizado em" timestamp at the bottom.

### Visual Assets
If visual proof is needed, save images in `documentacao/assets/[feature-name]/` and reference them with relative paths in the markdown.

## Workflow

1. Identify the changes to be documented.
2. Capture current date and time in `YYYY-MM-DD_HH-MM-SS` format.
3. Create the markdown file in `documentacao/` with the correct naming.
4. Fill in all sections: Contexto, Implementação, Walkthrough, Task Executada, Validação.
5. Update `docs/README.md` with the new record.
6. Inform the user about the created documentation.

## Language Rules
- Content and documentation: Portuguese (Brazilian).
- Code, file names, variables: English.
