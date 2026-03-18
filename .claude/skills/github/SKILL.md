---
name: github
description: Skill for standardizing the commit process in the POC Middleware project. Use this skill whenever the user asks to commit, make a commit, save changes, or mentions "git commit". Commits follow a strict convention where the message is extracted from the documentation title (H1) created for the task.
---

# GitHub Skill

Standardizes the commit workflow for the POC Middleware — EME4 project.

## Workflow

1. **Approval**: Confirm the task has been implemented and approved by the user.
2. **Documentation**: A documentation file must exist in `documentacao/` following the `documentation` skill — the commit message comes from it.
3. **Identify Title**: Open the documentation file and extract the first `#` header (H1).
4. **Stage Changes**: Stage only the relevant files by name — avoid `git add .` or `git add -A` to prevent accidentally including sensitive files.
5. **Commit**: Use the H1 title as the commit message, in Portuguese. Use HEREDOC format:
   ```bash
   git commit -m "$(cat <<'EOF'
   Título extraído do documento

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```

## Rules

- Never commit without a corresponding documentation file in `documentacao/`.
- The commit message must exactly match the H1 title from the documentation file.
- Commit messages are always in Portuguese (Brazilian).
- Never use `git add .` or `git add -A` — stage files individually.
- Never commit automatically — only when the user explicitly requests it.
- Never skip hooks (`--no-verify`) or bypass signing unless the user explicitly asks.
