/**
 * A inscrição em O mercado da semana só termina quando o PUT
 * /me/notification-preferences responde 200. Antes disso a tela fica no
 * estado de envio; outro status ou falha de rede é erro, sem gravar
 * NEWSLETTER_ASSINOU e sem o evento do GA4.
 *
 * Sem Vue, para o `node --test`.
 */

/** Enquanto este contador (useState) for > 0, o onboarding não abre. */
export const NEWSLETTER_SEGURA_ONBOARDING = 'nu:nl-segura-onboarding'

export interface EfeitosInscricao {
  enviando(valor: boolean): void
  /** Só é chamado depois que o PUT respondeu 200. */
  sucesso(): void
  erro(): void
}

export function statusDaResposta(e: unknown): number {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  const n = err?.statusCode ?? err?.response?.status ?? err?.status
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

/** O "Pronto" só existe no 200. 201, 204 e o resto não concluem. */
export function inscricaoConcluida(status: number): boolean {
  return status === 200
}

/**
 * Liga o tópico e só então dispara o sucesso. Enquanto `put` não resolve,
 * o único efeito é `enviando(true)`.
 */
export async function aposPutNewsletter(
  put: () => Promise<number>,
  efeitos: EfeitosInscricao,
): Promise<boolean> {
  efeitos.enviando(true)
  try {
    const status = await put()
    if (inscricaoConcluida(status)) {
      efeitos.sucesso()
      return true
    }
    efeitos.erro()
    return false
  }
  catch {
    efeitos.erro()
    return false
  }
  finally {
    efeitos.enviando(false)
  }
}
