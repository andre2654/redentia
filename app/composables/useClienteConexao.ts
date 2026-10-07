import type { Ref } from 'vue'
import type { ClientConsentResult, ClientInviteInfo } from '~/types/clientes'
import type { Instituicao } from '~/content/instituicoes'

/**
 * A máquina de passos do widget de conexão do cliente final
 * (/cliente/convite/[token]), no ritmo do Pluggy Connect:
 *
 *   intro → instituicao → cpf → redirect → aguardando → sincronizando → sucesso
 *
 * O servidor só entra em UM ponto: o POST de consentimento (C6) disparado no
 * início de "sincronizando", com a instituição escolhida. A animação das
 * etapas corre em paralelo e a última só fecha quando o POST volta; falha
 * vira `erro` com "Tentar de novo". Recusa definitiva do convite (usado,
 * vencido, modo indisponível) sobe por `onRecusa` e a página troca para o
 * estado de link.
 *
 * O CPF NÃO passa por aqui: fica no componente do passo e morre com ele.
 *
 * Modo pluggy (ainda não ligado no servidor, que responde 409): quando o C6
 * devolver `connect_token`, abrirWidgetPluggy abre o SDK oficial no mesmo
 * lugar, já na instituição escolhida. Estrutura pronta, sem implementação de
 * provider do lado de lá.
 *
 * Nada do convite entra em useState: refs locais da página que chamou.
 */
export type PassoConexao = 'intro' | 'instituicao' | 'cpf' | 'redirect' | 'aguardando' | 'sincronizando' | 'sucesso'
export type EtapaStatus = 'pendente' | 'andamento' | 'feito'
export interface EtapaSync { label: string, status: EtapaStatus }

/** Demo: quanto a tela "aguardando autorização" espera antes de avançar sozinha. */
export const DEMO_ESPERA_MS = 4200
/** Ritmo de cada etapa da sincronização. */
export const ETAPA_MS = 1000

const MENSAGENS: Record<string, string> = {
  terms_outdated: 'O termo foi atualizado enquanto você lia. Recarregue a página para ler a versão nova antes de conectar.',
  institution_unknown: 'A instituição escolhida não está na lista. Volte ao início e escolha outra.',
  office_limit: 'O escritório chegou ao limite de clientes da conta. Avise o escritório; nada foi conectado.',
  rate_limited: 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
}
const PADRAO = 'Não deu para concluir a conexão agora. Nada foi conectado. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'

export function useClienteConexao(opts: {
  token: Ref<string>
  info: Ref<ClientInviteInfo | null>
  /** recusa definitiva do servidor: a página mostra o estado do link (usado, vencido, cancelado, modo indisponível) */
  onRecusa: (motivo: string) => void
}) {
  const { publicFetch } = useApi()

  const passo = ref<PassoConexao>('intro')
  const instituicao = ref<Instituicao | null>(null)
  const etapas = ref<EtapaSync[]>([])
  const erro = ref<string | null>(null)
  const precisaRecarregar = ref(false)
  const resultado = ref<ClientConsentResult | null>(null)
  const reduzMovimento = ref(false)

  const demo = computed(() => opts.info.value?.mode === 'demo')
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
  }
  function continuar() { passo.value = 'instituicao' }
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

  async function consentir(): Promise<ClientConsentResult> {
    const info = opts.info.value
    if (!info) throw new Error('sem convite')
    const body: Record<string, unknown> = {
      accept: true,
      // o hash do texto MOSTRADO: se o termo mudou entre abrir e aceitar, o servidor recusa com 409
      terms_version: info.terms_version,
      terms_sha256: info.terms_sha256,
    }
    if (instituicao.value) body.institution = instituicao.value.slug
    const r = await publicFetch<ClientConsentResult>(`/business/client-invites/${opts.token.value}/consent`, { method: 'POST', body })
    if (r.connect_token) await abrirWidgetPluggy(r.connect_token)
    return r
  }

  function falhou(e: unknown) {
    const err = e as { response?: { status?: number }, data?: { error?: string, message?: string, reason?: string | null } }
    const st = err.response?.status
    const code = err.data?.error ?? ''
    // 410 invite_invalid {reason} = link usado/vencido/cancelado: não adianta tentar de novo.
    const recusa = motivoDaRecusaDoConsentimento(st, err.data)
    if (recusa) return opts.onRecusa(recusa)
    if (code === 'account_disabled' || code === 'clients_disabled') return opts.onRecusa(code)
    // a etapa que estava rodando para de girar: erro não é spinner eterno
    for (const e of etapas.value) if (e.status === 'andamento') e.status = 'pendente'
    precisaRecarregar.value = code === 'terms_outdated'
    erro.value = err.data?.message ?? MENSAGENS[code] ?? PADRAO
  }

  function tentarDeNovo() { void sincronizar() }

  return {
    passo, instituicao, etapas, erro, precisaRecarregar, resultado, demo,
    continuar, escolher, cpfConfirmado, irParaBanco, autorizado, voltar, tentarDeNovo, reiniciar,
  }
}

/**
 * Modo pluggy (futuro): abre o SDK oficial com o connect token do C6.
 * Resolve no onSuccess do widget; rejeita se a pessoa fechar ou o widget
 * falhar. O CPF digitado na nossa tela NÃO é repassado (o widget pede o
 * dele; o nosso nunca sai do navegador). Mesmo import dinâmico do
 * usePluggyConnect: o Pluggy não publica UMD em CDN e o chunk só baixa aqui.
 */
async function abrirWidgetPluggy(connectToken: string, connectorId?: number): Promise<void> {
  if (import.meta.server) throw new Error('sdk_ssr')
  const mod = await import('pluggy-connect-sdk') as { PluggyConnect?: unknown, default?: { PluggyConnect?: unknown } } | null
  const PluggyConnect = (mod?.PluggyConnect ?? mod?.default?.PluggyConnect ?? mod?.default) as
    | (new (o: Record<string, unknown>) => { init: () => Promise<void> })
    | undefined
  if (!PluggyConnect) throw new Error('sdk_export')
  await new Promise<void>((resolve, reject) => {
    const widget = new PluggyConnect({
      connectToken,
      language: 'pt',
      includeSandbox: false,
      allowFullscreen: true,
      ...(connectorId ? { selectedConnectorId: connectorId } : {}),
      onSuccess: () => resolve(),
      onError: (e: { message?: string }) => reject(new Error(e?.message ?? 'widget_error')),
      onClose: () => reject(new Error('widget_closed')),
    })
    void widget.init()
  })
}
