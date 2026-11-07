# Run state: carteira nova real, motor de avisos, relatório e limpeza do chat/Raio-X

Started: 2026-11-07  |  Integrador: sessão principal  |  Last updated: 2026-11-07

Todo agente desta execução lê este arquivo antes de começar e escreve nele antes de terminar, na sua linha da tabela e nas seções de fatos e de pendências.
Se a execução for interrompida, é este arquivo, e não a conversa, que leva o trabalho adiante.

Plano de produto: `docs/specs/carteira-motor-de-avisos.md` (Partes 1 a 5, com as decisões do dono de 06 e 07/11).

## Definition of Done

> Fonte do DoD: **derivado** do objetivo. O dono disse em 07/11: "pode seguir com tudo, pra já terminar tudo, pode demorar". O escopo são as levas da Parte 4.7 e a auditoria da Parte 5 do plano.

| # | Critério | Status | Evidência |
|---|----------|--------|-----------|
| 1 | Chat sem MAX: `fix/chat-sem-max` no remoto, PR para `main`, CI verde | VERIFIED | chat #9 (4bd9e9f), CI verde, 401 testes locais, 529 no CI |
| 2 | Chat sem Raio-X e sem sobras de tier: `chore/chat-sem-raiox`, montada sobre `feat/ia-paga` + `fix/chat-sem-max`. Sem geração de Raio-X, sem trava MAX e sem contadores. Typecheck e testes verdes, PR aberto. `feat/ia-paga` com PR aberto e CI verde | VERIFIED (falta a revisão do 13) | chat #10 ia-paga (7a709a9), CI verde; chat #11 (f773d21), CI verde, 526 no CI. O #11 tirou também ~730 linhas de auto-research do MAX em `agent.ts`, mais `intent-classifier.ts` e `forceProposeOnFirstIter`: a revisão precisa confirmar que era código morto |
| 3 | MCP sem `reading`/Raio-X em `get_portfolio`: PR aberto, CI verde | VERIFIED | mcp #14 (35281b3), CI verde, 49 → 50 testes |
| 4 | Backend `feat/plano-unico` atualizado com `main`, PR aberto, CI na contagem-base | VERIFIED | api #21 (b3fb3db): o CI dá 1366 testes OK e PHPStan limpo, igual à base local |
| 5 | Backend `fix/dia-pendente`: PR aberto, CI na contagem-base | VERIFIED | api #22 (ed26dc0): o CI dá 1245 OK, a main +6; os 6 testes novos falham no código antigo (−20,28 em vez de null) |
| 6 | Backend limpeza (`chore/sem-raiox-e-tiers`, sobre plano-unico). Saem: o POST de análise, o `reading` do MCP, as métricas `raiox_*`/`has_xray` do admin, `PlanSeeder`, `RequiresLimit`/`RequiresFeature`, `check-and-increment` e `analyses_deleted`. O GET de análise fica só leitura e a tabela fica. Suíte sem falha nova, PR aberto | VERIFIED (falta a revisão do 13) | api #23 (a4ba8ef, base feat/plano-unico): o CI dá 1362 OK (−4: testes do que saiu) e PHPStan limpo. Ficam `basic_chat_daily`/`max_chat_daily`, porque o chat em produção lê `limits.max_chat_daily`, e o `UsageCounterService`, que monta o `usage` |
| 7 | Leva 0, a base (em `feat/carteira-motor`). Transações de conta e cartão guardadas com marcas. Preço médio. Fatores consertados. Correlação robusta. Sinal de alta ou queda. DY de 12 meses. Sync diário do B2C agendado, com flag desligada. Testes | TODO | |
| 8 | Motor e rotas: `GET /me/carteira/visao`, `PATCH /me/carteira/avisos/{chave}`, imposto (mês atual e anterior, grupos, histórico com selo), os detectores aprovados, portão, prioridade, vetos e a flag de usuários. Testes por cenário e execução com a carteira real local | TODO | |
| 9 | Relatório `GET /me/carteira/relatorio`. Indicadores (lista no ledger) contra o benchmark composto, nota pela mediana dos pilares. Testes com resposta conhecida e execução com a carteira real local | TODO | |
| 10 | Motor de recomendação. Avaliador (renda, correlação, país, fator, look-through, imposto, taxa, cenários), candidatos e vetos novos. Avisos 13, 14, 15, 16, 20 e 21 com texto dentro da regra da CVM. Testes | TODO | |
| 11 | Canais e preferências. Tópicos novos. Comandos `carteira:semana`, `carteira:proventos-mes`, `carteira:provento-pago` e `carteira:relatorio-mensal` (e-mail e WhatsApp com opt-in), agendados com flag desligada, com o dry-run conferido. Avisos 17 e 19 | TODO | |
| 12 | Front. Raio-X e sobras de tier fora. A tela nova lê o `/me/carteira/visao` real (SSR, esqueleto, flag). Seções de imposto e relatório. Preferências em /conta e no modal. `npm test` verde. Prints com a carteira real (backend local + fixture) | IN-PROGRESS | 12a feito: `6ff5e22f`. Saíram o Raio-X do front e o tier do chat; 515 testes verdes; o vue-tsc ficou nos mesmos 114 erros antigos; o grep do portão ficou vazio |
| 13 | PRs de tudo, com revisão independente em 2 lentes e sem achado bloqueante. Ordem de merge escrita. **Nada mesclado nem em produção sem o clique do dono** | TODO | |

## Decision ledger

| Data | Decisão | Por quê | Onde |
|------|---------|---------|------|
| 07/11 | **Merge e deploy são do dono.** Abrimos PR, esperamos o CI e revisamos. O `gh pr merge` fica com ele, um por vez (a Vercel publica fora de ordem) | Merge na `main` = deploy automático (CD de api, chat e mcp; Vercel no front). Regras da memória: `auto-mode-barra-deploy-e-cd`, `pr-so-com-aprovacao-do-dono`, `vercel-merges-seguidos-...` | esta linha |
| 07/11 | **PRs autorizados** pelo "pode seguir com tudo", dado em resposta a "posso abrir o PR?" | O dono | conversa |
| 07/11 | **Nada dispara sozinho.** Todo comando agendado novo tem flag de config com padrão `false`, e o envio real só sai com `--confirm`. Sem flag ligada, o agendamento não envia nada | `nada-roda-sozinho-sem-o-dono`; enviar para terceiro é parada obrigatória | config/notifications.php e config/carteira.php |
| 07/11 | **Base dos branches do backend: `feat/plano-unico`** (b3fb3db, já com a `main`). PRs empilhados, com base `feat/plano-unico`. Quando ele entrar, o GitHub redireciona para `main` | `/me/carteira/*` precisa da trava `assinatura:carteira` e do `/me/carteira/futuro`, que só existem nele | Backend |
| 07/11 | **Branches do backend:** `feat/carteira-motor` (critérios 7, 8, 10, 11), `feat/carteira-relatorio` (9), `chore/sem-raiox-e-tiers` (6). Worktrees em `_fable-worktrees/be-<nome>` | Separar o que é independente | Backend |
| 07/11 | **Postgres de teste por agente:** `<nome>-pg`, rede `<nome>-net`, imagem `redentia-php-test`, receita da memória `backend-suite-local-docker` | `RefreshDatabase` num banco compartilhado apaga o teste do vizinho | — |
| 07/11 | **Contagem-base do CI do Backend:** medir na base antes de mudar. Vale o delta (testes, falhas, PHPStan); a falha antiga da DataHealth não conta | `backend-ci-ja-falha-antes-de-voce` | — |
| 07/11 | **Push:** `gh auth switch --user andre2654` antes. `git -C <caminho>` em vez de `cd` | memória | — |
| 07/11 | **Front:** continua em `feat/chat-painel` (worktree `Frontend-wt-chat-painel`), PR com base `redentia-v2`. Dev server só o de :3471 nesta worktree | `redentia-branch-alvo-dos-prs`, `dois-dev-servers-mesma-worktree` | Front |
| 07/11 | **Chat:** PR 1 `fix/chat-sem-max` → main; PR 2 `feat/ia-paga` → main; PR 3 `chore/chat-sem-raiox` (= merge de ia-paga + sem-max + limpeza) → main, mesclado por último | Evitar conflito em `intake.ts` | chat-service |
| 07/11 | **Flag da tela nova (servidor):** `config('carteira.visao_usuarios')`, env `CARTEIRA_VISAO_USUARIOS`, lista de user ids ou `*`, padrão vazio. Fora da lista: `404 {"error":"visao_desligada"}`, e o front mostra a tela antiga | Sair primeiro só para o dono (user 3) sem precisar de deploy do front | Backend + front |
| 07/11 | **Raio-X:** a tela para de mostrar. O POST e a geração saem. O GET e a tabela `portfolio_analyses` **ficam**. Apagar a tabela é parada obrigatória e vai em PR futuro com o dono | Apagar dado é irreversível | — |
| 07/11 | **`limits` do `/me/entitlements` mantém o formato** (o app do iPhone decodifica). Só saem os middlewares, a rota e o seeder sem uso | Não quebrar o app (o dono cuida dos apps) | — |
| 07/11 | **Texto dentro da regra da CVM:** nunca "compre/venda/recomendamos/vale a pena". Movimento = "se trocar X por Y, muda A → B (simulação)", com o lado ruim. Variante `site` (sem ticker no movimento, só a classe) e `app` (com ticker). O `/visao` do site usa `site`. O teste de linguagem faz parte do portão | CVM; decisão do dono (só o app aceita "Ações recomendadas") | `App\Services\Avisos\Textos` |
| 07/11 | **Imposto:** regras da memória `ir-regras-conferidas-out-2026`: DARF 6015, vencimento no último dia útil do mês seguinte (antecipa), isenção ≤ R$ 20 mil por mês em ações à vista, FII 20%, ETF 15% sem isenção, JCP 17,5% retido. O aviso só fala do mês atual e do anterior | Decisão do dono | `App\Services\Carteira\Imposto` |
| 07/11 | **Provento:** soma sempre depois da dedupe `ScrapeDividends::resolve` (R1–R4 + R7). Ajustar desdobramento pelos `ticker_splits_si`. FII com o provento somado de volta no dia ex | memórias `dividendos-duplicados-si-b3`, `b3-desdobramento-ajuste-de-preco`, `fii-dia-ex-...` | — |
| 07/11 | **Correlação:** Spearman dos retornos diários de 252 pregões (preço ajustado por desdobramento, FII com provento de volta), com `n_obs` na prova. Menos de 60 pregões = sem correlação | Um dia extremo (26/10) inflava o Pearson | `CorrelacaoDaCarteira` |
| 07/11 | **Benchmark do relatório:** composto pelas classes da carteira e recalculado por mês. RF/LFT/CDB/Tesouro/ETF de RF = CDI; ação e ETF de ação BR = IBOV; FII = IFIX; BDR e ETF exterior = IVVB11 (se não houver série, IBOV, dito na nota). IBOV e CDI puros também saem | Decisão do dono (07/11, "sim") | `Relatorio` |
| 07/11 | **Nota da carteira:** indicador → 0–100 por faixas fixas documentadas. Pilares: retorno, risco, eficiência, diversificação. Pilar = mediana dos seus indicadores. Nota = mediana dos 4 pilares. Com menos de 12 meses de histórico: `historico_curto = true` | Decisão do dono (07/11, "pode ser") | `Relatorio` |
| 07/11 | **Fixture real local:** a carteira do dono (B2B cliente 15 mais o histórico B2C do user 3) e os dados de referência dos tickers dele, exportados **só lendo** a produção para `scratchpad/fixture-dono/` (fora do git). Importador local em Docker. Serve à verificação real (8, 9, 10, 12) | Verificar com dado real sem escrever na produção | ver Interface contracts |
| 07/11 | **Fixture, o mapeamento:**<br>• o dono é o user 3 local, com as 22 posições do B2B (06/11);<br>• os trades são os do B2C até 31/05 (990) mais os do B2B desde 01/06 (273), num total de 1.263;<br>• o provento B2B INTEREST vira JCP, DIVIDEND ou INCOME pelo `ticker_dividends_si` do mesmo dia;<br>• o `price` fica nulo, como no B2C (o unitário vai em `raw.value`);<br>• o preço médio segue a regra do sync do B2C;<br>• o raw passa sem CPF nem conta;<br>• o token é por agente (`FIXTURE_NOME`) | Real, sem escrever na produção | fixture-dono/README.md |
| 07/11 | **Canais:** tópicos novos em `NotificationPreferenceController::TOPICS`: `carteira_semana`, `carteira_proventos_mes`, `carteira_provento_pago`, `carteira_relatorio`, `carteira_imposto`, `carteira_ideias`. WhatsApp desligado sem opt-in (`whatsapp_opt_in_at` + preferência). E-mail sem linha = desligado (opt-in explícito) | Lista de opt-in pedida pelo dono | Backend + /conta |
| 07/11 | **Scaffold da carteira nova** em `19a33ab` (feat/carteira-motor): config/carteira.php, o middleware `carteira.visao`, o grupo /me/carteira com âncoras e o teste unitário. O feat/carteira-relatorio parte dele (fast-forward) | Os dois branches não brigam por arquivo | Backend |
| 07/11 | **O `wipe` continua apagando as análises do usuário** (privacidade, enquanto a tabela existir). Vale mais que a sugestão da auditoria | LGPD | `PortfolioController::wipe` |
| 07/11 | **O score determinístico fica** e alimenta o modal das Ideias da tela antiga. Os tipos passam a ser `CarteiraScoreVM`/`ScoreMetricVM`; o campo `raiox` e o `buildRaioX` mantêm o nome | Menor diff; a tela antiga segue até a flag virar `*` | `useCarteira.ts`, `types/carteira.ts` |
| 07/11 | **O front não manda mais `tier`.** O chat-service assume basic quando falta | Sobra do MAX | `useNuChat.ts` |
| 07/11 | **Página da carteira nova:** topo → Onde está → Quanto ele te paga → Imposto do mês → "Ver o relatório completo" (fechado: indicadores, desempenho, movimentações com selo de imposto, P&L). A "Análise completa" vira o relatório | Pedido do dono, mantendo a página curta | Front |

## Verified facts

| Fato | Como foi rastreado | Âncora |
|------|--------------------|--------|
| O `main` de api, front, chat e mcp não tem PR aberto (07/11) | `gh pr list` nos 3 repos | — |
| `feat/plano-unico` = b3fb3db (merge limpo da main 821ea03) | `git merge` local | Backend-wt-plano-unico |
| O front `feat/chat-painel` contém `feat/plano-unico-carteira-home`, está 160 commits na frente e 2 atrás da `redentia-v2` | `git rev-list` / `merge-base` | Frontend |
| O chat-service em produção (`origin/main` f3c0c48) já não manda "trocar pra MAX" no prompt Basic. O MAX sobra só no tier fixo por sessão e no gate do `intake.ts` | leitura de `personas.ts` e `intake.ts` em origin/main | chat-service |
| `portfolio_trades.pluggy_connection_id` é `nullOnDelete`: desconectar não apaga histórico | migration 2026_05_09_120000 | Backend |
| `SyncPluggyConnectionJob` baixa as transações da conta e descarta o que não é provento; nunca busca cartão; nada agenda o sync do B2C | Explore 06/11 | `app/Jobs/SyncPluggyConnectionJob.php` |
| `EtfXrayService` já achata ETF dentro de ETF (look-through) | leitura | `app/Services/EtfXrayService.php:183` |
| `macro_prices` tem PTAX, Selic, IPCA e Brent (`macro:ingest` diário) | `routes/console.php` | Backend |
| `ScenarioEngineService::run(['positions'=>…, 'positions_b'=>…, 'horizon_years'=>5])` aceita carteira arbitrária e devolve p10–p90 em R$ | Explore 06/11 | `app/Services/Simulation/ScenarioEngineService.php` |
| `NotificationPreferenceController`: canais email/whatsapp × tópicos, com descadastro assinado | leitura | `app/Http/Controllers/Api/NotificationPreferenceController.php` |
| O front aceita backend local por `NUXT_BACKEND_URL` | `nuxt.config.ts:40,94,325` | Front |
| **A fixture real está pronta**: `scratchpad/fixture-dono/` (README, `importar.php`). São 39 tabelas e 768 tickers (carteira + histórico + BOVA11/IVVB11/LFTS11 + os papéis dentro de 9 ETFs). O import leva 6,7 s. As 22 posições do user 3 somam R$ 644.967,39 (= o B2B). O `/api/portfolio`, o `/composition` e o `/me/carteira/futuro` respondem 200 com token | migrate de 163 migrations + import num pg novo + curl | fixture-dono/README.md |
| Códigos: índices `^BVSP` (IBOV) e `IFIX.SA` (IFIX), mais 18 `*.SA`, todos desde 02/01/2024. Macro: `selic` em % a.a. diária (SGS 11; 13,65 em 06/11), `ipca` em % ao mês (SGS 433), `ptax` em R$/US$ e `brent` em US$. **Não há série de CDI: use a Selic.** Tesouro: BRSTNCNTB7T1 = `tesouro-ipca-2032`, BRSTNCNTB666 = `tesouro-ipca-2040`, BRSTNCNTB476 = `tesouro-ipca-2050` | exportação só leitura | fixture `_manifest.json` |
| O B2B do dono foi sincronizado de novo em 06/11 14:43, com os mesmos valores | exportação | — |
| O `/me/carteira/futuro` (plano-unico) deixa de fora os 3 Tesouro IPCA+ por "taxa desconhecida", mas o nome traz a taxa ("IPCA + 6,97%") | rodando sobre a fixture | `CarteiraFuturoController` |
| A queda de 26/10 (IBOV −13,88%, circuit breaker depois do 2º turno) é real | 3 fontes jornalísticas + `indices/IBOV/prices` | — |

## Interface contracts

| Com | Forma / contrato | Combinado | Status |
|-----|------------------|-----------|--------|
| Front ↔ Backend `/me/carteira/visao` | `app/types/carteiraVisao.ts` (`CarteiraVisao`) **mais** `imposto: ImpostoVisao`, `indicadores: IndicadorResumo[]` (no máximo 6, do relatório) e `geradoEm: string`. O backend é dono do formato: se precisar mudar, muda o TS no mesmo PR do front e anota aqui | 07/11 | assumido |
| `ImpostoVisao` | `{ mesAtual: MesImposto, mesAnterior: MesImposto, historico: MesHistorico[] }`. `MesImposto = { mes:'2026-11', grupos: [{ grupo:'acoes'|'fii'|'etf'|'rf'|'cripto', vendido:number, lucro:number|null, isencao:number|null, cabeAinda:number|null, impostoEstimado:number|null, aliquota:number, custoConhecido:boolean, nota:string }], darf: { valor:number|null, vence:'2026-12-30'|null, codigo:'6015' } }`. `MesHistorico = { mes, vendas:number, selo:'isento'|'pago'|'a_conferir'|'custo_desconhecido'|'sem_venda', operacoes: [{ data, ticker, nome, lado:'compra'|'venda', quantidade, valor, grupo }] }` | 07/11 | assumido |
| `PATCH /me/carteira/avisos/{chave}` | body `{ estado: 'visto'|'resolvido'|'adiado', dias?: number }` → `200 { chave, estado, adiadoAte }`. A chave vem em `Aviso.id` | 07/11 | assumido |
| `GET /me/carteira/relatorio` | `{ periodo:{inicio,fim,dias,historicoCurto}, benchmark:{nome, composicao:[{indice,peso}], notas:string[]}, retorno:{twr,mwr,cagr,real}, indicadores:[{chave,nome,valor,unidade:'%'|'x'|'R$'|'',pilar:'retorno'|'risco'|'eficiencia'|'diversificacao',nota,bench:number|null,descricao,comoCalculei}], pilares:[{chave,nome,nota}], nota:number, series:{carteira:[{t,v}], benchmark:[{t,v}], cdi:[{t,v}], ibov:[{t,v}]}, geradoEm }`. Indicadores: twr, mwr, cagr, retorno_real, volatilidade, downside_deviation, max_drawdown, beta, r2, sharpe, sortino, treynor, alpha_jensen, m2, information_ratio, tracking_error, appraisal_ratio | 07/11 | assumido |
| `Aviso` (PHP → JSON) | o do TS, mais `pergunta: string` (a dúvida que ele responde) e `canais: ('tela'|'email'|'whatsapp')[]`. Detector sem pergunta e sem saída não vira aviso | 07/11 | assumido |
| Fixture real local | `scratchpad/fixture-dono/*.json`, uma tabela por arquivo (linhas cruas). `importar.php` roda no container contra o `<nome>-pg` depois do `migrate`. O dono vira o user id **3** local, com as posições e transações do B2B (cliente 15) como se fossem do B2C, mais o histórico B2C até 31/05. O token Sanctum local é criado pelo importador e gravado em `scratchpad/fixture-dono/token.txt` (só local) | 07/11 | assumido |
| Serviços da base (PHP) | `App\Services\Carteira\{FotografiaDaCarteira::doUsuario(int): Fotografia, PrecoMedio::calcular(array $trades, array $eventos): array, CorrelacaoDaCarteira::matriz(array $tickers, int $pregoes=252): array, SinalDoAtivo::para(string): array, DividendYield::dozeMeses(string): array, FatorDoAtivo::principal(string $ticker, string $classe, ?string $nome, ?string $indexador): string, Imposto::doMes(Fotografia, string $mes): array}` | 07/11 | assumido |

## Drive-by fixes

| O que estava quebrado | Correção | Commit |
|-----------------------|----------|--------|

## Open items

| Item | Suposição / decisão tomada | Recomendação |
|------|-----------------------------|--------------|
| Consentimento da Pluggy para conta e cartão no site | Assumido que o item do usuário já tem os produtos ACCOUNTS/TRANSACTIONS/CREDIT_CARDS. Se o `/v2/transactions` do cartão der 403, o sync registra e segue sem o cartão | Conferir no primeiro sync real depois da reconexão do dono |
| O resumo da home calcula `score`/`atencao` que nenhuma tela lê, e por isso busca o ranking e a curva | Fora do escopo do DoD | Limpar num PR à parte |
| O comentário do `CarteiraMcpBanner.vue` ainda cita o Raio-X; links para `/carteira#raio-x` deixam de abrir a análise (nenhum no front) | Sem impacto | Conferir o app e o chat |
| Sobras inofensivas do MAX no chat: 6 comparações `tier === 'max' || 'atlas'` em `loop.ts`, `post.ts` e `intake.ts`, comentários e o prefixo `max` no `leaked-marker-parser` | Nenhum turno chega como max (`tierEfetivo`) | PR à parte, depois |
| Teste do mcp instável na base `c975d48` (1 falha a frio, depois 49/49) | Não vem do diff | Observar |
| Conflito previsto no `bootstrap/app.php` entre o api #23 e os `feat/carteira-*`: as linhas do alias `carteira.visao` ficam coladas nas de `feature`/`limit`, que saem | Antes de abrir os PRs da carteira, mesclar o `chore/sem-raiox-e-tiers` neles, mantendo `carteira.visao` sem `feature`/`limit`. A ordem vira plano-unico → sem-raiox → carteira-* | integrador |
| PRs empilhados com base `feat/plano-unico`: depois do merge do #21, a base precisa ir para main | — | No relatório final: `gh pr edit <n> --base main` para o #23 e os da carteira, ou retarget antes da entrega |
| As métricas `raiox_*` saíram do admin, embora a `origin/main` antiga do front (24927ee8, fora do ar) ainda as leia. A `redentia-v2` em produção não usa | Aceito: o admin antigo mostra "—" | reverter 998c6df se o dono discordar |
| O Infection (mutação, só relatório) falha às vezes em `EngineGoldenTest` | Não vem dos PRs | Investigar à parte |
| A fixture não tem gastos: `pluggy_account_transactions` é nova e ainda não existe em produção. Ficam fora também 4 proventos de 25 a 31/05 (corte de datas) e 117 cotas de AUPO11 sem compra (lacuna da Pluggy) | Aceito | Gastos de teste sintéticos nos testes do motor |
| O Redentia Score na fixture é calculado sobre o universo dela, não a bolsa inteira (a PETR4 sai nº 1 local e nº 2 em produção) | Aceito para a verificação | — |
| Nubank do dono parado desde 16/07 | O dono desconecta e reconecta em /conta (1 min). Não apagamos a conexão no banco | — |

## Hard stops awaiting authorization

| Ação | Estado preparado | O que falta |
|------|------------------|-------------|
| Merge dos PRs (= deploy) | — | o clique do dono, na ordem escrita no relatório final |
| Ligar as flags de envio (`notifications.carteira_*_enabled`) e o sync diário | — | o dono, depois do deploy |
| Apagar a tabela `portfolio_analyses` | não preparado (fora deste escopo) | PR futuro, com o dono |
| Criar o preço na Stripe live e migrar os assinantes (plano único) | já documentado em `feat/plano-unico` | o dono, depois do deploy |

## Shipped

| PR | Critérios | Estado |
|----|-----------|--------|
| https://github.com/andre2654/redentia-chat-service/pull/9 | 1 | aberto, CI verde |
| https://github.com/andre2654/redentia-chat-service/pull/10 | 2 (ia-paga) | aberto, CI verde. A flag `CHAT_ASSINATURA_OBRIGATORIA` vem desligada por padrão. Mesclar DEPOIS do api plano-unico |
| https://github.com/andre2654/redentia-chat-service/pull/11 | 2 | aberto, CI verde. Mesclar por último no chat, depois do api chore/sem-raiox |
| https://github.com/andre2654/redentia-mcp/pull/14 | 3 | aberto, CI verde |
| https://github.com/andre2654/redentia-api/pull/21 | 4 | aberto, CI = base. Passos do dono depois do merge: o preço na Stripe live e a migração dos assinantes |
| https://github.com/andre2654/redentia-api/pull/22 | 5 | aberto, CI verde (independente) |
| https://github.com/andre2654/redentia-api/pull/23 | 6 | aberto, base feat/plano-unico, CI verde |
