/**
 * Estado único do aviso de cookies. A escolha vive no cookie first-party e no
 * localStorage (utils/consent.ts); aqui só a reatividade da interface.
 *
 * useState é a fonte compartilhada: cada useCookie() criaria um ref solto
 * (lição do useAuthState). O cookie é gravado na mão, sem o JSON do useCookie,
 * para o valor ficar `1.granted` e o SSR ler a mesma string.
 */
import {
  CONSENT_STORAGE_KEY,
  apagarCookiesDeRastreio,
  avisarAceite,
  consentimentoNoCookie,
  escreverCookieDeConsentimento,
  interpretarConsentimento,
  serializarConsentimento,
  type ConsentChoice,
} from '~/utils/consent'

export function useConsent() {
  const escolha = useState<ConsentChoice | null>('nu:consent', () => {
    const header = import.meta.server ? useRequestHeaders(['cookie']).cookie : ''
    return consentimentoNoCookie(header)
  })
  const aberto = useState('nu:consent-aberto', () => escolha.value === null)

  function gravar(proxima: ConsentChoice) {
    const valor = serializarConsentimento(proxima)
    escolha.value = proxima
    aberto.value = false
    if (import.meta.client) {
      escreverCookieDeConsentimento(valor)
      try { localStorage.setItem(CONSENT_STORAGE_KEY, valor) }
      catch { /* modo privado: o cookie ainda vale nesta visita */ }
    }
  }

  function aceitar() {
    gravar('granted')
    if (import.meta.client) avisarAceite()
  }

  function recusar() {
    gravar('denied')
    if (import.meta.client) apagarCookiesDeRastreio()
  }

  function reabrir() {
    aberto.value = true
  }

  onMounted(() => {
    if (escolha.value) return
    let guardado: ConsentChoice | null = null
    try { guardado = interpretarConsentimento(localStorage.getItem(CONSENT_STORAGE_KEY)) }
    catch { return }
    if (!guardado) return
    escolha.value = guardado
    aberto.value = false
    escreverCookieDeConsentimento(serializarConsentimento(guardado))
  })

  return { escolha, aberto, aceitar, recusar, reabrir }
}
