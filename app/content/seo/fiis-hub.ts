/**
 * /fiis é a URL indexável dos rankings de fundos imobiliários.
 * /rankings?classe=fiis continua abrindo o mesmo filtro, com canonical /fiis.
 */
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../../utils/serp.ts'

export const FIIS_PATH = '/fiis'
export const FIIS_TITLE = 'FIIs 2026: rankings de dividend yield e P/VP'
export const FIIS_H1 = 'FIIs 2026: rankings de dividend yield e P/VP'
export const FIIS_DESCRIPTION =
  'Rankings de FIIs da B3 por dividend yield e P/VP. As listas do hub, atualizadas após o pregão. Não é recomendação de investimento.'
export const FIIS_SUBTITLE =
  'Dividend yield e P/VP dos fundos imobiliários, nas listas que já existem. Os números saem de cada ranking.'

export function rankingsSaoDeFiis(path: string, classe: string | null): boolean {
  return path === FIIS_PATH || (path === '/rankings' && classe === 'fiis')
}

export function canonicalDeRankings(path: string, classe: string | null): string {
  return rankingsSaoDeFiis(path, classe) ? FIIS_PATH : '/rankings'
}

export function fiisCabeNoSerp(): boolean {
  return FIIS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO
    && FIIS_DESCRIPTION.length <= TETO_DESCRICAO
}
