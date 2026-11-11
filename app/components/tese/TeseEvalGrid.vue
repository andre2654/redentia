<script setup lang="ts">
// "Avaliação por ativo" (design + refinos do dono): cards compactos com logo
// REAL da empresa (NuAssetLogo) + ticker/nome + NuBadge + texto + 'POR QUÊ'.
// O card inteiro leva pro /asset/{ticker} (seta azul dos movers).
//
// PAYWALL (dono 2026-07-14): pro ANÔNIMO, só os 2 primeiros ativos ficam
// nítidos; os seguintes entram embaçados (tease) e um card de GATE força o
// cadastro pra abrir o resto (avaliação de todos os ativos, sinais de risco,
// diário). Logado vê tudo, sem gate.
import { NuxtLink } from '#components'
import type { TeseEvalVM } from '~/types/tese'

const props = withDefaults(defineProps<{
  evalSection: TeseEvalVM
  studiesCount?: number
  // a tese tem relatório completo? (só então o gate promete o relatório)
  hasReport?: boolean
}>(), { studiesCount: 0, hasReport: false })
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()

const { isAuthenticated } = useAuthState()
const route = useRoute()
const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

// /asset só existe pra tickers B3 (PETR4, CATP34, E1TN34…) — formato validado
// pelo middleware da página de ativo; fora do formato, sem link.
const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/
function hrefFor(ticker: string): string | null {
  return TICKER_RE.test(ticker) ? `/asset/${ticker}` : null
}

const FREE = 2 // ativos nítidos pro anônimo
const TEASE = 3 // ativos embaçados de amostra antes do gate
const total = computed(() => props.evalSection.cards.length)
// Logado: todos. Anônimo: os FREE nítidos + alguns embaçados (tease).
const cards = computed(() =>
  isAuthenticated.value ? props.evalSection.cards : props.evalSection.cards.slice(0, FREE + TEASE))
function isLocked(i: number): boolean {
  return !isAuthenticated.value && i >= FREE
}
const showGate = computed(() => !isAuthenticated.value && total.value > FREE)
</script>

<template>
  <section class="tev">
    <div class="tev__head">
      <NuSectionHeading>Avaliação<br>por ativo.</NuSectionHeading>
      <span class="tev__meta">{{ evalSection.metaLine }}</span>
    </div>

    <div class="tev__grid">
      <component
        :is="!isLocked(i) && hrefFor(c.ticker) ? NuxtLink : 'article'"
        v-for="(c, i) in cards" :key="c.ticker"
        :to="!isLocked(i) && hrefFor(c.ticker) ? hrefFor(c.ticker)! : undefined"
        v-contexto-chat="isLocked(i) ? null : { id: `tese-ativo:${sobre}:${c.ticker}`, tipo: 'tese', rotulo: rotuloCurto(`${c.ticker} na tese`), texto: [`${c.ticker} (${c.name}) na tese ${sobre}: ${c.badgeText}`, c.txt, c.pq ? `Por quê: ${c.pq}` : ''].filter(Boolean).join('\n') }"
        class="tev__card"
        :class="{
          'tev__card--hi': c.highlight && !isLocked(i),
          'tev__card--link': !isLocked(i) && hrefFor(c.ticker),
          'tev__card--locked': isLocked(i),
        }"
        :aria-hidden="isLocked(i) || undefined"
        :tabindex="isLocked(i) ? -1 : undefined"
      >
        <div class="tev__card-head">
          <span class="tev__id">
            <NuAssetLogo :ticker="c.ticker" :letter="c.letter" :tile-bg="c.tileBg" :tile-fg="c.tileFg" :size="44" :radius="14" />
            <span class="tev__names">
              <span class="tev__ticker">{{ c.ticker }}</span>
              <span class="tev__name">{{ c.name }}</span>
            </span>
          </span>
          <NuBadge :variant="c.badgeVariant" size="eval">{{ c.badgeText }}</NuBadge>
          <span v-if="!isLocked(i) && hrefFor(c.ticker)" class="tev__go" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </div>
        <div class="tev__txt">{{ c.txt }}</div>
        <div v-if="c.pq" class="tev__why">
          <span class="tev__why-lbl">Por quê</span>
          <span class="tev__why-txt">{{ c.pq }}</span>
        </div>
      </component>
    </div>

    <!-- GATE (só anônimo): força o cadastro pra abrir o resto da tese -->
    <NuFaixaMarca v-if="showGate" rotulo="Tese completa" como="p" :altura="56" class="tev__gate">
      <div class="tev__gate-in">
        <div class="tev__gate-left">
          <h2 class="tev__gate-title">Você viu {{ FREE }} dos {{ total }} ativos.</h2>
          <p class="tev__gate-sub">Crie sua conta grátis para abrir a tese completa: a avaliação de todos os ativos, os sinais de risco, {{ hasReport ? 'o relatório completo' : 'o risco central' }} e o diário, revalidado todo dia pela Aportou.</p>
          <div class="tev__gate-actions">
            <NuBotaoSeta :to="loginTo" variante="azul" tamanho="m">Criar conta grátis</NuBotaoSeta>
            <NuxtLink :to="loginTo" class="tev__gate-ghost">Já tenho conta</NuxtLink>
          </div>
          <span class="tev__gate-micro">Grátis, sem cartão de crédito</span>
        </div>
        <ul class="tev__gate-list">
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Avaliação dos <b>{{ total }} ativos</b> da carteira</span></li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Sinais de risco e risco central</span></li>
          <li v-if="hasReport"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>O <b>relatório completo</b> da tese</span></li>
          <li v-if="studiesCount > 0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Diário da tese <b>· {{ studiesCount }} estudos</b></span></li>
          <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Acompanhe e receba alertas</span></li>
        </ul>
      </div>
    </NuFaixaMarca>
  </section>
</template>

<style scoped>
/* Aportou (11/11/2026): a banda é o creme da página, os cartões são creme com a
   sombra quente, o destaque é o fio cobalto, e o bloqueio do visitante é o
   cartão carvão com a faixa da marca (NuFaixaMarca), com a pílula da seta. */
.tev {
  background: var(--nu-band);
  padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.tev__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tev__meta { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }

/* grid compacto: colunas menores (cabem 3 em telas largas), menos padding */
.tev__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
  gap: 14px; margin-top: 36px;
}
/* overflow: um selo comprido demais (texto do dado) não vaza para o cartão do lado */
.tev__card { display: block; background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 20px 22px; box-shadow: var(--nu-shadow-quente); overflow: hidden; }
.tev__card--hi { box-shadow: inset 0 0 0 2px var(--nu-blue), var(--nu-shadow-quente); }
.tev__card--link { transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1); }
.tev__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tev__card--hi.tev__card--link:hover { box-shadow: inset 0 0 0 2px var(--nu-blue), var(--nu-shadow-card); }
.tev__card--link:hover .tev__ticker { color: var(--nu-blue-text); }
.tev__card--link:hover .tev__go { background: var(--nu-blue-hover); }
.tev__card--link:hover .tev__go svg { transform: translateX(2px); }
/* embaçado (anônimo): tease não-interativo */
.tev__card--locked { filter: blur(5px); opacity: .5; pointer-events: none; user-select: none; }

.tev__card-head { display: flex; align-items: center; gap: 12px; }
.tev__id { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.tev__names { flex: 1; min-width: 0; }
.tev__ticker { display: block; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: 0.02em; white-space: nowrap; transition: color .2s; }
.tev__name {
  display: block; color: var(--nu-gray); font-size: 13.5px; font-weight: 500;
  margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tev__go {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center; transition: background .16s;
}
.tev__go svg { transition: transform .2s ease; }
.tev__txt { color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; margin-top: 12px; }
.tev__why { display: flex; gap: 10px; border-top: 1.5px solid var(--nu-line-2); margin-top: 14px; padding-top: 12px; }
.tev__why-lbl {
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; flex-shrink: 0; margin-top: 3px;
}
.tev__why-txt { color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.5; }

/* ——— o bloqueio do visitante: o cartão carvão com a faixa da marca ——— */
.tev__gate { margin-top: 20px; }
.tev__gate-in {
  padding: clamp(24px, 3vw, 40px) clamp(24px, 3.6vw, 48px) clamp(28px, 3.4vw, 44px);
  display: flex; gap: clamp(28px, 4vw, 72px); align-items: center; flex-wrap: wrap;
}
.tev__gate-left { flex: 1 1 380px; min-width: min(320px, 100%); }
.tev__gate-title {
  margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h3);
  font-weight: 800; letter-spacing: -0.025em; line-height: 1.05;
}
.tev__gate-sub {
  margin: 14px 0 0; color: var(--nu-on-dark); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500;
  line-height: 1.5; max-width: 48ch;
}
.tev__gate-actions { display: flex; align-items: center; gap: 12px 24px; flex-wrap: wrap; margin-top: 26px; }
.tev__gate-ghost {
  display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: 700;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-dark-chip-line);
  transition: text-decoration-color .2s ease;
}
.tev__gate-ghost:hover { color: var(--nu-white); text-decoration-color: currentColor; }
.tev__gate-micro { display: block; margin-top: 14px; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 500; }

.tev__gate-list {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 14px; flex: 0 1 360px; min-width: min(280px, 100%);
}
.tev__gate-list li { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-on-dark); font-size: 15.5px; font-weight: 600; line-height: 1.4; }
.tev__gate-list svg { color: var(--nu-green-soft); flex-shrink: 0; margin-top: 1px; }
.tev__gate-list b { color: var(--nu-white); font-weight: 800; }
@media (prefers-reduced-motion: reduce) {
  .tev__card--link, .tev__go svg { transition: none; }
  .tev__card--link:hover, .tev__card--link:hover .tev__go svg { transform: none; }
}
</style>
