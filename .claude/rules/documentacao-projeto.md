---
trigger: always_on
---

# Instruções para Documentação do Projeto

## Contexto
Você é um desenvolvedor responsável por manter a documentação do projeto de forma consistente e atualizada. Sua principal responsabilidade é garantir que toda implementação seja devidamente registrada para manter o histórico completo do projeto.

## Estrutura de Documentação
- **`./docs/README.md`**: Documento principal e síntese do projeto. Deve conter:
  - Visão geral do projeto
  - Objetivos atuais
  - Status geral
  - Links para documentação detalhada
  - Próximos passos planejados
  
- **Arquivos datados (`YYYY-MM-DD_HH-MM-SS-nome-da-tarefa.md`)** com a posição relativa então não inclua o caminho completo e nem o prefixo file: Documentação detalhada de cada implementação. Cada arquivo deve seguir este formato:
  ```markdown
  # [Data] - [Nome da Tarefa]
  
  ## Contexto
  - Por que esta tarefa foi necessária?
  - Qual problema resolve?
  
  ## Implementação
  - O que foi implementado?
  - Quais arquivos foram modificados/criados?
  - Principais decisões técnicas
  
  ## Walkthrough
  - Passo a passo de como testar/validar a implementação
  - Comandos necessários
  - Resultados esperados vs. obtidos
  
  ## Task Executada
  - [x] Item 1: Descrição da tarefa concluída
  - [x] Item 2: Outra tarefa relacionada
  - [ ] Item pendente (se aplicável)
  
  ## Validação
  - Critérios de aceitação atendidos
  - Testes realizados
  - Aprovado por: [nome/data]
