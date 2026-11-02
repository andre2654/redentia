import type { MagicLinkVerifyResponse, MagicPinVerifyResponse } from '~/types/auth'
import type { CadastroFeito } from '~/composables/useCadastroFolha'
import { cabecalhosAtribuicaoDaSessao, dispararEventoAuth } from '../utils/atribuicao.ts'

/**
 * O cadastro dentro da folha (CadastroFolha): o mesmo login por código do
 * /login, sem sair da página. Por e-mail (/auth/magic-link/*) ou pelo
 * WhatsApp (/auth/magic-pin/*); a confirmação do código cria a conta se ela
 * não existir e abre a sessão. Os textos de erro são os do /login.
 */
export function useCadastroInline() {
  const { setSession } = useAuthState()
  const { publicFetch } = useApi()

  const canal = ref<'email' | 'whatsapp'>('email')
  const etapa = ref<'contato' | 'codigo'>('contato')
  /** o e-mail ou celular para onde o código foi */
  const contato = ref('')
  const enviando = ref(false)
  const erro = ref<string | null>(null)
  const reenviarEm = ref(0)
  const whatsappFora = ref(false)
  let relogio: ReturnType<typeof setInterval> | null = null

  /** WhatsApp fora do ar: a folha oferece só o e-mail (o /login faz o mesmo). */
  async function conferirCanais() {
    try {
      const s = await publicFetch<{ whatsapp?: { available?: boolean } }>('/auth/channels/status')
      if (!s.whatsapp?.available) {
        whatsappFora.value = true
        canal.value = 'email'
      }
    }
    catch { /* sem status: o envio trata o erro de verdade */ }
  }

  function mensagem(e: unknown, fallback: string): string {
    const err = e as { statusCode?: number; status?: number; data?: { message?: string; errors?: Record<string, string[]> } } | null
    if ((err?.statusCode ?? err?.status) === 429) return 'Muitas tentativas. Aguarde um instante e tente de novo.'
    const primeira = err?.data?.errors ? Object.values(err.data.errors)[0]?.[0] : undefined
    const m = err?.data?.message ?? primeira
    // 422 de validação do Laravel pode vir com a chave crua ('validation.email')
    return m && !/^validation\./.test(m) ? m : fallback
  }

  function contar(segundos: number) {
    reenviarEm.value = segundos
    if (relogio) clearInterval(relogio)
    relogio = setInterval(() => {
      reenviarEm.value -= 1
      if (reenviarEm.value <= 0 && relogio) {
        clearInterval(relogio)
        relogio = null
        reenviarEm.value = 0
      }
    }, 1000)
  }

  function corpo(valor: string, voltar: string) {
    return canal.value === 'whatsapp'
      ? { phone: valor, redirect_to: voltar }
      : { email: valor, redirect_to: voltar }
  }

  /** `isca`: o campo que gente não vê. Veio preenchido, finge que mandou. */
  async function pedirCodigo(valor: string, voltar: string, isca = ''): Promise<boolean> {
    if (enviando.value) return false
    const limpo = canal.value === 'email' ? valor.trim().toLowerCase() : valor.trim()
    if (!limpo) return false
    if (isca.trim()) {
      contato.value = limpo
      etapa.value = 'codigo'
      return true
    }
    if (canal.value === 'whatsapp' && whatsappFora.value) {
      erro.value = 'O envio por WhatsApp está temporariamente indisponível. Use o e-mail.'
      return false
    }
    erro.value = null
    enviando.value = true
    try {
      // 200 sempre (anti-enumeração), com limite por e-mail e por celular
      await publicFetch(canal.value === 'whatsapp' ? '/auth/magic-pin/request' : '/auth/magic-link/request', { method: 'POST', body: corpo(limpo, voltar) })
      contato.value = limpo
      etapa.value = 'codigo'
      contar(30)
      return true
    }
    catch (e) {
      const status = (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status
      erro.value = mensagem(e, status === 422
        ? (canal.value === 'whatsapp' ? 'Confira o celular digitado.' : 'Confira o e-mail digitado.')
        : 'Não foi possível enviar o código. Tente novamente.')
      return false
    }
    finally {
      enviando.value = false
    }
  }

  async function reenviar(voltar: string) {
    if (reenviarEm.value > 0 || enviando.value) return
    erro.value = null
    try {
      await publicFetch(canal.value === 'whatsapp' ? '/auth/magic-pin/resend' : '/auth/magic-link/resend', { method: 'POST', body: corpo(contato.value, voltar) })
      contar(30)
    }
    catch (e) {
      erro.value = mensagem(e, 'Não foi possível reenviar o código. Tente novamente.')
    }
  }

  /** Confere o código e abre a sessão. Devolve como a conta saiu, ou null. */
  async function confirmar(codigo: string): Promise<CadastroFeito | null> {
    const pin = codigo.replace(/\D/g, '')
    if (pin.length !== 6) {
      erro.value = 'O código tem 6 números.'
      return null
    }
    if (enviando.value) return null
    erro.value = null
    enviando.value = true
    try {
      if (canal.value === 'whatsapp') {
        // o magic-pin devolve o token em `token` (não access_token)
        const r = await publicFetch<MagicPinVerifyResponse>('/auth/magic-pin/verify', {
          method: 'POST',
          body: { phone: contato.value, pin },
          headers: cabecalhosAtribuicaoDaSessao(),
        })
        dispararEventoAuth('magic_pin', r.is_new_user === true)
        setSession(r.token, r.user ? { id: r.user.id, name: r.user.name ?? '', email: r.user.email ?? undefined } : null)
        return { canal: 'whatsapp', novaConta: r.is_new_user === true, contato: contato.value }
      }
      const r = await publicFetch<MagicLinkVerifyResponse>('/auth/magic-link/verify', {
        method: 'POST',
        body: { email: contato.value, pin },
        headers: cabecalhosAtribuicaoDaSessao(),
      })
      dispararEventoAuth('magic_link', r.is_new_user === true)
      setSession(r.access_token, { id: r.user.id, name: r.user.name ?? '', email: r.user.email ?? undefined })
      return { canal: 'email', novaConta: r.is_new_user === true, contato: contato.value }
    }
    catch (e) {
      // 422 com mensagem pronta (incorreto, tentativas restantes, expirado)
      erro.value = mensagem(e, 'Não foi possível confirmar o código. Tente novamente.')
      return null
    }
    finally {
      enviando.value = false
    }
  }

  function trocarContato() {
    erro.value = null
    etapa.value = 'contato'
  }

  onBeforeUnmount(() => {
    if (relogio) clearInterval(relogio)
  })

  return { canal, etapa, contato, enviando, erro, reenviarEm, whatsappFora, conferirCanais, pedirCodigo, reenviar, confirmar, trocarContato }
}
