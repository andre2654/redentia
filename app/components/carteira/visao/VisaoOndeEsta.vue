<script setup lang="ts">
// "Onde está o seu dinheiro" (06/11/2026): a terceira pergunta da /carteira
// nova. Posições, No mundo, Na cadeia e os riscos eram quatro seções, e agora
// são quatro lentes no mesmo lugar, uma aberta por vez. A lente escolhida fica
// em useState('carteira:lente'), que um aviso pode trocar ("Ver nos riscos").
//
// Mundo e Cadeia são as seções de 05/11 por inteiro (as mesmas buscas e
// contas), sem a moldura delas. A lente só monta quando é aberta, e o
// KeepAlive guarda as que já abriram (o globo não refaz a busca).
import type { CarteiraVisao, PosicaoVisao } from '~/types/carteiraVisao'
import type { CarteiraPosicaoMundo } from '~/types/carteira'
import { nomeCurto } from '~/utils/carteiraVisao'
import VisaoLenteAtivos from './VisaoLenteAtivos.vue'
import VisaoLenteRiscos from './VisaoLenteRiscos.vue'

const props = defineProps<{ visao: CarteiraVisao }>()

const LENTES = [
  { id: 'ativos', nome: 'Ativos' },
  { id: 'mundo', nome: 'No mundo' },
  { id: 'cadeia', nome: 'Na cadeia' },
  { id: 'riscos', nome: 'Riscos' },
] as const
const lente = useState<string>('carteira:lente', () => 'ativos')
/** as abas (NuTrilho, papel tablist): cada uma aponta o painel que mostra */
const ABAS = LENTES.map((l) => ({ valor: l.id as string, rotulo: l.nome, controla: `voe-lente-${l.id}` }))

/**
 * As posições para No mundo e Na cadeia. Duas leituras do backend entram aqui,
 * para a mesma tela não se contradizer:
 *  - ETF que mora no fator Selic ou juros é ETF de renda fixa do Brasil (LFT,
 *    IPCA+; o mesmo critério do imposto, que o põe em `rf`). No mundo ele conta
 *    como renda fixa, Brasil, em vez de "Sem dado" (o perfil do AUPO11 não tem
 *    a geografia, e a lente Riscos já diz "Selic");
 *  - o título do Tesouro vai pelo nome curto, sem a taxa.
 */
const RENDA_FIXA = new Set(['selic', 'juros'])
function paraOMundo(p: PosicaoVisao): CarteiraPosicaoMundo {
  if (p.classe === 'ETF' && RENDA_FIXA.has(p.fator)) return { ticker: p.ticker, classe: 'FIXED_INCOME', valor: p.valor, nome: p.ticker }
  return { ticker: p.ticker, classe: p.classe, valor: p.valor, nome: p.classe === 'TREASURY' ? nomeCurto(p.nome) : p.nome }
}
const posicoesMundo = computed<CarteiraPosicaoMundo[]>(() => props.visao.posicoes.map(paraOMundo))
</script>

<template>
  <section class="voe" aria-labelledby="voe-titulo" data-clarity-mask="true">
    <div class="voe__cab">
      <NuEyebrow id="voe-titulo" como="h2">Onde está o meu dinheiro?</NuEyebrow>
      <!-- as abas: o trilho da base (setas e Home/End andam; a pílula desliza até a lente nova) -->
      <NuTrilho v-model="lente" :opcoes="ABAS" papel="tablist" id-base="voe-aba" largo="celular" class="voe__abas" aria-labelledby="voe-titulo" />
    </div>

    <div :id="`voe-lente-${lente}`" class="voe__lente" role="tabpanel" :aria-labelledby="`voe-aba-${lente}`">
      <KeepAlive>
        <VisaoLenteAtivos v-if="lente === 'ativos'" :visao="visao" />
        <CarteiraMundo v-else-if="lente === 'mundo'" :posicoes="posicoesMundo" />
        <CarteiraCadeia v-else-if="lente === 'cadeia'" :posicoes="posicoesMundo" />
        <VisaoLenteRiscos v-else :visao="visao" />
      </KeepAlive>
    </div>
  </section>
</template>

<style scoped>
/* na Aportou a seção mora na faixa quente (não há faixa branca de ponta a ponta);
   os cartões de dentro são do creme da página */
.voe {
  background: var(--nu-band);
  padding: var(--cvi-v, clamp(64px, 7vw, 100px)) var(--cvi-g, clamp(20px, 5.5vw, 80px));
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
  overflow: hidden;
}
.voe__cab { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px 24px; }
/* as abas: o NuTrilho, com o trilho um tom abaixo da faixa quente (o creme dele some no --nu-band) */
.voe__abas { --ntr-trilho: color-mix(in srgb, var(--nu-ink) 8%, var(--nu-band)); }
.voe__lente { margin-top: clamp(18px, 2.4vw, 28px); min-height: 420px; animation: nu-fade .4s var(--nu-ease-saida) both; }

/* Mundo e Cadeia sem a moldura deles: a seção é esta */
.voe__lente :deep(.cmu), .voe__lente :deep(.cca) { padding: 0; background: transparent; overflow: visible; }
.voe__lente :deep(.cmu__eyebrow), .voe__lente :deep(.cca__eyebrow) { display: none; }
.voe__lente :deep(.cmu__frase), .voe__lente :deep(.cca__frase) { margin-top: 0; }

@media (max-width: 640px) {
  /* no celular as abas descem para baixo do título e esticam (largo="celular") */
  .voe__cab { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .voe__lente { animation: none; }
}
</style>
