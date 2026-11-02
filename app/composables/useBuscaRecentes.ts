/**
 * Buscas recentes da /busca (02/11/2026): o que a pessoa abriu a partir da
 * busca. Conveniência por navegador (localStorage), lida no onMounted; sem
 * storage (aba anônima, site data bloqueado), a lista fica vazia e a tela
 * segue igual. Regras puras em utils/buscaRecentes.ts.
 */
import type { BuscaItem } from '~/composables/useBuscaIndex'
import type { BuscaRecente } from '~/utils/buscaRecentes'

export function useBuscaRecentes() {
  const lista = useState<BuscaRecente[]>('nu:busca:recentes', () => [])

  function carregar() {
    try { lista.value = lerRecentes(localStorage.getItem(RECENTES_CHAVE)) } catch { lista.value = [] }
  }
  function gravar() {
    try { localStorage.setItem(RECENTES_CHAVE, JSON.stringify(lista.value)) } catch { /* sem storage, só nesta visita */ }
  }

  function lembrar(it: BuscaItem) {
    const r: BuscaRecente = {
      id: it.id,
      tipo: it.tipo,
      titulo: it.titulo,
      sub: it.sub,
      href: it.href,
      ...(it.ticker ? { ticker: it.ticker } : {}),
    }
    lista.value = adicionarRecente(lista.value, r)
    gravar()
  }

  function limpar() {
    lista.value = []
    try { localStorage.removeItem(RECENTES_CHAVE) } catch { /* idem */ }
  }

  return { lista, carregar, lembrar, limpar }
}
