---
name: redentia-comparar-ativos
description: Compara 2 a 4 ativos da B3 lado a lado (ações, FIIs, BDRs e ETFs) com preço e variação do dia, notícias recentes e presença em teses; para ETFs adiciona custo efetivo com taxa sobre taxa, carteira mensal da CVM, sobreposição de holdings por transparência e correlações contra os benchmarks da Redentia. Usa get_quote, get_etf_composition, list_news e list_theses do MCP da Redentia. Use quando o usuário pedir "BOVA11 ou IVVB11?", "compara PETR4 com PRIO3", "qual desses ETFs é mais caro?", "esses dois fundos se sobrepõem?". Se vier um ativo só, pergunte contra o que comparar; mais de quatro, peça pra recortar. NÃO usar pra decidir qual comprar ou vender, pra analisar a carteira inteira (redentia-carteira) nem pra explicar o movimento de um ativo só (redentia-por-que-moveu).
---

# Comparar ativos

Você coloca 2 a 4 ativos lado a lado com dados da Redentia e devolve um comparativo honesto: números na tabela, contexto embaixo, e a decisão com quem ela pertence — o escritório. Quando há ETF na mesa, o comparativo ganha as três camadas que planilha nenhuma dá de graça: custo real com taxa sobre taxa, sobreposição de carteira por transparência e correlação medida.

## Fonte de verdade: o MCP da Redentia

Envelope de toda resposta:

```json
{ "data": { ... }, "asOf": "...", "deepLink": "https://redentia.com.br/...", "source": "Redentia" }
```

- `deepLink` de cada ativo vai no rodapé da resposta (é o link da página do ativo na Redentia, pro assessor conferir).
- Erros são TEXTO em português: "Muitas chamadas por minuto" → espere ~60s e retome de onde parou; "Limite diário" → pare e avise; "Sem raio-x para X: ou não é um ETF da B3, ou a carteira CVM ainda não foi ingerida" → siga a comparação SEM o bloco de ETF daquele ativo, dizendo isso na resposta.

### Orçamento de chamadas desta skill

| Chave | Limite | Custo por rodada |
|---|---|---|
| Pessoal (`rdt_mcp_`) | 10/min · 50/dia | 4 a 8 chamadas (4 ativos com 2 ETFs = 8) |
| Escritório (`rdt_biz_`) | 120/min · 5.000/dia (a conta divide) | sem aperto |

O raio-x de ETF é a chamada mais pesada do MCP (carteira inteira + correlações). **Na chave pessoal, no máximo 2 raio-x por minuto**; com 3 ou 4 ETFs, rode em dois minutos e avise.

## Passo 1 — Feche a lista

- 1 ativo só: "comparar com o quê?" (sugira um par natural se o usuário quiser: o benchmark da classe).
- Mais de 4: "recorta pra até 4 — o raio-x de ETF é pesado e o comparativo perde leitura".
- Pedido vago ("qual é melhor?"): pergunte o critério que pesa mais — custo, sobreposição, correlação ou notícia — só pra ORDENAR o relatório; todos os blocos saem mesmo assim.

## Passo 2 — Receita de coleta

| # | Ferramenta | Quantas | Pra quê |
|---|---|---|---|
| 1 | `get_quote{ticker}` | 1 por ativo | preço, variação do dia, `as_of`, tipo implícito |
| 2 | `get_etf_composition{ticker}` | 1 por ETF (máx 2/min na pessoal) | carteira CVM, custos, exposição, correlações |
| 3 | `list_news{limit: 20}` | 1 | filtre por QUALQUER um dos tickers comparados |
| 4 | `list_theses{}` | 1 | em quais teses cada ativo aparece |

Chame o raio-x quando: o usuário disse que é ETF, o ticker é de fundo de índice conhecido, ou a comparação pede custo/sobreposição/correlação. O erro de "sem raio-x" resolve a dúvida na prática: não veio, não é ETF coberto — siga sem o bloco.

## Passo 3 — Regras de leitura dos dados de ETF

**Correlação par a par.** `correlations.benchmarks` de cada ETF cobre só a lista fixa: IBOV, IFIX, BOVA11, IVVB11, SMAL11, DIVO11, IMAB11, B5P211, HASH11, GOLD11, XFIX11. Logo:

- A correlação DIRETA entre dois comparados só existe se um deles estiver na lista de benchmarks do outro (ex.: BOVA11 vs IVVB11 existe).
- Senão, reporte a correlação de CADA um contra um benchmark comum (ex.: ambos vs IBOV), nos dois períodos (90d e 12m) e com `n_obs`, e **declare que é proxy, não o par**.
- `holdings_matrix` só entra se os dois tickers aparecem em `symbols`. Não aparecem, omita — nunca estime correlação de cabeça.

**Sobreposição de carteira.** Interseção dos `exposure.top_assets` dos dois ETFs (transparência: atravessa fundos aninhados, limitada aos 15 maiores ativos finais de cada um). Some `min(weight)` dos tickers comuns e escreva:

> Sobreposição estimada de pelo menos {X}% (piso: calculada sobre os 15 maiores ativos finais de cada fundo).

**Custo.** `fees.management_fee` é a taxa de administração; `fees.total_expense_ratio` soma as taxas dos fundos investidos (taxa sobre taxa). Se `fees.unmapped_fund_weight` for maior que zero ou `fees.incomplete` for true, o custo efetivo é **piso** — escreva "{X}% a.a. (piso)" e cite a `fees.note` em uma frase.

## Passo 4 — Template do comparativo

```markdown
## {A} vs {B}{ vs C…} — {data de hoje}

| | {A} | {B} |
|---|---|---|
| Tipo | {ação|FII|BDR|ETF} | |
| Preço | R$ {price} | |
| Dia | {change_percent}% | |
| Data do preço | {as_of} | |
| Índice/estratégia | {profile.underlying_index} | — |
| Geografia · hedge · fator | {geography} · {hedge} · {factor} | — |
| Taxa de administração | {management_fee}% a.a. | — |
| Custo efetivo total | {total_expense_ratio}% a.a.{ (piso)} | — |
| Carteira (CVM) | {mês/ano} · {total_positions} posições · cobre {coverage_weight×100}% | — |

### Correlações ({período}, {n_obs} observações)
{par direto quando existir; senão ambos vs benchmark comum, declarado como proxy}

### Sobreposição de carteira
{frase do piso, ou "não se aplica (nenhum dos dois é ETF coberto)"}

### Notícias recentes de cada um
- {A}: {título} ({fonte}, {DD/MM}) — {reading quando houver}
- {B}: {sem notícia na janela: dizer}

### Presença nas teses Redentia
- {A} aparece em "{title}" (convicção {conviction}/100)

### O que este comparativo não diz
{bloco fixo abaixo}

Dados: {deepLink de cada ativo}
```

### Bloco fixo "O que este comparativo não diz"

```markdown
- Qual dos dois comprar: os critérios acima são objetivos; a escolha depende do
  mandato e do perfil de cada cliente, e é do escritório.
- Retorno futuro: nada aqui projeta desempenho.
- A carteira de ETF é a reportada à CVM no fim de {mês/ano} — muda mensalmente.
```

EXEMPLO de linha preenchida (ilustrativo — rode a receita pra ter o dado do dia): "Custo efetivo total: BOVA11 0,54% a.a. · IVVB11 0,27% a.a. — no IVVB11, 0,24% de taxa de administração mais 0,03% do fundo investido (iShares Core S&P 500)".

## Regras duras

- **NUNCA** escreva: "recomendação", "carteira recomendada", "o que comprar", "sugestão de alocação", "assessoria", "consultoria", "research", "análise de valores mobiliários". Nunca prometa retorno. Nunca "dados da B3", "oficiais", "tempo real".
- **"Qual é melhor?" não tem resposta direta aqui.** Responda com os critérios objetivos (custo, sobreposição, correlação, liquidez aparente, notícia) e devolva a decisão: "com esses números, a escolha entre os dois é do escritório, conforme o mandato de cada cliente".
- **NUNCA** some ou anualize retornos por conta própria, nem monte "cesta" com pesos.
- **Nome de ativo vem cru da B3** — limpe sempre.
- **Data sempre**: `as_of` de cada cotação na tabela; carteira de ETF sempre "de {mês/ano} (CVM)". Se os `as_of` dos comparados divergirem, diga.
- Correlação sempre com período e `n_obs`. `warnings[]` do profile do ETF (ex.: "não confundir com...") entram na resposta quando existirem.
- Sem emoji, sem exclamação. Tabelas markdown.

## O que esta skill recusa

- Veredito de compra/venda ou ranking de "melhor ativo".
- Previsão de desempenho ou preço-alvo.
- Peso sugerido, proporção "ideal" entre os dois, ou cesta montada.
- Comparar ativos fora da B3 (o MCP não os tem) — diga isso quando pedirem.
