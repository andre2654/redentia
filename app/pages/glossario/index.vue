<script setup lang="ts">
// /glossario — hub A-Z do glossário do investidor (KIT 2026-07-14).
// Hero Nu + contagem + nav A-Z sticky (letra sem termo desabilitada) + busca
// client-side instantânea (filtra por termo E definição) + seções por letra
// com grid de cards (termo + short → /glossario/{slug}).
//
// SEO: SSR com todos os termos no HTML, canonical /glossario, JSON-LD
// DefinedTermSet + ItemList (o hub é a página-índice de todos os DefinedTerm).
// routeRules '/glossario' cacheia 86400s (conteúdo estável).
import { allTerms, byLetter, LETTERS, ALPHABET, TERM_COUNT } from '~/content/glossario'

const origin = useSiteOrigin()

usePageSeo({
  title: `Glossário do investidor: ${TERM_COUNT} termos da bolsa explicados`,
  description: `Dicionário de investimentos da ${MARCA.nome}: ${TERM_COUNT} termos do mercado financeiro, de Dividend Yield a P/L, explicados de forma clara e com exemplos. Busca A-Z instantânea.`,
  path: '/glossario',
  structuredData: [
    {
      '@type': 'DefinedTermSet',
      name: `Glossário do investidor ${MARCA.nome}`,
      description: 'Termos do mercado financeiro brasileiro definidos de forma clara e honesta.',
      hasDefinedTerm: allTerms.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        description: t.short,
        url: `${origin}/glossario/${t.slug}`,
      })),
    },
    {
      '@type': 'ItemList',
      itemListElement: allTerms.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.term,
        url: `${origin}/glossario/${t.slug}`,
      })),
    },
  ],
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Glossário', path: '/glossario' },
  ],
})

// ——— busca instantânea (client-side; SSR mostra tudo) ———
const query = ref('')
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const filtered = computed(() => {
  const q = norm(query.value.trim())
  if (!q) return allTerms
  return allTerms.filter(
    (t) => norm(t.term).includes(q) || norm(t.short).includes(q),
  )
})

// seções por letra, respeitando o filtro (só letras com resultado aparecem)
const sections = computed(() => {
  const base = query.value.trim() ? groupByLetter(filtered.value) : byLetter
  return LETTERS.map((letter) => ({ letter, terms: base.get(letter) ?? [] })).filter(
    (s) => s.terms.length > 0,
  )
})

function groupByLetter(list: typeof allTerms) {
  const m = new Map<string, typeof allTerms>()
  for (const t of list) {
    const arr = m.get(t.letter)
    if (arr) arr.push(t)
    else m.set(t.letter, [t])
  }
  return m
}

// letras ativas (têm termo NO filtro atual) pro nav A-Z
const activeLetters = computed(() => new Set(sections.value.map((s) => s.letter)))

const totalShown = computed(() => filtered.value.length)
</script>

<template>
  <div class="glx">
    <NuPageHero eyebrow="Glossário" size="lg">
      <template #title>O glossário do investidor</template>
      <template #default>
        <p class="glx__hero-sub">
          {{ TERM_COUNT }} termos do mercado financeiro brasileiro, de Dividend Yield a P/L,
          explicados sem juridiquês e com exemplos. Busque ou navegue de A a Z.
        </p>
        <div class="glx__search">
          <svg class="glx__search-ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
          <input
            v-model="query"
            type="search"
            class="glx__search-input"
            placeholder="Buscar termo (ex.: dividendos, P/L, vacância)"
            aria-label="Buscar termo no glossário"
          >
          <button v-if="query" type="button" class="glx__search-clear" aria-label="Limpar busca" @click="query = ''">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </template>
    </NuPageHero>

    <!-- nav A-Z sticky -->
    <nav class="glx__az" aria-label="Índice alfabético">
      <div class="glx__az-inner">
        <a
          v-for="l in ALPHABET"
          :key="l"
          :href="activeLetters.has(l) ? `#letra-${l}` : undefined"
          class="glx__az-item"
          :class="{ 'glx__az-item--off': !activeLetters.has(l) }"
          :aria-disabled="!activeLetters.has(l)"
        >{{ l }}</a>
      </div>
    </nav>

    <div class="glx__body">
      <div class="glx__count">
        <span v-if="!query">{{ TERM_COUNT }} termos no glossário</span>
        <span v-else-if="totalShown === 0">Nenhum termo encontrado para "{{ query }}"</span>
        <span v-else>{{ totalShown }} {{ totalShown === 1 ? 'termo' : 'termos' }} para "{{ query }}"</span>
      </div>

      <p v-if="totalShown === 0" class="glx__empty">
        Tente outra palavra, ou pergunte direto à
        <NuxtLink to="/busca" class="glx__empty-link">IA da Aportou</NuxtLink>.
      </p>

      <section v-for="sec in sections" :id="`letra-${sec.letter}`" :key="sec.letter" class="glx__section">
        <div class="glx__letter">{{ sec.letter }}</div>
        <div class="glx__grid">
          <NuxtLink
            v-for="t in sec.terms"
            :key="t.slug"
            :to="`/glossario/${t.slug}`"
            class="glx__card"
          >
            <span class="glx__card-term">{{ t.term }}</span>
            <span class="glx__card-short">{{ t.short }}</span>
            <span class="glx__card-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* O hub na personalidade da Aportou (11/11/2026): creme da página, a busca no
   padrão de campo (borda de 1,5px, anel cobalto no foco), o A-Z com fios de
   1,5px e cartões creme com a sombra quente. Estrutura e conteúdo iguais. */
/* --lado: a mesma coluna do topo e do rodapé (1240px centrada, margem fluida abaixo de 1400px) */
.glx { --lado: max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)); background: var(--nu-page); }

/* hero extras (busca dentro do slot de ações do NuPageHero) */
.glx__hero-sub {
  color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500;
  line-height: 1.45; max-width: 620px;
}
.glx__search {
  display: flex; align-items: center; gap: 12px; margin-top: 28px;
  max-width: 560px; min-height: 56px; background: var(--nu-white);
  border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-pill);
  padding: 0 8px 0 20px; transition: border-color .2s, box-shadow .2s;
}
.glx__search:focus-within { border-color: var(--nu-blue); box-shadow: 0 0 0 3px var(--nu-blue-tint); }
.glx__search-ic { color: var(--nu-gray); flex-shrink: 0; }
.glx__search-input {
  flex: 1; min-width: 0; border: none; outline: none; background: transparent;
  font-family: inherit; font-size: 17px; font-weight: 500; color: var(--nu-ink);
  padding: 14px 0;
}
.glx__search-input::placeholder { color: var(--nu-gray); font-weight: 500; }
.glx__search-input::-webkit-search-cancel-button { display: none; }
.glx__search-clear {
  width: 40px; height: 40px; flex-shrink: 0; border: none; cursor: pointer;
  background: var(--nu-cream-2); border-radius: 50%; color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.glx__search-clear:hover { background: var(--nu-line); }

/* nav A-Z sticky */
.glx__az {
  /* gruda embaixo do topo E da régua do mercado (39px; 29px no celular), como a barra dos guias */
  position: sticky; top: calc(var(--nuh-h, 76px) + 39px); z-index: 20;
  background: color-mix(in srgb, var(--nu-page) 92%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1.5px solid var(--nu-line-2); border-bottom: 1.5px solid var(--nu-line-2);
  transition: top .28s ease;
}
/* uma linha só, na coluna: quando não cabe (tablet, celular) rola de lado */
.glx__az-inner {
  display: flex; flex-wrap: nowrap; gap: 4px; overflow-x: auto; scrollbar-width: none;
  padding: 8px var(--lado) 8px calc(var(--lado) - 11px);
}
.glx__az-inner::-webkit-scrollbar { display: none; }
.glx__az-item {
  flex: 0 0 auto; min-width: 38px; height: 38px; padding: 0 4px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700;
  border-radius: var(--nu-r-tag); transition: background .2s, color .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
  font-variant-numeric: tabular-nums;
}
.glx__az-item:active { transform: scale(.96); }
.glx__az-item:hover { background: var(--nu-ink); color: var(--nu-white); }
.glx__az-item--off { color: var(--nu-sand); pointer-events: none; cursor: default; }

.glx__body { padding: clamp(32px, 5vw, 56px) var(--lado) clamp(64px, 8vw, 110px); }
.glx__count {
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600;
  font-variant-numeric: tabular-nums; margin-bottom: 12px;
}
.glx__empty { color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; margin-top: 24px; }
.glx__empty-link { color: var(--nu-blue-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }

.glx__section { margin-top: clamp(36px, 4.5vw, 56px); scroll-margin-top: calc(var(--nuh-h, 76px) + 116px); }
.glx__section:first-of-type { margin-top: 8px; }
/* a letra: número-herói cobalto sobre um fio carvão de 3px */
.glx__letter {
  color: var(--nu-blue); font-size: clamp(46px, 5.2vw, 68px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1; margin-bottom: 20px;
  padding-bottom: 12px; border-bottom: 3px solid var(--nu-ink);
}
.glx__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: clamp(12px, 1.4vw, 18px);
}
.glx__card {
  position: relative; display: flex; flex-direction: column; gap: 8px;
  background: var(--nu-card); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-quente);
  padding: 22px 24px;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
  animation: nu-fade .4s ease both;
}
.glx__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-quente), var(--nu-shadow-card); }
.glx__card-term { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; padding-right: 28px; }
.glx__card-short {
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.glx__card-arrow {
  position: absolute; top: 22px; right: 20px; color: var(--nu-blue);
  opacity: 0; transform: translateX(-4px); transition: opacity .2s, transform .25s cubic-bezier(.2, .8, .2, 1);
}
.glx__card:hover .glx__card-arrow { opacity: 1; transform: none; }

@media (max-width: 760px) {
  .glx__grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .glx__az { top: calc(var(--nuh-h, 52px) + 29px); }
  /* no dedo: alvo de 44px, e a letra cortada na borda diz que tem mais */
  .glx__az-inner { gap: 2px; padding: 6px var(--lado) 6px calc(var(--lado) - 14px); }
  .glx__az-item { min-width: 44px; height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .glx__card, .glx__card-arrow, .glx__az-item { animation: none; transition: none; }
}
</style>
