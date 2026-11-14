/**
 * A /carteira nova de verdade (07/11/2026): `GET /me/carteira/visao`, que o
 * backend monta com o motor de avisos, o imposto e a renda (contrato em
 * types/carteiraVisao.ts). SSR-FIRST, no padrão do useCarteira: no servidor a
 * URL direta do Laravel, no cliente o proxy same-origin, sempre com o Bearer
 * do cookie. A primeira resposta já sai com o topo e os avisos prontos.
 *
 * Estados:
 *  - `visao`      a resposta, quando veio;
 *  - `desligada`  404 `{ error: 'visao_desligada' }`: a flag do servidor
 *                 (`carteira.visao_usuarios`) deixou a pessoa de fora, e a
 *                 página fica na tela antiga;
 *  - `erro`       qualquer outra falha (rede, 5xx, rota que ainda não existe):
 *                 também a tela antiga, que não depende deste endpoint.
 * Nada aqui inventa número: sem resposta, a tela nova não aparece.
 *
 * A MARCA (11/11/2026): o backend serve também o app, que ainda se chama
 * Redentia, e o texto dos avisos, das ideias e do "Como calculei" vem com esse
 * nome. A resposta passa pelo `marcaNaResposta` antes de virar estado (e antes
 * de ir para o payload do SSR): só os textos, só na exibição.
 */
import type { CarteiraVisao } from '~/types/carteiraVisao'
import { corpoDoErro, statusHttpDoErro } from '~/utils/assinatura'
import { marcaNaResposta, visaoDesligada } from '~/utils/carteiraVisao'
import { marcaNoTexto } from '~/utils/marcaNoTexto'

interface EstadoDaVisao {
  visao: CarteiraVisao | null
  desligada: boolean
  erro: boolean
}

export async function useCarteiraVisao(opts: { immediate?: boolean } = {}) {
  const config = useRuntimeConfig()
  const { token } = useAuthState()
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'

  const { data, pending, refresh } = await useAsyncData<EstadoDaVisao>(
    'carteira:visao',
    async () => {
      const t = token.value
      if (!t) return { visao: null, desligada: false, erro: false }
      try {
        const visao = await $fetch<CarteiraVisao>(`${import.meta.server ? serverBase : clientBase}/me/carteira/visao`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${t}` },
        })
        // o texto do motor chega com a marca do app ("Simulação da Redentia"): aqui, e só aqui, vira a do site
        return { visao: marcaNaResposta(visao, marcaNoTexto), desligada: false, erro: false }
      } catch (e) {
        const desligada = visaoDesligada(statusHttpDoErro(e), corpoDoErro(e))
        return { visao: null, desligada, erro: !desligada }
      }
    },
    // sem Open Finance a página é o convite: a visão só é buscada quando há carteira
    { immediate: opts.immediate ?? true },
  )

  const visao = computed(() => data.value?.visao ?? null)
  const desligada = computed(() => !!data.value?.desligada)
  const erro = computed(() => !!data.value?.erro)

  return { visao, desligada, erro, pending, refresh }
}
