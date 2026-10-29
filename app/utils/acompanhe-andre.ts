/**
 * Links "Acompanhe o André" no X e no Threads.
 * Um só lugar monta a URL: os três pontos do site (calculadora de preço teto,
 * página de ativo e rodapé) passam o lugar e recebem os mesmos UTMs.
 * Sem rede, sem script: só a string. O `node --test` importa este arquivo.
 */

export const LUGARES_ACOMPANHE = ['calculadora', 'asset', 'rodape'] as const
export type LugarAcompanhe = (typeof LUGARES_ACOMPANHE)[number]
export type RedeAcompanhe = 'x' | 'threads'

const BASE: Record<RedeAcompanhe, string> = {
  x: 'https://x.com/andrevisaraiva',
  threads: 'https://www.threads.com/@andrevsaraiva',
}

/** URL absoluta com utm_source, utm_medium e utm_campaign, nesta ordem. */
export function urlAcompanhe(rede: RedeAcompanhe, lugar: LugarAcompanhe): string {
  return `${BASE[rede]}?utm_source=site&utm_medium=${lugar}&utm_campaign=acompanhe_andre`
}
