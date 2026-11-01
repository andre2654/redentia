/**
 * useAssinatura — a assinatura única no app (31/10/2026). A regra vive em
 * utils/assinatura.ts (testada sem Nuxt); aqui ela ganha estado compartilhado
 * (useState: a página, o gate da conversa e a /conta leem o mesmo snapshot) e
 * os fetchers do services/assinatura.ts com o Bearer da sessão.
 *
 * Quem usa:
 *  - /carteira e /assinar: useAssinaturaDaPagina() no SSR (a 1ª resposta já
 *    sai com o paywall ou a carteira certa, sem flash);
 *  - a conversa (useNuChat.send): garantirAcesso('chat') antes de gastar IA;
 *  - /conta: carregar() no mount e gerenciar() para o portal.
 *
 * O snapshot só entra no payload do SSR nas rotas private/no-store (/carteira,
 * /assinar). Ele não tem token nem dado sensível, mas a regra da casa é não
 * serializar nada da sessão em página que a borda cacheia.
 */
import type { EntitlementsApi } from '~/types/assinatura'
import {
  criarControleAssinatura,
  estadoDaAssinatura,
  jaAssinouAntes,
  statusHttpDoErro,
  temAcesso,
  type OrigemDoGate,
} from '~/utils/assinatura'

export function useAssinatura() {
  const { token, isAuthenticated } = useAuthState()

  const estado = {
    ent: useState<EntitlementsApi | null>('assinatura:ent', () => null),
    carregado: useState<boolean>('assinatura:carregado', () => false),
    gate: useState<OrigemDoGate | null>('assinatura:gate', () => null),
    abrindo: useState<boolean>('assinatura:abrindo', () => false),
    erro: useState<string | null>('assinatura:erro', () => null),
    abrindoPortal: useState<boolean>('assinatura:abrindo-portal', () => false),
    erroPortal: useState<string | null>('assinatura:erro-portal', () => null),
  }

  const base = '/api/backend'
  const headers = (): Record<string, string> => ({
    Accept: 'application/json',
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
  })

  const controle = criarControleAssinatura({
    estado,
    logado: () => isAuthenticated.value,
    buscarEntitlements: () => assinaturaFetchEntitlements(base, headers()),
    postCheckout: (dados) => assinaturaPostCheckout(base, headers(), dados),
    postPortal: () => assinaturaPostPortal(base, headers()),
    irPara: (url) => { window.location.assign(url) },
    navegar: (caminho) => navigateTo(caminho),
    esperar: (ms) => new Promise((r) => setTimeout(r, ms)),
  })

  const situacao = computed(() => estadoDaAssinatura(estado.ent.value))
  /** passa pelo gate (assinante, em teste, em carência, ou snapshot indisponível) */
  const assinante = computed(() => temAcesso(situacao.value))
  /** o teste de 3 dias vale (primeira assinatura, ou ainda não sabemos) */
  const primeiraAssinatura = computed(() => (typeof estado.ent.value?.trial_disponivel === 'boolean' ? estado.ent.value.trial_disponivel : !jaAssinouAntes(estado.ent.value)))
  /** a conta ainda não tem CPF: o quiz pede antes do pagamento */
  const precisaCpf = computed(() => estado.ent.value?.precisa_cpf === true)

  function abrirGate(origem: OrigemDoGate) { estado.gate.value = origem }
  function fecharGate() { estado.gate.value = null }

  return {
    ent: estado.ent,
    carregado: estado.carregado,
    gate: estado.gate,
    abrindo: estado.abrindo,
    erro: estado.erro,
    abrindoPortal: estado.abrindoPortal,
    erroPortal: estado.erroPortal,
    situacao,
    assinante,
    primeiraAssinatura,
    precisaCpf,
    abrirGate,
    fecharGate,
    ...controle,
  }
}

/**
 * O snapshot da assinatura no SSR das páginas que dependem dele. Deslogado →
 * null sem chamada. 401 → `sessaoMorta` (a página limpa e manda ao login).
 * Qualquer outra falha → 'desconhecido' (fail-open; o gate do servidor segura).
 */
export async function useAssinaturaDaPagina() {
  const config = useRuntimeConfig()
  const { token } = useAuthState()
  const assinatura = useAssinatura()
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'

  const { data } = await useAsyncData<{ ent: EntitlementsApi | null; sessaoMorta: boolean }>(
    'assinatura:pagina',
    async () => {
      const t = token.value
      if (!t) return { ent: null, sessaoMorta: false }
      const base = import.meta.server ? serverBase : '/api/backend'
      try {
        const ent = await assinaturaFetchEntitlements(base, { Accept: 'application/json', Authorization: `Bearer ${t}` })
        return { ent, sessaoMorta: false }
      } catch (err) {
        return { ent: null, sessaoMorta: statusHttpDoErro(err) === 401 }
      }
    },
  )

  if (data.value) {
    assinatura.ent.value = data.value.ent
    assinatura.carregado.value = !!token.value
  }

  return { assinatura, sessaoMorta: computed(() => !!data.value?.sessaoMorta) }
}
