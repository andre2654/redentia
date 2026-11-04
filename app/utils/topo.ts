/**
 * O topo do site: a navegação e a leitura do mercado que o header e a faixa
 * "Mercado agora" mostram (02/11/2026).
 *
 * A estrutura de nav é a do dono (2026-07-13): Início · Carteira (logado) ·
 * Teses · Ferramentas (calculadoras + rankings) · Informações (guias +
 * notícias). `desc` e `vig` alimentam o painel de preview (lista + vinheta);
 * `authOnly` esconde o que exige login: item de nav que bate em /login é
 * promessa quebrada.
 *
 * Sem import de valor do Nuxt de propósito: os testes (node --test) importam
 * direto.
 */
import { FERIADOS_B3, agoraEmSP, estadoDoPregao, quandoFoi } from './pregao.ts'

export interface NavChild { label: string; to: string; desc: string; vig: string; tag?: string; authOnly?: boolean }
export interface NavItem { label: string; to?: string; children?: NavChild[]; authOnly?: boolean; panel?: { desc: string; vig: string } }

export const NAV_DO_TOPO: NavItem[] = [
  { label: 'Início', to: '/' },
  {
    label: 'Carteira', to: '/carteira', authOnly: true,
    panel: { desc: 'Suas posições conectadas por Open Finance, com o dia explicado pela leitura da casa.', vig: 'carteira' },
  },
  {
    label: 'Teses', to: '/teses',
    panel: { desc: 'As teses vivas da Redentia, com convicção, estudos diários e catalisadores.', vig: 'teses' },
  },
  {
    label: 'Ferramentas',
    children: [
      { label: 'Simulação', to: '/simulacao', tag: 'novo', authOnly: true, desc: 'Dez anos de cenários na sua carteira, em poder de compra de hoje.', vig: 'simulacao' },
      { label: 'Calculadoras', to: '/calculadoras', desc: 'Juros compostos, renda passiva, primeiro milhão — as contas prontas.', vig: 'calculadoras' },
      { label: 'Redentia MCP', to: '/mcp', desc: 'Os dados e a leitura da Redentia dentro do seu Claude ou ChatGPT.', vig: 'mcp' },
      // os rankings com demanda medida no Search Console (ver NuHeader)
      { label: 'Maiores dividend yields', to: '/ranking/maiores-dividend-yield', desc: 'As maiores pagadoras da bolsa, ranqueadas por yield.', vig: 'rank-yield' },
      { label: 'Mais baratas por Graham', to: '/ranking/mais-baratas-graham', desc: 'O preço justo clássico contra o preço de tela.', vig: 'rank-graham' },
      { label: 'Mais baratas por Bazin', to: '/ranking/mais-baratas-bazin', desc: 'O filtro de renda do método Bazin.', vig: 'rank-bazin' },
      { label: 'Todos os rankings', to: '/rankings', desc: 'Todos os cortes, por classe e por critério.', vig: 'rank-todos' },
    ],
  },
  {
    label: 'Informações',
    children: [
      { label: 'Guias', to: '/guias', desc: 'Do primeiro aporte ao raio-x de ETF, passo a passo.', vig: 'guias' },
      { label: 'Notícias', to: '/noticias', desc: 'O noticiário do dia com a leitura editorial da casa.', vig: 'noticias' },
      { label: 'Setores', to: '/setor', desc: 'O mapa da bolsa, setor por setor.', vig: 'setores' },
      { label: 'Glossário', to: '/glossario', desc: 'Os termos do mercado em português claro.', vig: 'glossario' },
      { label: 'Ranking de IAs', to: '/benchmark-ia', tag: 'novo', desc: 'Dez IAs na mesma prova de finanças, com margem de erro.', vig: 'ranking-ias' },
    ],
  },
]

/**
 * A nav do topo na /business (04/11/2026, o dono: o topo do site novo "com
 * pequenas alterações para ser mais voltado à identidade For Business"). As
 * partes da landing, com o caminho inteiro (/business#...) para valer também
 * do painel logado (/business/chaves, /business/clientes). As âncoras existem
 * nas direções da landing (ver pages/business/index.vue).
 */
export const NAV_BUSINESS: NavItem[] = [
  { label: 'Produto', to: '/business#produto' },
  { label: 'Segurança', to: '/business#seguranca' },
  { label: 'Plano', to: '/business#prova' },
  { label: 'Perguntas', to: '/business#faq' },
]

/** A nav de quem está vendo: sem sessão, saem os destinos que pedem login. */
export function navDoTopo(logado: boolean): NavItem[] {
  return NAV_DO_TOPO
    .filter((i) => !i.authOnly || logado)
    .map((i) => (i.children ? { ...i, children: i.children.filter((c) => !c.authOnly || logado) } : i))
}

/** O item está ativo nesta rota? '/' só na raiz; o resto também nas filhas. */
export function rotaAtiva(path: string, to: string): boolean {
  if (to === '/') return path === '/'
  if (path === to) return true
  const base = to.split('/').slice(0, 2).join('/')
  return path.startsWith(`${base}/`)
}
export function grupoAtivo(path: string, item: NavItem): boolean {
  if (item.to) return rotaAtiva(path, item.to)
  return (item.children ?? []).some((c) => rotaAtiva(path, c.to))
}

/* ——— o mercado no topo ——— */

export interface CotacaoDoTopo { n: string; v: string; pct: string | null; dir: 'up' | 'down' | 'flat' }

/** A ordem de leitura: o índice, o câmbio, os fundos, o juro, e depois o resto. */
export const ORDEM_DO_TOPO = ['IBOV', 'Dólar', 'IFIX', 'CDI', 'PETR4', 'Bitcoin']

export function ordenarCotacoes<T extends { n: string }>(itens: T[]): T[] {
  const pos = (n: string) => { const i = ORDEM_DO_TOPO.indexOf(n); return i < 0 ? 99 : i }
  return [...itens].sort((a, b) => pos(a.n) - pos(b.n))
}

export type EstadoDoTopo = 'aberta' | 'antes' | 'fechada' | 'sem-pregao'

export interface MercadoDoTopo {
  estado: EstadoDoTopo
  /** a etiqueta curta do topo: "Bolsa aberta", "Abre às 10h", "Feriado · Finados" */
  rotulo: string
  /** de quando são os números, se não forem do pregão em curso: "Fechamento de sexta, 30/10" */
  referencia: string | null
}

const DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

/**
 * Em que pé está a bolsa e de quando são os números (asOf = a data do IBOV que
 * a API devolveu, `as_of_date`). A referência nunca é chutada: sem asOf, ela
 * fica null e o topo não diz de quando é.
 */
export function mercadoDoTopo(now: Date, asOf: string | null | undefined): MercadoDoTopo {
  const { estado } = estadoDoPregao(now)
  const { iso, semana } = agoraEmSP(now)
  let rotulo: string
  if (estado === 'sem-pregao') {
    const feriado = FERIADOS_B3[iso]
    rotulo = feriado ? `Feriado · ${feriado}` : semana === 0 || semana === 6 ? 'Fim de semana' : 'Bolsa fechada'
  } else if (estado === 'antes') rotulo = 'Abre às 10h'
  else if (estado === 'aberta') rotulo = 'Bolsa aberta'
  else rotulo = 'Bolsa fechada'

  let referencia: string | null = null
  if (asOf && /^\d{4}-\d{2}-\d{2}/.test(asOf)) {
    const d = asOf.slice(0, 10)
    const quando = quandoFoi(d, now)
    if (quando === 'hoje') referencia = estado === 'aberta' ? null : 'Fechamento de hoje'
    else if (quando === 'ontem') referencia = 'Fechamento de ontem'
    else {
      const semanaDe = new Date(`${d}T12:00:00Z`).getUTCDay()
      referencia = `Fechamento de ${DIA[semanaDe]}, ${d.slice(8, 10)}/${d.slice(5, 7)}`
    }
  }
  return { estado, rotulo, referencia }
}
