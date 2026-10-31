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
//
// 31/10/2026, pedido do dono: ao lado do Ibovespa, os outros indicadores do
// dia (dólar, IFIX, CDI, Bitcoin, os mesmos da faixa "Mercado agora", só com
// dado real), e o fechamento da IA volta aberto, nos quatro cartões de "O dia
// no mercado.", dentro desta mesma seção, com o "Ler o resumo do dia" e o
// "Receba o resumo no email ou WhatsApp".
import type { NuMoverTab } from '~/types/market'

// o briefing registra o onMounted dele: vem antes de qualquer await
const { briefing, loading: briefingLoading, real: briefingReal, amplitude } = useNuBriefing()
// o resumo por e-mail/WhatsApp: deslogado abre a folha de cadastro; logado,
// as preferências (o mesmo gesto do NuDaySection)
const { isAuthenticated } = useAuthState()
const { enabled: resumoAtivo, channelsLabel, hydrate: carregarPrefs, save: salvarPrefs } = useBriefingPrefs()
const folha = useCadastroFolha()
onMounted(carregarPrefs)
// os indicadores da faixa "Mercado agora" (hidratam no cliente; sem dado, somem)
const { items: faixa, loading: faixaCarregando } = useMarketTicker()

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

const INDICADORES = ['Dólar', 'IFIX', 'CDI', 'Bitcoin']
const indicadores = computed(() => INDICADORES
  .map((n) => faixa.value.find((i) => i.n === n))
  .filter((i): i is NonNullable<typeof i> => !!i))

// o fechamento da IA: os quatro cartões abertos e o texto inteiro no modal
const topicos = computed(() => (briefingReal.value ? dayTopicsFromNuBriefing(briefing.value).filter((t) => t.real) : []))
const aberto = ref(false)
const gatilho = ref<HTMLButtonElement | null>(null)
const blocos = computed(() => topicos.value.map((t) => ({ label: t.label, color: t.labelColor, html: t.modalHtml })))
function fechar() {
  aberto.value = false
  nextTick(() => gatilho.value?.focus())
}

const resumoAberto = ref(false)
const gatilhoResumo = ref<HTMLButtonElement | null>(null)
function receberResumo() {
  if (!isAuthenticated.value) {
    folha.abrir({ gesto: 'resumo' }, async (f) => {
      await salvarPrefs({ whatsapp: f.canal === 'whatsapp', email: f.canal === 'email' })
      return true
    }, '/')
    return
  }
  resumoAberto.value = true
}
function fecharResumo() {
  resumoAberto.value = false
  nextTick(() => gatilhoResumo.value?.focus())
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
      </div>
    </div>

    <!-- os indicadores do dia: o Ibovespa em destaque e os outros ao lado -->
    <div class="hbo__indicadores">
      <div v-if="ibov" class="hbo__pilula" :class="`hbo__pilula--${ibov.dir}`">
        <span class="hbo__pilula-pct">{{ ibov.pct }}</span>
        <span class="hbo__pilula-nome">Ibovespa<br>{{ ibov.value }} pontos</span>
      </div>
      <template v-if="faixaCarregando && !indicadores.length">
        <NuSkeleton v-for="i in 4" :key="`ski${i}`" tone="navy" variant="line" width="132px" height="62px" radius="tile" />
      </template>
      <div v-for="it in indicadores" :key="it.n" class="hbo__ind">
        <span class="hbo__ind-nome">{{ it.n }}</span>
        <span class="hbo__ind-linha">
          <span class="hbo__ind-valor">{{ it.v }}</span>
          <span v-if="it.pct" class="hbo__ind-pct" :class="`hbo__ind-pct--${it.dir}`">{{ it.pct }}</span>
        </span>
      </div>
    </div>

    <!-- o dia no mercado: o fechamento da IA em quatro cartões -->
    <div v-if="briefingLoading || topicos.length" class="hbo__dia">
      <div class="hbo__dia-cabeca">
        <h3 class="hbo__dia-titulo">O dia no mercado.</h3>
        <p v-if="briefingReal" class="hbo__dia-meta">{{ briefing.metaLine }}</p>
        <NuSkeleton v-else tone="navy" variant="line" width="min(360px, 80%)" height="15px" radius="chip" style="margin-top: 10px" />
      </div>
      <div class="hbo__dia-grade">
        <div v-for="i in (topicos.length ? 0 : 4)" :key="`skd${i}`" class="hbo__dia-cartao">
          <NuSkeleton tone="navy" variant="line" width="30px" height="30px" radius="tile" />
          <NuSkeleton tone="navy" variant="line" width="62%" height="32px" style="margin-top: 26px" />
          <NuSkeleton tone="navy" variant="text" :lines="3" last-width="72%" height="15px" style="margin-top: 12px" />
        </div>
        <div v-for="(t, i) in topicos" :key="i" class="hbo__dia-cartao">
          <span class="hbo__dia-icone" aria-hidden="true">
            <svg v-if="t.icon === 'trend'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
            <svg v-else-if="t.icon === 'bars'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L3 8.5h18z" /><path d="M4 21h16" /><path d="M6 21v-9" /><path d="M10 21v-9" /><path d="M14 21v-9" /><path d="M18 21v-9" /></svg>
            <svg v-else-if="t.icon === 'flame'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.6 4.6 5.5 7.5 5.5 10.4A5.5 5.5 0 0 1 6.5 13.4C6.5 10.5 8.4 7.6 12 3z" /></svg>
            <svg v-else width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15.4 8.6l-2 4.8-4.8 2 2-4.8z" /></svg>
          </span>
          <div v-if="t.stat" class="hbo__dia-stat">{{ t.stat }}</div>
          <div v-else-if="t.cardTitle" class="hbo__dia-titulo-cartao">{{ t.cardTitle }}</div>
          <p class="hbo__dia-texto">{{ t.cardBlurb }}</p>
        </div>
      </div>
      <div class="hbo__dia-acoes">
        <button
          v-if="topicos.length" ref="gatilho" type="button" class="hbo__ler hbo__ler--cheio"
          aria-haspopup="dialog" :aria-expanded="aberto" @click="aberto = true"
        >
          Ler o resumo do dia
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <button
          ref="gatilhoResumo" type="button" class="hbo__ler"
          :class="{ 'hbo__ler--ativo': isAuthenticated && resumoAtivo }"
          aria-haspopup="dialog" :aria-expanded="resumoAberto" @click="receberResumo"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
          <span v-if="!isAuthenticated">Receba o resumo no email ou WhatsApp</span>
          <span v-else-if="resumoAtivo">Resumo ativo · {{ channelsLabel }}</span>
          <span v-else>Ativar resumo diário</span>
        </button>
      </div>
    </div>

    <!-- as altas e as baixas, por classe -->
    <div v-if="lista || loading" class="hbo__listas-cabeca">
      <h3 class="hbo__listas-titulo">Quem mais subiu e caiu.</h3>
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


    <NuDayModal
      :open="aberto"
      eyebrow="Resumo do dia · Redentia"
      title="O dia no mercado"
      :date-line="briefing.metaLine"
      :blocks="blocos"
      @close="fechar"
    />
    <NuBriefingModal :open="resumoAberto" @close="fecharResumo" />
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

/* os indicadores: o Ibovespa grande e os outros em fichas da mesma altura */
.hbo__indicadores { display: flex; align-items: stretch; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
.hbo__indicadores .hbo__pilula { margin-top: 0; }
.hbo__ind {
  display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 120px;
  padding: 10px 16px; border-radius: 14px; background: var(--nu-cream-text-08);
}
.hbo__ind-nome { color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.hbo__ind-linha { display: flex; align-items: baseline; gap: 8px; }
.hbo__ind-valor { color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__ind-pct { font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__ind-pct--up { color: var(--nu-green-soft); }
.hbo__ind-pct--down { color: var(--nu-red-soft); }
.hbo__ind-pct--flat { color: var(--nu-cream-text-70); }

/* o dia no mercado: os quatro cartões do fechamento da IA */
.hbo__dia { margin-top: clamp(48px, 6vw, 72px); }
.hbo__dia-titulo, .hbo__listas-titulo { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.hbo__dia-meta { margin: 10px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; }
/* quatro numa linha no desktop, dois a dois no meio, um embaixo do outro no
   celular: nunca três e um sobrando */
.hbo__dia-grade { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 26px; }
@media (max-width: 1100px) { .hbo__dia-grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .hbo__dia-grade { grid-template-columns: 1fr; } }
.hbo__dia-cartao { display: flex; flex-direction: column; background: var(--nu-navy-2); border-radius: var(--nu-r-card-lg); padding: 26px 26px 30px; }
.hbo__dia-icone { color: var(--nu-cream-text); }
.hbo__dia-stat, .hbo__dia-titulo-cartao { margin-top: auto; padding-top: 28px; color: var(--nu-cream-text); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.hbo__dia-stat { font-size: var(--nu-fs-h2); font-variant-numeric: tabular-nums; }
.hbo__dia-titulo-cartao { font-size: var(--nu-fs-2xl); }
.hbo__dia-texto { margin: 12px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.hbo__dia-acoes { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 26px; }
.hbo__dia-acoes .hbo__ler { margin-top: 0; }
.hbo__ler--cheio { background: var(--nu-cream); border-color: var(--nu-cream); color: var(--nu-navy); }
.hbo__ler--cheio:hover { background: var(--nu-white); border-color: var(--nu-white); color: var(--nu-navy); }
.hbo__ler--ativo { color: var(--nu-green-soft); border-color: var(--nu-green-soft); }

.hbo__listas-cabeca { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-top: clamp(48px, 6vw, 72px); }
.hbo__listas-cabeca + .hbo__grade { margin-top: 22px; }

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
