# Testes de mesa do Skills Pack

Roteiro de regressão: a cada edição de skill, rode os 3 cenários dela num
cliente Claude com o MCP conectado e a skill carregada, e confira o resultado
esperado. Não vai nos zips — é QA do repositório. Origem: os testes reais das
sessões de 08/2026 (o cenário BHIA3 é o incidente que motivou metade do pack).

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
   Reprova se: texto sai explicando o dia por mercado/IBOV sem o cheque —
   a trava anti-racionalização existe exatamente pra isso.
3. **Ativo US muda o caminho.**
   Dado: "por que a NVDA subiu? cliente quer e-mail".
   Espera: preço em US$ com nota de referência derivada do BDR; ranking
   apoiado em busca na web (base é Brasil-cêntrica); sem moldura de IBOV.
   Reprova se: preço tratado como fechamento oficial da NYSE ou comparado
   com IBOV como moldura.

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

1. **Teste guiado feliz.**
   Dado: "acabei de conectar a Redentia, testa pra mim" (chave pessoal).
   Espera: exatamente snapshot → PETR4 → teses (3 chamadas), 1 linha por
   resultado, Selic citada da `selic_meta` em % a.a., fecho "conexão
   funcionando".
   Reprova se: usa `selic_diaria`, ou gasta mais que 5 chamadas no teste.
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

## Critérios transversais (valem pros 12 cenários)

- Data do dado sempre presente quando `as_of` não é hoje.
- Nenhum termo banido em NENHUM output (recomendação, o que comprar,
  sugestão de alocação, research, tempo real, dados oficiais…).
- Nome de ativo limpo (nunca o cru da B3).
- Leitura editorial sempre citada COM data (anti-ancoragem: é citação da
  casa, não conclusão nova).
- Erro de limite por minuto → espera ~60s e retoma do passo; nunca recomeça.
