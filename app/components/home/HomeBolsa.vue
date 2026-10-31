<script setup lang="ts">
// "Hoje na bolsa" (31/10/2026): o Mercado do app trazido para o site. Junta
// duas seções que a home tinha separadas, "O mercado hoje." (as altas e
// baixas, MercadoMovers) e "O dia no mercado." (o fechamento da IA em quatro
// cartões, NuDaySection), na língua do Agora: primeiro uma frase ("Bolsa em
// queda."), o Ibovespa numa pílula e quantas ações subiram e caíram; depois,
// para quem quer, as listas e o fechamento inteiro num toque.
//
// Dado só de verdade (regra 7): a frase e a pílula saem do Ibovespa que veio
// da API; a aba das listas só aparece quando aquela classe veio da API; o
// botão do fechamento só existe quando o briefing do dia carregou. O seed do
// useMercado segura a forma no SSR e nunca aparece como número.
//
// As altas e baixas saem no HTML do servidor (useNuMovers, cache de 2 min no
// /api/mercado-movers): são os links da home para os /asset.
// O CTA de cadastro que fechava as listas saiu: a página tem uma ação só.
import type { NuMoverTab } from '~/types/market'

// o briefing registra o onMounted dele: vem antes de qualquer await
const { briefing, loading: briefingLoading, real: briefingReal, amplitude } = useNuBriefing()
const { tabs, movers, indices, loading, reais, indicesReais } = await useNuMovers()

// o estado da bolsa no relógio de São Paulo, calculado uma vez no servidor
// (useState: a hidratação herda o mesmo texto, sem pulo na virada das 10h)
const momento = useState('home:momento-bolsa', () => momentoDaBolsa())

const ibov = computed(() => (indicesReais.value ? indices.value.find((i) => i.label === 'IBOV') ?? null : null))
const ibovPct = computed(() => numeroDoPct(ibov.value?.pct))
const frase = computed(() => fraseDaBolsa(ibovPct.value) ?? 'Hoje na bolsa.')
const fraseAmplitude = computed(() => fraseDaAmplitude(amplitude.value?.altas, amplitude.value?.quedas, momento.value))

// só as abas com dado de verdade, na ordem de sempre
const abas = computed(() => tabs.filter((t) => reais.value.includes(t)))
const aba = ref<NuMoverTab>('Ações')
const ativa = computed(() => (abas.value.includes(aba.value) ? aba.value : abas.value[0] ?? null))
const lista = computed(() => (ativa.value ? movers.value[ativa.value] : null))

// "Ver todos" leva ao ranking completo da classe da aba (os de 30 dias, que
// filtram por ?type=). Cripto não tem ranking: lá o link some.
const TIPO_DO_RANKING: Partial<Record<NuMoverTab, string>> = { Ações: 'acoes', FIIs: 'fiis', BDRs: 'bdrs' }
const tipoDoRanking = computed(() => (ativa.value ? TIPO_DO_RANKING[ativa.value] : undefined))
const verTodos = (slug: string) => ({ path: `/ranking/${slug}`, query: { type: tipoDoRanking.value } })

// o fechamento da IA, inteiro, no modal de sempre (NuDayModal)
const aberto = ref(false)
const gatilho = ref<HTMLButtonElement | null>(null)
const blocos = computed(() => dayTopicsFromNuBriefing(briefing.value)
  .filter((t) => t.real)
  .map((t) => ({ label: t.label, color: t.labelColor, html: t.modalHtml })))
function fechar() {
  aberto.value = false
  nextTick(() => gatilho.value?.focus())
}
</script>

<template>
  <section class="hbo" aria-labelledby="hbo-titulo">
    <div class="hbo__cabeca">
      <div class="hbo__estado">
        <p class="hbo__rotulo" :class="{ 'hbo__rotulo--aberta': momento.estado === 'aberta' }">{{ momento.rotulo }}</p>
        <h2 id="hbo-titulo" class="hbo__frase">{{ frase }}</h2>
        <p v-if="fraseAmplitude" class="hbo__sub">{{ fraseAmplitude }}</p>
        <NuSkeleton v-else-if="briefingLoading" tone="navy" variant="line" width="min(320px, 80%)" height="18px" radius="chip" class="hbo__sub-sk" />
        <div v-if="ibov" class="hbo__pilula" :class="`hbo__pilula--${ibov.dir}`">
          <span class="hbo__pilula-pct">{{ ibov.pct }}</span>
          <span class="hbo__pilula-nome">Ibovespa<br>{{ ibov.value }} pontos</span>
        </div>
      </div>
      <div v-if="abas.length > 1" class="hbo__abas" role="group" aria-label="Classe de ativo">
        <button
          v-for="t in abas" :key="t" type="button"
          class="hbo__aba" :class="{ 'hbo__aba--ativa': t === ativa }" :aria-pressed="t === ativa"
          @click="aba = t"
        >{{ t }}</button>
      </div>
    </div>

    <!-- carregando: a forma das duas listas -->
    <div v-if="loading && !lista" class="hbo__grade">
      <div v-for="c in 2" :key="`skc${c}`" class="hbo__cartao">
        <NuSkeleton tone="navy" variant="line" width="160px" height="22px" radius="chip" />
        <div class="hbo__linhas">
          <div v-for="i in 5" :key="`skl${i}`" class="hbo__linha hbo__linha--sk">
            <NuSkeleton tone="navy" variant="line" width="14px" height="15px" radius="chip" />
            <span class="hbo__id">
              <NuSkeleton tone="navy" variant="line" width="66px" height="15px" />
              <NuSkeleton tone="navy" variant="line" width="98px" height="12px" style="margin-top: 4px" />
            </span>
            <NuSkeleton tone="navy" variant="line" width="58px" height="16px" radius="chip" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="lista" class="hbo__grade">
      <div v-for="lado in (['gainers', 'losers'] as const)" :key="lado" class="hbo__cartao">
        <div class="hbo__cartao-cabeca">
          <span class="hbo__cartao-nome">{{ lado === 'gainers' ? 'Maiores altas' : 'Maiores baixas' }}</span>
          <NuxtLink v-if="tipoDoRanking" :to="verTodos(lado === 'gainers' ? 'maiores-altas-mes' : 'maiores-baixas-mes')" class="hbo__todos">Ver todos</NuxtLink>
        </div>
        <div class="hbo__linhas">
          <NuxtLink v-for="r in lista[lado]" :key="r.ticker" :to="`/asset/${r.ticker}`" class="hbo__linha">
            <span class="hbo__pos">{{ r.rank }}</span>
            <span class="hbo__id">
              <span class="hbo__ticker">{{ r.ticker }}</span>
              <span class="hbo__empresa">{{ r.name }}</span>
            </span>
            <span data-nu-hide class="hbo__preco">{{ r.price }}</span>
            <span class="hbo__pct" :class="`hbo__pct--${r.dir}`">{{ r.pct }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <button
      v-if="briefingReal && blocos.length" ref="gatilho" type="button" class="hbo__ler"
      aria-haspopup="dialog" :aria-expanded="aberto" @click="aberto = true"
    >
      Ler o fechamento escrito pela IA
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </button>

    <NuDayModal
      :open="aberto"
      eyebrow="Resumo do dia · Redentia"
      title="O dia no mercado"
      :date-line="briefing.metaLine"
      :blocks="blocos"
      @close="fechar"
    />
  </section>
</template>

<style scoped>
.hbo { background: var(--nu-navy); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hbo__cabeca { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; flex-wrap: wrap; }
.hbo__estado { min-width: 0; }
.hbo__rotulo { margin: 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 700; }
.hbo__rotulo--aberta { color: var(--nu-green-soft); }
.hbo__frase {
  margin: 10px 0 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hbo__sub { margin: 14px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.hbo__sub-sk { margin-top: 18px; }
/* a pílula do Ibovespa, como a do Mercado do app */
.hbo__pilula {
  display: inline-flex; align-items: center; gap: 12px; margin-top: 22px; padding: 10px 18px 10px 14px;
  border-radius: 14px; background: var(--nu-cream-text-10);
}
.hbo__pilula-pct { font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hbo__pilula--up .hbo__pilula-pct { color: var(--nu-green-soft); }
.hbo__pilula--down .hbo__pilula-pct { color: var(--nu-red-soft); }
.hbo__pilula-nome { color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.3; text-transform: uppercase; letter-spacing: .06em; font-variant-numeric: tabular-nums; }

.hbo__abas { display: flex; gap: 6px; flex-wrap: wrap; }
.hbo__aba {
  min-height: 40px; padding: 8px 18px; border: none; border-radius: var(--nu-r-pill); cursor: pointer;
  background: transparent; color: var(--nu-cream-text-50); font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.hbo__aba:hover { color: var(--nu-cream-text-85); }
.hbo__aba--ativa { background: var(--nu-cream); color: var(--nu-navy); font-weight: 800; }
.hbo__aba--ativa:hover { color: var(--nu-navy); }
.hbo__aba:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

.hbo__grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 16px; margin-top: 36px; }
.hbo__cartao { background: var(--nu-navy-2); border-radius: var(--nu-r-card-lg); padding: 26px 28px; }
.hbo__cartao-cabeca { display: flex; align-items: center; gap: 10px; }
.hbo__cartao-nome { color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.3px; }
.hbo__todos {
  margin-left: auto; padding: 7px 14px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-dense); font-weight: 700;
  color: var(--nu-cream-text-85); background: var(--nu-cream-text-08); white-space: nowrap; transition: background .16s;
}
.hbo__todos:hover { background: var(--nu-cream-text-12); color: var(--nu-cream-text); }
.hbo__linhas { margin-top: 12px; }
.hbo__linha {
  display: flex; align-items: center; gap: 14px; min-height: 52px; padding: 10px 12px; margin: 0 -12px;
  border-top: 1px solid var(--nu-cream-text-12); border-radius: var(--nu-r-card); transition: background .16s;
}
.hbo__linhas > .hbo__linha:first-child { border-top: none; }
.hbo__linha:hover { background: var(--nu-cream-text-08); }
.hbo__linha--sk { pointer-events: none; }
.hbo__linha--sk .hbo__id { display: flex; flex-direction: column; }
.hbo__pos { width: 18px; flex-shrink: 0; color: var(--nu-cream-text-45); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.hbo__id { flex: 1; min-width: 0; overflow: hidden; }
.hbo__ticker { display: block; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; }
.hbo__empresa { display: block; margin-top: 1px; color: var(--nu-cream-text-50); font-size: var(--nu-fs-dense); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hbo__preco { color: var(--nu-cream-text-85); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__pct { flex-shrink: 0; min-width: 64px; text-align: right; font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__pct--up { color: var(--nu-green-soft); }
.hbo__pct--down { color: var(--nu-red-soft); }

/* o fechamento: um botão de texto, sem competir com a chamada da página */
.hbo__ler {
  display: inline-flex; align-items: center; gap: 10px; min-height: 52px; margin-top: 30px; padding: 0 24px;
  border: 1.5px solid var(--nu-cream-text-12); border-radius: var(--nu-r-pill); background: transparent; cursor: pointer;
  color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, border-color .2s;
}
.hbo__ler:hover { background: var(--nu-cream-text-08); border-color: var(--nu-cream-text-45); }
.hbo__ler:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.hbo__ler svg { transition: transform .2s ease; }
.hbo__ler:hover svg { transform: translateX(3px); }

/* no celular, três por lista: o resto está no "Ver todos" */
@media (max-width: 760px) {
  .hbo__linhas > .hbo__linha:nth-child(n+4) { display: none; }
  .hbo__cartao { padding: 22px 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .hbo__ler svg { transition: none; }
}
</style>
