# 12/03/2026 - Logo Datainfo para Light Mode no Slide de Capa

## Contexto
- O slide de capa exibia apenas o logo `datainfo.png` (texto branco), que funciona bem no tema escuro mas fica invisível/ilegível no tema claro
- Com o suporte a Light Mode implementado em 11/03/2026, era necessário alternar o logo conforme o tema ativo

## Implementação
- **Arquivo modificado**: `poc-middleware-slidev/slides.md`
- Adicionada uma segunda tag `<img>` com o logo `logo_datainfo.png` (versão colorida para fundo claro)
- Alternância via classes UnoCSS:
  - `datainfo.png` → `hidden dark:block` (visível só no tema escuro)
  - `logo_datainfo.png` → `block dark:hidden` (visível só no tema claro)

## Walkthrough
1. Executar `pnpm dev` em `poc-middleware-slidev/`
2. Acessar `http://localhost:3030`
3. No slide de capa, o logo branco aparece no tema escuro
4. Alternar para Light Mode (ícone de sol no painel do Slidev)
5. O logo colorido deve aparecer automaticamente

## Task Executada
- [x] Adicionar `logo_datainfo.png` como alternativa para tema claro
- [x] Usar classes `dark:block` / `dark:hidden` para alternância automática

## Validação
- Logo branco visível no tema escuro
- Logo colorido visível no tema claro
- Alternância suave sem flicker ao trocar de tema
