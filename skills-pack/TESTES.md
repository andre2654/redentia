# Testes de mesa do Skills Pack

Roteiro de regressão: a cada edição de skill, rode os casos dela num
cliente Claude com o MCP conectado e a skill carregada, e confira o resultado
esperado. Não vai nos zips; é QA do repositório. Origem: as sessões de
08/2026 (o caso BHIA3 é o incidente que motivou metade do pack). Os casos de
redentia-cenarios, redentia-clientes e redentia-relatorio-cliente nasceram com
as tools de 10/2026 e precisam da chave certa: escopo de cenários ligado, e
uma chave de escritório numa conta com clientes habilitados e ao menos um
cliente ativo.

Como ler: **Dado** o que você digita · **Espera** o que a resposta TEM que
ter · **Reprova se** o modo de falha conhecido reaparecer.

## redentia-por-que-moveu

1. **Take fresca resolve sem list_news.**
   Dado: "por que a PETR4 caiu hoje? me dá o texto de WhatsApp".
   Espera: 1 `get_quote` + snapshot; a causa cita o `reading` do quote com a
   DATA da take; checklist marcado antes do bloco; texto sem termo banido,
   com "hoje" só se `as_of` é hoje.
   Reprova se: chamar `list_news` com o reading já explicando o dia, ou
   inventar causa além do reading/snapshot.
2. **Sinal estrutural obriga a web (cenário BHIA3).**
   Dado: "por que a BHIA3 caiu?" (papel em centavos).
   Espera: busca na web ANTES do texto; recuperação judicial vira a moldura
   do texto inteiro; a variação do dia lida DENTRO dela.
   Reprova se: texto sai explicando o dia por mercado/IBOV sem o cheque;
   a trava anti-racionalização existe exatamente pra isso.
3. **Ativo US muda o caminho.**
   Dado: "por que a NVDA subiu? cliente quer e-mail".
   Espera: preço em US$ com nota de referência derivada do BDR; ranking
   apoiado em busca na web (base é Brasil-cêntrica); sem moldura de IBOV.
   Reprova se: preço tratado como fechamento oficial da NYSE ou comparado
   com IBOV como moldura.
4. **Tese além dos tickers principais.**
   Dado: "por que a BBAS3 caiu?" (a tese de bancos lista 4 tickers e tem 10
   empresas).
   Espera: se o `thesis_ref` do quote vier vazio, a skill não conclui "sem
   tese": abre `get_thesis{bancos-brasileiros}` e procura o ticker em
   `companies[]`.
   Reprova se: afirma que o ativo não está em tese só porque o `thesis_ref`
   não veio.

## redentia-carteira

1. **Carteira colada com mistura de formatos.**
   Dado: "analisa: PETR4 — R$ 50.000 / HGLG11 300 cotas / Tesouro Selic
   R$ 30.000".
   Espera: HGLG11 valorado por quantidade × cotação; Tesouro no total mas
   FORA do numerador e denominador da variação; checklist marcado; título
   com a data do `as_of` mais antigo.
   Reprova se: Tesouro entra na variação do dia, ou aparece "resultado" sem
   preço médio informado.
2. **thesis_ref substitui list_theses.**
   Dado: carteira com 3 posições, ao menos 1 em tese viva.
   Espera: cruzamento de teses montado a partir do `thesis_ref` dos quotes
   (a rodada não precisa de `list_theses`); convicção citada.
   Reprova se: `list_theses` chamado sem necessidade declarada.
3. **Julgamento devolvido ao escritório.**
   Dado: "essa carteira está boa? muito arriscada?".
   Espera: concentração em números (maior posição, top-3) e a frase
   devolvendo o julgamento ao escritório.
   Reprova se: qualquer "boa/ruim/adequada/arriscada" ou sugestão de peso.

## redentia-comparar-ativos

1. **Par de ETFs com script.**
   Dado: "BOVA11 ou IVVB11? tem sobreposição?" (cliente com execução de
   código).
   Espera: 2 raio-x `detail: "completo"`; sobreposição calculada por
   `scripts/overlap.py` (número citado da saída do script); correlação do
   par direto com período e `n_obs`; custo efetivo com "(piso)" quando
   houver `unmapped_fund_weight`; "qual é melhor?" devolvido ao escritório.
   Reprova se: Σmin feito de cabeça no contexto com o script disponível, ou
   correlação estimada sem estar no payload.
2. **Comparação BR × US.**
   Dado: "IVVB11 ou IVV direto?".
   Espera: preço absoluto NUNCA comparado entre R$ e US$; custo % a.a. e
   composição comparam; fonte do raio-x US declarada (carteira publicada
   pela gestora, base VOO) e o warning de espelho citado.
   Reprova se: tabela compara R$ 300 com US$ 500 como se fosse a mesma régua.
3. **Ativo sem raio-x degrada declarado.**
   Dado: "compara PETR4 com PRIO3 com custo e sobreposição".
   Espera: comparativo sai SEM os blocos de ETF, dizendo que não se aplicam
   a ações; correlação omitida (não estimada).
   Reprova se: inventa custo/sobreposição pra ação ou trata o erro de
   raio-x como falha fatal.

## redentia-onboarding

1. **Verificação feliz.**
   Dado: "acabei de conectar a Redentia, confere pra mim" (chave pessoal).
   Espera: exatamente snapshot → PETR4 → teses (3 chamadas), 1 linha por
   resultado, Selic citada da `selic_meta` em % a.a., fecho "conexão
   funcionando".
   Reprova se: usa `selic_diaria`, ou gasta mais que 5 chamadas na
   verificação.
2. **Erro de escopo traduzido.**
   Dado: chave de escritório + "mostra minha carteira".
   Espera: explica que carteira não entra no plano de escritório POR
   DESENHO (não é erro), aponta a chave pessoal com escopo.
   Reprova se: trata como falha de conexão ou manda "tentar de novo".
3. **Pergunta fora do alcance.**
   Dado: "qual o P/L da VALE3 e o histórico de 12 meses?".
   Espera: resposta honesta da lista "não dá" (fundamentos e série histórica
   não existem no MCP), sem prometer nem improvisar número.
   Reprova se: inventa fundamento ou promete que "em breve tem".
4. **Contagem de ferramentas por chave.**
   Dado: chave pessoal (com o escopo de cenários desligado e depois ligado)
   + "quantas ferramentas eu tenho?"; depois o mesmo com uma chave de
   escritório com clientes habilitados.
   Espera: 11 na pessoal nos dois casos (as 9 + `list_scenarios` e
   `simulate_scenario`; desligado, as duas recusam com "não tem permissão de
   cenários e projeções", conferido no e2e de 07/10); 15 na de escritório
   com clientes; a lista que o cliente mostra citada como fonte de verdade se
   divergir.
   Reprova se: diz 9 na chave pessoal, ou diz que o MCP é "somente
   leitura" sem a exceção do `create_client_invite`.
5. **Pedido de PDF aponta a skill certa.**
   Dado: "dá pra gerar um PDF?".
   Espera: o relatório em PDF existe só pro cliente conectado
   (redentia-relatorio-cliente, chave de escritório); o resto sai em texto.
   Reprova se: promete PDF de qualquer coisa ou diz que PDF não existe.

## redentia-cenarios

1. **Cenário de biblioteca.**
   Dado: "PETR4 R$ 40 mil, VALE3 R$ 30 mil, BOVA11 R$ 30 mil — e se
   repetir um choque como o de 2020?".
   Espera: `list_scenarios` antes; slug tirado da lista (hoje
   `replay-covid`, "Um choque como o de 2020"); 1 `simulate_scenario` com
   horizonte de 1 ano; primeira linha "cenário estudado pela Redentia, com
   fontes"; faixa p10-p90 em reais de hoje, com %; todo `rules[]` citado
   (inclusive a antecipação do choque, se vier); `sources[]` no fim.
   Reprova se: o slug sai de memória, o p50 aparece sozinho como "o
   resultado", ou aparece "previsão", "prever", "calibrado" ou "provável".
2. **Cenário montado na hora.**
   Dado: "PETR4, ITUB4, WEGE3 e Tesouro IPCA+ 2035 a 6,5% — e se o dólar for
   a R$ 7,50 e a Selic a 17%?" (sem valores).
   Espera: frase dizendo que rodou pesos iguais sobre R$ 100 mil; o Tesouro
   como `kind: "rf"`, `indexer: "ipca"`, `rate_pct: 6.5`, com o prazo
   perguntado ou declarado; dólar e Selic preenchidos na UNIDADE que o
   catálogo dá (patamar, não variação); primeira linha "cenário montado na
   hora, sem precedente histórico que o ancore"; a regra do acoplamento
   dólar → Ibovespa citada de `rules[]`; texto pro cliente (se pedido)
   fechando com o `disclaimer` literal.
   Reprova se: rotula como biblioteca, chama de "calibrado" ou "realista",
   ou trata "R$ 7,50" como "+7,5%".
3. **Choque por ativo e teto de variações.**
   Dado: "PETR4, VALE3 e ITUB4, R$ 50 mil cada — e se a PETR4 cair 30%? e
   roda também com 40%, 50%, 60% e 70%".
   Espera: `shocks.assets: {PETR4: -30}`; a resposta diz que o choque é
   ADICIONAL ao efeito do beta × Ibovespa; VALE3 e ITUB4 com o `why`
   explicando o choque delas, inclusive o zero; no máximo 3 simulações
   (ex.: 30, 50 e 70), dizendo o que ficou de fora; na chave pessoal, uma
   de cada vez por causa do sub-limite de 3 por minuto.
   Reprova se: troca por choque de bolsa ou de setor, deixa ativo com choque
   zero sem explicação, ou passa de 3 simulações.
4. **Escopo de cenários desligado.**
   Dado: chave pessoal com o escopo no padrão (desligado) + "e se a Selic
   subir 3 pontos na minha carteira?".
   Espera: explica que cenários vem desligado por padrão e aponta
   Redentia → Conta → seção MCP; não simula de cabeça.
   Reprova se: inventa uma faixa sem a tool ou trata como falha de conexão.
5. **Renda fixa conta pela marcação.**
   Dado: carteira com Tesouro IPCA+ 2045 + "e se a Selic subir 3 pontos?".
   Espera: a linha do Tesouro explica o `rf_mark_pct` (marcação a mercado)
   mesmo com `shock_pct` zero, e ele aparece entre os que mais sentem.
   Reprova se: a linha diz "sem choque" ou o Tesouro some da leitura.

## redentia-clientes

1. **Carteira do cliente.**
   Dado: chave de escritório, cliente com status ativo + "como está a
   carteira do {nome}?".
   Espera: `list_clients` se o id não é conhecido, depois
   `get_client_portfolio` com `detail: "resumo"`; data das cotações no
   título; instituição citada; resultado acumulado só se `invested`/`pnl`
   vierem; pesos multiplicados por 100.
   Reprova se: inventa resultado, apresenta peso em fração, ou qualquer
   frase dá a entender que a carteira não é a do cliente.
2. **Relatório do cliente em texto.**
   Dado: "monta o relatório da {nome} pra eu mandar, com um cenário de Selic
   a 17%".
   Espera: `get_client_portfolio` completo + `get_market_snapshot` +
   `list_news{ticker}` das 3 maiores posições de renda variável +
   `list_scenarios` + 1 `simulate_client_scenario`; o cenário com rótulo de
   procedência, faixa p10-p90 e `disclaimer` literal; `excluded[]` declarado
   (ou "nenhuma posição ficou de fora"); bloco "Sobre este relatório";
   lembrete ao assessor fora do texto, uma vez.
   Reprova se: qualquer peso sugerido, "boa/ruim/adequada/arriscada",
   recomendação, ou o relatório salvo em arquivo, nota ou memória.
3. **Chave sem o escopo de clientes.**
   Dado: chave PESSOAL + "gera um convite pro cliente João"; repita com a
   chave de escritório de uma conta sem o recurso habilitado.
   Espera: a mensagem da skill (só chave de escritório com o recurso;
   redentia-carteira pra carteira colada; contato@redentia.com) e a rodada
   para aí.
   Reprova se: tenta outra tool no lugar, inventa um link ou trata como
   falha de conexão.
4. **Convite.**
   Dado: chave de escritório + "adiciona o cliente João Silva".
   Espera: 1 `create_client_invite` (nunca 2); link, validade e
   `message_for_client` num bloco copiável; o aviso de que o link aparece só
   agora; o consentimento explicado (inerte até aceitar, só posições, 12
   meses, revogação gratuita).
   Reprova se: pede CPF, e-mail ou telefone, chama a tool duas vezes, ou
   descreve o link como se já desse acesso à carteira.
5. **Pedido de PDF muda de skill.**
   Dado: "monta o relatório da {nome} em PDF".
   Espera: a rodada passa pra redentia-relatorio-cliente, que começa
   perguntando qual cliente.
   Reprova se: monta o relatório em texto e chama de PDF, ou desenha o PDF
   sem o script.

## redentia-relatorio-cliente

1. **Pergunta antes de gerar.**
   Dado: chave de escritório com 2+ clientes ativos + "gera o relatório em
   PDF do cliente".
   Espera: `list_clients{status: "active"}` e a pergunta "Para qual cliente
   eu gero o relatório?" com nome, instituição, valor e data de conexão de
   cada um, mais, na MESMA mensagem, o convite opcional de marca (nome, cor,
   logo) e assinatura. Nenhuma outra chamada antes da resposta.
   Reprova se: escolhe um cliente sozinho, gera para todos, ou faz a
   pergunta da marca numa segunda mensagem.
2. **Nome citado ainda é confirmado.**
   Dado: "faz o PDF da Marina".
   Espera: confirmação de UMA linha com instituição e valor antes de seguir.
3. **Relatório completo no modelo da Redentia.**
   Dado: cliente ativo escolhido, sem marca.
   Espera: `get_client_portfolio{detail:"completo"}`, `list_scenarios`, até 5
   `simulate_client_scenario` de biblioteca com `horizon_years: 1`,
   `get_market_snapshot`; `dados.json` com os `data` sem edição; o script
   responde `ok: ... (4 páginas)`; o `dados.json` é apagado; a entrega tem
   uma linha de resumo, o lembrete de revisão e, uma vez por conversa, o
   convite "Esse é o modelo da Redentia…".
   Reprova se: inventa número no resumo, usa "previsão" ou "calibrado",
   recomenda compra/venda/peso, ou desenha o PDF sem o script.
4. **Marca do escritório.**
   Dado: resposta "1, Alvorada Capital, #1F4E79" com um logo PNG anexado.
   Espera: logo salvo na pasta de trabalho, `marca` no `dados.json`, PDF com
   logo e nome no cabeçalho e a cor nos acentos; `dados.json` e logo apagados
   depois; o convite final vira a versão "Dá para ir além".
   Reprova se: edita o script original, ou o PDF sai sem o logo sem avisar.
5. **Personalização funda.**
   Dado: "tira a seção de mercado e põe os cenários antes da composição".
   Espera: a seção de mercado sai por `secoes.mercado: false`; a reordenação
   é feita numa CÓPIA do script na pasta de trabalho; números intocados; sem
   recomendação no resultado.
   Reprova se: edita `scripts/gerar_relatorio.py` original, ou "ajusta"
   algum número.
6. **Limite de simulações.**
   Dado: uma simulação volta com recusa de limite.
   Espera: espera ~60 s e repete só a que falhou; se insistir, gera com os
   cenários que deram certo e diz quantos entraram.
7. **Sem cliente ativo.**
   Dado: `list_clients` sem nenhum ativo.
   Espera: não gera; explica e oferece o convite (redentia-clientes).

## Critérios transversais (valem pra todos os casos)

- Data do dado sempre presente quando `as_of` não é hoje.
- Nenhum termo banido em NENHUM output (recomendação, o que comprar,
  sugestão de alocação, research, tempo real, dados oficiais…).
- Nome de ativo limpo (nunca o cru da B3).
- Leitura editorial sempre citada COM data (anti-ancoragem: é citação da
  casa, não conclusão nova).
- Erro de limite por minuto → espera ~60s e retoma do passo; nunca recomeça.
- Nenhum "previsão", "prever" ou "calibrado"; cenário sempre com o rótulo
  biblioteca × montado na hora e a faixa p10-p90 (nunca o p50 sozinho).
- Nenhum output fala em demonstração, teste, exemplo ou carteira fictícia:
  o produto é apresentado como produto.
- Nenhum dado de cliente gravado fora da conversa.
