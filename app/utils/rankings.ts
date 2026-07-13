/**
 * Formatters e definição das colunas da RankTable (auto-importados —
 * app/utils é dir padrão do Nuxt). Fonte única do mapeamento coluna →
 * campo da API → formato, compartilhada entre RankTable, RankLeader e o hub.
 *
 * Regras de dado (PLANO-RANKINGS.md + comportamento verificado na antiga):
 *  - dy/roe/net_margin/growth_5y vêm como FRAÇÃO (0.0834 = 8,34%) → ×100;
 *  - change_percent e upside_pct já vêm em pontos percentuais;
 *  - change_percent null → 0;
 *  - nomes crus da B3 → colapsar espaços múltiplos;
 *  - redentia_score é 0-10 comprimido → display PERCENTIL /100 (×10, mesma
 *    régua do /acao, decisão PR2).
 */
import type { RankingColumnKey, RankingRowApi } from '~/types/rankings'

const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** 'PETROLEO  BRASILEIRO   S.A.' → 'PETROLEO BRASILEIRO S.A.' (nome cru da B3). */
export function rankingName(row: RankingRowApi): string {
  return String(row.name ?? '').replace(/\s+/g, ' ').trim()
}

export function rankingTicker(row: RankingRowApi): string {
  return String(row.ticker ?? row.stock ?? '').toUpperCase()
}

/** Cotação (market_price ?? close) formatada, ou '—' quando ausente. */
export function rankingPrice(row: RankingRowApi): string {
  const p = num(row.market_price) ?? num(row.close)
  return p == null ? '—' : nfBrl.format(p)
}

/** 'R$ 3,5 bi' · 'R$ 850,0 mi' · 'R$ 12,0 mil' — dinheiro compacto pt-BR. */
export function fmtCompactBrl(v: number | string | null | undefined): string {
  const n = num(v)
  if (n == null) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `R$ ${nf1.format(n / 1e12)} tri`
  if (abs >= 1e9) return `R$ ${nf1.format(n / 1e9)} bi`
  if (abs >= 1e6) return `R$ ${nf1.format(n / 1e6)} mi`
  if (abs >= 1e3) return `R$ ${nf1.format(n / 1e3)} mil`
  return nfBrl.format(n)
}

/** '+12,3%' / '-4,5%'. 1 casa é decisão da tabela Nu (densidade); a tabela
 *  da antiga usava 2 casas ('33,83%') e '+' em todo positivo. */
function fmtPct1Signed(n: number): string {
  return `${n > 0 ? '+' : ''}${nf1.format(n)}%`
}

export interface RankingColumnDef {
  label: string
  /** valor de exibição pronto (null → '—' já resolvido). */
  format: (row: RankingRowApi) => string
  /** valor numérico cru (semântica de cor no change). */
  raw: (row: RankingRowApi) => number | null
  /** colore verde/vermelho pelo sinal. */
  signed?: boolean
}

export const RANKING_COLUMNS: Record<RankingColumnKey, RankingColumnDef> = {
  marketCap: {
    label: 'Valor de mercado',
    raw: (r) => num(r.market_cap),
    format: (r) => fmtCompactBrl(r.market_cap),
  },
  dy: {
    label: 'DY 12m',
    raw: (r) => (num(r.dividend_yield) == null ? null : num(r.dividend_yield)! * 100),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : `${nf1.format(v)}%`
    },
  },
  pe: {
    label: 'P/L',
    raw: (r) => num(r.trailing_pe),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : nf1.format(v)
    },
  },
  change: {
    label: 'Hoje', // sobrescrito por meta.changeLabel ('30d', '12m')
    raw: (r) => num(r.change_percent) ?? 0, // null → 0 (regra do plano)
    format(r) {
      return fmtPct1Signed(this.raw(r) ?? 0)
    },
    signed: true,
  },
  roe: {
    label: 'ROE',
    raw: (r) => (num(r.roe) == null ? null : num(r.roe)! * 100),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : `${nf1.format(v)}%`
    },
  },
  netMargin: {
    label: 'Margem líq.',
    raw: (r) => (num(r.net_margin) == null ? null : num(r.net_margin)! * 100),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : `${nf1.format(v)}%`
    },
  },
  revenue: {
    label: 'Receita 12m',
    raw: (r) => num(r.total_revenue),
    format: (r) => fmtCompactBrl(r.total_revenue),
  },
  netIncome: {
    label: 'Lucro líq.',
    raw: (r) => num(r.net_income),
    format: (r) => fmtCompactBrl(r.net_income),
  },
  cash: {
    label: 'Caixa',
    raw: (r) => num(r.total_cash),
    format: (r) => fmtCompactBrl(r.total_cash),
  },
  grahamPrice: {
    label: 'Preço Graham',
    raw: (r) => num(r.graham_price),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : nfBrl.format(v)
    },
  },
  bazinPrice: {
    label: 'Preço Bazin',
    raw: (r) => num(r.bazin_price),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : nfBrl.format(v)
    },
  },
  upsidePct: {
    label: 'Upside',
    raw: (r) => num(r.upside_pct),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : fmtPct1Signed(v)
    },
    signed: true,
  },
  buyHoldScore: {
    label: 'Score B&H',
    raw: (r) => num(r.buy_hold_score),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : nf1.format(v)
    },
  },
  revenueGrowth5y: {
    label: 'CAGR receita 5a',
    raw: (r) => (num(r.revenue_growth_5y) == null ? null : num(r.revenue_growth_5y)! * 100),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : fmtPct1Signed(v)
    },
    signed: true,
  },
  netIncomeGrowth5y: {
    label: 'CAGR lucro 5a',
    raw: (r) => (num(r.net_income_growth_5y) == null ? null : num(r.net_income_growth_5y)! * 100),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : fmtPct1Signed(v)
    },
    signed: true,
  },
  mentionCount: {
    label: 'Menções 30d',
    raw: (r) => num(r.mention_count),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : nf0.format(v)
    },
  },
  // redentia_score 0-10 → percentil /100 (×10; mesma régua do /acao — PR2).
  score: {
    label: 'Redentia Score',
    raw: (r) => (num(r.redentia_score) == null ? null : Math.min(100, Math.round(num(r.redentia_score)! * 10))),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : `${nf0.format(v)}/100`
    },
  },
  rankingCount: {
    label: 'Rankings',
    raw: (r) => num(r.ranking_count),
    format(r) {
      const v = this.raw(r)
      return v == null ? '—' : `${nf0.format(v)} de 15`
    },
  },
}

/**
 * Slug do ranking_breakdown do backend → título humano + página Nu.
 * Portado do RANKINGS_MAP da página antiga (redentia-score.vue): espelha os
 * 15 rankings que compõem o Redentia Score. Usado pelos chips do breakdown
 * expansível da RankTable (15 links internos por linha).
 */
export const SCORE_BREAKDOWN_MAP: Record<string, { title: string; url: string }> = {
  'market-cap': { title: 'Maior Valor de Mercado', url: '/ranking/maiores-valor-mercado' },
  'dividend-yield': { title: 'Maior Dividend Yield', url: '/ranking/maiores-dividend-yield' },
  'graham-discount': { title: 'Mais Barata (Graham)', url: '/ranking/mais-baratas-graham' },
  'bazin-discount': { title: 'Mais Barata (Bazin)', url: '/ranking/mais-baratas-bazin' },
  'net-margin': { title: 'Maior Margem Líquida', url: '/ranking/maiores-margem-liquida' },
  'buy-and-hold': { title: 'Buy and Hold', url: '/ranking/buy-and-hold' },
  'revenue': { title: 'Maior Receita', url: '/ranking/maiores-receitas' },
  'net-income': { title: 'Maior Lucro', url: '/ranking/maiores-lucros' },
  'roe': { title: 'Maior ROE', url: '/ranking/maiores-roe' },
  'low-pe': { title: 'Menor P/L', url: '/ranking/menores-pl' },
  'cash': { title: 'Maior Caixa', url: '/ranking/maiores-caixa' },
  'revenue-growth': { title: 'Crescimento de Receita 5y', url: '/ranking/crescimento-receita-5-anos' },
  'net-income-growth': { title: 'Crescimento de Lucro 5y', url: '/ranking/crescimento-lucro-5-anos' },
  'upside': { title: 'Maior Upside', url: '/ranking/maior-potencial-upside' },
  'never-loss': { title: 'Nunca Teve Prejuízo', url: '/ranking/nunca-tiveram-prejuizo' },
}
