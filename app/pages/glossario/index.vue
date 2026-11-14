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

// "Perguntar à IA" abre o painel do chat aqui mesmo (11/11/2026): a pergunta
// mora no painel desde 02/11, e a /busca não é mais onde se conversa.
const painel = useChatPainel()

// ROBUSTEZ (11/11/2026): o A-Z mostra onde a leitura está. A letra da seção
// atual ganha o traço cobalto de 2px que DESLIZA de letra em letra (o mesmo do
// topo e do sumário, --nu-dur-lenta --nu-ease-troca); o clique rola suave até a
// letra e acende na hora (a âncora #letra-X fica). No celular a faixa rola de
// lado e traz a letra atual para a vista. Os cartões entram ao chegar (v-revelar).
const azEl = ref<HTMLElement | null>(null)
const azBarra = ref<HTMLElement | null>(null)
const letraAtual = ref<string | null>(null)
const azMarca = ref({ x: 0, w: 0 })
const azQuieto = ref(true)
let azFixo = false
useNuScrollFrame(() => {
  if (azFixo) return
  const linha = (azBarra.value?.getBoundingClientRect().bottom ?? 160) + 32
  let atual: string | null = null
  for (const sec of sections.value) {
    const el = document.getElementById(`letra-${sec.letter}`)
    if (el && el.getBoundingClientRect().top <= linha) atual = sec.letter
  }
  letraAtual.value = atual
})
const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function medirAz(): boolean {
  const l = letraAtual.value
  const el = l ? azEl.value?.querySelector<HTMLElement>(`[data-letra="${l}"]`) : null
  if (!el) return false
  // um traço curto, centrado na letra
  azMarca.value = { x: el.offsetLeft + (el.offsetWidth - 16) / 2, w: 16 }
  // no celular a faixa rola de lado: a letra atual vem para a vista
  const c = azEl.value!
  if (c.scrollWidth > c.clientWidth + 1 && (el.offsetLeft < c.scrollLeft + 24 || el.offsetLeft + el.offsetWidth > c.scrollLeft + c.clientWidth - 24)) {
    c.scrollTo({ left: Math.max(0, el.offsetLeft - (c.clientWidth - el.offsetWidth) / 2), behavior: reduzido() ? 'auto' : 'smooth' })
  }
  return true
}
watch(letraAtual, (agora, antes) => {
  // a primeira letra aparece no lugar, sem vir deslizando da ponta
  if (!antes) azQuieto.value = true
  medirAz()
  if (!antes) requestAnimationFrame(() => requestAnimationFrame(() => { azQuieto.value = false }))
})
function irParaLetra(l: string, ev: MouseEvent) {
  const alvo = document.getElementById(`letra-${l}`)
  if (!alvo || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return
  ev.preventDefault()
  letraAtual.value = l
  azFixo = true
  const solta = () => { azFixo = false }
  window.addEventListener('scrollend', solta, { once: true })
  setTimeout(solta, 1200)
  alvo.scrollIntoView({ behavior: reduzido() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#letra-${l}`)
  // pelo teclado, o foco vai junto (o Tab seguinte continua da letra, como na âncora)
  if (ev.detail === 0) {
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
    alvo.focus({ preventScroll: true })
  }
}
const estiloAzMarca = computed(() => ({ width: `${azMarca.value.w}px`, transform: `translateX(${azMarca.value.x}px)` }))
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
    <nav ref="azBarra" class="glx__az" aria-label="Índice alfabético">
      <div ref="azEl" class="glx__az-inner">
        <span class="glx__az-marca" :class="{ 'glx__az-marca--on': !!letraAtual, 'glx__az-marca--quieto': azQuieto }" :style="estiloAzMarca" aria-hidden="true" />
        <a
          v-for="l in ALPHABET"
          :key="l"
          :href="activeLetters.has(l) ? `#letra-${l}` : undefined"
          class="glx__az-item"
          :class="{ 'glx__az-item--off': !activeLetters.has(l), 'glx__az-item--atual': letraAtual === l }"
          :data-letra="l"
          :aria-disabled="!activeLetters.has(l)"
          :aria-current="letraAtual === l ? 'location' : undefined"
          @click="activeLetters.has(l) && irParaLetra(l, $event)"
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
        <button type="button" class="glx__empty-link" @click="painel.preencher(`O que é ${query}?`)">IA da Aportou</button>.
      </p>

      <section v-for="sec in sections" :id="`letra-${sec.letter}`" :key="sec.letter" class="glx__section">
        <div class="glx__letter">{{ sec.letter }}</div>
        <div v-revelar="{ alvo: 'filhos' }" class="glx__grid">
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
   1,5px e cartões creme com a sombra quente. Estrutura e conteúdo iguais.
   Robustez (11/11/2026): a linha de apoio a 20px do título e a busca a 40px
   dela; o A-Z gruda logo abaixo da régua (pela altura que ela publica) e marca
   a letra atual; a seta do cartão sempre à vista; tudo em token. */
/* --lado: a coluna do site (1240px centrada, margem fluida abaixo de 1400px) */
.glx { --lado: var(--nu-coluna); background: var(--nu-page); }

/* hero extras (a linha de apoio e a busca dentro do slot de ações do NuPageHero) */
.glx :deep(.nph__actions) { margin-top: 20px; }
.glx__hero-sub {
  margin: 0; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto);
  line-height: 1.45; max-width: 620px; text-wrap: pretty;
}
.glx__search {
  display: flex; align-items: center; gap: 12px; margin-top: 40px;
  max-width: 560px; min-height: 56px; background: var(--nu-white);
  border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-pill);
  padding: 0 8px 0 20px;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
.glx__search:hover { border-color: var(--nu-gray); }
.glx__search:focus-within { border-color: var(--nu-blue); box-shadow: 0 0 0 3px var(--nu-blue-tint); }
.glx__search-ic { color: var(--nu-gray); flex-shrink: 0; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.glx__search:focus-within .glx__search-ic { color: var(--nu-ink); }
.glx__search-input {
  flex: 1; min-width: 0; border: none; outline: none; background: transparent;
  font-family: inherit; font-size: 17px; font-weight: var(--nu-w-texto); color: var(--nu-ink);
  padding: 14px 0;
}
.glx__search-input::placeholder { color: var(--nu-gray); font-weight: var(--nu-w-texto); }
.glx__search-input::-webkit-search-cancel-button { display: none; }
.glx__search-clear {
  width: 40px; height: 40px; flex-shrink: 0; border: none; cursor: pointer;
  background: var(--nu-cream-2); border-radius: 50%; color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
  animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both;
}
.glx__search-clear:hover { background: var(--nu-line); }
.glx__search-clear:active { transform: scale(.92); }

/* nav A-Z: gruda embaixo do topo E da régua do mercado, como a barra dos guias */
.glx__az {
  position: sticky; top: calc(var(--nuh-h, 72px) + var(--nut-h, 40px) - 1px); z-index: 20;
  background: color-mix(in srgb, var(--nu-page) 92%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-line-2); border-bottom: 1px solid var(--nu-line-2);
  transition: top var(--nu-dur-topo) var(--nu-ease-saida);
}
/* uma linha só, na coluna: quando não cabe (tablet, celular) rola de lado */
.glx__az-inner {
  position: relative; display: flex; flex-wrap: nowrap; gap: 4px; overflow-x: auto; scrollbar-width: none;
  padding: 8px var(--lado) 8px calc(var(--lado) - 11px);
}
.glx__az-inner::-webkit-scrollbar { display: none; }
.glx__az-item {
  position: relative; z-index: 1; flex: 0 0 auto; min-width: 38px; height: 38px; padding: 0 4px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio);
  border-radius: var(--nu-r-tag); -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
  font-variant-numeric: tabular-nums;
}
.glx__az-item:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.glx__az-item:active { transform: scale(.94); }
.glx__az-item:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; }
.glx__az-item--atual { color: var(--nu-ink); }
.glx__az-item--off { color: var(--nu-sand); pointer-events: none; cursor: default; }
/* a letra atual: o traço cobalto que desliza */
.glx__az-marca {
  position: absolute; left: 0; bottom: 9px; height: 2px; border-radius: 2px; background: var(--nu-blue);
  opacity: 0; pointer-events: none; transform-origin: 0 50%;
  transition: transform var(--nu-dur-lenta) var(--nu-ease-troca), width var(--nu-dur-lenta) var(--nu-ease-troca), opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.glx__az-marca--on { opacity: 1; }
.glx__az-marca--quieto { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }

.glx__body { padding: clamp(32px, 5vw, 56px) var(--lado) clamp(72px, 8vw, 128px); }
.glx__count {
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto);
  font-variant-numeric: tabular-nums; margin-bottom: 12px;
}
.glx__empty { color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); margin-top: 24px; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.glx__empty-link {
  padding: 0; border: 0; background: none; font: inherit; cursor: pointer;
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio);
  text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-blue-soft);
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.glx__empty-link:hover { color: var(--nu-blue-hover); text-decoration-color: currentColor; }

.glx__section { margin-top: clamp(40px, 5vw, 64px); scroll-margin-top: calc(var(--nuh-h, 72px) + var(--nut-h, 40px) + 72px); }
.glx__section:first-of-type { margin-top: 8px; }
/* a letra: número-herói cobalto sobre um fio carvão de 3px */
.glx__letter {
  color: var(--nu-blue); font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1; margin-bottom: 24px;
  padding-bottom: 12px; border-bottom: 3px solid var(--nu-ink);
}
.glx__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: clamp(12px, 1.4vw, 18px);
}
.glx__card {
  position: relative; display: flex; flex-direction: column; gap: 8px;
  background: var(--nu-card); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-quente); -webkit-tap-highlight-color: transparent;
  padding: 22px 24px;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) { .glx__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); } }
.glx__card:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.glx__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.glx__card-term { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); padding-right: 28px; }
.glx__card-short {
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
/* a seta sempre à vista (o que é clicável parece clicável); sob o ponteiro fica cobalto e anda */
.glx__card-arrow {
  position: absolute; top: 24px; right: 20px; display: flex; color: var(--nu-sand);
  transition: color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.glx__card:hover .glx__card-arrow { color: var(--nu-blue); transform: translateX(3px); }

@media (max-width: 760px) {
  .glx__grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  /* no dedo: alvo de 44px, e a letra cortada na borda diz que tem mais */
  .glx__az-inner { gap: 2px; padding: 6px var(--lado) 6px calc(var(--lado) - 14px); }
  .glx__az-item { min-width: 44px; height: 44px; }
  .glx__az-marca { bottom: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .glx__card, .glx__card-arrow, .glx__az-item, .glx__az-marca, .glx__az { transition: none; }
  .glx__empty, .glx__search-clear { animation: none; }
}
</style>
