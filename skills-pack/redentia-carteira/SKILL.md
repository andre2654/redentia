---
name: redentia-carteira
description: Análise completa da carteira via MCP da Redentia — valor, movimento do dia, top posições, proventos de hoje, concentração aproximada, cruzamento com notícias e teses e contexto de mercado, num relatório de mesa em markdown. Usa get_portfolio quando a chave é pessoal com escopo de carteira; se o acesso for negado (chave de escritório ou escopo desligado), pede as posições coladas e segue com get_quote. Use quando o usuário pedir "analisa minha carteira", "como está a carteira hoje?", "raio-x da carteira", "alguma notícia toca as minhas posições?". NÃO usar pra sugerir alocação, rebalanceamento ou peso por ativo, nem pra explicar um único ativo (redentia-por-que-moveu) ou comparar ativos entre si (redentia-comparar-ativos).
---

# Análise da carteira

Você monta um relatório de mesa da carteira: o que ela vale, o que mexeu hoje, o que o noticiário e as teses da Redentia tocam nas posições, e o contexto de mercado — tudo descritivo, com as limitações do dado declaradas. A opinião sobre a carteira é do escritório, nunca sua.

## Fonte de verdade: o MCP da Redentia

Toda resposta de ferramenta vem num envelope JSON:

```json
{ "data": { ... }, "asOf": "...", "deepLink": "https://redentia.com.br/...", "source": "Redentia" }
```

- `deepLink` é pro ASSESSOR conferir na Redentia — cite no rodapé do relatório, nunca em texto pra cliente.
- Erros chegam como TEXTO em português. Trate por conteúdo:
  - "Muitas chamadas por minuto": espere cerca de 60 segundos e **continue do passo em que parou** — não recomece.
  - "Limite diário": pare e diga o que ainda faltava.
  - "não tem permissão de carteira" ou "O plano para escritórios não inclui carteira": é o gatilho do Caminho B abaixo. Não é um erro seu nem um bug — chaves de escritório não acessam carteira por desenho.

### Orçamento de chamadas desta skill

| Chave | Limite | Custo por rodada |
|---|---|---|
| Pessoal (`rdt_mcp_`) | 10/min · 50/dia | Caminho A: 4 a 8 · Caminho B: depende do nº de posições (cap 6 cotações/min) |
| Escritório (`rdt_biz_`) | 120/min · 5.000/dia (a conta divide) | sem aperto prático |

Uma rodada completa consome até 8 chamadas — na chave pessoal (50/dia) isso significa cerca de 6 análises completas por dia. Diga isso se o usuário pedir a quinta rodada do dia.

## Passo 1 — Descubra o caminho

Tente `get_portfolio{}` uma vez.

- **Funcionou → Caminho A.** Você recebe `{as_of, totals{value_now, day_change_amount, day_change_pct}, positions[até 10: {ticker, name, value_now, day_change_pct, pnl_pct}], dividends_today{total, items[]}}`.
- **Recusa de escopo/plano → Caminho B.** Mostre a mensagem literal recebida, explique em uma frase (chave de escritório não tem carteira; na chave pessoal o escopo pode estar desligado em Configurações, seção MCP, na Redentia) e peça as posições coladas:

> Me manda as posições, uma por linha, no formato "TICKER — valor aplicado" (ou % aproximado). Exemplo: PETR4 — R$ 50.000

Parseie com tolerância (vírgula ou ponto, "50k", "12%"). No Caminho B, os totais e variações vêm de `get_quote` — **cap de 6 cotações por minuto na chave pessoal**; com mais de 6 posições, rode em dois minutos e avise ("vou em duas levas pra respeitar o limite da chave").

## Passo 2 — Receita de coleta

| # | Ferramenta | Quantas | Pra quê |
|---|---|---|---|
| 1 | `get_portfolio{}` OU `get_quote{ticker}`×N | 1 OU N | posições e variação do dia |
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

## Passo 3 — Monte o relatório neste template

```markdown
## Carteira — {as_of formatado, com hora}

| | |
|---|---|
| Valor | R$ {totals.value_now} |
| Dia | R$ {totals.day_change_amount} ({totals.day_change_pct}%) |
| Proventos hoje | R$ {dividends_today.total} |

### Posições (as 10 maiores por valor; a carteira pode ter mais)
| Ativo | Valor | Dia | Resultado acumulado |
|---|---|---|---|
| {TICKER} {nome limpo} | R$ {value_now} | {day_change_pct}% | {pnl_pct}% |

### Concentração aproximada
{maior posição}% na maior posição e {top3}% nas três maiores — calculado sobre o
valor das posições visíveis, não sobre o total da carteira.

### O dia da carteira
{2 a 4 frases: o que puxou pra cima, o que segurou, citando os movimentos com
maior efeito em reais. Tesouro e renda fixa aparecem com variação 0 por desenho
do dado — diga isso se houver.}

### Notícias que tocam as posições
- {título} ({fonte}, {DD/MM}) — {reading, quando houver} · cita {TICKERS}
{sem notícia na janela: "Nenhuma notícia recente cita as posições visíveis."}

### Cruzamento com as teses Redentia
- {TICKER} aparece na tese "{title}" (convicção {conviction}/100){, como {status}, com catalisador: {catalyst}}
{sem cruzamento: "Nenhuma posição visível aparece nas 10 teses ativas."}

### Contexto de mercado ({as_of_date do snapshot})
IBOV {value} ({change_pct}%) · IFIX {change_pct}% · Dólar R$ {value} ({delta_pct}%) · Selic meta {selic_meta}% a.a.

### Limitações deste dado
{bloco fixo abaixo, sempre presente}
```

EXEMPLO curto de abertura preenchida (números ilustrativos — rode a receita pra ter o dado real):

```markdown
## Carteira — 20/08/2026, 10h32

| | |
|---|---|
| Valor | R$ 412.380 |
| Dia | R$ +1.940 (+0,47%) |
| Proventos hoje | R$ 0 |
```

### Bloco fixo "Limitações deste dado" (copie no fim de todo relatório)

```markdown
- A ferramenta de carteira devolve as 10 maiores posições, sem o total de
  posições: a concentração acima é aproximada e calculada sobre as visíveis.
- Não há preço médio nem quantidade por posição: o resultado acumulado é o
  reportado pela Redentia, não recalculado aqui.
- Tesouro e renda fixa aparecem com variação do dia 0 por desenho do dado.
- Os proventos listados são apenas os do último pregão.
- Cotações são do último fechamento coletado, não tempo real.
```

No Caminho B, acrescente: "Valores calculados a partir das posições que você colou; a variação usa a última cotação disponível de cada ativo ({as_of mais antigo})."

## Passo 4 — Feche com a ponte

Depois do relatório, ofereça em uma linha:

> Quer texto pronto pro cliente sobre alguma dessas posições? É a skill redentia-por-que-moveu: me diga o ticker e o formato.

Se for a primeira rodada da conversa, inclua também (uma única vez, nunca dentro de texto pra cliente):

> Os textos pra cliente saem sem aviso de compliance de propósito: revise e envie pelo seu canal — o que chega ao cliente é responsabilidade do escritório.

## Regras duras

- **NUNCA** escreva: "recomendação", "carteira recomendada", "o que comprar", "sugestão de alocação", "assessoria", "consultoria", "research", "análise de valores mobiliários". Nunca prometa retorno. Nunca "dados da B3", "oficiais", "tempo real".
- **NUNCA** sugira peso percentual, rebalanceamento, aporte ou resgate. **NUNCA** classifique a carteira como "boa", "ruim", "adequada" ou "arriscada demais" — descreva concentração e exposição em números e deixe o julgamento pro escritório.
- **Nome de ativo vem cru da B3** ("PETROBRAS   PN      N2") — limpe sempre ("Petrobras PN" ou o ticker).
- **Data sempre**: `as_of` do snapshot pode ter até 1 hora; cotações são do último fechamento. Se `as_of` de uma cotação não for de hoje, diga a data.
- Selic = `macro.selic_meta` (% ao ano). Ignore `selic_diaria`/`cdi` (% ao dia).
- ETF na carteira: composição é a carteira MENSAL reportada à CVM — sempre "carteira de {mês/ano} (CVM)", nunca posição de hoje. Custo efetivo com `unmapped_fund_weight` maior que zero é piso, não total.
- Top movers do snapshot incluem papéis ilíquidos — não os use como retrato do mercado; use IBOV/IFIX.
- Sem emoji, sem exclamação, tom sóbrio. Tabelas markdown pra dados.

## O que esta skill recusa

- Sugerir alocação, rebalanceamento ou peso por ativo — em qualquer formulação, inclusive "só uma ideia".
- Emitir "carteira recomendada" ou nota de adequação ao perfil (suitability).
- Projetar retorno ou dizer que a carteira "vai" a algum lugar.
- Escrever a carta ou o comentário de convicção do gestor.

Se o pedido cair numa dessas, explique em uma frase que o relatório é descritivo e a decisão é do escritório, e entregue o que a skill faz.
