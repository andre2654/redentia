<script setup lang="ts">
// SÓ NO DEV: o losango do dia (HomeLosango, o topo da home de quem assina) em
// todos os estados, para conferir sem sessão. Nasceu em 03/11/2026 como
// /dev/aneis, com os esboços que disputavam o lugar dos anéis; em 04/11 o
// dono escolheu o losango ("gostei do anéis 3, pode remover os outros agora")
// e a página ficou só com ele e os casos (a /dev/aneis saiu em 04/11).
// Os valores de base são os do pregão de 03/11 (você −1,44%, bolsa −1,42%);
// os do provento saem do subDoProvento, como na home.
// Fora do `nuxi dev` a rota nem existe: o nuxt.config tira pages/dev/ da
// lista (pages:extend). O middleware de 404 e o import só no dev ficam como
// segunda trava.
// Filtro: ?caso=base|provento|… (um caso só).
import type { Component } from 'vue'
import { contraABolsa, subDoProvento } from '~/utils/diaDaCarteira'

definePageMeta({
  layout: false,
  middleware: [() => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
  }],
})
useSeoMeta({ title: 'Losango do dia (dev)', robots: 'noindex, nofollow' })

const Losango: Component | null = import.meta.dev ? defineAsyncComponent(() => import('~/components/home/HomeLosango.vue')) : null

interface Caso { id: string; nome: string; voce: number | null; bolsa: number | null; provento?: boolean; proventoSub?: string | null; esmaecido?: boolean; carregando?: boolean; apoio?: string }
const nenhum = subDoProvento({ provento: false }, 'hoje', true)
const CASOS: Caso[] = [
  { id: 'base', nome: 'Pregão de 03/11', voce: -1.44, bolsa: -1.42, proventoSub: nenhum },
  {
    id: 'provento', nome: 'Com provento (valores à vista)', voce: -0.41, bolsa: -0.73, provento: true,
    proventoSub: subDoProvento({ provento: true, proventoDoDia: { valor: 48.2, tickers: ['ITSA4'] } }, 'hoje', true),
    apoio: 'A Itaúsa pagou R$ 48,20 de proventos hoje. Nenhum papel seu caiu 5% ou mais hoje.',
  },
  {
    id: 'provento-escondido', nome: 'Com provento (valores escondidos)', voce: -0.41, bolsa: -0.73, provento: true,
    proventoSub: subDoProvento({ provento: true, proventoDoDia: { valor: 48.2, tickers: ['ITSA4'] } }, 'hoje', false),
  },
  { id: 'iguais', nome: 'Você igual à bolsa', voce: -1.42, bolsa: -1.42, proventoSub: nenhum },
  { id: 'opostos', nome: 'Você sobe, a bolsa cai', voce: 0.84, bolsa: -1.18, proventoSub: nenhum },
  { id: 'alta', nome: 'Os dois sobem', voce: 0.62, bolsa: 1.35, proventoSub: nenhum },
  { id: 'grande', nome: 'Dia de −6% (passa de 3%)', voce: -6.2, bolsa: -5.85, proventoSub: nenhum },
  {
    id: 'teto', nome: 'Dia de +11% (passa do teto), com três proventos', voce: 11.3, bolsa: 2.1, provento: true,
    proventoSub: subDoProvento({ provento: true, proventoDoDia: { valor: 90.1, tickers: ['ITSA4', 'BBAS3', 'TAEE11'] } }, 'hoje', true),
  },
  { id: 'sem-carteira', nome: 'Sem o dia da carteira', voce: null, bolsa: -1.42, proventoSub: nenhum },
  { id: 'esmaecido', nome: 'Antes da abertura (esmaecido)', voce: -1.44, bolsa: -1.42, proventoSub: subDoProvento({ provento: false }, 'ontem', true), esmaecido: true },
  { id: 'carregando', nome: 'Carregando', voce: null, bolsa: null, carregando: true },
]

const route = useRoute()
const caso = computed(() => (route.query.caso != null ? String(route.query.caso) : null))
const casos = computed(() => CASOS.filter((c) => caso.value == null || c.id === caso.value))
/** no painel, como na home: o 03/11 e o dia com provento */
const paineis = CASOS.filter((c) => c.id === 'base' || c.id === 'provento')
const veredito = (c: Caso) => {
  if (c.voce == null || c.bolsa == null) return 'O resultado de hoje ainda não chegou.'
  const t = contraABolsa(c.voce, c.bolsa, false)
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`
}
const propsDe = (c: Caso) => ({
  voce: c.voce, bolsa: c.bolsa, provento: !!c.provento, proventoSub: c.proventoSub ?? null,
  esmaecido: !!c.esmaecido, carregando: !!c.carregando,
})
</script>

<template>
  <main class="dva">
    <header class="dva__topo">
      <p class="dva__sobre">Só no dev · ?caso=base, provento, provento-escondido, iguais, opostos, alta, grande, teto, sem-carteira, esmaecido, carregando</p>
      <h1 class="dva__titulo">O losango do dia</h1>
      <p class="dva__sub">Você contra a bolsa e o provento, no topo da home de quem assina.</p>
    </header>

    <!-- no lugar: o painel do topo da home, com o texto à esquerda -->
    <section v-if="!caso" class="dva__bloco">
      <h2 class="dva__h2">No painel da home</h2>
      <div v-for="c in paineis" :key="c.id" class="dva__painel" :data-painel="c.id">
        <div class="dva__texto">
          <p class="dva__p-sobre">Hoje, 03/11 · pregão encerrado</p>
          <p class="dva__p-frase">Tudo normal.</p>
          <p class="dva__p-veredito">{{ veredito(c) }}</p>
          <p class="dva__p-apoio">{{ c.apoio ?? 'Nenhum papel seu caiu 5% ou mais hoje.' }}</p>
        </div>
        <div class="dva__anel">
          <component :is="Losango" v-bind="propsDe(c)" />
        </div>
      </div>
    </section>

    <section class="dva__bloco" data-bloco="casos">
      <h2 class="dva__h2">Os casos</h2>
      <div class="dva__casos">
        <div v-for="c in casos" :key="c.id" class="dva__caso" :data-caso="c.id">
          <p class="dva__rotulo">{{ c.nome }}</p>
          <div class="dva__quadro">
            <component :is="Losango" v-bind="propsDe(c)" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dva {
  min-height: 100svh; background: var(--nu-agora-bg); color: var(--nu-agora-texto);
  padding: clamp(24px, 4vw, 56px) clamp(16px, 5.5vw, 80px) 96px;
}
.dva__topo { max-width: 72ch; }
.dva__sobre { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.dva__titulo { margin: 10px 0 0; font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.04em; line-height: 1.05; }
.dva__sub { margin: 12px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); font-weight: 500; }
.dva__bloco { margin-top: clamp(48px, 6vw, 88px); padding-top: 28px; border-top: 1px solid var(--nu-agora-linha); }
.dva__h2 { margin: 0; font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.03em; }
.dva__rotulo { margin: 0 0 14px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }

/* o painel da home (HomeAgora): o texto à esquerda, o losango à direita, até 620 */
.dva__painel {
  margin-top: 40px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 24px clamp(24px, 3vw, 48px);
}
.dva__anel { justify-self: end; width: min(100%, 620px); }
.dva__p-sobre { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-eyebrow); font-weight: var(--nu-w-medio); }
.dva__p-frase { margin: 12px 0 0; font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display); letter-spacing: -0.05em; line-height: 1; }
.dva__p-veredito { margin: 18px 0 0; font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.02em; line-height: 1.2; }
.dva__p-apoio { margin: 16px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.5; }

.dva__casos { margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap: 48px clamp(24px, 3vw, 48px); }
.dva__caso { min-width: 0; }
.dva__quadro { width: min(100%, 620px); }

@media (max-width: 959px) {
  .dva__painel { grid-template-columns: minmax(0, 1fr); }
  .dva__anel { order: -1; justify-self: center; width: min(100%, 460px); }
}
</style>
