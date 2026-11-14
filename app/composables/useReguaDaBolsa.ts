/**
 * O dado da régua do mercado (12/11/2026, "a bolsa inteira numa linha"): as
 * ações do Ibovespa e o dia do índice, do /api/bolsa-do-dia (montado no
 * servidor com cache de 2 minutos, server/utils/bolsa-do-dia.ts).
 *
 * Só no cliente. A régua está em toda página, e o payload do SSR levaria os
 * 15 KB da bolsa do dia para o HTML de cada uma: ela nasce do esqueleto, como a
 * régua de cotações sempre nasceu, e acende quando o dado chega. Na home, que já
 * traz a bolsa do dia no SSR (useBolsaDoDia, chave 'bolsa-do-dia'), a régua lê
 * a mesma resposta e não pede de novo.
 *
 * Ao vivo: com a bolsa aberta e a aba visível, renova a cada 2 minutos (o cache
 * do servidor; pedir antes só devolveria o mesmo). A aba que volta depois disso
 * renova na hora. A renovação é da régua: as seções da home seguem com o número
 * que abriram (o estado é outro, 'regua:bolsa').
 */
import type { BolsaDoDia } from '~/utils/bolsaDoDia'

/** o que a régua lê: as ações (a barra), o índice, o que a frase do fechamento diz (a contagem, a sequência, o mês, a série) e o pregão minuto a minuto (a faixa do fechamento) */
export type DadoDaRegua = Pick<BolsaDoDia, 'acoes' | 'ibov' | 'contagem' | 'seguidas' | 'mes' | 'diarias'> & Partial<Pick<BolsaDoDia, 'intradia'>>
export type EstadoDaRegua = 'parado' | 'carregando' | 'pronto' | 'erro'

/** o cache do /api/bolsa-do-dia: renovar antes disso só devolve a mesma resposta */
export const RENOVA_MS = 2 * 60 * 1000
const CONFERE_MS = 20 * 1000
let emVoo: Promise<void> | null = null

export function useReguaDaBolsa() {
  const bolsa = useState<DadoDaRegua | null>('regua:bolsa', () => null)
  const estado = useState<EstadoDaRegua>('regua:bolsa-estado', () => 'parado')
  const buscadoEm = useState<number>('regua:bolsa-em', () => 0)
  /** a bolsa do dia que a própria página trouxe no SSR (a home) */
  const daPagina = useNuxtData<BolsaDoDia>('bolsa-do-dia')

  function guardar(d: BolsaDoDia | null | undefined) {
    bolsa.value = d
      ? { acoes: Array.isArray(d.acoes) ? d.acoes : [], ibov: d.ibov ?? null, contagem: d.contagem ?? null, seguidas: d.seguidas ?? null, mes: d.mes ?? null, diarias: Array.isArray(d.diarias) ? d.diarias : [], intradia: d.intradia ?? null }
      : null
    buscadoEm.value = Date.now()
    estado.value = 'pronto'
  }

  async function buscar() {
    try {
      guardar(await $fetch<BolsaDoDia>('/api/bolsa-do-dia'))
    } catch {
      // a renovação que falha mantém o último dado; sem dado nenhum, a régua cai para as cotações
      if (!bolsa.value) estado.value = 'erro'
      buscadoEm.value = Date.now()
    }
  }

  /** A primeira carga: a resposta que a página já trouxe, ou um pedido. Só no cliente. */
  function carregar(): Promise<void> {
    if (!import.meta.client || estado.value !== 'parado') return emVoo ?? Promise.resolve()
    const pronta = daPagina.data.value
    if (pronta?.ibov) { guardar(pronta); return Promise.resolve() }
    estado.value = 'carregando'
    emVoo = buscar().finally(() => { emVoo = null })
    return emVoo
  }

  /**
   * Mantém o dado vivo enquanto `vivo()` (a bolsa aberta, e depois do fechamento
   * até o dado de hoje chegar): confere a cada 20 s
   * e renova quando passaram 2 minutos e a aba está à vista. Devolve o desligar.
   */
  function manterAoVivo(vivo: () => boolean): () => void {
    if (!import.meta.client) return () => {}
    const conferir = () => {
      if (!vivo() || document.visibilityState !== 'visible' || emVoo) return
      if (Date.now() - buscadoEm.value < RENOVA_MS) return
      emVoo = buscar().finally(() => { emVoo = null })
    }
    const t = setInterval(conferir, CONFERE_MS)
    document.addEventListener('visibilitychange', conferir)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', conferir)
    }
  }

  return { bolsa, estado, carregar, manterAoVivo }
}
