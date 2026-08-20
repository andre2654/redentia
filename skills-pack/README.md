# Redentia Skills Pack

As 4 Agent Skills que ensinam o Claude a extrair o máximo do MCP da Redentia
(assessores/MFOs). Cada pasta tem um `SKILL.md`; a página logada
`/business/skills` serve os zips pra download.

## Editou uma skill? O fluxo é:

1. Edite o `SKILL.md` da pasta.
2. `npm run skills:build` (a partir de `Frontend/`) — linta e regenera os zips
   em `public/downloads/skills/`.
3. Commite a SKILL.md **e os zips juntos** (Vercel serve `public/` estático;
   zip velho no git = download desatualizado no site).

## O que o lint cobra

Frontmatter só com `name` (= nome da pasta, kebab-case) e `description`
(200-1024 chars, com gatilhos "Use quando..." e "NÃO usar pra...").
Corpo entre 150 e 450 linhas. Zero emoji.

O lint NÃO procura termos banidos de compliance — as skills citam esses termos
nas próprias seções de proibição. Compliance se valida no teste de mesa
(rodar a receita da skill contra o MCP real e ler o output).

## Formatos de distribuição

- `<slug>.zip` — SKILL.md na raiz. É o formato que o upload de Skills do
  claude.ai aceita (um zip por skill; o bundle NÃO sobe lá).
- `redentia-skills-pack.zip` — os 4 como `<slug>/SKILL.md`. É o formato de
  `.claude/skills/` do Claude Code: descompacta e pronto.

Fonte de verdade dos contratos das tools: `mcp-service/src/tools.ts`.
Se uma tool mudar de shape, as skills que a citam precisam acompanhar.
