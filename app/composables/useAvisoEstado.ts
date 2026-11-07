/**
 * O estado de um aviso do motor (07/11/2026): `PATCH /me/carteira/avisos/{chave}`
 * com `{ estado: 'visto' | 'resolvido' | 'adiado', dias? }`, que devolve
 * `{ chave, estado, adiadoAte }`. A chave é o `Aviso.id` (detector + objeto +
 * período), e o backend guarda só o estado: o aviso é recalculado a cada
 * leitura, e um `resolvido` não volta.
 *
 * Quem chama faz a troca na tela antes e desfaz se a gravação falhar.
 */
export type EstadoDoAviso = 'visto' | 'resolvido' | 'adiado'

export interface RespostaDoAviso {
  chave: string
  estado: EstadoDoAviso
  adiadoAte: string | null
}

export function useAvisoEstado() {
  const { authFetch } = useApi()

  function gravar(chave: string, estado: EstadoDoAviso, dias?: number) {
    return authFetch<RespostaDoAviso>(
      `/me/carteira/avisos/${encodeURIComponent(chave)}`,
      { method: 'PATCH', body: dias ? { estado, dias } : { estado } },
      { redirectOnAuthError: false },
    )
  }

  return { gravar }
}
