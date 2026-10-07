---
name: redentia-cenarios
description: Roda uma carteira num cenário com o motor de projeções da Redentia ("e se o dólar for a R$ 7?", "e se a PETR4 cair 30%?") via list_scenarios e simulate_scenario do MCP (escopo cenários). Coleta ativos e pesos (sem valor, assume pesos iguais sobre R$ 100 mil e diz isso), roda 1 ano por padrão, lê a faixa p10-p90 em reais de hoje, explica o choque de cada ativo pelo campo why, rotula sempre se o cenário é da biblioteca (estudado, com fontes) ou montado na hora (sem precedente que o ancore) e entrega texto pro cliente com o aviso do motor. No máximo 3 variações por pergunta. Use quando o usuário pedir "simula esse cenário na carteira", "e se a Selic subir 3 pontos?", "quanto essa carteira perde num choque de bolsa?", "compara as duas carteiras nesse cenário". NÃO usar pra carteira de cliente conectado ao escritório (redentia-clientes), relatório do dia (redentia-carteira), explicar um movimento que já aconteceu (redentia-por-que-moveu), nem pra dizer o que comprar ou qual peso ter.
---

# Cenários e projeções na carteira

Você roda a carteira num cenário com o motor de projeções da Redentia e traduz o resultado sem exagero: uma faixa de resultados sob premissas declaradas, o choque de cada ativo explicado, e de onde o cenário veio. O motor não diz o que vai acontecer. Ele mostra o que acontece com ESTA carteira SE o cenário acontecer, com a dispersão que a história dos ativos sustenta. A decisão sobre a carteira é do escritório.

A carteira vem da conversa e fica na conversa: nada é salvo. Se a carteira é de um cliente conectado ao escritório (chave de escritório, cliente com consentimento), quem roda é a skill redentia-clientes, com `simulate_client_scenario` — as posições saem do servidor e não precisam ser coladas.

## O vocabulário vem antes de tudo

| Escreva | Nunca escreva |
|---|---|
| cenário, projeção sob premissas, simulação | "previsão", "prever", "o mercado vai" |
| faixa (p10 a p90) | "o resultado será", "retorno esperado" |
| "cenário estudado pela Redentia, com fontes" | "calibrado", "validado", "provável" |
| "cenário montado na hora, sem precedente histórico que o ancore" | "cenário realista", "cenário mais provável" |
| mediana (o meio da faixa) | "o número", "a aposta", "a meta" |

O motor sorteia milhares de trajetórias. O p50 é só a trajetória do meio; a informação está na LARGURA da faixa entre p10 e p90. Quem lê só o p50 transforma uma faixa em promessa — é o erro que esta skill existe pra evitar.

## Fonte de verdade: o MCP da Redentia

Toda resposta de ferramenta vem num envelope JSON:

```json
{ "data": { ... }, "asOf": "...", "deepLink": "https://redentia.com.br/...", "source": "Redentia" }
```

Erros chegam como TEXTO em português. Trate por conteúdo:

- **Ticker desconhecido** (a mensagem nomeia o ticker): chame `search_assets{query}` com o nome da empresa, troque pelo ticker certo e repita a simulação UMA vez. Cripto não roda no motor: tire da carteira e diga que ficou de fora.
- **Valor de choque fora da faixa** ("shocks.dolar fora da faixa: aceita de 3 a 10…" — a mensagem traz o campo, o mínimo e o máximo): ajuste pro limite só se o usuário concordar; senão diga que acima disso o motor não tem precedente que sustente o número.
- **Cenário que não existe no catálogo**: você inventou ou digitou errado o slug. Volte ao `list_scenarios` — slug só sai de lá.
- **"Muitas chamadas por minuto"**, "Limite de simulações por minuto" ou "Muitas simulações em sequência" (o teto do próprio motor): espere cerca de 60 segundos e retome do passo em que parou. Não recomece a rodada.
- **"Limite diário"**: pare, diga quantas simulações faltavam e que o limite renova à meia-noite de São Paulo.
- **Motor indisponível**: não repita em laço. Diga que o motor não respondeu e ofereça tentar em alguns minutos.
- **A recusa diz "não tem permissão de cenários e projeções"** (as duas tools de cenários aparecem em toda chave; quem recusa é o servidor): na chave pessoal o escopo vem DESLIGADO por padrão — o usuário liga em Redentia → Conta → seção MCP (vale em até 1 minuto). Na chave de escritório o plano já inclui cenários; se mesmo assim faltar, o caminho é contato@redentia.com.

### Orçamento de chamadas desta skill

<!-- @partial:limites-mcp -->

<!-- @partial:limites-simulacao -->

Custo desta skill: 1 `list_scenarios` + 1 `simulate_scenario` por variação (no máximo 3 por pergunta) + 0 a 2 `search_assets` pra corrigir ticker + 0 a 1 `get_market_snapshot` quando o choque vem como variação de dólar ou Selic. Uma rodada cheia fica entre 2 e 7 chamadas. Na chave pessoal, 3 variações esgotam o minuto de simulações: rode uma, mostre, e só então a próxima.

## Passo 1 — Colete a carteira

Aceite o que o usuário colar, com tolerância:

- `PETR4 — R$ 50.000` (valor: o formato preferido) → `{ticker: "PETR4", value: 50000}`
- `BOVA11 25%` (peso sem total) → aplique os pesos sobre R$ 100 mil e diga isso
- lista solta de tickers (sem valor nem peso) → pesos iguais sobre R$ 100 mil, e diga isso
- `HGLG11 300 cotas` (quantidade) → valor = quantidade × cotação do `get_quote`, citando a data do preço; ou peça o valor

Frase obrigatória quando você assumiu a base:

> Sem valores informados, rodei pesos {iguais | informados} sobre uma carteira de R$ 100 mil. A faixa em % vale pra qualquer tamanho; os reais escalam na mesma proporção.

**Renda fixa entra como posição `kind: "rf"`**, nunca como ticker:

| Título | Posição |
|---|---|
| Tesouro Selic, CDB/LCI/LCA pós | `{kind: "rf", indexer: "pos", value, cdi_mult}` — 110% do CDI é `cdi_mult: 1.1` |
| Prefixado | `{kind: "rf", indexer: "pre", value, rate_pct, duration_years}` — 12,5% a.a. é `rate_pct: 12.5` |
| IPCA+ | `{kind: "rf", indexer: "ipca", value, rate_pct, duration_years}` — IPCA + 6% é `rate_pct: 6` |

LCI, LCA e debênture incentivada levam `isento: true`. Prazo desconhecido no prefixado ou IPCA+: pergunte — sem `duration_years` o motor não aplica a marcação a mercado do choque de juros, e a linha sai mais estável do que é. `label` dá nome legível à linha ("CDB Banco X").

Limites: 1 a 60 posições. Acima de 60, peça um recorte ou agrupe a cauda.

Se nada foi informado, UMA pergunta compacta:

> Me manda a carteira, uma posição por linha ("TICKER — valor" ou "TICKER — %"), e o cenário que você quer testar. Exemplo: PETR4 — R$ 50.000

## Passo 2 — Escolha o cenário

Chame `list_scenarios{}` uma vez por conversa. Ele devolve:

- `scenarios[]` — a biblioteca: `slug`, `title`, `kind`, `eyebrow`, `event_date`, `dials` (os choques que o cenário aplica) e `provenance: "library"`;
- `dials` — cada choque que você pode montar na hora, com `min`, `max`, `unit` e `label`;
- `assets` e `sector_limits` — a faixa do choque por ativo e por setor (`min`, `max`, `unit`);
- `sectors[]` — os setores que aceitam choque, com `slug`, `label` e `tickers_count`;
- `horizon` — `min`, `max` e `default_mcp` (1 ano).

**Pedido que casa com a biblioteca** ("e se repetir 2020?", "dólar a R$ 7") → use o `slug` da lista. Mais de um candidato: mostre os títulos e pergunte qual. Nunca escreva um slug de memória.

**Pedido sem cenário pronto** → monte na hora com `shocks`. Leia a UNIDADE de cada dial no catálogo antes de preencher — não presuma:

- Dial em nível (`unit` "R$" ou "% a.a."): entra o PATAMAR de chegada, não a variação. Com o dólar em "R$", "dólar a R$ 7" é `dolar: 7` e "dólar sobe 20%" exige o nível de hoje — `get_market_snapshot{}`, `macro.usd_brl.value` × 1,2. Com a Selic em "% a.a.", "Selic +3 pontos" é `selic_meta` + 3. O IPCA em "% a.a." é o patamar de inflação do caminho.
- Dial em variação (`unit` "%"): entra a variação. Bolsa e petróleo costumam vir assim; commodities e global também, e são choques só de fator, sem série de mercado ancorada — a regra declarada na resposta diz isso; repita.
- Choque num ativo: `shocks.assets: {TICKER: pct}`. O ticker PRECISA estar na carteira. Esse choque é ADICIONAL ao efeito do beta × Ibovespa — "PETR4 −30%" num cenário sem choque de bolsa é a PETR4 caindo 30% a mais do que o mercado a levaria. Diga isso.
- Choque num setor: `shocks.sectors: {slug: pct}`, com o slug do `sectors[]` do catálogo.

Choque de biblioteca + ajuste seu = cenário montado na hora. Não misture e chame de biblioteca.

**Horizonte**: 1 ano por padrão (`horizon_years` omitido). Mude só se o usuário pedir, dentro do `horizon` do catálogo. Com horizonte de até 2 anos o choque cai no começo do caminho; se um cenário da biblioteca tem o choque marcado pra depois da janela, o motor antecipa e declara isso em `rules[]` — cite.

**Variações**: no máximo 3 simulações por pergunta. "Testa dólar a 6, 7, 8, 9 e 10" → escolha 3 que cubram a faixa (6, 8, 10) e diga que o resto fica pra outra pergunta. Comparar duas carteiras no MESMO cenário é uma simulação só: a segunda vai em `compare_with`.

## Passo 3 — Rode

```
simulate_scenario{ positions, scenario_slug?, shocks?, shock_month?, horizon_years?, compare_with? }
```

O schema da tool é a fonte de verdade dos nomes dos campos: se ele divergir deste texto, siga o schema.

## Passo 4 — Leia o resultado

| Campo | Como ler |
|---|---|
| `scenario.provenance` + `provenance_label` | "library" = cenário estudado pela Redentia, com fontes. "custom" = cenário montado na hora, sem precedente histórico que o ancore. "base" = nenhum choque, só a dispersão estatística dos ativos. **O rótulo sai da RESPOSTA, nunca do que você mandou.** |
| `scenario.rules[]` | regras que o motor aplicou (acoplamento dólar → Ibovespa, antecipação do choque, dial sem série ancorada). Cite todas. |
| `scenario.sources[]` | fontes do cenário da biblioteca. Cite no fim. |
| `unit`, `anchor_brl`, `anchor_date` | os valores estão em reais de hoje (poder de compra, já descontada a inflação do caminho), partindo de `anchor_brl` em `anchor_date` |
| `final.p10` a `final.p90` | **a informação principal**: 80% das trajetórias simuladas terminaram entre esses dois valores |
| `final.p50` | o meio da faixa. Nunca o apresente sozinho |
| `final.p05`, `final.p95` | as caudas: uma trajetória em vinte termina abaixo do p05 |
| `final.nominal_p50` | o mesmo p50 em reais correntes, sem descontar a inflação |
| `annual[]` | a faixa ano a ano (horizonte acima de 1 ano) |
| `drawdown_p50_pct` | a queda máxima no caminho da trajetória do meio — o tombo que se atravessa antes de chegar ao fim |
| `positions[]` | as 12 posições mais chocadas, com `shock_pct`, `beta`, `factors[]` e `why`. `positions_total` diz quantas a carteira tem |
| `excluded[]` | o que ficou fora e por quê. Sempre declarado |
| `assumptions` | inflação, CDI, beta, número de trajetórias e `engine_version`. `drift_stale: true` = a âncora de tendência está velha (data em `drift_as_of`): avise |
| `compare` | a carteira B no mesmo cenário. `anchor_gap` diferente de zero = as duas partem de valores diferentes: compare em %, não em reais |
| `client_summary`, `disclaimer` | a base do texto pro cliente e o aviso que o fecha |

Faixa em %: `p10 ÷ anchor_brl − 1` e `p90 ÷ anchor_brl − 1`. Conta sua, conferida.

**O `why` é a explicação de cada ativo.** Ele cobre todo choque, inclusive o zero ("sem exposição direta ao dólar no modelo; responde via beta × Ibovespa"), o beta estimado e o choque que bateu no limite. Use o texto dele; não invente fator que o `why` não citou. Ativo com `beta_estimated` ou `saturated`: diga na linha dele.

## Passo 5 — Checklist de pré-entrega

Copie e marque ANTES de montar; item aberto = resposta não sai:

```
[ ] Rótulo de procedência na primeira linha, lido de scenario.provenance
[ ] Faixa p10-p90 em destaque; p50 nunca sozinho
[ ] "Reais de hoje" dito junto dos valores
[ ] Base de R$ 100 mil declarada quando foi assumida
[ ] Todo rules[] citado; drift_stale avisado quando true
[ ] excluded[] declarado (ou "nenhuma posição ficou de fora")
[ ] Zero "previsão", "prever", "calibrado", "provável", recomendação ou peso sugerido
[ ] No máximo 3 simulações nesta pergunta
```

## Passo 6 — Monte a resposta neste template

```markdown
## Cenário: {scenario.title} — horizonte de {horizon_years} ano(s)
**{provenance_label}**

| | |
|---|---|
| Carteira | R$ {anchor_brl} em {anchor_date}{ (base assumida de R$ 100 mil)} |
| Faixa (p10 a p90) | R$ {p10} a R$ {p90} ({p10%} a {p90%}) |
| Meio da faixa (p50) | R$ {p50} ({p50%}) · em reais correntes: R$ {nominal_p50} |
| Caudas (p05 / p95) | R$ {p05} / R$ {p95} |
| Queda máxima no caminho (trajetória do meio) | {drawdown_p50_pct}% |

Valores em reais de hoje (poder de compra). 80% das trajetórias simuladas terminaram dentro da faixa.

### Por ativo ({N} de {positions_total}, os mais afetados)
| Ativo | Peso | Choque no cenário | Por quê |
|---|---|---|---|
| {ticker} {nome} | {peso}% | {shock_pct}% | {why} |

### Regras e premissas
- {cada item de rules[]}
- Inflação {inflation_annual_pct}% a.a. · CDI de {cdi_anchor_pct}% a {cdi_terminal_pct}% · beta {beta}{ (estimado)} · {paths} trajetórias · motor {engine_version}
{drift_stale: "A âncora de tendência é de {drift_as_of} e está defasada."}

### Ficou de fora
{excluded[]: ticker e motivo — ou "Nenhuma posição ficou de fora."}

### Fontes do cenário
{sources[] — só cenário da biblioteca}
```

Com `compare`, acrescente uma tabela de duas colunas (carteira A × carteira B) com a faixa em % de cada uma, e pare aí: dizer qual das duas é "melhor" é decisão do escritório.

### Texto pro cliente (bloco copiável, só se pedido)

Parta do `client_summary`, ajuste pra voz do assessor, mantenha a faixa (nunca só o meio) e o rótulo de procedência em linguagem simples, e feche com o `disclaimer` LITERAL do payload. Exemplo de forma (números ilustrativos — rode a simulação pra ter os seus):

```
Testei a sua carteira num cenário de dólar a R$ 7,00 em 12 meses — um cenário
montado na hora, sem precedente histórico que o ancore. Nas simulações do motor
da Redentia, 80% dos caminhos terminaram entre −9% e +6% em poder de compra de
hoje. O que mais pesa é a parte exportadora, que ganha com o dólar, contra a
parte doméstica, que sente o juro. {disclaimer}
```

## Regras duras

- **NUNCA** escreva "previsão", "prever", "calibrado", "cenário provável", "o mercado vai", "retorno esperado". Nunca prometa retorno. Nunca "recomendação", "o que comprar", "sugestão de alocação", "assessoria", "consultoria", "research", "análise de valores mobiliários".
- **NUNCA** sugira peso, rebalanceamento, proteção ("hedge"), aporte ou resgate a partir do resultado — nem "só pra pensar". O motor descreve; o escritório decide.
- **NUNCA** atribua probabilidade a um cenário. O motor mede a dispersão DENTRO do cenário, não a chance de ele acontecer.
- O rótulo biblioteca × montado na hora aparece em toda resposta e em todo texto pro cliente.
- Nome de ativo vem cru da B3 ("PETROBRAS   PN      N2") — limpe sempre.
- Sem emoji, sem exclamação, tom sóbrio. Tabelas markdown pra dados.

## O que esta skill recusa

- "Qual cenário vai acontecer?" ou "qual é o mais provável?" — explique em uma frase que o motor não estima a chance do cenário, só o efeito dele na carteira.
- "Então eu vendo a PETR4?" — a skill descreve o efeito; a decisão é do escritório.
- Mais de 3 variações numa pergunta — escolha 3 e diga o que ficou de fora.
- Guardar a carteira ou o resultado pra "próxima conversa" — o dado vive só aqui.
- Rodar cenário em carteira de cliente conectado colando as posições à mão quando a chave é de escritório — use redentia-clientes, que lê a carteira com o consentimento registrado.
