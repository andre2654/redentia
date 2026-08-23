# Run state — "revise o SEO, pq aparentemente caiu"

Início: 2026-08-22 · Modo: fable-it · Contexto único (sem fleet — instrução
permanente do projeto é não usar subagentes sem pedido explícito)

## Objetivo

Determinar se houve queda real de SEO/tráfego, achar a causa, e consertar o que
estiver quebrado.

## DoD (derivada — o usuário não forneceu; declarada aqui e no relatório)

| # | Critério | Status |
|---|---|---|
| 1 | Estabelecer se a queda é real ou artefato de leitura | VERIFIED |
| 2 | Descartar regressão vinda dos commits de 21/08 | VERIFIED |
| 3 | Varrer a superfície indexável em busca de defeito real | VERIFIED |
| 4 | Consertar os defeitos achados que couberem no escopo | VERIFIED |
| 5 | Deixar recomendação registrada pro que não couber | VERIFIED |

## Fatos verificados (rastreados, não inferidos)

- **A queda não é real.** Volatilidade semana-sobre-semana do site em 92 dias de
  dado do GSC: desvio padrão de 18,3 pontos, faixa de -33,8% a +50,2%. Uma
  semana de -8% ocorre em 19% das janelas. -8% está a menos de meio desvio.
- **O último ponto do gráfico é sábado 22/08 e está incompleto** (linha
  tracejada). 15/08 também é sábado, então a janela é Sáb→Sáb.
- **Fim de semana rende 31% menos que dia útil** (média de cliques: 59,4 útil
  contra 41,0 fim de semana; sábado é o pior dia, 38,6).
- **Nenhuma regressão dos commits de 21/08**: 22 rotas principais em 200; TTFB
  com cache quente 0,15-0,30s; navegação SPA funciona; redirect apex→www
  correto (308); canonical auto-referente nas 3 URLs enviadas ao GSC.
- **`GET /api/theses` do backend leva 3,0-3,2s** pra devolver 5 KB e 10 itens.
  Todos os outros endpoints: 0,26-0,41s. Medido 6 vezes.
- **Esse endpoint estava no `Promise.allSettled` de toda página de ativo**
  (useAcao.ts:1237), definindo o piso de latência das 460 URLs de /asset/*.
- **Mismatch de hidratação em todas as páginas**, causado pela faixa "Mercado
  agora" do layout: SSR renderiza skeleton, cliente renderiza dado real.
  Confirmado em página que a run não tocou (/calculadora/juros-compostos).
- **Erro `Cannot read properties of null (reading 'sequence')`** vem do
  Microsoft Clarity (terceiro), presente em páginas não tocadas.

## Ledger de decisões

- **Não converter a faixa de mercado pra SSR.** Exigiria 3 fetches bloqueantes
  em toda página; sem cache compartilhado pioraria o TTFB global. Decisão de
  arquitetura, fora do escopo de conserto de passagem. → open item.
- **Não mexer no TTL de `/asset/**` (s-maxage=120).** É escolha deliberada de
  frescor de preço, não defeito. → recomendação, não mudança.
- **Cachear /theses no Nitro em vez de esperar o backend.** O conserto certo é
  no Laravel (repo separado); a mitigação no frontend é reversível, segue
  padrão já existente no repo (site-pages.ts) e foi medida.

## Drive-by fixes

- `perf(seo)`: espelho cacheado de /theses. A/B no mesmo servidor, mesmos
  tickers: **3,57s → 0,75s** por página de ativo (4,7x).

## Open items

- **Faixa "Mercado agora" client-only** → mismatch de hidratação em ~745
  páginas e home invisível pra crawler de IA. Conserto: fetch cacheado no
  servidor (padrão do theses-feed.ts aplicado ao snapshot de mercado).
  Recomendado como frente própria.
- **Backend `/theses` a 3s** → o cache do frontend é band-aid. Corrigir a query
  no Laravel (PR pra `main`).
- **`/asset/**` com s-maxage=120** numa página cujo próprio aviso diz "atraso
  de 15 min". Subir pra 300-900s reduziria MISS de crawler. Decisão do dono.
- **TRPL4 e GUAR3** seguem 404 no backend (tickers reais, falha de ingestão).
