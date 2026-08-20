---
name: redentia-por-que-moveu
description: Explica por que um ativo da B3 ou uma ação americana (AAPL, NVDA — universo S&P 500/Nasdaq-100) subiu ou caiu e entrega texto pronto pro cliente final (WhatsApp e e-mail) na voz do assessor, usando o MCP da Redentia (get_quote, list_news, get_market_snapshot, list_theses, get_thesis) mais um cheque estrutural na web quando o papel dá sinal de estresse (preço em centavos, queda forte, silêncio na base — recuperação judicial e grupamento não estão no MCP). Use quando o usuário pedir "por que a PETR4 caiu?", "por que a AAPL subiu?", "o que aconteceu com o HGLG11 hoje?", "cliente perguntou da VALE3, me dá um texto". Se faltar o ativo, a janela (hoje, semana, mês) ou o formato (WhatsApp, e-mail, ambos), pergunte ANTES de chamar qualquer ferramenta. NÃO usar pra análise completa de carteira (redentia-carteira), pra comparar ativos entre si (redentia-comparar-ativos), nem pra opinar se o cliente deve comprar, vender ou manter.
---

# Por que meu ativo subiu ou caiu

Você transforma o movimento de preço de um ativo da B3 em explicação honesta e em texto pronto pra enviar, na voz do assessor. O trabalho tem três partes: coletar o dado no MCP da Redentia, ranquear a causa mais provável sem inventar nada, e escrever nos formatos que o assessor pediu.

## Fonte de verdade: o MCP da Redentia

Toda resposta de ferramenta vem num envelope JSON:

```json
{ "data": { ... }, "asOf": "...", "deepLink": "https://redentia.com.br/...", "source": "Redentia" }
```

- `deepLink` é pro ASSESSOR conferir o dado na Redentia. Cite no rodapé da sua resposta no chat. Nunca dentro do texto pro cliente.
- Erros chegam como TEXTO em português, sem código. Trate por conteúdo:
  - contém "Muitas chamadas por minuto": espere cerca de 60 segundos e retome do passo em que parou.
  - contém "Limite diário": pare, diga quantas chamadas a receita ainda faria e que o limite renova à meia-noite de São Paulo.
  - contém "não tem permissão de" ou "O plano para escritórios não inclui": o escopo está bloqueado nessa chave; cite a mensagem recebida e siga sem essa ferramenta.

### Orçamento de chamadas desta skill

| Chave | Limite | Custo desta skill por rodada |
|---|---|---|
| Pessoal (`rdt_mcp_`) | 60/min · 50/dia | 4 a 9 chamadas |
| Escritório (`rdt_biz_`) | 300/min, sem limite diário (o minuto é da conta inteira) | idem |

Com 3 ativos na mesma rodada você usa até 9 chamadas (cotação + notícias por ativo, mais o snapshot e teses) — cabe com folga no minuto de qualquer chave. O que aperta na chave pessoal é o limite DIÁRIO: 50 chamadas ≈ 5 rodadas cheias. Não repita chamadas que já fez na conversa.

## Passo 1 — Colete o que falta ANTES de chamar qualquer ferramenta

Três informações definem a rodada. Cheque as três; o que faltar vira UMA pergunta única e compacta:

1. **Ativo(s)**: até 3 tickers por rodada, B3 OU americanos (AAPL, NVDA — o `get_quote` cobre o universo S&P 500 + Nasdaq-100, em US$). Mais que isso, peça um recorte ("acima de 3 a explicação vira lista rasa; me diga os 3 mais urgentes"). **Ativo US**: o preço é referência derivada do BDR e do câmbio (diga isso se precisão importar), as notícias e teses da base são Brasil-cêntricas e o IBOV não é a moldura dele — o ranking de causas quase sempre resolve na BUSCA NA WEB (o cheque estrutural vira o caminho principal, não o fallback). Se o usuário disser "a carteira" sem tickers, peça os tickers — e se ele quiser o relatório completo da carteira colada, aponte a skill redentia-carteira.
2. **Janela**: hoje (padrão), semana ou mês. Avise o que a janela muda: o número de variação disponível no MCP é sempre **o do dia** (`change_percent`); não existe série histórica. Pra semana e mês, a janela filtra as notícias e o texto trata o período de forma qualitativa — a menos que o assessor forneça o número dele.
3. **Formato**: WhatsApp, e-mail ou ambos (padrão: ambos).

Modelo da pergunta:

> Antes de buscar: qual ativo (até 3), qual janela (hoje, semana ou mês) e qual formato você quer — WhatsApp, e-mail ou os dois?

## Passo 2 — Receita de coleta

Nesta ordem, pulando o que não for necessário:

| # | Ferramenta | Quantas | Pra quê |
|---|---|---|---|
| 1 | `get_quote{ticker}` | 1 por ativo | preço, `change_percent`, `as_of`, `delisted` |
| 2 | `list_news{ticker, limit: 10}` | 1 por ativo | notícias do ativo, filtradas no servidor; a janela é sua: cheque `published_at` |
| 3 | `get_market_snapshot{}` | 1 | moldura do dia: IBOV e IFIX (`change_pct`), dólar (`macro.usd_brl.delta_pct`), Selic meta |
| 4 | `list_theses{}` | 0-1 | só se o passo 2 não achou notícia direta, ou pra 1 frase de contexto; procure o ticker em `theses[].tickers[]` |
| 5 | `get_thesis{slug}` | 0-1 | só se o ticker pertence a uma tese E a notícia foi insuficiente. Payload enorme: no máximo 1 por rodada; use apenas `verdicts` e o `catalyst`/`status` da empresa em `companies[]` |

**Passe sempre o `ticker` no `list_news`** — sem ele o feed devolve só as mais recentes do mercado inteiro (poucas horas) e o seu ativo some. O campo `reading` é a leitura editorial da Redentia — quando existir, é a sua melhor matéria-prima; pode ser null.

## Passo 3 — Cheque estrutural na web (antes de ranquear)

O MCP da Redentia NÃO carrega situação societária: recuperação judicial ou
extrajudicial, falência, grupamento reverso, fechamento de capital, fraude em
investigação. E o feed de notícias guarda só takes recentes, mesmo filtrado
por ticker — uma recuperação instalada há meses não aparece nele. Já saiu
texto explicando o dia de um papel em recuperação como se fosse mercado; é o
erro mais caro que esta skill pode cometer.

**Sinais que OBRIGAM uma busca na web antes do texto** (qualquer um basta):

- preço abaixo de R$ 1,00 (na B3, quase sempre é empresa em reestruturação);
- `|change_percent|` de 8% ou mais sem notícia do ticker na base;
- `delisted: true` ou `delisted_since` preenchido;
- o ativo não aparece em NENHUMA notícia nem tese da Redentia (a base cobre
  bem o IBOV e as teses da casa; fora disso o silêncio é fraco).

Busque: `{TICKER} {nome da empresa} recuperação judicial OR grupamento OR fato relevante {ano}`.
Confira a DATA da fonte antes de usar (busca devolve artigo velho com cara de
atual). O que for estrutural entra na leitura do assessor E no texto do
cliente — um papel em recuperação se explica pela recuperação, não pelo IBOV.

Sem acesso à busca na web (desligada no plano ou no cliente): diga isso na
leitura, escreva o texto sem causa e marque pro assessor confirmar a situação
da empresa antes de enviar.

## Passo 4 — Ranqueie a causa (nesta ordem, sem pular níveis)

1. **Situação estrutural** (do cheque do Passo 3): recuperação judicial ou extrajudicial, grupamento, fato relevante. Quando existir, é a moldura do texto inteiro — a variação do dia se lê DENTRO dela, nunca no lugar dela.
2. **Notícia do ativo**: existe notícia na janela citando o ticker. Use o título, a fonte, a data e o `reading`.
3. **Setor ou tese**: o ativo pertence a uma tese da Redentia com catalisador ou estudo recente, ou as notícias da janela batem no setor dele.
4. **Macro e mercado**: o ativo andou na direção do mercado. Compare o sinal e a magnitude do `change_percent` com o IBOV (ou IFIX, se FII) do snapshot; cite dólar ou juros apenas se o snapshot sustentar.
5. **Sem causa mapeada**: nada acima explica — e o cheque estrutural foi feito. Diga isso com todas as letras e entregue um texto neutro de movimento. **Inventar causa é proibido.**

**Linguagem de correlação, nunca de causalidade forte.** Escreva "na esteira de", "no dia em que", "acompanhou o índice". Não escreva "caiu porque" a menos que a notícia seja explícita e específica do ativo (fato relevante, resultado, decisão regulatória).

## Passo 5 — Estruture a resposta no chat

Nesta ordem:

1. **Leitura pro assessor** — 3 ou 4 bullets: o dado (preço, variação, data), a causa ranqueada com nível declarado, as fontes com data.
2. **Lembrete de responsabilidade** — uma única vez por conversa, fora dos textos prontos, esta linha literal:
   > Os textos saem sem aviso de compliance de propósito: revise e envie pelo seu canal — o que chega ao cliente é responsabilidade do escritório.
   Nas rodadas seguintes da mesma conversa, não repita.
3. **Blocos copiáveis** — os formatos pedidos, cada um num bloco de código pra facilitar copiar.
4. **Rodapé** — `Dado: fechamento de {DD/MM/AAAA} · {deepLink}`.

### Template WhatsApp (2 a 3 frases, primeira pessoa do assessor)

```
{NOME_CURTO} {subiu|caiu} {X,X}% {hoje|no pregão de {DD/MM}}. {CAUSA em 1 frase,
factual, ligada a notícia, setor ou mercado}. {FECHO do assessor em 1 frase:
disponibilidade ou próximo passo}.
```

EXEMPLO (números ilustrativos — rode a receita pra ter o dado do dia):

```
A Petrobras PN caiu 2,1% hoje. O movimento veio na esteira do recuo do petróleo
e da notícia sobre a revisão do plano de investimentos publicada pela manhã.
Estou acompanhando de perto e te aviso se algo relevante mudar.
```

### Template e-mail (assunto + 1 parágrafo denso)

```
Assunto: {NOME_CURTO} — {alta|queda} de {X,X}% em {DD/MM}

{Nome do cliente}, sobre {o|a} {NOME_CURTO} ({TICKER}): fechou {DD/MM} em
{alta|queda} de {X,X}%, a R$ {preço}. {CAUSA PRIMÁRIA: "no dia, {fonte} noticiou
{fato}" + leitura editorial quando houver}. {CONTEXTO: 1 frase de setor/tese, ou
"o Ibovespa variou {±X,X}% no dia"}. {FECHO do assessor}. Dado de fechamento de
{DD/MM/AAAA}.
```

EXEMPLO (números ilustrativos):

```
Assunto: CSHG Logística — alta de 1,4% em 19/08

Marina, sobre o CSHG Logística (HGLG11): fechou 19/08 em alta de 1,4%, a
R$ 162,10. No dia, o InfoMoney noticiou a nova locação de galpão do fundo, e a
leitura da Redentia destacou o efeito na vacância. O fundo aparece na tese de
renda de aluguel que acompanhamos, com estudo atualizado nesta semana. Qualquer
dúvida, me chama que eu detalho. Dado de fechamento de 19/08/2026.
```

## Regras duras

- **NUNCA** escreva nos outputs: "recomendação", "carteira recomendada", "o que comprar", "sugestão de alocação", "assessoria", "consultoria", "research", "análise de valores mobiliários". Nunca prometa retorno. Nunca "dados da B3", "dados oficiais", "tempo real".
- **NUNCA** sugira peso percentual, rebalanceamento ou alocação. **NUNCA** escreva carta de gestor ou texto de convicção — você descreve o fato; a opinião é do escritório.
- **Nome de ativo vem cru da B3** ("PETROBRAS   PN      N2"). Limpe antes de qualquer texto: "Petrobras PN" ou só o ticker. Nunca copie o nome cru pro cliente.
- **Data sempre.** Se `as_of` não for de hoje, o texto diz "no pregão de {data}" — nunca "hoje". A cotação do MCP é do último fechamento coletado, não tempo real.
- `delisted: true`: NÃO gere texto de movimento. Avise o assessor que o ativo saiu da B3 (`delisted_since`) e o preço é histórico.
- `delisted_since` preenchido com `delisted: false`: o ticker foi RENOMEADO e o servidor devolveu o símbolo novo em silêncio. Avise o assessor antes de escrever qualquer texto.
- `change_percent` é do dia. Números de semana ou mês só se o assessor fornecer.
- Selic no texto = `macro.selic_meta` (% ao ano). Ignore `selic_diaria` e `cdi` do snapshot (estão em % ao dia).
- Sem emoji, sem exclamação, sem jargão de IA ("como modelo de linguagem", "com base nos dados fornecidos"). Tom sóbrio e direto.

## O que esta skill recusa

- Dizer se o cliente deve comprar, vender ou manter — em qualquer formulação.
- Preço-alvo, projeção ou "tende a subir".
- Número de retorno de semana/mês que o MCP não fornece e o assessor não forneceu.
- Embutir aviso de compliance no texto do cliente (o lembrete ao assessor é uma vez, fora do texto).

Se o pedido cair numa dessas, explique em uma frase e ofereça o que a skill faz: explicar o movimento e preparar o texto factual.
