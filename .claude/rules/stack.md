---
trigger: always_on
---

## backend 
* Use DDD (Domain-Driven Design)
* Use go com GORM para banco de dados (e Bun para queries complexas/agnósticas)
* você usará o pacote embed do Go para incluir os arquivos gerados pelo build do Vue
* **Serviços Windows**: 
  * Use `golang.org/x/sys/windows/svc` para suporte nativo.
  * Implemente flags `--install` e `--remove` para gestão via CLI.
  * Sempre resolva o `Working Directory` para o diretório do executável para garantir carregamento correto de arquivos relativos.
* **Autenticação e Multi-Dialeto**:
  * Use queries explícitas por dialeto para operações críticas (ex: login em ERP legados).
  * No Oracle, use `ROWNUM <= 1` para limites e `db.NewRaw()` para tradução de placeholders (`?` -> `:1`).
  * Para senhas legadas (obfuscadas via Latin-1/ANSI), busque os bytes brutos do banco e faça a comparação em Go (`bytes.Equal`).
  * **Normalização Oracle**: Implemente o achatamento de sequências UTF-8 (prefixos `0xC2/0xC3`) para Latin-1 single-byte caso o banco retorne encoding multi-byte.
  * Use aliases e tags Bun em MAIÚSCULAS para garantir compatibilidade com bancos case-insensitive como Oracle.

## Frontend
* Para o FrontEnd use sempre vuejs e para os estilos TailWindcss

## Testes
* Para testes use o backend go na porta 8080. 
* Para o frontend na porta 5173 executando npm run dev. Isto permitirá ajustar o frontEnd e o vite faz o build a quente facilitando os testes.
