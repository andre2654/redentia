# A tela de tese, repensada (11/11/2026)

O dono, olhando a `/tese/[slug]` vestida de Aportou: "as telas de tese precisam ser repensadas". Este é o desenho novo. Vale junto com `contrato.md` e `decisoes.md`.

## O que está errado hoje

A página tem ~14.000px e o grosso dela é um muro de texto. O motivo é o DADO, que a tela despeja como chega:

- Cada ativo da tese (`companies[]`) traz `rationale` (1 a 3 mil caracteres), `catalyst` (4 a 9 mil: é um registro que só cresce, com ~20 "Revalidação de <data>: …" coladas uma na outra) e `status` (uma frase de ~190 caracteres que começa por "Núcleo Revalidação de 10 de novembro de 2026: …"). A tela põe o `status` inteiro dentro de um selo (que estoura o cartão) e o `rationale` + `catalyst` inteiros no corpo do cartão, em coluna estreita.
- O diário (`studies[]`, 40 itens) tem títulos de uma frase inteira (~200 caracteres).
- O relatório (`report`) é uma leitura de 18 minutos no meio da página.
- Quem a Aportou atende (gente começando a investir) abre a tela e não acha a resposta de nenhuma pergunta simples: qual é a ideia, está dando certo, o que tem dentro, o que mudou, o que pode dar errado.

Não é para cortar conteúdo (a página é indexada e o texto é o valor dela): é para ORGANIZAR. Tudo continua no HTML do servidor; o que é longo fica recolhido em `<details>`.

## A ordem nova (uma pergunta por seção)

Fundos alternando página / faixa quente / carvão / sálvia, eyebrow com o corte em cada seção, coluna de 1240.

1. **Topo: "Qual é a ideia e como ela vai?"** (creme, duas colunas no computador, como a tela de ativo)
   - Esquerda: eyebrow `TESE · <tema>` (do `sector`), H1 (o `title`, igual hoje), a `description` como lead, uma linha de selos de raio 8 (`Convicção 97 de 100` azul; `+22% desde set/2025` verde ou vermelho pelo sinal; `8 ativos` carvão) e as ações: `NuBotaoSeta` azul "Acompanhar esta tese" (o comportamento de seguir de hoje, com o estado "Acompanhando") e a pílula carvão "Perguntar à IA" com o corte.
   - Direita: `NuFaixaMarca` "A TESE DESDE <mês/ano>" com o gráfico de desempenho que já existe (tese contra Ibovespa), o número grande em verde claro, o do Ibovespa ao lado. Mesma série e mesmos números de hoje.
   - A imagem de capa (`image`) sai do topo (fica nos cartões da `/teses`).

2. **"A ideia em 1 minuto"** (faixa quente)
   - O `statementHtml` em letra grande (clamp 26–38px, 700; o trecho `{mark}…{/mark}` em cobalto, como a FraseDestaque) e o `statementSubHtml` como lead.
   - Os `verdicts` em três cartões lado a lado: selo pelo `kind` (`favor` verde "A favor", `sinal` azul "Sinal", `risco` âmbar "Risco"), título em 800, corpo. Sem `verdicts`, a seção mostra só a frase.

3. **"O que está na tese"** (página)
   - H2 com a contagem ("8 ativos, cada um com um papel.").
   - Uma LISTA, não uma grade de cartões-muro. Cada ativo é uma linha (`<details>`, cartão creme raio 22):
     - Fechada: etiqueta carvão do ticker + nome; o papel (`role`) em cinza; à direita o selo "Revisto em 10/11" (a data tirada do `status`); embaixo a frase do `status` SEM o prefixo, em até 2 linhas. O "+" no círculo carvão que gira.
     - Aberta: dois blocos.
       - **Por que está na tese**: o `rationale`. Os 2 primeiros períodos à vista; o resto em "Ler tudo".
       - **O que tem de acontecer**: o `catalyst` repartido. O trecho antes da primeira "Revalidação de …" é "O gatilho". As revalidações viram uma linha do tempo, da mais nova para a mais velha: data (dd/mm/aaaa) + texto; os marcadores em caixa alta dentro do texto (`CONFIRMADA`, `PENDENTE`, `FILTRO MACRO CONTRA`, `A FAVOR`, `SEM FATO NOVO`…) viram selos pequenos (verde para CONFIRMAD*/A FAVOR/CUMPRID*, âmbar para PENDENTE/SOB PRESSÃO/SEM FATO NOVO, vermelho para CONTRA/INVERTIDO, neutro para o resto). À vista as 3 mais novas; "Ver as N anteriores" abre o resto.
       - Rodapé da linha: "Ver <TICKER>" (link para `/asset/<TICKER>`, em maiúsculas) e "Perguntar à IA sobre <TICKER>".
   - Visitante sem conta: vale a MESMA regra de hoje sobre o que ele vê e o que fica trancado (não mude a regra). Só muda a forma: linha trancada mostra ticker, nome e papel com um cadeado, sem texto borrado; o convite continua sendo o `NuFaixaMarca` "TESE COMPLETA" com "Criar conta grátis".

4. **"O que mudou"** (carvão): o diário (`studies`)
   - Linha do tempo, do mais novo ao mais velho. Cada estudo: data, selo da `tag`, o `title` em até 3 linhas (18px, 700), "N min de leitura". À vista os 5 mais novos; "Ver os N anteriores".
   - Abrir um estudo usa o leitor que já existe (o modal do `TeseDiary`), vestido: resumo, as decisões (`label` + `detail`), a tabela dos ativos (ticker, avaliação, decisão em selo, o porquê) e as fontes em chips de contorno.

5. **"O que pode dar errado"** (sálvia): `report.risks` em lista numerada, um risco por linha, com o `monitoring.body` embaixo ("o que a Aportou acompanha") e o botão de acompanhar. Sem `report`, a seção usa só o veredito de `kind: 'risco'` + o monitoring; sem nenhum dos dois, não aparece.

6. **"O relatório completo"** (página): o `TeseReport` como leitura recolhida. Cabeçalho com "18 min de leitura · publicado em 01/08/2026 · versão 1". A tese em 5 pontos (`report.thesis`), a oportunidade, as partes (`report.parts`: cada uma um `<details>` com o `heading`), a conta do valuation, os marcos da conclusão e as fontes. No computador, o sumário à esquerda (peça `NuTocSidebar`).

7. **Fecho**: o painel azul de acompanhar/criar conta (um só, não repetir o convite três vezes) e a linha "Tese é estudo, não é recomendação de compra ou venda."

A régua de seções abaixo do topo (`useSectionRail`): A ideia · Ativos · O que mudou · Riscos · Relatório.

## Regras

- **Nada de dado novo nem de regra nova.** Só apresentação. As contas (desempenho, convicção), o seguir, o gate do visitante e o SEO (title, description, H1, canonical, JSON-LD, os 301) ficam como estão.
- **Repartir texto é função pura, com teste**: `app/utils/teseTexto.ts` com `partesDoStatus(status)` → `{ selo?: string, data?: string, texto: string }` e `partesDoCatalyst(catalyst)` → `{ gatilho: string, revisoes: { data: string | null, texto: string }[] }` (aceita "Revalidação de" e "Revalidacao de", com e sem acento; sem marcador, devolve tudo como gatilho e nenhuma revisão; nunca perde texto: a soma das partes é o texto original, a menos dos prefixos de data) e `marcadoresDoTexto(texto)` para os selos em caixa alta. Testes em `tests/tese-texto.test.ts` com textos REAIS do arquivo de exemplo.
- **Todo o texto continua no HTML do servidor** (`<details>` fechado serve). Confira com um diff do texto visível antes/depois: nada some.
- **Marca nos textos que vêm da API**: o `monitoring.eyebrow` chega como "A Redentia vigia por você". Crie `app/utils/marcaNoTexto.ts` (`marcaNoTexto(texto)`: troca a palavra inteira "Redentia" por "Aportou"; não toca em "redentia.com.br" nem em e-mail) com teste, e aplique no mapeamento da tese (`useTese`) para os campos de texto que vão à tela. É só exibição; o dado não muda.
- **Altura**: com tudo recolhido a página deve ficar perto de 5 a 6 mil px no computador (hoje são 14 mil).
- **Celular (390)**: uma coluna, alvos de 44px, sem rolagem lateral.

## Dado para ver a tela

A API local de teste devolve a tese quase vazia (sem `verdicts`, `studies`, `report`, `statementHtml`). Há uma cópia de uma tese de produção em `app/dev/tese-exemplo.local.json` (fora do git, `app/dev/*.local.json`). Para ver a tela com dado cheio, o `useTese` aceita, SÓ em `import.meta.dev`, o parâmetro `?tese-exemplo=1`, que lê esse arquivo no lugar da API (mesmo padrão do `?folha-estado=` e do `?entrar-estado=`; some do bundle de produção).

## A /teses (a grade)

Fica como está (foi refeita em 02/11 e vestida em 11/11). Só conferir que o cartão conversa com a tela nova: os mesmos selos (convicção, retorno, nº de ativos) e a etiqueta carvão dos tickers.
