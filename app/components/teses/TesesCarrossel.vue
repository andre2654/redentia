<script setup lang="ts">
// Seção-carrossel da página /teses (contrato: Redentia Teses Nu.dc.html).
// Os 3 carrosséis da tela ("Grandes ideias." / "Estratégias de investidores." /
// "Melhores pesquisas.") são ESTA estrutura com dados e labels diferentes:
// coluna de título à esquerda + trilho de cards navy em gradiente (ciclo
// --nu-tese-grad-1..3) que sangra até a borda direita + setas ±356px
// (356 = 340 de card + 16 de gap). Mesma anatomia do HomeTheses (Home logada),
// mas com card dirigido por href (gating login) e labels por seção.
import type { TesesCardVM } from '~/types/teses'

defineProps<{
  title: string
  sub: string
  cards: TesesCardVM[]
  /** eyebrow dos chips: "Ativos da tese" | "Ativos da carteira" */
  eyebrow: string
  /** CTA fantasma do card: "Ver tese" | "Ver carteira" | "Ver pesquisa" */
  cta: string
  /** fundo da banda (default white) */
  surface?: 'cream'
  /** enquanto os dados reais carregam: mostra cards-skeleton no lugar do seed */
  loading?: boolean
}>()

const railRef = ref<HTMLElement | null>(null)
// Capa quebrada/404 → cai pro gradiente navy (mesma degradação do NuTeseStrip),
// sem ícone de imagem partida. Rastreado por slug.
const failed = ref<Record<string, boolean>>({})
function scroll(d: number) {
  railRef.value?.scrollBy({ left: d * 356, behavior: 'smooth' })
}
function gradFor(i: number) {
  return `var(--nu-tese-grad-${(i % 3) + 1})`
}
</script>

<template>
  <section class="tcr" :class="{ 'tcr--cream': surface === 'cream' }">
    <div class="tcr__cols">
      <div class="tcr__head">
        <h2 class="tcr__title">{{ title }}</h2>
        <div class="tcr__sub">{{ sub }}</div>
      </div>

      <div class="tcr__right">
        <div ref="railRef" class="tcr__car">
          <!-- skeleton: cards-placeholder enquanto /theses carrega (sem seed falso) -->
          <div
            v-for="i in (loading ? 4 : 0)" :key="`sk${i}`"
            class="tcr__card tcr__card--sk" :style="{ background: gradFor(i) }"
          >
            <span class="tcr__inner">
              <span class="tcr__top">
                <NuSkeleton tone="navy" variant="line" width="86px" height="15px" />
                <NuSkeleton tone="navy" variant="line" width="64px" height="24px" radius="pill" />
              </span>
              <span class="tcr__sk-lower">
                <NuSkeleton tone="navy" variant="text" :lines="2" last-width="54%" height="24px" />
                <NuSkeleton tone="navy" variant="line" width="72px" height="10px" class="tcr__sk-eyebrow" />
                <span class="tcr__chips">
                  <NuSkeleton v-for="n in 4" :key="n" tone="navy" variant="line" width="50px" height="31px" radius="chip" />
                </span>
                <span class="tcr__bottom">
                  <span class="tcr__ret-wrap">
                    <NuSkeleton tone="navy" variant="line" width="88px" height="26px" />
                    <NuSkeleton tone="navy" variant="line" width="118px" height="11px" class="tcr__sk-since" />
                  </span>
                  <NuSkeleton tone="navy" variant="line" width="96px" height="42px" radius="pill" />
                </span>
              </span>
            </span>
          </div>
          <NuxtLink
            v-for="(c, i) in (loading ? [] : cards)" :key="c.slug"
            :to="c.href" class="tcr__card" :style="{ background: gradFor(i) }"
          >
            <img
              v-if="c.image && !failed[c.slug]" :src="c.image" :alt="c.title"
              class="tcr__img" loading="lazy" @error="failed[c.slug] = true"
            >
            <span v-if="c.image && !failed[c.slug]" class="tcr__scrim" />
            <span class="tcr__inner">
              <span class="tcr__top">
                <span class="tcr__top-l">
                  <span class="tcr__cat">{{ c.cat }}</span>
                  <span v-if="c.foll" class="tcr__follow">Seguindo</span>
                </span>
                <span v-if="c.pill" class="tcr__pill">{{ c.pill }}</span>
              </span>
              <span class="tcr__name">{{ c.title }}</span>
              <span v-if="c.tickers.length" class="tcr__eyebrow">{{ eyebrow }}</span>
              <span v-if="c.tickers.length" class="tcr__chips">
                <span v-for="tk in c.tickers" :key="tk" class="tcr__chip">{{ tk }}</span>
              </span>
              <span class="tcr__bottom">
                <span class="tcr__ret-wrap">
                  <span v-if="c.ret" class="tcr__ret">{{ c.ret }}</span>
                  <span class="tcr__since">{{ c.since }}</span>
                </span>
                <span class="tcr__ver">
                  {{ cta }}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
                </span>
              </span>
            </span>
          </NuxtLink>
        </div>
        <div v-if="!loading" class="tcr__nav">
          <button type="button" class="tcr__nav-btn" :aria-label="`${title} anteriores`" @click="scroll(-1)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" class="tcr__nav-btn" :aria-label="`Próximas ${title}`" @click="scroll(1)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* padding-right = 0: o trilho sangra até a borda direita; a nav respeita o gutter */
.tcr {
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) 0 clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  overflow: hidden; animation: nu-fade .5s ease both;
}
.tcr--cream { background: var(--nu-cream); }
.tcr__cols { display: flex; gap: clamp(28px, 4vw, 60px); align-items: center; flex-wrap: wrap; }
.tcr__head { flex: 0 1 380px; min-width: min(300px, 100%); padding-right: 22px; }
.tcr__title { margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.6vw, 60px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.04; }
.tcr__sub { color: var(--nu-gray); font-size: 16px; font-weight: 600; margin-top: 16px; line-height: 1.5; max-width: 340px; }

.tcr__right { flex: 1 1 480px; min-width: min(320px, 100%); }
.tcr__car { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 22px 10px 2px; }

.tcr__card {
  position: relative; display: flex; flex-direction: column; flex: 0 0 auto;
  width: min(340px, 80vw); min-height: 452px; border-radius: var(--nu-r-card);
  padding: 28px; scroll-snap-align: start; overflow: hidden;
}
/* Capa real da tese: sangra o card inteiro sobre o gradiente-base (que reaparece
   se a imagem faltar/404) + scrim de 4 stops pra legibilidade do texto branco. */
.tcr__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; z-index: 0; }
.tcr__scrim { position: absolute; inset: 0; background: var(--nu-thesis-scrim); pointer-events: none; z-index: 0; }
.tcr__inner { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; min-height: 0; }

.tcr__top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.tcr__top-l { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tcr__cat { color: var(--nu-white-92); font-size: 14.5px; font-weight: 800; }
.tcr__follow {
  display: inline-flex; align-items: center; background: var(--nu-green-soft-22); color: var(--nu-green-soft);
  font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.tcr__pill {
  display: inline-flex; align-items: center; background: var(--nu-white-16); color: var(--nu-white);
  font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: var(--nu-r-pill);
  white-space: nowrap; font-variant-numeric: tabular-nums;
}
.tcr__name { display: block; color: var(--nu-white); font-size: clamp(23px, 2vw, 27px); font-weight: 800; letter-spacing: -.4px; line-height: 1.16; margin-top: auto; }
.tcr__eyebrow { display: block; color: var(--nu-white-60); font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; margin-top: 20px; }
.tcr__chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
.tcr__chip {
  display: inline-flex; align-items: center; padding: 6px 11px; border-radius: 9px;
  font-size: 12.5px; font-weight: 800; letter-spacing: .3px; background: var(--nu-white-16);
  color: var(--nu-white); font-variant-numeric: tabular-nums;
}
.tcr__bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--nu-white-18); }
.tcr__ret { display: block; color: var(--nu-green-soft); font-size: 27px; font-weight: 800; letter-spacing: -.5px; line-height: 1; font-variant-numeric: tabular-nums; }
.tcr__since { display: block; color: var(--nu-white-62); font-size: 12px; font-weight: 600; margin-top: 5px; }
.tcr__ver {
  display: inline-flex; align-items: center; gap: 7px; border: 1.5px solid var(--nu-white-85); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 10px 17px; font-size: 13.5px; font-weight: 800; white-space: nowrap; flex-shrink: 0;
}

/* skeleton card (mesma anatomia, tone navy) */
.tcr__card--sk { pointer-events: none; }
.tcr__sk-lower { margin-top: auto; display: flex; flex-direction: column; }
.tcr__sk-eyebrow { margin-top: 20px; }
.tcr__sk-lower .tcr__chips { margin-top: 11px; }
.tcr__sk-lower .tcr__bottom { margin-top: 22px; padding-top: 20px; }
.tcr__sk-since { margin-top: 6px; }

.tcr__nav { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-right: clamp(22px, 5.5vw, 80px); }
.tcr__nav-btn {
  width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue); border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.tcr__nav-btn:hover { background: var(--nu-blue-hover); }
</style>
