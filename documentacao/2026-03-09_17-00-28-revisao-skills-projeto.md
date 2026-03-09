# Revisão e Correção das Skills do Projeto

## Contexto
- As 4 skills do projeto (github, documentation, unocss, slidev) apresentavam inconsistências com as regras definidas em `.claude/rules/documentacao-projeto.md`
- Nomes de projeto incorretos, caminhos de pasta divergentes, paleta colorblind ausente na skill unocss, e descriptions fracas para acionamento automático

## Implementação

### Arquivos modificados
- `.claude/skills/github/SKILL.md` — Reescrita completa
- `.claude/skills/documentation/SKILL.md` — Reescrita completa
- `.claude/skills/unocss/SKILL.md` — Reescrita completa
- `.claude/skills/slidev/SKILL.md` — Ajuste menor (dev commands)

### Correções por skill

**github**: Nome do projeto corrigido para "POC Middleware — EME4", removido `git add .` (staging individual), adicionado formato HEREDOC com Co-Authored-By, referência corrigida para `documentacao/`, description mais assertiva.

**documentation**: Nome do projeto corrigido, pasta corrigida de `/docs` para `documentacao/`, nomenclatura alinhada com underscore (`YYYY-MM-DD_HH-MM-SS`), estrutura de conteúdo alinhada (Contexto/Implementação/Walkthrough/Task/Validação), description mais descritiva.

**unocss**: Adicionada paleta colorblind completa, listadas cores proibidas (green/orange/red), regra de opacidade (0.08–0.12), coleções de ícones (ph/carbon/svg-spinners), config corrigido para `uno.config.ts`, description contextualizada para Slidev.

**slidev**: Dev commands atualizados de `npm run dev` para `npx slidev`.

## Walkthrough
- Verificar cada skill com `cat .claude/skills/*/SKILL.md`
- Confirmar que descriptions aparecem corretamente no sistema de skills
- Testar acionamento com prompts como "commitar", "documentar tarefa", "mudar cor do slide"

## Task Executada
- [x] Revisão cruzada skills vs regras do projeto
- [x] Correção da skill github
- [x] Correção da skill documentation
- [x] Correção da skill unocss
- [x] Ajuste da skill slidev

## Validação
- Skills consistentes com `.claude/rules/documentacao-projeto.md`
- Paleta colorblind presente na skill unocss
- Nomenclatura e estrutura de documentação alinhadas
