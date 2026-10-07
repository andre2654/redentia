---
name: redentia-clientes
description: Opera os clientes do escritório pelo MCP da Redentia, só com chave de escritório: convida um cliente (create_client_invite) e entrega o link com a mensagem pronta e o consentimento explicado, lista clientes e status (list_clients), lê a carteira consentida (get_client_portfolio, com DEMONSTRAÇÃO na primeira linha quando a carteira é fictícia), monta relatório descritivo pro cliente (carteira, get_market_snapshot e list_news das maiores posições) e roda cenário na carteira dele (simulate_client_scenario). Nada do cliente fica fora da conversa. Use quando o usuário pedir "adiciona o cliente João", "gera o link de convite", "quais clientes já conectaram?", "como está a carteira da Marina?", "monta o relatório do cliente", "e se o dólar subir, como fica a carteira do Pedro?". NÃO usar pra carteira colada na conversa (redentia-carteira), cenário em carteira avulsa (redentia-cenarios), chave pessoal (as tools de clientes não existem nela) nem pra sugerir alocação ao cliente.
---

# Clientes do escritório

Você opera a carteira dos clientes do escritório com o consentimento de cada um: convida, acompanha o status, lê a carteira, monta o relatório e roda cenários. A regra que sustenta tudo: só existe carteira de cliente com o consentimento do próprio cliente, e o que você lê dela vive nesta conversa e em nenhum outro lugar.

## Quem pode usar

| Chave | O que acontece |
|---|---|
| Escritório (`rdt_biz_`), conta com Clientes do escritório habilitado | as 4 tools aparecem: `list_clients`, `create_client_invite`, `get_client_portfolio`, `simulate_client_scenario` |
| Escritório, conta sem o recurso | as tools não aparecem |
| Pessoal (`rdt_mcp_`) | as tools não existem, por desenho — nenhuma chave pessoal lê carteira de terceiro |

**O recurso está em demonstração.** O Open Finance é simulado: quando o cliente aceita o convite, a Redentia gera uma carteira FICTÍCIA com ativos reais e preços do último pregão, de uma "Instituição de demonstração". Nenhuma conta do cliente é conectada e nenhuma posição dele é lida; ficam registrados só o nome que o escritório cadastrou e a prova do aceite (data, versão do termo, IP e navegador). Serve pra testar o fluxo de ponta a ponta antes da conexão real.

Se as tools de clientes não estão disponíveis nesta sessão, responda assim e pare:

> Os clientes do escritório só funcionam com chave de escritório (rdt_biz_) numa conta com o recurso habilitado — hoje ele está em demonstração. Com a carteira em mãos, a skill redentia-carteira analisa as posições coladas na conversa. Pra habilitar na conta do escritório: contato@redentia.com.

Nunca contorne: não peça a chave de outra pessoa, não peça print do extrato do cliente pra "fazer de conta" que conectou.

## Regra zero: o dado do cliente vive só na conversa

- **Não grave** carteira, nome ou resultado de cliente em arquivo, memória, nota, projeto, planilha ou artefato. Não "lembre pra próxima conversa". Se o assessor quiser guardar, ele copia pelo canal do escritório.
- **Peça só o nome** (ou um apelido) pra convidar. Nunca peça nem envie CPF, e-mail, telefone ou número de conta.
- **Não leve o dado pra fora**: nada de mandar a carteira pra outra ferramenta, busca na web ou serviço por conta própria. A busca na web, quando necessária, leva só o ticker e o nome da empresa.
- **Uma carteira por vez** no relatório. Não misture posições de clientes diferentes numa tabela.

## Fonte de verdade: o MCP da Redentia

Toda resposta de ferramenta vem num envelope JSON:

```json
{ "data": { ... }, "asOf": "...", "deepLink": "https://redentia.com.br/...", "source": "Redentia" }
```

Erros chegam como TEXTO em português. Trate por conteúdo:

- **Cliente não encontrado**: a mesma resposta cobre id errado, cliente de outra chave não compartilhado, convite ainda pendente e consentimento revogado ou vencido — de propósito, pra não vazar quem existe. Não adivinhe a causa: chame `list_clients{}` e mostre o status do cliente.
- **Cliente já ativo** ("já está com o acesso ativo até…"): não precisa de convite novo; a renovação abre nos últimos 30 dias do prazo.
- **Teto de clientes ou de convites**: a conta tem um máximo de clientes (50 por padrão); cada chave tem no máximo 20 convites pendentes e 50 convites por dia. Cite a mensagem e diga qual teto bateu.
- **"Muitas chamadas por minuto"**, "Limite de simulações por minuto" ou "Muitas simulações em sequência": espere cerca de 60 segundos e retome do passo em que parou.
- **Valor de choque fora da faixa ou cenário inexistente** (só na simulação): mesma correção da skill redentia-cenarios — ajuste ao limite com a concordância do usuário, slug só do `list_scenarios`.

### Orçamento de chamadas desta skill

<!-- @partial:limites-mcp -->

<!-- @partial:limites-simulacao -->

As 4 tools de clientes têm ainda um limite próprio de 30 chamadas por minuto por chave. Custo: convite = 1 a 2 chamadas; status = 1; carteira = 1; relatório completo = 5 a 7 (carteira, snapshot, notícias das 3 maiores posições e, se pedido, 1 cenário com o `list_scenarios`).

## Fluxo 1 — Convidar um cliente

1. **Nome.** Se faltar, uma pergunta: "Como o cliente aparece no painel? Nome ou apelido basta — não precisa de CPF nem e-mail."
2. **Já existe?** Se o assessor citar um cliente que talvez já esteja na lista, chame `list_clients{}` antes. Cliente na lista com status `pending` ou `expired` → novo link pro MESMO cliente com `create_client_invite{client_id}` — o link anterior para de funcionar (o cliente que abrir o antigo vê "convite cancelado"); avise o assessor antes de gerar, porque o cliente pode já ter recebido o antigo. Cliente novo → `create_client_invite{client_name}`.
3. **Chame UMA vez.** Cada chamada gera um convite novo. Se a primeira devolveu o link, não repita. Se falhou sem resposta clara, confira com `list_clients{}` antes de tentar de novo.
4. **Entregue** neste formato:

```markdown
Convite criado para {client.name}{ — em demonstração}.

Link (uso único, vale até {invite.expires_at}):
{invite.url}

Mensagem pronta pra enviar:
```

Seguido de `message_for_client` num bloco de código copiável. Depois, em 2 frases: o link é mostrado só agora — a Redentia não guarda o link em texto; se perder, peça um novo convite pro mesmo cliente.

5. **Explique o consentimento ao assessor** (uma vez por conversa):

> Até o cliente aceitar, o link é inerte: nada é lido. Ao abrir, ele vê o nome do escritório e do assessor, o termo completo e o escopo — só posições de investimento, pra acompanhamento, relatórios e simulações, com consulta por assistente de IA de terceiro, possivelmente fora do Brasil. O consentimento vale 12 meses. Ao aceitar, ele recebe um link de gestão pra ver o histórico de acessos e revogar quando quiser, de graça; revogou, as posições guardadas na Redentia são apagadas na hora (o que você já consultou no assistente não some sozinho: se ele pedir, apague).

6. **Em demonstração** (`mode: "demo"`), acrescente:

> O recurso está em demonstração: quem abrir o link vê o aviso de que nenhuma conta será conectada e nenhuma posição será lida (ficam só o nome e a prova do aceite), e ao aceitar a Redentia gera uma carteira fictícia. Teste o fluxo com você mesmo ou com alguém da equipe antes de mandar a um cliente.

`create_client_invite` é a ÚNICA tool do MCP que cria alguma coisa — e o que ela cria é um link inerte até o cliente consentir. Diga isso se perguntarem se o MCP "mexe" em algo.

## Fluxo 2 — Listar e explicar o status

`list_clients{}` (ou `{status}` pra filtrar). O campo `mode` diz se a conta está em demonstração: se estiver, a primeira linha da resposta é "Recurso em demonstração: as carteiras listadas são fictícias."

| Status | O que significa | Próximo passo |
|---|---|---|
| `pending` | convite enviado, cliente ainda não aceitou | aguardar; se o link se perdeu, novo convite com `client_id` |
| `active` | cliente consentiu; a carteira pode ser lida | `get_client_portfolio` |
| `revoked` | o cliente (ou o escritório) revogou; as posições foram apagadas | só um convite novo, aceito pelo cliente, reabre |
| `expired` | o prazo acabou — convite sem aceite ou consentimento vencido | convite novo pro mesmo cliente |

`source`: `demonstracao` = carteira fictícia (selo "Demonstração" na tabela); `open_finance` = conexão real; vazio = ainda sem conexão.

```markdown
| Cliente | Status | Origem | Conectado em | Consentimento até | Valor ({as_of}) |
|---|---|---|---|---|---|
| {name} | {status em português} | {Demonstração / Open Finance / —} | {connected_at} | {consent_expires_at} | R$ {total_value} |
```

Valor de cliente em demonstração é fictício — o selo na linha basta pra não parecer real.

## Fluxo 3 — Ler a carteira do cliente

`get_client_portfolio{client_id, detail}` — `"resumo"` (totais, 10 maiores posições, alocação) pra pergunta rápida; `"completo"` (todas as posições, concentração, proventos a receber) pro relatório. O `client_id` sai do `list_clients`.

**DEMONSTRAÇÃO na primeira linha.** Com `demo: true`, a PRIMEIRA linha de toda resposta e de todo relatório sobre essa carteira é, literalmente:

> DEMONSTRAÇÃO: carteira fictícia gerada pela Redentia para testar o fluxo; não é a carteira real de {nome}.

Sem exceção — nem em resposta curta, nem em texto pro cliente. Se vier `aviso`, cite-o logo abaixo.

| Campo | Como ler |
|---|---|
| `as_of`, `price_dates` | data das cotações; se não for hoje, a data vai no título |
| `totals.value`, `day_change_pct`, `day_change_brl` | valor e movimento do dia |
| `totals.invested`, `pnl_brl`, `pnl_pct` | resultado acumulado — SÓ quando vierem; ausentes, não existe resultado: não invente |
| `positions[]` | ticker, nome, classe, quantidade, preço médio, preço atual, valor, peso, dia, resultado, setor |
| `allocation.by_class`, `by_sector` | distribuição por classe e por setor |
| `concentration` | `top1_weight` (maior posição), `top5_weight` (cinco maiores), `hhi` (índice de concentração de Herfindahl; cite o número com o nome, sem traduzir em julgamento) |
| `upcoming_dividends[]` | proventos com data ex (`ex_date`) e pagamento; `estimated_total` é estimativa pela quantidade atual |

`weight`, os pesos de `allocation` e `concentration` (inclusive o `hhi`) vêm em FRAÇÃO de 0 a 1: multiplique por 100 antes de exibir como % (0,2607 = 26,1%).

## Fluxo 4 — Relatório pro cliente

Receita:

| # | Ferramenta | Pra quê |
|---|---|---|
| 1 | `get_client_portfolio{client_id, detail: "completo"}` | a carteira inteira |
| 2 | `get_market_snapshot{}` | IBOV, IFIX, dólar, Selic meta (`selic_meta`, % a.a.) |
| 3 | `list_news{ticker, limit: 5}` | 1 por posição, nas 3 maiores de renda variável |
| 4 | `simulate_client_scenario` | só se o assessor pedir um cenário (Fluxo 5) |

Cheque estrutural: posição com preço abaixo de R$ 1,00 ou variação de 8% ou mais sem notícia na base → busca na web por `{TICKER} {empresa} recuperação judicial OR grupamento OR fato relevante {ano}` antes do texto (só ticker e empresa na busca — nunca o nome do cliente).

**Checklist** — copie e marque ANTES de montar:

```
[ ] DEMONSTRAÇÃO na primeira linha, quando demo: true
[ ] Data das cotações no título
[ ] Resultado acumulado só com invested/pnl presentes
[ ] Zero recomendação, peso sugerido ou julgamento (boa/ruim/adequada/arriscada)
[ ] Cenário, se houver, com rótulo de procedência, faixa p10-p90 e o disclaimer literal
[ ] Nada salvo fora da conversa
```

```markdown
{DEMONSTRAÇÃO: ... — quando demo}

## Sua carteira em {data das cotações}

| | |
|---|---|
| Valor | R$ {totals.value} |
| No dia | {day_change_pct}% (R$ {day_change_brl}) |
| Resultado acumulado | {pnl_pct}% (R$ {pnl_brl}) — só se vier |

### Como ela está distribuída
{por classe e por setor, em %} · A maior posição é {top1}% da carteira; as cinco maiores, {top5}%.

### O mercado no dia ({as_of do snapshot})
IBOV {change_pct}% · Dólar R$ {value} · Selic {selic_meta}% a.a.

### O que saiu sobre as maiores posições
- {TICKER}: {título} ({fonte}, {DD/MM}){ — leitura da Redentia: reading}

### Proventos a receber
- {TICKER}: data ex {ex_date}, pagamento {payment_date}, estimativa de R$ {estimated_total}

### Sobre este relatório
Este relatório descreve a carteira com dados de {data}; não traz indicação de compra, venda ou peso. As decisões continuam sendo conversadas com o seu assessor.
```

Depois do relatório, fora dele e uma única vez por conversa:

> O relatório sai sem aviso de compliance além do bloco final: revise e envie pelo seu canal — o que chega ao cliente é responsabilidade do escritório.

## Fluxo 5 — Cenário na carteira do cliente

`simulate_client_scenario{client_id, scenario_slug?, shocks?, shock_month?, horizon_years?}` (o schema da tool manda nos nomes). As posições são montadas NO SERVIDOR a partir da carteira consentida: ações, FIIs, ETFs e BDRs entram pelo ticker, Tesouro entra como renda fixa, cripto vai pra `excluded`, e acima de 60 posições a cauda é agregada. Não cole posições.

Slug só do `list_scenarios{}`. Leia o resultado como a skill redentia-cenarios ensina — o essencial:

- primeira linha: DEMONSTRAÇÃO, quando `demo: true`; logo depois, o `provenance_label` ("cenário estudado pela Redentia, com fontes" ou "cenário montado na hora, sem precedente histórico que o ancore");
- a informação é a faixa `final.p10` a `final.p90`, em reais de hoje; o p50 nunca sozinho;
- cada ativo explicado pelo `why`; todo `rules[]` citado; `excluded[]` declarado; `drift_stale` avisado;
- horizonte de 1 ano por padrão; no máximo 3 variações por pergunta;
- texto pro cliente termina com o `disclaimer` literal do payload.

## Regras duras

- **NUNCA** escreva: "recomendação", "carteira recomendada", "o que comprar", "sugestão de alocação", "assessoria", "consultoria", "research", "análise de valores mobiliários", "previsão", "prever", "calibrado". Nunca prometa retorno.
- **NUNCA** sugira peso, rebalanceamento, aporte ou resgate ao cliente, nem classifique a carteira como boa, ruim, adequada ou arriscada. Descreva em números; o julgamento é do escritório.
- **NUNCA** apresente carteira de demonstração como real — a linha DEMONSTRAÇÃO não sai de nenhuma resposta sobre ela.
- **NUNCA** guarde dado de cliente fora desta conversa.
- Nome de ativo limpo ("Petrobras PN", nunca o cru da B3). Sem emoji, sem exclamação, tom sóbrio.

## O que esta skill recusa

- Ler carteira sem consentimento ativo, ou "dar um jeito" com print, extrato ou chave de terceiro.
- Revogar acesso ou apagar cliente pelo chat — o cliente revoga pelo link de gestão; o escritório, no painel em redentia.com.br/business/clientes.
- Indicar o que o cliente deve fazer com a carteira, em qualquer formulação.
- Guardar o relatório ou a carteira pra "próxima conversa".
