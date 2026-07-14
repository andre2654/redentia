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
}>(), { studiesCount: 0 })

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
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
    <div v-if="showGate" class="tev__gate">
      <div class="tev__gate-glow" aria-hidden="true" />
      <div class="tev__gate-left">
        <span class="tev__gate-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="11" width="15" height="10" rx="2.2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          Tese completa
        </span>
        <h2 class="tev__gate-title">Você viu {{ FREE }} dos {{ total }} ativos.</h2>
        <p class="tev__gate-sub">Crie sua conta grátis para abrir a avaliação de todos os ativos, os sinais de risco e o diário da tese, revalidado todo dia pela Redentia.</p>
        <div class="tev__gate-actions">
          <NuxtLink :to="loginTo" class="tev__gate-cta">
            Criar conta grátis<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </NuxtLink>
          <NuxtLink :to="loginTo" class="tev__gate-cta tev__gate-cta--ghost">Já tenho conta</NuxtLink>
        </div>
        <span class="tev__gate-micro">Grátis, sem cartão de crédito</span>
      </div>
      <ul class="tev__gate-list">
        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Avaliação dos <b>{{ total }} ativos</b> da carteira</span></li>
        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Sinais de risco e risco central</span></li>
        <li v-if="studiesCount > 0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Diário da tese <b>· {{ studiesCount }} estudos</b></span></li>
        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg><span>Acompanhe e receba alertas</span></li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.tev {
  background: var(--nu-white);
  padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.tev__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tev__meta { color: var(--nu-gray); font-size: 15.5px; font-weight: 600; }

/* grid compacto: colunas menores (cabem 3 em telas largas), menos padding */
.tev__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
  gap: 14px; margin-top: 34px;
}
.tev__card { display: block; background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 20px 22px; }
.tev__card--hi { border: 2px solid var(--nu-blue); }
.tev__card--link { transition: transform .15s, box-shadow .2s; }
.tev__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tev__card--link:hover .tev__ticker { color: var(--nu-blue); }
.tev__card--link:hover .tev__go { background: var(--nu-blue-hover); }
/* embaçado (anônimo): tease não-interativo */
.tev__card--locked { filter: blur(5px); opacity: .5; pointer-events: none; user-select: none; }

.tev__card-head { display: flex; align-items: center; gap: 12px; }
.tev__id { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.tev__names { flex: 1; min-width: 0; }
.tev__ticker { display: block; color: var(--nu-ink); font-size: 17px; font-weight: 800; white-space: nowrap; transition: color .2s; }
.tev__name {
  display: block; color: var(--nu-gray); font-size: 13px; font-weight: 600;
  margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tev__go {
  width: 28px; height: 28px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; transition: background .16s;
}
.tev__txt { color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.55; margin-top: 12px; }
.tev__why { display: flex; gap: 9px; border-top: 1.5px solid var(--nu-cream-2); margin-top: 13px; padding-top: 12px; }
.tev__why-lbl {
  color: var(--nu-blue); font-size: 11px; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; flex-shrink: 0; margin-top: 2px;
}
.tev__why-txt { color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.5; }

/* ——— gate do anônimo (card navy) ——— */
.tev__gate {
  position: relative; overflow: hidden;
  background: var(--nu-navy); border-radius: var(--nu-r-card-lg);
  padding: clamp(28px, 3.6vw, 48px);
  margin-top: 16px;
  display: flex; gap: clamp(28px, 4vw, 72px); align-items: center; flex-wrap: wrap;
}
.tev__gate-glow {
  position: absolute; top: -60px; right: -40px; width: 320px; height: 320px;
  border-radius: 50%; background: radial-gradient(circle, rgba(47, 107, 255, .55), transparent 70%);
  pointer-events: none;
}
.tev__gate-left { position: relative; flex: 1 1 380px; min-width: min(320px, 100%); }
.tev__gate-badge {
  display: inline-flex; align-items: center; gap: 7px;
  color: var(--nu-green-soft); font-size: 12px; font-weight: 800;
  letter-spacing: .1em; text-transform: uppercase;
  background: var(--nu-green-bg); border-radius: var(--nu-r-pill); padding: 6px 12px;
}
.tev__gate-title {
  margin: 16px 0 0; color: var(--nu-cream-text); font-size: clamp(26px, 3.2vw, 40px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.04;
}
.tev__gate-sub {
  margin: 12px 0 0; color: var(--nu-cream-text-82); font-size: 16px; font-weight: 500;
  line-height: 1.55; max-width: 46ch;
}
.tev__gate-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 26px; }
.tev__gate-cta {
  display: inline-flex; align-items: center; gap: 9px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 28px; font-size: 16px; font-weight: 800;
  transition: background .2s, transform .15s;
}
.tev__gate-cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.tev__gate-cta--ghost {
  background: transparent; color: var(--nu-cream-text);
  border: 2px solid var(--nu-cream-text-45); padding: 13px 26px;
}
.tev__gate-cta--ghost:hover { background: var(--nu-cream-text-10); color: var(--nu-cream-text); }
.tev__gate-micro { display: block; margin-top: 16px; color: var(--nu-cream-text-50); font-size: 13px; font-weight: 600; }

.tev__gate-list {
  position: relative; list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 16px; flex: 0 1 340px; min-width: min(280px, 100%);
}
.tev__gate-list li { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-cream-text-85); font-size: 15.5px; font-weight: 600; }
.tev__gate-list svg { color: var(--nu-green-soft); flex-shrink: 0; margin-top: 2px; }
.tev__gate-list b { color: var(--nu-cream-text); font-weight: 800; }
</style>
