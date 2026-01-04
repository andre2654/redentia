## ADR 0001 — Tema dark-only

### Status
Aceito

### Contexto
O projeto tinha múltiplos mecanismos de tema (módulo `@nuxtjs/color-mode`, plugin de “forçar dark”, UI de seleção de tema). Isso gerava inconsistência, complexidade e risco de “theme flash”.

### Decisão
Adotar **dark-only** no produto web:
- O HTML inicia com `class="dark"` (SSR).
- Não existe alternância claro/escuro no app.

### Consequências
- UI mais consistente e menos código de tema.
- Menos bugs de preferências/sistema.
- Se houver necessidade futura de light-mode, precisaremos reintroduzir um mecanismo único e tokens compatíveis.



