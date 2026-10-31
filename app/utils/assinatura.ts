/**
 * A assinatura única da Redentia (decisão do dono, 31/10/2026): R$ 19,99 por
 * mês, com 3 dias grátis e cartão cadastrado no Checkout da Stripe. A primeira
 * cobrança é no 4º dia, a menos que a pessoa cancele. São pagos a tela de
 * carteira inteira, o Open Finance e a conversa com a IA.
 *
 * Aqui mora a regra, sem Nuxt: o estado que o GET /me/entitlements descreve,
 * quem passa pelo gate, a leitura dos erros de "assinatura necessária" e o
 * controle (carregar, começar o teste, abrir o portal, esperar o webhook).
 * O useAssinatura só liga isto ao useState e ao $fetch. Os testes
 * (tests/assinatura.test.ts) importam direto.
 */
import type { CheckoutApi, EntitlementsApi, PortalApi } from '~/types/assinatura'

export const PRECO_MENSAL = 'R$ 19,99'
export const DIAS_GRATIS = 3
/** Corpo do POST /billing/checkout: o plano único, mensal, com o teste. */
export const CORPO_CHECKOUT = { plan_slug: 'redentia', cycle: 'monthly', with_trial: true } as const

/**
 * O estado da pessoa para a tela:
 *  - 'sem'          sem assinatura → paywall com o teste grátis
 *  - 'teste'        nos 3 dias grátis → acesso
 *  - 'ativa'        pagando → acesso
 *  - 'atrasada'     cobrança falhou, mas o acesso segue (carência) → acesso + aviso
 *  - 'pendente'     cobrança falhou e o acesso caiu → paywall que leva ao portal
 *                   (um checkout novo criaria uma segunda assinatura)
 *  - 'desconhecido' o /me/entitlements não respondeu → acesso (ver temAcesso)
 */
export type EstadoAssinatura = 'sem' | 'teste' | 'ativa' | 'atrasada' | 'pendente' | 'desconhecido'

export function estadoDaAssinatura(e: EntitlementsApi | null | undefined): EstadoAssinatura {
  if (!e) return 'desconhecido'
  const status = e.subscription?.status ?? null
  if (e.has_active_subscription) {
    if (status === 'trialing') return 'teste'
    if (status === 'past_due') return 'atrasada'
    return 'ativa'
  }
  if (status === 'past_due' || status === 'unpaid') return 'pendente'
  return 'sem'
}

/**
 * Quem entra na carteira e na conversa. 'desconhecido' entra (fail-open): um
 * soluço do /me/entitlements não tranca quem paga, e quem não paga esbarra no
 * gate do servidor (402/403 assinatura_necessaria), que vira paywall.
 */
export function temAcesso(estado: EstadoAssinatura): boolean {
  return estado !== 'sem' && estado !== 'pendente'
}

/**
 * Já assinou antes (há linha de assinatura encerrada): o teste de 3 dias é só
 * da primeira assinatura (contrato do Backend, 31/10/2026), então a copy não
 * promete dias grátis para quem volta.
 */
export function jaAssinouAntes(e: EntitlementsApi | null | undefined): boolean {
  const status = e?.subscription?.status
  if (!e || !status || e.has_active_subscription) return false
  return status !== 'past_due' && status !== 'unpaid' && status !== 'trialing' && status !== 'active'
}

/** Tenant sem cobrança (o snapshot devolve o plano `unlimited`): nada a gerenciar. */
export function cobrancaDesligada(e: EntitlementsApi | null | undefined): boolean {
  return !!e && (e.tenant?.billing_enabled === false || e.plan?.slug === 'unlimited')
}

/* ————— erros ————— */

/** Status HTTP de um erro do $fetch (FetchError traz statusCode e response.status). */
export function statusHttpDoErro(err: unknown): number | undefined {
  const e = err as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return e?.statusCode ?? e?.status ?? e?.response?.status
}

/** Corpo JSON de um erro do $fetch (`data`) ou de uma Response já lida. */
export function corpoDoErro(err: unknown): unknown {
  const e = err as { data?: unknown; response?: { _data?: unknown } } | null
  return e?.data ?? e?.response?._data
}

/**
 * O servidor disse "precisa assinar": 402 (qualquer corpo) ou 403 com
 * `code: 'assinatura_necessaria'`. Um 403 sem o código segue sendo sessão
 * negada, e o 401 é sempre sessão morta.
 */
export function ehAssinaturaNecessaria(status: number | undefined, corpo: unknown): boolean {
  if (status === 402) return true
  const code = (corpo as { code?: unknown } | null | undefined)?.code
  return status === 403 && code === 'assinatura_necessaria'
}

/** O mesmo teste a partir do erro do $fetch. */
export function erroDeAssinatura(err: unknown): boolean {
  return ehAssinaturaNecessaria(statusHttpDoErro(err), corpoDoErro(err))
}

/* ————— datas ————— */

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** '3 de novembro' no fuso de São Paulo; inválida → null. */
export function dataPorExtenso(iso: string | null | undefined): string | null {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return null
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  ) as Record<string, string>
  return `${Number(p.day)} de ${MESES[Number(p.month) - 1]}`
}

/** Quem começa o teste agora é cobrado pela primeira vez daqui a 3 dias. */
export function dataDaPrimeiraCobranca(now = new Date()): string {
  return dataPorExtenso(new Date(now.getTime() + DIAS_GRATIS * 86_400_000).toISOString())!
}

/* ————— o texto do estado (/conta e boas-vindas) ————— */

export interface ResumoAssinatura {
  /** selo curto: 'Teste grátis', 'Ativa', 'Pagamento pendente'… */
  selo: string
  tom: 'verde' | 'azul' | 'ambar' | 'neutro'
  /** frase com a data que importa */
  linha: string
  /** o portal resolve (trocar cartão, cancelar) */
  gerenciavel: boolean
}

export function resumoDaAssinatura(e: EntitlementsApi | null | undefined): ResumoAssinatura {
  if (cobrancaDesligada(e)) {
    return { selo: 'Acesso completo', tom: 'verde', linha: 'Tudo liberado na sua conta, sem cobrança.', gerenciavel: false }
  }
  const estado = estadoDaAssinatura(e)
  const sub = e?.subscription ?? null
  const fimTeste = dataPorExtenso(sub?.trial_ends_at)
  const fimPeriodo = dataPorExtenso(sub?.current_period_end)
  switch (estado) {
    case 'teste':
      if (sub?.cancel_at_period_end) {
        return { selo: 'Teste grátis', tom: 'azul', linha: fimTeste ? `Cancelado. Nada será cobrado e o acesso vai até ${fimTeste}.` : 'Cancelado. Nada será cobrado.', gerenciavel: true }
      }
      return {
        selo: 'Teste grátis', tom: 'azul',
        linha: fimTeste ? `Grátis até ${fimTeste}. A primeira cobrança, de ${PRECO_MENSAL}, é nesse dia.` : `Nos ${DIAS_GRATIS} dias grátis. Depois, ${PRECO_MENSAL} por mês.`,
        gerenciavel: true,
      }
    case 'ativa':
      if (sub?.cancel_at_period_end) {
        return { selo: 'Cancelada', tom: 'neutro', linha: fimPeriodo ? `Seu acesso vai até ${fimPeriodo}. Depois disso, nada é cobrado.` : 'Nada mais será cobrado.', gerenciavel: true }
      }
      return { selo: 'Ativa', tom: 'verde', linha: fimPeriodo ? `${PRECO_MENSAL} por mês. Próxima cobrança em ${fimPeriodo}.` : `${PRECO_MENSAL} por mês.`, gerenciavel: true }
    case 'atrasada':
      return { selo: 'Pagamento pendente', tom: 'ambar', linha: 'A última cobrança não passou. Atualize o cartão para não perder o acesso.', gerenciavel: true }
    case 'pendente':
      return { selo: 'Pagamento pendente', tom: 'ambar', linha: 'A cobrança não passou e o acesso foi pausado. Atualize o cartão e tudo volta na hora.', gerenciavel: true }
    case 'desconhecido':
      return { selo: 'Assinatura', tom: 'neutro', linha: 'Não conseguimos ler a sua assinatura agora.', gerenciavel: false }
    default:
      if (jaAssinouAntes(e)) {
        return { selo: 'Sem assinatura', tom: 'neutro', linha: `${PRECO_MENSAL} por mês. Cancele quando quiser.`, gerenciavel: false }
      }
      return { selo: 'Sem assinatura', tom: 'neutro', linha: `${DIAS_GRATIS} dias grátis na primeira assinatura, depois ${PRECO_MENSAL} por mês. Cancele quando quiser.`, gerenciavel: false }
  }
}

/* ————— a volta do Checkout ————— */

/**
 * `/carteira?assinatura=ok`. Aceita o `?session_id=` que a Stripe cola na URL
 * de sucesso mesmo quando ela já tem `?` (vira `assinatura=ok?session_id=…`).
 */
export function voltouDoCheckout(query: Record<string, unknown>): boolean {
  const v = query.assinatura
  const s = Array.isArray(v) ? v[0] : v
  return typeof s === 'string' && /^ok\b/.test(s)
}

/** `/assinar?cancelado=1`: saiu do Checkout sem assinar. */
export function cancelouNoCheckout(query: Record<string, unknown>): boolean {
  const v = query.cancelado
  const s = Array.isArray(v) ? v[0] : v
  return s === '1' || s === 'true'
}

/** Só seguimos para URL https (Checkout e portal da Stripe). Nada de `javascript:`. */
export function urlSegura(url: unknown): string | null {
  if (typeof url !== 'string') return null
  try {
    const u = new URL(url)
    return u.protocol === 'https:' ? u.toString() : null
  } catch {
    return null
  }
}

/* ————— o controle ————— */

/** Uma caixa com `.value`: um Ref do Vue no app, um objeto simples no teste. */
export interface Caixa<T> { value: T }

export type OrigemDoGate = 'chat' | 'carteira'

export interface EstadoDoControle {
  ent: Caixa<EntitlementsApi | null>
  /** o /me/entitlements já respondeu (ou falhou) nesta sessão de página */
  carregado: Caixa<boolean>
  gate: Caixa<OrigemDoGate | null>
  abrindo: Caixa<boolean>
  erro: Caixa<string | null>
  abrindoPortal: Caixa<boolean>
  erroPortal: Caixa<string | null>
}

export interface DepsDoControle {
  estado: EstadoDoControle
  logado: () => boolean
  buscarEntitlements: () => Promise<EntitlementsApi>
  postCheckout: () => Promise<CheckoutApi>
  postPortal: () => Promise<PortalApi>
  /** sai do site (window.location.assign) */
  irPara: (url: string) => void
  /** navega no app (navigateTo) */
  navegar: (caminho: string) => unknown
  esperar: (ms: number) => Promise<void>
}

export const ERRO_CHECKOUT = 'Não conseguimos abrir o pagamento agora. Nada foi cobrado. Tente de novo em instantes.'
/** 422 `plano_inativo` / `ciclo_indisponivel`: o plano está fora do ar do lado de lá. */
export const ERRO_PLANO = 'A assinatura está fechada para novas entradas neste momento. Nada foi cobrado. Tente de novo mais tarde.'
export const ERRO_PORTAL = 'Não conseguimos abrir o portal da assinatura agora. Tente de novo em instantes.'

/** Para onde o /login devolve quem clicou em "Começar 3 dias grátis" deslogado. */
export const DESTINO_DEPOIS_DO_LOGIN = '/assinar?continuar=1'

export function criarControleAssinatura(d: DepsDoControle) {
  const { estado } = d
  let emVoo: Promise<EntitlementsApi | null> | null = null

  /** Lê o /me/entitlements. Falha → null e o estado vira 'desconhecido'. */
  function carregar(forcar = false): Promise<EntitlementsApi | null> {
    if (!d.logado()) {
      estado.ent.value = null
      estado.carregado.value = true
      return Promise.resolve(null)
    }
    if (!forcar && estado.carregado.value) return Promise.resolve(estado.ent.value)
    if (!forcar && emVoo) return emVoo
    emVoo = d.buscarEntitlements()
      .then((e) => { estado.ent.value = e; return e })
      .catch(() => { if (forcar) return estado.ent.value; estado.ent.value = null; return null })
      .finally(() => { estado.carregado.value = true; emVoo = null })
    return emVoo
  }

  /**
   * "Começar 3 dias grátis". Deslogado → login, que devolve ao /assinar e segue
   * sozinho. Logado → Checkout da Stripe. Quem já assina vai para a carteira; quem
   * tem cobrança pendente vai ao portal (não abre uma 2ª assinatura).
   */
  async function comecar(): Promise<void> {
    if (estado.abrindo.value) return
    estado.erro.value = null
    if (!d.logado()) {
      await d.navegar(`/login?redirect=${encodeURIComponent(DESTINO_DEPOIS_DO_LOGIN)}`)
      return
    }
    const atual = estadoDaAssinatura(estado.ent.value)
    if (estado.carregado.value && (atual === 'teste' || atual === 'ativa' || atual === 'atrasada')) {
      await d.navegar('/carteira')
      return
    }
    if (estado.carregado.value && atual === 'pendente') {
      await gerenciar()
      return
    }
    estado.abrindo.value = true
    try {
      const r = await d.postCheckout()
      const url = urlSegura(r?.checkout_url)
      if (!url) throw new Error('checkout_url')
      d.irPara(url)
      // fica "abrindo" até a página sair: o botão não volta a ficar clicável
      return
    } catch (err) {
      const status = statusHttpDoErro(err)
      const code = (corpoDoErro(err) as { code?: unknown } | null)?.code
      estado.abrindo.value = false
      if (status === 401) {
        await d.navegar(`/login?redirect=${encodeURIComponent(DESTINO_DEPOIS_DO_LOGIN)}`)
        return
      }
      // 409 assinatura_ativa: já assina (o snapshot estava velho) → a carteira
      if (status === 409 || code === 'assinatura_ativa') {
        await d.navegar('/carteira')
        return
      }
      estado.erro.value = code === 'plano_inativo' || code === 'ciclo_indisponivel' ? ERRO_PLANO : ERRO_CHECKOUT
    }
  }

  /** "Gerenciar assinatura": portal da Stripe (cartão, cancelamento, faturas). */
  async function gerenciar(): Promise<void> {
    if (estado.abrindoPortal.value) return
    estado.erroPortal.value = null
    estado.abrindoPortal.value = true
    try {
      const r = await d.postPortal()
      const url = urlSegura(r?.portal_url)
      if (!url) throw new Error('portal_url')
      d.irPara(url)
    } catch {
      estado.abrindoPortal.value = false
      estado.erroPortal.value = ERRO_PORTAL
    }
  }

  /**
   * Volta do Checkout: o webhook da Stripe pode chegar segundos depois da
   * pessoa. Relê o /me/entitlements até liberar ou acabarem as tentativas.
   */
  async function aguardarConfirmacao(tentativas = 10, intervaloMs = 2000): Promise<boolean> {
    for (let i = 0; i < tentativas; i++) {
      const e = await carregar(true)
      if (e && temAcesso(estadoDaAssinatura(e))) return true
      if (i < tentativas - 1) await d.esperar(intervaloMs)
    }
    return false
  }

  /**
   * Antes de um gesto pago (mandar mensagem à IA): assinante segue; quem não
   * assina vê o gate. Deslogado segue (a página cuida do login).
   */
  async function garantirAcesso(origem: OrigemDoGate): Promise<boolean> {
    if (!d.logado()) return true
    await carregar()
    if (temAcesso(estadoDaAssinatura(estado.ent.value)) || !estado.carregado.value) return true
    estado.gate.value = origem
    return false
  }

  /**
   * O servidor recusou por falta de assinatura: marca como "não assina" e, com
   * origem, abre o gate (a conversa). Sem origem só marca (a /carteira vira o
   * paywall sozinha).
   */
  function recusado(origem: OrigemDoGate | null = null) {
    if (!estado.ent.value || temAcesso(estadoDaAssinatura(estado.ent.value))) {
      estado.ent.value = { plan: null, subscription: estado.ent.value?.subscription ?? null, has_active_subscription: false }
    }
    estado.carregado.value = true
    if (origem) estado.gate.value = origem
  }

  return { carregar, comecar, gerenciar, aguardarConfirmacao, garantirAcesso, recusado }
}
