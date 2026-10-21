import type { MagicLinkVerifyResponse } from '~/types/auth'

/** Gravado no aparelho de quem assina: o convite do canto não volta para ele. */
export const NEWSLETTER_ASSINOU = 'nu:newsletter-assinou'

/**
 * "O mercado da semana", a newsletter de sexta. Fica em casa desde 21/10/2026
 * (o beehiiv saiu antes de entrar): a inscrição é o tópico `newsletter` das
 * preferências de notificação do Backend, e quem envia é o newsletter:enviar,
 * que o dono dispara. O tópico mora no usuário, então assinar pede conta:
 *  - anônimo: e-mail → código no e-mail → conta e sessão → tópico ligado. É o
 *    login por e-mail do site (/auth/magic-link/*, que cria a conta). O código
 *    é o double opt-in: ninguém assina com o e-mail de outra pessoa;
 *  - logado com e-mail verificado: liga o tópico com um clique;
 *  - logado sem e-mail verificado (entrou pelo celular): confirma um e-mail
 *    pelo contact gate (/auth/me/email/*-pin) e liga.
 * Client-only: a página é cacheada na borda e a sessão só existe depois do
 * mount.
 *
 * `origem` diz de onde veio a inscrição no evento `newsletter_assinatura` do
 * GA4: bloco (preço teto), guias, rodape ou convite. É o que mostra qual lugar
 * traz assinante.
 */
export function useNewsletter(origem = 'bloco') {
  const { isAuthenticated, setSession } = useAuthState()
  const { publicFetch, authFetch } = useApi()
  const { load: carregarConta } = useMeCliente()

  /** false enquanto a conta do logado carrega (o formulário não pisca) */
  const pronto = ref(true)
  /** e-mail verificado da conta logada; null: anônimo ou sem e-mail confirmado */
  const emailDaConta = ref<string | null>(null)
  /** logado e com o tópico já ligado */
  const assinante = ref(false)
  const etapa = ref<'email' | 'codigo' | 'ok'>('email')
  const emailPendente = ref('')
  const enviando = ref(false)
  const erro = ref<string | null>(null)
  /** como terminou: conta nova, entrou numa conta que existia, ou já estava logado */
  const fim = ref<'nova' | 'entrou' | 'logado'>('logado')
  // O código pedido foi o do login (anônimo) ou o do contact gate (logado).
  let via: 'login' | 'conta' = 'login'

  // Login e logout no meio de uma carga: vale só a última.
  let rodada = 0
  async function conhecerConta() {
    const minha = ++rodada
    emailDaConta.value = null
    assinante.value = false
    if (!isAuthenticated.value) {
      pronto.value = true
      return
    }
    pronto.value = false
    const [me, prefs] = await Promise.all([
      carregarConta(),
      authFetch<Record<string, { email?: boolean }>>('/me/notification-preferences', {}, { redirectOnAuthError: false }).catch(() => null),
    ])
    if (minha !== rodada) return
    const e = me?.user.email?.trim()
    emailDaConta.value = e && me?.user.email_verified === true ? e : null
    assinante.value = prefs?.newsletter?.email === true
    pronto.value = true
  }

  function mensagem(e: unknown, fallback: string): string {
    const err = e as { statusCode?: number; status?: number; data?: { message?: unknown } } | null
    if ((err?.statusCode ?? err?.status) === 429) return 'Muitas tentativas. Aguarde um instante e tente de novo.'
    const m = err?.data?.message
    // 422 de validação do Laravel pode vir com a chave crua ('validation.email').
    return typeof m === 'string' && m.trim() && !/^validation\./.test(m) ? m.trim() : fallback
  }

  async function passo(acao: () => Promise<unknown>, fallback: string): Promise<boolean> {
    erro.value = null
    enviando.value = true
    try {
      await acao()
      return true
    }
    catch (e) {
      erro.value = mensagem(e, fallback)
      return false
    }
    finally {
      enviando.value = false
    }
  }

  function ligarTopico() {
    return authFetch('/me/notification-preferences', { method: 'PUT', body: { topic: 'newsletter', email: true, whatsapp: false } }, { redirectOnAuthError: false })
  }

  function concluir() {
    etapa.value = 'ok'
    try {
      localStorage.setItem(NEWSLETTER_ASSINOU, '1')
    }
    catch { /* modo privado: o convite só não fica sabendo */ }
    ;(window as any).gtag?.('event', 'newsletter_assinatura', { origem, conta: fim.value })
  }

  async function assinarComConta() {
    if (enviando.value || !emailDaConta.value) return
    if (await passo(ligarTopico, 'Não conseguimos fazer a inscrição agora. Tente de novo em instantes.')) {
      emailPendente.value = emailDaConta.value
      fim.value = 'logado'
      concluir()
    }
  }

  /** `isca`: o campo que gente não vê. Veio preenchido, finge que mandou. */
  async function pedirCodigo(email: string, isca = '') {
    if (enviando.value) return
    const e = email.trim().toLowerCase()
    if (!e) return
    if (isca.trim()) {
      emailPendente.value = e
      etapa.value = 'codigo'
      return
    }
    via = isAuthenticated.value ? 'conta' : 'login'
    const ok = await passo(
      () => via === 'login'
        ? publicFetch('/auth/magic-link/request', { method: 'POST', body: { email: e } })
        : authFetch('/auth/me/email/request-pin', { method: 'POST', body: { email: e } }, { redirectOnAuthError: false }),
      'Não conseguimos enviar o código agora. Tente de novo em instantes.',
    )
    if (ok) {
      emailPendente.value = e
      etapa.value = 'codigo'
    }
  }

  async function confirmarCodigo(codigo: string) {
    if (enviando.value) return
    const pin = codigo.replace(/\D/g, '')
    if (pin.length !== 6) {
      erro.value = 'O código tem 6 números.'
      return
    }
    let entrou: 'nova' | 'entrou' | 'logado' = 'logado'
    const ok = await passo(async () => {
      if (via === 'login') {
        const r = await publicFetch<MagicLinkVerifyResponse>('/auth/magic-link/verify', { method: 'POST', body: { email: emailPendente.value, pin } })
        setSession(r.access_token, { id: r.user.id, name: r.user.name ?? '', email: r.user.email ?? undefined })
        entrou = r.is_new_user ? 'nova' : 'entrou'
      }
      else {
        await authFetch('/auth/me/email/verify-pin', { method: 'POST', body: { email: emailPendente.value, pin } }, { redirectOnAuthError: false })
      }
    }, 'Não conseguimos confirmar o código. Tente de novo.')
    if (!ok) return
    // O e-mail está confirmado (e, no anônimo, a sessão aberta). Se ligar o
    // tópico falhar agora, sobra o botão de um clique com a conta.
    emailDaConta.value = emailPendente.value
    fim.value = entrou
    if (await passo(ligarTopico, 'O e-mail está confirmado, mas a inscrição não foi feita. Tente de novo.')) concluir()
    else etapa.value = 'email'
  }

  function trocarEmail() {
    erro.value = null
    etapa.value = 'email'
  }

  const confirmacao = computed(() => {
    const e = emailPendente.value
    if (fim.value === 'nova') return `Pronto. Sua conta na Redentia está criada, e O mercado da semana chega em ${e} toda sexta.`
    if (fim.value === 'entrou') return `Pronto. Você entrou na sua conta, e O mercado da semana chega em ${e} toda sexta.`
    return `Pronto. O mercado da semana chega em ${e} toda sexta.`
  })

  /** O aviso de consentimento. Quem não tem conta fica sabendo, antes do código, que ele cria uma. */
  const legal = computed(() => {
    if (!isAuthenticated.value) return 'Mandamos um código para confirmar o e-mail. Ao confirmar, você cria sua conta grátis na Redentia e aceita receber o e-mail semanal.'
    if (emailDaConta.value) return 'Ao assinar, você aceita receber o e-mail semanal da Redentia.'
    return 'Mandamos um código para confirmar o e-mail, que fica na sua conta. Ao confirmar, você aceita receber o e-mail semanal da Redentia.'
  })

  onMounted(() => {
    void conhecerConta()
  })
  watch(isAuthenticated, () => {
    // A própria inscrição abre a sessão: não apaga o que ela está fazendo.
    if (etapa.value !== 'ok' && !enviando.value) void conhecerConta()
  })

  return { pronto, emailDaConta, assinante, etapa, emailPendente, enviando, erro, confirmacao, legal, assinarComConta, pedirCodigo, confirmarCodigo, trocarEmail }
}
