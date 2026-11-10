<script setup lang="ts">
// "Tem algo para eu olhar?" (10/11/2026, a carteira "estilo Nubank"): os
// avisos do motor saem do modal escondido atrás do "+N" e viram cartões na
// página, logo abaixo do topo. Cada cartão diz o fato, o que está em jogo e
// abre o aviso inteiro (com a conta) no mesmo modal de sempre, pelo topo.
// Sem aviso, a seção some: o topo já diz "nada pede a sua atenção".
// O R$ segue o olho do topo (useValoresVisiveis), como o patrimônio.
import type { Aviso, AvisosVisao, GravidadeAviso } from '~/types/carteiraVisao'
import { semQuebraNoReal } from '~/utils/carteiraVisao'

const props = defineProps<{ avisos: AvisosVisao }>()
const emit = defineEmits<{ (e: 'abrir', id: string): void }>()
const { visiveis } = useValoresVisiveis()

const ROTULO: Record<GravidadeAviso, string> = { alta: 'Pede atenção', media: 'Vale olhar', info: 'Bom saber', bom: 'Boa notícia' }
const ORDEM: Record<GravidadeAviso, number> = { alta: 0, media: 1, bom: 2, info: 3 }
const itens = computed<Aviso[]>(() => [...props.avisos.itens].sort((a, b) => ORDEM[a.gravidade] - ORDEM[b.gravidade]))
const mascarar = (t: string) => (visiveis.value ? t : t.replace(/R\$\s?[\d.,]+(\s?mil)?/g, 'R$ ••••'))
const titulo = computed(() => {
  const n = itens.value.length
  const urgentes = itens.value.filter((a) => a.gravidade === 'alta' || a.gravidade === 'media').length
  if (urgentes) return urgentes === 1 ? 'Uma coisa pede o seu olhar.' : `${urgentes} coisas pedem o seu olhar.`
  return n === 1 ? 'Nada urgente, mas vale ler isto.' : `Nada urgente, mas vale ler estas ${n}.`
})
</script>

<template>
  <section v-if="itens.length" class="vpo" aria-labelledby="vpo-titulo" data-clarity-mask="true">
    <p class="vpo__eyebrow">Para olhar</p>
    <h2 id="vpo-titulo" class="vpo__titulo">{{ titulo }}</h2>
    <ul class="vpo__lista" :class="{ 'vpo__lista--um': itens.length === 1 }">
      <li v-for="a in itens" :key="a.id">
        <button type="button" class="vpo__card" :aria-label="`${ROTULO[a.gravidade]}: ${mascarar(a.titulo)} Ver a conta`" @click="emit('abrir', a.id)">
          <span class="vpo__topo">
            <span class="vpo__tipo" :class="`vpo__tipo--${a.gravidade}`"><i aria-hidden="true" />{{ ROTULO[a.gravidade] }}</span>
            <span v-if="a.emJogo" class="vpo__jogo">{{ mascarar(a.emJogo) }}</span>
          </span>
          <span class="vpo__t">{{ semQuebraNoReal(mascarar(a.titulo)) }}</span>
          <span class="vpo__x">{{ mascarar(a.texto) }}</span>
          <span class="vpo__ver">Ver a conta <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.vpo { padding: clamp(44px, 6vw, 72px) clamp(22px, 5.5vw, 80px) 0; background: var(--nu-white); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.vpo__eyebrow { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.vpo__titulo { margin: 10px 0 0; color: var(--nu-ink); font-size: clamp(26px, 3.2vw, 38px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
.vpo__lista { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 14px; margin: clamp(18px, 2.4vw, 26px) 0 0; padding: 0; }
.vpo__lista--um { grid-template-columns: minmax(0, 720px); }
.vpo__card {
  display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; padding: 20px 22px; border: 0; border-radius: var(--nu-r-panel);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; text-align: left; cursor: pointer; transition: background .2s, transform .2s;
}
.vpo__card:hover { background: var(--nu-cream-2); transform: translateY(-1px); }
.vpo__card:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.vpo__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.vpo__tipo { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.vpo__tipo i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-blue); }
.vpo__tipo--alta i { background: var(--nu-red); }
.vpo__tipo--media i { background: var(--nu-amber-fill); }
.vpo__tipo--bom i { background: var(--nu-green); }
.vpo__jogo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.vpo__t { font-size: var(--nu-fs-lg); font-weight: 700; line-height: 1.3; }
.vpo__x {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); line-height: 1.5; font-variant-numeric: tabular-nums;
}
.vpo__ver { display: inline-flex; align-items: center; gap: 4px; margin-top: auto; padding-top: 4px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 800; }
.vpo__card:hover .vpo__ver svg { transform: translateX(2px); }
.vpo__ver svg { transition: transform .2s; }
@media (prefers-reduced-motion: reduce) {
  .vpo__card, .vpo__ver svg { transition: none; }
}
</style>
