# Carteira: motor de avisos e a tela mais simples

Rascunho de 06/11/2026, para o dono aprovar antes de qualquer código.

Pedido do dono: os avisos precisam ser um motor de verdade, que nunca sugira vender
algo com sinal claro de alta ou que proteja a carteira e que procure sempre o
meio-termo, também na compra. Sem engenharia demais, reaproveitando o que já existe
(simulação, correlação, grafo da cadeia). A tela da carteira tem que perder
complexidade e passar robustez.

---

## Parte 1 · O motor de avisos

### O caminho, em quatro passos

1. **Fotografia.** A carteira do dia, com a data de cada fonte (posições, transações,
   cartão, proventos). Se o dado está velho, o motor para aqui e o único aviso é
   "reconecte o Nubank".
2. **Achados.** Um detector por tipo de aviso, uma função pura com teste. O detector
   só constata um fato com número, e a maioria dos avisos para aqui.
3. **Movimentos.** Só quando o achado pede ação. O motor monta poucos candidatos, do
   mais leve para o mais pesado, e simula cada um na carteira de antes e na de
   depois.
4. **Vetos e escolha.** Sai o candidato que melhora o objetivo sem piorar o resto e
   que não bate em nenhum veto. Na dúvida, o veto ganha.

### Detectores da primeira leva (8)

| Família | Detector | Exemplo de frase |
|---|---|---|
| Conexão | fonte velha ou caída | "O Nubank não atualiza desde 16/07. Reconecte para eu voltar a olhar." |
| Imposto | isenção de R$ 20 mil no mês | "Você já vendeu R$ 18,7 mil em ações em novembro. Mais R$ 1.300 e paga imposto." |
| Imposto | DARF possível | "Em fevereiro você vendeu R$ 154 mil em ações. Se houve lucro, o DARF venceu em março." |
| Imposto | prejuízo a abater | "Você tem ~R$ 3,7 mil de prejuízo em FII para abater do próximo lucro." (regra a conferir) |
| Proventos | o que cai e o que caiu | "Segunda caem R$ 301 de GARE11 e HSML11." |
| Renda × gasto | cobertura da vida | "Seus investimentos pagaram R$ 1.015 em outubro, 10% dos seus gastos." |
| Risco | concentração e fator | "32% está num ativo só. 43% sofre se os juros longos subirem." |
| Custo | taxa de ETF ou fundo | "Existe um ETF do mesmo índice com taxa 0,1 ponto menor." |

Cada detector devolve o que achou, o valor em R$ em jogo, até quando vale, a
confiança, os números de prova e a ação possível (ver, simular ou perguntar).

### Movimentos candidatos, do mais leve ao mais pesado

1. Direcionar o próximo aporte ou o provento recebido. Não vende nada e não paga
   imposto.
2. Trocar só uma parte, dentro da isenção do mês.
3. Vender só o excesso, nunca "venda tudo".

Cada candidato passa pelo motor de simulação que já existe (`MonteCarloEngine`,
`ScenarioEngineService`, `PortfolioBetaService`, `BondCashFlows`,
`FiiReceivablesCatalog`). A saída tem quatro números: a renda nova, o risco nos
cenários ruins, a concentração e o imposto.

### Vetos

**Não sugere vender quando**
- o ativo tem sinal claro de alta: tese ativa positiva ou catalisador pendente, nota
  da Redentia no quartil de cima, ou preço acima da média de 200 dias com alta maior
  que a do IBOV em 6 meses;
- o ativo protege a carteira: correlação negativa com o resto, ou fator oposto ao do
  bloco maior (ouro, dólar, petróleo quando o resto sofre com eles);
- o imposto da venda é maior que o ganho do movimento;
- a compra foi há menos de 30 dias;
- a posição é pequena demais para fazer diferença.

**Não sugere comprar quando**
- o ativo tem sinal de queda: tese negativa, nota baixa ou queda contínua;
- o dividendo parece armadilha: payout acima de 100%, DY alto só porque o preço caiu,
  ou histórico de corte;
- reforça um fator que já passa do limite, ou anda junto com o maior bloco da
  carteira;
- é fornecedor ou cliente de uma empresa que a pessoa já tem muito (vem do grafo da
  cadeia, `SupplyChainService`);
- a liquidez é baixa.

Os limites numéricos de cada veto ficam numa tabela de configuração versionada e não
espalhados no código.

### O que já existe e o que falta

- **Já existe:**
  - simulação de cenários, Monte Carlo e beta da carteira;
  - fluxo de títulos e recebíveis de FII;
  - nota da Redentia e rankings (dividendos, Bazin, Graham, "nunca deu prejuízo");
  - teses com catalisadores, cadeia de fornecimento e receita por país (FRE 1.7);
  - fatores e correlações;
  - transações de investimento.
- **Falta ou está quebrado:**
  - correlação: hoje cobre 34 de 171 pares. O motor calcula a de 1 ano direto dos
    preços guardados, para todo ativo, inclusive FII, ETF e Tesouro;
  - `ticker_factor_tags`: AUPO11 (LFT) está marcado como sensível a juros longos, e o
    Tesouro IPCA+ está sem tag;
  - sinal de alta e queda: uma função só, que junta tese, nota e preço contra a média
    de 200 dias. Não é previsão, serve só de veto;
  - gastos: as transações de conta e cartão já são baixadas da Pluggy
    (`listAccountTransactions`), mas só os proventos são guardados. O resto precisa
    ser guardado, tirando o pagamento de fatura, as transferências entre contas
    próprias e as aplicações. O gasto entra como média de 3 meses. Falta conferir se
    o consentimento do site cobre conta e cartão;
  - renda separada de rendimento: o AUPO11 acumula e não paga provento. "Caiu na
    conta" e "rendeu" aparecem separados.

### Para não virar engenharia demais

- Sem IA decidindo e sem modelo de previsão. As regras são fixas e testadas, e a IA no
  máximo melhora o texto, com um conferente garantindo que todo número da frase está
  no cálculo.
- Uma tabela nova, `avisos`, com o estado de cada aviso (novo, visto, resolvido,
  adiado) e a chave que impede repetição.
- Um comando que roda a cadeia por carteira. Quando ele roda é decisão do dono
  ("nada roda sozinho").
- Uma fonte única para todos os canais (`GET /me/avisos`): carteira, Início, app,
  widget, Atividade ao Vivo, WhatsApp e e-mail, cada um com o próprio limite.
- Prioridade dada por R$ em jogo × urgência × confiança. Um aviso no destaque e até
  cinco na lista. Sem nada a avisar: "Tudo normal. Sigo de olho.", com o que foi olhado.

### Testes

- Carteiras sintéticas por cenário:
  - sem Open Finance, conexão caída, uma conta parada;
  - carteira pequena, grande, só renda fixa, só cripto, só FII;
  - fim de semana, feriado da B3 e primeiro dia de uso;
  - DARF no início do mês, dezembro, abril e maio;
  - queda forte real e cotação atrasada.
- Replay dos últimos 6 meses da carteira do dono, para ver o que teria avisado e
  quando.
- Teste de propriedade: nenhum movimento sugerido fura um veto, e nenhum aviso sai
  sem prova.

### Ordem

1. **Base:** correlação calculada dos preços, tags consertadas, a função de sinal, os
   gastos guardados, a reconexão e a atualização diária (esta com o OK do dono).
2. **Achados de fato:** conexão, imposto, proventos e renda × gasto.
3. **Movimentos com simulação e vetos.**
4. **Canais:** app, WhatsApp e e-mail.

---

## Parte 2 · A tela da carteira, mais simples

### Hoje

A tela tem 7 seções, 14 partes e 4,7 mil linhas de componente:
- **topo:** valor, gráfico, losango, perguntas e o botão Ideias;
- **Daqui a 5 anos:** quebrado em produção, porque falta a rota `/me/carteira/futuro`;
- **posições;**
- **No mundo;**
- **Na cadeia;**
- **Proventos e Contas;**
- **Análise completa:** desempenho, Raio-X da IA, movimentações, P&L mês a mês e o
  banner do MCP.

Problemas:
- **Dois lugares dizem "preste atenção"** com regras diferentes: o modal Ideias, com os
  achados do front, e o Raio-X, com a análise da IA de outra data.
- **O front calcula sozinho:** achados, mundo e cadeia saem de 3 utils próprios.
- **A cadeia faz uma chamada por empresa.** A tela carrega em pedaços, cada um com um
  esqueleto, e o mesmo número pode sair diferente em dois lugares.
- **Nenhuma seção diz de quando é o dado.**

### Princípio: quatro perguntas, nessa ordem

1. **Como está o meu dinheiro?** O topo da noite: valor, dia, losango, gráfico e uma
   linha de frescor ("Atualizado hoje, 9h · Nubank, XP").
2. **O que pede a minha atenção?** Os avisos do motor. O botão do topo continua
   (decisão do dono), mas passa a se chamar "Avisos · 3", e o estado do topo carrega o
   aviso só quando ele é urgente. Sem aviso: "Tudo normal. Sigo de olho."
3. **Do que ele é feito?** Uma seção só, "Onde está o seu dinheiro", com quatro lentes
   na mesma área: Ativos (as posições), Mundo, Cadeia e Riscos (fatores e
   correlação). Uma lente aberta por vez, e o globo vira uma das lentes.
4. **Quanto ele te paga?** Renda × gasto, proventos do mês e o futuro de 5 anos, numa
   seção só, já que tudo isso é tempo e renda.

Depois disso, fechada como hoje, a "Análise completa": desempenho, movimentações e P&L.
As Contas saem da página e vão para as conexões, com o frescor no topo. O Raio-X da IA
e o banner do MCP saem da página: o Raio-X vira uma das fontes do motor, e o MCP já
está no painel de chat.

Resultado: 4 seções e uma dobra, contra 7 seções e 14 partes. O momento assinatura
continua sendo só o losango do topo.

### Técnica que passa robustez

- **Um payload só:** `GET /me/carteira/visao`, montado no backend pelo motor, traz o
  topo, os avisos, as lentes, a renda e o futuro, com `as_of` por fonte e uma versão.
  O front só desenha. Somem os utils que calculam no browser e as N chamadas da cadeia.
- **Quatro estados por bloco, sempre:**
  - carregando (esqueleto);
  - pronto;
  - parcial (diz o que falta, por exemplo "3 empresas sem receita por país");
  - indisponível (o bloco some, nunca com zero falso).
- **Invariantes testadas no backend:**
  - a soma das posições é igual ao patrimônio do topo;
  - o mundo e os fatores somam 100%;
  - os proventos do mês são iguais à soma da lista;
  - o mesmo número é igual em todo lugar em que aparece.
- **Frescor visível:** cotação pendente (a proteção do dia falso já existe), fonte
  velha e data da análise.
- **Desempenho:**
  - o que está abaixo da dobra carrega quando chega perto da tela;
  - o globo para quando sai da tela;
  - o SSR entrega o topo e os avisos já prontos.
- **"Como calculei"** em cada número que importa: um toque mostra a conta e a fonte.

### Ordem da tela

1. **Arrumar:** tirar Contas, Raio-X e banner; juntar Posições, Mundo e Cadeia nas
   lentes; juntar Proventos e Futuro na renda. O endpoint e os dados não mudam.
2. **`/me/carteira/visao`** no backend, com as invariantes e o frescor, trocando os
   fetches do front.
3. **Avisos do motor** entrando no botão e no estado do topo, à medida que os
   detectores ficam prontos.

Cada passo com 3 variações no dev (`?query`), prints e escolha do dono antes de
seguir.

## Decisões pendentes do dono

- **Atualização diária:** ligar a atualização automática das conexões?
- **Reconexão:** reconectar o Nubank no site.
- **Opções de compra:** no site, só por tipo de ativo ou com nome também? (A regra da
  CVM; no app o risco já foi aceito.)
- **IR:** conferir as regras do imposto mínimo e da compensação de prejuízo numa fonte
  antes das frases.
- **Página:** Contas fora da página e Raio-X substituído pelo motor.

---

## Parte 3 · Plano para tornar real (06/11/2026)

A tela mockada foi aprovada ("agora ficou legal"). O mapa do backend (só leitura) diz o que já existe e o que falta.

### O que já existe e vamos reaproveitar

| Peça | Onde está |
|---|---|
| Posições B2C | `portfolio_positions` (com `maturity`, `indexer`, `last_synced_at`) |
| Transações de investimento B2C | `portfolio_trades` (BUY/SELL/DIVIDEND/JCP/INCOME/TAX, com data, quantidade e preço) |
| Espelho B2B | `business_client_positions` e `business_client_transactions` via `ClientPortfolioReader` |
| Proventos anunciados | `ticker_dividends_si` via `PortfolioSnapshotService::upcomingDividendsForHoldings` |
| Preços diários | `market_prices`, `ticker_historical_prices_si` (~5 anos), `tesouro_direto_historical_prices_si` |
| Simulação | `ScenarioEngineService::run(['positions' => [...], 'positions_b' => [...], 'horizon_years' => 5])`, que devolve séries p10–p90 em R$, impacto por posição e a comparação A × B |
| Fatores | `ticker_factor_tags` (seeder com `TICKER_OVERRIDES`) |
| Cadeia e receita por país | `SupplyChainService::forTicker` e `GET /revenue-geography` |
| Teses | `investment_theses` (conviction 0–100, tickers) e `thesis_conviction_snapshots` |
| Nota da Redentia | `RankingService` (calculada na hora, sem percentil guardado) |

### O que falta

- **Rota:** não existe nada em `/me/carteira/*`, nem o `futuro` que o front já chama.
- **Gastos:** `SyncPluggyConnectionJob` baixa as transações da conta e joga fora tudo que não é provento. O cartão nunca é buscado.
- **Sincronização:** nada agenda a sincronização do B2C.
- **Correlação:** cobre só ETF contra o índice de referência e os 10 maiores papéis de cada ETF.
- **Sinal de alta ou queda:** não existe (média de 200 dias, percentil da nota, tese ativa).
- **Preço médio:** não é reconstruído a partir das transações. Bonificação e desdobramento chegam crus.
- **Simulação de renda:** o motor de simulação devolve o valor da carteira, não a renda mensal.

### As levas

**Leva 0 · A base (backend, sem mudar nada visível)**
1. **`GastosDaConta`:** a tabela `pluggy_account_transactions`, com usuário, conexão, conta, `external_id` único, data, valor, descrição, categoria da Pluggy e o tipo dela.
   - O sync guarda tudo da conta (BANK) e passa a buscar também o cartão (CREDIT), nos últimos 90 dias.
   - Cada linha leva marcas calculadas: transferência entre contas próprias, pagamento de fatura e aplicação ou resgate.
   - Antes de tudo, conferir se o consentimento do site cobre conta e cartão.
2. **`PrecoMedio`:** reconstrói o custo pelas `portfolio_trades` (e pelas transações B2B).
   - Bonificação e desdobramento entram como evento, nunca como compra a R$ 0.
   - Devolve o custo e um selo de "conhecido" ou "desconhecido".
3. **Fatores consertados:** override versionado no `TickerFactorTagsSeeder` (AUPO11 = Selic; Tesouro IPCA+ = juros longos), aplicado por comando.
4. **`CorrelacaoDaCarteira`:** correlação de 1 ano calculada na hora dos preços guardados, para os papéis da carteira, com cache de 1 dia. Cobre ação, FII, ETF e Tesouro.
5. **`SinalDoAtivo`:** usa só dados que já temos (preço contra a média de 200 dias, retorno de 6 meses contra o IBOV, percentil da nota no universo do ranking, conviction da tese ativa). Devolve "alta", "queda" ou "neutro" e o motivo. Serve só aos vetos.

**Leva 1 · O motor e a rota**
- **Classes em `App/Services/Avisos/`:**
  - `FotografiaDaCarteira`: monta a carteira a partir do B2C ou do B2B, com o frescor de cada fonte.
  - `Detector` (interface `detectar(Fotografia): array<Aviso>`) e os 8 detectores da primeira leva.
  - `Portao` (frescor, completude, sanidade, linguagem), `Vetos` e `Priorizador`.
  - `Movimentos`: simula o candidato com `ScenarioEngineService::run` na carteira de antes e na de depois (`positions_b`).
- **Limites e regras:**
  - Os limites de cada veto e de cada detector ficam em `config/avisos.php`, versionados.
  - As regras de imposto citam a fonte (Lei 11.033/2004, art. 3º; IN RFB 1.585/2015) e são conferidas antes de ir ao ar.
- **A tabela `carteira_avisos`:**
  - Colunas: dono (usuário ou cliente), chave de dedupe, detector, estado (novo, visto, resolvido, adiado), payload, primeira e última vez visto, `resolvido_em`, `adiado_ate`.
  - Ela guarda só o estado. O aviso é recalculado a cada leitura.
- **As rotas:**
  - `GET /me/carteira/visao` devolve o contrato de `types/carteiraVisao.ts`. É calculado no pedido, com cache de 10 minutos por pessoa e invalidado quando o sync termina. A tela não depende de agendamento ("nada roda sozinho").
  - `PATCH /me/carteira/avisos/{chave}` recebe `{ estado: 'resolvido' | 'adiado' }`.
  - `GET /me/carteira/futuro` é o mesmo motor, com os caminhos (ver abaixo).
- **Os caminhos de 5 anos:** o motor de simulação devolve o valor. A renda de cada cenário sai do valor × o DY de cada classe (proventos dos últimos 12 meses ÷ valor médio), com a origem do número dita na nota. Os três caminhos são `positions` hoje, o meio-termo em `positions_b` e o aporte em `aporte_mensal`, se o motor aceitar; senão, uma soma simples documentada.

**Leva 2 · O front de verdade**
- **Composable `useCarteiraVisao`:** busca no SSR com o Bearer, como o `useCarteira`. O mock continua só no dev (`?cenario=`).
- **"Já sei" e "adiar":** passam a gravar no `PATCH`.
- **Saída por bandeira:** primeiro só para o dono, depois para todos. A tela antiga sai depois de duas semanas sem problema, junto com `CarteiraIdeias`, `CarteiraRaioX` na carteira, `CarteiraProventosContas`, `CarteiraFuturo` e `utils/achadosDaCarteira.ts`.

**Leva 3 · Os testes que garantem**
- **Backend:** testes de feature em `tests/Feature/Avisos/` no Postgres de teste, com fixtures por cenário:
  - sem Open Finance, conexão caída;
  - carteira pequena, só renda fixa, só FII;
  - fim de semana e feriado;
  - DARF no início do mês, dezembro, abril e maio.
- **Contas e vetos:**
  - teste de propriedade: nenhum movimento sugerido fura um veto, e nenhum aviso sai sem prova;
  - as invariantes: posições = patrimônio, fatores = 100%.
- **Replay:** os últimos 6 meses de uma carteira real, numa fixture anonimizada local fora do git, para ver o que o motor teria dito e quando.
- **Front:** os testes de hoje (`tests/carteira-visao.test.ts`) passam a rodar contra respostas gravadas do endpoint.

**Leva 4 · Os canais** (depois): Início, app, widget, Atividade ao Vivo, WhatsApp e e-mail, lendo `/me/carteira/visao` ou a tabela de avisos. Esta é a única leva que precisa de agendamento, então só com o OK do dono.

### Ordem e tamanho (estimativa)

| Leva | O que entrega | Tamanho |
|---|---|---|
| 0 | Gastos guardados, preço médio, fatores, correlação, sinal | 3–4 dias |
| 1 | Motor, `carteira_avisos`, `/me/carteira/visao` e `futuro` | 4–5 dias |
| 2 | Tela real atrás de bandeira, primeiro só para o dono | 2 dias |
| 3 | Fixtures por cenário, replay, propriedades | junto com 1 e 2 |
| 4 | Canais | depois |

Cada leva vira um PR no backend (andre2654/redentia-api) e outro no front, só com o OK do dono e com prints.

### Decisões do dono antes da Leva 0
1. **Sincronização diária:** ligar a do B2C (um agendamento no `routes/console.php`)? Sem ela, a tela mostra "parado desde" e vira o aviso de reconexão, o que é honesto mas fica velho.
2. **Reconexão:** reconectar o Nubank no site, porque a conexão ficou órfã em 28/10.
3. **Cartão e conta:** buscar as transações do cartão e da conta (consentimento e privacidade). Sem isso, não existe "renda × gasto".
4. **Regras de imposto:** conferir as regras de IR numa fonte antes de as frases irem ao ar.
5. **Carteira do dono:** a dele está mais nova no espelho Business. Juntar as duas fotografias por pessoa é a Leva 0 ou fica para depois?
