/**
 * A bolsa do dia (server/api/bolsa-do-dia, 31/10/2026): os fatos do
 * fechamento, montados no servidor com cache de 2 minutos. Sai no SSR (os
 * links para /asset vão no HTML) e é a fonte única do número do dia na home:
 * a seção do visitante (HomeBolsa) e a reserva da bolsa no topo de quem assina
 * (HomeAgoraFrase) leem a mesma chave.
 */
import type { BolsaDoDia } from '~/utils/bolsaDoDia'

export async function useBolsaDoDia() {
  const { data, refresh, status } = await useFetch<BolsaDoDia>('/api/bolsa-do-dia', { key: 'bolsa-do-dia', dedupe: 'defer' })
  return { bolsa: data, refresh, status }
}
