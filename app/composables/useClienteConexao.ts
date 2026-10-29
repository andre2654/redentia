import type { Ref } from 'vue'
import type { ClientConsentResult, ClientInviteInfo } from '~/types/clientes'
import { instituicaoPorNome, type Instituicao } from '~/content/instituicoes'

/**
 * A máquina de passos do widget de conexão do cliente final
 * (/cliente/convite/[token]), no ritmo do Pluggy Connect:
 *
 *   intro → instituicao → cpf → redirect → aguardando → sincronizando → sucesso
 *
 * Modo demo: o servidor só entra em UM ponto, o POST de consentimento (C6)
 * disparado no início de "sincronizando", com a instituição escolhida. A
 * animação das etapas corre em paralelo e a última só fecha quando o POST
 * volta; falha vira `erro` com "Tentar de novo". Recusa definitiva do convite
 * (usado, vencido, modo indisponível) sobe por `onRecusa` e a página troca
 * para o estado de link.
 *
 * O CPF NÃO passa por aqui: fica no componente do passo e morre com ele.
 *
 * Modo pluggy (Open Finance de verdade, desde 28/10/2026): instituição, CPF e
 * autorização no banco são do widget oficial da Pluggy, então os nossos
 * passos do meio não existem:
 *
 *   intro → [C6: connect_token] → widget da Pluggy → sincronizando → sucesso
 *
 * "Continuar" pede o token ao C6 (que não grava nada) e abre o widget por
 * cima da página. No onSuccess, o item volta ao servidor pelo C6b
 * (/connection), que confere o item na Pluggy e só então grava o
 * consentimento; "sincronizando" anima enquanto isso. Fechar o widget sem
 * conectar sobe por `onCancelado` (nada foi gravado). Falha passageira do C6b
 * mantém o item: "Tentar de novo" reenvia o mesmo, sem abrir o widget outra
 * vez. Item recusado (connection_invalid, connection_in_use) é descartado, e
 * "Tentar de novo" reabre o widget.
 *
 * Nada do convite entra em useState: refs locais da página que chamou.
 */
export type PassoConexao = 'intro' | 'instituicao' | 'cpf' | 'redirect' | 'aguardando' | 'sincronizando' | 'sucesso'
export type EtapaStatus = 'pendente' | 'andamento' | 'feito'
export interface EtapaSync { label: string, status: EtapaStatus }

/** Fluxo 'demo' (sem janela do banco): quanto a tela "aguardando autorização" espera antes de avançar sozinha. */
export const DEMO_ESPERA_MS = 4200
/** Ritmo de cada etapa da sincronização. */
export const ETAPA_MS = 1000

const MENSAGENS: Record<string, string> = {
  terms_outdated: 'O termo foi atualizado enquanto você lia. Recarregue a página para ler a versão nova antes de conectar.',
  institution_unknown: 'A instituição escolhida não está na lista. Volte ao início e escolha outra.',
  office_limit: 'O escritório chegou ao limite de clientes da conta. Avise o escritório; nada foi conectado.',
  rate_limited: 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
  connection_invalid: 'Não reconhecemos a conexão que voltou da instituição. Nada foi gravado. Volte ao início e conecte de novo.',
  connection_in_use: 'Esta conta já está conectada em outro lugar da Redentia. Nada foi gravado.',
  provider_unavailable: 'A conexão com as instituições não respondeu agora. Nada foi gravado. Tente de novo em instantes.',
}
const PADRAO = 'Não deu para concluir a conexão agora. Nada foi conectado. Tente de novo; se seguir assim, escreva pra relacionamento@redentia.com.br.'

export function useClienteConexao(opts: {
  token: Ref<string>
  info: Ref<ClientInviteInfo | null>
  /** recusa definitiva do servidor: a página mostra o estado do link (usado, vencido, cancelado, modo indisponível) */
  onRecusa: (motivo: string) => void
  /** modo pluggy: a pessoa fechou o widget sem conectar */
  onCancelado?: () => void
}) {
  const { publicFetch } = useApi()

  const passo = ref<PassoConexao>('intro')
  const instituicao = ref<Instituicao | null>(null)
  const etapas = ref<EtapaSync[]>([])
  const erro = ref<string | null>(null)
  const precisaRecarregar = ref(false)
  const resultado = ref<ClientConsentResult | null>(null)
  const reduzMovimento = ref(false)
  /** modo pluggy: pedindo o token e abrindo o widget (o "Continuar" gira) */
  const abrindo = ref(false)
  /** modo pluggy: falha antes do widget, mostrada na própria intro */
  const erroIntro = ref<string | null>(null)
  /** modo pluggy: o item que o widget devolveu, reenviado no "Tentar de novo" */
  let itemPluggy: string | null = null

  // 'demo' só escolhe o fluxo (o servidor gera a carteira; não há janela do banco). Nunca vai para a tela.
  const demo = computed(() => opts.info.value?.mode === 'demo')
  const pluggy = computed(() => opts.info.value?.mode === 'pluggy')
  // prefers-reduced-motion: as esperas encurtam (o fluxo é o mesmo, sem teatro)
  const ritmo = computed(() => (reduzMovimento.value ? 0.4 : 1))

  let timers: ReturnType<typeof setTimeout>[] = []
  // cada espera pertence a uma rodada; voltar/fechar/reiniciar invalida a anterior
  let rodada = 0
  function esperar(ms: number) {
    return new Promise<void>((res) => { timers.push(setTimeout(res, ms)) })
  }
  function limpar() {
    timers.forEach(clearTimeout)
    timers = []
    rodada++
  }

  // onMounted registrado antes de qualquer await (a página chama isto no setup).
  onMounted(() => {
    reduzMovimento.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  })
  onBeforeUnmount(() => { timers.forEach(clearTimeout); timers = [] })

  function reiniciar() {
    limpar()
    passo.value = 'intro'
    instituicao.value = null
    etapas.value = []
    erro.value = null
    precisaRecarregar.value = false
    erroIntro.value = null
    itemPluggy = null
  }
  function continuar() {
    if (pluggy.value) return void abrirPluggy()
    passo.value = 'instituicao'
  }
  function escolher(i: Instituicao) {
    instituicao.value = i
    passo.value = 'cpf'
  }
  function cpfConfirmado() { passo.value = 'redirect' }

  function irParaBanco() {
    limpar()
    passo.value = 'aguardando'
    // Demo: não existe janela do banco; a "autorização" chega em alguns segundos.
    if (demo.value) {
      const r = rodada
      void esperar(DEMO_ESPERA_MS * ritmo.value).then(() => {
        if (r === rodada && passo.value === 'aguardando') autorizado()
      })
    }
  }
  function autorizado() {
    if (passo.value !== 'aguardando') return
    void sincronizar()
  }
  function voltar() {
    limpar()
    switch (passo.value) {
      case 'instituicao': passo.value = 'intro'; break
      case 'cpf': instituicao.value = null; passo.value = 'instituicao'; break
      case 'redirect': passo.value = 'cpf'; break
      case 'aguardando': passo.value = 'redirect'; break
      default: break
    }
  }

  async function sincronizar() {
    limpar()
    const r = rodada
    const nome = instituicao.value?.name ?? 'instituição'
    passo.value = 'sincronizando'
    erro.value = null
    precisaRecarregar.value = false
    etapas.value = [
      { label: `Conectando ao ${nome}`, status: 'pendente' },
      { label: 'Buscando contas', status: 'pendente' },
      { label: 'Importando investimentos', status: 'pendente' },
      { label: 'Finalizando', status: 'pendente' },
    ]
    const vivo = () => r === rodada && passo.value === 'sincronizando'

    // O POST sai AGORA; as etapas animam enquanto ele roda.
    const post = consentir()
    post.catch(() => { /* tratado no await abaixo */ })

    const n = etapas.value.length
    for (let i = 0; i < n; i++) {
      if (!vivo()) return
      etapas.value[i]!.status = 'andamento'
      if (i < n - 1) {
        await esperar(ETAPA_MS * ritmo.value)
        if (!vivo()) return
        etapas.value[i]!.status = 'feito'
      }
    }

    // A última etapa só fecha quando o servidor responde.
    let res: ClientConsentResult
    try {
      res = await post
    }
    catch (e) {
      if (vivo()) falhou(e)
      return
    }
    if (!vivo()) return
    etapas.value[n - 1]!.status = 'feito'
    resultado.value = res
    await esperar(520 * ritmo.value)
    if (!vivo()) return
    passo.value = 'sucesso'
  }

  /** O aceite do termo, igual no C6 e no C6b. */
  function aceite(): Record<string, unknown> {
    const info = opts.info.value
    if (!info) throw new Error('sem convite')
    return {
      accept: true,
      // o hash do texto MOSTRADO: se o termo mudou entre abrir e aceitar, o servidor recusa com 409
      terms_version: info.terms_version,
      terms_sha256: info.terms_sha256,
    }
  }

  async function consentir(): Promise<ClientConsentResult> {
    // pluggy: o item já voltou do widget; o C6b confere e grava
    if (itemPluggy) {
      return publicFetch<ClientConsentResult>(`/business/client-invites/${opts.token.value}/connection`, {
        method: 'POST',
        body: { ...aceite(), item_id: itemPluggy },
      })
    }
    const body = aceite()
    if (instituicao.value) body.institution = instituicao.value.slug
    return publicFetch<ClientConsentResult>(`/business/client-invites/${opts.token.value}/consent`, { method: 'POST', body })
  }

  /** Pluggy: C6 devolve o token, o widget abre por cima; no sucesso, segue para "sincronizando". */
  async function abrirPluggy() {
    if (abrindo.value) return
    limpar()
    const r = rodada
    abrindo.value = true
    erroIntro.value = null
    let token: string
    try {
      const res = await publicFetch<ClientConsentResult>(`/business/client-invites/${opts.token.value}/consent`, { method: 'POST', body: aceite() })
      if (!res.connect_token) throw new Error('sem_token')
      token = res.connect_token
    }
    catch (e) {
      abrindo.value = false
      if (r !== rodada) return
      const msg = mensagemDaFalha(e)
      if (msg !== null) erroIntro.value = msg
      return
    }

    let item: ItemPluggy
    try {
      item = await abrirWidgetPluggy(token)
    }
    catch (e) {
      abrindo.value = false
      if (r !== rodada) return
      if ((e as Error)?.message === 'widget_closed') return opts.onCancelado?.()
      erroIntro.value = 'Não conseguimos abrir a conexão segura agora. Verifique a internet e tente de novo em instantes.'
      return
    }
    abrindo.value = false
    if (r !== rodada) return

    itemPluggy = item.id
    const nome = item.connector?.name?.trim() || 'sua instituição'
    instituicao.value = instituicaoPorNome(nome) ?? { slug: 'conectada', name: nome, logo: false, tipo: 'banco' }
    void sincronizar()
  }

  /**
   * A frase de uma falha do servidor, ou null quando a recusa é definitiva e
   * a página já trocou para o estado do link.
   */
  function mensagemDaFalha(e: unknown): string | null {
    const err = e as { response?: { status?: number }, data?: { error?: string, message?: string, reason?: string | null } }
    const st = err.response?.status
    const code = err.data?.error ?? ''
    // 410 invite_invalid {reason} = link usado/vencido/cancelado: não adianta tentar de novo.
    const recusa = motivoDaRecusaDoConsentimento(st, err.data)
    if (recusa) { opts.onRecusa(recusa); return null }
    if (code === 'account_disabled' || code === 'clients_disabled') { opts.onRecusa(code); return null }
    precisaRecarregar.value = code === 'terms_outdated'
    return err.data?.message ?? MENSAGENS[code] ?? PADRAO
  }

  function falhou(e: unknown) {
    const msg = mensagemDaFalha(e)
    if (msg === null) return
    // item recusado (não é deste convite, ou já está em uso): reenviar o mesmo
    // não adianta; "Tentar de novo" abre o widget outra vez
    const code = (e as { data?: { error?: string } }).data?.error
    if (code === 'connection_invalid' || code === 'connection_in_use') itemPluggy = null
    // a etapa que estava rodando para de girar: erro não é spinner eterno
    for (const et of etapas.value) if (et.status === 'andamento') et.status = 'pendente'
    erro.value = msg
  }

  function tentarDeNovo() {
    if (pluggy.value && !itemPluggy) {
      reiniciar()
      return void abrirPluggy()
    }
    void sincronizar()
  }

  return {
    passo, instituicao, etapas, erro, precisaRecarregar, resultado, abrindo, erroIntro,
    continuar, escolher, cpfConfirmado, irParaBanco, autorizado, voltar, tentarDeNovo, reiniciar,
  }
}

interface ItemPluggy { id: string, connector?: { name?: string } | null }

/**
 * Abre o widget oficial da Pluggy com o connect token do C6 (o token já leva
 * o clientUserId do cliente, e o servidor confere o item contra ele).
 * Resolve no onSuccess com o item; rejeita com 'widget_closed' se a pessoa
 * fechar antes. O onError NÃO encerra: o widget mostra o erro e deixa tentar
 * de novo lá dentro. INVESTMENTS, INVESTMENTS_TRANSACTIONS e ACCOUNTS: o
 * termo (2026-10-6) autoriza posições, movimentações dos investimentos e
 * saldo em conta. Cartão e extrato da conta (CREDIT_CARDS, TRANSACTIONS)
 * ficam de fora. INVESTMENTS_TRANSACTIONS não aparece no catálogo de
 * conectores Open Finance da Pluggy, mas o OF entrega, e ele tem de ir aqui,
 * na criação do item: ligado depois só traz os últimos dias.
 *
 * O CPF digitado em outro lugar nunca é repassado (o widget pede o dele).
 * Mesmo import dinâmico do usePluggyConnect: o Pluggy não publica UMD em CDN
 * e o chunk só baixa aqui.
 */
async function abrirWidgetPluggy(connectToken: string): Promise<ItemPluggy> {
  if (import.meta.server) throw new Error('sdk_ssr')
  const mod = await import('pluggy-connect-sdk') as { PluggyConnect?: unknown, default?: { PluggyConnect?: unknown } } | null
  const PluggyConnect = (mod?.PluggyConnect ?? mod?.default?.PluggyConnect ?? mod?.default) as
    | (new (o: Record<string, unknown>) => { init: () => Promise<void> })
    | undefined
  if (!PluggyConnect) throw new Error('sdk_export')
  return new Promise<ItemPluggy>((resolve, reject) => {
    const widget = new PluggyConnect({
      connectToken,
      language: 'pt',
      includeSandbox: false,
      allowFullscreen: true,
      products: ['INVESTMENTS', 'INVESTMENTS_TRANSACTIONS', 'ACCOUNTS'],
      onSuccess: ({ item }: { item: ItemPluggy }) => resolve(item),
      onClose: () => reject(new Error('widget_closed')),
    })
    widget.init().catch(() => reject(new Error('widget_init')))
  })
}
