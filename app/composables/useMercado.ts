/**
 * Dados do /mercado (padrão swap real+fallback do useMarketTicker, herdado do
 * Atlas): cada bloco nasce com o SEED exato do design (a página nunca renderiza
 * vazia — inclusive no SSR), hidrata com o backend real no onMounted e QUALQUER
 * erro degrada de volta pro seed. Fetchers tipados em services/market.ts;
 * shapes em types/market.ts. Contrato de UX: designs/Redentia Mercado Nu.dc.html.
 *
 * Home nova (31/10/2026): saíram daqui as teses, o Tesouro, as notícias, o
 * Explore e os guias, que a home deixou de mostrar (o que sobrou: o mercado do
 * dia, o fechamento da IA e o FAQ). E os blocos que ficaram passaram a dizer
 * se o que está na tela veio da API (`reais`, `real`): o seed só segura a
 * forma da seção no SSR e nunca aparece como número de verdade.
 */
import type {
  NuBriefing,
  NuDir,
  NuFaqItem,
  NuIndexStat,
  NuMoverRow,
  NuMoverTab,
  NuMoversClass,
  NuStatPill,
} from '~/types/market'

/* ————— helpers de formatação ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function pctFmt(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}
function dirOf(n: number): NuDir {
  return n < 0 ? 'down' : 'up'
}
/* localISODate/relTime/sourcePretty: compartilhados em app/utils/format.ts (PR3);
   escapeHtml/briefingHtml idem (extraídos no PR7 — a Home renderiza o mesmo briefing) */

/* ═════ Movers ("O mercado hoje") ═════ */

type SeedRow = [ticker: string, name: string, price: string, pct: number]

function seedRows(rows: SeedRow[]): NuMoverRow[] {
  return rows.map((r, i) => ({ rank: i + 1, ticker: r[0], name: r[1], price: r[2], pct: pctFmt(r[3]), dir: dirOf(r[3]) }))
}

const MOVERS_SEED: Record<NuMoverTab, NuMoversClass> = {
  'Ações': {
    gainers: seedRows([['VALE3', 'Vale', 'R$ 61,20', 3.10], ['NVDC34', 'Nvidia BDR', 'R$ 48,12', 2.45], ['BBAS3', 'Banco do Brasil', 'R$ 27,45', 1.89], ['WEGE3', 'WEG', 'R$ 52,10', 1.72], ['PETR4', 'Petrobras', 'R$ 38,25', 0.76]]),
    losers: seedRows([['MGLU3', 'Magazine Luiza', 'R$ 11,32', -2.92], ['CVCB3', 'CVC', 'R$ 2,84', -2.10], ['ITUB4', 'Itaú Unibanco', 'R$ 34,80', -0.63], ['PRIO3', 'PRIO', 'R$ 42,10', -0.58], ['LREN3', 'Lojas Renner', 'R$ 14,05', -0.44]]),
  },
  'FIIs': {
    gainers: seedRows([['MXRF11', 'Maxi Renda', 'R$ 10,52', 1.24], ['HGLG11', 'CSHG Logística', 'R$ 162,10', 0.98], ['KNRI11', 'Kinea Renda', 'R$ 144,80', 0.84], ['XPML11', 'XP Malls', 'R$ 118,42', 0.71], ['VISC11', 'Vinci Shopping', 'R$ 112,30', 0.52]]),
    losers: seedRows([['XPLG11', 'XP Log', 'R$ 98,45', -0.92], ['BTLG11', 'BTG Logística', 'R$ 102,60', -0.64], ['HGRU11', 'CSHG Renda Urbana', 'R$ 124,15', -0.41], ['RECT11', 'REC Renda', 'R$ 48,20', -0.38], ['MALL11', 'Malls Brasil', 'R$ 96,74', -0.22]]),
  },
  'Cripto': {
    gainers: seedRows([['SOL', 'Solana', 'R$ 394', 3.42], ['BTC', 'Bitcoin', 'R$ 330 mil', 1.84], ['ADA', 'Cardano', 'R$ 0,95', 1.12], ['XRP', 'XRP', 'R$ 5,23', 0.88], ['DOT', 'Polkadot', 'R$ 4,05', 0.54]]),
    losers: seedRows([['DOGE', 'Dogecoin', 'R$ 0,37', -1.84], ['LINK', 'Chainlink', 'R$ 45,40', -1.10], ['AVAX', 'Avalanche', 'R$ 33,10', -0.92], ['BNB', 'BNB', 'R$ 3.172', -0.64], ['ETH', 'Ethereum', 'R$ 9.781', -0.52]]),
  },
  'BDRs': {
    gainers: seedRows([['NVDC34', 'Nvidia', 'R$ 48,12', 2.45], ['AAPL34', 'Apple', 'R$ 62,40', 1.32], ['MSFT34', 'Microsoft', 'R$ 94,15', 1.10], ['AMZO34', 'Amazon', 'R$ 58,72', 0.94], ['GOGL34', 'Alphabet', 'R$ 52,18', 0.71]]),
    losers: seedRows([['TSLA34', 'Tesla', 'R$ 41,20', -1.42], ['META34', 'Meta', 'R$ 88,64', -0.88], ['NFLX34', 'Netflix', 'R$ 112,45', -0.52], ['DISB34', 'Disney', 'R$ 34,10', -0.41], ['BABA34', 'Alibaba', 'R$ 28,92', -0.30]]),
  },
}

const INDICES_SEED: NuIndexStat[] = [
  { label: 'IBOV', value: '197.412', pct: '+0,91%', dir: 'up' },
  { label: 'IFIX', value: '3.412', pct: '+0,24%', dir: 'up' },
]

export async function useNuMovers() {
  const tabs: NuMoverTab[] = ['Ações', 'FIIs', 'Cripto', 'BDRs']
  const movers = useState<Record<NuMoverTab, NuMoversClass>>('nu:mercado:movers', () => MOVERS_SEED)
  const indices = useState<NuIndexStat[]>('nu:mercado:indices', () => INDICES_SEED)
  const started = useState('nu:mercado:movers-started', () => false)
  const loading = useState('nu:mercado:movers-loading', () => true)
  // as abas e os índices que vieram da API (o resto continua no seed, que a
  // home não mostra como dado: a aba sem número de verdade some)
  const reais = useState<NuMoverTab[]>('nu:mercado:movers-reais', () => [])
  const indicesReais = useState('nu:mercado:indices-reais', () => false)

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      // No servidor esta chamada é interna e cacheada (server/api/mercado-movers).
      // O HTML da home sai com os /asset das altas e baixas, não com o esqueleto.
      const res = await $fetch<{
        movers: Partial<Record<NuMoverTab, NuMoversClass>>
        indices: NuIndexStat[]
      }>('/api/mercado-movers')
      const next: Record<NuMoverTab, NuMoversClass> = { ...movers.value }
      const vieram: NuMoverTab[] = []
      for (const tab of tabs) {
        const bloco = res?.movers?.[tab]
        if (bloco && bloco.gainers.length >= 3 && bloco.losers.length >= 3) {
          next[tab] = bloco
          vieram.push(tab)
        }
      }
      movers.value = next
      reais.value = vieram
      if (res?.indices?.length) {
        indices.value = res.indices
        indicesReais.value = true
      }
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  if (import.meta.server) await hydrate()
  else onMounted(hydrate)
  return { tabs, movers, indices, loading, reais, indicesReais }
}

/* ═════ Briefing ("A leitura do dia") ═════ */

const BRIEFING_SEED: NuBriefing = {
  metaLine: 'Todo pregão, a IA da Redentia escreve o fechamento. Este é o de hoje, às 18:12',
  headline: 'Ibovespa sobe 1,22% rumo aos 173 mil com a curva de juros em queda.',
  dek: 'O fluxo gira para bancos e duration, e só o petróleo fica para trás.',
  pills: [
    { label: 'Ibovespa', value: '172.742', delta: '+1,22%', dir: 'up' },
    { label: 'Amplitude', value: '65 altas · 7 quedas', delta: null, dir: null },
    { label: 'Dólar', value: 'R$ 5,13', delta: '−0,43%', dir: 'down' },
    { label: 'IFIX', value: null, delta: '+0,27%', dir: 'up' },
    { label: 'PETR4', value: null, delta: '−1,08%', dir: 'down' },
  ],
  paragraphs: [
    'O Ibovespa avançou 1,22% e fechou aos 172.742 pontos, colado nos 173 mil, num pregão de alta rara pela amplitude: 65 das 82 ações do índice subiram, contra apenas 7 quedas. Não foi rali de uma ponta só. O gatilho veio de fora: o alívio entre EUA e Irã derrubou o prêmio de risco e puxou os Treasuries para baixo, arrastando a curva de juros brasileira em todos os vértices. Com o dólar recuando 0,43% para R$ 5,13, o pano de fundo virou favorável ao ativo de risco.',
    'A queda do juro longo reprecifica o mercado inteiro. Custo de capital menor favorece quem tem duration, e a bolsa girou exatamente nessa direção: bancos e financeiras lideraram, com B3 e BTG subindo perto de 4% e o Banco do Brasil 2,4%, enquanto imobiliárias como Cyrela e Cury e nomes sensíveis a juro no varejo e na saúde (caso de Raia Drogasil e Rede D\'Or) figuraram entre as maiores altas. O IFIX acompanhou de leve, com avanço de 0,27%. É a rotação clássica para o risco quando o prêmio de juro cede.',
  ],
  extraParagraphs: [
    'A contrapartida ficou na energia. O alívio geopolítico que animou a bolsa é o mesmo que tira prêmio do petróleo, e a Petrobras andou na direção oposta ao índice: PETR4 caiu 1,08% e PETR3 recuou 1,40%, puxando PRIO e PetroRecôncavo junto. É a tese "O petróleo que paga dividendo" operando ao contrário no curto prazo: quando o risco global desinflaciona, o mercado troca o dividendo defensivo do óleo pelo beta dos juros.',
  ],
  takeaway: {
    kicker: 'O que segurar do dia',
    html: 'Foi um rali de alívio, não de fundamento. A peça que ainda falta é o estrangeiro, e a tese "O fluxo que ainda não chegou" segue no aguardo. Dólar mais fraco e curva em queda montam o cenário para o fluxo virar, mas enquanto o Tesouro IPCA+ paga cerca de 8% de juro real, a renda fixa continua sendo o maior concorrente da bolsa. A alta de hoje é o convite; a confirmação depende de o capital de fora finalmente aceitar.',
  },
  sections: null,
}

/**
 * '18h12' a partir do published_at do briefing (PR-B) — ou null quando o campo
 * ainda não existe (briefings antigos) ou não parseia. Timestamp COM timezone
 * (ISO do resource Laravel) → converte pra America/Sao_Paulo; sem timezone
 * ('YYYY-MM-DD HH:MM:SS' cru do banco) → assume que já é hora de SP e extrai.
 */
function publishedTimeLabel(raw: string | null | undefined): string | null {
  const s = raw?.trim()
  if (!s) return null
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(s)) {
    const dt = new Date(s)
    if (Number.isNaN(dt.getTime())) return null
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
      .format(dt)
      .replace(':', 'h')
  }
  const m = s.match(/[T ](\d{2}):(\d{2})/)
  return m ? `${m[1]}h${m[2]}` : null
}

export function useNuBriefing() {
  const briefing = useState<NuBriefing>('nu:mercado:briefing', () => BRIEFING_SEED)
  const started = useState('nu:mercado:briefing-started', () => false)
  const loading = useState('nu:mercado:briefing-loading', () => true)
  // true só quando o briefing veio da API: o seed não abre como "fechamento de hoje"
  const real = useState('nu:mercado:briefing-real', () => false)
  // altas e quedas das ações do Ibovespa no dia (GET /market/today), para a frase da home
  const amplitude = useState<{ altas: number; quedas: number } | null>('nu:mercado:amplitude', () => null)

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      const [b, snap, today, petr] = await Promise.allSettled([
        marketFetchBriefingToday(),
        marketFetchSnapshot(),
        marketFetchToday(),
        marketFetchQuote('PETR4'),
      ])
      // a amplitude vale mesmo sem o briefing (a frase da home usa só ela)
      if (today.status === 'fulfilled') {
        const cons = today.value?.constituents ?? []
        if (cons.length) {
          amplitude.value = {
            altas: cons.filter((c) => (c.change_pct ?? 0) > 0).length,
            quedas: cons.filter((c) => (c.change_pct ?? 0) < 0).length,
          }
        }
      }
      if (b.status !== 'fulfilled' || !b.value?.data?.headline) return
      const d = b.value.data
      const paras = String(d.body ?? '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
      if (!paras.length) return

      // Stat pills honestas: só as que têm dado real agora (as demais somem).
      const pills: NuStatPill[] = []
      if (snap.status === 'fulfilled') {
        const ibov = snap.value?.indices_br?.IBOV
        if (ibov?.value != null && ibov.change_pct != null) {
          pills.push({ label: 'Ibovespa', value: nf0.format(ibov.value), delta: pctFmt(ibov.change_pct), dir: dirOf(ibov.change_pct) })
        }
      }
      if (today.status === 'fulfilled') {
        const cons = today.value?.constituents ?? []
        if (cons.length) {
          const ups = cons.filter((c) => (c.change_pct ?? 0) > 0).length
          const downs = cons.filter((c) => (c.change_pct ?? 0) < 0).length
          pills.push({ label: 'Amplitude', value: `${ups} altas · ${downs} quedas`, delta: null, dir: null })
        }
      }
      if (snap.status === 'fulfilled') {
        const usd = snap.value?.macro?.usd_brl
        if (usd?.value != null) {
          const chg = usd.change_pct
          pills.push({ label: 'Dólar', value: `R$ ${nf2.format(usd.value)}`, delta: chg != null ? pctFmt(chg) : null, dir: chg != null ? dirOf(chg) : null })
        }
        const ifix = snap.value?.indices_br?.IFIX
        if (ifix?.change_pct != null) {
          pills.push({ label: 'IFIX', value: null, delta: pctFmt(ifix.change_pct), dir: dirOf(ifix.change_pct) })
        }
      }
      if (petr.status === 'fulfilled') {
        const q = petr.value?.data
        if (q?.change_percent != null) {
          pills.push({ label: 'PETR4', value: null, delta: pctFmt(q.change_percent), dir: dirOf(q.change_percent) })
        }
      }

      const isToday = d.date === localISODate()
      const dateLabel = isToday || !d.date ? 'hoje' : `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`
      const timeLabel = publishedTimeLabel(d.published_at)
      briefing.value = {
        metaLine: `Todo pregão, a IA da Redentia escreve o fechamento. Este é o de ${dateLabel}${timeLabel ? `, às ${timeLabel}` : ''}`,
        headline: d.headline,
        dek: null, // o resource real não tem dek separado do corpo
        pills,
        paragraphs: paras.slice(0, 2).map(briefingHtml),
        extraParagraphs: paras.slice(2).map(briefingHtml),
        takeaway: null, // idem: sem bloco "o que segurar" no resource atual
        sections: d.sections ?? null, // blocos estruturados (PR-B) — buildDayTopics consome cru
      }
      real.value = true
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { briefing, loading, real, amplitude }
}

/* ═════ FAQ da home ═════ */

// Revisto em 31/10/2026 com o plano único (R$ 19,99 por mês, 3 dias grátis
// com cartão; pagos a carteira, o Open Finance e a IA). A resposta antiga do
// "é gratuita?" falava de um plano Pro que deixou de existir. Os cenários são
// os do motor da Simulação: 2.000 caminhos de cinco anos sorteados de trechos
// reais do histórico (blocos conjuntos), com juros, dólar e petróleo juntos,
// em dinheiro de hoje. Os apps ainda não estão na App Store (recusa de
// 23/10/2026, conta de organização): "a caminho", sem data.
export const MERCADO_FAQS: NuFaqItem[] = [
  {
    q: 'Quanto custa a Redentia?',
    a: 'O mercado do dia, as calculadoras, os rankings e os guias são grátis e não pedem conta. A carteira conectada pelo Open Finance, os 2.000 cenários e a IA fazem parte da assinatura: R$ 19,99 por mês. Os 3 primeiros dias são grátis; o cartão é pedido no começo e a primeira cobrança vem no fim do teste.',
  },
  {
    q: 'Como funcionam os 2.000 cenários?',
    a: 'A Redentia pega a sua carteira de verdade e sorteia 2.000 caminhos possíveis para os próximos cinco anos, a partir de trechos reais do histórico do mercado, com juros, dólar e petróleo andando juntos. O resultado vem em dinheiro de hoje: o caminho pessimista, o do meio e o otimista. É uma simulação, não uma promessa de rendimento.',
  },
  {
    q: 'Preciso conectar meu banco?',
    a: 'Para a Redentia vigiar a carteira, sim. A conexão é pelo Open Finance, regulado pelo Banco Central, e funciona com mais de 110 bancos e corretoras. É só leitura: a Redentia vê os investimentos e o saldo, nunca move o seu dinheiro e nunca vê a sua senha do banco.',
  },
  {
    q: 'Tem app para iPhone, Mac e Apple Watch?',
    a: 'Tem, e eles estão a caminho da App Store. Enquanto isso, tudo funciona aqui no site, com a mesma conta e a mesma assinatura.',
  },
  {
    q: 'A Redentia recomenda compra e venda?',
    a: 'A Redentia organiza dados e mostra o consenso do mercado. As sugestões da IA são educacionais e não substituem a recomendação de um assessor credenciado.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. Usamos criptografia de ponta a ponta e seus dados nunca são vendidos. Você pode excluir a conta e todos os dados a qualquer momento.',
  },
]
