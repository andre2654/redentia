# Redentia Skills Pack

As 6 Agent Skills que ensinam o Claude a extrair o máximo do MCP da Redentia
(assessores/MFOs). Cada pasta tem um `SKILL.md`; a página logada
`/business/skills` serve os zips pra download.

| Skill | Faz | Chave e escopo |
|---|---|---|
| `redentia-onboarding` | guia de bordo: catálogo, teste de 3 chamadas, tradução de erros | qualquer chave |
| `redentia-por-que-moveu` | explica o movimento de um ativo e entrega texto pro cliente | qualquer chave |
| `redentia-carteira` | relatório de mesa da carteira colada na conversa | qualquer chave |
| `redentia-comparar-ativos` | 2 a 4 ativos lado a lado (custo, sobreposição, correlação nos ETFs) | qualquer chave |
| `redentia-cenarios` | carteira no motor de projeções: faixa p10-p90, choque por ativo, rótulo biblioteca × montado na hora | escopo `cenarios` (desligado por padrão na pessoal; incluído no plano de escritório) |
| `redentia-clientes` | convite com consentimento, status, carteira e relatório do cliente, cenário na carteira dele | só chave de escritório com `clientes` (conta com `clients_mode` diferente de `off`; hoje só demo) |

## Editou uma skill? O fluxo é:

1. Edite o `SKILL.md` da pasta (ou o partial em `_partials/`).
2. `npm run skills:build` (a partir de `Frontend/`) — linta e regenera os zips
   em `public/downloads/skills/`.
3. Commite a SKILL.md **e os zips juntos** (Vercel serve `public/` estático;
   zip velho no git = download desatualizado no site).
4. Rode os testes de mesa da skill em `TESTES.md`.

## O que o lint cobra

Frontmatter só com `name` (= nome da pasta, kebab-case) e `description`
(200-1024 chars, com gatilhos "Use quando..." e "NÃO usar pra...").
Corpo entre 100 e 450 linhas. Zero emoji.

O lint NÃO procura termos banidos de compliance — as skills citam esses termos
nas próprias seções de proibição. Compliance se valida no teste de mesa
(rodar a receita da skill contra o MCP real e ler o output).

## Partials (fonte única do que muda com o tempo)

A linha `<!-- @partial:nome -->` vira o conteúdo de `_partials/nome.md` no build.

- `limites-mcp` — limites gerais por chave (por minuto e por dia).
- `limites-linha-onboarding` — a mesma informação como linha da tabela do onboarding.
- `limites-simulacao` — sub-limite das duas tools de simulação
  (`simulate_scenario` e `simulate_client_scenario`).

Mudou um limite no `mcp-service`? Edite o partial e rode o build — nunca o número
dentro de uma SKILL.md.

## Formatos de distribuição

- `<slug>.zip` — SKILL.md na raiz (+ `scripts/` quando a skill tem). É o formato
  que o upload de Skills do claude.ai aceita (um zip por skill; o bundle NÃO
  sobe lá).
- `redentia-skills-pack.zip` — zip de zips: `LEIA-ME.txt` + um `<slug>.zip` por
  skill. No Claude Code, cada zip é descompactado em `.claude/skills/<slug>/`;
  o LEIA-ME (texto em `build.mjs`) repete o passo a passo e diz que chave cada
  skill pede.

Fonte de verdade dos contratos das tools: `mcp-service/src/tools.ts`.
Se uma tool mudar de shape, as skills que a citam precisam acompanhar.
