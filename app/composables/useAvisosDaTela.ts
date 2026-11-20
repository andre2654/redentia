/**
 * O estado da tela /avisos (utils/avisosDaTela.ts): de onde ler e onde gravar.
 *
 *  - pelo link do WhatsApp ("Escolher avisos"): a assinatura vem no fragmento
 *    (#u=…&expires=…&signature=…). Ela é lida, guardada na aba
 *    (sessionStorage, para o recarregar) e apagada da barra na hora, antes de
 *    qualquer medição ver a URL. Lê e grava em `/avisos/{u}` (só estas
 *    preferências, sem sessão);
 *  - sem link, com sessão: o `GET/PUT /me/notification-preferences` de
 *    sempre, um PUT por tópico que mudou, e o aceite do WhatsApp do /auth/me;
 *  - sem link e sem sessão: a tela pede para entrar.
 *
 * Só no cliente: o SSR desenha o esqueleto. Salvar grava só o que mudou.
 */
import {
  caminhoDoLink, linkDoFragmento, linkVencido, mudancas, prefsDaResposta, prefsVazias,
  type LinkDosAvisos, type PrefsDaTela,
} from '~/utils/avisosDaTela'
import { temOptInWhatsapp } from '~/utils/avisosCanais'

const GUARDA = 'aportou:avisos:link'

type Estado = 'carregando' | 'pronto' | 'salvando' | 'salvo' | 'vencido' | 'entrar' | 'erro'

interface RespostaDoLink {
  nome: string
  whatsapp: boolean
  preferencias: Record<string, { email?: boolean, whatsapp?: boolean }>
}

function lerGuardado(): LinkDosAvisos | null {
  try {
    const bruto = sessionStorage.getItem(GUARDA)
    return bruto ? linkDoFragmento(`#${bruto}`) : null
  } catch {
    return null
  }
}

function guardar(l: LinkDosAvisos) {
  try {
    sessionStorage.setItem(GUARDA, new URLSearchParams({ ...l }).toString())
  } catch { /* aba sem storage: o link vale até recarregar */ }
}

export function useAvisosDaTela() {
  const { publicFetch, authFetch } = useApi()
  const { isAuthenticated } = useAuthState()
  const me = useMeCliente()

  const estado = ref<Estado>('carregando')
  const prefs = ref<PrefsDaTela>(prefsVazias())
  const salvas = ref<PrefsDaTela>(prefsVazias())
  const podeWhatsapp = ref(false)
  const nome = ref<string | null>(null)
  const erroAoSalvar = ref<string | null>(null)
  const peloLink = ref(false)
  let link: LinkDosAvisos | null = null

  /** O link do fragmento sai da barra antes de tudo (e fica na aba). */
  function pegarLink(): LinkDosAvisos | null {
    const doFragmento = linkDoFragmento(window.location.hash)
    if (doFragmento) {
      guardar(doFragmento)
      history.replaceState(history.state, '', window.location.pathname + window.location.search)
      return doFragmento
    }
    return lerGuardado()
  }

  async function carregar() {
    if (import.meta.server) return
    estado.value = 'carregando'
    erroAoSalvar.value = null
    link = pegarLink()
    peloLink.value = !!link
    try {
      if (link) {
        if (linkVencido(link, Date.now())) {
          estado.value = 'vencido'
          return
        }
        const r = await publicFetch<RespostaDoLink>(caminhoDoLink(link))
        nome.value = r?.nome ?? null
        podeWhatsapp.value = !!r?.whatsapp
        salvas.value = prefsDaResposta(r?.preferencias)
      } else if (isAuthenticated.value) {
        const [r, m] = await Promise.all([
          authFetch<Record<string, { email?: boolean, whatsapp?: boolean }>>('/me/notification-preferences', {}, { redirectOnAuthError: false }),
          me.load(),
        ])
        const user = m?.user ?? null
        nome.value = typeof user?.name === 'string' ? (user.name.trim().split(/\s+/)[0] ?? null) : null
        podeWhatsapp.value = temOptInWhatsapp(user) && !!user?.celular
        salvas.value = prefsDaResposta(r)
      } else {
        estado.value = 'entrar'
        return
      }
      prefs.value = { ...salvas.value }
      estado.value = 'pronto'
    } catch (e) {
      const status = (e as { statusCode?: number, response?: { status?: number } })?.statusCode ?? (e as { response?: { status?: number } })?.response?.status
      estado.value = link && (status === 403 || status === 404) ? 'vencido' : (!link && (status === 401 || status === 403) ? 'entrar' : 'erro')
    }
  }

  const mudou = computed(() => mudancas(salvas.value, prefs.value).length > 0)

  async function salvar() {
    if (estado.value === 'salvando') return
    const topicos = mudancas(salvas.value, prefs.value)
    if (topicos.length === 0) {
      estado.value = 'salvo'
      return
    }
    estado.value = 'salvando'
    erroAoSalvar.value = null
    try {
      if (link) {
        const corpo = Object.fromEntries(topicos.map((t) => [t, prefs.value[t]]))
        const r = await publicFetch<RespostaDoLink>(caminhoDoLink(link), { method: 'PUT', body: { preferencias: corpo } })
        salvas.value = prefsDaResposta(r?.preferencias)
      } else {
        for (const t of topicos) {
          await authFetch('/me/notification-preferences', { method: 'PUT', body: { topic: t, ...prefs.value[t] } }, { redirectOnAuthError: false })
        }
        salvas.value = { ...prefs.value }
      }
      prefs.value = { ...salvas.value }
      estado.value = 'salvo'
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode
      if (link && status === 403) {
        estado.value = 'vencido'
        return
      }
      estado.value = 'pronto'
      erroAoSalvar.value = 'Não consegui salvar agora. Tente de novo.'
    }
  }

  /** Depois de salvo, mexer de novo volta para a edição. */
  function editar() {
    if (estado.value === 'salvo') estado.value = 'pronto'
  }

  return { estado, prefs, podeWhatsapp, nome, erroAoSalvar, peloLink, mudou, carregar, salvar, editar }
}
