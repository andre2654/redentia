/**
 * O clique em ativo vira a janelinha de espiar (03/11/2026). Um ponto só para
 * o site inteiro: um ouvinte de clique delegado no document, na CAPTURA (antes
 * do próprio NuxtLink, que navega no handler dele), que reconhece
 * <a href="/asset/X">. Nenhum link foi trocado: no HTML do servidor eles
 * continuam <a href> reais, sem JS navegam, e quem decide o que passa direto
 * é a regra pura de utils/espiarAtivo.ts (tickerParaEspiar).
 *
 * Opt-out: `data-sem-espiar` no link ou num ancestral (o maximizar da própria
 * janela, os resultados da /busca). Com o painel do chat aberto e o cursor
 * mágico ligado, o clique num link da página é dele (anexa o ativo); os links
 * DENTRO do painel (uma resposta que cita PETR4) seguem abrindo a janelinha.
 */
import { tickerParaEspiar } from '~/utils/espiarAtivo'

/** onde o cursor mágico NÃO pega (o mesmo corte do ChatSeletor.pedacoDe) */
const FORA_DO_SELETOR = '.cpn, .cba, [aria-modal="true"], .nuh-wrap, .nut-wrap, .nsr-wrap, .esp'
/** um controle dentro do link (a estrela de seguir num cartão) segue sendo controle */
const CONTROLE = 'button, input, select, textarea, label, [role="button"], [role="switch"]'

export default defineNuxtPlugin(() => {
  const espiar = useEspiarAtivo()
  const route = useRoute()

  document.addEventListener('click', (e) => {
    if (!espiar.disponivel()) return
    const alvo = e.target instanceof Element ? e.target : null
    const a = alvo?.closest<HTMLAnchorElement>('a[href]')
    if (!a) return
    const controle = alvo?.closest(CONTROLE)
    if (controle && a.contains(controle)) return
    const t = tickerParaEspiar(e, {
      href: a.getAttribute('href'),
      target: a.getAttribute('target'),
      download: a.hasAttribute('download'),
      semEspiar: !!a.closest('[data-sem-espiar]'),
      emModal: !!a.closest('[aria-modal="true"]'),
    }, {
      origem: location.origin,
      rotaAtual: route.path,
      seletorDoChat: document.documentElement.classList.contains('nu-ctx-ligado') && !a.closest(FORA_DO_SELETOR),
    })
    if (!t) return
    e.preventDefault()
    // o handler do NuxtLink (e o @click de linha que navega) não roda: a navegação virou a janela
    e.stopPropagation()
    void espiar.abrir(t, a)
  }, true)
})
