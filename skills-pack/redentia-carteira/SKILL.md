---
name: redentia-carteira
description: Análise completa de uma carteira que o usuário informa na conversa — o assessor cola as posições do cliente ("TICKER — valor", quantidade ou %) e recebe um relatório de mesa com valor, movimento do dia, concentração, notícias que tocam as posições, cruzamento com as teses da Redentia e contexto de mercado, montado com get_quote por posição, list_news, list_theses e get_etf_composition. Funciona com qualquer chave (só usa escopos de mercado, teses e notícias); a carteira nunca sai da conversa. Use quando o usuário pedir "analisa essa carteira", "cliente tem PETR4, HGLG11 e BOVA11", "raio-x da carteira do cliente", "alguma notícia toca essas posições?". NÃO é pra carteira da conta Redentia do próprio usuário (isso é a tool get_portfolio, direto), nem pra sugerir alocação, rebalanceamento ou peso, nem pra explicar um único ativo (redentia-por-que-moveu) ou comparar ativos (redentia-comparar-ativos).
---

# Análise da carteira

Você monta um relatório de mesa da carteira que o usuário INFORMA na conversa — tipicamente a carteira de um cliente do escritório: o que ela vale, o que mexeu hoje, o que o noticiário e as teses da Redentia tocam nas posições, e o contexto de mercado. Tudo descritivo, com as limitações do dado declaradas. A opinião sobre a carteira é do escritório, nunca sua.

A carteira vem da conversa e fica na conversa: a Redentia não vê essas posições e nada é salvo em lugar nenhum. Se o pedido for a carteira da CONTA Redentia do próprio usuário ("minha carteira na Redentia"), isso é a ferramenta `get_portfolio` (chave pessoal com escopo de carteira) — chame direto, sem esta skill.

## Fonte de verdade: o MCP da Redentia

Toda resposta de ferramenta vem num envelope JSON:

```json
{ "data": { ... }, "asOf": "...", "deepLink": "https://redentia.com.br/...", "source": "Redentia" }
```

- `deepLink` é pro ASSESSOR conferir na Redentia — cite no rodapé do relatório, nunca em texto pra cliente.
- Erros chegam como TEXTO em português. Trate por conteúdo:
  - "Muitas chamadas por minuto": espere cerca de 60 segundos e **continue do passo em que parou** — não recomece.
  - "Limite diário": pare e diga o que ainda faltava.

### Orçamento de chamadas desta skill

| Chave | Limite | Custo por rodada |
|---|---|---|
| Pessoal (`rdt_mcp_`) | 10/min · 50/dia | 1 cotação por posição + 3 a 5 fixas — 6 posições ≈ 10 chamadas (o minuto inteiro) |
| Escritório (`rdt_biz_`) | 120/min · 5.000/dia (a conta divide) | sem aperto prático |

Na chave pessoal, **cap de 6 cotações por minuto**: com mais de 6 posições, rode em duas levas e avise ("vou em duas levas pra respeitar o limite da chave"). Acima de 12 posições, peça um recorte pros maiores valores — o minuto duplo estoura e o relatório perde leitura.

## Passo 1 — Colete e normalize as posições

Aceite o que o assessor colar, com tolerância:

- `PETR4 — R$ 50.000` (valor aplicado — o formato preferido)
- `HGLG11 300 cotas` (quantidade: o valor sai de quantidade × cotação)
- `BOVA11 25%` (peso: o relatório sai em pesos relativos, sem R$)
- lista solta de tickers (sem valores: o relatório cobre movimento, notícias e teses, e diz que concentração exige valores)

Parseie vírgula ou ponto, "50k", "1,2mi". Se vier preço médio ou data de compra, use pra calcular resultado — **senão, não existe resultado acumulado: não invente**. Tesouro e renda fixa não têm cotação no MCP: a linha entra no relatório como "sem cotação na Redentia" e fica fora da variação do dia, com o valor informado somando no total.

Se nada foi informado ainda, UMA pergunta compacta:

> Me manda as posições, uma por linha, no formato "TICKER — valor aplicado" (quantidade ou % também servem). Exemplo: PETR4 — R$ 50.000

## Passo 2 — Receita de coleta

| # | Ferramenta | Quantas | Pra quê |
|---|---|---|---|
| 1 | `get_quote{ticker}` | 1 por posição | preço, `change_percent`, `as_of`, `delisted` |
| 2 | `get_market_snapshot{}` | 1 | IBOV, IFIX, dólar, Selic meta — a moldura do dia |
| 3 | `list_news{limit: 20}` | 1 | feed geral; filtre: itens cujo `tickers[]` intersecta as posições. Pra sondar UMA posição específica, `list_news{ticker}` filtra no servidor |
| 4 | `list_theses{}` | 1 | cruzamento: posições que aparecem em `theses[].tickers[]` |
| 5 | `get_thesis{slug}` | 0-2 | só pros cruzamentos mais relevantes (payload enorme); use `conviction`, `companies[].status` e `catalyst` do ticker |
| 6 | `get_etf_composition{ticker}` | 0-2 | só pra ETFs na carteira e SÓ com confirmação: "quer o raio-x dos ETFs (o que tem dentro, custo, correlações)? custa 1 chamada pesada por ETF" |

**Cheque estrutural na web (obrigatório quando houver sinal).** O MCP não
carrega situação societária — recuperação judicial ou extrajudicial,
grupamento, falência. Se qualquer posição tiver preço abaixo de R$ 1,00,
variação do dia de 8% ou mais sem notícia na base, ou `delisted`/
`delisted_since` preenchido: sonde primeiro `list_news{ticker}` (filtro no
servidor) e depois busque na web `{TICKER} {empresa} recuperação judicial OR
grupamento OR fato relevante {ano}` (confira a data da fonte), trazendo o
achado pra linha da posição no relatório. Uma posição em recuperação
descrita como "andou com o mercado" é o pior erro deste relatório. Sem acesso
à busca, diga isso e marque a posição pro assessor confirmar.

## Passo 3 — Calcule e monte o relatório neste template

A aritmética é sua, sobre o que foi informado: valor total = soma dos valores;
efeito do dia por posição = valor × `change_percent`/100; dia da carteira =
soma dos efeitos ÷ total (posições sem cotação ficam fora do numerador E do
denominador da variação). Pesos = valor ÷ total.

```markdown
## Carteira informada — {data de hoje} (cotações de {as_of})

| | |
|---|---|
| Valor informado | R$ {total} |
| Dia | R$ {efeito total} ({pct ponderado}%) |
| Posições | {N} informadas |

### Posições
| Ativo | Valor | Peso | Dia | Efeito no dia |
|---|---|---|---|---|
| {TICKER} {nome limpo} | R$ {valor} | {peso}% | {change_percent}% | R$ {efeito} |

### Concentração
{maior}% na maior posição e {top3}% nas três maiores — sobre o que foi
informado.

### O dia da carteira
{2 a 4 frases: o que puxou pra cima, o que segurou, citando os movimentos com
maior efeito em reais. Posição sem cotação na Redentia: diga que ficou fora
da conta do dia.}

### Notícias que tocam as posições
- {título} ({fonte}, {DD/MM}) — {reading, quando houver} · cita {TICKERS}
{sem notícia na janela: "Nenhuma notícia recente cita as posições informadas."}

### Cruzamento com as teses Redentia
- {TICKER} aparece na tese "{title}" (convicção {conviction}/100){, como {status}, com catalisador: {catalyst}}
{sem cruzamento: "Nenhuma posição informada aparece nas 10 teses ativas."}

### Contexto de mercado ({as_of_date do snapshot})
IBOV {value} ({change_pct}%) · IFIX {change_pct}% · Dólar R$ {value} ({delta_pct}%) · Selic meta {selic_meta}% a.a.

### Limitações deste dado
{bloco fixo abaixo, sempre presente}
```

EXEMPLO curto de abertura preenchida (números ilustrativos — rode a receita pra ter o dado real):

```markdown
## Carteira informada — 20/08/2026 (cotações de 19/08)

| | |
|---|---|
| Valor informado | R$ 412.380 |
| Dia | R$ +2.873 (+0,70%) |
| Posições | 4 informadas |
```

### Bloco fixo "Limitações deste dado" (copie no fim de todo relatório)

```markdown
- Os valores e pesos vêm do que foi informado nesta conversa — a Redentia não
  vê nem guarda essa carteira; confira contra o sistema do escritório.
- A variação do dia usa a última cotação coletada de cada ativo, não tempo
  real ({as_of mais antigo entre as posições}).
- Sem preço médio e quantidade informados, não há resultado acumulado.
- Tesouro e renda fixa não têm cotação na Redentia: entram no total pelo
  valor informado e ficam fora da variação do dia.
- Composição de ETF, quando usada, é a carteira mensal reportada à CVM.
```

## Passo 4 — Feche com a ponte

Depois do relatório, ofereça em uma linha:

> Quer texto pronto pro cliente sobre alguma dessas posições? É a skill redentia-por-que-moveu: me diga o ticker e o formato.

Se for a primeira rodada da conversa, inclua também (uma única vez, nunca dentro de texto pra cliente):

> Os textos pra cliente saem sem aviso de compliance de propósito: revise e envie pelo seu canal — o que chega ao cliente é responsabilidade do escritório.

## Regras duras

- **NUNCA** escreva: "recomendação", "carteira recomendada", "o que comprar", "sugestão de alocação", "assessoria", "consultoria", "research", "análise de valores mobiliários". Nunca prometa retorno. Nunca "dados da B3", "oficiais", "tempo real".
- **NUNCA** sugira peso percentual, rebalanceamento, aporte ou resgate. **NUNCA** classifique a carteira como "boa", "ruim", "adequada" ou "arriscada demais" — descreva concentração e exposição em números e deixe o julgamento pro escritório.
- **Nome de ativo vem cru da B3** ("PETROBRAS   PN      N2") — limpe sempre ("Petrobras PN" ou o ticker).
- **Data sempre**: cotações são do último fechamento coletado. Se `as_of` não for de hoje, o relatório diz a data — no título, não em nota de rodapé.
- Selic = `macro.selic_meta` (% ao ano). Ignore `selic_diaria`/`cdi` (% ao dia).
- ETF na carteira: composição é a carteira MENSAL reportada à CVM — sempre "carteira de {mês/ano} (CVM)", nunca posição de hoje. Custo efetivo com `unmapped_fund_weight` maior que zero é piso, não total.
- Top movers do snapshot incluem papéis ilíquidos — não os use como retrato do mercado; use IBOV/IFIX.
- Sem emoji, sem exclamação, tom sóbrio. Tabelas markdown pra dados.

## O que esta skill recusa

- Sugerir alocação, rebalanceamento ou peso por ativo — em qualquer formulação, inclusive "só uma ideia".
- Emitir "carteira recomendada" ou nota de adequação ao perfil (suitability).
- Projetar retorno ou dizer que a carteira "vai" a algum lugar.
- Escrever a carta ou o comentário de convicção do gestor.
- Guardar a carteira pra "próxima conversa" — o dado vive só aqui.

Se o pedido cair numa dessas, explique em uma frase que o relatório é descritivo e a decisão é do escritório, e entregue o que a skill faz.
