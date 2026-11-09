/**
 * Por onde chegam os avisos da carteira (07/11/2026; plano, Parte 4.8): os
 * tópicos `carteira_*` no `GET/PUT /me/notification-preferences` que já
 * existe, uma linha por (canal, tópico). O pé do modal de avisos e o bloco
 * "Avisos da carteira" de /conta dividem este estado (useState), então
 * mudar num lugar muda no outro.
 *
 * Regras (decision ledger de 07/11):
 *  - WhatsApp só com o aceite (`users.whatsapp_opt_in_at`, lido do /auth/me):
 *    sem ele, o canal fica desligado e a tela diz por quê;
 *  - e-mail sem linha é desligado (opt-in explícito);
 *  - grava na hora; se falhar, volta o que era e diz numa linha curta.
 * Só no cliente: o SSR desenha o esqueleto no lugar dos interruptores.
 */
import { TOPICOS_CARTEIRA, temOptInWhatsapp, type TopicoCarteira } from '~/utils/avisosCanais'

export interface CanaisDoTopico {
  email: boolean
  whatsapp: boolean
}
type PrefsDaCarteira = Record<TopicoCarteira, CanaisDoTopico>

const vazio = (): PrefsDaCarteira =>
  Object.fromEntries(TOPICOS_CARTEIRA.map((t) => [t.id, { email: false, whatsapp: false }])) as PrefsDaCarteira

export function usePreferenciasDaCarteira() {
  const { isAuthenticated } = useAuthState()
  const { authFetch } = useApi()
  const me = useMeCliente()
  const prefs = useState<PrefsDaCarteira>('carteira:prefs', vazio)
  const estado = useState<'nao' | 'carregando' | 'pronto' | 'erro'>('carteira:prefs:estado', () => 'nao')
  const optIn = useState<boolean>('carteira:prefs:whatsapp', () => false)
  /** a falha da última gravação, no tópico dela (a tela mostra a linha ali) */
  const erro = ref<{ topico: TopicoCarteira; texto: string } | null>(null)
  // as preferências são de uma sessão: sair e entrar com outra conta na mesma
  // aba relê, em vez de mostrar (e regravar) as da conta anterior
  const { token } = useAuthState()
  const dono = useState<string | null>('carteira:prefs:dono', () => null)
  function daSessao() {
    if (!import.meta.client) return
    const d = resumoDoToken(token.value)
    if (dono.value === d) return
    dono.value = d
    prefs.value = vazio()
    optIn.value = false
    estado.value = 'nao'
  }
  daSessao()

  /** `user`: quem já tem o /auth/me (a /conta) passa, e ele não é buscado de novo */
  async function carregar(opts: { user?: Record<string, unknown> | null } = {}) {
    daSessao()
    if (import.meta.server || estado.value === 'carregando' || estado.value === 'pronto') return
    // sem sessão não há o que ler: a tela diz que não conseguiu, em vez de esqueleto para sempre
    if (!isAuthenticated.value) {
      estado.value = 'erro'
      return
    }
    estado.value = 'carregando'
    try {
      const [r, user] = await Promise.all([
        authFetch<Record<string, Partial<CanaisDoTopico> | undefined>>('/me/notification-preferences', {}, { redirectOnAuthError: false }),
        opts.user !== undefined ? Promise.resolve(opts.user) : me.load().then((m) => m?.user ?? null),
      ])
      const p = vazio()
      for (const t of TOPICOS_CARTEIRA) p[t.id] = { email: !!r?.[t.id]?.email, whatsapp: !!r?.[t.id]?.whatsapp }
      prefs.value = p
      optIn.value = temOptInWhatsapp(user)
      estado.value = 'pronto'
    } catch {
      estado.value = 'erro'
    }
  }

  /** grava os dois canais do tópico; `local` (o mock do dev) só muda a tela */
  async function salvar(topico: TopicoCarteira, canais: CanaisDoTopico, opts: { local?: boolean } = {}) {
    const antes = prefs.value[topico]
    const depois = { email: canais.email, whatsapp: canais.whatsapp && optIn.value }
    prefs.value = { ...prefs.value, [topico]: depois }
    if (erro.value?.topico === topico) erro.value = null
    if (opts.local) return
    try {
      await authFetch('/me/notification-preferences', { method: 'PUT', body: { topic: topico, ...depois } }, { redirectOnAuthError: false })
    } catch {
      prefs.value = { ...prefs.value, [topico]: antes }
      erro.value = { topico, texto: 'Não consegui salvar agora. Tente de novo.' }
    }
  }

  return { prefs, estado, optIn, erro, carregar, salvar }
}
