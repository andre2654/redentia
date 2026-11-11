<script setup lang="ts">
// "Seus ativos." — faixa da home LOGADA com os ativos que a pessoa segue
// (29/09/2026). É o motivo concreto pra voltar: a cotação do último pregão
// de cada ativo seguido, logo abaixo do hero, a um toque do /asset.
//
// Carga 100% client (o mesmo estado do botão do hero, useWatchlist): a home já
// é private/no-store, mas a lista é opcional e curta, e renderizar nada até
// ela chegar evita skeleton que pisca e some pra quem não segue nada. Sem
// ativo seguido a faixa some (regra 7) — a não ser que o gancho do primeiro
// uso esteja de pé, que é justamente o vazio acionável.
//
// Degrada até o Backend enriquecer o GET /watchlist: item sem nome/cotação
// mostra o ticker e busca o resto no perfil público (useWatchlist.enrich);
// campo que não veio some, nunca vira zero.
//
// Aportou, segunda rodada (11/11/2026): a faixa é a faixa quente da marca
// (--nu-band), no contêiner de 1.240 px das outras seções da home (era o recuo
// próprio de 80 px), com os cartões brancos por cima (raio 22, a sombra de
// cartão branco em painel). Assim ela separa o topo creme de quem tem conta do
// que vem abaixo, sem faixa branca de ponta a ponta.
import type { WatchlistEntry } from '~/types/watchlist'

const wl = useWatchlist()
const montado = ref(false)
const ganchoVisivel = ref(false)
const erro = ref('')
const enriquecendo = ref(false)

async function enriquecer() {
  enriquecendo.value = true
  try {
    await wl.enrich()
  } finally {
    enriquecendo.value = false
  }
}

onMounted(async () => {
  montado.value = true
  await wl.load()
  void enriquecer()
})
// ativo seguido depois (pelo gancho logo abaixo) ganha cotação também
watch(() => (wl.items.value ?? []).map((i) => i.ticker).join(','), () => {
  if (montado.value) void enriquecer()
})

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface Card {
  ticker: string
  name: string | null
  priceFmt: string | null
  changeFmt: string | null
  dir: 'up' | 'down'
  priceAt: string | null
  /** sem cotação ainda e com busca em voo → skeleton no lugar do número */
  loading: boolean
}

function toCard(i: WatchlistEntry): Card {
  const cur = i.type?.startsWith('US_') ? 'US$' : 'R$'
  // 'd/m' do ProfileResource ou 'YYYY-MM-DD' → 'DD/MM' (a data some se vier torta)
  const iso = i.priceAt && /^\d{4}-\d{2}-\d{2}/.test(i.priceAt) ? `${i.priceAt.slice(8, 10)}/${i.priceAt.slice(5, 7)}` : null
  const dm = iso ?? (i.priceAt && /^\d{1,2}\/\d{1,2}$/.test(i.priceAt) ? i.priceAt : null)
  return {
    ticker: i.ticker,
    name: i.name,
    priceFmt: i.price != null ? `${cur} ${nf2.format(i.price)}` : null,
    changeFmt: i.changePct != null ? pctFmt(i.changePct) : null,
    dir: dirOf(i.changePct ?? 0),
    priceAt: dm,
    loading: i.price == null && enriquecendo.value,
  }
}

const cards = computed(() => (montado.value ? (wl.items.value ?? []).map(toCard) : []))
const visivel = computed(() => cards.value.length > 0 || ganchoVisivel.value)

async function deixar(t: string) {
  if (wl.isPending(t)) return
  erro.value = ''
  const res = await wl.unfollow(t)
  if (!res.ok && !res.auth) erro.value = res.message
}
</script>

<template>
  <section v-show="visivel" id="seguindo" class="sgf" :class="{ 'sgf--so-gancho': !cards.length }">
    <template v-if="cards.length">
      <NuSectionHeading eyebrow="Você segue">Seus ativos.
        <template #dek>A cotação do último pregão de cada ativo que você segue.</template>
      </NuSectionHeading>

      <ul class="sgf__row">
        <li v-for="c in cards" :key="c.ticker" class="sgf__card">
          <NuxtLink :to="`/asset/${c.ticker}`" class="sgf__link">
            <span class="sgf__top">
              <NuAssetLogo :ticker="c.ticker" :letter="c.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="40" :radius="12" />
              <span class="sgf__id">
                <span class="sgf__ticker">{{ c.ticker }}</span>
                <span v-if="c.name" class="sgf__name">{{ c.name }}</span>
              </span>
            </span>
            <span v-if="c.priceFmt" class="sgf__price">{{ c.priceFmt }}</span>
            <NuSkeleton v-else-if="c.loading" variant="line" width="112px" height="28px" radius="chip" class="sgf__sk" />
            <span v-if="c.changeFmt || c.priceAt" class="sgf__meta">
              <span v-if="c.changeFmt" class="sgf__chg" :class="`sgf__chg--${c.dir}`">{{ c.changeFmt }}</span>
              <span v-if="c.priceAt" class="sgf__date">{{ c.priceAt }}</span>
            </span>
          </NuxtLink>
          <button
            type="button" class="sgf__unstar" :aria-label="`Deixar de seguir ${c.ticker}`"
            :aria-busy="wl.isPending(c.ticker) || undefined" @click="deixar(c.ticker)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.3l2.63 5.52 6.07.77-4.45 4.2 1.13 6.02L12 16.9l-5.38 2.91 1.13-6.02-4.45-4.2 6.07-.77z" /></svg>
          </button>
        </li>
      </ul>
      <p v-if="erro" class="sgf__err" role="alert">{{ erro }}</p>
    </template>

    <div class="sgf__gancho" :class="{ 'sgf__gancho--solo': !cards.length }">
      <!-- sobre a faixa quente o cartão do gancho é o branco (surface "cream" = pousa num painel creme) -->
      <SeguirGancho surface="cream" @visivel="ganchoVisivel = $event" />
    </div>
  </section>
</template>

<style scoped>
.sgf {
  background: var(--nu-band);
  padding: clamp(56px, 6vw, 88px) max(32px, calc((100% - 1176px) / 2));
  animation: nu-fade .5s ease both;
}
@media (max-width: 760px) { .sgf { padding-inline: 20px; } }
/* só o gancho (ninguém seguido ainda): banda mais baixa, o card é o conteúdo */
.sgf--so-gancho { padding-top: clamp(36px, 4.5vw, 56px); padding-bottom: clamp(36px, 4.5vw, 56px); }

/* a faixa rola, a página não (regra 10) */
.sgf__row {
  list-style: none; margin: clamp(28px, 3.5vw, 44px) -6px 0; padding: 6px 6px 10px;
  display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x proximity;
}
.sgf__card {
  position: relative; flex: 0 0 auto; width: min(236px, 72vw);
  background: var(--nu-white); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-quente);
  scroll-snap-align: start; transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
  animation: nu-fade .5s ease backwards;
}
.sgf__card:nth-child(2) { animation-delay: 60ms; }
.sgf__card:nth-child(3) { animation-delay: 120ms; }
.sgf__card:nth-child(4) { animation-delay: 180ms; }
.sgf__card:nth-child(n + 5) { animation-delay: 240ms; }
.sgf__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.sgf__link { display: flex; flex-direction: column; gap: 14px; padding: 20px 20px 18px; min-height: 100%; }
.sgf__top { display: flex; align-items: center; gap: 12px; padding-right: 34px; min-width: 0; }
.sgf__id { display: flex; flex-direction: column; min-width: 0; }
.sgf__ticker { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; font-variant-numeric: tabular-nums; }
.sgf__name { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sgf__price {
  color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -.5px;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.sgf__sk { display: block; }
.sgf__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sgf__chg {
  display: inline-flex; align-items: center; font-size: 14px; font-weight: 700;
  padding: 4px 9px; border-radius: var(--nu-r-tag); font-variant-numeric: tabular-nums; white-space: nowrap;
}
.sgf__chg--up { background: var(--nu-green-bg); color: var(--nu-green-text); }
.sgf__chg--down { background: var(--nu-red-bg); color: var(--nu-red-text); }
.sgf__date { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; }

.sgf__unstar {
  position: absolute; top: 10px; right: 8px; width: 44px; height: 44px;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; border-radius: 50%; cursor: pointer;
  background: transparent; color: var(--nu-blue); transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.sgf__unstar:active { transform: scale(.92); }
.sgf__unstar:hover { background: var(--nu-blue-bg); }
.sgf__unstar[aria-busy='true'] { cursor: progress; }
.sgf__unstar:focus-visible, .sgf__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.sgf__link { border-radius: var(--nu-r-panel); }
@media (prefers-reduced-motion: reduce) { .sgf__card { animation: none; transition: none; } }

.sgf__err { margin: 14px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }

.sgf__gancho { margin-top: clamp(24px, 3vw, 36px); }
.sgf__gancho:empty, .sgf__gancho--solo { margin-top: 0; }
/* a margem de cima do gancho é a desta faixa (a do /asset é dele) */
.sgf__gancho :deep(.sgg) { margin-top: 0; }
</style>
