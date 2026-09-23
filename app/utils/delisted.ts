/**
 * Papel deslistado da B3 — detecção e copy, fonte única do front (mesma ideia
 * do tickerClass.ts: a regra mora num lugar só).
 *
 * Desde 18/09/2026 o backend marca `tickers.delisted_at` (372 dos 1.907 papéis
 * da master: CIEL3, CRFB3, BRFS3, AESB3, AZUL4, BCFF11…) e trata os dois lados
 * do mesmo fato:
 *  - `GET /tickers/{t}` continua 200 (o MCP depende dele) e anexa o envelope
 *    de metadados com `delisted: true` + a data do evento;
 *  - os endpoints de DADO (`/tickers/{t}/prices`, `/fundamentals/{t}/*`,
 *    `/dividends/{t}`, `/consensus/{t}`, `/assets/{t}/editorial`,
 *    `/etfs/{t}/xray`, news por ticker, market-commentary) respondem
 *    **410 Gone** com `{ok:false, error:'delisted', ticker, delisted_at}`.
 *
 * 410 e não 404 de propósito: 404 é "nunca existiu", 410 é "existiu e saiu" —
 * o Google tira do índice mais rápido e a copy da página de erro pode ser
 * honesta em vez de genérica.
 *
 * GOTCHA verificado ao vivo em 18/09: o envelope do Laravel sai na chave
 * `meta` (`JsonResource::additional(['meta' => …])`), não `_meta` —
 * `/api/tickers/AZUL4` devolve `{data:{…},meta:{delisted:true,
 * event_type:'delisted',event_date:'2025-05-01',notes:'…'}}`. O contrato
 * escrito da rodada fala em `_meta`, então lemos as DUAS chaves e aceitamos
 * tanto `delisted_at` quanto `event_date`: ler só uma delas devolveria a
 * página fantasma com a cotação congelada de meses atrás.
 *
 * NÃO confundir com `alias_resolved_from` (rename/merger, EMBR3→EMBJ3): ali o
 * papel está VIVO com outro código, o envelope não tem `delisted` e a página
 * segue 200.
 */

/** Envelope de metadados do `GET /tickers/{t}` (irmão de `data`, não filho). */
export interface TickerMetaApi {
  /** Só vem `true`; ausência NÃO significa listado (ver isDelistedEnvelope). */
  delisted?: boolean
  /** ISO8601 do flag novo (`tickers.delisted_at`). */
  delisted_at?: string | null
  /** 'YYYY-MM-DD' do `ticker_aliases` (o caminho antigo, ainda em uso). */
  event_date?: string | null
  event_type?: string | null
  notes?: string | null
  /** Rename/merger: o papel está vivo em outro código. Nunca é deslistagem. */
  alias_resolved_from?: string | null
}

/** Resposta do perfil: `data` + o envelope, na chave que o backend usar. */
export interface TickerMetaEnvelope {
  meta?: TickerMetaApi | null
  _meta?: TickerMetaApi | null
}

/** Corpo do 410 dos endpoints de dado. */
interface DelistedErrorBody {
  error?: string
  ticker?: string
  delisted_at?: string | null
}

function metaOf(envelope: TickerMetaEnvelope | null | undefined): TickerMetaApi | null {
  return envelope?.meta ?? envelope?._meta ?? null
}

/**
 * `true` só quando o backend AFIRMA a deslistagem. Nunca por inferência: preço
 * velho, volume zero ou seção vazia são sintomas de mil outras coisas, e
 * transformar sintoma em 410 tiraria papel vivo do índice.
 */
export function isDelistedEnvelope(envelope: TickerMetaEnvelope | null | undefined): boolean {
  return metaOf(envelope)?.delisted === true
}

/** Data do desligamento vinda do perfil (`delisted_at` novo > `event_date`). */
export function delistedAtOf(envelope: TickerMetaEnvelope | null | undefined): string | null {
  const meta = metaOf(envelope)
  return meta?.delisted_at ?? meta?.event_date ?? null
}

/** Data do desligamento vinda do corpo de um 410 (ofetch põe em `e.data`). */
export function delistedAtOfError(e: unknown): string | null {
  const body = (e as { data?: DelistedErrorBody } | null)?.data
  return body?.delisted_at ?? null
}

/**
 * 'YYYY-MM-DD' ou ISO8601 → 'DD/MM/AAAA'. Fatia a STRING de propósito: o
 * backend manda `…T00:00:00+00:00` e `new Date()` em BRT devolveria a véspera.
 * Qualquer outro formato → '' (a copy some em vez de mentir a data).
 */
export function delistedDateLabel(raw: string | null | undefined): string {
  const iso = String(raw ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
}

/** Frase única do 410 (statusMessage do SSR e título da página de erro). */
export function delistedMessage(ticker: string, raw: string | null | undefined): string {
  const dia = delistedDateLabel(raw)
  return dia
    ? `${ticker} foi deslistado da B3 em ${dia}`
    : `${ticker} foi deslistado da B3`
}

/**
 * 410 Gone do papel deslistado. `fatal` + `data` porque quem renderiza é o
 * app/error.vue: o statusMessage vira o status HTTP (o que o Google lê) e o
 * `data` carrega ticker e data pra copy, sem a página de erro ter que
 * reparsear frase. Usado pelo /asset (useAcao) e pelo /dividendos
 * (useDividendos) — as duas páginas por ticker que o Google indexa.
 */
export function delistedError(ticker: string, delistedAt: string | null) {
  return createError({
    statusCode: 410,
    statusMessage: delistedMessage(ticker, delistedAt),
    data: { ticker, delistedAt },
    fatal: true,
  })
}
