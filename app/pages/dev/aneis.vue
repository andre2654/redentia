<script setup lang="ts">
// SÓ NO DEV (03/11/2026; refeita em 04/11, quando ficou o 3 e vieram 5 a 8 com
// a marca): os esboços que disputam o lugar dos anéis do dia na home de quem
// assina, lado a lado, com os anéis de hoje para comparar,
// os valores do pregão de 03/11 (você −1,44%, bolsa −1,42%, nenhum provento) e
// os casos extremos. A home logada precisa de sessão; aqui não, para os prints.
// Na home, o mesmo esboço entra por ?aneis=3|5|6|7|8.
// Em produção a página é 404 (o middleware) e os esboços nem entram no bundle
// (o mapa abaixo fica vazio fora do dev).
// Filtros: ?so=0|3|5|6|7|8 (um desenho só) e ?caso=base|provento|… (um caso só).
import type { Component } from 'vue'
import { contraABolsa } from '~/utils/diaDaCarteira'

definePageMeta({
  layout: false,
  middleware: [() => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
  }],
})
useSeoMeta({ title: 'Esboços dos anéis (dev)', robots: 'noindex, nofollow' })

const DESENHOS: { id: string; nome: string; nota: string; comp: Component | null }[] = import.meta.dev
  ? [
      { id: '0', nome: 'Hoje: os anéis', nota: 'O desenho no ar, para comparar.', comp: defineAsyncComponent(() => import('~/components/home/HomeAneis.vue')) },
      { id: '3', nome: '3 · O losango', nota: 'As duas metades do logo são os dois vasos: você à esquerda, a bolsa à direita, cada uma enche do zero até o seu %. O miolo diz a diferença; a aba de baixo acende no provento.', comp: defineAsyncComponent(() => import('~/components/home/aneis/HomeAneisLosango.vue')) },
      { id: '5', nome: '5 · O logo como ponteiro', nota: 'O logo desliza sobre a linha do zero: você é o logo cheio, pousado por cima, a bolsa o vazado, pendurado por baixo. As pontas tocam a linha no número, e o trecho entre elas é a diferença.', comp: defineAsyncComponent(() => import('~/components/home/aneis/HomeAneisPonteiro.vue')) },
      { id: '6', nome: '6 · A constelação', nota: 'Duas fileiras de logos pequenos, cada um uma fração fixa (0,25% num dia comum), que acendem do zero para fora: dá para contar. A diferença fica entre as fileiras, onde elas terminam.', comp: defineAsyncComponent(() => import('~/components/home/aneis/HomeAneisConstelacao.vue')) },
      { id: '7', nome: '7 · O nível sobreposto', nota: 'Um logo inteiro: você é o preenchimento, a bolsa uma linha de nível. A faixa listrada entre os dois é a diferença, e o número dela fica no miolo.', comp: defineAsyncComponent(() => import('~/components/home/aneis/HomeAneisNivel.vue')) },
      { id: '8', nome: '8 · O miolo aceso', nota: 'Dois logos quietos; o dado é o miolo, que acende com a área do dia, na cor do sentido e com a seta. O mais emblemático: o número embaixo faz a leitura.', comp: defineAsyncComponent(() => import('~/components/home/aneis/HomeAneisMiolo.vue')) },
    ]
  : []

interface Caso { id: string; nome: string; voce: number | null; bolsa: number | null; provento?: boolean; proventoSub?: string | null; esmaecido?: boolean; carregando?: boolean }
const CASOS: Caso[] = [
  { id: 'base', nome: 'Pregão de 03/11', voce: -1.44, bolsa: -1.42, proventoSub: 'nenhum hoje' },
  { id: 'provento', nome: 'Com provento', voce: -1.44, bolsa: -1.42, provento: true, proventoSub: 'caiu hoje' },
  { id: 'iguais', nome: 'Você igual à bolsa', voce: -1.42, bolsa: -1.42, proventoSub: 'nenhum hoje' },
  { id: 'opostos', nome: 'Você sobe, a bolsa cai', voce: 0.84, bolsa: -1.18, proventoSub: 'nenhum hoje' },
  { id: 'alta', nome: 'Os dois sobem', voce: 0.62, bolsa: 1.35, proventoSub: 'nenhum hoje' },
  { id: 'grande', nome: 'Dia de −6% (passa de 3%)', voce: -6.2, bolsa: -5.85, proventoSub: 'nenhum hoje' },
  { id: 'teto', nome: 'Dia de +11% (passa do teto)', voce: 11.3, bolsa: 2.1, provento: true, proventoSub: 'caiu hoje' },
  { id: 'sem-carteira', nome: 'Sem o dia da carteira', voce: null, bolsa: -1.42, proventoSub: 'nenhum hoje' },
  { id: 'esmaecido', nome: 'Antes da abertura (esmaecido)', voce: -1.44, bolsa: -1.42, proventoSub: 'nenhum ontem', esmaecido: true },
  { id: 'carregando', nome: 'Carregando', voce: null, bolsa: null, carregando: true },
]

const route = useRoute()
const so = computed(() => (route.query.so != null ? String(route.query.so) : null))
const caso = computed(() => (route.query.caso != null ? String(route.query.caso) : null))
const desenhos = computed(() => DESENHOS.filter((d) => so.value == null || d.id === so.value))
const casos = computed(() => CASOS.filter((c) => caso.value == null || c.id === caso.value))
const base = CASOS[0]!
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
      <p class="dva__sobre">Só no dev · ?so=0, 3, 5–8 · ?caso=base, provento, iguais, opostos, alta, grande, teto, sem-carteira, esmaecido, carregando</p>
      <h1 class="dva__titulo">Esboços para os anéis do dia</h1>
      <p class="dva__sub">Você contra a bolsa e o provento, sem anéis. Com a marca da Redentia. Na home: <code>?aneis=3|5|6|7|8</code>.</p>
    </header>

    <!-- lado a lado, no pregão de 03/11 -->
    <section v-if="!so && !caso" class="dva__bloco" data-bloco="lado-a-lado">
      <h2 class="dva__h2">Lado a lado · pregão de 03/11</h2>
      <div class="dva__lado-a-lado">
        <div v-for="d in DESENHOS" :key="d.id" class="dva__cel">
          <p class="dva__rotulo">{{ d.nome }}</p>
          <component :is="d.comp" v-bind="propsDe(base)" />
        </div>
      </div>
    </section>

    <section v-for="d in desenhos" :key="d.id" class="dva__bloco" :data-desenho="d.id">
      <h2 class="dva__h2">{{ d.nome }}</h2>
      <p class="dva__nota">{{ d.nota }}</p>

      <!-- no lugar: o painel do topo da home, com o texto à esquerda -->
      <div v-if="!caso" class="dva__painel" data-bloco="painel">
        <div class="dva__texto">
          <p class="dva__p-sobre">Hoje, 03/11 · pregão encerrado</p>
          <p class="dva__p-frase">Tudo normal.</p>
          <p class="dva__p-veredito">{{ veredito(base) }}</p>
          <p class="dva__p-apoio">Nenhum papel seu caiu 5% ou mais hoje.</p>
        </div>
        <div class="dva__anel">
          <component :is="d.comp" v-bind="propsDe(base)" />
        </div>
      </div>

      <div class="dva__casos">
        <div v-for="c in casos" :key="c.id" class="dva__caso" :data-caso="c.id">
          <p class="dva__rotulo">{{ c.nome }}</p>
          <div class="dva__quadro">
            <component :is="d.comp" v-bind="propsDe(c)" />
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
.dva__sobre { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 700; }
.dva__titulo { margin: 10px 0 0; font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; }
.dva__sub { margin: 12px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); font-weight: 500; }
.dva__sub code { color: var(--nu-agora-texto); }
.dva__bloco { margin-top: clamp(48px, 6vw, 88px); padding-top: 28px; border-top: 1px solid var(--nu-agora-linha); }
.dva__h2 { margin: 0; font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; }
.dva__nota { margin: 8px 0 0; max-width: 72ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.dva__rotulo { margin: 0 0 14px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 700; }

.dva__lado-a-lado { margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 32px 28px; align-items: start; }

/* o painel da home (HomeAgora): o texto à esquerda, o desenho à direita, até 620 */
.dva__painel {
  margin-top: 28px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 24px clamp(24px, 3vw, 48px);
}
.dva__anel { justify-self: end; width: min(100%, 620px); }
.dva__p-sobre { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-eyebrow); font-weight: 700; }
.dva__p-frase { margin: 12px 0 0; font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.dva__p-veredito { margin: 18px 0 0; font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; }
.dva__p-apoio { margin: 16px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.5; }

.dva__casos { margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap: 48px clamp(24px, 3vw, 48px); }
.dva__caso { min-width: 0; }
.dva__quadro { width: min(100%, 620px); }

@media (max-width: 959px) {
  .dva__painel { grid-template-columns: minmax(0, 1fr); }
  .dva__anel { order: -1; justify-self: center; width: min(100%, 460px); }
}
</style>
