/**
 * O view-model das direções novas da /teses (02/11/2026, protótipos no dev por
 * ?teses=1|2|3). A lista vem do SSR (useTesesPage → /api/theses, as 10 teses
 * com link no HTML da 1ª resposta); o painel (/api/teses-painel: a convicção
 * dia a dia, a cesta e o último pregão) enriquece depois do mount, com
 * esqueleto no lugar do que ainda não chegou. Falhou, os desenhos somem e a
 * lista fica (regra 7: dado que falta faz o elemento sumir).
 *
 * Nada aqui depende de login no SSR (a rota é cacheada na borda): o "Seguindo"
 * só aparece depois do mount, pelos favoritos que o useTesesPage já busca.
 */
import type { Ref } from 'vue'
import type { ThesisCardApi } from '~/types/market'
import { fraseDaMudanca, ultimaMudanca, type PainelDasTeses, type PontoDeConviccao } from '~/utils/tesesPainel'

export interface TeseVitrineVM {
  slug: string
  href: string
  titulo: string
  /** 'Telecom', 'Renda passiva'… (o setor sem o prefixo 'Tese · ') */
  tema: string
  /** a tese numa frase (description da API) */
  frase: string
  capa: string | null
  /** os papéis da lista (até 5) e quantos mais a tese tem */
  tickers: string[]
  mais: number
  conviccao: number | null
  fontes: number
  /** 'tema' (grandes ideias) ou 'estrategia' (o shelf da API) */
  tipo: 'tema' | 'estrategia'
  /** 'YYYY-MM-DD' do estudo mais recente e o mesmo dito a partir de hoje ('ontem') */
  revisadaIso: string | null
  revisada: string | null
  seguindo: boolean
  /* ——— do painel (null até chegar, ou se faltou) ——— */
  serie: PontoDeConviccao[] | null
  mudanca: { data: string; de: number; para: number } | null
  /** 'subiu de 90 em 21 out' */
  mudancaFrase: string | null
  cesta: { serie: number[]; deltaPct: number | null; desde: string | null } | null
  dia: { pct: number; papeis: number; total: number } | null
}

const tema = (s: string) => s.replace(/^Tese\s*·\s*/u, '').trim() || s

export function useTesesVitrine(cards: Ref<ThesisCardApi[]>, favoritos: Ref<string[]>) {
  const painel = useState<PainelDasTeses | null>('nu:teses:painel', () => null)
  // 'esperando' até o mount buscar; 'pronto' com dado; 'falhou' sem nada
  const estado = useState<'esperando' | 'pronto' | 'falhou'>('nu:teses:painel-estado', () => 'esperando')
  const montado = ref(false)

  onMounted(async () => {
    montado.value = true
    if (estado.value === 'pronto') return
    try {
      const r = await $fetch<PainelDasTeses>('/api/teses-painel')
      if (r && Object.keys(r.teses ?? {}).length) {
        painel.value = r
        estado.value = 'pronto'
      }
      else estado.value = 'falhou'
    }
    catch { estado.value = 'falhou' }
  })

  const teses = computed<TeseVitrineVM[]>(() => {
    const favs = new Set(montado.value ? favoritos.value : [])
    return cards.value.map((c) => {
      const p = painel.value?.teses[c.id]
      const mudanca = ultimaMudanca(p?.conviccao)
      const iso = typeof c.lastStudyDate === 'string' ? c.lastStudyDate.slice(0, 10) : null
      return {
        slug: c.id,
        href: `/tese/${c.id}`,
        titulo: c.title,
        tema: tema(c.sector ?? ''),
        frase: c.description ?? '',
        capa: teseCover(c.image),
        tickers: (c.tickers ?? []).slice(0, 5),
        mais: c.extraTickers > 0 ? c.extraTickers : 0,
        conviccao: c.conviction,
        fontes: c.sourcesCount ?? 0,
        tipo: c.shelf === 'estrategias' ? 'estrategia' : 'tema',
        revisadaIso: iso,
        // a data relativa muda com o relógio: só depois do mount, para o SSR
        // cacheado não carimbar "hoje" num HTML que vale cinco minutos
        revisada: iso ? (montado.value ? quandoFoi(iso) : null) : null,
        seguindo: favs.has(c.id),
        serie: p?.conviccao ?? null,
        mudanca,
        mudancaFrase: fraseDaMudanca(mudanca),
        cesta: p?.cesta ?? null,
        dia: p?.dia ?? null,
      }
    })
  })

  /** o estudo mais recente entre as teses */
  const revisadaEm = computed(() => {
    let r: string | null = null
    for (const t of teses.value) if (t.revisadaIso && (!r || t.revisadaIso > r)) r = t.revisadaIso
    return r
  })

  return { teses, painel, estado, montado, revisadaEm }
}

/** O pedaço que o cursor mágico do chat leva (v-contexto-chat): a tese como a pessoa vê. */
export function contextoDaTese(t: TeseVitrineVM) {
  return {
    id: `tese:${t.slug}`,
    tipo: 'tese',
    rotulo: rotuloCurto(t.titulo),
    texto: [
      `Tese: ${t.titulo} (${t.tema})`,
      t.frase,
      t.conviccao != null ? `Convicção ${t.conviccao} de 100${t.mudancaFrase ? `, ${t.mudancaFrase}` : ''}` : '',
      t.tickers.length ? `Papéis: ${t.tickers.join(', ')}${t.mais ? ` e mais ${t.mais}` : ''}` : '',
    ].filter(Boolean).join('\n'),
  }
}
