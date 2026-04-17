# Redentia Reply Bot — Templates de Resposta

Templates para responder posts sobre investimentos em redes sociais.
Dois modos: **estático** (texto fixo) e **dinâmico** (com dados ao vivo da API).

## Regras gerais

- Máximo 280 caracteres (Twitter) ou 3 linhas curtas
- Sempre terminar com link da Redentia
- Tom: **direto, útil, dados primeiro** — nunca "marketeiro"
- Nunca dar conselho de investimento ("compre", "venda") — só dados
- Emoji: máximo 1, e só se for relevante (📊, 📈, ⚡)

---

## CATEGORIA 1: Pergunta sobre ação específica

### Trigger
Pessoa menciona ticker ($PETR4, VALE3, etc) com pergunta ou opinião.

### Template estático
```
{TICKER} hoje: R$ {PRECO} ({VARIACAO}%).
DY 12m: {DY}%. P/L: {PL}x.
Análise completa → redentia.com.br/asset/{ticker_lower}
```

### Template dinâmico (API)
```js
// GET /api/tickers/{ticker}
const t = await fetch(`${API}/tickers/PETR4`).then(r => r.json())

return `${t.symbol} hoje: R$ ${t.price.toFixed(2)} (${t.change_pct > 0 ? '+' : ''}${t.change_pct.toFixed(1)}%).
DY 12m: ${t.dividend_yield.toFixed(1)}%. P/L: ${t.pe_ratio.toFixed(1)}x.
Análise completa → redentia.com.br/asset/${t.symbol.toLowerCase()}`
```

### Exemplos reais

**Post:** "Será que vale comprar PETR4 agora?"
> PETR4 hoje: R$ 47,88 (+2,3%). DY 12m: 16,4%. P/L: 4,2x (abaixo da média do setor).
> Análise completa → redentia.com.br/asset/petr4

**Post:** "WEGE3 tá cara demais"
> WEGE3 hoje: R$ 52,40 (+0,8%). P/L: 38,2x. ROE: 28,4%. Premium de crescimento.
> Dados completos → redentia.com.br/asset/wege3

**Post:** "BBAS3 ou ITUB4?"
> BBAS3: DY 13,6%, P/L 4,8x. ITUB4: DY 8,2%, P/L 8,1x.
> BBAS3 paga mais dividendo, ITUB4 tem mais consistência.
> Comparativo → redentia.com.br/asset/bbas3

---

## CATEGORIA 2: Dividendos / Proventos

### Trigger
"dividendos", "proventos", "DY", "yield", "renda passiva", "quanto paga"

### Template estático
```
Top 3 DY da B3 hoje:
1. {TICKER1} — {DY1}%
2. {TICKER2} — {DY2}%
3. {TICKER3} — {DY3}%
Ranking completo → redentia.com.br/ranking/maiores-dividend-yield
```

### Template dinâmico (API)
```js
// GET /api/top-stocks?side=top&sort=dividend_yield&limit=3
const top = await fetch(`${API}/top-stocks?sort=dividend_yield&limit=3`).then(r => r.json())

return `Top 3 DY da B3 hoje:
${top.map((t, i) => `${i+1}. ${t.symbol} — ${t.dividend_yield.toFixed(1)}%`).join('\n')}
Ranking completo → redentia.com.br/ranking/maiores-dividend-yield`
```

### Exemplos

**Post:** "Quais ações pagam mais dividendos?"
> Top 3 DY da B3 hoje:
> 1. TAEE11 — 18,4%
> 2. ITSA4 — 14,8%
> 3. BBAS3 — 13,6%
> Ranking completo → redentia.com.br/ranking/maiores-dividend-yield

**Post:** "Quanto a Petrobras paga de dividendo?"
> PETR4 paga DY de 16,4% (últimos 12m).
> Último provento: R$ 1,28/ação em 02/04.
> Histórico completo → redentia.com.br/asset/petr4

**Post:** "FII bom pra renda mensal?"
> Top FIIs por DY: MXRF11 (13,8%), HGLG11 (11,4%), KNRI11 (10,9%).
> Rendimento mensal isento de IR pra PF.
> Ranking → redentia.com.br/fiis

---

## CATEGORIA 3: FIIs

### Trigger
"fii", "fundo imobiliário", "MXRF", "HGLG", "renda mensal"

### Template estático
```
Os FIIs com maior DY em {MES}:
{TICKER1} ({DY1}%), {TICKER2} ({DY2}%), {TICKER3} ({DY3}%).
Rendimento mensal isento de IR → redentia.com.br/fiis
```

### Exemplos

**Post:** "Tô montando carteira de FIIs"
> Top FIIs abril: MXRF11 (13,8%), HGLG11 (11,4%), KNRI11 (10,9%).
> P/VP, vacância e gestora num clique → redentia.com.br/fiis

**Post:** "FII de logística vale a pena?"
> HGLG11: DY 11,4%, P/VP 0,98x, vacância 2,1%. Gestora: CSHG.
> Um dos mais sólidos de logística → redentia.com.br/asset/hglg11

---

## CATEGORIA 4: Calculadora / Simulação

### Trigger
"juros compostos", "quanto dá", "simular", "aposentadoria", "R$ X por mês"

### Template estático
```
R$ {VALOR}/mês por {ANOS} anos a {TAXA}% a.a. = R$ {RESULTADO}.
Simula com qualquer valor → redentia.com.br/calculadora/juros-compostos
```

### Template dinâmico (cálculo local)
```js
function compoundInterest(monthly, rate, years) {
  const r = rate / 100 / 12
  const n = years * 12
  return monthly * ((Math.pow(1 + r, n) - 1) / r)
}

const result = compoundInterest(500, 10.5, 20)
return `R$ 500/mês por 20 anos a 10,5% a.a. = R$ ${result.toLocaleString('pt-BR', {maximumFractionDigits: 0})}.
Simula com qualquer valor → redentia.com.br/calculadora/juros-compostos`
```

### Exemplos

**Post:** "R$ 500/mês por 20 anos dá quanto?"
> Com taxa de 10,5% a.a.: R$ 383.480.
> Experimente outros valores → redentia.com.br/calculadora/juros-compostos

**Post:** "Quanto preciso pra aposentar com R$ 5000/mês?"
> Com DY médio de 8%: patrimônio-alvo de R$ 750.000.
> Simule o caminho → redentia.com.br/calculadora/aposentadoria

**Post:** "Qual o preço-teto de TAEE11?"
> Método Bazin com DY desejado de 6%: preço-teto R$ 38,50.
> Calculadora → redentia.com.br/calculadora/preco-teto

---

## CATEGORIA 5: Dor / Reclamação

### Trigger
"planilha", "excel", "assessor caro", "corretora ruim", "não sei por onde começar"

### Template estático (tom empático)
```
{EMPATIA}. {SOLUÇÃO_CURTA}.
{LINK} → redentia.com.br{PATH}
```

### Exemplos

**Post:** "Cansado de controlar carteira no Excel"
> Importa sua planilha em 2 min. Rentabilidade, setores e dividendos automáticos.
> Grátis → redentia.com.br

**Post:** "Pago 1% ao ano pro meu assessor"
> Nossa assessora IA analisa sua carteira em 3s, com fontes. R$ 0/mês. Zero conflito de interesse.
> Teste → redentia.com.br

**Post:** "Não sei por onde começar a investir"
> Começa pelo guia: quais ações comprar, como analisar DY, quando vender.
> Passo a passo → redentia.com.br/guias/como-investir-em-acoes-para-iniciantes

**Post:** "Minha corretora não tem dados decentes"
> 1.200+ ativos da B3 com cotação ao vivo, fundamentalista e dividendos.
> Sem taxa → redentia.com.br

---

## CATEGORIA 6: Mercado / Macro

### Trigger
"ibov", "bolsa", "selic", "inflação", "mercado hoje", "por que caiu"

### Template dinâmico
```js
// GET /api/top-stocks?side=top&limit=3 + /api/top-stocks?side=bottom&limit=3
const altas = await fetch(`${API}/top-stocks?side=top&limit=3`).then(r => r.json())
const baixas = await fetch(`${API}/top-stocks?side=bottom&limit=3`).then(r => r.json())

return `📊 Maiores altas: ${altas.map(t => `${t.symbol} +${t.change_pct.toFixed(1)}%`).join(', ')}.
Maiores baixas: ${baixas.map(t => `${t.symbol} ${t.change_pct.toFixed(1)}%`).join(', ')}.
Mercado ao vivo → redentia.com.br`
```

### Exemplos

**Post:** "Bolsa subiu forte hoje"
> 📊 Maiores altas: VALE3 +3,2%, PETR4 +2,3%, B3SA3 +1,8%.
> Commodities puxando o dia.
> Ranking ao vivo → redentia.com.br/ranking/maiores-altas-mes

**Post:** "Por que IBOV caiu?"
> Juros futuros abriram 15bps após ata do Copom. Varejo e construção lideraram as baixas.
> Commentary editorial → redentia.com.br

---

## CATEGORIA 7: Celebração / Gain

### Trigger
"🚀", "ATH", "máxima", "lucrei", "gain", "bateu meta"

### Template estático
```
{TICKER}: {FATO_DADO}. {CONTEXTO_CURTO}.
Acompanhe → redentia.com.br/asset/{ticker_lower}
```

### Exemplos

**Post:** "VALE3 subiu 5% essa semana 🚀"
> VALE3: +5,2% na semana. DY 12m: 11,7%. Minério em $128/ton.
> Análise → redentia.com.br/asset/vale3

**Post:** "TAEE11 na máxima histórica!"
> TAEE11: R$ 42,80, máxima histórica. DY 18,4%, maior da B3.
> Dados completos → redentia.com.br/asset/taee11

---

## CATEGORIA 8: IR / Impostos

### Trigger
"imposto de renda", "IR", "DARF", "quanto pago de imposto"

### Template estático
```
{RESPOSTA_DIRETA}.
Calcule automaticamente → redentia.com.br/calculadora/imposto-renda
```

### Exemplos

**Post:** "Como calcula IR sobre ações?"
> Swing trade: 15% sobre lucro, isento até R$ 20k/mês vendido.
> Day trade: 20%, sem isenção. DARF até o último dia útil do mês seguinte.
> Calculadora → redentia.com.br/calculadora/imposto-renda

**Post:** "Preciso pagar DARF sobre FII?"
> Rendimento de FII é isento de IR pra PF. Ganho de capital na venda: 20%.
> Simule → redentia.com.br/calculadora/imposto-renda

---

## CATEGORIA 9: Calendário / Datas

### Trigger
"data ex", "quando paga", "próximo dividendo", "calendário"

### Template estático
```
Próximos pagamentos da B3: {N} eventos nos próximos 30 dias.
{TICKER1} em {DATA1}, {TICKER2} em {DATA2}.
Calendário completo → redentia.com.br/dividendos/calendario
```

### Exemplos

**Post:** "Quando é a data ex da PETR4?"
> PETR4 próxima data ex: 14/04. Pagamento: 02/05. R$ 1,28/ação.
> Calendário → redentia.com.br/dividendos/calendario

**Post:** "Tem algum dividendo essa semana?"
> 8 pagamentos nos próximos 7 dias: BBAS3, ITUB4, TAEE11...
> Calendário completo → redentia.com.br/dividendos/calendario

---

## CATEGORIA 10: Educação / Conceitos

### Trigger
"o que é P/L", "dividend yield", "como funciona", "o que significa"

### Template estático
```
{CONCEITO}: {DEFINICAO_1_LINHA}.
{EXEMPLO_PRATICO}.
Glossário completo → redentia.com.br/glossario/{slug}
```

### Exemplos

**Post:** "O que é dividend yield?"
> DY = dividendo anual / preço da ação. Ex: PETR4 paga R$ 7,84/ano e custa R$ 47,88 → DY de 16,4%.
> Glossário → redentia.com.br/glossario/dividend-yield

**Post:** "P/L alto é bom ou ruim?"
> P/L = preço / lucro por ação. P/L alto pode significar crescimento (WEGE3: 38x) ou hype. P/L baixo pode ser valor (BBAS3: 4,8x) ou risco.
> Mais → redentia.com.br/glossario/preco-lucro

---

## Formato de variáveis (pra automação futura)

| Variável | Fonte | Exemplo |
|---|---|---|
| `{TICKER}` | Detectado no post | PETR4 |
| `{PRECO}` | API `/tickers/{ticker}` → `price` | 47,88 |
| `{VARIACAO}` | API → `change_pct` | +2,3 |
| `{DY}` | API → `dividend_yield` | 16,4 |
| `{PL}` | API → `pe_ratio` | 4,2 |
| `{MES}` | Date locale | abril |
| `{ticker_lower}` | ticker.toLowerCase() | petr4 |

## Tom de voz

- **Direto**: dados primeiro, opinião nunca
- **Útil**: sempre agrega valor, nunca spam
- **Confiável**: fontes oficiais (B3), sem "achismo"
- **Conciso**: menos é mais — 2-3 linhas no máximo
- **Modesto**: nunca diz "somos os melhores" — mostra e deixa o usuário decidir
